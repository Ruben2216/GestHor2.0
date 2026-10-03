import { dbConnection } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';

export async function findByEmail(email) {
  const sql = `
    SELECT u.usuario_id, u.email, u.password_hash, u.nombre, u.activo, u.rol_id, u.fecha_creacion, u.ultimo_login,
           r.nombre_rol
    FROM usuarios u
    LEFT JOIN roles r ON r.rol_id = u.rol_id
    WHERE u.email = $1 AND u.activo = TRUE
    LIMIT 1
  `;
  return dbConnection.oneOrNone(sql, [email]);
}

export async function findById(userId) {
  const sql = `
    SELECT u.usuario_id, u.email, u.nombre, u.activo, u.rol_id, u.fecha_creacion, u.ultimo_login,
           r.nombre_rol
    FROM usuarios u
    LEFT JOIN roles r ON r.rol_id = u.rol_id
    WHERE u.usuario_id = $1 AND u.activo = TRUE
    LIMIT 1
  `;
  return dbConnection.oneOrNone(sql, [userId]);
}

export async function findByIdWithPassword(userId) {
  const sql = `
    SELECT u.usuario_id, u.email, u.password_hash, u.nombre, u.activo, u.rol_id, u.fecha_creacion, u.ultimo_login,
           r.nombre_rol
    FROM usuarios u
    LEFT JOIN roles r ON r.rol_id = u.rol_id
    WHERE u.usuario_id = $1
    LIMIT 1
  `;
  return dbConnection.oneOrNone(sql, [userId]);
}

export async function updatePasswordHash(userId, hashedPassword) {
  const sql = `
    UPDATE usuarios 
    SET password_hash = $1, fecha_actualizacion = NOW()
    WHERE usuario_id = $2
  `;
  return dbConnection.none(sql, [hashedPassword, userId]);
}

export async function updateLastLogin(userId) {
  const sql = `
    UPDATE usuarios 
    SET ultimo_login = NOW()
    WHERE usuario_id = $1
  `;
  return dbConnection.none(sql, [userId]);
}

export async function findRoleById(roleId) {
  const sql = `SELECT rol_id, nombre_rol, descripcion, activo FROM roles WHERE rol_id = $1 AND activo = TRUE`;
  return dbConnection.oneOrNone(sql, [roleId]);
}

export async function listRolesByUser(userId) {
  const sql = `
    SELECT r.rol_id, r.nombre_rol, r.descripcion
    FROM roles r
    JOIN usuarios u ON u.rol_id = r.rol_id
    WHERE u.usuario_id = $1 AND r.activo = TRUE
  `;
  return dbConnection.any(sql, [userId]);
}

export async function getUserPermissions(userId) {
  const sql = `
    SELECT DISTINCT p.clave, p.nombre, p.descripcion
    FROM permisos p
    JOIN rol_permisos rp ON rp.permiso_id = p.permiso_id
    JOIN roles r ON r.rol_id = rp.rol_id
    JOIN usuarios u ON u.rol_id = r.rol_id
    WHERE u.usuario_id = $1 AND p.activo = TRUE AND r.activo = TRUE
  `;
  return dbConnection.any(sql, [userId]);
}

export async function createUser({ email, passwordHash, nombre, rolId }) {
  const sql = `
    INSERT INTO usuarios (email, password_hash, nombre, rol_id, activo, fecha_creacion)
    VALUES ($1, $2, $3, $4, TRUE, NOW())
    RETURNING usuario_id, email, nombre, rol_id, fecha_creacion
  `;
  return dbConnection.one(sql, [email, passwordHash, nombre, rolId]);
}

export async function emailExists(email) {
  const sql = `SELECT 1 FROM usuarios WHERE email = $1 LIMIT 1`;
  const result = await dbConnection.oneOrNone(sql, [email]);
  return !!result;
}