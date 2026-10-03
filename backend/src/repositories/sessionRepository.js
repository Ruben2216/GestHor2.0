import { dbConnection } from '../config/database.js';

export async function createSessionRecord({ userId, accessJti, refreshJti, ipOrigen, userAgent, expiresAt }) {
  const sql = `
    INSERT INTO user_sessions (usuario_id, access_jti, refresh_jti, ip_origen, user_agent, expires_at, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())
    RETURNING session_id, usuario_id, access_jti, refresh_jti, ip_origen, user_agent, created_at, revoked_at, expires_at, status
  `;
  return dbConnection.one(sql, [userId, accessJti, refreshJti, ipOrigen, userAgent, expiresAt]);
}

export async function revokeSession(userId, jti) {
  const sql = `
    UPDATE user_sessions
    SET revoked_at = NOW(), status = 'revoked'
    WHERE usuario_id = $1 AND (access_jti = $2 OR refresh_jti = $2) AND status = 'active'
    RETURNING session_id
  `;
  return dbConnection.oneOrNone(sql, [userId, jti]);
}

export async function revokeAllSessions(userId) {
  const sql = `
    UPDATE user_sessions
    SET revoked_at = NOW(), status = 'revoked'
    WHERE usuario_id = $1 AND status = 'active'
    RETURNING session_id
  `;
  return dbConnection.any(sql, [userId]);
}

export async function findSessionByAccessJti(accessJti) {
  const sql = `
    SELECT session_id, usuario_id, access_jti, refresh_jti, ip_origen, user_agent, created_at, revoked_at, expires_at, status
    FROM user_sessions
    WHERE access_jti = $1
  `;
  return dbConnection.oneOrNone(sql, [accessJti]);
}

export async function findSessionByRefreshJti(refreshJti) {
  const sql = `
    SELECT session_id, usuario_id, access_jti, refresh_jti, ip_origen, user_agent, created_at, revoked_at, expires_at, status
    FROM user_sessions
    WHERE refresh_jti = $1
  `;
  return dbConnection.oneOrNone(sql, [refreshJti]);
}

export async function cleanupExpiredSessions() {
  const sql = `
    UPDATE user_sessions
    SET status = 'expired', revoked_at = NOW()
    WHERE expires_at < NOW() AND status = 'active'
  `;
  return dbConnection.result(sql);
}