import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export async function hashPassword(password) {
  return bcrypt.hash(password, AUTH_CONSTANTS.PASSWORD.BCRYPT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateJti() {
  return crypto.randomUUID();
}

export function parseExpiresIn(expiresIn) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
}

export function calculateExpiration(expiresIn) {
  const ms = parseExpiresIn(expiresIn);
  return new Date(Date.now() + ms);
}