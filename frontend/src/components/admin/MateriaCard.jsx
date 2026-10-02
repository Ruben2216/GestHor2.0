export default function MateriaCard({ materia, onRemove, disabled = false }) {
    return (
        <div 
            className="card" 
            style={{ 
                padding: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}
        >
            <div>
                <div style={{ fontWeight: 600 }}>{materia.nombre}</div>
            </div>
            <button
                className="link-btn link-btn--danger"
                onClick={() => onRemove(materia.id)}
                disabled={disabled}
            >
                Quitar
            </button>
        </div>
    );
}
