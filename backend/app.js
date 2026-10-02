import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./src/config/passport.js";

import { pruebaConexion } from "./src/config/database.js";
import authRoutes from "./src/routes/authRout.js";
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
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configurar sesiones para passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // cambiar a true en producción con HTTPS
  })
);

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());



// Rutas base:
//  - POST /api/login              (desde authRout.js)
//  - /api/docentes                (desde docenteRoutes.js)
//  - /api/carreras                (desde carreraRoutes.js)
//  - /api/materias                (desde materiaRoutes.js)
//  - /api/profesor-materias       (desde profesorMateriaRoutes.js)
//  - /api/disponibilidad          (desde disponibilidadRoutes.js)
//  - /api/preferencias            (desde disponibilidadRoutes.js)
//  - /api/profesores/:id/info-horarios  (desde profesorInfoRoutes.js)
//  - /api/horarios/validar-profesor-materia (desde profesorInfoRoutes.js)
//  - /api/horarios                (desde horarioRoutes.js)
//  - /api/auth/google             (desde googleAuthRoutes.js)
//  - /api/auth/google/callback    (desde googleAuthRoutes.js)
app.use("/api", authRoutes);
app.use("/api", googleAuthRoutes);
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
  res.json({ message: "Conexión a la base de datos: OK" });
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
