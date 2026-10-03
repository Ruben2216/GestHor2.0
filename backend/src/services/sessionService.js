import * as sessionRepository from '../repositories/sessionRepository.js';
import { calculateExpiration } from '../utils/crypto.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export async function createSessionRecord({ userId, accessJti, refreshJti, ipOrigen, userAgent }) {
  const expiresAt = calculateExpiration(AUTH_CONSTANTS.JWT.REFRESH_EXPIRES_IN);
  return sessionRepository.createSessionRecord({
    userId,
    accessJti,
    refreshJti,
    ipOrigen,
    userAgent,
    expiresAt,
  });
}

export async function revokeSession(userId, jti) {
  return sessionRepository.revokeSession(userId, jti);
}

export async function revokeAllSessions(userId) {
  return sessionRepository.revokeAllSessions(userId);
}

export async function findSessionByAccessJti(accessJti) {
  return sessionRepository.findSessionByAccessJti(accessJti);
}

export async function findSessionByRefreshJti(refreshJti) {
  return sessionRepository.findSessionByRefreshJti(refreshJti);
}

export async function cleanupExpiredSessions() {
  return sessionRepository.cleanupExpiredSessions();
}