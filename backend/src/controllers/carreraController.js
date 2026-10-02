import { obtenerTodas, obtenerPorId, insertar, actualizar, eliminar, contarCarreras } from "../models/carreraModel.js";
import { asignarMultiplesACarrera } from "../models/materiaModel.js";

/**
 * Obtener todas las carreras
 */
const obtenerCarrerasController = async (req, res) => {
    try {
        const carreras = await obtenerTodas();
        res.json({ ok: true, carreras });
    } catch (error) {
        console.error("Error en obtenerCarrerasController:", error);
        res.status(500).json({ 
            ok: false, 
            mensaje: "Error al obtener carreras", 
            error: error.message 
        });
    }
};

/**
 * Obtener una carrera por ID (incluye sus materias agrupadas por semestre)
 */
const obtenerCarreraPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const carrera = await obtenerPorId(id);
        
        if (!carrera) {
            return res.status(404).json({ 
                ok: false, 
                mensaje: "Carrera no encontrada" 
            });
        }
        
        res.json({ ok: true, carrera });
    } catch (error) {
        console.error("Error en obtenerCarreraPorIdController:", error);
        res.status(500).json({ 
            ok: false, 
            mensaje: "Error al obtener carrera", 
            error: error.message 
        });
    }
};

/**
 * Insertar una carrera con asignación de materias del catálogo
 * Body esperado:
 * {
 *   "nombre_carrera": "Ingeniería en Sistemas",
 *   "total_semestres": 8,
 *   "materias": {
 *     "1": [1, 2, 3],  // IDs de materias del catálogo para semestre 1
 *     "2": [4, 5]      // IDs de materias para semestre 2
 *   }
 * }
 */
const insertarCarreraController = async (req, res) => {
    try {
        const { nombre_carrera, total_semestres, materias } = req.body;
        
        // Validaciones básicas
        if (!nombre_carrera || !total_semestres) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la carrera y el número de semestres son obligatorios"
            });
        }

        // Insertar la carrera
        const carrera = await insertar({ nombre_carrera, total_semestres });
        
        if (carrera === null) {
            return res.status(409).json({
                ok: false,
                mensaje: "Ya existe una carrera con ese nombre",
                nombre: nombre_carrera
            });
        }

        // Si se proporcionan materias (IDs del catálogo), asignarlas
        let materiasAsignadas = [];
        if (materias && Object.keys(materias).length > 0) {
            materiasAsignadas = await asignarMultiplesACarrera(carrera.carrera_id, materias);
        }

        res.status(201).json({
            ok: true,
            mensaje: "Carrera creada exitosamente",
            carrera: {
                ...carrera,
                total_materias: materiasAsignadas.length
            }
        });
    } catch (error) {
        console.error("Error en insertarCarreraController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al insertar carrera",
            error: error.message 
        });
    }
};

/**
 * Actualizar una carrera (solo datos básicos, no materias)
 */
const actualizarCarreraController = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_carrera, total_semestres } = req.body;
        
        if (!nombre_carrera || !total_semestres) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la carrera y el número de semestres son obligatorios"
            });
        }

        const carrera = await actualizar(id, { nombre_carrera, total_semestres });
        
        res.json({
            ok: true,
            mensaje: "Carrera actualizada exitosamente",
            carrera
        });
    } catch (error) {
        console.error("Error en actualizarCarreraController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al actualizar carrera",
            error: error.message 
        });
    }
};

/**
 * Eliminar una carrera (también elimina sus materias por CASCADE)
 */
const eliminarCarreraController = async (req, res) => {
    try {
        const { id } = req.params;
        
        const eliminado = await eliminar(id);
        
        if (!eliminado) {
            return res.status(404).json({ 
                ok: false, 
                mensaje: "Carrera no encontrada" 
            });
        }
        
        res.json({ 
            ok: true, 
            mensaje: "Carrera eliminada exitosamente (incluyendo sus materias)" 
        });
    } catch (error) {
        console.error("Error en eliminarCarreraController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al eliminar carrera",
            error: error.message 
        });
    }
};

const obtenerEstadisticasCarrerasController = async (req, res) => {
    try {
        const total = await contarCarreras();
        res.json({ 
            ok: true, 
            estadisticas: {
                totalCarreras: total
            }
        });
    } catch (error) {
        console.error("Error en obtenerEstadisticasCarrerasController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al obtener estadísticas de carreras",
            error: error.message 
        });
    }
};

export { 
    obtenerCarrerasController, 
    obtenerCarreraPorIdController, 
    insertarCarreraController, 
    actualizarCarreraController, 
    eliminarCarreraController,
    obtenerEstadisticasCarrerasController
};
