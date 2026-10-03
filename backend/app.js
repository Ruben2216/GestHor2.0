import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./src/config/passport.js";
import { env } from "./src/config/env.js";

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
import { sanitize } from './src/utils/sanitizeJson.js';

const app = express();

app.use(cors(env.cors));
app.use(express.json());

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

// Trust proxy for correct IP detection behind Cloudflare/ngrok
if (env.isProduction) {
  app.set('trust proxy', 1);
}

// Rutas de autenticación (Módulo 1)
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordRoutes);
app.use("/api/auth", refreshRoutes);

// Rutas existentes
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

// Health-check simple y prueba de conexión
app.get("/api", async (_req, res) => {
  await pruebaConexion();
  res.json({ 
    message: "Conexión a la base de datos: OK",
    environment: env.nodeEnv,
    backendUrl: env.backend.url,
    frontendUrl: env.frontend.url
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