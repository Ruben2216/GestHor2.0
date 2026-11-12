import { randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

dotenv.config();

const sharedDatabase = process.env.SHARED_DB_NAME || 'GestHor_Practica_Compartida';
const testPassword = process.env.PRACTICE_TEST_PASSWORD;
const testSuffix = randomUUID().replaceAll('-', '');
const emails = [
  `practice-admin-${testSuffix}@example.test`,
  `practice-professor-${testSuffix}@example.test`,
];

process.env.DB_NAME = sharedDatabase;
process.env.APP_ENCRYPTION_KEY_B64 ??= randomBytes(32).toString('base64');

let dbConnection;
let app;
let login;
let professorId;
let adminId;
let professorSession;
let adminSession;
const userIds = [];

async function createApiSessions() {
  const [adminRole, professorRole] = await Promise.all([
    dbConnection.one("SELECT rol_id FROM roles WHERE nombre_rol = 'administrador' AND activo = TRUE"),
    dbConnection.one("SELECT rol_id FROM roles WHERE nombre_rol = 'profesor' AND activo = TRUE"),
  ]);
  const passwordHash = await bcrypt.hash(testPassword, 10);

  const admin = await dbConnection.one(`
    INSERT INTO usuarios (email, password, password_hash, nombre, rol_id, activo, email_verificado)
    VALUES ($1, $2, $2, 'Administrador de prueba', $3, TRUE, TRUE)
    RETURNING usuario_id
  `, [emails[0], passwordHash, adminRole.rol_id]);
  adminId = admin.usuario_id;
  userIds.push(adminId);

  const professor = await dbConnection.one(`
    INSERT INTO usuarios (email, password, password_hash, nombre, rol_id, activo, email_verificado)
    VALUES ($1, $2, $2, 'Profesor de prueba', $3, TRUE, TRUE)
    RETURNING usuario_id
  `, [emails[1], passwordHash, professorRole.rol_id]);
  professorId = professor.usuario_id;
  userIds.push(professorId);

  await dbConnection.none(`
    INSERT INTO profesores (profesor_id, nombres, apellidos, matricula, email)
    VALUES ($1, 'Profesor', 'Integración', $2, $3)
  `, [professorId, `PREF-${testSuffix.slice(0, 12)}`, emails[1]]);

  professorSession = await login(emails[1], testPassword, '127.0.0.1', 'jest-preferences');
  adminSession = await login(emails[0], testPassword, '127.0.0.1', 'jest-preferences');
}

function expectEncryptedValue(value, plaintext) {
  expect(value).toMatch(/^v1:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]*$/i);
  if (plaintext) {
    expect(value).not.toContain(plaintext);
  }
}

describe('cifrado de comentarios de preferencias con PostgreSQL', () => {
  beforeAll(async () => {
    if (!testPassword || testPassword.length < 16) {
      throw new Error('Configura PRACTICE_TEST_PASSWORD con al menos 16 caracteres para las pruebas de integración.');
    }

    ({ dbConnection } = await import('../src/config/database.js'));
    const database = await dbConnection.one('SELECT current_database() AS name');
    if (database.name !== sharedDatabase) {
      throw new Error(`Las pruebas requieren la BD ${sharedDatabase}; la conexión seleccionó otra base.`);
    }

    ({ default: app } = await import('../app.js'));
    ({ login } = await import('../src/services/authService.js'));
    await createApiSessions();
  }, 30000);

  afterAll(async () => {
    if (dbConnection) {
      if (userIds.length > 0) {
        await dbConnection.tx(async transaction => {
          await transaction.none(
            'DELETE FROM auditoria WHERE usuario_id = ANY($1::int[]) OR email = ANY($2::text[])',
            [userIds, emails],
          );
          await transaction.none(
            'DELETE FROM profesor_preferencias WHERE profesor_id = $1',
            [professorId],
          );
          await transaction.none(
            'DELETE FROM profesores WHERE profesor_id = $1',
            [professorId],
          );
          await transaction.none(
            'DELETE FROM usuarios WHERE usuario_id = ANY($1::int[])',
            [userIds],
          );
        });
      }
      await dbConnection.$pool.end();
    }
  });

  it('responde texto legible al guardar y solo conserva ciphertext en PostgreSQL', async () => {
    const comment = `Comentario inicial ${testSuffix}`;
    const response = await request(app)
      .post(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .send({ maxHorasDia: 6, preferencia: 'Matutino', comentarios: comment });

    expect(response.status).toBe(200);
    expect(response.body.preferencias.comentarios_adicionales).toBe(comment);

    const stored = await dbConnection.one(
      'SELECT comentarios_adicionales FROM profesor_preferencias WHERE profesor_id = $1',
      [professorId],
    );
    expectEncryptedValue(stored.comentarios_adicionales, comment);
  });

  it('devuelve el comentario legible al consultar preferencias y al consultar el perfil del profesor', async () => {
    const comment = `Comentario para las vistas ${testSuffix}`;
    await request(app)
      .post(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .send({ maxHorasDia: 7, preferencia: 'Mixto', comentarios: comment })
      .expect(200);

    const professorView = await request(app)
      .get(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .expect(200);
    expect(professorView.body.preferencias.comentarios_adicionales).toBe(comment);

    const adminView = await request(app)
      .get(`/api/profesores/${professorId}/info-horarios`)
      .set('Authorization', `Bearer ${adminSession.accessToken}`)
      .expect(200);
    expect(adminView.body.data.preferencias.comentarios_adicionales).toBe(comment);
  });

  it('actualiza el ciphertext y conserva texto legible en la respuesta inmediata', async () => {
    const original = `Antes de actualizar ${testSuffix}`;
    const updated = `Comentario actualizado ${testSuffix}`;

    await request(app)
      .post(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .send({ maxHorasDia: 5, preferencia: 'Vespertino', comentarios: original })
      .expect(200);
    const before = await dbConnection.one(
      'SELECT comentarios_adicionales FROM profesor_preferencias WHERE profesor_id = $1',
      [professorId],
    );

    const response = await request(app)
      .post(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .send({ maxHorasDia: 5, preferencia: 'Vespertino', comentarios: updated })
      .expect(200);
    expect(response.body.preferencias.comentarios_adicionales).toBe(updated);

    const after = await dbConnection.one(
      'SELECT comentarios_adicionales FROM profesor_preferencias WHERE profesor_id = $1',
      [professorId],
    );
    expectEncryptedValue(after.comentarios_adicionales, updated);
    expect(after.comentarios_adicionales).not.toBe(before.comentarios_adicionales);
  });

  it('cifra y recupera correctamente un comentario vacío', async () => {
    const response = await request(app)
      .post(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .send({ maxHorasDia: 8, preferencia: 'Mixto', comentarios: '' })
      .expect(200);

    expect(response.body.preferencias.comentarios_adicionales).toBe('');
    const stored = await dbConnection.one(
      'SELECT comentarios_adicionales FROM profesor_preferencias WHERE profesor_id = $1',
      [professorId],
    );
    expectEncryptedValue(stored.comentarios_adicionales, '');

    const read = await request(app)
      .get(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .expect(200);
    expect(read.body.preferencias.comentarios_adicionales).toBe('');
  });

  it('mantiene los permisos de acceso del profesor y del administrador', async () => {
    await request(app)
      .get(`/api/preferencias/${professorId + 100000}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .expect(403);

    await request(app)
      .get(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${adminSession.accessToken}`)
      .expect(200);
  });

  it('trata un ciphertext dañado como un error de lectura', async () => {
    await dbConnection.none(
      `UPDATE profesor_preferencias
       SET comentarios_adicionales = 'v1:invalido'
       WHERE profesor_id = $1`,
      [professorId],
    );

    await request(app)
      .get(`/api/preferencias/${professorId}`)
      .set('Authorization', `Bearer ${professorSession.accessToken}`)
      .expect(500);
  });
});
