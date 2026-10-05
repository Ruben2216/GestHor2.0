import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import passport from "./src/config/passport.js";
import { env, validateSecurityConfig } from "./src/config/env.js";
import { apiLimiter } from "./src/middlewares/rateLimiter.js";

import { pruebaConexion } from "./src/config/database.js";
import authRoutes from "./src/routes/authRoutes.js";
import passwordRoutes from "./src/routes/passwordRoutes.js";
import refreshRoutes from "./src/routes/refreshRoutes.js";
import googleAuthRoutes from "./src/routes/googleAuthRoutes.js";
import docenteRoutes from "./src/routes/docenteRoutes.js";
import carreraRoutes from "./src/routes/carreraRoutes.js";
import materiaRoutes from "./src/routes/materiaRoutes.js";
import profesorMateriaRoutes from "./src/routes/profesorMateriaRoutes.js";
import disponibilidadRoutes from "./src/routes/disponibilidadRoutes.js";
import profesorInfoRoutes from "./src/routes/profesorInfoRoutes.js";
import horarioRoutes from "./src/routes/horarioRoutes.js";
import lugaresRoutes from './src/routes/lugaresRoutes.js';
import solicitudRecuperacionRoutes from './src/routes/solicitudRecuperacionRoutes.js';
import tipoContratoRoutes from './src/routes/tipoContratoRoutes.js';
import sugerenciaRoutes from './src/routes/sugerenciaRoutes.js';
import periodoRoutes from './src/routes/periodoRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';
import roleRoutes from './src/routes/roleRoutes.js';
import adminUserRoutes from './src/routes/adminUserRoutes.js';
import { auditRequest } from './src/middlewares/audit.js';

// Validar configuraciones de seguridad transversales
validateSecurityConfig();

const app = express();

// Configuración de encabezados seguros con Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: env.isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  })
);

// En producción, confiar en el proxy y exigir HTTPS
if (env.isProduction) {
  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps) {
      if (req.method === 'GET' || req.method === 'HEAD') {
        return res.redirect(301, `https://${req.headers.host}${req.originalUrl || req.url}`);
      }
      return res.status(403).json({
        ok: false,
        message: 'Conexión no segura. En producción se requiere el uso exclusivo de HTTPS.',
        code: 'HTTPS_REQUIRED',
        statusCode: 403,
      });
    }
    next();
  });
}

// Configuración de CORS estricto
app.use(cors(env.cors));

// Parseo de JSON
app.use(express.json());

// Middleware transversal: Garantizar que todos los errores enviados al cliente sean genéricos
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      const status = res.statusCode;
      // Cualquier error 500+ o error no controlado se convierte en mensaje genérico para el cliente
      if (status >= 500) {
        console.error(`[Error 500 en ${req.method} ${req.originalUrl}]:`, data.error || data.mensaje || data.message || data);
        const genericMessage = 'Ocurrió un error interno en el servidor. Por favor, intente más tarde.';
        const sanitized = {
          ok: false,
          message: genericMessage,
          mensaje: genericMessage,
          code: data.code || 'INTERNAL_SERVER_ERROR',
          statusCode: status,
        };
        return originalJson.call(this, sanitized);
      }
      
      // Filtrar posibles fugas de SQL/rutas/stack en respuestas de error 4xx
      if (data.ok === false) {
        const technicalPatterns = [/pg_/i, /syntax error/i, /relation/i, /column/i, /database/i, /password/i, /token/i, /TypeError/i, /at\s+[a-z0-9_.]+\s+\(/i];
        if (data.error && typeof data.error === 'string') {
          if (technicalPatterns.some((pattern) => pattern.test(data.error))) {
            delete data.error;
            data.message = 'Solicitud inválida o error en los parámetros.';
            data.mensaje = data.message;
          }
        }
      }
    }
    return originalJson.call(this, data);
  };
  next();
});

// Auditoría transversal de peticiones
app.use(auditRequest);

// Limitador de tasa transversal para endpoints API
app.use('/api', apiLimiter);

// Configurar sesiones para passport
app.use(
  session({
    secret: env.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: env.session.cookie,
    proxy: env.isProduction,
  })
);

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación (Módulo 1)
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordRoutes);
app.use("/api/auth", refreshRoutes);

// Rutas del sistema
app.use("/api/auth", googleAuthRoutes);
app.use("/api", docenteRoutes);
app.use("/api", carreraRoutes);
app.use("/api", materiaRoutes);
app.use("/api/profesor-materias", profesorMateriaRoutes);
app.use("/api", disponibilidadRoutes);
app.use("/api", profesorInfoRoutes);
app.use("/api", horarioRoutes);
app.use('/api', lugaresRoutes);
app.use('/api', solicitudRecuperacionRoutes);
app.use('/api', tipoContratoRoutes);
app.use('/api', sugerenciaRoutes);
app.use('/api', periodoRoutes);
app.use('/api/auditoria', auditRoutes);
app.use('/api/admin/roles', roleRoutes);
app.use('/api/admin/usuarios', adminUserRoutes);

// Health-check simple y prueba de conexión
app.get("/api", async (_req, res) => {
  try {
    await pruebaConexion();
    res.json({ 
      ok: true,
      message: "Conexión a la base de datos: OK",
      environment: env.nodeEnv,
      backendUrl: env.backend.url,
      frontendUrl: env.frontend.url
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Ocurrió un error interno en el servidor. Por favor, intente más tarde.",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    });
  }
});

// Middleware para rutas no encontradas de la API (404)
app.use('/api', (req, res) => {
  res.status(404).json({
    ok: false,
    message: 'El recurso solicitado no fue encontrado.',
    code: 'NOT_FOUND',
    statusCode: 404,
  });
});

// Middleware transversal de manejo de errores
app.use((err, req, res, _next) => {
  // Registrar detalle técnico completo en la consola del servidor únicamente
  console.error('[Error de Servidor no controlado]:', {
    message: err.message,
    code: err.code,
    status: err.status || err.statusCode,
    path: req.path,
    method: req.method,
  });

  // Manejo de rechazo de CORS
  if (err.message?.includes('CORS') || err.code === 'CORS_NOT_ALLOWED' || err.status === 403) {
    return res.status(403).json({
      ok: false,
      message: 'Acceso no permitido: Origen rechazado por la política de CORS.',
      code: 'CORS_NOT_ALLOWED',
      statusCode: 403,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const isServerInternal = statusCode >= 500;

  // Mensaje genérico para el cliente (nunca filtrar errores de base de datos o stack)
  const clientMessage = isServerInternal
    ? 'Ocurrió un error interno en el servidor. Por favor, intente más tarde.'
    : (err.message || 'Solicitud inválida');

  return res.status(statusCode).json({
    ok: false,
    message: clientMessage,
    code: err.code || (isServerInternal ? 'INTERNAL_SERVER_ERROR' : 'INVALID_REQUEST'),
    statusCode,
  });
});

app.listen(env.port, () => {
  console.log(`🚀 Servidor escuchando en ${env.backend.url}`);
  console.log(`🌐 Frontend configurado en: ${env.frontend.url}`);
  console.log(`🔧 Entorno: ${env.nodeEnv}`);
});

// Keep process alive
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});