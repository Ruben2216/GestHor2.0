// Generador de par RSA para access tokens

import { generateKeyPairSync } from 'node:crypto';

const bits = Number.parseInt(process.argv[2] ?? '2048', 10);

if (!Number.isInteger(bits) || bits < 2048) {
  console.error('El tamaño de la clave debe ser un entero de al menos 2048 bits.');
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: bits,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const toB64 = (pem) => Buffer.from(pem, 'utf8').toString('base64');

console.log(`# Par RSA de ${bits} bits generado. Copiar al .env privado (no subir a Git).`);
console.log(`JWT_ACCESS_PRIVATE_KEY_B64=${toB64(privateKey)}`);
console.log(`JWT_ACCESS_PUBLIC_KEY_B64=${toB64(publicKey)}`);
