import { env } from './env.js';

export const jwtConfig = {
  accessSecret: env.jwt.secret,
  refreshSecret: env.jwt.refreshSecret,
  accessExpiresIn: env.jwt.expiresIn,
  refreshExpiresIn: env.jwt.refreshExpiresIn,
  issuer: env.jwt.issuer,
  audience: env.jwt.audience,
};