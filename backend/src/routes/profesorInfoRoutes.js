import express from 'express';
import { obtenerInfoHorariosProfesor, validarProfesorMateria } from '../controllers/profesorInfoController.js';

const router = express.Router();

/**
 * GET /api/profesores/:profesorId/info-horarios
 * Obtiene disponibilidad, preferencias y materias del profesor
 */
router.get('/profesores/:profesorId/info-horarios', obtenerInfoHorariosProfesor);

/**
 * POST /api/horarios/validar-profesor-materia
 * Valida si una materia está en el perfil del profesor
 * Body: { profesorId, materiaId }
 */
router.post('/horarios/validar-profesor-materia', validarProfesorMateria);

export default router;
