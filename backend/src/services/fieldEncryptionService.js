import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const FORMAT_VERSION = 'v1';
const NONCE_BYTES = 12;
const AUTH_TAG_BYTES = 16;

function getEncryptionKey() {
  const encodedKey = process.env.APP_ENCRYPTION_KEY_B64;
  const isBase64 = typeof encodedKey === 'string'
    && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encodedKey);

  if (!isBase64) {
    throw new Error('APP_ENCRYPTION_KEY_B64 debe ser Base64 válido y representar exactamente 32 bytes.');
  }

  const key = Buffer.from(encodedKey, 'base64');
  if (key.length !== 32 || key.toString('base64') !== encodedKey) {
    throw new Error('APP_ENCRYPTION_KEY_B64 debe ser Base64 válido y representar exactamente 32 bytes.');
  }

  return key;
}

/**
 * Cifra un texto usando AES-256-GCM. null se conserva como null; la cadena
 * vacía se cifra y descifra como cualquier otro texto.
 */
export function encryptField(texto) {
  if (texto === null) return null;
  if (typeof texto !== 'string') {
    throw new TypeError('El valor a cifrar debe ser una cadena o null.');
  }

  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), nonce);
  const ciphertext = Buffer.concat([
    cipher.update(texto, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    FORMAT_VERSION,
    nonce.toString('hex'),
    authTag.toString('hex'),
    ciphertext.toString('hex'),
  ].join(':');
}

/**
 * Descifra valores v1 de AES-256-GCM. null se conserva como null; una cadena
 * vacía se interpreta como texto cifrado vacío y no como null.
 */
export function decryptField(valor) {
  if (valor === null) return null;
  if (typeof valor !== 'string') {
    throw new TypeError('El valor a descifrar debe ser una cadena o null.');
  }

  const components = valor.split(':');
  if (components.length !== 4 || components[0] !== FORMAT_VERSION) {
    throw new Error('El valor cifrado tiene un formato no válido.');
  }

  const [, nonceHex, authTagHex, ciphertextHex] = components;
  const isHex = value => /^(?:[0-9a-f]{2})*$/i.test(value);
  if (
    !new RegExp(`^[0-9a-f]{${NONCE_BYTES * 2}}$`, 'i').test(nonceHex)
    || !new RegExp(`^[0-9a-f]{${AUTH_TAG_BYTES * 2}}$`, 'i').test(authTagHex)
    || !isHex(ciphertextHex)
  ) {
    throw new Error('El valor cifrado está incompleto o tiene componentes no válidos.');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(nonceHex, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, 'hex')),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}
