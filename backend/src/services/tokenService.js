import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { hashToken, generateJti, calculateExpiration } from '../utils/crypto.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';
import { TokenExpiredError, InvalidTokenError } from '../utils/errors.js';

export function issueAccessToken(user) {
  const jti = generateJti();
  const payload = {
    sub: user.usuario_id,
    email: user.email,
    rol: user.nombre_rol,
    type: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE,
    jti,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  return { token, jti, expiresAt: calculateExpiration(jwtConfig.accessExpiresIn) };
}

export function issueRefreshToken(user) {
  const jti = generateJti();
  const payload = {
    sub: user.usuario_id,
    type: AUTH_CONSTANTS.JWT.REFRESH_TOKEN_TYPE,
    jti,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  return { token, jti, expiresAt: calculateExpiration(jwtConfig.refreshExpiresIn) };
}

export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Access token expirado');
    }
    throw new InvalidTokenError('Access token inválido');
  }
}

export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Refresh token expirado');
    }
    throw new InvalidTokenError('Refresh token inválido');
  }
}

export function hashTokenForStorage(token) {
  return hashToken(token);
}

export function decodeTokenWithoutVerify(token) {
  return jwt.decode(token);
}

export function extractJtiFromToken(token) {
  const decoded = jwt.decode(token);
  return decoded?.jti || null;
}

export function isAccessToken(payload) {
  return payload?.type === AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE;
}

export function isRefreshToken(payload) {
  return payload?.type === AUTH_CONSTANTS.JWT.REFRESH_TOKEN_TYPE;
}