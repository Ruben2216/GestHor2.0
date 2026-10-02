import { useEffect, useMemo, useState } from "react";
import "../../styles/profesor.css";
import ProfesorTabs from "../../components/Profesor/ProfesorTabs";
import { useNavigate } from "react-router-dom";
import { obtenerNombreProfesor } from "../../services/docenteService";
import {
    obtenerDisponibilidad,
    guardarDisponibilidad as guardarDisponibilidadAPI,
    obtenerPreferencias,
    guardarPreferencias as guardarPreferenciasAPI
} from "../../services/disponibilidadService";
import { useToast } from "../../components/ui/NotificacionFlotante";
import usePageTitle from "../../hooks/usePageTitle";

import { MdEventAvailable } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { FaRegClock, FaSave, FaBroom, FaCheckSquare, FaClipboardList, FaCommentDots } from "react-icons/fa";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const SLOTS = {
    matutino: [
        "07:00 - 08:00",
        "08:00 - 09:00",
        "09:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "12:00 - 13:00",
        "13:00 - 14:00",
    ],
    vespertino: [
        "15:00 - 16:00",
        "16:00 - 17:00",
        "17:00 - 18:00",
        "18:00 - 19:00",
        "19:00 - 20:00",
        "20:00 - 21:00",
        "21:00 - 22:00",
    ],
};

function makeAvailability(slots) {
    // availability[slot][diaIndex] = boolean
    const base = {};
    slots.forEach((s) => {
        base[s] = Array(DIAS.length).fill(false);
    });
    return base;
}

export default function Disponibilidad() {
    usePageTitle("Disponibilidad");
    const navigate = useNavigate();
    const [nombreProfesor, setNombreProfesor] = useState("");
    const { notify } = useToast();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const profesorId = user.usuario_id;

    const [tipo, setTipo] = useState("matutino");

    // mantenemos disponibilidad separada por tipo
    const [availByType, setAvailByType] = useState({
        matutino: makeAvailability(SLOTS.matutino),
        vespertino: makeAvailability(SLOTS.vespertino),
    });

    // preferencias adicionales
    const [prefs, setPrefs] = useState({
        maxHorasDia: "4",
        preferencia: "mixto",
        comentarios: "",
    });

    const slots = SLOTS[tipo];
    const availability = availByType[tipo];

    useEffect(() => {
        if (profesorId) {
            cargarDatos();
        }
    }, [profesorId]);

    const cargarDatos = async () => {
        try {
            const [dataNombre, dataDisponibilidad, dataPreferencias] = await Promise.all([
                obtenerNombreProfesor(profesorId),
                obtenerDisponibilidad(profesorId),
                obtenerPreferencias(profesorId)
            ]);

            if (dataNombre.profesor) {
                setNombreProfesor(`${dataNombre.profesor.nombres} ${dataNombre.profesor.apellidos}`);
            }

            if (dataDisponibilidad.disponibilidad && dataDisponibilidad.disponibilidad.length > 0) {
                const disponibilidadCargada = { matutino: {}, vespertino: {} };

                dataDisponibilidad.disponibilidad.forEach(slot => {
                    const turno = slot.turno;
                    const horario = `${slot.hora_inicio.slice(0, 5)} - ${slot.hora_fin.slice(0, 5)}`;
                    const diaIndex = DIAS.indexOf(slot.dia_semana);

                    if (!disponibilidadCargada[turno][horario]) {
                        disponibilidadCargada[turno][horario] = Array(DIAS.length).fill(false);
                    }
                    if (diaIndex >= 0) {
                        disponibilidadCargada[turno][horario][diaIndex] = true;
                    }
                });

                Object.keys(SLOTS).forEach(turno => {
                    SLOTS[turno].forEach(slot => {
                        if (!disponibilidadCargada[turno][slot]) {
                            disponibilidadCargada[turno][slot] = Array(DIAS.length).fill(false);
                        }
                    });
                });

                setAvailByType(disponibilidadCargada);
            }

            if (dataPreferencias.preferencias) {
                setPrefs({
                    maxHorasDia: dataPreferencias.preferencias.max_horas_dia.toString(),
                    preferencia: dataPreferencias.preferencias.preferencia_horario.toLowerCase(),
                    comentarios: dataPreferencias.preferencias.comentarios_adicionales || ''
                });
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    // si cambia el tipo y aún no hay estructura (por si agregas nuevos slots) la creamos
    useEffect(() => {
        setAvailByType((prev) => {
            if (!prev[tipo]) {
                return { ...prev, [tipo]: makeAvailability(SLOTS[tipo]) };
            }
            // si existen slots nuevos, completar
            const current = { ...prev[tipo] };
            SLOTS[tipo].forEach((s) => {
                if (!current[s]) current[s] = Array(DIAS.length).fill(false);
            });
            return { ...prev, [tipo]: current };
        });
    }, [tipo]);

    const toggle = (slot, diaIdx) => {
        setAvailByType((prev) => {
            const next = structuredClone(prev);
            next[tipo][slot][diaIdx] = !next[tipo][slot][diaIdx];
            return next;
        });
    };

    const selectAll = () => {
        setAvailByType((prev) => {
            const next = structuredClone(prev);
            Object.keys(next[tipo]).forEach((slot) => {
                next[tipo][slot] = next[tipo][slot].map(() => true);
            });
            return next;
        });
    };

    const clearAll = () => {
        setAvailByType((prev) => {
            const next = structuredClone(prev);
            Object.keys(next[tipo]).forEach((slot) => {
                next[tipo][slot] = next[tipo][slot].map(() => false);
            });
            return next;
        });
    };

    const totalSeleccionadas = useMemo(() => {
        let count = 0;
        Object.values(availability).forEach((arr) => {
            arr.forEach((v) => v && count++);
        });
        return count;
    }, [availability]);

    const guardarDisponibilidad = async () => {
        try {
            await guardarDisponibilidadAPI(profesorId, tipo, availability);
            notify({ type: 'success', message: `Disponibilidad ${tipo} guardada exitosamente. Bloques seleccionados: ${totalSeleccionadas}` });
        } catch (error) {
            console.error("Error al guardar disponibilidad:", error);
            notify({ type: 'error', message: 'Error al guardar la disponibilidad. Intenta nuevamente.' });
        }
    };

    const guardarPreferencias = async (e) => {
        e.preventDefault();
        try {
            await guardarPreferenciasAPI(
                profesorId,
                parseInt(prefs.maxHorasDia),
                prefs.preferencia.charAt(0).toUpperCase() + prefs.preferencia.slice(1),
                prefs.comentarios
            );
            notify({ type: 'success', message: `Preferencias guardadas exitosamente:\n- Máx horas/día: ${prefs.maxHorasDia}\n- Preferencia: ${prefs.preferencia}` });
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar preferencias:", error);
            notify({ type: 'error', message: 'Error al guardar las preferencias. Intenta nuevamente.' });
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
                {/* Header */}
                <div className="pf-header">
                    <div className="pf-header__left">
                        <span className="pf-header__title" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <MdEventAvailable size={22} aria-hidden="true" />
                            Disponibilidad de Horarios
                        </span>
                        <span className="pf-header__caption">Bienvenido, Prof. {nombreProfesor || "Cargando..."}</span>
                    </div>
                    <button className="pf-logout" onClick={handleLogout}>
                        <FiLogOut aria-hidden="true" />
                        Cerrar Sesión
                    </button>
                </div>

                {/* Tabs */}
                <ProfesorTabs />

                {/* Configurar disponibilidad */}
                <div className="pf-card" style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div>
                            <div className="pf-title" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <FaClipboardList size={18} aria-hidden="true" />
                                Configurar Mi Disponibilidad Horaria
                            </div>
                            <p className="pf-subtitle" style={{ marginTop: 6 }}>
                                Marca los horarios en los que estás disponible para impartir clases. Esta información ayudará al administrador a asignar tus horarios.
                            </p>
                        </div>

                        <div className="pf-schedule-actions">
                            <label style={{ fontSize: 12, color: "var(--pf-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <FaRegClock size={14} aria-hidden="true" />
                                Tipo de Horario
                            </label>
                            <select
                                className="pf-select"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                            >
                                <option value="matutino">Matutino (07:00 - 14:00)</option>
                                <option value="vespertino">Vespertino (15:00 - 22:00)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pf-table-wrap" style={{ marginTop: 10 }}>
                        <table className="pf-table">
                            <thead>
                                <tr>
                                    <th className="pf-time" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        <FaRegClock size={14} aria-hidden="true" />
                                        Horario
                                    </th>
                                    {DIAS.map((d) => (
                                        <th key={d}>{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {slots.map((slot) => (
                                    <tr key={slot}>
                                        <td className="pf-time">{slot}</td>
                                        {DIAS.map((_, idx) => (
                                            <td key={idx} style={{ textAlign: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={availability[slot]?.[idx] || false}
                                                    onChange={() => toggle(slot, idx)}
                                                    style={{ width: 18, height: 18 }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* acciones inferiores */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={false} onChange={selectAll} />{" "}
                                <FaCheckSquare size={14} aria-hidden="true" />
                                Seleccionar Todo
                            </label>
                            <label style={{ color: "var(--pf-muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={false} onChange={clearAll} />{" "}
                                <FaBroom size={14} aria-hidden="true" />
                                Limpiar Todo
                            </label>
                            <span className="pf-subtitle">Marcados: {totalSeleccionadas}</span>
                        </div>

                        <button className="pf-btn pf-btn--primary" onClick={guardarDisponibilidad} style={{ display: "inline-flex", alignItems: "center", gap: 8 }} title="Guardar disponibilidad">
                            <FaSave aria-hidden="true" />
                            Guardar Disponibilidad
                        </button>
                    </div>
                </div>

                {/* Preferencias adicionales */}
                <div className="pf-card">
                    <div className="pf-title" style={{ marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <FaClipboardList size={18} aria-hidden="true" />
                        Preferencias Adicionales
                    </div>

                    <form onSubmit={guardarPreferencias}>
                        <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 13, color: "var(--pf-muted)", marginBottom: 6 }}>
                                    Máximo de horas por día
                                </label>
                                <select
                                    className="pf-select"
                                    style={{ width: "100%" }}
                                    value={prefs.maxHorasDia}
                                    onChange={(e) => setPrefs({ ...prefs, maxHorasDia: e.target.value })}
                                >
                                    <option value="1">1 hora</option>
                                    <option value="2">2 horas</option>
                                    <option value="3">3 horas</option>
                                    <option value="4">4 horas</option>
                                    <option value="5">5 horas</option>
                                    <option value="6">6 horas</option>
                                    <option value="7">7 horas</option>
                                    <option value="8">8 horas</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: 13, color: "var(--pf-muted)", marginBottom: 6 }}>
                                    Preferencia de horario
                                </label>
                                <select
                                    className="pf-select"
                                    style={{ width: "100%" }}
                                    value={prefs.preferencia}
                                    onChange={(e) => setPrefs({ ...prefs, preferencia: e.target.value })}
                                >
                                    <option value="matutino">Matutino</option>
                                    <option value="vespertino">Vespertino</option>
                                    <option value="mixto">Mixto</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--pf-muted)", marginBottom: 6 }}>
                                <FaCommentDots size={14} aria-hidden="true" />
                                Comentarios adicionales
                            </label>
                            <textarea
                                className="pf-select"
                                style={{ width: "100%", height: 110, resize: "vertical" }}
                                placeholder="Menciona cualquier consideración especial sobre tu disponibilidad..."
                                value={prefs.comentarios}
                                onChange={(e) => setPrefs({ ...prefs, comentarios: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="pf-btn pf-btn--primary" style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8 }} title="Guardar preferencias">
                            <FaSave aria-hidden="true" />
                            Guardar Preferencias
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
