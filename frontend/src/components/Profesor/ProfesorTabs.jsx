import { NavLink } from "react-router-dom";
import "../../styles/profesor.css";

import { MdSchedule } from "react-icons/md";
import { FaBookOpen} from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";

export default function ProfesorTabs() {
  // Clase dinámica: aplica pf-tab--active cuando la ruta coincide
  const cx = ({ isActive }) => `pf-tab ${isActive ? "pf-tab--active" : ""}`;

  return (
    <div className="pf-tabs">
      <NavLink end to="/profesor/mi-horario" className={cx}>
        <MdSchedule size={16} style={{ marginRight: 6 }} aria-hidden="true" />
        Mi Horario
      </NavLink>
      <NavLink end to="/profesor/mis-materias" className={cx}>
        <FaBookOpen size={15} style={{ marginRight: 6 }} aria-hidden="true" />
        Mis Materias
      </NavLink>
      <NavLink end to="/profesor/disponibilidad" className={cx}>
        <MdEventAvailable size={22} aria-hidden="true" />
        Disponibilidad
      </NavLink>
    </div>
  );
}
