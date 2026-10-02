import express from "express";
import passport from "../config/passport.js";
import { googleAuthCallback, googleAuthFailure } from "../controllers/googleAuthController.js";

const router = express.Router();

// Ruta para iniciar autenticación con Google
router.get(
    '/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

// Ruta de callback después de autenticarse con Google
router.get(
    '/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/api/auth/google/failure',
        session: false 
    }),
    googleAuthCallback
);

// Ruta en caso de fallo en la autenticación
router.get('/auth/google/failure', googleAuthFailure);

export default router;
