import dotenv from 'dotenv';
import {
  createPrivateKey,
  createPublicKey,
  createSign,
  createVerify,
  randomBytes,
} from 'node:crypto';

// Carga y validación del par RSA para access tokens

dotenv.config();

export const PRIVATE_KEY_ENV = 'JWT_ACCESS_PRIVATE_KEY_B64';
export const PUBLIC_KEY_ENV = 'JWT_ACCESS_PUBLIC_KEY_B64';
export const MIN_RSA_BITS = 2048;

export class AsymmetricKeyConfigError extends Error {
  constructor(message, code) {
    super(`[CLAVES RSA] ${message}`);
    this.name = 'AsymmetricKeyConfigError';
    this.code = code;
  }
}

const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Lee una variable del entorno y la decodifica de Base64 a texto PEM
 */
function decodePemFromEnv(source, varName) {
  const raw = source[varName];

  if (raw === undefined || raw === null || String(raw).trim() === '') {
    throw new AsymmetricKeyConfigError(
      `La variable ${varName} no está configurada.`,
      'KEY_MISSING',
    );
  }

  // Se permiten saltos de línea o espacios accidentales al pegar el valor
  const compact = String(raw).replace(/\s+/g, '');

  if (!BASE64_REGEX.test(compact) || compact.length % 4 !== 0) {
    throw new AsymmetricKeyConfigError(
      `La variable ${varName} no contiene Base64 válido.`,
      'KEY_INVALID_BASE64',
    );
  }

  const pem = Buffer.from(compact, 'base64').toString('utf8');

  if (!/-----BEGIN [A-Z ]+-----/.test(pem) || !/-----END [A-Z ]+-----/.test(pem)) {
    throw new AsymmetricKeyConfigError(
      `La variable ${varName} no contiene una clave en formato PEM.`,
      'KEY_INVALID_PEM',
    );
  }

  return pem;
}

/**
 * Comprueba que la clave sea RSA y de tamaño suficiente.
 */
function assertRsaKey(keyObject, varName) {
  if (keyObject.asymmetricKeyType !== 'rsa') {
    throw new AsymmetricKeyConfigError(
      `La clave de ${varName} no es de tipo RSA.`,
      'KEY_NOT_RSA',
    );
  }

  const bits = keyObject.asymmetricKeyDetails?.modulusLength ?? 0;
  if (bits < MIN_RSA_BITS) {
    throw new AsymmetricKeyConfigError(
      `La clave de ${varName} tiene ${bits} bits; se requieren al menos ${MIN_RSA_BITS}.`,
      'KEY_TOO_SMALL',
    );
  }
}

/**
 * Carga y valida el par RSA a partir de un objeto de entorno.
 *
 * @param {Record<string, string|undefined>} source Objeto con las variables (por defecto process.env)
 * @returns {{ accessPrivateKey: string, accessPublicKey: string, modulusLength: number }}
 * @throws {AsymmetricKeyConfigError}
 */
export function loadAccessKeyPair(source = process.env) {
  const privatePem = decodePemFromEnv(source, PRIVATE_KEY_ENV);
  const publicPem = decodePemFromEnv(source, PUBLIC_KEY_ENV);

  // Evita que alguien coloque la clave privada en la variable pública
  if (publicPem.includes('PRIVATE KEY')) {
    throw new AsymmetricKeyConfigError(
      `La variable ${PUBLIC_KEY_ENV} contiene una clave privada; debe contener la clave pública.`,
      'KEY_PUBLIC_IS_PRIVATE',
    );
  }

  let privateKey;
  try {
    privateKey = createPrivateKey({ key: privatePem, format: 'pem' });
  } catch {
    // No se propaga el error original para no arrastrar detalles del contenido
    throw new AsymmetricKeyConfigError(
      `La clave de ${PRIVATE_KEY_ENV} está dañada o no es una clave privada válida.`,
      'KEY_UNREADABLE',
    );
  }

  let publicKey;
  try {
    publicKey = createPublicKey({ key: publicPem, format: 'pem' });
  } catch {
    throw new AsymmetricKeyConfigError(
      `La clave de ${PUBLIC_KEY_ENV} está dañada o no es una clave pública válida.`,
      'KEY_UNREADABLE',
    );
  }

  assertRsaKey(privateKey, PRIVATE_KEY_ENV);
  assertRsaKey(publicKey, PUBLIC_KEY_ENV);

  // Mismo par: la pública derivada de la privada debe ser idéntica a la configurada
  const derivedPublicDer = createPublicKey(privateKey).export({ type: 'spki', format: 'der' });
  const configuredPublicDer = publicKey.export({ type: 'spki', format: 'der' });
  if (!derivedPublicDer.equals(configuredPublicDer)) {
    throw new AsymmetricKeyConfigError(
      'La clave pública no corresponde a la clave privada (no son del mismo par).',
      'KEY_PAIR_MISMATCH',
    );
  }

  // Prueba real de uso: firmar con la privada y verificar con la pública
  const challenge = randomBytes(32);
  const signature = createSign('RSA-SHA256').update(challenge).sign(privateKey);
  const valid = createVerify('RSA-SHA256').update(challenge).verify(publicKey, signature);
  if (!valid) {
    throw new AsymmetricKeyConfigError(
      'El par RSA no pudo firmar y verificar correctamente.',
      'KEY_PAIR_UNUSABLE',
    );
  }

  return Object.freeze({
    // Se exportan en formato PEM normalizado, aceptado directamente por jsonwebtoken
    accessPrivateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    accessPublicKey: publicKey.export({ type: 'spki', format: 'pem' }),
    modulusLength: privateKey.asymmetricKeyDetails.modulusLength,
  });
}

// Carga al importar el módulo: si las claves faltan o son inválidas, falla aquí.
const keys = loadAccessKeyPair(process.env);

export const accessPrivateKey = keys.accessPrivateKey;
export const accessPublicKey = keys.accessPublicKey;

export function getAccessPrivateKey() {
  return accessPrivateKey;
}

export function getAccessPublicKey() {
  return accessPublicKey;
}
