// Interceptor de autenticación para fetch y axios, que renueva el access token automáticamente

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Rutas que no llevan token ni deben disparar el refresh/redirección
const RUTAS_PUBLICAS = ['/auth/login', '/auth/refresh', '/auth/google', '/auth/forgot-password', '/auth/reset-password'];

const fetchOriginal = window.fetch.bind(window);
let refreshEnCurso = null;

function esDeLaApi(url) {
  return typeof url === 'string' && url.startsWith(API_BASE);
}

function esPublica(url) {
  const ruta = url.slice(API_BASE.length).split('?')[0];
  return RUTAS_PUBLICAS.some((r) => ruta.startsWith(r));
}

function cerrarSesionLocal() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  const { pathname } = window.location;
  if (pathname !== '/' && pathname !== '/login') {
    window.location.href = '/';
  }
}

// Renueva el access token; varias peticiones simultáneas comparten el mismo refresh
function renovarToken() {
  if (!refreshEnCurso) {
    refreshEnCurso = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const res = await fetchOriginal(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) return null;

      localStorage.setItem('accessToken', body.data.accessToken);
      localStorage.setItem('refreshToken', body.data.refreshToken);
      return body.data.accessToken;
    })()
      .catch(() => null)
      .finally(() => {
        refreshEnCurso = null;
      });
  }
  return refreshEnCurso;
}

// ---------------------------------------------------------------- axios
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && esDeLaApi(config.url) && !esPublica(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.response?.status !== 401 || !config || !esDeLaApi(config.url) || esPublica(config.url)) {
      return Promise.reject(error);
    }

    if (!config._reintentado) {
      config._reintentado = true;
      const nuevoToken = await renovarToken();
      if (nuevoToken) {
        config.headers.Authorization = `Bearer ${nuevoToken}`;
        return axios(config);
      }
    }

    cerrarSesionLocal();
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------- fetch
function conToken(init, token) {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}

window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : null;
  if (!esDeLaApi(url) || esPublica(url)) {
    return fetchOriginal(input, init);
  }

  const token = localStorage.getItem('accessToken');
  const res = await fetchOriginal(input, token ? conToken(init, token) : init);
  if (res.status !== 401) return res;

  const nuevoToken = await renovarToken();
  if (nuevoToken) {
    const reintento = await fetchOriginal(input, conToken(init, nuevoToken));
    if (reintento.status !== 401) return reintento;
  }

  cerrarSesionLocal();
  return res;
};
