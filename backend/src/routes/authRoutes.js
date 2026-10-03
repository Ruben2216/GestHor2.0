import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

export default router;