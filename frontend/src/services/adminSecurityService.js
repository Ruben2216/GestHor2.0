import apiClient from './apiClient';

export async function obtenerRoles() {
  const { data } = await apiClient.get('/admin/roles');
  return data.roles;
}

export async function crearRol(rol) {
  const { data } = await apiClient.post('/admin/roles', rol);
  return data.rol;
}

export async function actualizarRol(id, rol) {
  const { data } = await apiClient.put(`/admin/roles/${id}`, rol);
  return data.rol;
}

export async function obtenerPermisosRol(id) {
  const { data } = await apiClient.get(`/admin/roles/${id}/permisos`);
  return data.permisos;
}

export async function guardarPermisosRol(id, permisoIds) {
  const { data } = await apiClient.put(`/admin/roles/${id}/permisos`, { permisoIds });
  return data;
}

export async function obtenerUsuarios() {
  const { data } = await apiClient.get('/admin/usuarios');
  return data.usuarios;
}

export async function asignarRolUsuario(usuarioId, rolId) {
  const { data } = await apiClient.put(`/admin/usuarios/${usuarioId}/rol`, { rolId });
  return data;
}

export async function consultarAuditoria(filtros) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params.set(key, value);
  });
  const { data } = await apiClient.get(`/auditoria?${params.toString()}`);
  return data;
}
