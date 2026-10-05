/**
 * ============================================================================
 * GestHor 2.0 - Hook usePermissions
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 */

import { useAuth } from './useAuth';

export function usePermissions() {
  const { permissions, role, hasPermission, hasRole, user } = useAuth();

  return {
    permissions,
    role,
    user,
    // Verificadores rápidos por acción
    can: hasPermission,
    hasPermission,
    hasRole,

    // Verificadores convenientes de módulos y acciones
    canReadHorarios: hasPermission('horarios:leer'),
    canCreateHorarios: hasPermission('horarios:crear'),
    canEditHorarios: hasPermission('horarios:editar'),
    canDeleteHorarios: hasPermission('horarios:eliminar'),

    canReadMaterias: hasPermission('materias:leer'),
    canCreateMaterias: hasPermission('materias:crear'),
    canEditMaterias: hasPermission('materias:editar'),
    canDeleteMaterias: hasPermission('materias:eliminar'),

    canReadDocentes: hasPermission('docentes:leer'),
    canCreateDocentes: hasPermission('docentes:crear'),
    canEditDocentes: hasPermission('docentes:editar'),
    canDeleteDocentes: hasPermission('docentes:eliminar'),

    canReadLugares: hasPermission('lugares:leer'),
    canCreateLugares: hasPermission('lugares:crear'),
    canEditLugares: hasPermission('lugares:editar'),
    canDeleteLugares: hasPermission('lugares:eliminar'),

    isAdmin: role === 'administrador',
    isEditor: role === 'editor' || role === 'docente',
    isProfesor: role === 'profesor',
    isAlumno: role === 'alumno' || role === 'estudiante' || role === 'usuario_regular',
  };
}

export default usePermissions;
