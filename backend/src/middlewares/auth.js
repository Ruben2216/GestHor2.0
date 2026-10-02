import jwt from "jsonwebtoken";

/**
 * Middleware para verificar JWT en las peticiones
 * Extrae el token del header Authorization: Bearer <token>
 * Si es válido, adjunta req.user con los datos del payload
 */
export const auth = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                ok: false, 
                message: "Token no proporcionado" 
            });
        }

        // Extraer token después de "Bearer "
        const token = authHeader.substring(7);

        // Verificar y decodificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntar datos del usuario al request
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            rol: decoded.rol
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                ok: false, 
                message: "Token expirado. Por favor inicie sesión nuevamente" 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                ok: false, 
                message: "Token inválido" 
            });
        }

        console.error("Error en middleware auth:", error);
        return res.status(500).json({ 
            ok: false, 
            message: "Error al validar token" 
        });
    }
};


export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                ok: false, 
                message: "No autenticado" 
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ 
                ok: false, 
                message: "No tiene permisos para acceder a este recurso" 
            });
        }

        next();
    };
};
