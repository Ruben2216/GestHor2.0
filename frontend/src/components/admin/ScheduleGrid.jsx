import styles from "./ScheduleGrid.module.css";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const DAY_KEYS = ["lunes", "martes", "miercoles", "jueves", "viernes"];

const ScheduleGrid = ({
  schedule,
  onEdit,
  onDelete,
  cargando,
  error,
}) => {
  if (cargando) {
    return <div className={styles.message}>Cargando horario...</div>;
  }

  if (error) {
    return <div className={`${styles.message} ${styles.error}`}>{error}</div>;
  }

  const hasClasses = Object.values(schedule.classes).some(
    (day) => Object.keys(day).length > 0
  );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.timeHeader}>Hora</th>
            {DAYS.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.slots.length > 0 ? (
            schedule.slots.map((slot) => (
              <tr key={slot}>
                <td className={styles.timeCell}>{slot}</td>
                {DAY_KEYS.map((dKey) => {
                  const info = schedule.classes[slot]?.[dKey];
                  return (
                    <td key={dKey} className={styles.eventCell}>
                      {Array.isArray(info) ? (
                        info.map((ev, idx) => (
                          <div
                            key={idx}
                            className={`${styles.event} ${styles[ev.c]}`}
                            title={ev.s}
                            style={{ marginBottom: 4 }}
                          >
                            <div className={styles.eventSubject}>{ev.s}</div>
                            <div className={styles.eventRoom}>{ev.r}</div>
                            <div className={styles.eventActions}>
                              <button onClick={() => onEdit(ev.h)}>Editar</button>
                              <button onClick={() => onDelete(ev.h.horario_id)}>Eliminar</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        info && (
                          <div className={`${styles.event} ${styles[info.c]}`} title={info.s}>
                            <div className={styles.eventSubject}>{info.s}</div>
                            <div className={styles.eventRoom}>{info.r}</div>
                            <div className={styles.eventActions}>
                              <button onClick={() => onEdit(info.h)}>Editar</button>
                              <button onClick={() => onDelete(info.h.horario_id)}>Eliminar</button>
                            </div>
                          </div>
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={DAYS.length + 1}>
                <div className={styles.message}>
                  {hasClasses
                    ? "No hay clases en este turno."
                    : "No hay clases asignadas para este profesor."}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleGrid;