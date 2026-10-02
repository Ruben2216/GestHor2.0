import { dbConnection } from '../config/database.js';

export const crearSolicitudRecuperacion = async (usuarioId, motivo) => {
    const query = `
        INSERT INTO solicitudes_recuperacion (usuario_id, motivo)
        VALUES ($1, $2)
        RETURNING solicitud_id, usuario_id, motivo, estado, fecha_solicitud
    `;
    const result = await dbConnection.one(query, [usuarioId, motivo]);
    return result;
};

export const obtenerSolicitudesPendientes = async () => {
    const query = `
        SELECT 
            sr.solicitud_id,
            sr.usuario_id,
            sr.motivo,
            sr.estado,
            sr.fecha_solicitud,
            u.email,
            p.nombres || ' ' || p.apellidos AS nombre_completo,
            p.matricula
        FROM solicitudes_recuperacion sr
        INNER JOIN usuarios u ON sr.usuario_id = u.usuario_id
        LEFT JOIN profesores p ON u.usuario_id = p.profesor_id
        WHERE sr.estado = 'PENDIENTE'
        ORDER BY sr.fecha_solicitud DESC
    `;
    const result = await dbConnection.any(query);
    return result;
};

export const obtenerTodasSolicitudes = async () => {
    const query = `
        SELECT 
            sr.solicitud_id,
            sr.usuario_id,
            sr.motivo,
            sr.estado,
            sr.fecha_solicitud,
            sr.fecha_resolucion,
            u.email,
            p.nombres || ' ' || p.apellidos AS nombre_completo,
            p.matricula
        FROM solicitudes_recuperacion sr
        INNER JOIN usuarios u ON sr.usuario_id = u.usuario_id
        LEFT JOIN profesores p ON u.usuario_id = p.profesor_id
        ORDER BY sr.fecha_solicitud DESC
    `;
    const result = await dbConnection.any(query);
    return result;
};

export const resolverSolicitud = async (solicitudId) => {
    const query = `
        UPDATE solicitudes_recuperacion
        SET estado = 'RESUELTA',
            fecha_resolucion = CURRENT_TIMESTAMP
        WHERE solicitud_id = $1
        RETURNING *
    `;
    const result = await dbConnection.one(query, [solicitudId]);
    return result;
};

export const obtenerEstadisticasSolicitudes = async () => {
    const query = `
        SELECT 
            COUNT(*) FILTER (WHERE estado = 'PENDIENTE') as pendientes,
            COUNT(*) FILTER (WHERE estado = 'RESUELTA' AND DATE(fecha_resolucion) = CURRENT_DATE) as resueltas_hoy,
            COUNT(*) FILTER (WHERE DATE_TRUNC('month', fecha_solicitud) = DATE_TRUNC('month', CURRENT_DATE)) as total_mes
        FROM solicitudes_recuperacion
    `;
    const result = await dbConnection.one(query);
    return result;
};

export const obtenerUsuarioPorSolicitud = async (solicitudId) => {
    const query = `
        SELECT 
            u.usuario_id,
            u.email,
            p.nombres || ' ' || p.apellidos AS nombre_completo
        FROM solicitudes_recuperacion sr
        INNER JOIN usuarios u ON sr.usuario_id = u.usuario_id
        LEFT JOIN profesores p ON u.usuario_id = p.profesor_id
        WHERE sr.solicitud_id = $1
    `;
    const result = await dbConnection.oneOrNone(query, [solicitudId]);
    return result;
};

export const registrarActividad = async (solicitudId, tipoActividad, descripcion) => {
    const query = `
        INSERT INTO actividades_solicitudes (solicitud_id, tipo_actividad, descripcion)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const result = await dbConnection.one(query, [solicitudId, tipoActividad, descripcion]);
    return result;
};

export const obtenerActividadesRecientes = async (limite = 10) => {
    const query = `
        SELECT 
            a.actividad_id,
            a.solicitud_id,
            a.tipo_actividad,
            a.descripcion,
            a.fecha_actividad,
            u.email,
            p.nombres || ' ' || p.apellidos AS nombre_usuario
        FROM actividades_solicitudes a
        INNER JOIN solicitudes_recuperacion sr ON a.solicitud_id = sr.solicitud_id
        INNER JOIN usuarios u ON sr.usuario_id = u.usuario_id
        LEFT JOIN profesores p ON u.usuario_id = p.profesor_id
        WHERE a.fecha_actividad >= CURRENT_DATE
        ORDER BY a.fecha_actividad DESC
        LIMIT $1
    `;
    const result = await dbConnection.any(query, [limite]);
    return result;
};
