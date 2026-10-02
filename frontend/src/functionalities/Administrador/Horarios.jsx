import { useMemo, useState, useEffect } from "react";
import { useToast } from "../../components/ui/NotificacionFlotante";
import { obtenerMaterias, obtenerMateriasPorCarreraYSemestre } from "../../services/materiaService";
import { obtenerCarreras } from "../../services/carreraService";
import { obtenerDocentes as fetchDocentes, enviarHorarioPorCorreo, sugerirDocentes } from "../../services/docenteService";
import { HorarioPDFExporter } from "../../utils/pdfExportService";
import { obtenerHorariosProfesor, crearHorario, actualizarHorario, eliminarHorario } from "../../services/horarioService";
import { obtenerEstructura } from "../../services/lugaresService";
import AutocompleteInput from "../../components/admin/AutocompleteInput";
import InfoProfesorModal from "../../components/admin/InfoProfesorModal";
import ProfesorDetailsContent from "../../components/admin/ProfesorDetailsContent";
import { useValidacionHorario } from "../../hooks/useValidacionHorario";
import ScheduleGrid from "../../components/admin/ScheduleGrid";
import styles from "../../styles/AdminHorarios.module.css";
import usePageTitle from "../../hooks/usePageTitle";

import {
    MdSchedule,
    MdInfo,
    MdPersonSearch,
    MdClear,
    MdPriorityHigh,
    MdEdit,
    MdEmail,
    MdEvent,
    MdAccessTime,
    MdPlace,
    MdDomain,
    MdDoorFront,
    MdAdd,
    MdCancel,
    MdCheckCircle,
    MdTipsAndUpdates
} from "react-icons/md";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const DAY_KEYS = ["lunes", "martes", "miercoles", "jueves", "viernes"];
const MATUTINO_SLOTS = [
    "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00",
    "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
];
const VESPERTINO_SLOTS = [
    "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00",
    "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00",
];
const COLORS = [
    'c-blue', 'c-green', 'c-yellow', 'c-red', 'c-purple', 'c-cyan',
    'c-pink', 'c-teal', 'c-amber', 'c-lime', 'c-indigo',
];
const emptyForm = {
    materia: "",
    materiaId: "",
    salonId: "",
    dia: "",
    inicio: "",
    fin: "",
};

const toMins = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};
const timeRange = (start = "07:00", end = "22:00", step = 60) => {
    const out = [];
    let cur = toMins(start);
    const max = toMins(end);
    while (cur <= max) {
        const h = String(Math.floor(cur / 60)).padStart(2, "0");
        const m = String(cur % 60).padStart(2, "0");
        out.push(`${h}:${m}`);
        cur += step;
    }
    return out;
};
const normalize = (s) =>
    String(s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
const parseHorasToNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === 'number') return Math.floor(v);
    if (typeof v === 'string') {
        const parts = v.split(':');
        const h = parseInt(parts[0], 10);
        return Number.isNaN(h) ? 0 : h;
    }
    if (typeof v === 'object') {
        if ('hours' in v && typeof v.hours === 'number') return Math.floor(v.hours);
        if ('hour' in v && typeof v.hour === 'number') return Math.floor(v.hour);
        try {
            const s = String(v);
            const parts = s.split(':');
            const h = parseInt(parts[0], 10);
            return Number.isNaN(h) ? 0 : h;
        } catch (_) {
            return 0;
        }
    }
    return 0;
};

// --- Componente Principal 
export default function Horarios() {
    usePageTitle("Horarios");
    // --- ESTADO PRINCIPAL ---
    // Catalogos
    const [materias, setMaterias] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [lugares, setLugares] = useState([]);
    const [cargandoCatalogos, setCargandoCatalogos] = useState(false);

    // Selección y datos del profesor
    const [profesorSel, setProfesorSel] = useState(null);
    const [schedule, setSchedule] = useState({ slots: [], classes: {} });
    const [cargandoHorario, setCargandoHorario] = useState(false);
    const [errorHorario, setErrorHorario] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null); // Para pasar de la parrilla al form

    // Estado de la UI
    const [tipo, setTipo] = useState("matutino"); // matutino/vespertino
    const [activeTab, setActiveTab] = useState('horario');

    // Hooks
    const { notify } = useToast();
    const { loading: validando, infoProfesor, cargarInfoProfesor, validarAsignacion } = useValidacionHorario();

    // EFECTOS 
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargandoCatalogos(true);
                const [dataMaterias, dataDocentes, dataLugares, dataCarreras] = await Promise.all([
                    obtenerMaterias().catch(e => ({ materias: [] })),
                    fetchDocentes().catch(e => ({ docentes: [] })),
                    obtenerEstructura().catch(e => ({ lugares: [] })),
                    obtenerCarreras().catch(e => ({ carreras: [] }))
                ]);
                setMaterias(dataMaterias.materias || []);
                setProfesores(dataDocentes.docentes || []);
                setLugares(dataLugares.lugares || []);
                setCarreras(dataCarreras.carreras || []);
            } catch (error) {
                console.error("Error al cargar datos:", error);
                notify({ type: 'error', message: 'Error al cargar datos iniciales' });
            } finally {
                setCargandoCatalogos(false);
            }
        };
        cargarDatos();
    }, [notify]);

    // Carga del horario del profesor seleccionado
    useEffect(() => {
        const cargarHorario = async () => {
            if (!profesorSel?.profesor_id) {
                setSchedule({ slots: [], classes: {} });
                return;
            }
            try {
                setCargandoHorario(true);
                setErrorHorario(null);

                const resp = await obtenerHorariosProfesor(profesorSel.profesor_id);
                const rows = resp.horarios || [];
                const newClasses = processHorarioRows(rows);

                const finalSlots = tipo === 'matutino' ? MATUTINO_SLOTS : VESPERTINO_SLOTS;
                setSchedule({ slots: finalSlots, classes: newClasses });

            } catch (e) {
                setErrorHorario(e.message || "Error desconocido");
                setSchedule({ slots: tipo === "matutino" ? MATUTINO_SLOTS : VESPERTINO_SLOTS, classes: {} });
            } finally {
                setCargandoHorario(false);
            }
        };
        cargarHorario();
    }, [profesorSel, tipo]); // Recarga si cambia el profe o el turno

    const processHorarioRows = (rows) => {
        const classes = {};
        const horaToSlot = (hora) => {
            if (!hora) return null;
            const h = hora.substring(0, 5);
            const allSlots = [...MATUTINO_SLOTS, ...VESPERTINO_SLOTS];
            for (const s of allSlots) if (s.startsWith(h)) return s;
            return null;
        };

        for (const r of rows) {
            const slot = horaToSlot(r.hora_inicio);
            if (!slot) continue;

            const diaKey = normalize(r.dia_semana);
            if (!DAY_KEYS.includes(diaKey)) continue;

            const roomParts = [r.nombre_salon, r.nombre_edificio, r.nombre_lugar].filter(Boolean);
            const room = roomParts.join(' - ');
            const colorClass = COLORS[(r.materia_id || 0) % COLORS.length];

            const parseMinutes = (t) => t ? toMins(String(t).substring(0, 5)) : 0;
            const startMin = parseMinutes(r.hora_inicio);
            const endMin = parseMinutes(r.hora_fin);
            const span = endMin > startMin ? Math.max(1, Math.round((endMin - startMin) / 60)) : 1;

            const slotsArray = MATUTINO_SLOTS.includes(slot) ? MATUTINO_SLOTS : VESPERTINO_SLOTS;
            const startIndex = slotsArray.indexOf(slot);

            for (let i = 0; i < span; i++) {
                const idx = startIndex + i;
                if (idx < 0 || idx >= slotsArray.length) break;
                const targetSlot = slotsArray[idx];

                if (!classes[targetSlot]) classes[targetSlot] = {};
                const item = { s: r.nombre_materia, r: room, c: colorClass, h: r };

                if (classes[targetSlot][diaKey]) {
                    const existing = classes[targetSlot][diaKey];
                    classes[targetSlot][diaKey] = Array.isArray(existing) ? [...existing, item] : [existing, item];
                } else {
                    classes[targetSlot][diaKey] = item;
                }
            }
        }
        return classes;
    };

    const handleSeleccionarProfesor = async (profesor) => {
        setProfesorSel(profesor);
        setItemToEdit(null); // Limpiar edición anterior
        setActiveTab('horario'); // Resetear a la pestaña principal
        await cargarInfoProfesor(profesor.profesor_id);
    };

    const handleClearProfesor = () => {
        setProfesorSel(null);
        setItemToEdit(null);
        setSchedule({ slots: [], classes: {} });
    };

    // Callback para que el form y la parrilla notifiquen un cambio
    const handleHorarioUpdated = () => {
        setProfesorSel(p => ({ ...p }));
        setItemToEdit(null); // Limpiar el item en edición
        cargarInfoProfesor(profesorSel.profesor_id); // Recargar info (horas)
    };

    const handleEditHorario = (horarioData) => {
        setItemToEdit(horarioData);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const catalogs = { materias, carreras, profesores, lugares };
    const validacionHook = { loading: validando, infoProfesor, validarAsignacion };

    return (
        <>
            <div className={styles['admin-horarios__header']}>
                <h2 className={`main__title ${styles['admin-horarios__title']}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <MdSchedule size={22} aria-hidden="true" />
                    Gestión de Horarios
                </h2>
                <p className={`main__subtitle ${styles['admin-horarios__subtitle']}`}>
                    Asigne y visualice los horarios de los docentes
                </p>
            </div>

            {/* Panel de Controles Superior */}
            <div className={`card ${styles['admin-horarios__card']}`}>
                <div className={styles.controlsGrid}>
                    <HorarioProfessorSearch
                        profesores={profesores}
                        profesorSel={profesorSel}
                        onSelect={handleSeleccionarProfesor}
                        onClear={handleClearProfesor}
                        cargando={cargandoCatalogos}
                    />

                    <HorarioAssignmentForm
                        key={profesorSel ? profesorSel.profesor_id : 'assignment-form'}
                        profesorSel={profesorSel}
                        catalogs={catalogs}
                        itemToEdit={itemToEdit}
                        onHorarioUpdated={handleHorarioUpdated}
                        onClearEdit={() => setItemToEdit(null)}
                        validacionHook={validacionHook}
                    />
                </div>
            </div>

            {/* Contenido principal (Pestañas y Parrilla/Info) */}
            <div className={styles.mainContentArea}>
                {!profesorSel ? (
                    <div className={`${styles.placeholder} card`}>
                        <p>Seleccione un docente para ver su horario y su información detallada.</p>
                    </div>
                ) : (
                    <HorarioTabsContainer
                        profesorSel={profesorSel}
                        scheduleData={{ schedule, cargandoHorario, errorHorario }}
                        infoProfesor={infoProfesor}
                        tabProps={{ activeTab, setActiveTab, tipo, setTipo }}
                        onEdit={handleEditHorario}
                        onHorarioUpdated={handleHorarioUpdated}
                    />
                )}
            </div>
        </>
    );
}

//Componente: Buscador de Docente 
function HorarioProfessorSearch({ profesores, profesorSel, onSelect, onClear, cargando }) {
    return (
        <div className={styles.teacherSelector}>
            <h3 className={styles.panelTitle} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MdPersonSearch aria-hidden="true" />
                Docente
            </h3>
            {cargando ? (
                <div className="form__hint">Cargando docentes...</div>
            ) : profesorSel ? (
                <div className={styles.selectedTeacherBox}>
                    <span className={styles.selectedTeacherName}>
                        {profesorSel.nombres} {profesorSel.apellidos}
                    </span>
                    <button onClick={onClear} className={styles.clearButton} title="Limpiar selección" aria-label="Limpiar selección">
                        <MdClear />
                    </button>
                    <div className={styles.teacherPriority} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <MdPriorityHigh aria-hidden="true" />
                        {profesorSel.nombre_tipo ?
                            `Prioridad: ${profesorSel.nivel_prioridad} (${profesorSel.nombre_tipo})` :
                            'Prioridad: No asignada'
                        }
                    </div>
                </div>
            ) : (
                <div className={styles.searchContainer}>
                    <AutocompleteInput
                        items={profesores}
                        onSelect={onSelect}
                        placeholder="Buscar y seleccionar docente..."
                        disabled={cargando}
                        getItemKey={(p) => p.profesor_id}
                        getItemLabel={(p) => `${p.nombres} ${p.apellidos}`}
                    />
                    {profesores.length === 0 && !cargando && (
                        <div className={`form__hint ${styles['admin-horarios__no-docs']}`}>
                            No hay docentes registrados.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Componente: Formulario de Asignación 
function HorarioAssignmentForm({ profesorSel, catalogs, itemToEdit, onHorarioUpdated, onClearEdit, validacionHook }) {

    // --- ESTADO INTERNO DEL FORMULARIO ---
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [cargandoSubmit, setCargandoSubmit] = useState(false);

    // Filtros
    const [selectedCarreraId, setSelectedCarreraId] = useState("");
    const [selectedSemestre, setSelectedSemestre] = useState("");
    const [availableMaterias, setAvailableMaterias] = useState([]);

    // Lugares
    const [selectedLugarId, setSelectedLugarId] = useState("");
    const [selectedEdificioId, setSelectedEdificioId] = useState("");

    // Sugerencias
    const [candidatos, setCandidatos] = useState([]);
    const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
    const [errorSugerencias, setErrorSugerencias] = useState(null);

    const { notify } = useToast();
    const { loading: validando, validarAsignacion } = validacionHook;
    const { materias, carreras, lugares } = catalogs;

    const horas = useMemo(() => timeRange("07:00", "22:00", 60), []);

    // Efecto para el form cuando se pide editar
    useEffect(() => {
        if (itemToEdit) {
            const h = itemToEdit;
            const lugar = lugares.find(l => l.edificios.some(e => e.edificio_id === h.edificio_id));

            if (lugar) {
                setSelectedLugarId(lugar.lugar_id);
                setSelectedEdificioId(h.edificio_id);
            }

            setForm({
                materia: h.nombre_materia,
                materiaId: h.materia_id,
                salonId: h.salon_id,
                dia: h.dia_semana,
                inicio: h.hora_inicio.substring(0, 5),
                fin: h.hora_fin.substring(0, 5),
            });
            setEditId(h.horario_id);

            // Resetear filtros para no confundir
            setSelectedCarreraId("");
            setSelectedSemestre("");
            setAvailableMaterias([]);

        } else {
            // Limpiar si itemToEdit es null (ej. al cancelar)
            setForm(emptyForm);
            setEditId(null);
            setSelectedLugarId("");
            setSelectedEdificioId("");
        }
    }, [itemToEdit, lugares]);

    // --- MANEJADORES INTERNOS ---
    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleClearForm = () => {
        setForm(emptyForm);
        setEditId(null);
        setSelectedCarreraId("");
        setSelectedSemestre("");
        setAvailableMaterias([]);
        setSelectedLugarId("");
        setSelectedEdificioId("");
        setCandidatos([]);
        setErrorSugerencias(null);
        if (onClearEdit) onClearEdit(); // Notificar al padre
    };

    const salonesFiltrados = () => {
        let resultados = [];
        const lugar = lugares.find((l) => String(l.lugar_id) === String(selectedLugarId));
        const edificios = lugar ? (lugar.edificios || []) : lugares.flatMap(l => l.edificios || []);
        const edificiosFiltrados = selectedEdificioId ? edificios.filter(e => String(e.edificio_id) === String(selectedEdificioId)) : edificios;
        for (const ed of edificiosFiltrados) {
            resultados = resultados.concat(ed.salones || []);
        }
        return resultados;
    };

    const handleCarreraChange = async (e) => {
        const val = e.target.value;
        setSelectedCarreraId(val);
        setSelectedSemestre("");
        setAvailableMaterias([]);
        setForm(f => ({ ...f, materia: '', materiaId: '' }));
    };

    const handleSemestreChange = async (e) => {
        const sem = e.target.value;
        setSelectedSemestre(sem);
        setAvailableMaterias([]);
        setForm(f => ({ ...f, materia: '', materiaId: '' }));

        if (selectedCarreraId && sem) {
            try {
                setCargandoSugerencias(true); // Reusar este loading
                const resp = await obtenerMateriasPorCarreraYSemestre(selectedCarreraId, sem);
                const materiasFiltradas = resp?.materias || [];
                setAvailableMaterias(materiasFiltradas);

                if (materiasFiltradas.length === 0) {
                    notify({ type: 'error', message: 'No hay materias asignadas a este semestre.' });
                }
            } catch (err) {
                console.error('Error al cargar materias filtradas:', err);
                notify({ type: 'error', message: 'Error al cargar materias filtradas' });
            } finally {
                setCargandoSugerencias(false);
            }
        }
    };

    const handleMateriaChange = (e) => {
        const id = e.target.value;
        const pool = availableMaterias.length > 0 ? availableMaterias : materias;
        const m = pool.find(x => String(x.materia_id) === String(id));
        setForm(f => ({ ...f, materia: m ? m.nombre_materia : '', materiaId: id }));
    };

    const handleSugerirDocentes = async () => {
        try {
            setErrorSugerencias(null);
            setCandidatos([]);
            const pool = availableMaterias.length > 0 ? availableMaterias : materias;
            const materiaSeleccionada = pool.find(m => String(m.materia_id) === String(form.materiaId));

            if (!materiaSeleccionada) {
                return notify({ type: 'error', message: 'Selecciona primero una materia válida' });
            }
            if (!form.dia || !form.inicio || !form.fin) {
                return notify({ type: 'error', message: 'Selecciona día, inicio y fin para buscar sugerencias' });
            }

            setCargandoSugerencias(true);
            const resp = await sugerirDocentes({ materiaId: materiaSeleccionada.materia_id, dia: form.dia, inicio: form.inicio, fin: form.fin });

            if (resp && resp.ok) {
                const rawCandidates = resp.candidatos || [];
                const normalized = rawCandidates.map(c => ({ ...c, __horas_num: parseHorasToNumber(c.horas_asignadas) }));
                normalized.sort((a, b) => {
                    const pa = (a.nivel_prioridad == null) ? Number.POSITIVE_INFINITY : Number(a.nivel_prioridad);
                    const pb = (b.nivel_prioridad == null) ? Number.POSITIVE_INFINITY : Number(b.nivel_prioridad);
                    if (pa !== pb) return pa - pb;
                    if (a.__horas_num !== b.__horas_num) return a.__horas_num - b.__horas_num;
                    if (a.apellidos !== b.apellidos) return a.apellidos.localeCompare(b.apellidos);
                    return a.nombres.localeCompare(b.nombres);
                });
                setCandidatos(normalized);
                if (normalized.length === 0) {
                    setErrorSugerencias('No se encontraron candidatos disponibles para este horario y materia.');
                }
            } else {
                setErrorSugerencias(resp?.mensaje || 'No se encontraron candidatos');
            }
        } catch (e) {
            setErrorSugerencias(e.message || 'Error al buscar sugerencias');
        } finally {
            setCargandoSugerencias(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (cargandoSubmit || validando) return;

        const err = validarFormulario();
        if (err) {
            return notify({ type: 'error', message: err });
        }

        try {
            setCargandoSubmit(true);
            const pool = availableMaterias.length > 0 ? availableMaterias : materias;
            const materiaSeleccionada = pool.find(m => String(m.materia_id) === String(form.materiaId));
            if (!materiaSeleccionada) {
                return notify({ type: 'error', message: 'Error: No se encontró la materia seleccionada' });
            }

            if (!editId) {
                const puedeAsignar = await validarAsignacion(
                    profesorSel.profesor_id,
                    materiaSeleccionada.materia_id,
                    `${profesorSel.nombres} ${profesorSel.apellidos}`,
                    form.materia
                );
                if (!puedeAsignar) return; // Notificación ya la maneja el hook
            }

            const horarioData = {
                profesorId: profesorSel.profesor_id,
                materiaId: materiaSeleccionada.materia_id,
                salonId: parseInt(form.salonId),
                diaSemana: form.dia,
                horaInicio: form.inicio,
                horaFin: form.fin
            };

            const response = editId
                ? await actualizarHorario(editId, horarioData)
                : await crearHorario(horarioData);

            if (response.ok) {
                notify({ type: 'success', message: `Horario ${editId ? 'actualizado' : 'creado'} exitosamente` });
                handleClearForm();
                onHorarioUpdated(); // Notificar al padre para que recargue
            } else {
                notify({ type: 'error', message: response.mensaje || `Error al ${editId ? 'actualizar' : 'crear'} horario` });
            }
        } catch (error) {
            notify({ type: 'error', message: error.response?.data?.mensaje || 'Error de servidor al guardar horario' });
        } finally {
            setCargandoSubmit(false);
        }
    };

    const validarFormulario = () => {
        if (!profesorSel) return "Selecciona un profesor.";
        if (!form.materiaId) return "Selecciona una materia.";
        if (!form.salonId) return "Selecciona un salón.";
        if (!form.dia) return "Selecciona un día.";
        if (!form.inicio) return "Selecciona hora de inicio.";
        if (!form.fin) return "Selecciona hora de fin.";
        if (toMins(form.inicio) >= toMins(form.fin)) return "La hora fin debe ser mayor que la hora inicio.";
        return null;
    };

    const materiasSource = availableMaterias.length > 0 ? availableMaterias : materias;

    return (
        <div className={styles.assignmentForm}>
            <h3 className={styles.panelTitle} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {editId ? <MdEdit aria-hidden="true" /> : <MdAdd aria-hidden="true" />}
                {editId ? "Editar Horario" : "Asignar Nuevo Horario"}
            </h3>
            <form onSubmit={submit}>
                <div className="form__row form__row--2">
                    {/* Filtros por Carrera y Semestre */}
                    <div className={styles['admin-horarios__form-row--flex']}>
                        <select className="select" value={selectedCarreraId} onChange={handleCarreraChange} disabled={!!editId}>
                            <option value="">Filtrar por Carrera (opcional)</option>
                            {carreras.map(c => (<option key={c.carrera_id} value={c.carrera_id}>{c.nombre_carrera}</option>))}
                        </select>

                        <select className="select" value={selectedSemestre} onChange={handleSemestreChange} disabled={!selectedCarreraId || !!editId}>
                            <option value="">Semestre</option>
                            {(() => {
                                if (!selectedCarreraId) return null;
                                const carrera = carreras.find(c => String(c.carrera_id) === String(selectedCarreraId));
                                const max = carrera?.total_semestres || 10;
                                const opts = [];
                                for (let i = 1; i <= max; i++) opts.push(<option key={i} value={i}>{i}</option>);
                                return opts;
                            })()}
                        </select>
                    </div>

                    <div>
                        <label>Materia</label>
                        <select className="select" value={form.materiaId || ''} onChange={handleMateriaChange} disabled={
                            !selectedCarreraId ||
                            // Si se filtró por carrera, requiere semestre seleccionado
                            (selectedCarreraId && !selectedSemestre) ||
                            // Si se filtró por carrera y semestre, y no hay materias para esa combinación
                            (selectedCarreraId && selectedSemestre && availableMaterias.length === 0) ||
                            // Si no se filtró pero no hay materias en absoluto
                            (!selectedCarreraId && materias.length === 0)
                        }>
                            <option value="">Seleccionar materia...</option>
                            {materiasSource.map(m => (
                                <option key={m.materia_id} value={m.materia_id}>{m.nombre_materia}</option>
                            ))}
                        </select>
                        {materiasSource.length === 0 && (
                            <div className={`form__hint ${styles['admin-horarios__hint-mt8']}`}>
                                {selectedCarreraId ? 'No hay materias para este filtro' : 'No hay materias registradas'}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`form__row form__row--3 ${styles['admin-horarios__form-row--spaced']}`}>
                    <div>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdEvent aria-hidden="true" />
                            Día
                        </label>
                        <select className="select" name="dia" value={form.dia} onChange={onChange} required >
                            <option value="">Seleccionar día...</option>
                            {DIAS.map((d) => (<option key={d} value={d}>{d}</option>))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdAccessTime aria-hidden="true" />
                            Hora Inicio
                        </label>
                        <select className="select" name="inicio" value={form.inicio} onChange={onChange} required disabled={!form.materiaId
                        } >
                            <option value="">Seleccionar hora...</option>
                            {horas.map((h) => (<option key={h} value={h}>{h}</option>))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdAccessTime aria-hidden="true" />
                            Hora Fin
                        </label>
                        <select className="select" name="fin" value={form.fin} onChange={onChange} required disabled={!form.inicio} >
                            <option value="">Seleccionar hora...</option>
                            {horas.map((h) => (<option key={h} value={h}>{h}</option>))}
                        </select>
                    </div>
                </div>

                <div className={`form__row form__row--3 ${styles['admin-horarios__form-row--spaced']}`}>
                    <div>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdPlace aria-hidden="true" />
                            Lugar
                        </label>
                        <select className="select" value={selectedLugarId} onChange={(e) => { setSelectedLugarId(e.target.value); setSelectedEdificioId(""); }} required >
                            <option value="">Seleccionar...</option>
                            {lugares.map((l) => (<option key={l.lugar_id} value={l.lugar_id}>{l.nombre_lugar}</option>))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdDomain aria-hidden="true" />
                            Edificio
                        </label>
                        <select className="select" value={selectedEdificioId} onChange={(e) => setSelectedEdificioId(e.target.value)} required disabled={!selectedLugarId} >
                            <option value="">Seleccionar...</option>
                            {(lugares.find(l => String(l.lugar_id) === String(selectedLugarId))?.edificios || []).map((ed) => (<option key={ed.edificio_id} value={ed.edificio_id}>{ed.nombre_edificio}</option>))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdDoorFront aria-hidden="true" />
                            Salón
                        </label>
                        <select className="select" name="salonId" value={form.salonId} onChange={onChange} required disabled={!selectedEdificioId} >
                            <option value="">Seleccionar...</option>
                            {salonesFiltrados().map((s) => (<option key={s.salon_id} value={s.salon_id}>{s.nombre_salon} {s.tipo_salon ? ` - ${s.tipo_salon}` : ""}</option>))}
                        </select>
                    </div>
                </div>

                <div className={styles['admin-horarios__actions']}>
                    <button type="submit" className="btn btn--primary" disabled={cargandoSubmit || validando || !profesorSel} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {cargandoSubmit || validando ? "Cargando..." : (
                            <>
                                <MdCheckCircle aria-hidden="true" />
                                {editId ? "Actualizar Horario" : "Asignar Horario"}
                            </>
                        )}
                    </button>

                    {/* Botón de sugerencias, deshabilitado si estamos editando */}
                    {!editId && (
                        <button type="button" className="btn" onClick={handleSugerirDocentes} disabled={cargandoSugerencias} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdTipsAndUpdates aria-hidden="true" />
                            {cargandoSugerencias ? 'Buscando...' : 'Sugerir docentes'}
                        </button>
                    )}

                    {editId && (
                        <button type="button" className="btn" onClick={handleClearForm} disabled={cargandoSubmit} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdCancel aria-hidden="true" />
                            Cancelar edición
                        </button>
                    )}
                </div>

                {/* Lista de candidatos (sugerencias) */}
                <div className={styles['admin-horarios__candidates-wrapper']}>
                    {errorSugerencias && <div className={`form__hint ${styles['admin-horarios__hint--danger']}`}>{errorSugerencias}</div>}
                    {candidatos.length > 0 && (
                        <div className={styles['admin-horarios__candidates']}>
                            {candidatos.map((c) => (
                                <CandidateRow key={c.profesor_id} candidato={c} onSelect={() => notify({ type: 'info', message: 'Funcionalidad no implementada en este refactor' })} />
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

const CandidateRow = ({ candidato, onSelect }) => {
    const horasNum = parseHorasToNumber(candidato.horas_asignadas);
    return (
        <div onClick={() => onSelect(candidato)} className={styles['admin-horarios__candidate']}>
            <div>
                <div className={styles['admin-horarios__candidate__name']} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <MdPersonSearch aria-hidden="true" />
                    {candidato.nombres} {candidato.apellidos}
                </div>
                <div className={styles['admin-horarios__candidate__meta']}>
                    {candidato.nombre_tipo ? `${candidato.nombre_tipo} (prioridad ${candidato.nivel_prioridad})` : 'Sin contrato'}
                    {' — '}
                    Horas asignadas: <strong>{horasNum} h</strong>
                </div>
            </div>
            <div className={styles['admin-horarios__candidate__cta']}>Click para seleccionar</div>
        </div>
    );
};

//Componente: Contenedor de Pestañas 
function HorarioTabsContainer({ profesorSel, scheduleData, infoProfesor, tabProps, onEdit, onHorarioUpdated }) {

    const { schedule, cargandoHorario, errorHorario } = scheduleData;
    const { activeTab, setActiveTab, tipo, setTipo } = tabProps;
    const [cargandoAccion, setCargandoAccion] = useState(false); // Para email o delete
    const { notify } = useToast();

    const handleSendEmail = async () => {
        if (!profesorSel || !schedule) {
            return notify({ type: 'error', message: 'No hay profesor o horario seleccionado.' });
        }
        if (!confirm(`¿Deseas enviar el horario actual por correo a ${profesorSel.nombres} ${profesorSel.apellidos}?`)) {
            return;
        }

        try {
            setCargandoAccion(true);
            const pdfBlob = HorarioPDFExporter.exportSchedule(schedule, tipo, `${profesorSel.nombres} ${profesorSel.apellidos}`, 'blob');
            const response = await enviarHorarioPorCorreo(profesorSel.profesor_id, pdfBlob);
            notify({ type: 'success', message: response.mensaje || 'Horario enviado por correo exitosamente.' });
        } catch (error) {
            notify({ type: 'error', message: error.message || 'Error al enviar el correo.' });
        } finally {
            setCargandoAccion(false);
        }
    };

    const onDelete = async (horarioId) => {
        if (!confirm("¿Eliminar este horario?")) return;

        try {
            setCargandoAccion(true);
            const response = await eliminarHorario(horarioId);
            if (response.ok) {
                notify({ type: 'success', message: 'Horario eliminado exitosamente' });
                onHorarioUpdated();
            } else {
                notify({ type: 'error', message: response.mensaje || 'Error al eliminar horario' });
            }
        } catch (error) {
            notify({ type: 'error', message: error.response?.data?.mensaje || 'Error al eliminar horario' });
        } finally {
            setCargandoAccion(false);
        }
    };


    return (
        <div className="fade-in">
            <div className={styles.tabsContainer}>
                <button className={`${styles.tabButton} ${activeTab === 'horario' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('horario')} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <MdSchedule aria-hidden="true" />
                    Horario Semanal
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'info' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('info')} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <MdInfo aria-hidden="true" />
                    Información del Docente
                </button>
            </div>

            {activeTab === 'horario' && (
                <div className="card fade-in">
                    <div className={styles['admin-horarios__tab-header']}>
                        <h3 className={styles['admin-horarios__tab-title']} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdSchedule aria-hidden="true" />
                            Horario Semanal de {profesorSel.nombres}
                        </h3>
                        <div className={styles['admin-horarios__tab-actions']}>
                            <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                                <option value="matutino">Matutino (07:00 - 14:00)</option>
                                <option value="vespertino">Vespertino (15:00 - 22:00)</option>
                            </select>
                            <button
                                className="btn"
                                onClick={handleSendEmail}
                                disabled={cargandoAccion || cargandoHorario || !schedule.slots.length}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <MdEmail aria-hidden="true" />
                                {cargandoAccion ? 'Enviando...' : 'Enviar por Correo'}
                            </button>
                        </div>
                    </div>
                    <ScheduleGrid
                        schedule={schedule}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        cargando={cargandoHorario}
                        error={errorHorario}
                    />
                </div>
            )}

            {activeTab === 'info' && infoProfesor && (
                <div className="card fade-in">
                    <ProfesorDetailsContent
                        profesorNombre={`${profesorSel.nombres} ${profesorSel.apellidos}`}
                        infoProfesor={infoProfesor}
                    />
                </div>
            )}
        </div>
    );
}
