import { useMemo, useState, useEffect } from "react";
import "../../styles/profesor.css";
import ProfesorTabs from "../../components/Profesor/ProfesorTabs";
import { useNavigate } from "react-router-dom";
import { buscarMaterias } from "../../services/materiaService";
import { obtenerMateriasProfesor, asignarMateriaProfesor, eliminarMateriaProfesor } from "../../services/profesorMateriaService";
import { obtenerNombreProfesor } from "../../services/docenteService";
import AutocompleteInput from "../../components/admin/AutocompleteInput";
import { useToast } from "../../components/ui/NotificacionFlotante";
import usePageTitle from "../../hooks/usePageTitle";

import { MdDashboard } from "react-icons/md";
import { FiLogOut, FiSearch } from "react-icons/fi";
import { FaBookOpen, FaTrashAlt, FaCheckCircle } from "react-icons/fa";

export default function MisMaterias() {
    usePageTitle("Mis materias");
    const navigate = useNavigate();
    const { notify } = useToast();
    const [misMaterias, setMisMaterias] = useState([]);
    const [materiasDisponibles, setMateriasDisponibles] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [nombreProfesor, setNombreProfesor] = useState("");

    // Obtener profesor_id del usuario logueado
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const profesorId = user.usuario_id;

    useEffect(() => {
        if (profesorId) {
            cargarDatos();
        } else {
            notify({ type: 'error', message: 'No se encontró información del profesor' });
            navigate("/login");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profesorId]);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [dataProfesor, dataNombre] = await Promise.all([
                obtenerMateriasProfesor(profesorId),
                obtenerNombreProfesor(profesorId)
            ]);
            setMisMaterias(dataProfesor.materias || []);

            if (dataNombre.profesor) {
                setNombreProfesor(`${dataNombre.profesor.nombres} ${dataNombre.profesor.apellidos}`);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            notify({ type: 'error', message: 'Error al cargar las materias' });
        } finally {
            setCargando(false);
        }
    };

    // Buscar materias disponibles con debounce
    const buscarMateriasDisponibles = async (termino) => {
        if (!termino || termino.length < 2) {
            setMateriasDisponibles([]);
            return;
        }

        try {
            const { materias } = await buscarMaterias(termino);
            // Filtrar materias que ya están asignadas al profesor
            const yaAsignadas = new Set(misMaterias.map(m => m.materia_id));
            const disponibles = materias.filter(m => !yaAsignadas.has(m.materia_id));
            setMateriasDisponibles(disponibles);
        } catch (error) {
            console.error("Error al buscar materias:", error);
            setMateriasDisponibles([]);
        }
    };

    const handleSeleccionarMateria = async (materia) => {
        try {
            await asignarMateriaProfesor(profesorId, materia.materia_id);
            setMateriasDisponibles([]);
            cargarDatos();
            notify({ type: 'success', message: 'Materia agregada correctamente' });
        } catch (error) {
            console.error("Error al agregar materia:", error);
            notify({ type: 'error', message: 'Error al agregar la materia' });
        }
    };

    const eliminar = async (materiaId) => {
        if (!confirm("¿Eliminar esta materia de tu lista?")) return;

        try {
            await eliminarMateriaProfesor(profesorId, materiaId);
            cargarDatos();
            notify({ type: 'success', message: 'Materia eliminada' });
        } catch (error) {
            console.error("Error al eliminar materia:", error);
            notify({ type: 'error', message: 'Error al eliminar la materia' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="pf-page">
            <div className="pf-container">
                {/* Header simple */}
                <div className="pf-header">
                    <div className="pf-header__left">
                        <span className="pf-header__title" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <MdDashboard size={22} aria-hidden="true" />
                            Panel del Profesor
                        </span>
                        <span className="pf-header__caption">
                            Bienvenido, Prof. {nombreProfesor || "Cargando..."}
                        </span>
                    </div>
                    <button className="pf-logout" onClick={handleLogout}>
                        <FiLogOut aria-hidden="true" />
                        Cerrar Sesión
                    </button>
                </div>

                {/* Tabs */}
                <ProfesorTabs />

                {/* Contenido */}
                <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Formulario */}
                    <div className="pf-card">
                        <div className="pf-title" style={{ marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <FaBookOpen size={18} aria-hidden="true" />
                            Agregar Materia que Puedo Impartir
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--pf-muted)", marginBottom: 6 }}>
                                <FiSearch size={14} aria-hidden="true" />
                                Buscar Materia del Catálogo (min. 2 caracteres)
                            </label>
                            <AutocompleteInput
                                items={materiasDisponibles}
                                onSelect={handleSeleccionarMateria}
                                onSearchChange={buscarMateriasDisponibles}
                                placeholder="Escribe para buscar materias..."
                                disabled={cargando}
                                getItemKey={(materia) => materia.materia_id}
                                getItemLabel={(materia) => materia.nombre_materia}
                            />
                        </div>

                        <p style={{ fontSize: 13, color: "var(--pf-muted)", marginTop: 8 }}>
                            Escribe el nombre de la materia y haz clic para agregarla.
                        </p>
                    </div>

                    {/* Listado de mis materias */}
                    <div className="pf-card">
                        <div className="pf-title" style={{ marginBottom: 8 }}>
                            Mis Materias Registradas ({misMaterias.length})
                        </div>

                        <div className="grid" style={{ display: "grid", gap: 10 }}>
                            {misMaterias.length === 0 ? (
                                <div className="pf-card" style={{ padding: 12, color: "var(--pf-muted)" }}>
                                    No tienes materias registradas.
                                </div>
                            ) : (
                                misMaterias.map((m) => (
                                    <div key={m.materia_id} className="pf-card" style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <FaBookOpen aria-hidden="true" />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{m.nombre_materia}</div>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        marginTop: 6,
                                                        fontSize: 12,
                                                        padding: "3px 8px",
                                                        borderRadius: 999,
                                                        background: "#e8faef",
                                                        color: "#15803d",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    <FaCheckCircle size={12} aria-hidden="true" />
                                                    Activa
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className="pf-btn"
                                            style={{ borderColor: "#fecaca", color: "#b91c1c", display: "inline-flex", alignItems: "center", gap: 8 }}
                                            onClick={() => eliminar(m.materia_id)}
                                            title="Eliminar materia"
                                        >
                                            <FaTrashAlt aria-hidden="true" />
                                            Eliminar
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
