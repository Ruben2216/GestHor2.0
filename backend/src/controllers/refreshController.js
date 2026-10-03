import * as authService from '../services/authService.js';
import { validateRefreshToken } from '../validators/authValidator.js';
import { sendSuccess, handleError } from '../utils/response.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export async function refresh(req, res) {
  try {
    const refreshToken = validateRefreshToken(req.body.refreshToken);

    const ipOrigen = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.refreshSession(refreshToken, ipOrigen, userAgent);

    return sendSuccess(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      usuario: result.usuario,
    }, AUTH_CONSTANTS.RESPONSE_MESSAGES.REFRESH_SUCCESS);
  } catch (error) {
    return handleError(res, error, 'Error al renovar token');
  }
}