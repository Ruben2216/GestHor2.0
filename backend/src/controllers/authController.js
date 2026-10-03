import * as authService from '../services/authService.js';
import { validateLogin } from '../validators/authValidator.js';
import { sendSuccess, sendError, handleError } from '../utils/response.js';
import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from '../constants/auth.constants.js';

export async function login(req, res) {
  try {
    console.log('=== LOGIN REQUEST ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    
    const correo = req.body.correo || req.body.email;
    const contraseña = req.body.contraseña || req.body.password;
    console.log('Extracted correo:', correo);
    console.log('Extracted contraseña:', contraseña ? '***' : 'MISSING');
    
    const { email, password } = validateLogin(correo, contraseña);
    console.log('Validation passed');

    const ipOrigen = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.login(email, password, ipOrigen, userAgent);

    return sendSuccess(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      usuario: result.usuario,
    }, RESPONSE_MESSAGES.LOGIN_SUCCESS);
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error statusCode:', error.statusCode);
    console.error('Error details:', error.details);
    console.error('Error stack:', error.stack);
    
    // Return detailed error for debugging
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({
        ok: false,
        message: error.message,
        code: error.code || 'INTERNAL_ERROR',
        stack: error.stack,
        details: error.details
      });
    }
    return handleError(res, error, 'Error en login');
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