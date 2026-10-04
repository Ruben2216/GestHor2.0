import { dbConnection } from '../config/database.js';

export async function listarRoles() {
  return dbConnection.any(`
    SELECT r.rol_id, r.nombre_rol, r.descripcion, r.activo, r.fecha_creacion,
           COUNT(DISTINCT u.usuario_id)::integer AS usuarios
    FROM roles r
    LEFT JOIN usuarios u ON u.rol_id = r.rol_id
    GROUP BY r.rol_id
    ORDER BY r.rol_id
  `);
}

export async function crearRol({ nombre, descripcion }) {
  return dbConnection.one(`
    INSERT INTO roles (nombre_rol, descripcion, activo)
    VALUES ($1, $2, TRUE)
    RETURNING rol_id, nombre_rol, descripcion, activo, fecha_creacion
  `, [nombre, descripcion]);
}

export async function obtenerRolPorId(rolId) {
  return dbConnection.oneOrNone(
    'SELECT rol_id FROM roles WHERE rol_id = $1',
    [rolId]
  );
}

export async function actualizarRol(rolId, { nombre, descripcion, activo }) {
  return dbConnection.oneOrNone(`
    UPDATE roles
    SET nombre_rol = $1, descripcion = $2, activo = $3
    WHERE rol_id = $4
    RETURNING rol_id, nombre_rol, descripcion, activo, fecha_creacion
  `, [nombre, descripcion, activo, rolId]);
}

export async function listarPermisosPorRol(rolId) {
  return dbConnection.any(`
    SELECT p.permiso_id, p.clave, p.nombre, p.descripcion, p.activo,
           (rp.rol_id IS NOT NULL) AS asignado
    FROM permisos p
    LEFT JOIN rol_permisos rp ON rp.permiso_id = p.permiso_id AND rp.rol_id = $1
    ORDER BY split_part(p.clave, ':', 1), p.clave
  `, [rolId]);
}

export async function guardarPermisosPorRol(rolId, permisoIds) {
  return dbConnection.tx(async (transaction) => {
    const role = await transaction.oneOrNone(
      'SELECT rol_id FROM roles WHERE rol_id = $1',
      [rolId]
    );
    if (!role) return false;

    const validPermissions = await transaction.any(
      'SELECT permiso_id FROM permisos WHERE activo = TRUE AND permiso_id = ANY($1::integer[])',
      [permisoIds]
    );
    if (validPermissions.length !== permisoIds.length) {
      const error = new Error('La selección contiene permisos inexistentes o inactivos');
      error.statusCode = 400;
      throw error;
    }

    await transaction.none('DELETE FROM rol_permisos WHERE rol_id = $1', [rolId]);
    for (const permissionId of permisoIds) {
      await transaction.none(
        'INSERT INTO rol_permisos (rol_id, permiso_id) VALUES ($1, $2)',
        [rolId, permissionId]
      );
    }
    return true;
  });
}
