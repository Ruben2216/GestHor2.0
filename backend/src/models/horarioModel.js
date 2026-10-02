import { dbConnection } from '../config/database.js';


const contarHorasAsignadasSemana = async (profesorId) => {
    try {
        // Consulta mínima solicitada por el usuario: devolver la suma de intervalos
        // tal cual como Postgres lo entrega (por ejemplo '01:00:00').
        const query = `
            SELECT SUM(hora_fin - hora_inicio) AS horas_totales
            FROM horarios
            WHERE profesor_id = $1
        `;

        const result = await dbConnection.one(query, [profesorId]);
        // Devolvemos el valor tal cual (puede ser NULL o una cadena/intervalo)
        return { horas_totales: result.horas_totales };
    } catch (error) {
        console.error('Error en contarHorasAsignadasSemana:', error);
        throw error;
    }
};


/**
 * Obtener todos los horarios
 */
const obtenerHorarios = async () => {
    const query = `
        SELECT 
            h.horario_id,
            h.profesor_id,
            h.materia_id,
            h.salon_id,
            h.dia_semana,
            h.hora_inicio,
            h.hora_fin,
            p.nombres,
            p.apellidos,
            mc.nombre_materia
        FROM horarios h
        JOIN profesores p ON h.profesor_id = p.profesor_id
        JOIN materias_catalogo mc ON h.materia_id = mc.materia_id
        ORDER BY h.dia_semana, h.hora_inicio
    `;
    return await dbConnection.any(query);
};

/**
 * Obtener horarios por profesor
 */
const obtenerHorariosPorProfesor = async (profesorId) => {
    const query = `
        SELECT 
            h.horario_id,
            h.profesor_id,
            h.materia_id,
            h.salon_id,
            h.dia_semana,
            h.hora_inicio,
            h.hora_fin,
            mc.nombre_materia,
            s.nombre_salon,
            s.tipo_salon,
            e.edificio_id,
            e.nombre_edificio,
            l.lugar_id,
            l.nombre_lugar
        FROM horarios h
        JOIN materias_catalogo mc ON h.materia_id = mc.materia_id
        LEFT JOIN salones s ON h.salon_id = s.salon_id
        LEFT JOIN edificios e ON s.edificio_id = e.edificio_id
        LEFT JOIN lugares l ON e.lugar_id = l.lugar_id
        WHERE h.profesor_id = $1
        ORDER BY
            CASE
                WHEN h.dia_semana ILIKE 'Lunes' THEN 1
                WHEN h.dia_semana ILIKE 'Martes' THEN 2
                WHEN h.dia_semana ILIKE 'Miércoles' THEN 3
                WHEN h.dia_semana ILIKE 'Miercoles' THEN 3
                WHEN h.dia_semana ILIKE 'Jueves' THEN 4
                WHEN h.dia_semana ILIKE 'Viernes' THEN 5
                ELSE 6
            END,
            h.hora_inicio
    `;
    return await dbConnection.any(query, [profesorId]);
};

/**
 * Crear un nuevo horario
 */
const crearHorario = async (profesorId, materiaId, salonId, diaSemana, horaInicio, horaFin) => {
    const query = `
        INSERT INTO horarios 
            (profesor_id, materia_id, salon_id, dia_semana, hora_inicio, hora_fin)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    return await dbConnection.one(query, [profesorId, materiaId, salonId, diaSemana, horaInicio, horaFin]);
};

/**
 * Actualizar un horario existente
 */
const actualizarHorario = async (horarioId, profesorId, materiaId, salonId, diaSemana, horaInicio, horaFin) => {
    const query = `
        UPDATE horarios
        SET 
            profesor_id = $2,
            materia_id = $3,
            salon_id = $4,
            dia_semana = $5,
            hora_inicio = $6,
            hora_fin = $7
        WHERE horario_id = $1
        RETURNING *
    `;
    return await dbConnection.one(query, [horarioId, profesorId, materiaId, salonId, diaSemana, horaInicio, horaFin]);
};

/**
 * Eliminar un horario
 */
const eliminarHorario = async (horarioId) => {
    const query = `DELETE FROM horarios WHERE horario_id = $1`;
    return await dbConnection.result(query, [horarioId]);
};

/**
 * Verificar si existe un choque de horario para un profesor
 */
const verificarChoqueProfesor = async (profesorId, diaSemana, horaInicio, horaFin, horarioIdExcluir = null) => {
    let query = `
        SELECT * FROM horarios
        WHERE profesor_id = $1
        AND dia_semana = $2
        AND (
            (hora_inicio < $4 AND hora_fin > $3)
            OR (hora_inicio >= $3 AND hora_inicio < $4)
        )
    `;
    const params = [profesorId, diaSemana, horaInicio, horaFin];

    if (horarioIdExcluir) {
        query += ` AND horario_id != $5`;
        params.push(horarioIdExcluir);
    }

    return await dbConnection.any(query, params);
};

/**
 * Verificar si existe un choque de horario para un salón
 */
const verificarChoqueSalon = async (salonId, diaSemana, horaInicio, horaFin, horarioIdExcluir = null) => {
    let query = `
        SELECT * FROM horarios
        WHERE salon_id = $1
        AND dia_semana = $2
        AND (
            (hora_inicio < $4 AND hora_fin > $3)
            OR (hora_inicio >= $3 AND hora_inicio < $4)
        )
    `;
    const params = [salonId, diaSemana, horaInicio, horaFin];

    if (horarioIdExcluir) {
        query += ` AND horario_id != $5`;
        params.push(horarioIdExcluir);
    }

    return await dbConnection.any(query, params);
};


/**
 * Obtener horarios por salón (incluye información del profesor, materia y jerarquía salon->edificio->lugar)
 */
const obtenerHorariosPorSalon = async (salonId) => {
    const query = `
        SELECT 
            h.horario_id,
            h.profesor_id,
            h.materia_id,
            h.salon_id,
            h.dia_semana,
            h.hora_inicio,
            h.hora_fin,
            p.nombres,
            p.apellidos,
            mc.nombre_materia,
            s.nombre_salon,
            s.tipo_salon,
            e.edificio_id,
            e.nombre_edificio,
            l.lugar_id,
            l.nombre_lugar
        FROM horarios h
        JOIN profesores p ON h.profesor_id = p.profesor_id
        JOIN materias_catalogo mc ON h.materia_id = mc.materia_id
        LEFT JOIN salones s ON h.salon_id = s.salon_id
        LEFT JOIN edificios e ON s.edificio_id = e.edificio_id
        LEFT JOIN lugares l ON e.lugar_id = l.lugar_id
        WHERE h.salon_id = $1
        ORDER BY
            CASE
                WHEN h.dia_semana ILIKE 'Lunes' THEN 1
                WHEN h.dia_semana ILIKE 'Martes' THEN 2
                WHEN h.dia_semana ILIKE 'Miércoles' THEN 3
                WHEN h.dia_semana ILIKE 'Miercoles' THEN 3
                WHEN h.dia_semana ILIKE 'Jueves' THEN 4
                WHEN h.dia_semana ILIKE 'Viernes' THEN 5
                ELSE 6
            END,
            h.hora_inicio
    `;
    return await dbConnection.any(query, [salonId]);
};

export {
    obtenerHorarios,
    obtenerHorariosPorProfesor,
    contarHorasAsignadasSemana,
    crearHorario,
    actualizarHorario,
    eliminarHorario,
    verificarChoqueProfesor,
    verificarChoqueSalon,
    obtenerHorariosPorSalon
};
