/**
 * ============================================================================
 * GestHor 2.0 - Componente PermissionGate (Control Visual por Permiso)
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 * 
 * Uso:
 * <PermissionGate permission="horarios:crear">
 *    <button onClick={handleCrear}>Nuevo Horario</button>
 * </PermissionGate>
 * 
 * O con fallback:
 * <PermissionGate permission="materias:editar" fallback={<span className="disabled-badge">Solo lectura</span>}>
 *    <button onClick={handleEditar}>Editar</button>
 * </PermissionGate>
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export function PermissionGate({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children,
}) {
  const { hasPermission, role } = useAuth();

  // El administrador siempre tiene acceso completo
  if (role === 'administrador') {
    return <>{children}</>;
  }

  // Si se envió un solo permiso
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : fallback;
  }

  // Si se envió un arreglo de permisos
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every((p) => hasPermission(p))
      : permissions.some((p) => hasPermission(p));

    return hasAccess ? <>{children}</> : fallback;
  }

  return <>{children}</>;
}

export default PermissionGate;
