import express from 'express';
import { obtenerMaterias, asignarMateria, eliminarMateria } from '../controllers/profesorMateriaController.js';
import { authorizeSelfOr } from '../middlewares/auth.js';

const router = express.Router();

// El profesor gestiona sus propias materias; los demás necesitan permiso sobre editores
router.get('/:profesorId', authorizeSelfOr('profesorId', 'editores:leer'), obtenerMaterias);
router.post('/:profesorId', authorizeSelfOr('profesorId', 'editores:editar'), asignarMateria);
router.delete('/:profesorId/:materiaId', authorizeSelfOr('profesorId', 'editores:editar'), eliminarMateria);

export default router;
