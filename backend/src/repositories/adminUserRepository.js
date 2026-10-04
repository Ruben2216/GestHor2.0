import { dbConnection } from '../config/database.js';

export async function listarUsuarios() {
  return dbConnection.any(`
    SELECT u.usuario_id, u.email, u.nombre, u.activo, u.fecha_creacion,
           u.rol_id, r.nombre_rol
    FROM usuarios u
    JOIN roles r ON r.rol_id = u.rol_id
    ORDER BY LOWER(u.email), u.usuario_id
  `);
}

export async function asignarRol({ usuarioId, rolId, actorId }) {
  return dbConnection.tx(async (transaction) => {
    await transaction.one('SELECT pg_advisory_xact_lock(841927, 1)');

    const user = await transaction.oneOrNone(`
      SELECT usuario_id, email, activo, rol_id
      FROM usuarios
      WHERE usuario_id = $1
      FOR UPDATE
    `, [usuarioId]);
    if (!user) return { error: 'user_not_found' };
    if (!user.activo) return { error: 'user_inactive' };
    if (Number(user.usuario_id) === Number(actorId)) return { error: 'self_assignment' };

    const role = await transaction.oneOrNone(`
      SELECT rol_id, nombre_rol
      FROM roles
      WHERE rol_id = $1 AND activo = TRUE
      FOR UPDATE
    `, [rolId]);
    if (!role) return { error: 'role_not_found' };

    if (Number(user.rol_id) === Number(role.rol_id)) {
      return { usuarioId: user.usuario_id, rolId: role.rol_id, nombreRol: role.nombre_rol, changed: false };
    }

    const currentRole = await transaction.one(`
      SELECT nombre_rol FROM roles WHERE rol_id = $1
    `, [user.rol_id]);
    if (currentRole.nombre_rol === 'administrador') {
      const administrators = await transaction.one(`
        SELECT COUNT(*)::integer AS total
        FROM usuarios u
        JOIN roles r ON r.rol_id = u.rol_id
        WHERE u.activo = TRUE AND r.nombre_rol = 'administrador'
      `);
      if (administrators.total <= 1) return { error: 'last_administrator' };
    }

    await transaction.none(
      'UPDATE usuarios SET rol_id = $1, fecha_actualizacion = NOW() WHERE usuario_id = $2',
      [role.rol_id, user.usuario_id]
    );
    await transaction.none(`
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE usuario_id = $1 AND revoked_at IS NULL
    `, [user.usuario_id]);
    await transaction.none(`
      UPDATE user_sessions
      SET revoked_at = NOW(), status = 'revoked'
      WHERE usuario_id = $1 AND status = 'active'
    `, [user.usuario_id]);

    return {
      usuarioId: user.usuario_id,
      email: user.email,
      rolId: role.rol_id,
      nombreRol: role.nombre_rol,
      changed: true,
    };
  });
}
