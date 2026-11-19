import { dbConnection } from '../config/database.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

const MAX_ATTEMPTS = AUTH_CONSTANTS.RECOVERY_CODE.MAX_ATTEMPTS;

export async function saveCode({ userId, codeHash, expiresAt }) {
  return dbConnection.tx(async (transaction) => {
    await transaction.one(
      'SELECT usuario_id FROM usuarios WHERE usuario_id = $1 FOR UPDATE',
      [userId]
    );
    await transaction.none(
      'UPDATE codigos_2fa SET usado = TRUE WHERE usuario_id = $1 AND usado = FALSE',
      [userId]
    );
    return transaction.one(
      `INSERT INTO codigos_2fa (usuario_id, codigo_hash, fecha_expiracion)
       VALUES ($1, $2, $3)
       RETURNING codigo_2fa_id`,
      [userId, codeHash, expiresAt]
    );
  });
}

export async function findCurrentCodeForUpdate(transaction, userId) {
  return transaction.oneOrNone(
    `SELECT codigo_2fa_id, codigo_hash
     FROM codigos_2fa
     WHERE usuario_id = $1
       AND usado = FALSE
       AND intentos < $2
       AND fecha_expiracion > NOW()
     ORDER BY fecha_creacion DESC
     LIMIT 1
     FOR UPDATE`,
    [userId, MAX_ATTEMPTS]
  );
}

export async function incrementFailedAttempts(transaction, codeId) {
  return transaction.none(
    `UPDATE codigos_2fa
     SET intentos = intentos + 1,
         usado = (intentos + 1 >= $2)
     WHERE codigo_2fa_id = $1 AND usado = FALSE`,
    [codeId, MAX_ATTEMPTS]
  );
}

export async function markUsed(transaction, codeId) {
  return transaction.oneOrNone(
    `UPDATE codigos_2fa
     SET usado = TRUE
     WHERE codigo_2fa_id = $1
       AND usado = FALSE
       AND intentos < $2
       AND fecha_expiracion > NOW()
     RETURNING codigo_2fa_id`,
    [codeId, MAX_ATTEMPTS]
  );
}

export async function invalidateCode(codeId) {
  return dbConnection.none(
    'UPDATE codigos_2fa SET usado = TRUE WHERE codigo_2fa_id = $1 AND usado = FALSE',
    [codeId]
  );
}
