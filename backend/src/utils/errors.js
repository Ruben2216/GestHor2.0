import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export class AppError extends Error {
  constructor(message, code, statusCode, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT, AUTH_CONSTANTS.HTTP_STATUS.BAD_REQUEST, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado', code = AUTH_CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS) {
    super(message, code, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para acceder a este recurso') {
    super(message, AUTH_CONSTANTS.ERROR_CODES.FORBIDDEN, AUTH_CONSTANTS.HTTP_STATUS.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, AUTH_CONSTANTS.ERROR_CODES.USER_NOT_FOUND, AUTH_CONSTANTS.HTTP_STATUS.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto de recursos') {
    super(message, AUTH_CONSTANTS.ERROR_CODES.DUPLICATE_EMAIL, AUTH_CONSTANTS.HTTP_STATUS.CONFLICT);
    this.name = 'ConflictError';
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = 'Token expirado') {
    super(message, AUTH_CONSTANTS.ERROR_CODES.TOKEN_EXPIRED, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AppError {
  constructor(message = 'Token inválido') {
    super(message, AUTH_CONSTANTS.ERROR_CODES.INVALID_TOKEN, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    this.name = 'InvalidTokenError';
  }
}

export class TokenReusedError extends AppError {
  constructor(message = 'Token reutilizado detectado - sesión invalidada') {
    super(message, AUTH_CONSTANTS.ERROR_CODES.TOKEN_REUSED, AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    this.name = 'TokenReusedError';
  }
}

export function isAppError(error) {
  return error instanceof AppError;
}

export function getErrorResponse(error) {
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  return {
    message: 'Error interno del servidor',
    code: AUTH_CONSTANTS.ERROR_CODES.INVALID_INPUT,
    statusCode: AUTH_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details: process.env.NODE_ENV !== 'production' ? error.message : null,
  };
}