import apiClient from './apiClient';
import authStorage from './authStorage';

export async function cerrarSesion() {
  try {
    const refreshToken = authStorage.getRefreshToken();
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
  } catch (error) {
    console.warn('No se pudo invalidar la sesión en el servidor:', error);
  } finally {
    authStorage.clearSession();
  }
}
