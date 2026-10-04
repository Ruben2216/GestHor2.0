import * as adminUserRepository from '../repositories/adminUserRepository.js';

export async function listarUsuariosController(_req, res) {
  try {
    const usuarios = await adminUserRepository.listarUsuarios();
    return res.json({ ok: true, usuarios });
  } catch (error) {
    console.error('Error al consultar usuarios para asignación de roles:', error);
    return res.status(500).json({ ok: false, message: 'No se pudieron consultar los usuarios' });
  }
}

export async function asignarRolUsuarioController(req, res) {
  const usuarioId = Number.parseInt(req.params.id, 10);
  const rolId = req.body.rolId;

  if (!Number.isInteger(usuarioId) || usuarioId < 1
    || !Number.isInteger(rolId) || rolId < 1) {
    return res.status(400).json({ ok: false, message: 'El usuario o rol seleccionado no es válido' });
  }

  try {
    const result = await adminUserRepository.asignarRol({
      usuarioId,
      rolId,
      actorId: req.user.id,
    });

    if (result.error === 'user_not_found') {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }
    if (result.error === 'user_inactive') {
      return res.status(409).json({ ok: false, message: 'No se puede asignar un rol a un usuario inactivo' });
    }
    if (result.error === 'role_not_found') {
      return res.status(404).json({ ok: false, message: 'El rol no existe o está inactivo' });
    }
    if (result.error === 'self_assignment') {
      return res.status(409).json({ ok: false, message: 'No puedes cambiar tu propio rol desde esta pantalla' });
    }
    if (result.error === 'last_administrator') {
      return res.status(409).json({ ok: false, message: 'No se puede quitar el rol al último administrador activo' });
    }

    return res.json({
      ok: true,
      message: result.changed
        ? 'Rol asignado. El usuario tendrá que iniciar sesión nuevamente.'
        : 'El usuario ya tiene ese rol asignado.',
      usuario: result,
    });
  } catch (error) {
    console.error('Error al asignar rol al usuario:', error);
    return res.status(500).json({ ok: false, message: 'No se pudo asignar el rol' });
  }
}
