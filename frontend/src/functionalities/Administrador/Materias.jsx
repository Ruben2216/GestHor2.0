import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/NotificacionFlotante";
import {
    obtenerMaterias,
    crearMateria,
    actualizarMateria,
    eliminarMateria
} from "../../services/materiaService";
import SearchInput from "../../components/ui/SearchInput";
import { useSearch } from "../../hooks/useSearch";
import styles from "./Materias.module.css";
import usePageTitle from "../../hooks/usePageTitle";

import { MdLibraryBooks, MdAddCircle, MdEdit, MdDelete, MdCancel } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { FaRegQuestionCircle } from "react-icons/fa";

function emptyForm() {
    return {
        nombre_materia: ""
    };
}

export default function Materias() {
    const [materias, setMaterias] = useState([]);
    const [form, setForm] = useState(emptyForm());
    const [editingId, setEditingId] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const { notify } = useToast();
    usePageTitle("Materias");

    // Usar el hook de búsqueda
    const materiasFiltradas = useSearch(materias, busqueda, ["nombre_materia"]);

    useEffect(() => {
        cargarMaterias();
    }, []);

    const cargarMaterias = async () => {
        try {
            setCargando(true);
            const data = await obtenerMaterias();
            setMaterias(data.materias || []);
        } catch (error) {
            console.error("Error al cargar materias:", error);
            notify({ type: 'error', message: 'Error al cargar el catálogo de materias' });
        } finally {
            setCargando(false);
        }
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.nombre_materia.trim()) {
            notify({ type: 'error', message: 'El nombre de la materia es obligatorio' });
            return;
        }

        try {
            setCargando(true);

            if (editingId) {
                await actualizarMateria(editingId, form);
                notify({ type: 'success', message: 'Materia actualizada exitosamente' });
                setEditingId(null);
            } else {
                await crearMateria(form);
                notify({ type: 'success', message: 'Materia agregada al catálogo exitosamente' });
            }

            setForm(emptyForm());
            cargarMaterias();
        } catch (error) {
            console.error("Error al guardar materia:", error);
            notify({ type: 'error', message: error.response?.data?.mensaje || 'Error al guardar la materia' });
        } finally {
            setCargando(false);
        }
    };

    const onEdit = (materia) => {
        setForm({
            nombre_materia: materia.nombre_materia
        });
        setEditingId(materia.materia_id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onDelete = async (id) => {
        if (!confirm("¿Eliminar esta materia del catálogo? Solo se puede eliminar si no está asignada a ninguna carrera.")) return;

        try {
            setCargando(true);
            await eliminarMateria(id);
            notify({ type: 'success', message: 'Materia eliminada exitosamente' });
            cargarMaterias();

            if (editingId === id) {
                setEditingId(null);
                setForm(emptyForm());
            }
        } catch (error) {
            console.error("Error al eliminar materia:", error);
            notify({ type: 'error', message: error.response?.data?.mensaje || 'Error al eliminar la materia' });
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <div className={styles['materias__header']}>
                <h2 className={`main__title ${styles['materias__title']}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <MdLibraryBooks size={22} aria-hidden="true" />
                    Catálogo de Materias
                </h2>
                <p className={`main__subtitle ${styles['materias__subtitle']}`}>
                    Gestionar materias globales para asignar a carreras
                </p>
            </div>

            <div className={`grid grid--2 ${styles['materias__grid']}`}>
                {/* Formulario */}
                <div className="card">
                    <h3 className={styles['materias__cardTitle']} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {editingId ? (
                            <>
                                <MdEdit size={18} aria-hidden="true" /> Editar Materia
                            </>
                        ) : (
                            <>
                                <MdAddCircle size={18} aria-hidden="true" /> Agregar Nueva Materia
                            </>
                        )}
                    </h3>

                    <form onSubmit={onSubmit}>
                        <div className={styles['materias__formRow']}>
                            <label>Nombre de la Materia </label>
                            <input
                                className="input"
                                name="nombre_materia"
                                placeholder="Ej: Matemáticas I"
                                value={form.nombre_materia}
                                onChange={onChange}
                                required
                                disabled={cargando}
                            />
                        </div>

                        <div className={styles['materias__actions']}>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={cargando}
                                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                            >
                                {cargando ? (
                                    "Guardando..."
                                ) : editingId ? (
                                    <>
                                        <MdEdit size={16} aria-hidden="true" /> Actualizar
                                    </>
                                ) : (
                                    <>
                                        <MdAddCircle size={16} aria-hidden="true" /> Agregar
                                    </>
                                )}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setEditingId(null);
                                        setForm(emptyForm());
                                    }}
                                    disabled={cargando}
                                    style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                                >
                                    <MdCancel size={16} aria-hidden="true" /> Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Listado */}
                <div className="card">
                    <div className={styles['materias__listHeader']}>
                        <h3 className={styles['materias__listTitle']} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <MdLibraryBooks size={18} aria-hidden="true" /> Materias Registradas ({materias.length})
                        </h3>
                    </div>

                    {/* Buscador */}
                    <div className={styles['materias__search']} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FiSearch aria-hidden="true" />
                        <SearchInput
                            value={busqueda}
                            onChange={setBusqueda}
                            placeholder=" Buscar materia..."
                            disabled={cargando}
                        />
                    </div>

                    {cargando ? (
                        <div className="form__hint">Cargando...</div>
                    ) : (
                        <div className={styles['materias__listContainer']}>
                            {materiasFiltradas.length === 0 ? (
                                <div className="form__hint">
                                    {busqueda ? "No se encontraron materias" : "Aún no hay materias en el catálogo"}
                                </div>
                            ) : (
                                materiasFiltradas.map((m) => (
                                    <div key={m.materia_id} className={`card ${styles['materias__listItem']}`}>
                                        <div className={styles['materias__listItemInner']}>
                                            <div className={styles['materias__itemMain']}>
                                                <div className={styles['materias__itemTitle']}>{m.nombre_materia}</div>
                                                {m.descripcion && (
                                                    <div className={`form__hint ${styles['materias__hint']}`}>
                                                        {m.descripcion}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles['materias__itemActions']}>
                                                <button
                                                    className="link-btn"
                                                    onClick={() => onEdit(m)}
                                                    disabled={cargando}
                                                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                                >
                                                    <MdEdit aria-hidden="true" /> Editar
                                                </button>
                                                <button
                                                    className="link-btn link-btn--danger"
                                                    onClick={() => onDelete(m.materia_id)}
                                                    disabled={cargando}
                                                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                                >
                                                    <MdDelete aria-hidden="true" /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Información adicional */}
            <div className="card">
                <h3 className={styles['materias__cardTitle']} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <FaRegQuestionCircle size={18} aria-hidden="true" /> ¿Cómo funciona?
                </h3>
                <ul className={styles['materias__howList']}>
                    <li>Agrega materias aquí una sola vez al catálogo global</li>
                    <li>Luego, al crear o editar una carrera, selecciona las materias del catálogo</li>
                    <li>La misma materia puede asignarse a múltiples carreras en diferentes semestres</li>
                    <li>No puedes eliminar una materia si está asignada a alguna carrera</li>
                </ul>
            </div>
        </>
    );
}
