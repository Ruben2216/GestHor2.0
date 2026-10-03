import express from 'express';
import { login, logout, getMe, getPermisos } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.get('/permisos', auth, getPermisos);

export default router;
