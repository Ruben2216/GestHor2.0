/**
 * ============================================================================
 * GestHor 2.0 - Layout Administrativo y de Edición con Control Visual por Rol
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 * 
 * Cumplimiento de Criterios:
 * 1. Mantiene 100% de las pantallas y módulos del Administrador sin eliminar nada.
 * 2. Oculta al Editor las opciones de "Roles y permisos", "Asignar roles" y "Auditoría".
 * 3. Utiliza cierre de sesión centralizado con limpieza de tokens.
 */

import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/admin.css";

import { 
  MdDashboard, 
  MdOutlineSettings, 
  MdOutlineLogout, 
  MdManageAccounts, 
  MdHistory,
  MdPerson
} from "react-icons/md";
import { 
  FaChalkboardTeacher, 
  FaBookOpen, 
  FaRegBuilding, 
  FaRegClock, 
  FaClipboardList 
} from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, role, logout, hasRole } = useAuth();

  const linkClass = ({ isActive }) => `sidebar__link${isActive ? " active" : ""}`;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const esAdmin = hasRole('administrador');
  const esEditor = hasRole(['editor', 'docente']);

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="sidebar__header">
          <h1 className="sidebar__title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MdDashboard size={22} aria-hidden="true" />
            {esAdmin ? 'Panel Admin' : 'Panel de Edición'}
          </h1>
          <p className="sidebar__subtitle">Sistema GestHor · UNACH</p>

          {/* Información del usuario y rol */}
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12,
            color: '#e2e8f0'
          }}>
            <MdPerson size={20} style={{ color: '#93c5fd' }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.nombre || user?.email?.split('@')[0]}
              </div>
              <div style={{ color: '#93c5fd', textTransform: 'capitalize', fontSize: 11 }}>
                Rol: {user?.rol || role}
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__list">
            <li className="sidebar__item">
              <NavLink to="/admin/dashboard" className={linkClass}>
                <MdDashboard size={18} style={{ marginRight: 8 }} aria-hidden="true" />
                Dashboard
              </NavLink>
            </li>
            <li className="sidebar__item">
              <NavLink to="/admin/docentes" className={linkClass}>
                <FaChalkboardTeacher size={17} style={{ marginRight: 8 }} aria-hidden="true" />
                Docentes
              </NavLink>
            </li>
            <li className="sidebar__item">
              <NavLink to="/admin/materias" className={linkClass}>
                <FaBookOpen size={17} style={{ marginRight: 8 }} aria-hidden="true" />
                Materias
              </NavLink>
            </li>
            <li className="sidebar__item">
              <NavLink to="/admin/planes" className={linkClass}>
                <HiOutlineAcademicCap size={18} style={{ marginRight: 8 }} aria-hidden="true" />
                Planes de Estudio
              </NavLink>
            </li>
            <li className="sidebar__item">
              <NavLink to="/admin/lugares" className={linkClass}>
                <FaRegBuilding size={17} style={{ marginRight: 8 }} aria-hidden="true" />
                Lugares
              </NavLink>
            </li>
            <li className="sidebar__item">
              <NavLink to="/admin/horarios" className={linkClass}>
                <FaRegClock size={17} style={{ marginRight: 8 }} aria-hidden="true" />
                Horarios
              </NavLink>
            </li>
            <li className="sidebar__item">
              <NavLink to="/admin/solicitudes" className={linkClass}>
                <FaClipboardList size={16} style={{ marginRight: 8 }} aria-hidden="true" />
                Solicitudes
              </NavLink>
            </li>

            {/* Módulos Exclusivos para Administrador (El editor NO los visualiza) */}
            {esAdmin && (
              <>
                <li className="sidebar__item">
                  <NavLink to="/admin/roles" className={linkClass}>
                    <MdManageAccounts size={18} style={{ marginRight: 8 }} aria-hidden="true" />
                    Roles y permisos
                  </NavLink>
                </li>
                <li className="sidebar__item">
                  <NavLink to="/admin/usuarios" className={linkClass}>
                    <MdManageAccounts size={18} style={{ marginRight: 8 }} aria-hidden="true" />
                    Asignar roles
                  </NavLink>
                </li>
                <li className="sidebar__item">
                  <NavLink to="/admin/auditoria" className={linkClass}>
                    <MdHistory size={18} style={{ marginRight: 8 }} aria-hidden="true" />
                    Auditoría
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div style={{ padding: "12px 16px" }}>
          <div>
            <NavLink
              to="/admin/configuracion"
              className={linkClass}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MdOutlineSettings size={18} aria-hidden="true" />
                Configuración
              </span>
            </NavLink>
          </div>
        </div>

        <div className="sidebar__footer">
          <button
            className="sidebar__logout"
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}
            title="Cerrar sesión"
          >
            <MdOutlineLogout size={18} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <section className="admin__main">
        <main className="main__content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
