import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Función para obtener o advertir sobre secretos sensibles sin dejar valores fijos inseguros
function getSecureKey(envVarName, isSecret = false) {
  const value = process.env[envVarName];
  if (value) return value;

  if (isProduction) {
    throw new Error(`[SEGURIDAD CRÍTICA] La variable sensible ${envVarName} es requerida en producción y no puede quedar vacía ni tener valores por defecto.`);
  }

  // En desarrollo, generar un valor temporal aleatorio seguro en memoria si no está en .env
  if (isSecret) {
    console.warn(`[SEGURIDAD DEV] '${envVarName}' no está configurada en .env. Se generó una clave aleatoria temporal para esta sesión.`);
    return crypto.randomBytes(32).toString('hex');
  }
  return undefined;
}

export const env = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'GestHor',
    ssl: isProduction ? { rejectUnauthorized: true } : false,
  },
  
  jwt: {
    secret: getSecureKey('JWT_SECRET', true),
    refreshSecret: getSecureKey('JWT_REFRESH_SECRET', true),
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
    secret: getSecureKey('SESSION_SECRET', true),
    cookie: {
      secure: isProduction, // HTTPS obligatorio en producción
      sameSite: isProduction ? 'strict' : 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  },
  
  frontend: {
    url: getFrontendUrl(),
  },
  
  backend: {
    url: getBackendUrl(),
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    fromName: process.env.SMTP_FROM_NAME || 'Sistema GestHor',
    tlsRejectUnauthorized: isProduction ? true : (process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'),
  },
  
  app: {
    name: process.env.APP_NAME || 'GestHor',
    url: process.env.APP_URL || getFrontendUrl(),
  },
  
  cors: getCorsOptions(),
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
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
  return isProduction ? 'https://gesthor.unach.mx' : 'http://localhost:5173';
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
  
  return [...new Set(origins.filter(Boolean))];
}

function getCorsOptions() {
  const allowedOrigins = parseCorsOrigins();
  
  return {
    origin: (origin, callback) => {
      // Peticiones sin header Origin (como herramientas CLI internas, mobile apps o server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      const corsError = new Error(`Acceso denegado: El origen '${origin}' no está autorizado por la política de CORS.`);
      corsError.status = 403;
      corsError.code = 'CORS_NOT_ALLOWED';
      return callback(corsError);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 204,
  };
}

export function validateSecurityConfig() {
  const currentIsProd = process.env.NODE_ENV === 'production';
  const insecureDefaults = [
    '1234', '123456', 'password', 'admin', 'root',
    'gesthor_default_access_secret_change_in_production',
    'gesthor_default_refresh_secret_change_in_production',
    'gesthor_session_secret_key_2025_change_in_production',
    'gesthor_super_secret_key_2025_change_in_production',
    'gesthor_refresh_secret_key_2025_change_in_production',
  ];

  if (currentIsProd) {
    const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET'];
    for (const key of requiredVars) {
      const val = process.env[key];
      if (!val) {
        throw new Error(`[SEGURIDAD] Variable requerida '${key}' no configurada en producción.`);
      }
      if (insecureDefaults.includes(val)) {
        throw new Error(`[SEGURIDAD] La variable '${key}' utiliza un valor por defecto inseguro en producción.`);
      }
    }

    if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith('https://')) {
      throw new Error('[SEGURIDAD] En producción, FRONTEND_URL debe utilizar el protocolo seguro HTTPS.');
    }
  }
}

export function getResetPasswordUrl(token) {
  const baseUrl = env.frontend.url.replace(/\/$/, '');
  return `${baseUrl}/reset-password?token=${token}`;
}

export function getEmailVerificationUrl(token) {
  const baseUrl = env.frontend.url.replace(/\/$/, '');
  return `${baseUrl}/verify-email?token=${token}`;
}