import { describe, expect, it } from '@jest/globals';
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const envUrl = pathToFileURL(resolve('src/config/env.js')).href;
const jwtUrl = pathToFileURL(resolve('src/config/jwt.js')).href;
const pair = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
const base = {
  PATH: process.env.PATH,
  NODE_ENV: 'test',
  APP_ENCRYPTION_KEY_B64: randomBytes(32).toString('base64'),
  JWT_ACCESS_PRIVATE_KEY_B64: Buffer.from(pair.privateKey).toString('base64'),
  JWT_ACCESS_PUBLIC_KEY_B64: Buffer.from(pair.publicKey).toString('base64'),
  JWT_REFRESH_SECRET: 'test-refresh-secret-long-enough',
  SESSION_SECRET: 'test-session-secret-long-enough',
};

function probe(moduleUrl, extraEnv = {}) {
  return spawnSync(process.execPath, ['--input-type=module', '-e',
    `import("${moduleUrl}").then(m => { if (m.validateSecurityConfig) m.validateSecurityConfig(); console.log("OK"); }).catch(e => { console.error(e.message); process.exitCode=1; })`,
  ], { cwd: tmpdir(), env: { ...base, ...extraEnv }, encoding: 'utf8' });
}

describe('configuración de autenticación', () => {
  it('arranca sin JWT_SECRET con claves AES y RSA válidas', () => {
    expect(probe(jwtUrl, { JWT_SECRET: '' }).status).toBe(0);
    expect(probe(envUrl, { JWT_SECRET: '' }).status).toBe(0);
  });
  it('rechaza AES ausente o inválida', () => {
    expect(probe(envUrl, { APP_ENCRYPTION_KEY_B64: '' }).status).not.toBe(0);
    expect(probe(envUrl, { APP_ENCRYPTION_KEY_B64: 'invalida' }).status).not.toBe(0);
  });
  it('rechaza RSA ausente o inválida al cargar JWT', () => {
    expect(probe(jwtUrl, { JWT_ACCESS_PRIVATE_KEY_B64: '' }).status).not.toBe(0);
    expect(probe(jwtUrl, { JWT_ACCESS_PUBLIC_KEY_B64: 'invalida' }).status).not.toBe(0);
  });
});
