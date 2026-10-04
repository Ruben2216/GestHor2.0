import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export async function obtenerRoles() {
  const { data } = await axios.get(`${API_URL}/admin/roles`);
  return data.roles;
}

export async function crearRol(rol) {
  const { data } = await axios.post(`${API_URL}/admin/roles`, rol);
  return data.rol;
}

export async function actualizarRol(id, rol) {
  const { data } = await axios.put(`${API_URL}/admin/roles/${id}`, rol);
  return data.rol;
}

export async function obtenerPermisosRol(id) {
  const { data } = await axios.get(`${API_URL}/admin/roles/${id}/permisos`);
  return data.permisos;
}

export async function guardarPermisosRol(id, permisoIds) {
  const { data } = await axios.put(`${API_URL}/admin/roles/${id}/permisos`, { permisoIds });
  return data;
}

export async function obtenerUsuarios() {
  const { data } = await axios.get(`${API_URL}/admin/usuarios`);
  return data.usuarios;
}

export async function asignarRolUsuario(usuarioId, rolId) {
  const { data } = await axios.put(`${API_URL}/admin/usuarios/${usuarioId}/rol`, { rolId });
  return data;
}

export async function consultarAuditoria(filtros) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params.set(key, value);
  });
  const { data } = await axios.get(`${API_URL}/auditoria?${params.toString()}`);
  return data;
}
