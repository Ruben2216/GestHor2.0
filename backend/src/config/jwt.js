import { env } from './env.js';
import { accessPrivateKey, accessPublicKey } from './asymmetricKeys.js';

export const jwtConfig = {
  accessPrivateKey,
  accessPublicKey,
  refreshSecret: env.jwt.refreshSecret,
  accessExpiresIn: env.jwt.expiresIn,
  refreshExpiresIn: env.jwt.refreshExpiresIn,
  issuer: env.jwt.issuer,
  audience: env.jwt.audience,
};
