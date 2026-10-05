/**
 * ============================================================================
 * GestHor 2.0 - Pantalla de Acceso Denegado (403)
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MdLockOutline, MdArrowBack, MdHome } from 'react-icons/md';

export function UnauthorizedPage({ reason = '', requiredRole = '', userRole = '' }) {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const getDefaultRoute = () => {
    switch (role) {
      case 'administrador':
      case 'editor':
        return '/admin/dashboard';
      case 'profesor':
        return '/profesor/mi-horario';
      case 'alumno':
      case 'estudiante':
      case 'usuario_regular':
        return '/alumno/horarios';
      default:
        return '/login';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: 520,
        width: '100%',
        background: '#ffffff',
        borderRadius: 16,
        padding: '36px 32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <MdLockOutline size={40} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          Acceso Restringido (403)
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.5, marginBottom: 20 }}>
          No cuentas con los permisos o el rol requerido para visualizar este módulo del sistema.
        </p>

        {requiredRole && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 13,
            color: '#475569',
            marginBottom: 24,
            textAlign: 'left'
          }}>
            <div><strong>Tu rol actual:</strong> <span style={{ textTransform: 'capitalize' }}>{userRole || role}</span></div>
            <div><strong>Rol requerido:</strong> <span style={{ textTransform: 'capitalize' }}>{requiredRole}</span></div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <MdArrowBack size={18} />
            Volver atrás
          </button>

          <button
            onClick={() => navigate(getDefaultRoute())}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#1e40af',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <MdHome size={18} />
            Ir a mi panel
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
