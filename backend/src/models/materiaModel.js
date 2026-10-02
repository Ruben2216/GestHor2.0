import { dbConnection } from "../config/database.js";

/**
 * Obtener todas las materias del CATÁLOGO GLOBAL
 */
const obtenerTodas = async () => {
    try {
        const materias = await dbConnection.any(
            `SELECT * FROM materias_catalogo 
             ORDER BY nombre_materia`
        );
        return materias;
    } catch (error) {
        console.error('Error al obtener materias del catálogo:', error);
        throw error;
    }
};

/**
 * Obtener materias asignadas a una carrera específica
 */
const obtenerPorCarrera = async (carreraId) => {
    try {
        const materias = await dbConnection.any(
            `SELECT mc.materia_id, mc.nombre_materia, cm.numero_semestre
             FROM carrera_materias cm
             JOIN materias_catalogo mc ON cm.materia_id = mc.materia_id
             WHERE cm.carrera_id = $1 
             ORDER BY cm.numero_semestre, mc.nombre_materia`,
            [carreraId]
        );
        return materias;
    } catch (error) {
        console.error('Error al obtener materias por carrera:', error);
        throw error;
    }
};

/**
 * Obtener una materia del catálogo por ID
 */
const obtenerPorId = async (id) => {
    try {
        const materia = await dbConnection.oneOrNone(
            `SELECT * FROM materias_catalogo WHERE materia_id = $1`,
            [id]
        );
        return materia;
    } catch (error) {
        console.error('Error al obtener materia por ID:', error);
        throw error;
    }
};

/**
 * Insertar una materia al CATÁLOGO GLOBAL
 */
const insertar = async (materia) => {
    try {
        const { nombre_materia } = materia;

        // Verificar si ya existe
        const existe = await dbConnection.oneOrNone(
            'SELECT materia_id FROM materias_catalogo WHERE LOWER(nombre_materia) = LOWER($1)',
            [nombre_materia]
        );

        if (existe) {
            return null; // Ya existe
        }

        const resultado = await dbConnection.one(
            `INSERT INTO materias_catalogo (nombre_materia) 
             VALUES ($1) 
             RETURNING *`,
            [nombre_materia]
        );

        return resultado;
    } catch (error) {
        console.error('Error al insertar materia:', error);
        throw error;
    }
};

/**
 * Asignar una materia del catálogo a una carrera en un semestre específico
 */
const asignarACarrera = async (carreraId, materiaId, numeroSemestre) => {
    try {
        // Verificar que la carrera existe
        const carreraExiste = await dbConnection.oneOrNone(
            'SELECT carrera_id FROM carreras WHERE carrera_id = $1',
            [carreraId]
        );

        if (!carreraExiste) {
            throw new Error('La carrera especificada no existe');
        }

        // Verificar que la materia existe en el catálogo
        const materiaExiste = await dbConnection.oneOrNone(
            'SELECT materia_id FROM materias_catalogo WHERE materia_id = $1',
            [materiaId]
        );

        if (!materiaExiste) {
            throw new Error('La materia especificada no existe en el catálogo');
        }

        // Verificar si la materia ya está asignada a la carrera en cualquier semestre
        const yaAsignada = await dbConnection.oneOrNone(
            `SELECT * FROM carrera_materias 
             WHERE carrera_id = $1 AND materia_id = $2`,
            [carreraId, materiaId]
        );

        if (yaAsignada) {
            return null; // Ya está asignada a la carrera
        }

        const resultado = await dbConnection.one(
            `INSERT INTO carrera_materias (carrera_id, materia_id, numero_semestre) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [carreraId, materiaId, numeroSemestre]
        );

        return resultado;
    } catch (error) {
        console.error('Error al asignar materia a carrera:', error);
        throw error;
    }
};

/**
 * Asignar múltiples materias a una carrera
 * materiasPorSemestre: { 1: [materiaId1, materiaId2], 2: [materiaId3] }
 */
const asignarMultiplesACarrera = async (carreraId, materiasPorSemestre) => {
    try {
        const asignaciones = [];

        for (const [semestre, materiasIds] of Object.entries(materiasPorSemestre)) {
            for (const materiaId of materiasIds) {
                const asignacion = await asignarACarrera(
                    carreraId, 
                    materiaId, 
                    parseInt(semestre)
                );
                if (asignacion) {
                    asignaciones.push(asignacion);
                }
            }
        }

        return asignaciones;
    } catch (error) {
        console.error('Error al asignar múltiples materias:', error);
        throw error;
    }
};

/**
 * Actualizar una materia del catálogo
 */
const actualizar = async (id, materia) => {
    try {
        const { nombre_materia } = materia;

        const resultado = await dbConnection.one(
            `UPDATE materias_catalogo 
             SET nombre_materia = $1
             WHERE materia_id = $2
             RETURNING *`,
            [nombre_materia, id]
        );

        return resultado;
    } catch (error) {
        console.error('Error al actualizar materia:', error);
        throw error;
    }
};

/**
 * Eliminar una materia del catálogo
 * NOTA: Solo se puede eliminar si no está asignada a ninguna carrera
 */
const eliminar = async (id) => {
    try {
        // Verificar si está asignada a alguna carrera
        const enUso = await dbConnection.oneOrNone(
            'SELECT carrera_id FROM carrera_materias WHERE materia_id = $1 LIMIT 1',
            [id]
        );

        if (enUso) {
            throw new Error('No se puede eliminar: la materia está asignada a una o más carreras');
        }

        const resultado = await dbConnection.result(
            'DELETE FROM materias_catalogo WHERE materia_id = $1',
            [id]
        );
        return resultado.rowCount > 0;
    } catch (error) {
        console.error('Error al eliminar materia:', error);
        throw error;
    }
};

/**
 * Desasignar una materia de una carrera en un semestre específico
 */
const desasignarDeCarrera = async (carreraId, materiaId, numeroSemestre) => {
    try {
        const resultado = await dbConnection.result(
            `DELETE FROM carrera_materias 
             WHERE carrera_id = $1 AND materia_id = $2 AND numero_semestre = $3`,
            [carreraId, materiaId, numeroSemestre]
        );
        return resultado.rowCount > 0;
    } catch (error) {
        console.error('Error al desasignar materia de carrera:', error);
        throw error;
    }
};

/**
 * Buscar materias por nombre (para autocompletado)
 */
const buscarPorNombre = async (termino) => {
    try {
        const materias = await dbConnection.any(
            `SELECT * FROM materias_catalogo 
             WHERE LOWER(nombre_materia) LIKE LOWER($1)
             ORDER BY nombre_materia
             LIMIT 20`,
            [`%${termino}%`]
        );
        return materias;
    } catch (error) {
        console.error('Error al buscar materias:', error);
        throw error;
    }
};

/**
 * Obtener materias asignadas a una carrera en un semestre específico
 */
const obtenerPorCarreraYSemestre = async (carreraId, numeroSemestre) => {
    try {
        const materias = await dbConnection.any(
            `SELECT mc.materia_id, mc.nombre_materia
             FROM carrera_materias cm
             JOIN materias_catalogo mc ON cm.materia_id = mc.materia_id
             WHERE cm.carrera_id = $1 AND cm.numero_semestre = $2
             ORDER BY mc.nombre_materia`,
            [carreraId, numeroSemestre]
        );
        return materias;
    } catch (error) {
        console.error('Error al obtener materias por carrera y semestre:', error);
        throw error;
    }
};

export { 
    obtenerTodas, 
    obtenerPorCarrera, 
    obtenerPorCarreraYSemestre,
    obtenerPorId, 
    insertar, 
    asignarACarrera,
    asignarMultiplesACarrera,
    actualizar, 
    eliminar,
    desasignarDeCarrera,
    buscarPorNombre
};
