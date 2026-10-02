import { MdAddCircle } from "react-icons/md";
import { FaGraduationCap } from "react-icons/fa";

export default function CarreraForm({ form, onChange, onSubmit, cargando }) {
    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                <FaGraduationCap size={18} aria-hidden="true" />
                Crear Nueva Carrera
            </h3>

            <form onSubmit={onSubmit}>
                <div className="form__row form__row--2">
                    <div>
                        <label>Nombre de la Carrera</label>
                        <input
                            className="input"
                            name="nombre"
                            placeholder="Ej: Ingeniería en Sistemas"
                            value={form.nombre}
                            onChange={onChange}
                            required
                            disabled={cargando}
                        />
                    </div>

                    <div>
                        <label>Número de Semestres</label>
                        <select
                            className="select"
                            name="semestres"
                            value={form.semestres || ""}
                            onChange={onChange}
                            required
                            disabled={cargando}
                        >
                            <option value="">Seleccionar...</option>
                            {[6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={cargando}
                    style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                    <MdAddCircle aria-hidden="true" />
                    {cargando ? "Creando..." : "Crear Carrera"}
                </button>
            </form>
        </div>
    );
}
