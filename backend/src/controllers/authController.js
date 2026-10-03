import * as authService from '../services/authService.js';
import { validateLogin } from '../validators/authValidator.js';
import { sendSuccess, sendError, handleError } from '../utils/response.js';
import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from '../constants/auth.constants.js';
import { loadPermissions } from '../middlewares/auth.js';
import { AppError } from '../utils/errors.js';

export async function login(req, res) {
  try {
    const correo = req.body.correo || req.body.email;
    const contraseña = req.body.contraseña || req.body.password;

    const { email, password } = validateLogin(correo, contraseña);

    const ipOrigen = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.login(email, password, ipOrigen, userAgent);

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

// GET /api/auth/permisos - rol y permisos del usuario autenticado (para el frontend)
export async function getPermisos(req, res) {
  try {
    const permisos = await loadPermissions(req);

    return sendSuccess(res, { rol: req.user.rol, permisos }, 'Permisos obtenidos correctamente');
  } catch (error) {
    return handleError(res, error, 'Error al obtener permisos');
  }
}