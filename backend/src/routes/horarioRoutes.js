import express from 'express';
import {
    listarHorarios,
    listarHorariosProfesor,
    listarHorariosSalon,
    registrarHorario,
    modificarHorario,
    borrarHorario
} from '../controllers/horarioController.js';
import { authorize } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/horarios - Obtener todos los horarios
router.get('/horarios', authorize('horarios:leer'), listarHorarios);

// GET /api/horarios/profesor/:profesorId - Obtener horarios de un profesor
router.get('/horarios/profesor/:profesorId', authorize('horarios:leer'), listarHorariosProfesor);
// GET /api/horarios/salon/:salonId - Obtener horarios de un salón
router.get('/horarios/salon/:salonId', authorize('horarios:leer'), listarHorariosSalon);

// POST /api/horarios - Crear nuevo horario
router.post('/horarios', authorize('horarios:crear'), registrarHorario);

// PUT /api/horarios/:horarioId - Actualizar horario
router.put('/horarios/:horarioId', authorize('horarios:editar'), modificarHorario);

// DELETE /api/horarios/:horarioId - Eliminar horario
router.delete('/horarios/:horarioId', authorize('horarios:eliminar'), borrarHorario);

export default router;
