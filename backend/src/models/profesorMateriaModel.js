import { dbConnection } from "../config/database.js";

// Obtener materias de un profesor
const obtenerMateriasPorProfesor = async (profesorId) => {
    try {
        const materias = await dbConnection.any(
            `SELECT pm.profesor_id, pm.materia_id, mc.nombre_materia
             FROM profesor_materias pm
             JOIN materias_catalogo mc ON pm.materia_id = mc.materia_id
             WHERE pm.profesor_id = $1
             ORDER BY mc.nombre_materia`,
            [profesorId]
        );
        return materias;
    } catch (error) {
        console.error('Error al obtener materias del profesor:', error);
        throw error;
    }
};

// Asignar materia a profesor
const asignarMateriaAProfesor = async (profesorId, materiaId) => {
    try {
        const existe = await dbConnection.oneOrNone(
            'SELECT * FROM profesor_materias WHERE profesor_id = $1 AND materia_id = $2',
            [profesorId, materiaId]
        );

        if (existe) {
            return null;
        }

        const resultado = await dbConnection.one(
            `INSERT INTO profesor_materias (profesor_id, materia_id) 
             VALUES ($1, $2) 
             RETURNING *`,
            [profesorId, materiaId]
        );

        return resultado;
    } catch (error) {
        console.error('Error al asignar materia al profesor:', error);
        throw error;
    }
};

// Eliminar materia de profesor
const eliminarMateriaDeProfesor = async (profesorId, materiaId) => {
    try {
        const resultado = await dbConnection.result(
            'DELETE FROM profesor_materias WHERE profesor_id = $1 AND materia_id = $2',
            [profesorId, materiaId]
        );
        return resultado.rowCount > 0;
    } catch (error) {
        console.error('Error al eliminar materia del profesor:', error);
        throw error;
    }
};

export { obtenerMateriasPorProfesor, asignarMateriaAProfesor, eliminarMateriaDeProfesor };
