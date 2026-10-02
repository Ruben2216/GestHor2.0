import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { useToast } from "../../components/ui/NotificacionFlotante";
import { obtenerEstadisticasDocentes } from "../../services/docenteService";
import { obtenerEstadisticasCarreras } from "../../services/carreraService";
import { HorarioPDFExporter } from "../../utils/pdfExportService";
import { HorarioExcelExporter } from "../../utils/excelExportService";
import usePageTitle from "../../hooks/usePageTitle";

import { MdDashboardCustomize } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { FaClock, FaFilePdf, FaFileExcel, FaChalkboardTeacher, FaGraduationCap, FaSchool, FaRegCalendarCheck } from "react-icons/fa";

// Tarjeta de stats
function StatCard({ label, value, loading = false }) {
  const renderIcon = () => {
    const size = 16;
    if (String(label).toLowerCase().includes("docente")) return <FaChalkboardTeacher size={size} aria-hidden="true" />;
    if (String(label).toLowerCase().includes("carrera")) return <FaGraduationCap size={size} aria-hidden="true" />;
    if (String(label).toLowerCase().includes("salon")) return <FaSchool size={size} aria-hidden="true" />;
    if (String(label).toLowerCase().includes("activo")) return <FaRegCalendarCheck size={size} aria-hidden="true" />;
    return null;
  };

  return (
    <div className={`card ${styles["dashboard__stat-card"]}`}>
      <div className={styles["dashboard__stat-card__label"]} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {renderIcon()}
        {label}
      </div>
      <div className={styles["dashboard__stat-card__value"]}>
        {loading ? <span className={styles["dashboard__muted"]}>...</span> : value}
      </div>
    </div>
  );
}

//Tabla de horarios (admin)
function ScheduleTable() {
  const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes"];

  const normalize = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const matutinoSlots = [
    "07:00 - 08:00",
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
  ];
  const vespertinoSlots = [
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00",
    "21:00 - 22:00",
  ];

  // Estado UI
  const [tipo, setTipo] = useState("matutino"); // "matutino" | "vespertino"
  const [docentes, setDocentes] = useState([]);
  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState([]); // lista filtrada
  const [profesorSel, setProfesorSel] = useState(null); // profesor_id, nombres, apellidos }
  const [lugaresEstructura, setLugaresEstructura] = useState([]);
  const [salonesFlat, setSalonesFlat] = useState([]);
  const [salonSel, setSalonSel] = useState(null);
  const [salonHorarios, setSalonHorarios] = useState([]);

  // datos del horario del profesor que se seleccione
  const [schedule, setSchedule] = useState({ slots: [], classes: {} });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const { notify } = useToast();

  // cargar docentes
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setError(null);
        const r = await fetch("http://localhost:3000/api/docentes");
        if (!r.ok) throw new Error("No se pudieron cargar los docentes.");
        const data = await r.json();
        const lista = Array.isArray(data) ? data : data.docentes || [];
        if (!abort) {
          setDocentes(lista);
          setSugerencias(lista.slice(0, 8));
        }
      } catch (e) {
        if (!abort) setError(e.message);
      }
    })();
    return () => {
      abort = true;
    };
  }, []);

  // Cargar estructura de lugares -> edificios -> salones
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const r = await fetch('http://localhost:3000/api/lugares');
        if (!r.ok) throw new Error('No se pudieron cargar los lugares.');
        const json = await r.json();
        const estructura = Array.isArray(json) ? json : json.lugares || json;
        if (abort) return;
        setLugaresEstructura(estructura || []);
        // aplanar salones
        const flat = [];
        for (const lugar of estructura || []) {
          for (const edificio of lugar.edificios || []) {
            for (const salon of edificio.salones || []) {
              flat.push({
                salon_id: salon.salon_id,
                nombre_salon: salon.nombre_salon,
                tipo_salon: salon.tipo_salon,
                edificio_id: edificio.edificio_id,
                nombre_edificio: edificio.nombre_edificio,
                lugar_id: lugar.lugar_id,
                nombre_lugar: lugar.nombre_lugar,
              });
            }
          }
        }
        setSalonesFlat(flat);
      } catch (e) {
        console.error('Error cargando estructura de lugares:', e);
      }
    })();
    return () => { abort = true; };
  }, []);

  // Filtrado por nombre (autocompletado) *MEJORAR*
  useEffect(() => {
    const q = normalize(query);
    if (!q) {
      setSugerencias(docentes.slice(0, 8));
      return;
    }
    const filtered = docentes.filter((d) =>
      normalize(`${d.nombres} ${d.apellidos}`).includes(q)
    );
    setSugerencias(filtered.slice(0, 12));
  }, [query, docentes]);

  // Cargar horario del profesor seleccionado
  useEffect(() => {
    const cargarHorario = async () => {
      if (!profesorSel?.profesor_id) {
        setSchedule({
          slots: tipo === "matutino" ? matutinoSlots : vespertinoSlots,
          classes: {},
        });
        return;
      }
      try {
        setCargando(true);
        setError(null);

        const resp = await fetch(
          `http://localhost:3000/api/horarios/profesor/${encodeURIComponent(
            profesorSel.profesor_id
          )}`
        );
        if (!resp.ok) throw new Error("No se pudo obtener el horario del profesor.");
        const json = await resp.json();
        const rows = Array.isArray(json?.horarios)
          ? json.horarios
          : Array.isArray(json)
            ? json
            : [];

        const horaToSlot = (hora) => {
          if (!hora) return null;
          const h = String(hora).substring(0, 5);
          const all = [...matutinoSlots, ...vespertinoSlots];
          for (const s of all) if (s.startsWith(h)) return s;
          const [hh, mm] = h.split(":").map(Number);
          const hh2 = String(hh + 1).padStart(2, "0");
          return `${h} - ${hh2}:${String(mm).padStart(2, "0")}`;
        };

        const classes = {};
        for (const r of rows) {
          const slot = horaToSlot(r.hora_inicio);
          if (!slot) continue;

          const diaKey = normalize(r.dia_semana);
          if (!DAYS.includes(diaKey)) continue;

          const subject = r.nombre_materia || "";
          const roomParts = [];
          if (r.nombre_salon) roomParts.push(r.nombre_salon);
          if (r.nombre_edificio) roomParts.push(r.nombre_edificio);
          if (r.nombre_lugar) roomParts.push(r.nombre_lugar);
          const room = roomParts.join(" - ");

          const _colors = [
            "blue",
            "green",
            "yellow",
            "red",
            "purple",
            "cyan",
            "pink",
            "teal",
            "amber",
            "lime",
            "indigo",
          ];
          const colorClass = `pf-c-${_colors[(r.materia_id || 0) % _colors.length]}`;

          const parseMinutes = (t) => {
            const s = String(t || "").substring(0, 5);
            const [hh, mm] = s.split(":").map(Number);
            return (hh || 0) * 60 + (mm || 0);
          };
          const startMin = parseMinutes(r.hora_inicio);
          const endMin = parseMinutes(r.hora_fin);
          let span = 1;
          if (endMin > startMin) span = Math.max(1, Math.round((endMin - startMin) / 60));

          const slotsArray = matutinoSlots.includes(slot) ? matutinoSlots : vespertinoSlots;
          const startIndex = slotsArray.indexOf(slot);

          for (let i = 0; i < span; i++) {
            const idx = startIndex + i;
            if (idx < 0 || idx >= slotsArray.length) break;
            const targetSlot = slotsArray[idx];

            if (!classes[targetSlot]) classes[targetSlot] = {};

            const item = { s: subject, r: room, c: colorClass };

            if (classes[targetSlot][diaKey]) {
              const existing = classes[targetSlot][diaKey];
              classes[targetSlot][diaKey] = Array.isArray(existing)
                ? [...existing, item]
                : [existing, item];
            } else {
              classes[targetSlot][diaKey] = item;
            }
          }
        }

        const finalSlots = tipo === "matutino" ? matutinoSlots : vespertinoSlots;
        setSchedule({ slots: finalSlots, classes });
      } catch (e) {
        setError(e.message || "Error desconocido");
        setSchedule({
          slots: tipo === "matutino" ? matutinoSlots : vespertinoSlots,
          classes: {},
        });
      } finally {
        setCargando(false);
      }
    };

    cargarHorario();
  }, [profesorSel, tipo]);

  /**
 * Exporta el horario actual a PDF
 */
  const exportPDF = () => {
    try {
      HorarioPDFExporter.exportSchedule(
        schedule,
        tipo,
        profesorSel
          ? `${profesorSel.nombres} ${profesorSel.apellidos}`
          : "Profesor"
      );
      notify({ type: 'success', message: 'Horario generado correctamente en PDF.', duration: 5000 });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      notify({ type: 'error', message: 'Error al generar el PDF. Por favor, intenta nuevamente.' });
    }
  };

  /**
   * Exporta el horario actual a Excel
   */
  const exportExcel = async () => {
    try {
      await Promise.resolve(HorarioExcelExporter.exportSchedule(
        schedule,
        tipo,
        profesorSel
          ? `${profesorSel.nombres} ${profesorSel.apellidos}`
          : "Profesor"
      ));
      notify({ type: 'success', message: 'Horario generado correctamente en Excel.', duration: 5000 });
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      notify({ type: 'error', message: 'Error al exportar el horario. Por favor, intenta nuevamente.' });
    }
  };

  return (
    <div className={`card ${styles["dashboard__card"]}`}>
      {/* Header */}
      <div className={styles["dashboard__header"]}>
        <div className={styles["dashboard__header__title"]} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <MdDashboardCustomize size={20} aria-hidden="true" />
          Visualización de Horarios
        </div>

        {/* Filtros */}
        <div className={styles["dashboard__filters"]}>
          {/* Buscador por nombre */}
          <div className={styles["dashboard__search"]} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FiSearch aria-hidden="true" />
            <input
              className={`btn ${styles["dashboard__search-input"]}`}
              placeholder="Buscar profesor por nombre…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setProfesorSel(null);
              }}
            />
            {query && sugerencias.length > 0 && !profesorSel && (
              <div className={styles["dashboard__suggestions"]}>
                {sugerencias.map((d) => (
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setProfesorSel(d);
                      setQuery(`${d.nombres} ${d.apellidos}`.trim());
                      setSugerencias([]);
                    }}
                    className={styles["dashboard__suggestion-item"]}
                  >
                    {d.nombres} {d.apellidos}
                  </div>
                ))}
                {sugerencias.length === 0 && (
                  <div className={styles["dashboard__no-matches"]}>Sin coincidencias</div>
                )}
              </div>
            )}
          </div>

          {/* Turno */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <FaClock size={14} aria-hidden="true" />
            <select className="btn" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="matutino">Matutino (07:00 - 14:00)</option>
              <option value="vespertino">Vespertino (15:00 - 22:00)</option>
            </select>
          </div>

          {/* Filtro por Salón */}
          <select
            className="btn"
            value={salonSel || ""}
            onChange={async (e) => {
              const val = e.target.value || null;
              setSalonSel(val);
              setSalonHorarios([]);
              if (val) {
                try {
                  const resp = await fetch(`http://localhost:3000/api/horarios/salon/${encodeURIComponent(val)}`);
                  if (!resp.ok) throw new Error('No se pudieron obtener los horarios del salón');
                  const json = await resp.json();
                  const rows = Array.isArray(json?.horarios) ? json.horarios : [];
                  setSalonHorarios(rows);
                } catch (err) {
                  console.error(err);
                }
              }
            }}
          >
            <option value="">Filtrar por salón </option>
            {salonesFlat.map((s) => (
              <option key={s.salon_id} value={s.salon_id}>
                {s.nombre_lugar} / {s.nombre_edificio} / {s.nombre_salon}
              </option>
            ))}
          </select>

          <button className="btn" onClick={exportPDF} title="Exportar a PDF" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <FaFilePdf aria-hidden="true" />
            PDF
          </button>
          <button className="btn btn--primary" onClick={exportExcel} title="Exportar a Excel" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <FaFileExcel aria-hidden="true" />
            Excel
          </button>
        </div>
      </div>

      {/* Estado */}
      {cargando && <p className={styles["dashboard__loading"]}>Cargando…</p>}
      {error && <p className={styles["dashboard__error"]}>{error}</p>}
      <div className={styles["dashboard__info"]}>
        {profesorSel
          ? `Profesor: ${profesorSel.nombres} ${profesorSel.apellidos}`
          : "Selecciona un profesor…"}
      </div>

      {/* Información del salón seleccionado */}
      {salonSel && (
        <div className={styles["dashboard__salon-info"]}>
          <div className={styles["dashboard__salon-info__title"]}>Salón seleccionado</div>
          {(() => {
            const info = salonesFlat.find(s => String(s.salon_id) === String(salonSel));
            if (!info) return <div className="form__hint">Información del salón no disponible</div>;
            const profesoresUnicos = Array.from(new Map(salonHorarios.map(h => [h.profesor_id, { profesor_id: h.profesor_id, nombres: h.nombres, apellidos: h.apellidos }])).values());
            return (
              <div className={styles["dashboard__salon-body"]}>
                <div className="form__hint">Lugar: {info.nombre_lugar}</div>
                <div className="form__hint">Edificio: {info.nombre_edificio}</div>
                <div className="form__hint">Salón: {info.nombre_salon} {info.tipo_salon && `(${info.tipo_salon})`}</div>
                <div className={styles["dashboard__salon-professors"]}>
                  <strong>Profesores con clases en este salón ({profesoresUnicos.length}):</strong>
                  <ul className={styles["dashboard__prof-list"]}>
                    {profesoresUnicos.map(p => (
                      <li key={p.profesor_id} className={styles["dashboard__prof-list-item"]}>
                        <span>{p.nombres} {p.apellidos}</span>
                        <div>
                          <button className="btn" onClick={() => { setProfesorSel(p); setQuery(`${p.nombres} ${p.apellidos}`); }}>Ver horario</button>
                        </div>
                      </li>
                    ))}
                    {profesoresUnicos.length === 0 && <li className="form__hint">No hay profesores asignados actualmente</li>}
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tabla */}
      <div className={styles["dashboard__table-wrapper"]}>
        {/* Priority: if a professor is selected, show the existing schedule table.
            If no professor but a salon is selected, show the compact materia-docente table. */}
        {profesorSel ? (
          <table className="table">
            <thead>
              <tr>
                <th style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FaClock size={12} aria-hidden="true" />
                  Hora
                </th>
                <th>Lunes</th>
                <th>Martes</th>
                <th>Miércoles</th>
                <th>Jueves</th>
                <th>Viernes</th>
              </tr>
            </thead>
            <tbody>
              {schedule.slots.map((slot) => (
                <tr key={slot}>
                  <td className={styles["dashboard__slot-cell"]}>{slot}</td>
                  {DAYS.map((dKey) => {
                    const info = schedule.classes[slot]?.[dKey];
                    return (
                      <td key={dKey}>
                        {Array.isArray(info) ? (
                          info.map((ev, idx) => (
                            <div
                              key={idx}
                              className={`pf-event ${ev.c} ${styles["dashboard__event"]}`}
                              title={ev.s}
                            >
                              <div className="pf-event__subject">{ev.s}</div>
                              <div className="pf-event__room">{ev.r}</div>
                            </div>
                          ))
                        ) : (
                          info && (
                            <div className={`pf-event ${info.c} ${styles["dashboard__event"]}`} title={info.s}>
                              <div className="pf-event__subject">{info.s}</div>
                              <div className="pf-event__room">{info.r}</div>
                            </div>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : salonSel ? (
          // Compact table grouped by materia + docente for the selected salon
          <table className="table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Docente</th>
                <th>Lunes</th>
                <th>Martes</th>
                <th>Miércoles</th>
                <th>Jueves</th>
                <th>Viernes</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // agrupar salonHorarios por materia+docente
                const groups = new Map();
                for (const h of salonHorarios || []) {
                  const key = `${h.materia_id}||${h.profesor_id}`;
                  if (!groups.has(key)) {
                    groups.set(key, {
                      materia_id: h.materia_id,
                      nombre_materia: h.nombre_materia,
                      profesor_id: h.profesor_id,
                      docente_nombre: `${h.nombres} ${h.apellidos}`,
                      byDay: { Lunes: [], Martes: [], 'Miércoles': [], Jueves: [], Viernes: [] }
                    });
                  }
                  const entry = groups.get(key);
                  const day = h.dia_semana || '';
                  const dayNorm = day === 'Miercoles' ? 'Miércoles' : day; // normalize possible accent
                  const time = `${String(h.hora_inicio || '').substring(0, 5)} - ${String(h.hora_fin || '').substring(0, 5)}`;
                  if (entry.byDay[dayNorm]) entry.byDay[dayNorm].push(time);
                }

                const rows = Array.from(groups.values());
                if (rows.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="form__hint">No hay clases registradas para este salón.</td>
                    </tr>
                  );
                }

                return rows.map((r) => (
                  <tr key={`${r.materia_id}-${r.profesor_id}`}>
                    <td className={styles["dashboard__strong-cell"]}>{r.nombre_materia}</td>
                    <td>{r.docente_nombre}</td>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((d) => (
                      <td key={d}>
                        {r.byDay[d] && r.byDay[d].length > 0 ? (
                          r.byDay[d].map((t, i) => (
                            <div key={i} className={styles["dashboard__small-mb"]}>{t}</div>
                          ))
                        ) : (
                          <span className="form__hint">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FaClock size={12} aria-hidden="true" />
                  Hora
                </th>
                <th>Lunes</th>
                <th>Martes</th>
                <th>Miércoles</th>
                <th>Jueves</th>
                <th>Viernes</th>
              </tr>
            </thead>
            <tbody>
              {schedule.slots.map((slot) => (
                <tr key={slot}>
                  <td className={styles["dashboard__slot-cell"]}>{slot}</td>
                  {DAYS.map((dKey) => <td key={dKey}></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Pagina completa del Dashboard 
export default function Dashboard() {
  usePageTitle("Dashboard");

  // Estados de stats
  const [stats, setStats] = useState({
    docentes: 0,
    carreras: 0,
    salones: 0,
    activos: 0,
  });
  const [cargando, setCargando] = useState(true);

  // Cargar estadísticas
  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);

        const [estadisticasDocentes, estadisticasCarreras] = await Promise.all([
          obtenerEstadisticasDocentes(),
          obtenerEstadisticasCarreras(),
        ]);

        const respLugares = await fetch("http://localhost:3000/api/lugares");
        const dataLugares = await respLugares.json();
        const estructura = Array.isArray(dataLugares)
          ? dataLugares
          : dataLugares.lugares || [];

        let totalSalones = 0;
        for (const lugar of estructura) {
          for (const edificio of lugar.edificios || []) {
            totalSalones += (edificio.salones || []).length;
          }
        }

        const respHorarios = await fetch("http://localhost:3000/api/horarios");
        const dataHorarios = await respHorarios.json();
        const totalActivos = Array.isArray(dataHorarios)
          ? dataHorarios.length
          : dataHorarios.horarios?.length || 0;

        setStats({
          docentes: estadisticasDocentes.estadisticas.totalDocentes,
          carreras: estadisticasCarreras.estadisticas.totalCarreras,
          salones: totalSalones,
          activos: totalActivos,
        });
      } catch (e) {
        console.error("Error al cargar estadísticas:", e);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  return (
    <>
      {/* Título */}
      <div className={styles["dashboard__page-header"]}>
        <h2 className={`main__title ${styles["dashboard__main-title"]}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <MdDashboardCustomize size={22} aria-hidden="true" />
          Dashboard Principal
        </h2>
        <p className={`main__subtitle ${styles["dashboard__main-subtitle"]}`}> Vista general del sistema de horarios </p>
      </div>

      {/* Stats */}
      <div className={`grid grid--4 ${styles["dashboard__stats"]}`}>
        <StatCard label="Total Docentes" value={stats.docentes} loading={cargando} />
        <StatCard label="Carreras" value={stats.carreras} loading={cargando} />
        <StatCard label="Salones" value={stats.salones} />
        <StatCard label="Horarios Activos" value={stats.activos} />
      </div>

      {/* Horario con búsqueda por profesor + turno */}
      <ScheduleTable />
    </>
  );
}
