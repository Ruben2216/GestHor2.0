import * as userRepository from '../repositories/userRepository.js';
import * as passwordResetRepository from '../repositories/passwordResetRepository.js';
import * as refreshTokenRepository from '../repositories/refreshTokenRepository.js';
import { hashPassword, generateRandomToken, hashToken, calculateExpiration } from '../utils/crypto.js';
import { sendError } from '../utils/response.js';
import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from '../constants/auth.constants.js';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors.js';
import { enviarCorreoRecuperacion } from './emailService.js';

const RESET_TOKEN_EXPIRES_HOURS = AUTH_CONSTANTS.RESET_TOKEN.EXPIRES_IN_HOURS;

export async function requestPasswordReset(email) {
  const user = await userRepository.findByEmail(email);
  
  if (!user) {
    return { success: true, message: AUTH_CONSTANTS.RESPONSE_MESSAGES.RESET_EMAIL_SENT };
  }

  const rawToken = generateRandomToken(AUTH_CONSTANTS.RESET_TOKEN.TOKEN_BYTES);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

  await passwordResetRepository.revokeUserTokens(user.usuario_id);
  await passwordResetRepository.saveResetToken({
    userId: user.usuario_id,
    tokenHash,
    expiresAt,
  });

  try {
    await enviarCorreoRecuperacion({
      email: user.email,
      nombreCompleto: user.nombre || user.email,
      nuevoToken: rawToken,
    });
  } catch (error) {
    console.error('Error enviando correo de recuperación:', error);
  }

  return { success: true, message: RESPONSE_MESSAGES.RESET_EMAIL_SENT, token: process.env.NODE_ENV !== 'production' ? rawToken : undefined };
}

export async function resetPassword(token, newPassword) {
  const tokenHash = hashToken(token);
  const resetToken = await passwordResetRepository.findValidTokenByHash(tokenHash);

  if (!resetToken) {
    throw new UnauthorizedError('Token de recuperación inválido o expirado', AUTH_CONSTANTS.ERROR_CODES.RESET_TOKEN_INVALID);
  }

  if (resetToken.used_at) {
    throw new UnauthorizedError('Token ya utilizado', AUTH_CONSTANTS.ERROR_CODES.RESET_TOKEN_USED);
  }

  if (new Date() > new Date(resetToken.expires_at)) {
    throw new UnauthorizedError('Token expirado', AUTH_CONSTANTS.ERROR_CODES.RESET_TOKEN_EXPIRED);
  }

  const hashedPassword = await hashPassword(newPassword);
  await userRepository.updatePasswordHash(resetToken.usuario_id, hashedPassword);
  await passwordResetRepository.markUsed(resetToken.reset_token_id);
  await refreshTokenRepository.revokeAllUserTokens(resetToken.usuario_id);

  return { success: true, message: RESPONSE_MESSAGES.PASSWORD_RESET };
}

export async function validateResetToken(token) {
  const tokenHash = hashToken(token);
  const resetToken = await passwordResetRepository.findValidTokenByHash(tokenHash);
  
  if (!resetToken) {
    return { valid: false, reason: 'invalid_or_expired' };
  }

  if (resetToken.used_at) {
    return { valid: false, reason: 'already_used' };
  }

  if (new Date() > new Date(resetToken.expires_at)) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, userId: resetToken.usuario_id };
}