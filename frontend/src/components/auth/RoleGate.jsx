/**
 * ============================================================================
 * GestHor 2.0 - Componente RoleGate (Control Visual por Rol)
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export function RoleGate({ allowedRoles = [], fallback = null, children }) {
  const { hasRole } = useAuth();

  if (allowedRoles.length === 0) return <>{children}</>;

  return hasRole(allowedRoles) ? <>{children}</> : fallback;
}

export default RoleGate;
