import express from 'express';
import { 
    listarHorarios, 
    listarHorariosProfesor,
    listarHorariosSalon,
    registrarHorario, 
    modificarHorario, 
    borrarHorario 
} from '../controllers/horarioController.js';

const router = express.Router();

// GET /api/horarios - Obtener todos los horarios
router.get('/horarios', listarHorarios);

// GET /api/horarios/profesor/:profesorId - Obtener horarios de un profesor
router.get('/horarios/profesor/:profesorId', listarHorariosProfesor);
// GET /api/horarios/salon/:salonId - Obtener horarios de un salón
router.get('/horarios/salon/:salonId', listarHorariosSalon);

// POST /api/horarios - Crear nuevo horario
router.post('/horarios', registrarHorario);

// PUT /api/horarios/:horarioId - Actualizar horario
router.put('/horarios/:horarioId', modificarHorario);

// DELETE /api/horarios/:horarioId - Eliminar horario
router.delete('/horarios/:horarioId', borrarHorario);

export default router;
