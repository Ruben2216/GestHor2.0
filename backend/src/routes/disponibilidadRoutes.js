import express from 'express';
import {
    obtenerDisponibilidadController,
    guardarDisponibilidadController,
    obtenerPreferenciasController,
    guardarPreferenciasController
} from '../controllers/disponibilidadController.js';

const router = express.Router();

router.get('/disponibilidad/:profesorId', obtenerDisponibilidadController);
router.post('/disponibilidad/:profesorId', guardarDisponibilidadController);

router.get('/preferencias/:profesorId', obtenerPreferenciasController);
router.post('/preferencias/:profesorId', guardarPreferenciasController);

export default router;
