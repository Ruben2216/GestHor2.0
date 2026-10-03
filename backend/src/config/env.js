import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const env = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  
  db: {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'GestHor',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'gesthor_default_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'gesthor_default_refresh_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'gesthor-api',
    audience: process.env.JWT_AUDIENCE || 'gesthor-client',
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || `${getBackendUrl()}/api/auth/google/callback`,
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'gesthor_session_secret_key_2025_change_in_production',
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  },
  
  frontend: {
    url: process.env.FRONTEND_URL
  },
  
  backend: {
    url: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`,
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    fromName: process.env.SMTP_FROM_NAME || 'Sistema GestHor',
    tlsRejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
  },
  
  app: {
    name: process.env.APP_NAME || 'GestHor',
    url: process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  
  cors: {
    origin: parseCorsOrigins(),
    credentials: true,
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

function getBackendUrl() {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, '');
  }
  const port = process.env.PORT || 3000;
  const protocol = isProduction ? 'https' : 'http';
  const host = process.env.BACKEND_HOST || 'localhost';
  return `${protocol}://${host}${port !== 80 && port !== 443 ? `:${port}` : ''}`;
}

function getFrontendUrl() {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, '');
  }
  return 'http://localhost:5173';
}

function parseCorsOrigins() {
  const origins = [];
  
  if (process.env.CORS_ORIGINS) {
    origins.push(...process.env.CORS_ORIGINS.split(',').map(o => o.trim()));
  } else {
    origins.push(getFrontendUrl());
    origins.push(getBackendUrl());
    if (!isProduction) {
      origins.push('http://localhost:5173');
      origins.push('http://localhost:3000');
      origins.push('http://127.0.0.1:5173');
      origins.push('http://127.0.0.1:3000');
    }
  }
  
  return [...new Set(origins)];
}

export function getResetPasswordUrl(token) {
  const baseUrl = env.frontend.url.replace(/\/$/, '');
  return `${baseUrl}/reset-password?token=${token}`;
}

export function getEmailVerificationUrl(token) {
  const baseUrl = env.frontend.url.replace(/\/$/, '');
  return `${baseUrl}/verify-email?token=${token}`;
}