import * as authService from '../services/authService.js';
import { validateLogin } from '../validators/authValidator.js';
import { sendSuccess, sendError, handleError } from '../utils/response.js';
import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from '../constants/auth.constants.js';
import { loadPermissions } from '../middlewares/auth.js';
import { AppError } from '../utils/errors.js';
// ============================================================================
// Controladores de Peticiones HTTP
// ============================================================================

/**
 * Verificar código 2FA
 * POST /api/auth/verify-2fa
 */
export async function verify2fa(req, res) {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return sendError(res, 'Se requiere userId y código', 'MISSING_FIELDS', 400);
    }

    const ipOrigen = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.verify2fa(userId, code, ipOrigen, userAgent);

    return sendSuccess(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      usuario: result.usuario,
    }, 'Verificación 2FA exitosa');
  } catch (error) {
    if (error instanceof AppError && error.statusCode < 500) {
      return sendError(res, error.message, error.code, error.statusCode, error.details);
    }
    console.error('Error en verify2fa:', error);
    return sendError(res, RESPONSE_MESSAGES.INTERNAL_ERROR, 'INTERNAL_ERROR', AUTH_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

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

    // Si se requiere verificación 2FA, retornar señal sin tokens
    if (result.requires2fa) {
      return sendSuccess(res, { requires2fa: true, userId: result.userId }, 'Se requiere verificación de dos factores');
    }

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
    const refreshToken = req.body?.refreshToken || null;

    const userId = req.user?.id;
    const ipOrigen = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.logout(userId, refreshToken, ipOrigen, userAgent, req.user?.jti);

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
