import express from 'express';
import { obtenerInfoHorariosProfesor, validarProfesorMateria } from '../controllers/profesorInfoController.js';
import { authorize, authorizeSelfOr } from '../middlewares/auth.js';

const router = express.Router();

/**
 * GET /api/profesores/:profesorId/info-horarios
 * Obtiene disponibilidad, preferencias y materias del profesor
 */
router.get('/profesores/:profesorId/info-horarios', authorizeSelfOr('profesorId', 'docentes:leer'), obtenerInfoHorariosProfesor);

/**
 * POST /api/horarios/validar-profesor-materia
 * Valida si una materia está en el perfil del profesor
 * Body: { profesorId, materiaId }
 */
router.post('/horarios/validar-profesor-materia', authorize('horarios:crear', 'horarios:editar'), validarProfesorMateria);

export default router;
