/**
 * ============================================================================
 * GestHor 2.0 - Cliente HTTP Centralizado (Axios)
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 * 
 * Cumplimiento de requerimientos:
 * 1. Cliente centralizado para todas las solicitudes HTTP.
 * 2. Inyección automática del encabezado Authorization: Bearer <token>.
 * 3. Manejo transparente de token expirado (HTTP 401) con renovación (refresh token rotatorio).
 * 4. Redirección segura a /login ante sesión inválida/expirada.
 * 5. Sanitización de mensajes de error para no exponer información interna del backend.
 */

import axios from 'axios';
import { authStorage } from './authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Rutas públicas que no deben incluir el token ni reintentar refresh
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/google',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/recovery',
];

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Verifica si una URL pertenece a un endpoint público
 */
function isPublicEndpoint(url) {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// ----------------------------------------------------------------------
// Interceptor de Solicitud: Inyección automática de Bearer Token
// ----------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    if (!isPublicEndpoint(config.url)) {
      const token = authStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------------------------
// Interceptor de Respuesta: Manejo de 401, Refresh y Formato de Errores
// ----------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no hay respuesta del servidor o no hay config
    if (!error.response || !originalRequest) {
      return Promise.reject(sanitizeApiError(error));
    }

    const { status } = error.response;

    // Si recibimos 401 y no es un endpoint público ni un reintento
    if (status === 401 && !originalRequest._retry && !isPublicEndpoint(originalRequest.url)) {
      if (isRefreshing) {
        // Encolar peticiones mientras se renueva el token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(sanitizeApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authStorage.getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        authStorage.clearSession();
        redirectToLogin();
        return Promise.reject(sanitizeApiError(error));
      }

      try {
        // Petición directa sin interceptor para renovar token
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const data = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;

        if (newAccessToken) {
          authStorage.setAccessToken(newAccessToken);
          if (newRefreshToken) {
            authStorage.setRefreshToken(newRefreshToken);
          }

          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Respuesta de renovación inválida');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        authStorage.clearSession();
        redirectToLogin();
        return Promise.reject(sanitizeApiError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(sanitizeApiError(error));
  }
);

/**
 * Sanitiza los errores para evitar fugas de información interna hacia la UI
 */
export function sanitizeApiError(error) {
  // Si no hay respuesta del servidor (error de red, timeout, CORS)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'El servidor tardó demasiado en responder. Por favor, intenta de nuevo.',
        status: 408,
      };
    }
    // Error de red/CORS - no confundir con error de credenciales
    return {
      message: 'No se pudo establecer conexión con el servidor. Verifica tu conexión a internet.',
      status: 0,
    };
  }

  const { status, data } = error.response;
  // Priorizar mensaje del backend (ya viene sanitizado del servidor)
  let message = data?.message || data?.error;

  // Si el mensaje contiene detalles internos de SQL o rutas del servidor, reemplazar por genérico
  if (
    typeof message === 'string' &&
    (message.includes('pg_') ||
      message.includes('syntax error') ||
      message.includes('relation') ||
      message.includes('Unhandled') ||
      message.includes('TypeError') ||
      message.includes('stack'))
  ) {
    message = 'Ocurrió un error inesperado al procesar la solicitud.';
  }

  // Fallback solo si el backend NO envió mensaje
  if (!message) {
    switch (status) {
      case 400:
        message = 'La solicitud contiene datos inválidos o incompletos.';
        break;
      case 401:
        message = 'Tu sesión ha expirado o las credenciales son incorrectas.';
        break;
      case 403:
        message = 'No tienes los permisos necesarios para realizar esta acción.';
        break;
      case 404:
        message = 'El recurso solicitado no fue encontrado.';
        break;
      case 409:
        message = 'Existe un conflicto con la información proporcionada (registro duplicado).';
        break;
      case 429:
        message = 'Demasiadas solicitudes. Por favor, espera un momento.';
        break;
      case 500:
      default:
        message = 'Ocurrió un error interno en el servidor. Por favor, intenta más tarde.';
        break;
    }
  }

  return {
    status,
    message,
    code: data?.code,
    details: data?.details,
    originalError: error,
  };
}

/**
 * Redirige al login limpiando el estado de navegación
 */
function redirectToLogin() {
  const currentPath = window.location.pathname;
  if (currentPath !== '/' && currentPath !== '/login') {
    window.location.href = `/login?session_expired=1`;
  }
}

export default apiClient;
