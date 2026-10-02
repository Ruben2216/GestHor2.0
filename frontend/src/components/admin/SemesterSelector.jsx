const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

export default function SemesterSelector({ 
    totalSemestres, 
    semestreActual, 
    onSemestreChange,
    materiasAsignadas = {}
}) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label>Selecciona el Semestre:</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {range(totalSemestres).map((s) => {
                    const tieneMaterias = (materiasAsignadas[s] || []).length > 0;
                    return (
                        <button
                            key={s}
                            type="button"
                            className={`btn ${semestreActual === s ? 'btn--primary' : ''}`}
                            onClick={() => onSemestreChange(s)}
                        >
                            {s}° Semestre {tieneMaterias ? '✓' : ''}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
