import { dbConnection } from '../config/database.js';

export async function saveResetToken({ userId, tokenHash, expiresAt }) {
  const sql = `
    INSERT INTO password_reset_tokens (usuario_id, token_hash, expires_at, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING reset_token_id, usuario_id, token_hash, expires_at, used_at, revoked, created_at
  `;
  return dbConnection.one(sql, [userId, tokenHash, expiresAt]);
}

export async function findTokenByHash(tokenHash) {
  const sql = `
    SELECT reset_token_id, usuario_id, token_hash, expires_at, used_at, revoked, created_at
    FROM password_reset_tokens
    WHERE token_hash = $1
  `;
  return dbConnection.oneOrNone(sql, [tokenHash]);
}

export async function findValidTokenByHash(tokenHash) {
  const sql = `
    SELECT reset_token_id, usuario_id, token_hash, expires_at, used_at, revoked, created_at
    FROM password_reset_tokens
    WHERE token_hash = $1 AND revoked = FALSE AND used_at IS NULL AND expires_at > NOW()
  `;
  return dbConnection.oneOrNone(sql, [tokenHash]);
}

export async function markUsed(tokenId) {
  const sql = `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE reset_token_id = $1
    RETURNING reset_token_id
  `;
  return dbConnection.oneOrNone(sql, [tokenId]);
}

export async function revokeToken(tokenId) {
  const sql = `
    UPDATE password_reset_tokens
    SET revoked = TRUE
    WHERE reset_token_id = $1
    RETURNING reset_token_id
  `;
  return dbConnection.oneOrNone(sql, [tokenId]);
}

export async function revokeUserTokens(userId) {
  const sql = `
    UPDATE password_reset_tokens
    SET revoked = TRUE
    WHERE usuario_id = $1 AND revoked = FALSE
  `;
  return dbConnection.result(sql, [userId]);
}

export async function cleanupExpired() {
  const sql = `
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW() - INTERVAL '7 days'
  `;
  return dbConnection.result(sql);
}