import { AUTH_CONSTANTS } from '../constants/auth.constants.js';
import { ValidationError } from '../utils/errors.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(email, password) {
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('El correo es requerido');
  } else if (!emailRegex.test(email.trim())) {
    errors.push('Formato de correo inválido');
  }

  if (!password || typeof password !== 'string') {
    errors.push('La contraseña es requerida');
  }

  if (errors.length > 0) {
    throw new ValidationError('Datos de entrada inválidos', errors);
  }

  return { email: email.trim(), password };
}

export function validateRefreshToken(token) {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new ValidationError('Refresh token requerido', ['Refresh token es requerido']);
  }
  return token.trim();
}

export function validateLogout(token) {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new ValidationError('Token requerido', ['Token es requerido para cerrar sesión']);
  }
  return token.trim();
}

export function validateChangePassword(currentPassword, newPassword) {
  const errors = [];

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('La contraseña actual es requerida');
  }

  if (!newPassword || typeof newPassword !== 'string') {
    errors.push('La nueva contraseña es requerida');
  } else {
    if (newPassword.length < AUTH_CONSTANTS.PASSWORD.MIN_LENGTH) {
      errors.push(`La nueva contraseña debe tener al menos ${AUTH_CONSTANTS.PASSWORD.MIN_LENGTH} caracteres`);
    }
    if (currentPassword && newPassword === currentPassword) {
      errors.push('La nueva contraseña no puede ser igual a la actual');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Datos de entrada inválidos', errors);
  }

  return { currentPassword, newPassword };
}

export function validateForgotPassword(email) {
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    throw new ValidationError('Formato de correo inválido', ['Correo inválido']);
  }
  return email.trim();
}

export function validateResetPassword(token, newPassword) {
  const errors = [];

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    errors.push('Token de recuperación requerido');
  }

  if (!newPassword || typeof newPassword !== 'string') {
    errors.push('La nueva contraseña es requerida');
  } else if (newPassword.length < AUTH_CONSTANTS.PASSWORD.MIN_LENGTH) {
    errors.push(`La nueva contraseña debe tener al menos ${AUTH_CONSTANTS.PASSWORD.MIN_LENGTH} caracteres`);
  }

  if (errors.length > 0) {
    throw new ValidationError('Datos de entrada inválidos', errors);
  }

  return { token: token.trim(), newPassword };
}