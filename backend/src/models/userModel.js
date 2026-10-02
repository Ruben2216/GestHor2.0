import { dbConnection } from '../config/database.js';

// Buscar usuario por email y devolver datos incluyendo hash de password
async function findUserByEmail(email) {
    try {
        const sql = `
            SELECT u.usuario_id, u.email, u.password, r.nombre_rol
            FROM usuarios u
            JOIN roles r ON r.rol_id = u.rol_id
            WHERE u.email = $1
            LIMIT 1
        `;
        const user = await dbConnection.oneOrNone(sql, [email]);
        return user;
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        throw error;
    }
}

// Función legacy (mantener compatibilidad si se usa en otro lugar)
async function users(email, password) {
    try {
        const sql = `
            SELECT u.usuario_id, u.email, r.nombre_rol
            FROM usuarios u
            JOIN roles r ON r.rol_id = u.rol_id
            WHERE u.email = $1 AND u.password = $2
            LIMIT 1
        `;
        const user = await dbConnection.oneOrNone(sql, [email, password]);
        return user;
    } catch (error) {
        console.error('Error de conexión a la base de datos:', error);
    }
}

// Validar token de acceso enviado por email
async function validateTokenAccess(usuarioId, tokenIngresado) {
    try {
        const sql = `
            SELECT token_id, token
            FROM tokens_auth
            WHERE usuario_id = $1 AND token = $2
            LIMIT 1
        `;
        const tokenRecord = await dbConnection.oneOrNone(sql, [usuarioId, tokenIngresado]);
        return tokenRecord !== null; // true si existe, false si no
    } catch (error) {
        console.error('Error al validar token de acceso:', error);
        return false;
    }
}

// Eliminar token después de usarlo (opcional, para seguridad)
async function deleteTokenAccess(usuarioId) {
    try {
        const sql = `DELETE FROM tokens_auth WHERE usuario_id = $1`;
        await dbConnection.none(sql, [usuarioId]);
        return true;
    } catch (error) {
        console.error('Error al eliminar token:', error);
        return false;
    }
}

async function actualizarPassword(usuarioId, hashedPassword) {
    try {
        const sql = `UPDATE usuarios SET password = $1 WHERE usuario_id = $2`;
        await dbConnection.none(sql, [hashedPassword, usuarioId]);
        return true;
    } catch (error) {
        console.error('Error al actualizar password:', error);
        throw error;
    }
}

async function actualizarTokenAcceso(usuarioId, nuevoToken) {
    try {
        const existeToken = await dbConnection.oneOrNone(
            'SELECT token_id FROM tokens_auth WHERE usuario_id = $1',
            [usuarioId]
        );

        if (existeToken) {
            await dbConnection.none(
                'UPDATE tokens_auth SET token = $1, fecha_creacion = CURRENT_TIMESTAMP WHERE usuario_id = $2',
                [nuevoToken, usuarioId]
            );
        } else {
            await dbConnection.none(
                'INSERT INTO tokens_auth (usuario_id, token) VALUES ($1, $2)',
                [usuarioId, nuevoToken]
            );
        }
        return true;
    } catch (error) {
        console.error('Error al actualizar token de acceso:', error);
        throw error;
    }
}

export { users, findUserByEmail, validateTokenAccess, deleteTokenAccess, actualizarPassword, actualizarTokenAcceso };
