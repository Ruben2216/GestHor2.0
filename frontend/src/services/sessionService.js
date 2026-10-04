import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export async function cerrarSesion() {
  try {
    await axios.post(`${API_URL}/auth/logout`, {
      refreshToken: localStorage.getItem('refreshToken'),
    });
  } catch (error) {
    console.error('No se pudo invalidar la sesión en el servidor:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}
