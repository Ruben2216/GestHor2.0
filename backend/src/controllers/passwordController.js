import * as authService from '../services/authService.js';
import { validateChangePassword, validateForgotPassword, validateResetPassword } from '../validators/authValidator.js';
import { sendSuccess, handleError } from '../utils/response.js';
import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from '../constants/auth.constants.js';

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = validateChangePassword(req.body.currentPassword, req.body.newPassword);

    const userId = req.user?.id;
    if (!userId) {
      return sendSuccess(res, null, 'No autenticado', AUTH_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    return sendSuccess(res, result, RESPONSE_MESSAGES.PASSWORD_CHANGED);
  } catch (error) {
    return handleError(res, error, 'Error al cambiar contraseña');
  }
}

export async function forgotPassword(req, res) {
  try {
    const email = validateForgotPassword(req.body.email);

    const result = await authService.requestPasswordReset(email);

    return sendSuccess(res, { emailSent: true }, result.message);
  } catch (error) {
    return handleError(res, error, 'Error al solicitar recuperación');
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = validateResetPassword(req.body.token, req.body.newPassword);

    const result = await authService.resetPassword(token, newPassword);

    return sendSuccess(res, result, RESPONSE_MESSAGES.PASSWORD_RESET);
  } catch (error) {
    return handleError(res, error, 'Error al restablecer contraseña');
  }
}