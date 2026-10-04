import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/admin.css";

import { MdDashboard, MdOutlineSchool, MdOutlineSettings, MdOutlineLogout } from "react-icons/md";
import { FaChalkboardTeacher, FaBookOpen, FaRegBuilding, FaRegClock, FaClipboardList } from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { MdManageAccounts, MdHistory } from "react-icons/md";
import { cerrarSesion } from "../../services/sessionService";

export default function AdminLayout() {
    const navigate = useNavigate();
    const linkClass = ({ isActive }) => `sidebar__link${isActive ? " active" : ""}`;
    const handleLogout = async () => {
        await cerrarSesion();
        navigate("/login");
    };

    return (
        <div className="admin">
            <aside className="admin__sidebar">
                <div className="sidebar__header">
                    <h1 className="sidebar__title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MdDashboard size={22} aria-hidden="true" />
                        Panel Admin
                    </h1>
                    <p className="sidebar__subtitle">Sistema de Horarios</p>
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
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
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
