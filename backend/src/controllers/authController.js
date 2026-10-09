/**
 * ============================================================================
 * GestHor 2.0 - Auth Controller (Controlador de Autenticación)
 * Implementación de Seguridad JWT:
 *   - (J1) Validación del Secret al inicializar (Error fatal si no existe)
 *   - (J2) Configuración de Claims estándar (sub, email, rol, iss, aud)
 *   - (J3) Validación de Expiración estricta (15m - 30m con fallback y warning)
 * ============================================================================
 */

import jwt from 'jsonwebtoken';
import * as authService from '../services/authService.js';
import { validateLogin } from '../validators/authValidator.js';
import { sendSuccess, sendError, handleError } from '../utils/response.js';
import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from '../constants/auth.constants.js';
import { loadPermissions } from '../middlewares/auth.js';
import { AppError } from '../utils/errors.js';

// ============================================================================
// (J1) Validación del Secret: Rutina de inicialización obligatoria
// ============================================================================
/**
 * Verifica que JWT_SECRET exista en el entorno y no esté vacío.
 * Si no está presente, detiene la aplicación inmediatamente con un error fatal.
 */
function inicializarSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    const errorMensaje = '[FATAL SEGURIDAD] La variable de entorno JWT_SECRET no está definida o está vacía. La aplicación no puede iniciar de forma segura.';
    console.error(errorMensaje);
    throw new Error(errorMensaje);
  }
  return secret.trim();
}

// Ejecución al importar el módulo: si JWT_SECRET no está configurado, la app se detiene
const JWT_SECRET = inicializarSecret();

// ============================================================================
// (J3) Validación de Expiración: Rango estricto entre 15 y 30 minutos
// ============================================================================
/**
 * Valida la variable JWT_EXPIRES_IN asegurando que esté estrictamente entre 15 y 30 minutos.
 * Si excede este tiempo, es menor o tiene formato inválido, emite un warning y fuerza '15m'.
 * 
 * @param {string} expEnv - Valor de la variable de entorno JWT_EXPIRES_IN
 * @returns {string} Tiempo de expiración válido (ej. '15m', '30m')
 */
function validarExpiracion(expEnv) {
  const DEFAULT_EXPIRATION = '15m';

  if (!expEnv || typeof expEnv !== 'string') {
    console.warn(`[WARN - SEGURIDAD JWT] JWT_EXPIRES_IN no está definida. Se forzará el valor por defecto seguro '${DEFAULT_EXPIRATION}'.`);
    return DEFAULT_EXPIRATION;
  }

  const limpio = expEnv.trim().toLowerCase();
  // Analizar formatos como '15m', '20m', '30m', '15min' o sólo números en minutos
  const match = limpio.match(/^(\d+)(m|min|minutes)?$/);

  if (!match) {
    console.warn(`[WARN - SEGURIDAD JWT] Formato inválido en JWT_EXPIRES_IN ('${expEnv}'). Se forzará '${DEFAULT_EXPIRATION}'.`);
    return DEFAULT_EXPIRATION;
  }

  const minutos = parseInt(match[1], 10);

  if (minutos < 15 || minutos > 30) {
    console.warn(`[WARN - SEGURIDAD JWT] JWT_EXPIRES_IN ('${expEnv}' = ${minutos}m) está fuera del rango estricto permitido (15 a 30 minutos). Se forzará '${DEFAULT_EXPIRATION}'.`);
    return DEFAULT_EXPIRATION;
  }

  return `${minutos}m`;
}

// Tiempo de expiración validado para los tokens de acceso
const JWT_EXPIRES_IN = validarExpiracion(process.env.JWT_EXPIRES_IN);

// ============================================================================
// (J2) Configuración de Claims y Generación de Tokens
// ============================================================================
/**
 * Genera un access token JWT incluyendo claims privados y claims estándar.
 * 
 * Explicación del claim 'iat' (Issued At):
 * La librería 'jsonwebtoken' genera e incluye automáticamente el claim 'iat'
 * con la marca de tiempo Unix actual (en segundos) al momento de firmar el token.
 * No es necesario pasarlo en el payload ni en las opciones, a menos que se desee
 * sobrescribir manualmente o suprimir con { noTimestamp: true }.
 * 
 * @param {Object} usuario - Datos del usuario autenticado (id, email, rol)
 * @returns {string} JWT firmado
 */
export function generarAccessToken(usuario) {
  // Payload con claims privados y sub
  const payload = {
    sub: usuario.id || usuario.usuario_id,
    email: usuario.email,
    rol: usuario.rol || usuario.nombre_rol,
  };

  // Opciones estándar de seguridad para jwt.sign
  const opciones = {
    expiresIn: JWT_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER || 'gesthor-api',      // Claim estándar 'iss'
    audience: process.env.JWT_AUDIENCE || 'gesthor-client', // Claim estándar 'aud'
  };

  return jwt.sign(payload, JWT_SECRET, opciones);
}

// ============================================================================
// Controladores de Peticiones HTTP
// ============================================================================

/**
 * Iniciar sesión
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const correo = req.body.correo || req.body.email;
    const contraseña = req.body.contraseña || req.body.password;

    const { email, password } = validateLogin(correo, contraseña);

    const ipOrigen = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.login(email, password, ipOrigen, userAgent);
    req.user = {
      id: result.usuario.id,
      email: result.usuario.email,
      rol: result.usuario.rol,
    };

    return sendSuccess(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      usuario: result.usuario,
    }, RESPONSE_MESSAGES.LOGIN_SUCCESS);
  } catch (error) {
    // Errores esperados (datos inválidos, credenciales incorrectas): su status real (400/401)
    if (error instanceof AppError && error.statusCode < 500) {
      return sendError(res, error.message, error.code, error.statusCode, error.details);
    }

    // Errores inesperados: el detalle solo se registra en el servidor, nunca se envía al cliente
    console.error('Error en login:', error);
    return sendError(res, RESPONSE_MESSAGES.INTERNAL_ERROR, 'INTERNAL_ERROR', AUTH_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Cerrar sesión
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    let refreshToken = null;

    if (req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      refreshToken = authHeader.substring(7);
    }

    const userId = req.user?.id;
    const ipOrigen = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.logout(userId, refreshToken, ipOrigen, userAgent);

    return sendSuccess(res, result, RESPONSE_MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    return handleError(res, error, 'Error al cerrar sesión');
  }
}

/**
 * Obtener perfil del usuario en sesión
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 'No autenticado', AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    const result = await authService.getMe(userId);

    return sendSuccess(res, result, 'Perfil obtenido correctamente');
  } catch (error) {
    return handleError(res, error, 'Error al obtener perfil');
  }
}

/**
 * Obtener permisos y rol del usuario autenticado
 * GET /api/auth/permisos
 */
export async function getPermisos(req, res) {
  try {
    const permisos = await loadPermissions(req);

    return sendSuccess(res, { rol: req.user.rol, permisos }, 'Permisos obtenidos correctamente');
  } catch (error) {
    return handleError(res, error, 'Error al obtener permisos');
  }
}