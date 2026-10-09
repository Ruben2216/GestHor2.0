import express from 'express';
import {
    obtenerDisponibilidadController,
    guardarDisponibilidadController,
    obtenerPreferenciasController,
    guardarPreferenciasController
} from '../controllers/disponibilidadController.js';
import { authorizeSelfOr } from '../middlewares/auth.js';

const router = express.Router();

// El profesor gestiona su propia disponibilidad y preferencias; los demás necesitan permiso sobre editores
router.get('/disponibilidad/:profesorId', authorizeSelfOr('profesorId', 'editores:leer'), obtenerDisponibilidadController);
router.post('/disponibilidad/:profesorId', authorizeSelfOr('profesorId', 'editores:editar'), guardarDisponibilidadController);

router.get('/preferencias/:profesorId', authorizeSelfOr('profesorId', 'editores:leer'), obtenerPreferenciasController);
router.post('/preferencias/:profesorId', authorizeSelfOr('profesorId', 'editores:editar'), guardarPreferenciasController);

export default router;
