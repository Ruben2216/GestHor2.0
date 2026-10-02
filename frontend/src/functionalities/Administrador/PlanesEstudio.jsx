import { useState } from "react";
import { useToast } from "../../components/ui/NotificacionFlotante";
import { useCarreras } from "../../hooks/useCarreras";
import { useMaterias } from "../../hooks/useMaterias";
import { validarPlanEstudioCompleto } from "../../utils/validaciones";
import CarreraForm from "../../components/admin/CarreraForm";
import CarreraList from "../../components/admin/CarreraList";
import SemesterSelector from "../../components/admin/SemesterSelector";
import AutocompleteInput from "../../components/admin/AutocompleteInput";
import MateriaCard from "../../components/admin/MateriaCard";
import usePageTitle from "../../hooks/usePageTitle";

import { FaUniversity, FaRegListAlt, FaGraduationCap } from "react-icons/fa";
import { MdSave, MdArrowBack, MdLibraryAdd } from "react-icons/md";

const emptyCareer = {
    nombre: "",
    semestres: 0
};

export default function PlanesEstudio() {
    usePageTitle("Planes de estudio");
    const [form, setForm] = useState(emptyCareer);
    const { notify } = useToast();

    const {
        carreras,
        carreraSeleccionada,
        cargando: cargandoCarreras,
        agregarCarrera,
        eliminarCarreraById,
        seleccionarCarrera,
        setCarreraSeleccionada,
        recargarCarreraSeleccionada
    } = useCarreras();

    const {
        catalogoMaterias,
        cargando: cargandoMaterias,
        asignarMateria,
        desasignarMateria
    } = useMaterias();

    const cargando = cargandoCarreras || cargandoMaterias;

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: name === "semestres" ? Number(value) : value }));
    };

    const onSubmitCarrera = async (e) => {
        e.preventDefault();

        if (!form.nombre.trim() || !form.semestres) {
            return notify({ type: 'error', message: 'El nombre y número de semestres son obligatorios' });
        }

        try {
            await agregarCarrera({
                nombre_carrera: form.nombre.trim(),
                total_semestres: form.semestres
            });
            setForm(emptyCareer);
        } catch (error) {
        }
    };

    const handleAsignarMateria = async (materia, semestre) => {
        try {
            await asignarMateria(
                carreraSeleccionada.carrera_id,
                materia.materia_id,
                semestre
            );
            await recargarCarreraSeleccionada();
        } catch (error) {
        }
    };

    const handleDesasignarMateria = async (materiaId, semestre) => {
        const exito = await desasignarMateria(
            carreraSeleccionada.carrera_id,
            materiaId,
            semestre
        );

        if (exito) {
            await recargarCarreraSeleccionada();
        }
    };

    const guardarPlanEstudio = () => {
        const validacion = validarPlanEstudioCompleto(carreraSeleccionada);

        if (!validacion.valido) {
            notify({ type: 'error', message: validacion.mensaje });
            return;
        }

        if (!confirm("¿Confirmar plan de estudio completo? Todos los semestres tienen materias asignadas.")) return;

        notify({ type: 'success', message: 'Plan de estudio guardado exitosamente' });
        setCarreraSeleccionada(null);
    };

    if (carreraSeleccionada) {
        return (
            <EditorPlanEstudio
                carrera={carreraSeleccionada}
                onClose={() => setCarreraSeleccionada(null)}
                onSavePlan={guardarPlanEstudio}
                catalogoMaterias={catalogoMaterias}
                onAsignarMateria={handleAsignarMateria}
                onDesasignarMateria={handleDesasignarMateria}
                cargando={cargando}
            />
        );
    }

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <h2
                    className="main__title"
                    style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                    <FaUniversity size={22} aria-hidden="true" />
                    Planes de Estudio
                </h2>
                <p className="main__subtitle" style={{ marginTop: 4 }}>
                    Gestionar carreras y asignar materias del catálogo
                </p>
            </div>

            <CarreraForm
                form={form}
                onChange={onChange}
                onSubmit={onSubmitCarrera}
                cargando={cargando}
            />

            <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ marginTop: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <FaRegListAlt size={18} aria-hidden="true" />
                    Carreras Registradas ({carreras.length})
                </h3>
                <CarreraList
                    carreras={carreras}
                    onSelect={seleccionarCarrera}
                    onDelete={eliminarCarreraById}
                    cargando={cargando}
                />
            </div>
        </>
    );
}

function EditorPlanEstudio({
    carrera,
    onClose,
    onSavePlan,
    catalogoMaterias,
    onAsignarMateria,
    onDesasignarMateria,
    cargando
}) {
    const [semestreActual, setSemestreActual] = useState(1);

    const materiasDelSemestre = carrera.materias?.[semestreActual] || [];

    const handleSeleccionarMateria = (materia) => {
        onAsignarMateria(materia, semestreActual);
    };

    const handleDesasignarMateria = (materiaId) => {
        onDesasignarMateria(materiaId, semestreActual);
    };

    return (
        <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <FaGraduationCap size={18} aria-hidden="true" />
                        {carrera.nombre_carrera}
                    </h3>
                    <div className="form__hint">Asignar materias del catálogo por semestre</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        className="btn btn--primary"
                        onClick={onSavePlan}
                        disabled={cargando}
                    >
                        <MdSave aria-hidden="true" />
                        Guardar Plan
                    </button>
                    <button
                        className="btn"
                        onClick={onClose}
                    >
                        <MdArrowBack aria-hidden="true" />
                        Volver
                    </button>
                </div>
            </div>

            <SemesterSelector
                totalSemestres={carrera.total_semestres}
                semestreActual={semestreActual}
                onSemestreChange={setSemestreActual}
                materiasAsignadas={carrera.materias}
            />

            <div className="grid grid--2" style={{ gap: 16 }}>
                <div className="card" style={{ borderColor: "var(--border)" }}>
                    <h4 style={{ marginTop: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <MdLibraryAdd size={18} aria-hidden="true" />
                        Agregar Materia al {semestreActual}° Semestre
                    </h4>

                    <div style={{ marginBottom: 12 }}>
                        <label>Buscar y Seleccionar Materia del Catálogo:</label>
                        <AutocompleteInput
                            items={catalogoMaterias}
                            onSelect={handleSeleccionarMateria}
                            placeholder=" Escribe para buscar materia..."
                            disabled={cargando}
                            getItemKey={(m) => m.materia_id}
                            getItemLabel={(m) => m.nombre_materia}
                        />
                        {catalogoMaterias.length === 0 && (
                            <div className="form__hint" style={{ marginTop: 8 }}>
                                No hay materias en el catálogo. Ve a la sección "Materias" para agregar.
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ borderColor: "var(--border)" }}>
                    <h4 style={{ marginTop: 0 }}>Materias del {semestreActual}° Semestre</h4>

                    {materiasDelSemestre.length === 0 ? (
                        <div className="form__hint">Sin materias asignadas en este semestre.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {materiasDelSemestre.map((m) => (
                                <MateriaCard
                                    key={m.id}
                                    materia={m}
                                    onRemove={handleDesasignarMateria}
                                    disabled={cargando}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}