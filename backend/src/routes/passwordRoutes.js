import express from 'express';
import { changePassword, forgotPassword, resetPassword } from '../controllers/passwordController.js';
import { auth } from '../middlewares/auth.js';
import { passwordResetLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/change-password', auth, changePassword);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

export default router;