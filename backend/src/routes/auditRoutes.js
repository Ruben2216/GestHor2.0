import express from 'express';
import { requireRole, auth } from '../middlewares/auth.js';
import { consultarAuditoriaController } from '../controllers/auditController.js';

const router = express.Router();

router.get('/', auth, requireRole('administrador'), consultarAuditoriaController);

export default router;
