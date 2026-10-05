/**
 * ============================================================================
 * GestHor 2.0 - Servicio Centralizado de Almacenamiento de Sesión
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 * 
 * NOTA DE SEGURIDAD Y ARQUITECTURA:
 * El almacenamiento en localStorage implementado aquí representa una capa
 * de abstracción provisional para la persistencia del cliente en desarrollo.
 * La arquitectura de esta capa permite una transición directa y transparente
 * hacia cookies seguras con directivas HttpOnly, Secure y SameSite=Strict/Lax
 * en producción cuando el backend configure el transporte seguro de sesión.
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  PERMISSIONS: 'user_permissions',
};

export const authStorage = {
  /**
   * Obtiene el access token JWT actual
   * @returns {string|null}
   */
  getAccessToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch {
      return null;
    }
  },

  /**
   * Guarda el access token JWT
   * @param {string} token
   */
  setAccessToken(token) {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
    } catch (e) {
      console.warn('[authStorage] No se pudo guardar accessToken:', e);
    }
  },

  /**
   * Obtiene el refresh token actual
   * @returns {string|null}
   */
  getRefreshToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  },

  /**
   * Guarda el refresh token
   * @param {string} refreshToken
   */
  setRefreshToken(refreshToken) {
    try {
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    } catch (e) {
      console.warn('[authStorage] No se pudo guardar refreshToken:', e);
    }
  },

  /**
   * Obtiene los datos del usuario en sesión
   * @returns {object|null}
   */
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Guarda los datos del usuario en sesión
   * @param {object} user
   */
  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.warn('[authStorage] No se pudo guardar usuario:', e);
    }
  },

  /**
   * Obtiene la lista de claves de permisos del usuario
   * @returns {string[]}
   */
  getPermissions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Guarda la lista de permisos del usuario
   * @param {string[]} permissions
   */
  setPermissions(permissions) {
    try {
      if (Array.isArray(permissions)) {
        localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
      }
    } catch (e) {
      console.warn('[authStorage] No se pudieron guardar permisos:', e);
    }
  },

  /**
   * Guarda todos los datos de la sesión al iniciar sesión
   * @param {{ accessToken: string, refreshToken: string, usuario: object, permisos?: string[] }} data
   */
  saveSession({ accessToken, refreshToken, usuario, permisos = [] }) {
    if (accessToken) this.setAccessToken(accessToken);
    if (refreshToken) this.setRefreshToken(refreshToken);
    if (usuario) this.setUser(usuario);
    if (permisos) this.setPermissions(permisos);
  },

  /**
   * Limpia todos los datos de sesión almacenados
   */
  clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
    } catch (e) {
      console.warn('[authStorage] Error al limpiar sesión:', e);
    }
  },

  /**
   * Verifica si existe un token en almacenamiento
   * @returns {boolean}
   */
  hasSession() {
    return !!this.getAccessToken();
  }
};

export default authStorage;
