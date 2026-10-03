import { AUTH_CONSTANTS } from '../constants/auth.constants.js';
import { ValidationError } from '../utils/errors.js';

export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('La contraseña es requerida');
    return errors;
  }

  if (password.length < AUTH_CONSTANTS.PASSWORD.MIN_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${AUTH_CONSTANTS.PASSWORD.MIN_LENGTH} caracteres`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return errors;
}

export function validatePasswordNotReused(newPassword, oldPasswordHash) {
  return async (bcrypt) => {
    const isSame = await bcrypt.compare(newPassword, oldPasswordHash);
    if (isSame) {
      throw new ValidationError('La nueva contraseña no puede ser igual a la anterior', ['PASSWORD_SAME_AS_CURRENT']);
    }
  };
}

export function validateResetToken(token) {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new ValidationError('Token requerido', ['Token de recuperación es requerido']);
  }
  return token.trim();
}