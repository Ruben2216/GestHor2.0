import * as tokenService from '../services/tokenService.js';
import * as sessionService from '../services/sessionService.js';
import { sendError } from '../utils/response.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Token no proporcionado', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    const decoded = tokenService.verifyAccessToken(token);

    if (!tokenService.isAccessToken(decoded)) {
      return sendError(res, 'Tipo de token inválido', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    const session = await sessionService.findSessionByAccessJti(decoded.jti);

    if (!session || session.status !== 'active') {
      return sendError(res, 'Sesión inválida o revocada', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      rol: decoded.rol,
      jti: decoded.jti,
      type: decoded.type,
    };

    req.session = {
      sessionId: session.session_id,
      accessJti: session.access_jti,
      refreshJti: session.refresh_jti,
      ipOrigen: session.ip_origen,
      userAgent: session.user_agent,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.message.includes('expirado')) {
      return sendError(res, 'Token expirado. Por favor inicie sesión nuevamente', AUTH_CONSTANTS.ERROR_CODES.TOKEN_EXPIRED, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    if (error.name === 'JsonWebTokenError' || error.message.includes('inválido')) {
      return sendError(res, 'Token inválido', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    console.error('Error en middleware auth:', error);
    return sendError(res, 'Error al validar token', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN, AUTH_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'No autenticado', AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    const userRole = req.user.rol;

    if (!roles.includes(userRole)) {
      return sendError(res, 'No tiene permisos para acceder a este recurso', AUTH_CONSTANTS.ERROR_CODES.FORBIDDEN, AUTH_CONSTANTS.HTTP_STATUS.FORBIDDEN);
    }

    next();
  };
};

export const requirePermission = (...permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'No autenticado', AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    if (!req.user.permissions) {
      return sendError(res, 'Permisos no disponibles', AUTH_CONSTANTS.ERROR_CODES.FORBIDDEN, AUTH_CONSTANTS.HTTP_STATUS.FORBIDDEN);
    }

    const hasPermission = permissions.some(p => req.user.permissions.includes(p));

    if (!hasPermission) {
      return sendError(res, 'No tiene permisos para acceder a este recurso', AUTH_CONSTANTS.ERROR_CODES.FORBIDDEN, AUTH_CONSTANTS.HTTP_STATUS.FORBIDDEN);
    }

    next();
  };
};