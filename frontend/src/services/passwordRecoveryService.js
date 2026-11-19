import apiClient from './apiClient';

export async function solicitarCodigoRecuperacion(email) {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
}

export async function restablecerConCodigo({ email, code, newPassword }) {
  const response = await apiClient.post('/auth/reset-password', { email, code, newPassword });
  return response.data;
}
