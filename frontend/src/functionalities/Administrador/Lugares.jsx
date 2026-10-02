import { useEffect, useMemo, useState } from "react";
import * as lugaresService from "../../services/lugaresService";
import { useToast } from "../../components/ui/NotificacionFlotante";
import usePageTitle from "../../hooks/usePageTitle";

import {
    MdPlace, MdDomain, MdMeetingRoom, MdSearch, MdFilterList, MdClear, MdAddBusiness, MdAdd, MdEdit, MdDelete, MdExpandMore, MdExpandLess
} from "react-icons/md";

const TIPOS_EDIFICIO = ["Académico", "Laboratorio", "Administrativo"];
const TIPOS_SALON = ["Aula", "Laboratorio", "Salas de usos múltiples", "Taller"];

function emptyLugar() {
    return { nombre_lugar: "", tipo_lugar: "" };
}

function emptyEdificio() {
    return { lugar_id: "", nombre_edificio: "", tipo_edificio: "" };
}

function emptySalon() {
    return { edificio_id: "", nombre_salon: "", tipo_salon: "" };
}

export default function Lugares() {
    usePageTitle("Lugares");
    const [lugares, setLugares] = useState([]);
    const { notify } = useToast();
    const [expandedLugares, setExpandedLugares] = useState(new Set());
    const [expandedEdificios, setExpandedEdificios] = useState(new Set());
    const [filterText, setFilterText] = useState("");
    const [filterTipoSalon, setFilterTipoSalon] = useState("");

    const [formLugar, setFormLugar] = useState(emptyLugar());
    const [editLugarId, setEditLugarId] = useState(null);

    const [formEdificio, setFormEdificio] = useState(emptyEdificio());
    const [editEdificioId, setEditEdificioId] = useState(null);

    const [formSalon, setFormSalon] = useState(emptySalon());
    const [editSalonId, setEditSalonId] = useState(null);

    useEffect(() => {
        cargarEstructura();
    }, []);

    const cargarEstructura = async () => {
        try {
            const data = await lugaresService.obtenerEstructura();
            // API devuelve { ok: true, lugares: [...] }
            setLugares(data.lugares || []);
        } catch (error) {
            console.error("Error al cargar lugares:", error);
            notify({ type: 'error', message: 'Error al cargar lugares' });
        }
    };

    // ======= VALIDACIONES =======
    // ======= handlers de formulario =======
    const onChangeLugar = (e) => {
        const { name, value } = e.target;
        setFormLugar((f) => ({ ...f, [name]: value }));
    };

    const validarLugar = () => {
        if (!formLugar.nombre_lugar.trim()) return "El nombre del lugar es obligatorio.";
        return null;
    };

    const onChangeEdificio = (e) => {
        const { name, value } = e.target;
        setFormEdificio((f) => ({ ...f, [name]: value }));
    };

    const validarEdificio = () => {
        if (!formEdificio.lugar_id) return "Selecciona un lugar.";
        if (!formEdificio.nombre_edificio.trim()) return "El nombre del edificio es obligatorio.";
        return null;
    };

    const onChangeSalon = (e) => {
        const { name, value } = e.target;
        setFormSalon((f) => ({ ...f, [name]: value }));
    };

    const validarSalon = () => {
        if (!formSalon.edificio_id) return "Selecciona un edificio.";
        if (!formSalon.nombre_salon.trim()) return "El nombre del salón es obligatorio.";
        return null;
    };

    // ======= CRUD LUGARES =======
    const submitLugar = async (e) => {
        e.preventDefault();
        const err = validarLugar();
        if (err) {
            notify({ type: 'error', message: err });
            return;
        }

        try {
            if (editLugarId) {
                const actualizado = await lugaresService.actualizarLugar(editLugarId, formLugar);
                // actualizar en memoria
                setLugares((prev) => prev.map((l) => (l.lugar_id === editLugarId ? { ...l, ...actualizado.lugar } : l)));
                setEditLugarId(null);
            } else {
                const nuevo = await lugaresService.crearLugar(formLugar);
                // recargar estructura para mantener consistencia
                await cargarEstructura();
            }
            setFormLugar(emptyLugar());
        } catch (error) {
            console.error("Error al guardar lugar:", error);
            notify({ type: 'error', message: error.message || 'Error al guardar lugar' });
        }
    };

    const editarLugar = (lugar) => {
        setEditLugarId(lugar.lugar_id);
        setFormLugar({ nombre_lugar: lugar.nombre_lugar, tipo_lugar: lugar.tipo_lugar || "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const eliminarLugar = async (id) => {
        if (!confirm("¿Está seguro de eliminar este lugar y todos sus edificios/salones?")) return;
        try {
            await lugaresService.eliminarLugar(id);
            setLugares((prev) => prev.filter((l) => l.lugar_id !== id));
        } catch (error) {
            console.error("Error al eliminar lugar:", error);
            notify({ type: 'error', message: 'Error al eliminar lugar' });
        }
    };

    // ======= CRUD EDIFICIOS =======
    const submitEdificio = async (e) => {
        e.preventDefault();
        const err = validarEdificio();
        if (err) {
            notify({ type: 'error', message: err });
            return;
        }

        try {
            if (editEdificioId) {
                const actualizado = await lugaresService.actualizarEdificio(editEdificioId, {
                    nombre_edificio: formEdificio.nombre_edificio,
                    tipo_edificio: formEdificio.tipo_edificio,
                });
                await cargarEstructura();
                setEditEdificioId(null);
            } else {
                await lugaresService.crearEdificio({
                    lugar_id: formEdificio.lugar_id,
                    nombre_edificio: formEdificio.nombre_edificio,
                    tipo_edificio: formEdificio.tipo_edificio,
                });
                await cargarEstructura();
            }
            setFormEdificio(emptyEdificio());
        } catch (error) {
            console.error("Error al guardar edificio:", error);
            notify({ type: 'error', message: error.message || 'Error al guardar edificio' });
        }
    };

    const editarEdificio = (lugarId, edificio) => {
        setEditEdificioId(edificio.edificio_id);
        setFormEdificio({ lugar_id: lugarId, nombre_edificio: edificio.nombre_edificio, tipo_edificio: edificio.tipo_edificio || "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const eliminarEdificio = async (id) => {
        if (!confirm("¿Está seguro de eliminar este edificio y sus salones?")) return;
        try {
            await lugaresService.eliminarEdificio(id);
            await cargarEstructura();
        } catch (error) {
            console.error("Error al eliminar edificio:", error);
            notify({ type: 'error', message: 'Error al eliminar edificio' });
        }
    };

    // ======= CRUD SALONES =======
    const submitSalon = async (e) => {
        e.preventDefault();
        const err = validarSalon();
        if (err) {
            notify({ type: 'error', message: err });
            return;
        }

        try {
            if (editSalonId) {
                await lugaresService.actualizarSalon(editSalonId, {
                    nombre_salon: formSalon.nombre_salon,
                    tipo_salon: formSalon.tipo_salon,
                });
                await cargarEstructura();
                setEditSalonId(null);
            } else {
                await lugaresService.crearSalon({
                    edificio_id: formSalon.edificio_id,
                    nombre_salon: formSalon.nombre_salon,
                    tipo_salon: formSalon.tipo_salon,
                });
                await cargarEstructura();
            }
            setFormSalon(emptySalon());
        } catch (error) {
            console.error("Error al guardar salón:", error);
            notify({ type: 'error', message: error.message || 'Error al guardar salón' });
        }
    };

    const editarSalon = (edificioId, salon) => {
        setEditSalonId(salon.salon_id);
        setFormSalon({ edificio_id: edificioId, nombre_salon: salon.nombre_salon, tipo_salon: salon.tipo_salon || "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const eliminarSalon = async (salonId) => {
        if (!confirm("¿Está seguro de eliminar este salón?")) return;
        try {
            await lugaresService.eliminarSalon(salonId);
            await cargarEstructura();
        } catch (error) {
            console.error("Error al eliminar salón:", error);
            notify({ type: 'error', message: 'Error al eliminar salón' });
        }
    };

    const optionsLugares = useMemo(() => lugares.map((l) => ({ value: l.lugar_id, label: l.nombre_lugar })), [lugares]);

    // Helpers: expand/collapse
    const toggleLugar = (id) => {
        setExpandedLugares((prev) => {
            const copy = new Set(prev);
            if (copy.has(id)) copy.delete(id);
            else copy.add(id);
            return copy;
        });
    };

    const toggleEdificio = (id) => {
        setExpandedEdificios((prev) => {
            const copy = new Set(prev);
            if (copy.has(id)) copy.delete(id);
            else copy.add(id);
            return copy;
        });
    };

    const aplicarFiltro = (lugar) => {
        // filtro por texto (nombre de lugar/edificio/salón) y por tipo de salón
        if (!filterText && !filterTipoSalon) return true;
        const txt = filterText.toLowerCase();
        if (filterText) {
            if ((lugar.nombre_lugar || "").toLowerCase().includes(txt)) return true;
            for (const ed of lugar.edificios || []) {
                if ((ed.nombre_edificio || "").toLowerCase().includes(txt)) return true;
                for (const s of ed.salones || []) if ((s.nombre_salon || "").toLowerCase().includes(txt)) return true;
            }
            return false;
        }
        if (filterTipoSalon) {
            for (const ed of lugar.edificios || []) {
                for (const s of ed.salones || []) if ((s.tipo_salon || "") === filterTipoSalon) return true;
            }
            return false;
        }
        return true;
    };

    // ======= RENDER =======
    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <h2 className="main__title" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <MdPlace size={22} aria-hidden="true" />
                    Gestión de Lugares
                </h2>
                <p className="main__subtitle" style={{ marginTop: 4 }}>
                    Administrar edificios y salones
                </p>
            </div>

            {/* Filtros y búsqueda */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <MdSearch aria-hidden="true" />
                <input
                    className="input"
                    placeholder="Buscar por nombre (lugar, edificio, salón)..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <MdFilterList aria-hidden="true" />
                    <select
                        className="select"
                        value={filterTipoSalon}
                        onChange={(e) => setFilterTipoSalon(e.target.value)}
                    >
                        <option value="">Filtrar por tipo de salón</option>
                        {TIPOS_SALON.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                </div>
                <button
                    className="btn"
                    onClick={() => { setFilterText(''); setFilterTipoSalon(''); }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                    <MdClear aria-hidden="true" />
                    Limpiar
                </button>
            </div>

            <div className="grid grid--2" style={{ marginBottom: 16 }}>
                {/* Lugar */}
                <div className="card">
                    <h3 style={{ marginTop: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <MdPlace aria-hidden="true" />
                        {editLugarId ? "Editar Lugar" : "Registrar Lugar"}
                    </h3>
                    <form onSubmit={submitLugar}>
                        <div>
                            <label>Nombre del Lugar</label>
                            <input className="input" name="nombre_lugar" placeholder="Ej: Facultad de Ingeniería" value={formLugar.nombre_lugar} onChange={onChangeLugar} required />
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <label>Tipo de Lugar</label>
                            <input className="input" name="tipo_lugar" placeholder="Ej: Facultad" value={formLugar.tipo_lugar} onChange={onChangeLugar} />
                        </div>

                        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                            <button type="submit" className="btn btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                {editLugarId ? <MdEdit aria-hidden="true" /> : <MdAddBusiness aria-hidden="true" />}
                                {editLugarId ? "Actualizar Lugar" : "Agregar Lugar"}
                            </button>
                            {editLugarId && (
                                <button type="button" className="btn" onClick={() => { setEditLugarId(null); setFormLugar(emptyLugar()); }}>
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Edificio */}
                <div className="card">
                    <h3 style={{ marginTop: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <MdDomain aria-hidden="true" />
                        {editEdificioId ? "Editar Edificio" : "Registrar Edificio"}
                    </h3>
                    <form onSubmit={submitEdificio}>
                        <div>
                            <label>Lugar</label>
                            <select className="select" name="lugar_id" value={formEdificio.lugar_id} onChange={onChangeEdificio} required>
                                <option value="">Seleccionar lugar...</option>
                                {optionsLugares.map((op) => (<option key={op.value} value={op.value}>{op.label}</option>))}
                            </select>
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <label>Nombre del Edificio</label>
                            <input className="input" name="nombre_edificio" placeholder="Ej: Edificio A" value={formEdificio.nombre_edificio} onChange={onChangeEdificio} required />
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <label>Tipo de Edificio</label>
                            <select className="select" name="tipo_edificio" value={formEdificio.tipo_edificio} onChange={onChangeEdificio}>
                                {TIPOS_EDIFICIO.map((t) => (<option key={t} value={t}>{t}</option>))}
                            </select>
                        </div>

                        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                            <button type="submit" className="btn btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                {editEdificioId ? <MdEdit aria-hidden="true" /> : <MdAdd aria-hidden="true" />}
                                {editEdificioId ? "Actualizar Edificio" : "Agregar Edificio"}
                            </button>
                            {editEdificioId && (
                                <button type="button" className="btn" onClick={() => { setEditEdificioId(null); setFormEdificio(emptyEdificio()); }}>
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Salon */}
                <div className="card">
                    <h3 style={{ marginTop: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <MdMeetingRoom aria-hidden="true" />
                        {editSalonId ? "Editar Salón" : "Registrar Salón"}
                    </h3>
                    <form onSubmit={submitSalon}>
                        <div>
                            <label>Edificio</label>
                            <select className="select" name="edificio_id" value={formSalon.edificio_id} onChange={onChangeSalon} required>
                                <option value="">Seleccionar edificio...</option>
                                {lugares.flatMap(l => l.edificios || []).map((ed) => (
                                    <option key={ed.edificio_id} value={ed.edificio_id}>{ed.nombre_edificio} — {lugares.find(x => x.lugar_id === ed.lugar_id)?.nombre_lugar || ''}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <label>Nombre del Salón</label>
                            <input className="input" name="nombre_salon" placeholder="Ej: 101 / LabComp" value={formSalon.nombre_salon} onChange={onChangeSalon} required />
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <label>Tipo de Salón</label>
                            <select className="select" name="tipo_salon" value={formSalon.tipo_salon} onChange={onChangeSalon}>
                                {TIPOS_SALON.map((t) => (<option key={t} value={t}>{t}</option>))}
                            </select>
                        </div>

                        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                            <button type="submit" className="btn btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                {editSalonId ? <MdEdit aria-hidden="true" /> : <MdAdd aria-hidden="true" />}
                                {editSalonId ? "Actualizar Salón" : "Agregar Salón"}
                            </button>
                            {editSalonId && (
                                <button type="button" className="btn" onClick={() => { setEditSalonId(null); setFormSalon(emptySalon()); }}>
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Listado */}
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Edificios y Salones Registrados</h3>
                <div className="grid" style={{ gap: 16 }}>
                    {lugares.length === 0 && (
                        <div className="form__hint">Aún no hay lugares.</div>
                    )}
                    {lugares.filter(aplicarFiltro).map((lugar) => (
                        <div key={lugar.lugar_id} className="card" style={{ borderColor: "var(--border)" }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => toggleLugar(lugar.lugar_id)}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        <MdPlace aria-hidden="true" />
                                        {lugar.nombre_lugar}
                                    </div>
                                    {lugar.tipo_lugar && <div className="form__hint">{lugar.tipo_lugar}</div>}
                                    <div className="form__hint">{(lugar.edificios || []).length} edificio(s) • {(lugar.edificios || []).reduce((acc, e) => acc + ((e.salones || []).length || 0), 0)} salón(es)</div>
                                </div>

                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <button
                                        className="btn"
                                        onClick={(e) => { e.stopPropagation(); setFormEdificio((f) => ({ ...f, lugar_id: lugar.lugar_id })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                    >
                                        <MdAdd aria-hidden="true" /> Agregar edificio
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={(e) => { e.stopPropagation(); setFormSalon((f) => ({ ...f, edificio_id: (lugar.edificios && lugar.edificios[0] && lugar.edificios[0].edificio_id) || '' })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                    >
                                        <MdAdd aria-hidden="true" /> Agregar salón
                                    </button>
                                    <button className="link-btn" onClick={(e) => { e.stopPropagation(); editarLugar(lugar); }} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        <MdEdit aria-hidden="true" /> Editar
                                    </button>
                                    <button className="link-btn link-btn--danger" onClick={(e) => { e.stopPropagation(); eliminarLugar(lugar.lugar_id); }} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        <MdDelete aria-hidden="true" /> Eliminar
                                    </button>
                                    {expandedLugares.has(lugar.lugar_id) ? <MdExpandLess aria-hidden="true" /> : <MdExpandMore aria-hidden="true" />}
                                </div>
                            </div>

                            {!expandedLugares.has(lugar.lugar_id) ? null : (
                                <div style={{ marginTop: 12 }}>
                                    {(lugar.edificios || []).length === 0 && (
                                        <div className="form__hint">Sin edificios registrados en este lugar.</div>
                                    )}

                                    {(lugar.edificios || []).map((ed) => (
                                        <div key={ed.edificio_id} className="card" style={{ marginBottom: 10, padding: 12 }}>
                                            <div
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}
                                                onClick={() => toggleEdificio(ed.edificio_id)}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                        <MdDomain aria-hidden="true" />
                                                        {ed.nombre_edificio}
                                                    </div>
                                                    {ed.tipo_edificio && <div className="form__hint">{ed.tipo_edificio}</div>}
                                                    <div className="form__hint">{(ed.salones || []).length} salón(es)</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <button
                                                        className="btn"
                                                        onClick={(e) => { e.stopPropagation(); setFormSalon((f) => ({ ...f, edificio_id: ed.edificio_id })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                                    >
                                                        <MdAdd aria-hidden="true" /> Agregar salón
                                                    </button>
                                                    <button className="link-btn" onClick={(e) => { e.stopPropagation(); editarEdificio(lugar.lugar_id, ed); }} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                        <MdEdit aria-hidden="true" /> Editar
                                                    </button>
                                                    <button className="link-btn link-btn--danger" onClick={(e) => { e.stopPropagation(); eliminarEdificio(ed.edificio_id); }} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                        <MdDelete aria-hidden="true" /> Eliminar
                                                    </button>
                                                    {expandedEdificios.has(ed.edificio_id) ? <MdExpandLess aria-hidden="true" /> : <MdExpandMore aria-hidden="true" />}
                                                </div>
                                            </div>

                                            {/* Salones */}
                                            {expandedEdificios.has(ed.edificio_id) && (
                                                <div className="grid" style={{ gap: 8, marginTop: 10 }}>
                                                    {(ed.salones || []).length === 0 && (
                                                        <div className="form__hint">Sin salones registrados.</div>
                                                    )}
                                                    {(ed.salones || []).map((s) => (
                                                        <div key={s.salon_id} className="card" style={{ padding: 10 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                                        <MdMeetingRoom aria-hidden="true" />
                                                                        {s.nombre_salon}
                                                                    </div>
                                                                    <div className="form__hint">{s.tipo_salon || ''}</div>
                                                                </div>
                                                                <div>
                                                                    <button className="link-btn" onClick={() => editarSalon(ed.edificio_id, s)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                                        <MdEdit aria-hidden="true" /> Editar
                                                                    </button>
                                                                    <button className="link-btn link-btn--danger" onClick={() => eliminarSalon(s.salon_id)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                                        <MdDelete aria-hidden="true" /> Eliminar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
