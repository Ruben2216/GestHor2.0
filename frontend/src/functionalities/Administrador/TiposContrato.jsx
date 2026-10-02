import { useEffect, useState } from "react";
import { useToast } from "../../components/ui/NotificacionFlotante";
import { obtenerTiposContrato, crearTipoContrato, actualizarTipoContrato } from "./tipoContratoService";
import styles from "./TiposContrato.module.css";

export default function TiposContrato({ bare = false }) {
	const [tipos, setTipos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ nombre_tipo: "", nivel_prioridad: "", descripcion: "" });
	const [editingId, setEditingId] = useState(null);
	const [open, setOpen] = useState(false); // controla si el panel está desplegado
	const { notify } = useToast();

	const load = async () => {
		try {
			const data = await obtenerTiposContrato();
			setTipos(data.tiposContrato || []);
		} catch (err) {
			console.error("Error cargando tipos de contrato:", err);
		}
	};

	useEffect(() => { load(); }, []);

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm(f => ({ ...f, [name]: value }));
	};

	const onEdit = (t) => {
		setEditingId(t.tipo_contrato_id);
		setForm({ nombre_tipo: t.nombre_tipo || "", nivel_prioridad: String(t.nivel_prioridad || ""), descripcion: t.descripcion || "" });
		setOpen(true); // al editar, abrir el panel para mostrar campos
	};

	const onCancel = () => {
		setEditingId(null);
		setForm({ nombre_tipo: "", nivel_prioridad: "", descripcion: "" });
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const payload = {
				nombre_tipo: form.nombre_tipo.trim(),
				nivel_prioridad: parseInt(form.nivel_prioridad, 10),
				descripcion: form.descripcion,
			};

			if (!payload.nombre_tipo || !Number.isInteger(payload.nivel_prioridad)) {
				notify({ type: 'error', message: 'Nombre y prioridad son obligatorios' });
				setLoading(false);
				return;
			}

			if (editingId) {
				await actualizarTipoContrato(editingId, payload);
				notify({ type: 'success', message: 'Tipo de contrato actualizado' });
			} else {
				await crearTipoContrato(payload);
				notify({ type: 'success', message: 'Tipo de contrato creado' });
			}

			await load();
			onCancel();
		} catch (err) {
			console.error(err);
			notify({ type: 'error', message: err.response?.data?.mensaje || 'Error' });
		} finally {
			setLoading(false);
		}
	};

	// If parent requests bare rendering, return only the inner form + list without the card/header wrapper
	if (bare) {
		return (
			<>
				<form onSubmit={onSubmit} className={styles['tipos__form']}>
					<div className={styles['tipos__grid']}>
						<input className={`input ${styles['tipos__inputFull']}`} name="nombre_tipo" placeholder="Nombre del tipo" value={form.nombre_tipo} onChange={onChange} />
						<input className={`input ${styles['tipos__inputFull']}`} name="nivel_prioridad" placeholder="Prioridad (1)" value={form.nivel_prioridad} onChange={onChange} />
					</div>
					<div className={styles['tipos__mt8']}>
						<textarea className={`textarea ${styles['tipos__inputFull']}`} name="descripcion" placeholder="Descripción (opcional)" value={form.descripcion} onChange={onChange} />
					</div>
					<div className={styles['tipos__actions']}>
						<button type="submit" className="btn btn--primary" disabled={loading}>{editingId ? 'Actualizar' : 'Agregar'}</button>
						{editingId && <button type="button" className="btn" onClick={onCancel} disabled={loading}>Cancelar</button>}
					</div>
				</form>

				<ul className={styles['tipos__list']}>
					{tipos.map((t) => (
						<li key={t.tipo_contrato_id} className={styles['tipos__listItem']}>
							<div>
								<strong>{t.nombre_tipo}</strong> <span className="form__hint">(Prioridad: {t.nivel_prioridad})</span>
								{t.descripcion && <div className={`form__hint ${styles['tipos__hintTop']}`}>{t.descripcion}</div>}
							</div>
							<div className={styles['tipos__itemActions']}>
								<button className="link-btn" onClick={() => onEdit(t)}>Editar</button>
							</div>
						</li>
					))}
				</ul>
			</>
		);
	}

	return (
		<div className={`card ${styles['tipos__card']}`}>
			<h4 className={styles['tipos__toggle']} onClick={() => setOpen(o => !o)}>
				Tipos de Contrato ({tipos.length}) {open ? '▾' : '▸'}
			</h4>

			{open && (
				<>
					<form onSubmit={onSubmit} className={styles['tipos__form']}>
						<div className={styles['tipos__grid']}>
							<input className={`input ${styles['tipos__inputFull']}`} name="nombre_tipo" placeholder="Nombre del tipo" value={form.nombre_tipo} onChange={onChange} />
							<input className={`input ${styles['tipos__inputFull']}`} name="nivel_prioridad" placeholder="Prioridad (1)" value={form.nivel_prioridad} onChange={onChange} />
						</div>
						<div className={styles['tipos__mt8']}>
							<textarea className={`textarea ${styles['tipos__inputFull']}`} name="descripcion" placeholder="Descripción (opcional)" value={form.descripcion} onChange={onChange} />
						</div>
						<div className={styles['tipos__actions']}>
							<button type="submit" className="btn btn--primary" disabled={loading}>{editingId ? 'Actualizar' : 'Agregar'}</button>
							{editingId && <button type="button" className="btn" onClick={onCancel} disabled={loading}>Cancelar</button>}
						</div>
					</form>

					<ul className={styles['tipos__list']}>
						{tipos.map((t) => (
							<li key={t.tipo_contrato_id} className={styles['tipos__listItem']}>
								<div>
									<strong>{t.nombre_tipo}</strong> <span className="form__hint">(Prioridad: {t.nivel_prioridad})</span>
									{t.descripcion && <div className={`form__hint ${styles['tipos__hintTop']}`}>{t.descripcion}</div>}
								</div>
								<div className={styles['tipos__itemActions']}>
									<button className="link-btn" onClick={() => onEdit(t)}>Editar</button>
								</div>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}
