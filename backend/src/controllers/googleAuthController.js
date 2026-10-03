import { env } from "../config/env.js";
import * as authService from "../services/authService.js";

const googleAuthCallback = async (req, res) => {
    try {
        const email = req.user?.email;

        if (!email) {
            return res.redirect(`${env.frontend.url}/login?error=no_email`);
        }

        const ipOrigen = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        const result = await authService.socialLogin(email, ipOrigen, userAgent);

        const redirectTo = result.usuario.rol === "administrador"
            ? "/admin/admin-dashboard"
            : "/profesor/mi-horario";

        const userData = encodeURIComponent(JSON.stringify({
            id: result.usuario.id,
            email: result.usuario.email,
            rol: result.usuario.rol,
            nombre: result.usuario.nombre,
        }));

        res.redirect(
            `${env.frontend.url}/auth/callback?token=${result.accessToken}&refreshToken=${result.refreshToken}&user=${userData}&redirectTo=${redirectTo}`
        );
    } catch (error) {
        console.error("Error en googleAuthCallback:", error);
        res.redirect(`${env.frontend.url}/login?error=server_error`);
    }
};

const googleAuthFailure = (_req, res) => {
    res.redirect(`${env.frontend.url}/login?error=auth_failed`);
};

export { googleAuthCallback, googleAuthFailure };