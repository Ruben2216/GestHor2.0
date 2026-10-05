import rateLimit from 'express-rate-limit';

/**
 * Limitador para el endpoint de login
 * Protege contra ataques de fuerza bruta y credential stuffing.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente más tarde.',
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  },
  handler: (req, res, _next, options) => {
    return res.status(options.statusCode).json(options.message);
  },
});

/**
 * Limitador para recuperación y reseteo de contraseña
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiadas solicitudes de recuperación de contraseña. Intente más tarde.',
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  },
  handler: (req, res, _next, options) => {
    return res.status(options.statusCode).json(options.message);
  },
});

/**
 * Limitador general para la API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Límite de solicitudes excedido. Por favor, espere un momento.',
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  },
  handler: (req, res, _next, options) => {
    return res.status(options.statusCode).json(options.message);
  },
});
