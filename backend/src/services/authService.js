import * as userService from './userService.js';
import * as tokenService from './tokenService.js';
import * as refreshTokenRepository from '../repositories/refreshTokenRepository.js';
import * as sessionService from './sessionService.js';
import * as passwordService from './passwordService.js';
import { hashToken, hashPassword, comparePassword } from '../utils/crypto.js';
import { UnauthorizedError, ValidationError, TokenReusedError, NotFoundError } from '../utils/errors.js';
import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from '../constants/auth.constants.js';

// Hash de una contraseña aleatoria: se compara contra él cuando el correo no existe,
// para que la respuesta tarde lo mismo y no se pueda saber qué correos están registrados
const HASH_FICTICIO = '$2b$12$1se3P7gANhL/i7jkod1IZOpfv3yvxJ7pAZe0QYF.xY3phbZaSZUpO';

export async function login(email, password, ipOrigen, userAgent) {
  let user = null;
  try {
    user = await userService.findByEmail(email);
  } catch (error) {
    if (!(error instanceof NotFoundError)) throw error;
  }

  const passwordCorrecta = await comparePassword(password, user?.password_hash || HASH_FICTICIO);

  // Mismo mensaje si el correo no existe o si la contraseña es incorrecta
  if (!user?.password_hash || !passwordCorrecta) {
    throw new UnauthorizedError(RESPONSE_MESSAGES.INVALID_CREDENTIALS, AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS);
  }

  return createUserSession(user, ipOrigen, userAgent);
}

export async function socialLogin(email, ipOrigen, userAgent) {
  const user = await userService.findByEmail(email);
  return createUserSession(user, ipOrigen, userAgent);
}

async function createUserSession(user, ipOrigen, userAgent) {
  const accessTokenData = tokenService.issueAccessToken(user);
  const refreshTokenData = tokenService.issueRefreshToken(user);

  const refreshTokenHash = hashToken(refreshTokenData.token);
  await refreshTokenRepository.saveRefreshToken({
    userId: user.usuario_id,
    tokenHash: refreshTokenHash,
    jti: refreshTokenData.jti,
    expiresAt: refreshTokenData.expiresAt,
    userAgent,
    ipOrigen,
  });

  await sessionService.createSessionRecord({
    userId: user.usuario_id,
    accessJti: accessTokenData.jti,
    refreshJti: refreshTokenData.jti,
    ipOrigen,
    userAgent,
  });

  await userService.updateLastLogin(user.usuario_id);

  return {
    accessToken: accessTokenData.token,
    refreshToken: refreshTokenData.token,
    usuario: {
      id: user.usuario_id,
      email: user.email,
      rol: user.nombre_rol,
      nombre: user.nombre,
    },
  };
}

export async function refreshSession(refreshToken, ipOrigen, userAgent) {
  const decoded = tokenService.verifyRefreshToken(refreshToken);
  const jti = decoded.jti;

  const storedToken = await refreshTokenRepository.findValidByJti(jti);

  if (!storedToken) {
    const reusedToken = await refreshTokenRepository.findByJti(jti);
    if (reusedToken && reusedToken.revoked_at) {
      await refreshTokenRepository.revokeAllUserTokens(reusedToken.usuario_id);
      throw new TokenReusedError('Token reutilizado detectado - sesión invalidada por seguridad');
    }
    throw new UnauthorizedError('Refresh token inválido o revocado', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN);
  }

  const tokenMatch = await compareRefreshToken(refreshToken, storedToken.token_hash);
  if (!tokenMatch) {
    throw new UnauthorizedError('Refresh token inválido', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN);
  }

  if (storedToken.replaced_by_token_id) {
    await refreshTokenRepository.revokeAllUserTokens(storedToken.usuario_id);
    throw new TokenReusedError('Token reutilizado detectado - sesión invalidada por seguridad');
  }

  await refreshTokenRepository.revokeByJti(jti);

  const user = await userService.getUserById(storedToken.usuario_id);

  const newAccessTokenData = tokenService.issueAccessToken(user);
  const newRefreshTokenData = tokenService.issueRefreshToken(user);

  const newRefreshTokenHash = hashToken(newRefreshTokenData.token);
  await refreshTokenRepository.saveRefreshToken({
    userId: user.usuario_id,
    tokenHash: newRefreshTokenHash,
    jti: newRefreshTokenData.jti,
    expiresAt: newRefreshTokenData.expiresAt,
    userAgent,
    ipOrigen,
  });

  await refreshTokenRepository.markReplaced(jti, newRefreshTokenData.jti);

  await sessionService.createSessionRecord({
    userId: user.usuario_id,
    accessJti: newAccessTokenData.jti,
    refreshJti: newRefreshTokenData.jti,
    ipOrigen,
    userAgent,
  });

  return {
    accessToken: newAccessTokenData.token,
    refreshToken: newRefreshTokenData.token,
    usuario: {
      id: user.usuario_id,
      email: user.email,
      rol: user.nombre_rol,
      nombre: user.nombre,
    },
  };
}

async function compareRefreshToken(token, storedHash) {
  return hashToken(token) === storedHash;
}

export async function logout(userId, refreshToken, ipOrigen, userAgent) {
  if (refreshToken) {
    try {
      const decoded = tokenService.verifyRefreshToken(refreshToken);
      await refreshTokenRepository.revokeByJti(decoded.jti);
      await sessionService.revokeSession(userId, decoded.jti);
    } catch (error) {
      console.warn('Error revocando refresh token en logout:', error.message);
    }
  }

  return { success: true, message: RESPONSE_MESSAGES.LOGOUT_SUCCESS };
}

export async function changePassword(userId, currentPassword, newPassword) {
  await userService.changePassword(userId, currentPassword, newPassword);
  await refreshTokenRepository.revokeAllUserTokens(userId);
  await sessionService.revokeAllSessions(userId);

  return { success: true, message: RESPONSE_MESSAGES.PASSWORD_CHANGED };
}

export async function requestPasswordReset(email) {
  return passwordService.requestPasswordReset(email);
}

export async function resetPassword(token, newPassword) {
  return passwordService.resetPassword(token, newPassword);
}

export async function getMe(userId) {
  const user = await userService.getUserById(userId);
  const permissions = await userService.getUserPermissions(userId);

  return {
    usuario: {
      id: user.usuario_id,
      email: user.email,
      rol: user.nombre_rol,
      nombre: user.nombre,
    },
    permisos: permissions.map(p => p.clave),
  };
}