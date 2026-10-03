import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export function successResponse(data, message = '', statusCode = AUTH_CONSTANTS.HTTP_STATUS.OK) {
  return {
    ok: true,
    data,
    message,
    statusCode,
  };
}

export function errorResponse(message, code = AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT, statusCode = AUTH_CONSTANTS.HTTP_STATUS.BAD_REQUEST, details = null) {
  const response = {
    ok: false,
    message,
    code,
    statusCode,
  };

  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details;
  }

  return response;
}

export function sendSuccess(res, data, message = '', statusCode = AUTH_CONSTANTS.HTTP_STATUS.OK) {
  return res.status(statusCode).json(successResponse(data, message, statusCode));
}

export function sendError(res, message, code = AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT, statusCode = AUTH_CONSTANTS.HTTP_STATUS.BAD_REQUEST, details = null) {
  return res.status(statusCode).json(errorResponse(message, code, statusCode, details));
}

export function handleError(res, error, defaultMessage = 'Error interno del servidor') {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return sendError(res, error.message, AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT, AUTH_CONSTANTS.HTTP_STATUS.BAD_REQUEST);
  }

  if (error.name === 'UnauthorizedError' || error.message.includes('no autorizado')) {
    return sendError(res, 'No autorizado', AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
  }

  if (error.name === 'TokenExpiredError') {
    return sendError(res, 'Token expirado', AUTH_CONSTANTS.ERROR_CODES.TOKEN_EXPIRED, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
  }

  if (error.name === 'JsonWebTokenError') {
    return sendError(res, 'Token inválido', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
  }

  return sendError(res, defaultMessage, AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT, AUTH_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR);
}