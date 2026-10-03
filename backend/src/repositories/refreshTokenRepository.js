import { dbConnection } from '../config/database.js';

export async function saveRefreshToken({ userId, tokenHash, jti, expiresAt, userAgent, ipOrigen }) {
  const sql = `
    INSERT INTO refresh_tokens (usuario_id, token_hash, jti, expires_at, user_agent, ip_origen, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING refresh_token_id, usuario_id, token_hash, jti, expires_at, revoked_at, replaced_by_token_id, created_at, user_agent, ip_origen
  `;
  return dbConnection.one(sql, [userId, tokenHash, jti, expiresAt, userAgent, ipOrigen]);
}

export async function findByJti(jti) {
  const sql = `
    SELECT refresh_token_id, usuario_id, token_hash, jti, expires_at, revoked_at, replaced_by_token_id, created_at, user_agent, ip_origen
    FROM refresh_tokens
    WHERE jti = $1
  `;
  return dbConnection.oneOrNone(sql, [jti]);
}

export async function findByTokenHash(tokenHash) {
  const sql = `
    SELECT refresh_token_id, usuario_id, token_hash, jti, expires_at, revoked_at, replaced_by_token_id, created_at, user_agent, ip_origen
    FROM refresh_tokens
    WHERE token_hash = $1
  `;
  return dbConnection.oneOrNone(sql, [tokenHash]);
}

export async function findValidByJti(jti) {
  const sql = `
    SELECT refresh_token_id, usuario_id, token_hash, jti, expires_at, revoked_at, replaced_by_token_id, created_at, user_agent, ip_origen
    FROM refresh_tokens
    WHERE jti = $1 AND revoked_at IS NULL AND expires_at > NOW()
  `;
  return dbConnection.oneOrNone(sql, [jti]);
}

export async function revokeByJti(jti) {
  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE jti = $1 AND revoked_at IS NULL
    RETURNING refresh_token_id
  `;
  return dbConnection.oneOrNone(sql, [jti]);
}

export async function markReplaced(oldJti, newJti) {
  const sql = `
    UPDATE refresh_tokens
    SET replaced_by_token_id = (SELECT refresh_token_id FROM refresh_tokens WHERE jti = $2)
    WHERE jti = $1
    RETURNING refresh_token_id
  `;
  return dbConnection.oneOrNone(sql, [oldJti, newJti]);
}

export async function revokeAllUserTokens(userId) {
  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE usuario_id = $1 AND revoked_at IS NULL
    RETURNING refresh_token_id
  `;
  return dbConnection.any(sql, [userId]);
}

export async function cleanupExpired() {
  const sql = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() - INTERVAL '30 days'
  `;
  return dbConnection.result(sql);
}

export async function getActiveTokensByUser(userId) {
  const sql = `
    SELECT refresh_token_id, jti, expires_at, created_at, user_agent, ip_origen
    FROM refresh_tokens
    WHERE usuario_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
    ORDER BY created_at DESC
  `;
  return dbConnection.any(sql, [userId]);
}