import jwt from 'jsonwebtoken';
import { generateKeyPairSync } from 'node:crypto';
import * as tokenService from '../src/services/tokenService.js';
import { jwtConfig } from '../src/config/jwt.js';
import { AUTH_CONSTANTS } from '../src/constants/auth.constants.js';
import { TokenExpiredError, InvalidTokenError } from '../src/utils/errors.js';

/**
 * ============================================================================
 * GestHor 2.0 — Pruebas Unitarias de Tokens (Integrante 4)
 * Firma y verificación de JWT (RS256 para access tokens, HS256 para refresh tokens)
 * ============================================================================
 */

describe('Integrante 4: tokenService - Firma y verificación de JWT (RS256 / HS256)', () => {
  const mockUser = {
    usuario_id: 101,
    email: 'docente.test@unach.mx',
    nombre_rol: 'profesor',
  };

  // Par de claves RSA alternativo para pruebas de firma con clave no autorizada
  const unauthorizedKeyPair = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  describe('1. Emisión de Access Token (RS256)', () => {
    it('emite un access token con encabezado alg: RS256 y typ: JWT', () => {
      const { token } = tokenService.issueAccessToken(mockUser);
      expect(typeof token).toBe('string');

      const decodedComplete = jwt.decode(token, { complete: true });
      expect(decodedComplete).toBeDefined();
      expect(decodedComplete.header.alg).toBe('RS256');
      expect(decodedComplete.header.typ).toBe('JWT');
    });

    it('devuelve token, jti válido y objeto expiresAt', () => {
      const result = tokenService.issueAccessToken(mockUser);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('jti');
      expect(result).toHaveProperty('expiresAt');
      expect(typeof result.jti).toBe('string');
      expect(result.jti.length).toBeGreaterThan(10);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('2. Verificación de Access Token con Clave Pública RSA', () => {
    it('verifica exitosamente la firma con la clave pública RSA configurada', () => {
      const { token } = tokenService.issueAccessToken(mockUser);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser.usuario_id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.rol).toBe(mockUser.nombre_rol);
      expect(decoded.type).toBe(AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE);
    });

    it('verifica directamente usando jsonwebtoken con algorithms: ["RS256"] y la clave pública', () => {
      const { token } = tokenService.issueAccessToken(mockUser);
      const decoded = jwt.verify(token, jwtConfig.accessPublicKey, {
        algorithms: ['RS256'],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      expect(decoded.sub).toBe(mockUser.usuario_id);
      expect(decoded.iss).toBe(jwtConfig.issuer);
      expect(decoded.aud).toBe(jwtConfig.audience);
    });
  });

  describe('3. Conservación de Contenido Funcional (Claims) y Expiración', () => {
    it('conserva todos los claims requeridos: sub, email, rol, type, jti, iat, exp, iss, aud', () => {
      const { token, jti } = tokenService.issueAccessToken(mockUser);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.sub).toBe(mockUser.usuario_id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.rol).toBe(mockUser.nombre_rol);
      expect(decoded.type).toBe('access');
      expect(decoded.jti).toBe(jti);
      expect(decoded.iss).toBe(jwtConfig.issuer);
      expect(decoded.aud).toBe(jwtConfig.audience);
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('soporta estructura de usuario con id y rol alternativos (user.id / user.rol)', () => {
      const altUser = { id: 202, email: 'admin@unach.mx', rol: 'administrador' };
      const { token } = tokenService.issueAccessToken(altUser);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.sub).toBe(202);
      expect(decoded.rol).toBe('administrador');
      expect(decoded.email).toBe('admin@unach.mx');
    });
  });

  describe('4. Rechazo de Access Token Alterado, Expirado, Firmado con Otra Clave o Declarado HS256', () => {
    it('rechaza un token con la firma alterada con InvalidTokenError', () => {
      const { token } = tokenService.issueAccessToken(mockUser);
      const parts = token.split('.');
      const tamperedSignature = parts[2].slice(0, -5) + 'AAAAA';
      const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedSignature}`;

      expect(() => tokenService.verifyAccessToken(tamperedToken)).toThrow(InvalidTokenError);
    });

    it('rechaza un token con el payload alterado con InvalidTokenError', () => {
      const { token } = tokenService.issueAccessToken(mockUser);
      const parts = token.split('.');
      // Alterar payload decodificado y re-codificarlo sin firmar
      const payloadObj = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      payloadObj.rol = 'administrador'; // Escalación ilegítima
      const tamperedPayload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      expect(() => tokenService.verifyAccessToken(tamperedToken)).toThrow(InvalidTokenError);
    });

    it('rechaza un token expirado con TokenExpiredError', () => {
      const expiredPayload = {
        sub: mockUser.usuario_id,
        email: mockUser.email,
        rol: mockUser.nombre_rol,
        type: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE,
        jti: 'test-expired-jti',
      };

      const expiredToken = jwt.sign(expiredPayload, jwtConfig.accessPrivateKey, {
        algorithm: 'RS256',
        expiresIn: '-5s',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      expect(() => tokenService.verifyAccessToken(expiredToken)).toThrow(TokenExpiredError);
    });

    it('rechaza un token firmado con otra clave privada RSA con InvalidTokenError', () => {
      const payload = {
        sub: mockUser.usuario_id,
        email: mockUser.email,
        rol: mockUser.nombre_rol,
        type: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE,
        jti: 'unauthorized-key-jti',
      };

      const unauthorizedToken = jwt.sign(payload, unauthorizedKeyPair.privateKey, {
        algorithm: 'RS256',
        expiresIn: '15m',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      expect(() => tokenService.verifyAccessToken(unauthorizedToken)).toThrow(InvalidTokenError);
    });

    it('rechaza un token declarado con algoritmo HS256 (prevención de confusión de algoritmo)', () => {
      const payload = {
        sub: mockUser.usuario_id,
        email: mockUser.email,
        rol: mockUser.nombre_rol,
        type: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE,
        jti: 'alg-confusion-jti',
      };

      // Ataque de confusión de algoritmo: firmar con HS256 usando la clave pública como secreto HMAC
      const hs256Token = jwt.sign(payload, jwtConfig.accessPublicKey, {
        algorithm: 'HS256',
        expiresIn: '15m',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      expect(() => tokenService.verifyAccessToken(hs256Token)).toThrow(InvalidTokenError);
    });

    it('rechaza tokens completamente malformados o no JWT con InvalidTokenError', () => {
      expect(() => tokenService.verifyAccessToken('not.a.valid.jwt.token')).toThrow(InvalidTokenError);
      expect(() => tokenService.verifyAccessToken('')).toThrow(InvalidTokenError);
      expect(() => tokenService.verifyAccessToken(null)).toThrow(InvalidTokenError);
    });
  });

  describe('5. Emisión y Verificación de Refresh Token (HS256)', () => {
    it('emite un refresh token con encabezado alg: HS256', () => {
      const { token } = tokenService.issueRefreshToken(mockUser);
      expect(typeof token).toBe('string');

      const decodedComplete = jwt.decode(token, { complete: true });
      expect(decodedComplete.header.alg).toBe('HS256');
      expect(decodedComplete.header.typ).toBe('JWT');
    });

    it('verifica exitosamente el refresh token con el secreto HS256', () => {
      const { token, jti } = tokenService.issueRefreshToken(mockUser);
      const decoded = tokenService.verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser.usuario_id);
      expect(decoded.type).toBe(AUTH_CONSTANTS.JWT.REFRESH_TOKEN_TYPE);
      expect(decoded.jti).toBe(jti);
      expect(decoded.iss).toBe(jwtConfig.issuer);
      expect(decoded.aud).toBe(jwtConfig.audience);
    });

    it('rechaza refresh token alterado con InvalidTokenError', () => {
      const { token } = tokenService.issueRefreshToken(mockUser);
      const parts = token.split('.');
      const tampered = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -4)}zzzz`;

      expect(() => tokenService.verifyRefreshToken(tampered)).toThrow(InvalidTokenError);
    });

    it('rechaza refresh token expirado con TokenExpiredError', () => {
      const expiredRefreshPayload = {
        sub: mockUser.usuario_id,
        type: AUTH_CONSTANTS.JWT.REFRESH_TOKEN_TYPE,
        jti: 'expired-refresh-jti',
      };

      const expiredRefreshToken = jwt.sign(expiredRefreshPayload, jwtConfig.refreshSecret, {
        algorithm: 'HS256',
        expiresIn: '-10s',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      expect(() => tokenService.verifyRefreshToken(expiredRefreshToken)).toThrow(TokenExpiredError);
    });
  });

  describe('6. Aislamiento Estricto de Tipos (Evitar Refresh como Access y viceversa)', () => {
    it('rechaza un refresh token cuando se intenta verificar como access token', () => {
      const { token: refreshToken } = tokenService.issueRefreshToken(mockUser);
      expect(() => tokenService.verifyAccessToken(refreshToken)).toThrow(InvalidTokenError);
    });

    it('rechaza un access token cuando se intenta verificar como refresh token', () => {
      const { token: accessToken } = tokenService.issueAccessToken(mockUser);
      expect(() => tokenService.verifyRefreshToken(accessToken)).toThrow(InvalidTokenError);
    });

    it('rechaza un token firmado con RS256 si su payload declara type: "refresh"', () => {
      const fakePayload = {
        sub: mockUser.usuario_id,
        type: AUTH_CONSTANTS.JWT.REFRESH_TOKEN_TYPE,
        jti: 'fake-refresh-on-rsa',
      };

      const token = jwt.sign(fakePayload, jwtConfig.accessPrivateKey, {
        algorithm: 'RS256',
        expiresIn: '15m',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      expect(() => tokenService.verifyAccessToken(token)).toThrow(InvalidTokenError);
    });

    it('rechaza un token firmado con HS256 si su payload declara type: "access"', () => {
      const fakePayload = {
        sub: mockUser.usuario_id,
        type: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_TYPE,
        jti: 'fake-access-on-hs',
      };

      const token = jwt.sign(fakePayload, jwtConfig.refreshSecret, {
        algorithm: 'HS256',
        expiresIn: '7d',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      expect(() => tokenService.verifyRefreshToken(token)).toThrow(InvalidTokenError);
    });
  });

  describe('7. Funciones Auxiliares de Tokens', () => {
    it('isAccessToken e isRefreshToken discriminan según el claim type', () => {
      expect(tokenService.isAccessToken({ type: 'access' })).toBe(true);
      expect(tokenService.isAccessToken({ type: 'refresh' })).toBe(false);
      expect(tokenService.isAccessToken(null)).toBe(false);

      expect(tokenService.isRefreshToken({ type: 'refresh' })).toBe(true);
      expect(tokenService.isRefreshToken({ type: 'access' })).toBe(false);
      expect(tokenService.isRefreshToken({})).toBe(false);
    });

    it('extractJtiFromToken extrae el jti sin verificar firma', () => {
      const { token, jti } = tokenService.issueAccessToken(mockUser);
      const extracted = tokenService.extractJtiFromToken(token);
      expect(extracted).toBe(jti);
    });

    it('decodeTokenWithoutVerify decodifica el payload', () => {
      const { token } = tokenService.issueAccessToken(mockUser);
      const decoded = tokenService.decodeTokenWithoutVerify(token);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('hashTokenForStorage genera hash SHA-256 consistente', () => {
      const { token } = tokenService.issueAccessToken(mockUser);
      const hash1 = tokenService.hashTokenForStorage(token);
      const hash2 = tokenService.hashTokenForStorage(token);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBe(64); // SHA-256 hex
      expect(hash1).toBe(hash2);
    });
  });
});

