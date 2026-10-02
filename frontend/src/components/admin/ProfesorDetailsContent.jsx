import PropTypes from "prop-types";
import styles from "./ProfesorDetailsContent.module.css";

const ProfesorDetailsContent = ({ profesorNombre, infoProfesor }) => {
    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    
    const agruparPorTurno = () => {
        if (!infoProfesor?.disponibilidad?.length) return {};
        
        const grupos = { matutino: [], vespertino: [], nocturno: [] };
        infoProfesor.disponibilidad.forEach(slot => {
            const turno = slot.turno?.toLowerCase() || 'matutino';
            if (grupos[turno]) grupos[turno].push(slot);
        });
        return grupos;
    };

    const disponibilidadPorTurno = agruparPorTurno();
    const preferencias = infoProfesor?.preferencias;

    return (
        <div className={styles.profesorDetails}>
            <div className={styles.profesorHeader}>
                <h3 className={styles.profesorName}>{profesorNombre}</h3>
            </div>

            <div className={styles.grid}>
                <div className={styles.mainContent}>
                    <h4 className={styles.sectionTitle}>Disponibilidad Horaria</h4>
                    
                    {Object.keys(disponibilidadPorTurno).length === 0 || 
                     Object.values(disponibilidadPorTurno).every(arr => arr.length === 0) ? (
                        <div className={styles.emptyState}>
                            El profesor no ha configurado su disponibilidad horaria.
                        </div>
                    ) : (
                        <>
                            {Object.entries(disponibilidadPorTurno).map(([turno, slots]) => {
                                if (slots.length === 0) return null;
                                
                                return (
                                    <div key={turno} className={styles.turnoSection}>
                                        <div className={styles.turnoTitle}>{turno}</div>
                                        <div className={styles.slotsGrid}>
                                            {slots
                                                .sort((a, b) => {
                                                    const diaA = diasOrden.indexOf(a.dia_semana);
                                                    const diaB = diasOrden.indexOf(b.dia_semana);
                                                    if (diaA !== diaB) return diaA - diaB;
                                                    return a.hora_inicio.localeCompare(b.hora_inicio);
                                                })
                                                .map((slot, idx) => (
                                                    <div key={idx} className={styles.slotItem}>
                                                        <div className={styles.slotDay}>{slot.dia_semana}</div>
                                                        <div className={styles.slotTime}>
                                                            {slot.hora_inicio.substring(0, 5)} - {slot.hora_fin.substring(0, 5)}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.sidebarSection}>
                        <h4 className={styles.sectionTitle}>Materias que Imparte</h4>
                            
                        {!infoProfesor?.materias || infoProfesor.materias.length === 0 ? (
                            <div className={styles.emptyState}>Sin materias registradas.</div>
                        ) : (
                            <div className={styles.list}>
                                {infoProfesor.materias.map((materia, idx) => (
                                    <div key={idx} className={styles.listItem}>
                                        {materia.nombre_materia}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.sidebarSection}>
                        <h4 className={styles.sectionTitle}>Preferencias</h4>
                            
                        {!preferencias ? (
                            <div className={styles.emptyState}>Sin preferencias configuradas.</div>
                        ) : (
                            <div className={styles.prefsBox}>
                                <div className={styles.prefItem}>
                                    <div className={styles.prefLabel}>Horas máximas por día</div>
                                    <div className={styles.prefValue}>{preferencias.max_horas_dia} horas</div>
                                </div>

                                <div className={styles.prefItem}>
                                    <div className={styles.prefLabel}>Preferencia de horario</div>
                                    <div className={styles.prefValue}>{preferencias.preferencia_horario}</div>
                                </div>

                                {preferencias.comentarios_adicionales && (
                                    <div className={styles.prefItem}>
                                        <div className={styles.prefLabel}>Comentarios</div>
                                        <div className={styles.prefComment}>{preferencias.comentarios_adicionales}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

ProfesorDetailsContent.propTypes = {
    profesorNombre: PropTypes.string.isRequired,
    infoProfesor: PropTypes.shape({
        disponibilidad: PropTypes.array,
        materias: PropTypes.array,
        preferencias: PropTypes.object
    }).isRequired
};

export default ProfesorDetailsContent;