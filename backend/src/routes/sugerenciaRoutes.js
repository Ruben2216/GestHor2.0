import express from 'express';
import { getSugerenciasDocentes } from '../controllers/sugerenciaController.js';

const router = express.Router();

// ejemplo GET /api/sugerencias/docentes?materiaId=34&dia=Lunes&inicio=07:00&fin=08:00
router.get('/sugerencias/docentes', getSugerenciasDocentes);

export default router;
