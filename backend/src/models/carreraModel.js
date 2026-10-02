import { dbConnection } from "../config/database.js";

/**
 * Obtener todas las carreras
 */
const obtenerTodas = async () => {
    try {
        const carreras = await dbConnection.any(
            'SELECT * FROM carreras ORDER BY nombre_carrera'
        );
        return carreras;
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        throw error;
    }
};

/**
 * Obtener una carrera por ID con sus materias agrupadas por semestre
 */
const obtenerPorId = async (id) => {
    try {
        // Obtener la carrera
        const carrera = await dbConnection.oneOrNone(
            'SELECT * FROM carreras WHERE carrera_id = $1',
            [id]
        );
        
        if (!carrera) {
            return null;
        }

        // Obtener las materias asignadas agrupadas por semestre
        const materias = await dbConnection.any(
            `SELECT mc.materia_id, mc.nombre_materia, cm.numero_semestre 
             FROM carrera_materias cm
             JOIN materias_catalogo mc ON cm.materia_id = mc.materia_id
             WHERE cm.carrera_id = $1 
             ORDER BY cm.numero_semestre, mc.nombre_materia`,
            [id]
        );

        // Agrupar materias por semestre
        const materiasPorSemestre = {};
        materias.forEach(materia => {
            if (!materiasPorSemestre[materia.numero_semestre]) {
                materiasPorSemestre[materia.numero_semestre] = [];
            }
            materiasPorSemestre[materia.numero_semestre].push({
                id: materia.materia_id,
                nombre: materia.nombre_materia
            });
        });

        return {
            ...carrera,
            materias: materiasPorSemestre
        };
    } catch (error) {
        console.error('Error al obtener carrera por ID:', error);
        throw error;
    }
};

/**
 * Insertar una carrera
 */
const insertar = async (carrera) => {
    try {
        const { nombre_carrera, total_semestres } = carrera;

        // Verificar si ya existe una carrera con ese nombre
        const existe = await dbConnection.oneOrNone(
            'SELECT * FROM carreras WHERE nombre_carrera = $1',
            [nombre_carrera]
        );

        if (existe) {
            return null; // Ya existe
        }

        const resultado = await dbConnection.one(
            `INSERT INTO carreras (nombre_carrera, total_semestres) 
             VALUES ($1, $2) 
             RETURNING *`,
            [nombre_carrera, total_semestres]
        );

        return resultado;
    } catch (error) {
        console.error('Error al insertar carrera:', error);
        throw error;
    }
};

/**
 * Actualizar una carrera
 */
const actualizar = async (id, carrera) => {
    try {
        const { nombre_carrera, total_semestres } = carrera;

        const resultado = await dbConnection.one(
            `UPDATE carreras 
             SET nombre_carrera = $1, total_semestres = $2
             WHERE carrera_id = $3
             RETURNING *`,
            [nombre_carrera, total_semestres, id]
        );

        return resultado;
    } catch (error) {
        console.error('Error al actualizar carrera:', error);
        throw error;
    }
};

/**
 * Eliminar una carrera (esto también eliminará sus materias por CASCADE)
 */
const eliminar = async (id) => {
    try {
        const resultado = await dbConnection.result(
            'DELETE FROM carreras WHERE carrera_id = $1',
            [id]
        );
        return resultado.rowCount > 0;
    } catch (error) {
        console.error('Error al eliminar carrera:', error);
        throw error;
    }
};

const contarCarreras = async () => {
    try {
        const resultado = await dbConnection.one('SELECT COUNT(*) as total FROM carreras');
        return parseInt(resultado.total, 10);
    } catch (error) {
        console.error('Error al contar carreras:', error);
        throw error;
    }
};

export { obtenerTodas, obtenerPorId, insertar, actualizar, eliminar, contarCarreras };
