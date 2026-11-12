import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { hashToken, generateJti, calculateExpiration } from '../utils/crypto.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';
import { TokenExpiredError, InvalidTokenError } from '../utils/errors.js';

/**
 * ============================================================================
 * GestHor 2.0 — Servicio de Tokens JWT
 * Integrante 4: Firma y verificación de JWT (RS256 para access, HS256 para refresh)
 * ============================================================================
 */

/**
 * Emite un Access Token firmado con la clave privada RSA y algoritmo RS256.
 * Conserva el contenido funcional del token: sub, email, rol, type, jti, expiración, emisor y audiencia.
 *
 * @param {Object} user - Datos del usuario
 * @returns {{ token: string, jti: string, expiresAt: Date }}
 */
export function issueAccessToken(user) {
  const jti = generateJti();
  const payload = {
    sub: user.usuario_id ?? user.id,
    email: user.email,
    rol: user.nombre_rol ?? user.rol,
    type: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE,
    jti,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, jwtConfig.accessPrivateKey, {
    algorithm: 'RS256',
    expiresIn: jwtConfig.accessExpiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  return {
    token,
    jti,
    expiresAt: calculateExpiration(jwtConfig.accessExpiresIn),
  };
}

/**
 * Emite un Refresh Token firmado con JWT_REFRESH_SECRET y algoritmo explícito HS256.
 *
 * @param {Object} user - Datos del usuario
 * @returns {{ token: string, jti: string, expiresAt: Date }}
 */
export function issueRefreshToken(user) {
  const jti = generateJti();
  const payload = {
    sub: user.usuario_id ?? user.id,
    type: AUTH_CONSTANTS.JWT.REFRESH_TOKEN_TYPE,
    jti,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, jwtConfig.refreshSecret, {
    algorithm: 'HS256',
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  return {
    token,
    jti,
    expiresAt: calculateExpiration(jwtConfig.refreshExpiresIn),
  };
}

/**
 * Verifica un Access Token con la clave pública RSA y acepta ÚNICAMENTE 'RS256'.
 * Previene confusión de tipo de token (evita que un refresh token se use como access token).
 *
 * @param {string} token - Token JWT
 * @returns {Object} Payload decodificado
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessPublicKey, {
      algorithms: ['RS256'],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    if (!isAccessToken(decoded)) {
      throw new InvalidTokenError('El token no es un access token válido');
    }

    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError || error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Access token expirado');
    }
    if (error instanceof InvalidTokenError) {
      throw error;
    }
    throw new InvalidTokenError('Access token inválido');
  }
}

/**
 * Verifica un Refresh Token con JWT_REFRESH_SECRET y acepta ÚNICAMENTE 'HS256'.
 * Previene confusión de tipo de token (evita que un access token se use como refresh token).
 *
 * @param {string} token - Token JWT
 * @returns {Object} Payload decodificado
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret, {
      algorithms: ['HS256'],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    if (!isRefreshToken(decoded)) {
      throw new InvalidTokenError('El token no es un refresh token válido');
    }

    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError || error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Refresh token expirado');
    }
    if (error instanceof InvalidTokenError) {
      throw error;
    }
    throw new InvalidTokenError('Refresh token inválido');
  }
}

/**
 * Genera hash SHA-256 de un token para almacenamiento seguro
 */
export function hashTokenForStorage(token) {
  return hashToken(token);
}

/**
 * Decodifica un token sin verificar su firma
 */
export function decodeTokenWithoutVerify(token) {
  return jwt.decode(token);
}

/**
 * Extrae el identificador jti de un token sin verificar su firma
 */
export function extractJtiFromToken(token) {
  const decoded = jwt.decode(token);
  return decoded?.jti || null;
}

/**
 * Determina si el payload corresponde a un Access Token
 */
export function isAccessToken(payload) {
  return payload?.type === AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE;
}

/**
 * Determina si el payload corresponde a un Refresh Token
 */
export function isRefreshToken(payload) {
  return payload?.type === AUTH_CONSTANTS.JWT.REFRESH_TOKEN_TYPE;
}
