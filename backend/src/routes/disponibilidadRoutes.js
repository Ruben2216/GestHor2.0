import express from 'express';
import {
    obtenerDisponibilidadController,
    guardarDisponibilidadController,
    obtenerPreferenciasController,
    guardarPreferenciasController
} from '../controllers/disponibilidadController.js';
import { authorizeSelfOr } from '../middlewares/auth.js';

const router = express.Router();

// El profesor gestiona su propia disponibilidad y preferencias; los demás necesitan permiso sobre docentes
router.get('/disponibilidad/:profesorId', authorizeSelfOr('profesorId', 'docentes:leer'), obtenerDisponibilidadController);
router.post('/disponibilidad/:profesorId', authorizeSelfOr('profesorId', 'docentes:editar'), guardarDisponibilidadController);

router.get('/preferencias/:profesorId', authorizeSelfOr('profesorId', 'docentes:leer'), obtenerPreferenciasController);
router.post('/preferencias/:profesorId', authorizeSelfOr('profesorId', 'docentes:editar'), guardarPreferenciasController);

export default router;
