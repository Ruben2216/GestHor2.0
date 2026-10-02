import express from 'express';
import { obtenerMaterias, asignarMateria, eliminarMateria } from '../controllers/profesorMateriaController.js';

const router = express.Router();

router.get('/:profesorId', obtenerMaterias);
router.post('/:profesorId', asignarMateria);
router.delete('/:profesorId/:materiaId', eliminarMateria);

export default router;
