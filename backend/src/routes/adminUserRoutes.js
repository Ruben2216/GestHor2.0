import express from 'express';
import { requireRole, auth } from '../middlewares/auth.js';
import {
  asignarRolUsuarioController,
  listarUsuariosController,
} from '../controllers/adminUserController.js';

const router = express.Router();
const administratorOnly = [auth, requireRole('administrador')];

router.get('/', ...administratorOnly, listarUsuariosController);
router.put('/:id/rol', ...administratorOnly, asignarRolUsuarioController);

export default router;
