import PropTypes from "prop-types";
import styles from "./InfoProfesorModal.module.css";
import ProfesorDetailsContent from "./ProfesorDetailsContent";

const InfoProfesorModal = ({ profesorNombre, onClose, infoProfesor }) => {
    return (
        <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Información del Profesor</h2>
                {onClose && <button className={styles.modalClose} onClick={onClose}>&times;</button>}
            </div>
            <div className={styles.modalBody}>
                <ProfesorDetailsContent profesorNombre={profesorNombre} infoProfesor={infoProfesor} />
            </div>
            {onClose && (
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className="btn btn--primary">Cerrar</button>
                </div>
            )}
        </div>
    );
};

InfoProfesorModal.propTypes = {
    profesorNombre: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired, // onClose is required for a modal
    infoProfesor: PropTypes.shape({
        disponibilidad: PropTypes.array,
        materias: PropTypes.array,
        preferencias: PropTypes.object
    }).isRequired
};

export default InfoProfesorModal;
