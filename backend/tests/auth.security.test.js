import { afterAll, describe, expect, it } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app.js';
import { dbConnection } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { jwtConfig } from '../src/config/jwt.js';
import { issueAccessToken, issueRefreshToken } from '../src/services/tokenService.js';

afterAll(async () => {
  await dbConnection.$pool.end();
});

describe('seguridad HTTP de autenticación RS256', () => {
  const api = () => request(app);

  it('emite access con claims y algoritmo RS256; refresh conserva HS256', () => {
    const user = { usuario_id: 123, email: 'ficticio@example.test', nombre_rol: 'profesor' };
    const access = issueAccessToken(user).token;
    const refresh = issueRefreshToken(user).token;
    const complete = jwt.decode(access, { complete: true });
    expect(complete.header.alg).toBe('RS256');
    expect(jwt.decode(refresh, { complete: true }).header.alg).toBe('HS256');
    expect(complete.payload).toMatchObject({
      sub: 123,
      email: user.email,
      rol: 'profesor',
      type: 'access',
      iss: jwtConfig.issuer,
      aud: jwtConfig.audience,
    });
    expect(complete.payload.jti).toBeDefined();
    expect(complete.payload.exp).toBeGreaterThan(complete.payload.iat);
  });

  it('rechaza un acceso sin Authorization', async () => {
    const response = await api().get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.ok).toBe(false);
  });

  it('rechaza tokens HS256 usados como access', async () => {
    const token = jwt.sign(
      { sub: '123', type: 'access', jti: 'test-jti' },
      'secret-incorrecto',
      { algorithm: 'HS256', issuer: jwtConfig.issuer, audience: jwtConfig.audience },
    );
    const response = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('rechaza firmas alteradas y tokens malformados', async () => {
    const token = issueAccessToken({ usuario_id: 123, email: 'ficticio@example.test', nombre_rol: 'profesor' }).token;
    const parts = token.split('.');
    parts[2] = `${parts[2].slice(0, -1)}${parts[2].endsWith('a') ? 'b' : 'a'}`;
    for (const invalid of [parts.join('.'), 'token.invalido.aqui']) {
      const response = await api().get('/api/auth/me').set('Authorization', `Bearer ${invalid}`);
      expect(response.status).toBe(401);
    }
  });

  it('distingue un token RS256 expirado', async () => {
    const token = jwt.sign(
      { sub: '123', type: 'access', jti: 'expired-test-jti' },
      jwtConfig.accessPrivateKey,
      { algorithm: 'RS256', expiresIn: -1, issuer: jwtConfig.issuer, audience: jwtConfig.audience },
    );
    const response = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
    expect(response.body.message.toLowerCase()).toMatch(/expirado/);
  });

  it('no expone detalles internos en una respuesta 401', async () => {
    const response = await api().get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(JSON.stringify(response.body)).not.toMatch(/node_modules|password_hash|pg_|\bat\s+\w+\s*\(/i);
  });

  it('mantiene health y 404', async () => {
    expect((await api().get('/api')).status).toBe(200);
    const missing = await api().get('/api/ruta/que/no/existe');
    expect(missing.status).toBe(404);
    expect(missing.body.code).toBe('NOT_FOUND');
  });

  it('permite el origen configurado y credenciales CORS', async () => {
    const response = await api().options('/api/auth/login')
      .set('Origin', env.frontend.url)
      .set('Access-Control-Request-Method', 'POST');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    expect(response.headers['access-control-allow-origin']).toBe(env.frontend.url);
  });
});
