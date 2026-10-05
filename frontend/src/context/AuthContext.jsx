/**
 * ============================================================================
 * GestHor 2.0 - Contexto Global de Autenticación y Autorización
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient, { sanitizeApiError } from '../services/apiClient';
import authStorage from '../services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [permissions, setPermissions] = useState(() => authStorage.getPermissions());
  const [isLoading, setIsLoading] = useState(true);

  // Normalizar el rol para comparaciones homogéneas
  const getNormalizedRole = (rolName) => {
    if (!rolName) return '';
    const r = String(rolName).toLowerCase().trim();
    if (r === 'docente') return 'editor';
    if (r === 'estudiante') return 'alumno';
    return r;
  };

  const currentRole = getNormalizedRole(user?.rol);

  /**
   * Carga los permisos actualizados del usuario desde el backend
   */
  const loadUserPermissions = useCallback(async () => {
    if (!authStorage.getAccessToken()) {
      setPermissions([]);
      return [];
    }

    try {
      const response = await apiClient.get('/auth/permisos');
      const data = response.data?.data || response.data;
      const loadedPerms = Array.isArray(data?.permisos) ? data.permisos : [];
      setPermissions(loadedPerms);
      authStorage.setPermissions(loadedPerms);
      return loadedPerms;
    } catch {
      // Si falla, conservar los que ya estaban cacheados
      return authStorage.getPermissions();
    }
  }, []);

  // Verificar la sesión al inicializar la aplicación
  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getAccessToken();
      const savedUser = authStorage.getUser();

      if (token && savedUser) {
        setUser(savedUser);
        await loadUserPermissions();
      } else {
        authStorage.clearSession();
        setUser(null);
        setPermissions([]);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [loadUserPermissions]);

  /**
   * Inicio de sesión local con credenciales
   */
  const login = async (email, password, tipoUsuario = '') => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        correo: email,
        password,
        contraseña: password,
        tipoUsuario,
      });

      const resData = response.data?.data || response.data;
      const accessToken = resData?.accessToken;
      const refreshToken = resData?.refreshToken;
      const usuario = resData?.usuario;

      if (!accessToken || !usuario) {
        throw new Error('Respuesta de autenticación incompleta');
      }

      const userData = {
        id: usuario.id || usuario.usuario_id,
        usuario_id: usuario.id || usuario.usuario_id,
        email: usuario.email,
        rol: usuario.rol || usuario.nombre_rol,
        nombre: usuario.nombre || usuario.nombres || usuario.email.split('@')[0],
      };

      authStorage.saveSession({
        accessToken,
        refreshToken,
        usuario: userData,
        permisos: [],
      });

      setUser(userData);

      // Cargar permisos inmediatamente
      await loadUserPermissions();

      return {
        success: true,
        user: userData,
        role: getNormalizedRole(userData.rol),
      };
    } catch (error) {
      const sanitized = sanitizeApiError(error);
      return {
        success: false,
        message: sanitized.message,
      };
    }
  };

  /**
   * Cierre de sesión seguro en cliente y servidor
   */
  const logout = async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      authStorage.clearSession();
      setUser(null);
      setPermissions([]);
      window.location.href = '/login';
    }
  };

  /**
   * Verifica si el usuario tiene uno de los roles permitidos
   * @param {string|string[]} roles
   */
  const hasRole = useCallback(
    (roles) => {
      if (!user || !user.rol) return false;
      const allowed = Array.isArray(roles) ? roles : [roles];
      const normalizedAllowed = allowed.map(getNormalizedRole);
      return normalizedAllowed.includes(currentRole);
    },
    [user, currentRole]
  );

  /**
   * Verifica si el usuario cuenta con un permiso específico
   * @param {string} permissionKey
   */
  const hasPermission = useCallback(
    (permissionKey) => {
      if (!user) return false;
      // Administrador cuenta con todos los permisos implícitos
      if (currentRole === 'administrador') return true;
      if (!permissionKey) return true;
      return permissions.includes(permissionKey);
    },
    [user, currentRole, permissions]
  );

  const value = {
    user,
    role: currentRole,
    rawRole: user?.rol,
    permissions,
    isAuthenticated: !!user && !!authStorage.getAccessToken(),
    isLoading,
    login,
    logout,
    hasRole,
    hasPermission,
    can: hasPermission,
    loadUserPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
