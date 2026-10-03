import express from 'express';
import { obtenerMaterias, asignarMateria, eliminarMateria } from '../controllers/profesorMateriaController.js';
import { authorizeSelfOr } from '../middlewares/auth.js';

const router = express.Router();

// El profesor gestiona sus propias materias; los demás necesitan permiso sobre docentes
router.get('/:profesorId', authorizeSelfOr('profesorId', 'docentes:leer'), obtenerMaterias);
router.post('/:profesorId', authorizeSelfOr('profesorId', 'docentes:editar'), asignarMateria);
router.delete('/:profesorId/:materiaId', authorizeSelfOr('profesorId', 'docentes:editar'), eliminarMateria);

export default router;
