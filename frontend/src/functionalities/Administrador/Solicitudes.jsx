import { useMemo, useState, useEffect } from "react";
import { useToast } from "../../components/ui/NotificacionFlotante";
import {
    obtenerSolicitudesPendientes,
    obtenerEstadisticasSolicitudes,
    regenerarPassword,
    obtenerActividadesRecientes
} from "../../services/solicitudRecuperacionService";
import styles from "./Solicitudes.module.css";
import usePageTitle from "../../hooks/usePageTitle";
 
import {
    MdSupportAgent, MdErrorOutline, MdCheckCircle, MdCalendarMonth, MdDoneAll, MdRefresh, MdPassword, MdEmail, MdPerson, MdAccessTime, MdInfo, MdTaskAlt
} from "react-icons/md";

function calcularTiempoTranscurrido(fechaSolicitud) {
    const ahora = new Date();
    const fecha = new Date(fechaSolicitud);
    const diferencia = ahora - fecha;

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
}

export default function Solicitudes() {
    usePageTitle("Solicitudes");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState([]);
    const { notify } = useToast();

    const [resueltasHoy, setResueltasHoy] = useState(0);
    const totalMes = activity.length + resueltasHoy + requests.length;

    useEffect(() => {
        cargarSolicitudes();
        cargarEstadisticas();
        cargarActividades();
    }, []);

    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            const response = await obtenerSolicitudesPendientes();
            if (response.ok) {
                const solicitudesFormateadas = response.solicitudes.map(sol => ({
                    id: sol.solicitud_id,
                    solicitudId: sol.solicitud_id,
                    usuarioId: sol.usuario_id,
                    nombre: sol.nombre_completo || 'Usuario sin nombre',
                    usuario: sol.email.split('@')[0],
                    email: sol.email,
                    recibido: calcularTiempoTranscurrido(sol.fecha_solicitud),
                    motivo: sol.motivo,
                    prioridad: 'NORMAL'
                }));
                setRequests(solicitudesFormateadas);
            }
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            notify({ type: 'error', message: 'Error al cargar las solicitudes' });
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const response = await obtenerEstadisticasSolicitudes();
            if (response.ok) {
                setResueltasHoy(parseInt(response.estadisticas.resueltas_hoy) || 0);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const cargarActividades = async () => {
        try {
            const response = await obtenerActividadesRecientes(10);
            if (response.ok) {
                const actividadesFormateadas = response.actividades.map(act => ({
                    id: act.actividad_id,
                    text: act.descripcion,
                    type: act.tipo_actividad === 'PASSWORD_GENERADO' ? 'success' : 'info',
                    when: calcularTiempoTranscurrido(act.fecha_actividad)
                }));
                setActivity(actividadesFormateadas);
            }
        } catch (error) {
            console.error('Error al cargar actividades:', error);
        }
    };

    const stats = useMemo(
        () => ({
            pendientes: requests.length,
            resueltasHoy,
            totalMes,
        }),
        [requests.length, resueltasHoy, totalMes]
    );

    const priorityStyles = (p) => {
        if (p === "URGENTE")
            return {
                bg: "#fff7ed",
                border: "#fed7aa",
                pillBg: "#fef3c7",
                pillColor: "#a16207",
            };
        if (p === "NORMAL")
            return {
                bg: "#fffbeb",
                border: "#fde68a",
                pillBg: "#fef3c7",
                pillColor: "#92400e",
            };
        return {
            bg: "#eff6ff",
            border: "#bfdbfe",
            pillBg: "#e0f2fe",
            pillColor: "#075985",
        }; // BAJA
    };

    const addActivity = (text, type = "info") => {
        setActivity((arr) =>
            [
                { id: crypto.randomUUID(), text, type, when: "Ahora mismo" },
                ...arr,
            ].slice(0, 8)
        );
        cargarActividades();
    };

    const removeRequest = (id) => {
        setRequests((arr) => arr.filter((r) => r.id !== id));
    };

    const generateNewPassword = async (req) => {
        const ok = confirm(
            `¿Generar nueva contraseña para ${req.nombre}?\n\n` +
            `Se enviará una nueva llave de acceso al correo ${req.email}\n\n` +
            `Esta acción reemplazará la contraseña anterior.`
        );
        if (!ok) return;

        try {
            const response = await regenerarPassword(req.solicitudId);

            if (response.ok) {
                removeRequest(req.id);
                setResueltasHoy((n) => n + 1);
                cargarActividades();
                notify({ type: 'success', message: `✅ Contraseña regenerada exitosamente\nNueva llave de acceso: ${response.nuevoToken}\nSe ha enviado un correo a ${req.email} con la nueva llave.` });
            }
        } catch (error) {
            console.error('Error al generar contraseña:', error);
            notify({ type: 'error', message: 'Error al procesar la solicitud: ' + (error.response?.data?.mensaje || error.message) });
        }
    };

    const contactUser = (req) => {
        const msg = prompt(
            `Escribe el mensaje para ${req.email}:`,
            "Hola, recibimos tu solicitud. Te contactamos para verificar tu identidad antes de proceder."
        );
        if (!msg) return;
        addActivity(`Contacto enviado a ${req.nombre}`, "info");
        notify({ type: 'success', message: 'Mensaje enviado.' });
    };

    const markAllAsRead = async () => {
        if (!requests.length) return;
        if (!confirm("¿Marcar todas las solicitudes como leídas sin generar contraseñas?")) return;

        try {
            setResueltasHoy((n) => n + requests.length);
            setRequests([]);
            addActivity(
                "Todas las solicitudes pendientes fueron marcadas como leídas.",
                "success"
            );
        } catch (error) {
            console.error('Error al marcar solicitudes:', error);
            notify({ type: 'error', message: 'Error al procesar las solicitudes' });
        }
    };

    const refresh = () => {
        cargarSolicitudes();
        cargarEstadisticas();
        cargarActividades();
    };

    return (
        <>
            <div className={styles['solicitudes__header']}>
                <h2 className={`main__title ${styles['solicitudes__title']}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <MdSupportAgent size={22} aria-hidden="true" />
                    Solicitudes de ayuda
                </h2>
                <p className={`main__subtitle ${styles['solicitudes__subtitle']}`}>
                    Gestionar solicitudes de contraseñas perdidas
                </p>
            </div>

            {/*  Stats */}
            <div className={`grid ${styles['solicitudes__statsGrid']}`}>
                <div className="card">
                    <div className={styles['solicitudes__statLabel']} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <MdErrorOutline aria-hidden="true" />
                        Solicitudes Pendientes
                    </div>
                    <div className={`${styles['solicitudes__statValue']} ${styles['solicitudes__statValue--orange']}`}>
                        {stats.pendientes}
                    </div>
                </div>
                <div className="card">
                    <div className={styles['solicitudes__statLabel']} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <MdCheckCircle aria-hidden="true" />
                        Resueltas Hoy
                    </div>
                    <div className={`${styles['solicitudes__statValue']} ${styles['solicitudes__statValue--green']}`}>
                        {stats.resueltasHoy}
                    </div>
                </div>
                <div className="card">
                    <div className={styles['solicitudes__statLabel']} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <MdCalendarMonth aria-hidden="true" />
                        Total del Mes
                    </div>
                    <div className={`${styles['solicitudes__statValue']} ${styles['solicitudes__statValue--blue']}`}>
                        {stats.totalMes}
                    </div>
                </div>
            </div>

            {/* Lista de pendientes */}
            <div className={`card ${styles['solicitudes__pendingCard']}`}>
                <div className={styles['solicitudes__pendingHeader']}>
                    <h3 className={styles['solicitudes__pendingTitle']}>Solicitudes Pendientes</h3>
                    <div>
                        <button className="link-btn" onClick={markAllAsRead} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdDoneAll aria-hidden="true" />
                            Marcar todas como leídas
                        </button>
                        <button className="link-btn" onClick={refresh} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <MdRefresh aria-hidden="true" />
                            Actualizar
                        </button>
                    </div>
                </div>

                <div className={`grid ${styles['solicitudes__requestsGrid']}`}>
                    {loading ? (
                        <div className="form__hint">Cargando solicitudes...</div>
                    ) : requests.map((req) => {
                        return (
                            <div
                                key={req.id}
                                className={`card ${styles['solicitudes__requestCard']} ${styles[`solicitudes__requestCard--${req.prioridad}`]}`}
                            >
                                <div className={styles['solicitudes__requestInner']}>
                                    <div className={styles['solicitudes__requestMetaWrap']}>
                                        <div>
                                            <div className={styles['solicitudes__requestName']} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                <MdPerson aria-hidden="true" />
                                                {req.nombre}
                                            </div>
                                            <div className="form__hint" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                <MdAccessTime aria-hidden="true" />
                                                Recibido: {req.recibido}
                                            </div>
                                        </div>
                                    </div>

                                    <span className={`${styles['solicitudes__pill']} ${styles[`solicitudes__pill--${req.prioridad}`]}`}>
                                        {req.prioridad}
                                    </span>
                                </div>

                                <div className={styles['solicitudes__requestDetails']}>
                                    <div className={styles['solicitudes__requestText']}>
                                        <strong>Email:</strong> {req.email}
                                    </div>
                                    <div className={styles['solicitudes__requestText']}>
                                        <strong>Motivo:</strong> {req.motivo}
                                    </div>
                                </div>

                                <div className={styles['solicitudes__actions']}>
                                    <button
                                        className="btn btn--primary"
                                        onClick={() => generateNewPassword(req)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                    >
                                        <MdPassword aria-hidden="true" />
                                        Generar Nueva Contraseña
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={() => contactUser(req)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                    >
                                        <MdEmail aria-hidden="true" />
                                        Contactar
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {!loading && requests.length === 0 && (
                        <div className="form__hint">No hay solicitudes pendientes.</div>
                    )}
                </div>
            </div>

            {/* Actividad reciente */}
            <div className="card">
                <h3 className={styles['solicitudes__activityTitle']}>Actividad Reciente</h3>

                <div className={`grid ${styles['solicitudes__activityGrid']}`}>
                    {activity.map((a) => (
                        <div
                            key={a.id}
                            className={`card ${styles['solicitudes__activityCard']} ${a.type === "success" ? styles['solicitudes__activityCard--success'] : styles['solicitudes__activityCard--info']}`}
                        >
                            <div className={styles['solicitudes__activityInner']}>
                                <div className={styles['solicitudes__activityText']} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                    {a.type === "success" ? <MdTaskAlt aria-hidden="true" /> : <MdInfo aria-hidden="true" />}
                                    {a.text}
                                </div>
                                <div className="form__hint">{a.when}</div>
                            </div>
                        </div>
                    ))}
                    {activity.length === 0 && (
                        <div className="form__hint">Sin actividad aún.</div>
                    )}
                </div>
            </div>
        </>
    );
}
