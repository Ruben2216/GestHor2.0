/**
 * ============================================================================
 * GestHor 2.0 - Componente ProtectedRoute
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 * 
 * Bloquea el acceso a rutas no autorizadas:
 * 1. Si el usuario no está autenticado -> Redirige a /login conservando la ruta intentada.
 * 2. Si se especifican `allowedRoles` y el rol no coincide -> Redirige a /unauthorized o a la ruta default del rol.
 * 3. Si se especifican `requiredPermissions` y falta alguno -> Muestra pantalla de acceso denegado.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UnauthorizedPage from './UnauthorizedPage';

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
}) {
  const { isAuthenticated, isLoading, user, role, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #e2e8f0',
          borderTopColor: '#1d4ed8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: 16, color: '#475569', fontWeight: 500 }}>
          Verificando credenciales de acceso...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Si no está autenticado, enviar a login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validar rol si se definieron roles permitidos
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    if (fallback) return fallback;
    return <UnauthorizedPage reason="rol_no_autorizado" requiredRole={allowedRoles.join(' o ')} userRole={role} />;
  }

  // Validar permisos requeridos si se definieron
  if (requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => hasPermission(perm));
    if (!hasAll) {
      if (fallback) return fallback;
      return <UnauthorizedPage reason="permiso_faltante" requiredPermissions={requiredPermissions} userRole={role} />;
    }
  }

  return children;
}

export default ProtectedRoute;
