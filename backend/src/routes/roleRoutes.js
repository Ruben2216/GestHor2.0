import express from 'express';
import { requireRole, auth } from '../middlewares/auth.js';
import {
  actualizarRolController,
  crearRolController,
  guardarPermisosRolController,
  listarPermisosRolController,
  listarRolesController,
} from '../controllers/roleController.js';

const router = express.Router();
const administratorOnly = [auth, requireRole('administrador')];

router.get('/', ...administratorOnly, listarRolesController);
router.post('/', ...administratorOnly, crearRolController);
router.put('/:id', ...administratorOnly, actualizarRolController);
router.get('/:id/permisos', ...administratorOnly, listarPermisosRolController);
router.put('/:id/permisos', ...administratorOnly, guardarPermisosRolController);

export default router;
