import 'dotenv/config';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { dbConnection } from '../src/config/database.js';
import { asignarRol } from '../src/repositories/adminUserRepository.js';
import { googleAuthCallback } from '../src/controllers/googleAuthController.js';
import app from '../app.js';

const TEST_EMAIL = 'rubenclemente221@gmail.com';
const ADMIN_EMAIL = 'admin@unach.mx';
const TEST_AGENT = 'gesthor-auth-real-test';
const userPassword = process.env.AUTH_TEST_USER_PASSWORD;
const adminPassword = process.env.AUTH_TEST_ADMIN_PASSWORD;
const jtis = new Map();
let userId;
let adminId;
let roleIds;

function remember(token) {
  const claims = jwt.decode(token);
  if (claims?.jti && claims?.sub) jtis.set(claims.jti, Number(claims.sub));
  return claims;
}

async function login(email, password) {
  const res = await request(app).post('/api/auth/login').set('User-Agent', TEST_AGENT).send({ email, password });
  assert.equal(res.status, 200, `Login falló para ${email}: ${res.status}`);
  const { accessToken, refreshToken } = res.body.data;
  assert.equal(jwt.decode(accessToken, { complete: true }).header.alg, 'RS256');
  assert.equal(jwt.decode(refreshToken, { complete: true }).header.alg, 'HS256');
  remember(accessToken);
  remember(refreshToken);
  return { accessToken, refreshToken };
}

async function me(token, expectedStatus = 200) {
  const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, expectedStatus);
  return res;
}

async function changeRole(adminToken, roleName, oldToken) {
  const res = await request(app)
    .put(`/api/admin/usuarios/${userId}/rol`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ rolId: roleIds[roleName] });
  assert.equal(res.status, 200, `No se asignó el rol ${roleName}: ${res.status}`);
  await me(oldToken, 401);
}

async function preflight() {
  const db = await dbConnection.one('SELECT current_database() AS name');
  assert.equal(db.name, 'GestHor', 'Esta prueba solo se permite en GestHor');
  assert.ok(userPassword && adminPassword, 'Faltan AUTH_TEST_USER_PASSWORD y AUTH_TEST_ADMIN_PASSWORD');
  const users = await dbConnection.any(
    `SELECT u.usuario_id, u.email, u.activo, r.nombre_rol
     FROM usuarios u JOIN roles r ON r.rol_id=u.rol_id
     WHERE lower(u.email) IN (lower($1), lower($2))`,
    [TEST_EMAIL, ADMIN_EMAIL],
  );
  const user = users.find(row => row.email.toLowerCase() === TEST_EMAIL);
  const admin = users.find(row => row.email.toLowerCase() === ADMIN_EMAIL);
  assert.ok(user?.activo && user.nombre_rol === 'profesor', 'La cuenta de prueba debe iniciar como profesor activo');
  assert.ok(admin?.activo && admin.nombre_rol === 'administrador', 'Falta el administrador esperado');
  userId = user.usuario_id;
  adminId = admin.usuario_id;
  const professor = await dbConnection.oneOrNone('SELECT profesor_id FROM profesores WHERE profesor_id=$1', [userId]);
  assert.ok(professor, 'La cuenta de prueba no tiene perfil docente');
  roleIds = Object.fromEntries((await dbConnection.any(
    "SELECT rol_id,nombre_rol FROM roles WHERE activo=TRUE AND nombre_rol IN ('profesor','editor','estudiante')",
  )).map(row => [row.nombre_rol, row.rol_id]));
  assert.equal(Object.keys(roleIds).length, 3);
}

async function simulatedGoogleCallback() {
  let location;
  await googleAuthCallback(
    { user: { email: TEST_EMAIL, emailVerified: true }, ip: '127.0.0.1', headers: { 'user-agent': TEST_AGENT } },
    { redirect(value) { location = value; } },
  );
  assert.ok(location?.includes('/auth/callback?'), 'El callback de Google no emitió tokens');
  const token = new URL(location).searchParams.get('token');
  const refreshToken = new URL(location).searchParams.get('refreshToken');
  assert.equal(jwt.decode(token, { complete: true }).header.alg, 'RS256');
  remember(token);
  remember(refreshToken);
  await me(token);
}

async function cleanup() {
  if (!userId || !adminId) return;
  const current = await dbConnection.oneOrNone('SELECT rol_id FROM usuarios WHERE usuario_id=$1', [userId]);
  if (current && Number(current.rol_id) !== Number(roleIds.profesor)) {
    const result = await asignarRol({ usuarioId: userId, rolId: roleIds.profesor, actorId: adminId });
    assert.equal(result.nombreRol, 'profesor', 'No se pudo restaurar el rol profesor');
  }
  for (const [jti, subject] of jtis) {
    await dbConnection.none(
      "UPDATE user_sessions SET status='revoked',revoked_at=now() WHERE usuario_id=$1 AND (access_jti=$2::uuid OR refresh_jti=$2::uuid) AND status='active'",
      [subject, jti],
    );
    await dbConnection.none(
      'UPDATE refresh_tokens SET revoked_at=now() WHERE usuario_id=$1 AND jti=$2::uuid AND revoked_at IS NULL',
      [subject, jti],
    );
  }
  const final = await dbConnection.one(
    'SELECT r.nombre_rol,(p.profesor_id IS NOT NULL) AS has_professor FROM usuarios u JOIN roles r ON r.rol_id=u.rol_id LEFT JOIN profesores p ON p.profesor_id=u.usuario_id WHERE u.usuario_id=$1',
    [userId],
  );
  assert.equal(final.nombre_rol, 'profesor');
  assert.equal(final.has_professor, true);
}

let failed = false;
try {
  await preflight();
  let user = await login(TEST_EMAIL, userPassword);
  const admin = await login(ADMIN_EMAIL, adminPassword);
  assert.equal((await me(user.accessToken)).body.data.usuario.email.toLowerCase(), TEST_EMAIL);

  const before = await dbConnection.one("SELECT count(*)::int AS n FROM user_sessions WHERE usuario_id=$1 AND status='active'", [userId]);
  const wrong = await request(app).post('/api/auth/login').set('User-Agent', TEST_AGENT).send({ email: TEST_EMAIL, password: `${userPassword}incorrecta` });
  assert.equal(wrong.status, 401);
  const after = await dbConnection.one("SELECT count(*)::int AS n FROM user_sessions WHERE usuario_id=$1 AND status='active'", [userId]);
  assert.equal(after.n, before.n);
  const parts = user.accessToken.split('.');
  parts[2] = `${parts[2].slice(0, -1)}${parts[2].endsWith('a') ? 'b' : 'a'}`;
  await me(parts.join('.'), 401);

  const forbiddenRoleChange = await request(app).put(`/api/admin/usuarios/${userId}/rol`)
    .set('Authorization', `Bearer ${user.accessToken}`).send({ rolId: roleIds.editor });
  assert.equal(forbiddenRoleChange.status, 403);

  await simulatedGoogleCallback();
  for (const role of ['editor', 'estudiante', 'profesor']) {
    await changeRole(admin.accessToken, role, user.accessToken);
    user = await login(TEST_EMAIL, userPassword);
    const profile = await me(user.accessToken);
    assert.equal(profile.body.data.usuario.rol, role);
    const permissions = await request(app).get('/api/auth/permisos').set('Authorization', `Bearer ${user.accessToken}`);
    assert.equal(permissions.status, 200);
    assert.equal(permissions.body.data.rol, role);
    assert.ok(permissions.body.data.permisos.includes('materias:leer'));
    assert.equal(permissions.body.data.permisos.includes('materias:editar'), role === 'editor');
  }

  const refreshed = await request(app).post('/api/auth/refresh').set('User-Agent', TEST_AGENT).send({ refreshToken: user.refreshToken });
  assert.equal(refreshed.status, 200);
  const newAccess = refreshed.body.data.accessToken;
  remember(newAccess);
  remember(refreshed.body.data.refreshToken);
  assert.equal(jwt.decode(newAccess, { complete: true }).header.alg, 'RS256');
  await me(newAccess);
  const logout = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${newAccess}`).send({});
  assert.equal(logout.status, 200);
  await me(newAccess, 401);
  const afterLogoutRefresh = await request(app).post('/api/auth/refresh')
    .send({ refreshToken: refreshed.body.data.refreshToken });
  assert.equal(afterLogoutRefresh.status, 401);
  console.log('Autenticación real: login, fallos, Google simulado, roles, refresh y logout correctos.');
} catch (error) {
  failed = true;
  console.error('Falló la validación real:', error.message);
} finally {
  try { await cleanup(); } catch (error) { failed = true; console.error('Falló la restauración:', error.message); }
  await dbConnection.$pool.end();
}
if (failed) process.exitCode = 1;
