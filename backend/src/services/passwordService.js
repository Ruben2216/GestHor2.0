import * as userRepository from '../repositories/userRepository.js';
import * as passwordResetRepository from '../repositories/passwordResetRepository.js';
import * as recoveryCodeRepository from '../repositories/recoveryCodeRepository.js';
import { dbConnection } from '../config/database.js';
import { hashPassword, comparePassword, generateRecoveryCode, hashToken } from '../utils/crypto.js';
import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from '../constants/auth.constants.js';
import { UnauthorizedError } from '../utils/errors.js';
import { enviarCorreoCodigoRecuperacion } from './emailService.js';

const RECOVERY_CODE_EXPIRES_HOURS = AUTH_CONSTANTS.RECOVERY_CODE.EXPIRES_IN_HOURS;

export async function requestPasswordReset(email) {
  const user = await userRepository.findByEmail(email);
  
  if (!user) {
    return { success: true, message: RESPONSE_MESSAGES.RESET_EMAIL_SENT };
  }

  const code = generateRecoveryCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + RECOVERY_CODE_EXPIRES_HOURS * 60 * 60 * 1000);
  const savedCode = await recoveryCodeRepository.saveCode({
    userId: user.usuario_id,
    codeHash,
    expiresAt,
  });

  try {
    const emailResult = await enviarCorreoCodigoRecuperacion({
      email: user.email,
      nombreCompleto: user.nombre || user.email,
      codigo: code,
      expiresInHours: RECOVERY_CODE_EXPIRES_HOURS,
    });
    if (!emailResult.success) {
      throw new Error('No fue posible enviar el correo con el código de recuperación');
    }
  } catch (error) {
    await recoveryCodeRepository.invalidateCode(savedCode.codigo_2fa_id);
    throw error;
  }

  return { success: true, message: RESPONSE_MESSAGES.RESET_EMAIL_SENT };
}

export async function resetPassword(email, code, newPassword) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Código de recuperación inválido o expirado', AUTH_CONSTANTS.ERROR_CODES.RESET_CODE_INVALID);
  }

  const codeAccepted = await dbConnection.tx(async (transaction) => {
    const storedCode = await recoveryCodeRepository.findCurrentCodeForUpdate(transaction, user.usuario_id);
    if (!storedCode) return false;

    if (!(await comparePassword(code, storedCode.codigo_hash))) {
      await recoveryCodeRepository.incrementFailedAttempts(transaction, storedCode.codigo_2fa_id);
      return false;
    }

    const usedCode = await recoveryCodeRepository.markUsed(transaction, storedCode.codigo_2fa_id);
    if (!usedCode) return false;

    const passwordHash = await hashPassword(newPassword);
    await transaction.none(
      'UPDATE usuarios SET password_hash = $1, fecha_actualizacion = NOW() WHERE usuario_id = $2',
      [passwordHash, user.usuario_id]
    );
    await transaction.none(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE usuario_id = $1 AND revoked_at IS NULL',
      [user.usuario_id]
    );
    await transaction.none(
      `UPDATE user_sessions
       SET revoked_at = NOW(), status = 'revoked'
       WHERE usuario_id = $1 AND status = 'active'`,
      [user.usuario_id]
    );
    return true;
  });

  if (!codeAccepted) {
    throw new UnauthorizedError('Código de recuperación inválido o expirado', AUTH_CONSTANTS.ERROR_CODES.RESET_CODE_INVALID);
  }

  return { success: true, message: RESPONSE_MESSAGES.PASSWORD_RESET };
}

export async function validateResetToken(token) {
  const tokenHash = hashToken(token);
  const resetToken = await passwordResetRepository.findValidTokenByHash(tokenHash);
  
  if (!resetToken) {
    return { valid: false, reason: 'invalid_or_expired' };
  }

  if (resetToken.used_at) {
    return { valid: false, reason: 'already_used' };
  }

  if (new Date() > new Date(resetToken.expires_at)) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, userId: resetToken.usuario_id };
}