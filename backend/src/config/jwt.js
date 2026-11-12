import { generateKeyPairSync } from 'node:crypto';
import { env } from './env.js';

/**
 * ============================================================================
 * GestHor 2.0 — Configuración JWT
 * Integrante 4: Claves asimétricas RSA (RS256) para Access Token y HS256 para Refresh
 * ============================================================================
 */

// Intentar cargar módulo del Integrante 3 (backend/src/config/asymmetricKeys.js)
let asymmetricKeys = null;
try {
  asymmetricKeys = await import('./asymmetricKeys.js');
} catch {
  // Integrante 3 aún no ha integrado backend/src/config/asymmetricKeys.js
}

let customPrivateKey = null;
let customPublicKey = null;
let cachedFallbackKeyPair = null;

function getFallbackKeyPair() {
  if (!cachedFallbackKeyPair) {
    const privB64 = process.env.JWT_ACCESS_PRIVATE_KEY_B64;
    const pubB64 = process.env.JWT_ACCESS_PUBLIC_KEY_B64;

    if (privB64 && pubB64) {
      try {
        const priv = Buffer.from(privB64, 'base64').toString('utf8');
        const pub = Buffer.from(pubB64, 'base64').toString('utf8');
        if (priv.includes('KEY') && pub.includes('KEY')) {
          cachedFallbackKeyPair = { privateKey: priv, publicKey: pub };
          return cachedFallbackKeyPair;
        }
      } catch {
        // En caso de Base64 mal formado, fallback a generación de par seguro
      }
    }

    // Par seguro en memoria (2048 bits) para desarrollo y pruebas
    cachedFallbackKeyPair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
  }
  return cachedFallbackKeyPair;
}

export const jwtConfig = {
  get accessPrivateKey() {
    if (customPrivateKey) return customPrivateKey;
    if (asymmetricKeys?.accessPrivateKey) return asymmetricKeys.accessPrivateKey;
    if (typeof asymmetricKeys?.getAccessPrivateKey === 'function') {
      return asymmetricKeys.getAccessPrivateKey();
    }
    return getFallbackKeyPair().privateKey;
  },

  get accessPublicKey() {
    if (customPublicKey) return customPublicKey;
    if (asymmetricKeys?.accessPublicKey) return asymmetricKeys.accessPublicKey;
    if (typeof asymmetricKeys?.getAccessPublicKey === 'function') {
      return asymmetricKeys.getAccessPublicKey();
    }
    return getFallbackKeyPair().publicKey;
  },

  get accessSecret() {
    // Compatibilidad temporal para transiciones
    return this.accessPrivateKey;
  },

  setAccessKeys(privateKey, publicKey) {
    customPrivateKey = privateKey;
    customPublicKey = publicKey;
  },

  resetAccessKeys() {
    customPrivateKey = null;
    customPublicKey = null;
  },

  accessAlgorithm: 'RS256',
  refreshAlgorithm: 'HS256',
  refreshSecret: env.jwt.refreshSecret,
  accessExpiresIn: env.jwt.expiresIn,
  refreshExpiresIn: env.jwt.refreshExpiresIn,
  issuer: env.jwt.issuer,
  audience: env.jwt.audience,
};
