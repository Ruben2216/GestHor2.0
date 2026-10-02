import jwt from "jsonwebtoken";
import { findUserByEmail } from "../models/userModel.js";

const googleAuthCallback = async (req, res) => {
    try {
        // El usuario viene de passport después de autenticarse con Google
        const email = req.user?.email;

        if (!email) {
            return res.redirect(
                `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_email`
            );
        }

        // Buscar usuario por email en la base de datos
        const user = await findUserByEmail(email);
        
        if (!user) {
            // Usuario no encontrado en la base de datos
            return res.redirect(
                `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=user_not_found`
            );
        }

        // Generar JWT con expiración de 15 minutos
        const token = jwt.sign(
            { 
                sub: user.usuario_id,
                email: user.email,
                rol: user.nombre_rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        // Determinar redirección según rol
        const redirectTo = user.nombre_rol === "administrador"
            ? "/admin/admin-dashboard"
            : "/profesor/mi-horario";

        // Redirigir al frontend con el token y la información del usuario
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const userData = encodeURIComponent(JSON.stringify({
            id: user.usuario_id,
            email: user.email,
            rol: user.nombre_rol
        }));

        res.redirect(
            `${frontendUrl}/auth/callback?token=${token}&user=${userData}&redirectTo=${redirectTo}`
        );
    } catch (error) {
        console.error("Error en googleAuthCallback:", error);
        res.redirect(
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`
        );
    }
};

const googleAuthFailure = (_req, res) => {
    res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
    );
};

export { googleAuthCallback, googleAuthFailure };
