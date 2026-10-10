import express from "express";
import passport from "../config/passport.js";
import { googleAuthCallback, googleAuthFailure } from "../controllers/googleAuthController.js";

const router = express.Router();

// Ruta para iniciar autenticación con Google
router.get(
    '/google',
    (req, res, next) => {
        if (!passport._strategies?.google) {
            return res.status(503).json({ ok: false, message: 'Autenticación con Google no está configurada en este entorno.' });
        }
        const prompt = req.query.prompt || 'select_account';
        passport.authenticate('google', { 
            scope: ['profile', 'email'],
            prompt,
            access_type: 'offline'
        })(req, res, next);
    }
);

// Ruta de callback después de autenticarse con Google
router.get(
    '/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/api/auth/google/failure',
        session: false 
    }),
    googleAuthCallback
);

// Ruta en caso de fallo en la autenticación
router.get('/google/failure', googleAuthFailure);

export default router;
