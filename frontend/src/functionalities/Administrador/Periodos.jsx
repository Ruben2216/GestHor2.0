import React, { useEffect, useState } from 'react';
import {
    obtenerPeriodos,
    crearPeriodo,
    actualizarPeriodo,
    eliminarPeriodo,
} from '../../services/periodoService';
import TiposContrato from './TiposContrato';
import styles from "./Periodos.module.css";
import usePageTitle from "../../hooks/usePageTitle";

export default function Periodos() {
    usePageTitle("Configuración");
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    
    const [openPeriodos, setOpenPeriodos] = useState(false); // collapse state for the Periodos panel
    const [openTipos, setOpenTipos] = useState(false); // collapse state for Tipos de Contrato
    const [tiposCount, setTiposCount] = useState(0);

    // fetch tipos count for header display
    useEffect(() => {
        let mounted = true;
        const fetchTiposCount = async () => {
            try {
                const svc = await import('./tipoContratoService');
                const data = await svc.obtenerTiposContrato();
                if (!mounted) return;
                setTiposCount((data.tiposContrato || []).length);
            } catch (err) {
                // ignore
            }
        };
        fetchTiposCount();
        return () => { mounted = false; };
    }, []);

    const fetchPeriodos = async () => {
        setLoading(true);
        try {
            const res = await obtenerPeriodos();
            setPeriodos(res.periodos || []);
        } catch (err) {
            console.error(err);
            setError('No se pudieron obtener los periodos');
        } finally {
            setLoading(false);
        }
    };

    

    useEffect(() => {
        fetchPeriodos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingId) {
                await actualizarPeriodo(editingId, form);
                setEditingId(null);
            } else {
                await crearPeriodo(form);
            }
            setForm({ nombre: '', fecha_inicio: '', fecha_fin: '' });
            await fetchPeriodos();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Error al guardar');
        }
    };

    const handleSelectChange = (e) => {
        const id = e.target.value;
        if (!id) {
            setEditingId(null);
            setForm({ nombre: '', fecha_inicio: '', fecha_fin: '' });
            return;
        }
        const p = periodos.find((x) => String(x.id_periodo) === String(id));
        if (p) {
            setEditingId(p.id_periodo);
            setForm({ nombre: p.nombre || '', fecha_inicio: p.fecha_inicio || '', fecha_fin: p.fecha_fin || '' });
        }
    };

    const handleEdit = (p) => {
        setEditingId(p.id_periodo);
        setForm({ nombre: p.nombre || '', fecha_inicio: p.fecha_inicio || '', fecha_fin: p.fecha_fin || '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar periodo? Esto puede afectar horarios/disponibilidades.')) return;
        try {
            await eliminarPeriodo(id);
            await fetchPeriodos();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Error al eliminar');
        }
    };

    return (
        <div>
            <h2 className={styles['periodos__title']}>Configuración</h2>

            <div>
                <div className={styles['periodos__fullWidth']}>

                    <div className={`card ${styles['periodos__card']}`}>
                        <h4 className={styles['periodos__toggle']} onClick={() => setOpenPeriodos(v => !v)}>
                            Periodos Académicos ({periodos.length}) {openPeriodos ? '▾' : '▸'}
                        </h4>

                        {openPeriodos && (
                            <div>
                                <div className={styles['periodos__sectionSpacing']}>
                                    <div>
                                        <label className="form__label">Seleccionar periodo</label>
                                        <select className="select" onChange={handleSelectChange} value={editingId || ''}>
                                            <option value="">-- Nuevo periodo --</option>
                                            {periodos.map((p) => (
                                                <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className={styles['periodos__form']}>
                                    <div className="form__row">
                                        <div>
                                            <label className="form__label">Nombre</label>
                                            <input className={`input ${styles['periodos__inputFull']}`} name="nombre" value={form.nombre} onChange={handleChange} required />
                                        </div>
                                        <div className={`form__row--2 ${styles['periodos__row2']}`}>
                                            <div>
                                                <label className="form__label">Fecha inicio</label>
                                                <input className={`input ${styles['periodos__inputFull']}`} type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} />
                                            </div>
                                            <div>
                                                <label className="form__label">Fecha fin</label>
                                                <input className={`input ${styles['periodos__inputFull']}`} type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles['periodos__actionsRow']}>
                                        <button className="btn btn--primary" type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
                                        {editingId && <button className="btn" type="button" onClick={() => { setEditingId(null); setForm({ nombre: '', fecha_inicio: '', fecha_fin: '' }); }}>Cancelar</button>}
                                    </div>

                                    {error && <div className={styles['periodos__error']}>{error}</div>}
                                    </form>

                                    <div className={styles['periodos__listSection']}>
                                        <h3 className={styles['periodos__listTitle']}>Lista</h3>
                                        {loading ? (
                                            <div>Cargando...</div>
                                        ) : (
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Nombre</th>
                                                        <th className={styles['periodos__thSmall']}>Fecha inicio</th>
                                                        <th className={styles['periodos__thSmall']}>Fecha fin</th>
                                                        <th className={styles['periodos__thMed']}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {periodos.map((p) => (
                                                        <tr key={p.id_periodo}>
                                                            <td>{p.nombre}</td>
                                                            <td>{p.fecha_inicio || '-'}</td>
                                                            <td>{p.fecha_fin || '-'}</td>
                                                            <td>
                                                                <button className="link-btn" onClick={() => handleEdit(p)}>Editar</button>
                                                                <button className="link-btn link-btn--danger" onClick={() => handleDelete(p.id_periodo)}>Eliminar</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {periodos.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4}>No hay periodos</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    <div className={`card ${styles['periodos__cardFull']}`}>
                        <h4 className={styles['periodos__toggle']} onClick={() => setOpenTipos(v => !v)}>
                            Tipos de Contrato ({tiposCount}) {openTipos ? '▾' : '▸'}
                        </h4>
                        {openTipos && (
                            <div className={styles['periodos__tiposPadding']}>
                                <TiposContrato bare={true} />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
