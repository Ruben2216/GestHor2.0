import { dbConnection } from "../config/database.js";

const obtenerDisponibilidadProfesor = async (profesorId) => {
    const query = `
        SELECT 
            disponibilidad_id,
            dia_semana,
            hora_inicio,
            hora_fin,
            turno
        FROM profesor_disponibilidad
        WHERE profesor_id = $1
        ORDER BY 
            CASE dia_semana
                WHEN 'Lunes' THEN 1
                WHEN 'Martes' THEN 2
                WHEN 'Miércoles' THEN 3
                WHEN 'Jueves' THEN 4
                WHEN 'Viernes' THEN 5
            END,
            hora_inicio
    `;
    return await dbConnection.any(query, [profesorId]);
};

const guardarDisponibilidadSlot = async (profesorId, diasemana, horaInicio, horaFin, turno) => {
    const query = `
        INSERT INTO profesor_disponibilidad 
            (profesor_id, dia_semana, hora_inicio, hora_fin, turno)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (profesor_id, dia_semana, hora_inicio)
        DO UPDATE SET 
            hora_fin = EXCLUDED.hora_fin,
            turno = EXCLUDED.turno
        RETURNING *
    `;
    return await dbConnection.one(query, [profesorId, diasemana, horaInicio, horaFin, turno]);
};

const eliminarDisponibilidadProfesor = async (profesorId, turno = null) => {
    let query = `DELETE FROM profesor_disponibilidad WHERE profesor_id = $1`;
    const params = [profesorId];
    
    if (turno) {
        query += ` AND turno = $2`;
        params.push(turno);
    }
    
    return await dbConnection.result(query, params);
};

const obtenerPreferenciasProfesor = async (profesorId) => {
    const query = `
        SELECT 
            preferencia_id,
            max_horas_dia,
            preferencia_horario,
            comentarios_adicionales
        FROM profesor_preferencias
        WHERE profesor_id = $1
    `;
    return await dbConnection.oneOrNone(query, [profesorId]);
};

const guardarPreferenciasProfesor = async (profesorId, maxHorasDia, preferenciaHorario, comentarios) => {
    const queryVerificar = `
        SELECT preferencia_id FROM profesor_preferencias WHERE profesor_id = $1
    `;
    
    const existe = await dbConnection.oneOrNone(queryVerificar, [profesorId]);
    
    if (existe) {
        const queryUpdate = `
            UPDATE profesor_preferencias 
            SET 
                max_horas_dia = $2,
                preferencia_horario = $3,
                comentarios_adicionales = $4
            WHERE profesor_id = $1
            RETURNING *
        `;
        return await dbConnection.one(queryUpdate, [profesorId, maxHorasDia, preferenciaHorario, comentarios]);
    } else {
        const queryInsert = `
            INSERT INTO profesor_preferencias 
                (profesor_id, max_horas_dia, preferencia_horario, comentarios_adicionales)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        return await dbConnection.one(queryInsert, [profesorId, maxHorasDia, preferenciaHorario, comentarios]);
    }
};

export {
    obtenerDisponibilidadProfesor,
    guardarDisponibilidadSlot,
    eliminarDisponibilidadProfesor,
    obtenerPreferenciasProfesor,
    guardarPreferenciasProfesor
};
