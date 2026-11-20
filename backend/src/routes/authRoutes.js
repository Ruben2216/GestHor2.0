import express from 'express';
import { login, logout, getMe, getPermisos, verify2fa } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/verify-2fa', verify2fa);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.get('/permisos', auth, getPermisos);

export default router;
