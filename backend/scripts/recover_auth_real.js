import 'dotenv/config';
import assert from 'node:assert/strict';
import { dbConnection } from '../src/config/database.js';
import { asignarRol } from '../src/repositories/adminUserRepository.js';

try {
  assert.equal(process.env.DB_NAME, 'GestHor');
  assert.equal(process.env.AUTH_TEST_RECOVER, '1', 'Establece AUTH_TEST_RECOVER=1 para restaurar el rol');
  const user = await dbConnection.one(
    'SELECT usuario_id FROM usuarios WHERE lower(email)=lower($1)',
    ['rubenclemente221@gmail.com'],
  );
  const admin = await dbConnection.one(
    'SELECT usuario_id FROM usuarios WHERE email=$1',
    ['admin@unach.mx'],
  );
  const role = await dbConnection.one(
    "SELECT rol_id FROM roles WHERE nombre_rol='profesor' AND activo=TRUE",
  );
  const result = await asignarRol({ usuarioId: user.usuario_id, rolId: role.rol_id, actorId: admin.usuario_id });
  assert.ok(!result.error, 'No se pudo restaurar el rol');
  await dbConnection.none(
    "UPDATE refresh_tokens SET revoked_at=now() WHERE usuario_id IN ($1,$2) AND jti IN (SELECT refresh_jti FROM user_sessions WHERE usuario_id IN ($1,$2) AND user_agent='gesthor-auth-real-test') AND revoked_at IS NULL",
    [user.usuario_id, admin.usuario_id],
  );
  await dbConnection.none(
    "UPDATE user_sessions SET status='revoked',revoked_at=now() WHERE usuario_id IN ($1,$2) AND user_agent='gesthor-auth-real-test' AND status='active'",
    [user.usuario_id, admin.usuario_id],
  );
  console.log('Rol profesor restaurado; sesiones de la cuenta revocadas si hubo cambio.');
} catch (error) {
  console.error('No se pudo restaurar la cuenta:', error.message);
  process.exitCode = 1;
} finally {
  await dbConnection.$pool.end();
}
