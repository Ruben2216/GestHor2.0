import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export function sanitizeClientErrorMessage(message, statusCode = 500) {
  if (!message || statusCode >= 500) {
    return 'Ocurrió un error interno en el servidor. Por favor, intente más tarde.';
  }

  const internalPatterns = [
    /pg_/i,
    /syntax error/i,
    /relation/i,
    /column/i,
    /database/i,
    /connection/i,
    /password/i,
    /sql/i,
    /query/i,
    /stack/i,
    /unhandled/i,
    /typeerror/i,
    /referenceerror/i,
    /at\s+[a-z0-9_.]+\s+\(/i,
    /node_modules/i,
    /\/Users\//i,
    /\/var\//i,
    /\/home\//i,
    /C:\\/i
  ];

  if (typeof message === 'string') {
    for (const pattern of internalPatterns) {
      if (pattern.test(message)) {
        return 'Ocurrió un error interno al procesar la solicitud.';
      }
    }
  }

  return message;
}

export function successResponse(data, message = '', statusCode = AUTH_CONSTANTS.HTTP_STATUS.OK) {
  return {
    ok: true,
    data,
    message,
    statusCode,
  };
}

export function errorResponse(message, code = AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT, statusCode = AUTH_CONSTANTS.HTTP_STATUS.BAD_REQUEST, details = null) {
  const safeMessage = sanitizeClientErrorMessage(message, statusCode);

  const response = {
    ok: false,
    message: safeMessage,
    code,
    statusCode,
  };

  // En producción jamás se exponen detalles de error
  if (details && process.env.NODE_ENV !== 'production' && statusCode < 500) {
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

export function handleError(res, error, defaultMessage = 'Ocurrió un error interno en el servidor') {
  // Registrar el detalle técnico únicamente en la consola del servidor
  console.error('[Error de Servidor]:', error);

  if (error.name === 'ValidationError') {
    return sendError(res, error.message, AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT, AUTH_CONSTANTS.HTTP_STATUS.BAD_REQUEST);
  }

  if (error.name === 'UnauthorizedError' || (typeof error.message === 'string' && error.message.toLowerCase().includes('no autorizado'))) {
    return sendError(res, 'No autorizado', AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
  }

  if (error.name === 'TokenExpiredError') {
    return sendError(res, 'Token expirado. Inicie sesión nuevamente.', AUTH_CONSTANTS.ERROR_CODES.TOKEN_EXPIRED, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
  }

  if (error.name === 'JsonWebTokenError') {
    return sendError(res, 'Token inválido', AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
  }

  return sendError(res, defaultMessage, AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT, AUTH_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR);
}