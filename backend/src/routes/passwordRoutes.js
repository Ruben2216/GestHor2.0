import express from 'express';
import { changePassword, forgotPassword, resetPassword } from '../controllers/passwordController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;