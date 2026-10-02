import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "../models/userModel.js";

const login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        // Validar que vengan ambos campos
        if (!correo || !contraseña) {
            return res.status(400).json({ 
                ok: false, 
                message: "Falta correo o contraseña" 
            });
        }

        // Buscar usuario por email
        const user = await findUserByEmail(correo);
        
        if (!user) {
            return res.status(401).json({ 
                ok: false, 
                message: "Credenciales inválidas" 
            });
        }

        // Comparar contraseña/token con el hash almacenado
        const passwordMatch = await bcrypt.compare(contraseña, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ 
                ok: false, 
                message: "Credenciales inválidas" 
            });
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

        // Devolver token y datos del usuario (sin password)
        return res.json({
            ok: true,
            token,
            usuario: { 
                id: user.usuario_id, 
                email: user.email, 
                rol: user.nombre_rol 
            },
            redirectTo,
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ 
            ok: false, 
            message: "Error en login" 
        });
    }
};

export { login };
