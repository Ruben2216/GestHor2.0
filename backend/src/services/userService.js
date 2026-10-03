import * as userRepository from '../repositories/userRepository.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export async function findByEmail(email) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return user;
}

export async function getUserById(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return user;
}

export async function getUserByIdWithPassword(userId) {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return user;
}

export async function updatePasswordHash(userId, newPassword) {
  const hashedPassword = await hashPassword(newPassword);
  await userRepository.updatePasswordHash(userId, hashedPassword);
  return true;
}

export async function isPasswordValid(user, password) {
  return comparePassword(password, user.password_hash);
}

export async function validateCurrentPassword(userId, currentPassword) {
  const user = await getUserByIdWithPassword(userId);
  const isValid = await isPasswordValid(user, currentPassword);
  if (!isValid) {
    throw new ValidationError('Contraseña actual incorrecta', ['INVALID_CREDENTIALS']);
  }
  return user;
}

export async function changePassword(userId, currentPassword, newPassword) {
  await validateCurrentPassword(userId, currentPassword);
  await updatePasswordHash(userId, newPassword);
  return true;
}

export async function updateLastLogin(userId) {
  return userRepository.updateLastLogin(userId);
}

export async function getUserPermissions(userId) {
  return userRepository.getUserPermissions(userId);
}

export async function emailExists(email) {
  return userRepository.emailExists(email);
}