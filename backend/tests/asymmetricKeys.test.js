import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { generateKeyPairSync, createSign, createVerify } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// Pruebas de carga y validación del par RSA

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULE_PATH = path.resolve(__dirname, '../src/config/asymmetricKeys.js');

const PRIV = 'JWT_ACCESS_PRIVATE_KEY_B64';
const PUB = 'JWT_ACCESS_PUBLIC_KEY_B64';

const toB64 = (pem) => Buffer.from(pem, 'utf8').toString('base64');

function newPair(bits = 2048) {
  return generateKeyPairSync('rsa', {
    modulusLength: bits,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

function envFor(pair) {
  return { [PRIV]: toB64(pair.privateKey), [PUB]: toB64(pair.publicKey) };
}

/** Comprueba que un mensaje de error no contiene ninguna parte de las claves. */
function expectNoKeyLeak(message, env) {
  for (const value of Object.values(env)) {
    if (!value) continue;
    const pem = Buffer.from(value, 'base64').toString('utf8');
    // Se busca un fragmento del cuerpo de la clave, tanto en Base64 como en PEM
    const pemBody = pem.split('\n').find((l) => l && !l.startsWith('-----')) ?? '';
    expect(message).not.toContain(value.slice(0, 40));
    if (pemBody) expect(message).not.toContain(pemBody.slice(0, 40));
  }
  expect(message).not.toMatch(/BEGIN .*KEY/);
}

/**
 * Importa el módulo en un proceso Node separado, con el entorno indicado y
 * sin .env (cwd temporal), para comprobar el comportamiento real al iniciar.
 */
function importInChildProcess(extraEnv) {
  const code = `
    import(${JSON.stringify(pathToFileURL(MODULE_PATH).href)})
      .then((m) => { console.log('OK:' + typeof m.accessPrivateKey + ':' + typeof m.accessPublicKey); })
      .catch((e) => { console.error(e.name + ':' + e.code + ':' + e.message); process.exit(1); });
  `;
  const env = { PATH: process.env.PATH, [PRIV]: '', [PUB]: '', ...extraEnv };
  return spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd: tmpdir(),
    env,
    encoding: 'utf8',
  });
}

let loadAccessKeyPair;
let AsymmetricKeyConfigError;
let validPair;
let validEnv;
const originalEnv = { [PRIV]: process.env[PRIV], [PUB]: process.env[PUB] };

beforeAll(async () => {
  validPair = newPair(2048);
  validEnv = envFor(validPair);

  // El módulo valida al cargarse, así que se importa con un par válido
  process.env[PRIV] = validEnv[PRIV];
  process.env[PUB] = validEnv[PUB];
  const mod = await import('../src/config/asymmetricKeys.js');
  loadAccessKeyPair = mod.loadAccessKeyPair;
  AsymmetricKeyConfigError = mod.AsymmetricKeyConfigError;
});

afterAll(() => {
  for (const [k, v] of Object.entries(originalEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe('Integrante 3: asymmetricKeys - carga y validación del par RSA', () => {
  describe('1. Par válido aceptado', () => {
    it('acepta un par RSA de 2048 bits y devuelve las claves en PEM', () => {
      const keys = loadAccessKeyPair(validEnv);

      expect(keys.modulusLength).toBe(2048);
      expect(keys.accessPrivateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(keys.accessPublicKey).toContain('-----BEGIN PUBLIC KEY-----');
    });

    it('las claves devueltas firman y verifican entre sí', () => {
      const { accessPrivateKey, accessPublicKey } = loadAccessKeyPair(validEnv);
      const data = 'GestHor2.0';
      const sig = createSign('RSA-SHA256').update(data).sign(accessPrivateKey);

      expect(createVerify('RSA-SHA256').update(data).verify(accessPublicKey, sig)).toBe(true);
    });

    it('acepta claves mayores (4096 bits)', () => {
      const keys = loadAccessKeyPair(envFor(newPair(4096)));
      expect(keys.modulusLength).toBe(4096);
    });

    it('tolera saltos de línea accidentales al pegar el Base64', () => {
      const wrapped = {
        [PRIV]: validEnv[PRIV].replace(/(.{64})/g, '$1\n'),
        [PUB]: validEnv[PUB].replace(/(.{64})/g, '$1\n'),
      };
      expect(() => loadAccessKeyPair(wrapped)).not.toThrow();
    });

    it('el módulo expone accessPrivateKey, accessPublicKey y sus getters', async () => {
      const mod = await import('../src/config/asymmetricKeys.js');

      expect(mod.accessPrivateKey).toContain('PRIVATE KEY');
      expect(mod.accessPublicKey).toContain('PUBLIC KEY');
      expect(mod.getAccessPrivateKey()).toBe(mod.accessPrivateKey);
      expect(mod.getAccessPublicKey()).toBe(mod.accessPublicKey);
    });

    it('el módulo se carga correctamente en un proceso nuevo con claves válidas', () => {
      const result = importInChildProcess(validEnv);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('OK:string:string');
    });
  });

  describe('2. Privada o pública ausente rechazada', () => {
    it('rechaza cuando falta la clave privada', () => {
      expect(() => loadAccessKeyPair({ [PUB]: validEnv[PUB] })).toThrow(AsymmetricKeyConfigError);
      expect(() => loadAccessKeyPair({ [PUB]: validEnv[PUB] })).toThrow(PRIV);
    });

    it('rechaza cuando falta la clave pública', () => {
      expect(() => loadAccessKeyPair({ [PRIV]: validEnv[PRIV] })).toThrow(AsymmetricKeyConfigError);
      expect(() => loadAccessKeyPair({ [PRIV]: validEnv[PRIV] })).toThrow(PUB);
    });

    it('rechaza variables vacías o solo con espacios', () => {
      expect(() => loadAccessKeyPair({ [PRIV]: '', [PUB]: validEnv[PUB] })).toThrow(/no está configurada/);
      expect(() => loadAccessKeyPair({ [PRIV]: validEnv[PRIV], [PUB]: '   ' })).toThrow(/no está configurada/);
    });

    it('el módulo falla al iniciar (proceso nuevo) si faltan las claves', () => {
      const result = importInChildProcess({});

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('AsymmetricKeyConfigError:KEY_MISSING');
    });
  });

  describe('3. PEM dañado rechazado', () => {
    it('rechaza texto que no es Base64', () => {
      const env = { [PRIV]: 'esto no es base64!!', [PUB]: validEnv[PUB] };
      expect(() => loadAccessKeyPair(env)).toThrow(/Base64 válido/);
    });

    it('rechaza Base64 válido que no contiene un PEM', () => {
      const env = { [PRIV]: toB64('hola mundo'), [PUB]: validEnv[PUB] };
      expect(() => loadAccessKeyPair(env)).toThrow(/formato PEM/);
    });

    it('rechaza un PEM privado con el contenido corrupto', () => {
      const lines = validPair.privateKey.split('\n');
      lines[3] = 'A'.repeat(lines[3].length); // se daña una línea del cuerpo
      lines[4] = lines[4].slice(0, 10);       // y se trunca otra
      const env = { [PRIV]: toB64(lines.join('\n')), [PUB]: validEnv[PUB] };

      expect(() => loadAccessKeyPair(env)).toThrow(AsymmetricKeyConfigError);
    });

    it('rechaza un PEM público truncado', () => {
      const truncated = validPair.publicKey.slice(0, 80) + '\n-----END PUBLIC KEY-----\n';
      const env = { [PRIV]: validEnv[PRIV], [PUB]: toB64(truncated) };

      expect(() => loadAccessKeyPair(env)).toThrow(/dañada|no es una clave pública/);
    });

    it('rechaza una clave privada colocada en la variable pública', () => {
      const env = { [PRIV]: validEnv[PRIV], [PUB]: validEnv[PRIV] };
      expect(() => loadAccessKeyPair(env)).toThrow(/contiene una clave privada/);
    });

    it('rechaza claves que no son RSA (por ejemplo EC)', () => {
      const ec = generateKeyPairSync('ec', {
        namedCurve: 'P-256',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      expect(() => loadAccessKeyPair(envFor(ec))).toThrow(/no es de tipo RSA/);
    });
  });

  describe('4. Claves de pares diferentes rechazadas', () => {
    it('rechaza una pública que no corresponde a la privada', () => {
      const other = newPair(2048);
      const env = { [PRIV]: validEnv[PRIV], [PUB]: toB64(other.publicKey) };

      let error;
      try { loadAccessKeyPair(env); } catch (e) { error = e; }

      expect(error).toBeInstanceOf(AsymmetricKeyConfigError);
      expect(error.code).toBe('KEY_PAIR_MISMATCH');
    });
  });

  describe('5. Clave demasiado pequeña rechazada', () => {
    it('rechaza un par RSA de 1024 bits', () => {
      let error;
      try { loadAccessKeyPair(envFor(newPair(1024))); } catch (e) { error = e; }

      expect(error).toBeInstanceOf(AsymmetricKeyConfigError);
      expect(error.code).toBe('KEY_TOO_SMALL');
      expect(error.message).toMatch(/1024 bits.*2048/);
    });
  });

  describe('6. La configuración no revela claves en mensajes de error', () => {
    const casos = () => {
      const other = newPair(2048);
      const small = newPair(1024);
      const corrupt = validPair.privateKey.replace(/\n[A-Za-z0-9+/]{20}/, '\n' + '#'.repeat(20));
      return [
        ['par distinto', { [PRIV]: validEnv[PRIV], [PUB]: toB64(other.publicKey) }],
        ['clave pequeña', envFor(small)],
        ['privada en variable pública', { [PRIV]: validEnv[PRIV], [PUB]: validEnv[PRIV] }],
        ['PEM corrupto', { [PRIV]: toB64(corrupt), [PUB]: validEnv[PUB] }],
        ['pública ausente', { [PRIV]: validEnv[PRIV] }],
      ];
    };

    it('ningún error incluye el Base64 ni el contenido PEM de las claves', () => {
      for (const [, env] of casos()) {
        let error;
        try { loadAccessKeyPair(env); } catch (e) { error = e; }

        expect(error).toBeInstanceOf(AsymmetricKeyConfigError);
        expectNoKeyLeak(error.message, env);
        expectNoKeyLeak(String(error.stack), env);
        expect(error.cause).toBeUndefined();
      }
    });

    it('al fallar en un proceso nuevo, la salida no contiene la clave', () => {
      const other = newPair(2048);
      const env = { [PRIV]: validEnv[PRIV], [PUB]: toB64(other.publicKey) };
      const result = importInChildProcess(env);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('KEY_PAIR_MISMATCH');
      expectNoKeyLeak(result.stdout + result.stderr, env);
    });
  });
});
