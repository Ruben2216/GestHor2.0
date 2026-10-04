import * as roleRepository from '../repositories/roleRepository.js';

const RESERVED_ROLE_NAMES = new Set(['administrador', 'profesor']);
const ROLE_NAME_PATTERN = /^[a-z][a-z0-9_-]{1,49}$/;

export async function listarRolesController(_req, res) {
  try {
    const roles = await roleRepository.listarRoles();
    return res.json({ ok: true, roles });
  } catch (error) {
    console.error('Error al listar roles:', error);
    return res.status(500).json({ ok: false, message: 'No se pudieron consultar los roles' });
  }
}

export async function crearRolController(req, res) {
  const nombre = typeof req.body.nombre_rol === 'string' ? req.body.nombre_rol.trim().toLowerCase() : '';
  const descripcion = typeof req.body.descripcion === 'string' ? req.body.descripcion.trim() : '';

  if (!ROLE_NAME_PATTERN.test(nombre)) {
    return res.status(400).json({
      ok: false,
      message: 'El nombre debe tener entre 2 y 50 caracteres: letras minúsculas, números, guion o guion bajo',
    });
  }
  if (descripcion.length > 500) {
    return res.status(400).json({ ok: false, message: 'La descripción no puede exceder 500 caracteres' });
  }

  try {
    const role = await roleRepository.crearRol({ nombre, descripcion });
    return res.status(201).json({ ok: true, rol: role });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ ok: false, message: 'Ya existe un rol con ese nombre' });
    }
    console.error('Error al crear rol:', error);
    return res.status(500).json({ ok: false, message: 'No se pudo crear el rol' });
  }
}

export async function actualizarRolController(req, res) {
  const rolId = Number.parseInt(req.params.id, 10);
  const nombre = typeof req.body.nombre_rol === 'string' ? req.body.nombre_rol.trim().toLowerCase() : '';
  const { descripcion, activo } = req.body;

  if (!Number.isInteger(rolId) || rolId < 1 || !ROLE_NAME_PATTERN.test(nombre)
    || typeof activo !== 'boolean'
    || typeof descripcion !== 'string' || descripcion.trim().length > 500) {
    return res.status(400).json({ ok: false, message: 'Los datos del rol no son válidos' });
  }

  try {
    const currentRoles = await roleRepository.listarRoles();
    const currentRole = currentRoles.find((item) => item.rol_id === rolId);
    if (!currentRole) return res.status(404).json({ ok: false, message: 'Rol no encontrado' });
    if (RESERVED_ROLE_NAMES.has(currentRole.nombre_rol) && currentRole.nombre_rol !== nombre) {
      return res.status(400).json({ ok: false, message: 'No se puede renombrar un rol reservado del sistema' });
    }
    if (RESERVED_ROLE_NAMES.has(currentRole.nombre_rol) && !activo) {
      return res.status(400).json({ ok: false, message: 'No se puede desactivar un rol reservado del sistema' });
    }
    if (!activo && currentRole.usuarios > 0) {
      return res.status(409).json({
        ok: false,
        message: 'No se puede desactivar un rol que todavía tiene usuarios asignados',
      });
    }

    const role = await roleRepository.actualizarRol(rolId, {
      nombre,
      descripcion: descripcion.trim(),
      activo,
    });
    if (!role) return res.status(404).json({ ok: false, message: 'Rol no encontrado' });
    return res.json({ ok: true, rol: role });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ ok: false, message: 'Ya existe un rol con ese nombre' });
    }
    console.error('Error al actualizar rol:', error);
    return res.status(500).json({ ok: false, message: 'No se pudo actualizar el rol' });
  }
}

export async function listarPermisosRolController(req, res) {
  const rolId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(rolId) || rolId < 1) {
    return res.status(400).json({ ok: false, message: 'El identificador del rol no es válido' });
  }

  try {
    const role = await roleRepository.obtenerRolPorId(rolId);
    if (!role) return res.status(404).json({ ok: false, message: 'Rol no encontrado' });
    const permisos = await roleRepository.listarPermisosPorRol(rolId);
    return res.json({ ok: true, permisos });
  } catch (error) {
    console.error('Error al consultar permisos del rol:', error);
    return res.status(500).json({ ok: false, message: 'No se pudieron consultar los permisos del rol' });
  }
}

export async function guardarPermisosRolController(req, res) {
  const rolId = Number.parseInt(req.params.id, 10);
  const permisoIds = req.body.permisoIds;

  if (!Number.isInteger(rolId) || rolId < 1 || !Array.isArray(permisoIds)
    || permisoIds.some((id) => !Number.isInteger(id) || id < 1)
    || new Set(permisoIds).size !== permisoIds.length) {
    return res.status(400).json({ ok: false, message: 'La lista de permisos no es válida' });
  }

  try {
    const updated = await roleRepository.guardarPermisosPorRol(rolId, permisoIds);
    if (!updated) return res.status(404).json({ ok: false, message: 'Rol no encontrado' });
    return res.json({ ok: true, message: 'Permisos del rol actualizados' });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ ok: false, message: error.message });
    }
    console.error('Error al guardar permisos del rol:', error);
    return res.status(500).json({ ok: false, message: 'No se pudieron actualizar los permisos del rol' });
  }
}
