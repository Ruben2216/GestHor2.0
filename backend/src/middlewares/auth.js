import * as tokenService from '../services/tokenService.js';
import * as sessionService from '../services/sessionService.js';
import * as userRepository from '../repositories/userRepository.js';
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

    req.authSession = {
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

// Carga los permisos del rol del usuario desde la BD (una vez por request)
export async function loadPermissions(req) {
  if (!req.user.permissions) {
    const rows = await userRepository.getUserPermissions(req.user.id);
    req.user.permissions = rows.map(p => p.clave);
  }
  return req.user.permissions;
}

// Pasa si el usuario tiene al menos uno de los permisos indicados
export const requirePermission = (...permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'No autenticado', AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    try {
      const userPermissions = await loadPermissions(req);

      if (!permissions.some(p => userPermissions.includes(p))) {
        return sendError(res, 'No tiene permisos para acceder a este recurso', AUTH_CONSTANTS.ERROR_CODES.FORBIDDEN, AUTH_CONSTANTS.HTTP_STATUS.FORBIDDEN);
      }

      next();
    } catch (error) {
      console.error('Error en middleware requirePermission:', error);
      return sendError(res, 'Error al validar permisos', AUTH_CONSTANTS.ERROR_CODES.FORBIDDEN, AUTH_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};

// Pasa si el usuario es el mismo que el indicado en req.params[param] o tiene al menos uno de los permisos indicados
export const requireSelfOrPermission = (param, ...permissions) => {
  const checkPermission = requirePermission(...permissions);
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'No autenticado', AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    if (String(req.params[param]) === String(req.user.id)) {
      return next();
    }

    return checkPermission(req, res, next);
  };
};

export const authorize = (...permissions) => [auth, requirePermission(...permissions)];

export const authorizeSelfOr = (param, ...permissions) => [auth, requireSelfOrPermission(param, ...permissions)];