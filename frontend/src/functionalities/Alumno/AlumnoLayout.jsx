/**
 * ============================================================================
 * GestHor 2.0 - Layout para Rol Alumno / Estudiante (Solo Consulta)
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 */

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  MdOutlineSchool, 
  MdCalendarToday, 
  MdMenuBook, 
  MdOutlineLogout, 
  MdPerson 
} from 'react-icons/md';

export default function AlumnoLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: isActive ? '700' : '500',
    color: isActive ? '#1e40af' : '#475569',
    background: isActive ? '#eff6ff' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Barra superior de navegación */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Marca / Identidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(30, 64, 175, 0.2)'
            }}>
              <MdOutlineSchool size={26} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                GestHor <span style={{ color: '#2563eb', fontSize: '14px', fontWeight: '600' }}>· Portal Alumno</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Universidad Autónoma de Chiapas (UNACH)
              </div>
            </div>
          </div>

          {/* Menú de Consulta */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NavLink to="/alumno/horarios" style={navLinkStyle}>
              <MdCalendarToday size={18} />
              Horarios de Clase
            </NavLink>
            <NavLink to="/alumno/materias" style={navLinkStyle}>
              <MdMenuBook size={18} />
              Catálogo de Materias
            </NavLink>
          </nav>

          {/* Perfil y Cierre de Sesión */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#f1f5f9',
              padding: '6px 14px',
              borderRadius: '20px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155'
              }}>
                <MdPerson size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                  {user?.nombre || user?.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '500', textTransform: 'capitalize' }}>
                  Estudiante / Alumno
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                background: '#fff5f5',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <MdOutlineLogout size={16} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '24px' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        Sistema GestHor · Universidad Autónoma de Chiapas · Módulo de Consulta para Alumnos
      </footer>
    </div>
  );
}
