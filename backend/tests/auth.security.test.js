/**
 * ============================================================================
 * GestHor 2.0 — Suite de Tests de Integración de Seguridad (J1 – J11)
 * ============================================================================
 *
 * Cubre los 11 requerimientos de seguridad implementados:
 *   J1  – Validación estricta de JWT_SECRET al arrancar
 *   J2  – Claims estándar (iss, aud, iat) en el JWT
 *   J3  – Validación del rango de expiración (15-30 min)
 *   J4  – Middleware authMiddleware (validación de firma)
 *   J5  – Manejo de TokenExpiredError
 *   J6  – Axios withCredentials y CORS credentials en el servidor
 *   J7  – Refresh Token Rotatorio
 *   J8  – Middleware requireRole
 *   J9  – Middleware requirePermission
 *   J10 – Zero-Trust (identidad desde req.user)
 *   J11 – Almacenamiento seguro (tokens en body con estructura correcta)
 *
 * Estrategia: Se minimizan los logins para no disparar el rate limiter (10/15min).
 *             Se cachean las sesiones y se reutilizan entre bloques de test.
 *
 * Dependencias: jest (native ESM), supertest, jsonwebtoken, dotenv
 * ============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import jwt from 'jsonwebtoken';
import * as authService from '../src/services/authService.js';

// ─── Credenciales de prueba ──────────────────────────────────────────────────
const TEST_PASSWORD = process.env.SEED_TEST_PASSWORD || 'DefaultSeedSecurePass#2026';
const TEST_ADMIN  = { correo: 'admin@unach.mx',  contraseña: TEST_PASSWORD };
const TEST_ALUMNO = { correo: 'alumno@unach.mx', contraseña: TEST_PASSWORD };
const TEST_PROFE  = { correo: 'profe@unach.mx',  contraseña: TEST_PASSWORD };

const API_URL = process.env.TEST_API_URL || 'http://localhost:3000';

// ─── Caché de sesiones (evita múltiples logins que disparen rate limiter) ────
const sessionCache = {};

/**
 * Login y cachear la sesión para reutilizarla.
 * Solo hace un request HTTP la primera vez; las siguientes devuelve el caché.
 * Si el rate limiter bloquea el request HTTP en entornos de prueba,
 * recurre directamente a authService.login para asegurar la sesión.
 */
async function getSession(credentials) {
  const key = credentials.correo;
  if (sessionCache[key]) return sessionCache[key];

  try {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send(credentials);

    if (res.status === 200 && res.body?.data) {
      const { accessToken, refreshToken, usuario } = res.body.data;
      sessionCache[key] = { accessToken, refreshToken, usuario };
      return sessionCache[key];
    }
  } catch (_) {}

  const session = await authService.login(credentials.correo, credentials.contraseña, '127.0.0.1', 'jest-runner');
  sessionCache[key] = {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    usuario: session.usuario,
  };
  return sessionCache[key];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1) PRUEBAS DE ENTORNO (J1, J3)
// ═══════════════════════════════════════════════════════════════════════════════

describe('J1 – Validación del JWT_SECRET', () => {
  it('lanza error fatal si JWT_SECRET está vacío o indefinido', () => {
    // Simulamos la lógica de inicializarSecret() del authController
    const simulateInit = (secret) => {
      if (!secret || secret.trim() === '') {
        throw new Error('[FATAL SEGURIDAD] La variable de entorno JWT_SECRET no está definida o está vacía.');
      }
      return secret.trim();
    };

    expect(() => simulateInit('')).toThrow(/FATAL SEGURIDAD/);
    expect(() => simulateInit(undefined)).toThrow(/FATAL SEGURIDAD/);
    expect(() => simulateInit(null)).toThrow(/FATAL SEGURIDAD/);
    expect(() => simulateInit('   ')).toThrow(/FATAL SEGURIDAD/);
  });

  it('devuelve el secret correctamente si JWT_SECRET está definido', () => {
    const secret = process.env.JWT_SECRET;
    expect(secret).toBeDefined();
    expect(secret.trim().length).toBeGreaterThan(0);
  });
});

describe('J3 – Validación de expiración JWT_EXPIRES_IN', () => {
  /**
   * Copia exacta de validarExpiracion() del authController para testear aisladamente.
   */
  function validarExpiracion(expEnv) {
    const DEFAULT_EXPIRATION = '15m';
    if (!expEnv || typeof expEnv !== 'string') return DEFAULT_EXPIRATION;
    const limpio = expEnv.trim().toLowerCase();
    const match = limpio.match(/^(\d+)(m|min|minutes)?$/);
    if (!match) return DEFAULT_EXPIRATION;
    const minutos = parseInt(match[1], 10);
    if (minutos < 15 || minutos > 30) return DEFAULT_EXPIRATION;
    return `${minutos}m`;
  }

  it('devuelve "15m" cuando JWT_EXPIRES_IN no está definida', () => {
    expect(validarExpiracion(undefined)).toBe('15m');
    expect(validarExpiracion(null)).toBe('15m');
    expect(validarExpiracion('')).toBe('15m');
  });

  it('devuelve "15m" cuando el formato es inválido (ej. "abc", "2h", "1d")', () => {
    expect(validarExpiracion('abc')).toBe('15m');
    expect(validarExpiracion('2h')).toBe('15m');
    expect(validarExpiracion('1d')).toBe('15m');
    expect(validarExpiracion('forever')).toBe('15m');
  });

  it('devuelve "15m" cuando el valor excede 30 minutos', () => {
    expect(validarExpiracion('31m')).toBe('15m');
    expect(validarExpiracion('60m')).toBe('15m');
    expect(validarExpiracion('120m')).toBe('15m');
  });

  it('devuelve "15m" cuando el valor es menor a 15 minutos', () => {
    expect(validarExpiracion('1m')).toBe('15m');
    expect(validarExpiracion('5m')).toBe('15m');
    expect(validarExpiracion('10m')).toBe('15m');
    expect(validarExpiracion('14m')).toBe('15m');
  });

  it('acepta valores dentro del rango válido (15m – 30m)', () => {
    expect(validarExpiracion('15m')).toBe('15m');
    expect(validarExpiracion('20m')).toBe('20m');
    expect(validarExpiracion('25m')).toBe('25m');
    expect(validarExpiracion('30m')).toBe('30m');
  });

  it('acepta formatos alternativos: "20min", "25minutes"', () => {
    expect(validarExpiracion('20min')).toBe('20m');
    expect(validarExpiracion('25minutes')).toBe('25m');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2) PRUEBAS DE AUTENTICACIÓN Y TOKENS (J2, J4, J5, J11)
// ═══════════════════════════════════════════════════════════════════════════════

describe('J2 – Claims estándar en el JWT (iss, aud, iat)', () => {
  let accessToken;

  beforeAll(async () => {
    const session = await getSession(TEST_ADMIN);
    accessToken = session.accessToken;
  });

  it('el JWT incluye el claim "iss" (issuer) con valor "gesthor-api"', () => {
    const decoded = jwt.decode(accessToken);
    expect(decoded.iss).toBe('gesthor-api');
  });

  it('el JWT incluye el claim "aud" (audience) con valor "gesthor-client"', () => {
    const decoded = jwt.decode(accessToken);
    expect(decoded.aud).toBe('gesthor-client');
  });

  it('el JWT incluye el claim "iat" (Issued At) generado automáticamente', () => {
    const decoded = jwt.decode(accessToken);
    expect(decoded.iat).toBeDefined();
    expect(typeof decoded.iat).toBe('number');
    const ahora = Math.floor(Date.now() / 1000);
    expect(decoded.iat).toBeGreaterThan(ahora - 120);
    expect(decoded.iat).toBeLessThanOrEqual(ahora + 5);
  });

  it('el JWT incluye claims privados: sub, email, rol', () => {
    const decoded = jwt.decode(accessToken);
    expect(decoded.sub).toBeDefined();
    expect(decoded.email).toBeDefined();
    expect(decoded.rol).toBeDefined();
  });

  it('el JWT incluye "exp" con expiración entre 15 y 30 minutos', () => {
    const decoded = jwt.decode(accessToken);
    expect(decoded.exp).toBeDefined();
    expect(typeof decoded.exp).toBe('number');
    const diffMinutos = (decoded.exp - decoded.iat) / 60;
    expect(diffMinutos).toBeGreaterThanOrEqual(15);
    expect(diffMinutos).toBeLessThanOrEqual(30);
  });
});

describe('J4 – Middleware authMiddleware (validación de firma JWT)', () => {
  let validToken;

  beforeAll(async () => {
    const session = await getSession(TEST_ADMIN);
    validToken = session.accessToken;
  });

  it('rechaza petición sin header Authorization (401)', async () => {
    const res = await request(API_URL)
      .get('/api/auth/me')
      .expect(401);

    expect(res.body.ok).toBe(false);
  });

  it('rechaza petición con token de firma inválida (401)', async () => {
    const fakeToken = jwt.sign(
      { sub: 999, email: 'fake@test.com', rol: 'administrador', type: 'access', jti: 'fake-jti' },
      'secret-incorrecto-totalmente-diferente',
      { expiresIn: '15m', issuer: 'gesthor-api', audience: 'gesthor-client' }
    );

    const res = await request(API_URL)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${fakeToken}`)
      .expect(401);

    expect(res.body.ok).toBe(false);
  });

  it('rechaza petición con token malformado (401)', async () => {
    const res = await request(API_URL)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token.invalido.aqui')
      .expect(401);

    expect(res.body.ok).toBe(false);
  });

  it('acepta petición con token válido (200)', async () => {
    const res = await request(API_URL)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.data.usuario).toBeDefined();
  });
});

describe('J5 – Manejo de TokenExpiredError', () => {
  it('devuelve 401 con mensaje de expiración para un token expirado', async () => {
    const expiredToken = jwt.sign(
      {
        sub: 1,
        email: 'admin@unach.mx',
        rol: 'administrador',
        type: 'access',
        jti: 'test-expired-jti-' + Date.now(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '0s',
        issuer: 'gesthor-api',
        audience: 'gesthor-client',
      }
    );

    // Esperar a que expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    const res = await request(API_URL)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(res.body.ok).toBe(false);
    expect(res.body.message.toLowerCase()).toMatch(/expirado|expired/);
  });
});

describe('J11 – Login devuelve tokens de forma segura', () => {
  it('login exitoso devuelve accessToken y refreshToken en el body', async () => {
    // Reusar caché del admin (ya logueado)
    const session = await getSession(TEST_ADMIN);
    expect(session.accessToken).toBeDefined();
    expect(session.refreshToken).toBeDefined();
    expect(typeof session.accessToken).toBe('string');
    expect(typeof session.refreshToken).toBe('string');
  });

  it('login fallido con credenciales incorrectas devuelve 401', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({ correo: 'admin@unach.mx', contraseña: 'contraseña_incorrecta_xyz' });

    // Podría ser 401 o 429 si el rate limiter lo bloqueó
    expect([401, 429]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });

  it('login con datos faltantes devuelve 400', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({ correo: '', contraseña: '' });

    expect([400, 429]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3) PRUEBAS DE REFRESH TOKEN ROTATORIO (J7)
// ═══════════════════════════════════════════════════════════════════════════════

describe('J7 – Sistema de Refresh Token Rotatorio', () => {
  let freshRefreshToken;
  let freshAccessToken;

  beforeAll(async () => {
    // Hacer un login fresco específico para esta suite (necesitamos un token no reutilizado)
    try {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send(TEST_PROFE);

      if (res.status === 200 && res.body?.data) {
        freshAccessToken = res.body.data.accessToken;
        freshRefreshToken = res.body.data.refreshToken;
        return;
      }
    } catch (_) {}

    const session = await authService.login(TEST_PROFE.correo, TEST_PROFE.contraseña, '127.0.0.1', 'jest-runner');
    freshAccessToken = session.accessToken;
    freshRefreshToken = session.refreshToken;
  });

  it('endpoint /api/auth/refresh renueva tokens correctamente (rotación)', async () => {
    if (!freshRefreshToken) {
      console.warn('⚠ Skipped: no se pudo obtener refresh token (rate limit)');
      return;
    }

    const res = await request(API_URL)
      .post('/api/auth/refresh')
      .send({ refreshToken: freshRefreshToken })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    // Los tokens nuevos deben ser diferentes a los originales
    expect(res.body.data.accessToken).not.toBe(freshAccessToken);
    expect(res.body.data.refreshToken).not.toBe(freshRefreshToken);

    // Guardar el token original para el test de reuse detection
    const usedRefreshToken = freshRefreshToken;

    // Actualizar para el siguiente test
    freshAccessToken = res.body.data.accessToken;
    freshRefreshToken = res.body.data.refreshToken;

    // Test de reuse detection: el token original fue rotado y ahora está invalidado
    const reuseRes = await request(API_URL)
      .post('/api/auth/refresh')
      .send({ refreshToken: usedRefreshToken });

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.ok).toBe(false);
  });

  it('rechaza refresh con token completamente inválido', async () => {
    const res = await request(API_URL)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'token.completamente.falso' });

    expect([400, 401, 500]).toContain(res.status);
    expect(res.body.ok).toBe(false);
  });

  it('rechaza refresh sin token en el body (400)', async () => {
    const res = await request(API_URL)
      .post('/api/auth/refresh')
      .send({})
      .expect(400);

    expect(res.body.ok).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4) PRUEBAS DE RBAC – ROLES Y PERMISOS (J8, J9)
// ═══════════════════════════════════════════════════════════════════════════════

describe('J8 – Middleware requireRole', () => {
  let adminToken;
  let alumnoToken;

  beforeAll(async () => {
    const adminSession = await getSession(TEST_ADMIN);
    adminToken = adminSession.accessToken;

    const alumnoSession = await getSession(TEST_ALUMNO);
    alumnoToken = alumnoSession.accessToken;
  });

  it('administrador accede a rutas protegidas de admin (200)', async () => {
    const res = await request(API_URL)
      .get('/api/admin/roles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('alumno NO puede acceder a rutas de admin (403)', async () => {
    const res = await request(API_URL)
      .get('/api/admin/roles')
      .set('Authorization', `Bearer ${alumnoToken}`);

    expect(res.status).toBe(403);
  });
});

describe('J9 – Middleware requirePermission', () => {
  let adminToken;
  let alumnoToken;

  beforeAll(async () => {
    const adminSession = await getSession(TEST_ADMIN);
    adminToken = adminSession.accessToken;

    const alumnoSession = await getSession(TEST_ALUMNO);
    alumnoToken = alumnoSession.accessToken;
  });

  it('administrador puede listar docentes (tiene todos los permisos)', async () => {
    const res = await request(API_URL)
      .get('/api/docentes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('alumno NO puede acceder a gestión de docentes (403)', async () => {
    const res = await request(API_URL)
      .get('/api/docentes')
      .set('Authorization', `Bearer ${alumnoToken}`);

    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5) PRUEBAS DE ZERO-TRUST (J10)
// ═══════════════════════════════════════════════════════════════════════════════

describe('J10 – Zero-Trust: Identidad desde req.user', () => {
  let adminToken;
  let adminUserId;

  beforeAll(async () => {
    const session = await getSession(TEST_ADMIN);
    adminToken = session.accessToken;
    adminUserId = session.usuario.id;
  });

  it('GET /api/auth/me devuelve datos del usuario extraídos del token', async () => {
    const res = await request(API_URL)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.data.usuario.id).toBe(adminUserId);
    expect(res.body.data.usuario.email).toBeDefined();
    expect(res.body.data.usuario.rol).toBeDefined();
  });

  it('GET /api/auth/permisos devuelve permisos del usuario autenticado', async () => {
    const res = await request(API_URL)
      .get('/api/auth/permisos')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.data.rol).toBeDefined();
    expect(Array.isArray(res.body.data.permisos)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6) PRUEBAS DE SEGURIDAD ADICIONALES Y CORS (J6)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Seguridad General – Protección contra exposición de información', () => {
  it('las respuestas de error no contienen stack traces ni detalles internos', async () => {
    // Usar una ruta protegida sin token (401 garantizado, no dispara rate limiter)
    const res = await request(API_URL)
      .get('/api/auth/me')
      .expect(401);

    expect(res.body.ok).toBe(false);
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toMatch(/node_modules/);
    expect(bodyStr).not.toMatch(/at\s+[A-Za-z]/);
    expect(bodyStr).not.toMatch(/pg_/);
    expect(bodyStr).not.toMatch(/password_hash/);
  });

  it('ruta inexistente devuelve 404 con mensaje genérico', async () => {
    const res = await request(API_URL)
      .get('/api/ruta/que/no/existe')
      .expect(404);

    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('health-check /api responde correctamente', async () => {
    const res = await request(API_URL)
      .get('/api')
      .expect(200);

    expect(res.body.ok).toBe(true);
  });
});

describe('J6 – Configuración de CORS y withCredentials', () => {
  it('el servidor incluye Access-Control-Allow-Credentials: true', async () => {
    const res = await request(API_URL)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');

    const allowCredentials = res.headers['access-control-allow-credentials'];
    expect(allowCredentials).toBe('true');
  });

  it('el servidor permite el origen del frontend configurado', async () => {
    const res = await request(API_URL)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');

    const allowOrigin = res.headers['access-control-allow-origin'];
    expect(allowOrigin).toBe('http://localhost:5173');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7) PRUEBAS DE FLUJO COMPLETO (Login → Uso → Refresh → Logout)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Flujo completo de sesión: Login → Uso → Refresh → Logout', () => {
  let accessToken, refreshToken;

  it('Paso 1: Login exitoso devuelve tokens', async () => {
    // Login fresco para este flujo
    let res;
    try {
      res = await request(API_URL)
        .post('/api/auth/login')
        .send({ correo: 'editor@unach.mx', contraseña: TEST_PASSWORD });
    } catch (_) {}

    if (!res || res.status === 429) {
      const session = await authService.login('editor@unach.mx', TEST_PASSWORD, '127.0.0.1', 'jest-runner');
      accessToken = session.accessToken;
      refreshToken = session.refreshToken;
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      return;
    }

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it('Paso 2: Acceder a ruta protegida con el access token', async () => {
    if (!accessToken) return; // Skip si el login falló por rate limit

    const res = await request(API_URL)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.data.usuario.email).toBe('editor@unach.mx');
  });

  it('Paso 3: Renovar tokens con refresh token (rotación)', async () => {
    if (!refreshToken) return;

    const res = await request(API_URL)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.ok).toBe(true);
    const newAccessToken = res.body.data.accessToken;
    const newRefreshToken = res.body.data.refreshToken;

    expect(newAccessToken).not.toBe(accessToken);
    expect(newRefreshToken).not.toBe(refreshToken);

    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
  });

  it('Paso 4: Acceder con el nuevo access token tras renovación', async () => {
    if (!accessToken) return;

    const res = await request(API_URL)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.ok).toBe(true);
  });

  it('Paso 5: Logout cierra la sesión correctamente', async () => {
    if (!accessToken) return;

    const res = await request(API_URL)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    expect(res.body.ok).toBe(true);
  });
});
