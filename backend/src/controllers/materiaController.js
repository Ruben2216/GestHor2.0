import { 
    obtenerTodas, 
    obtenerPorCarrera, 
    obtenerPorCarreraYSemestre,
    obtenerPorId, 
    insertar, 
    actualizar, 
    eliminar,
    asignarACarrera,
    desasignarDeCarrera,
    buscarPorNombre
} from "../models/materiaModel.js";

/**
 * Obtener todas las materias del catálogo global
 */
const obtenerMateriasController = async (req, res) => {
    try {
        const materias = await obtenerTodas();
        res.json({ ok: true, materias });
    } catch (error) {
        console.error("Error en obtenerMateriasController:", error);
        res.status(500).json({ 
            ok: false, 
            mensaje: "Error al obtener materias del catálogo", 
            error: error.message 
        });
    }
};

/**
 * Obtener materias por carrera
 */
const obtenerMateriasPorCarreraController = async (req, res) => {
    try {
        const { carreraId } = req.params;
        const materias = await obtenerPorCarrera(carreraId);
        res.json({ ok: true, materias });
    } catch (error) {
        console.error("Error en obtenerMateriasPorCarreraController:", error);
        res.status(500).json({ 
            ok: false, 
            mensaje: "Error al obtener materias de la carrera", 
            error: error.message 
        });
    }
};

/**
 * Obtener materias por carrera y semestre
 */
const obtenerMateriasPorCarreraYSemestreController = async (req, res) => {
    try {
        const { carreraId, semestre } = req.params;
        const cId = parseInt(carreraId, 10);
        const sem = parseInt(semestre, 10);
        if (Number.isNaN(cId) || Number.isNaN(sem)) {
            return res.status(400).json({ ok: false, mensaje: 'Parámetros inválidos' });
        }
        const materias = await obtenerPorCarreraYSemestre(cId, sem);
        res.json({ ok: true, materias });
    } catch (error) {
        console.error('Error en obtenerMateriasPorCarreraYSemestreController:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener materias', error: error.message });
    }
};

/**
 * Obtener una materia por ID
 */
const obtenerMateriaPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const materia = await obtenerPorId(id);
        
        if (!materia) {
            return res.status(404).json({ 
                ok: false, 
                mensaje: "Materia no encontrada" 
            });
        }
        
        res.json({ ok: true, materia });
    } catch (error) {
        console.error("Error en obtenerMateriaPorIdController:", error);
        res.status(500).json({ 
            ok: false, 
            mensaje: "Error al obtener materia", 
            error: error.message 
        });
    }
};

/**
 * Insertar una materia al catálogo global
 */
const insertarMateriaController = async (req, res) => {
    try {
        const { nombre_materia, descripcion } = req.body;
        
        // Validaciones
        if (!nombre_materia) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la materia es obligatorio"
            });
        }

        const materia = await insertar({ nombre_materia, descripcion });
        
        if (materia === null) {
            return res.status(409).json({
                ok: false,
                mensaje: "Ya existe una materia con ese nombre en el catálogo"
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Materia agregada al catálogo exitosamente",
            materia
        });
    } catch (error) {
        console.error("Error en insertarMateriaController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al insertar materia",
            error: error.message 
        });
    }
};

/**
 * Actualizar una materia del catálogo
 */
const actualizarMateriaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_materia, descripcion } = req.body;
        
        if (!nombre_materia) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la materia es obligatorio"
            });
        }

        const materia = await actualizar(id, { nombre_materia, descripcion });
        
        res.json({
            ok: true,
            mensaje: "Materia actualizada exitosamente",
            materia
        });
    } catch (error) {
        console.error("Error en actualizarMateriaController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al actualizar materia",
            error: error.message 
        });
    }
};

/**
 * Eliminar una materia del catálogo
 * Solo si no está asignada a ninguna carrera
 */
const eliminarMateriaController = async (req, res) => {
    try {
        const { id } = req.params;
        
        const eliminado = await eliminar(id);
        
        if (!eliminado) {
            return res.status(404).json({ 
                ok: false, 
                mensaje: "Materia no encontrada" 
            });
        }
        
        res.json({ 
            ok: true, 
            mensaje: "Materia eliminada del catálogo exitosamente" 
        });
    } catch (error) {
        console.error("Error en eliminarMateriaController:", error);
        
        // Error específico si está en uso
        if (error.message.includes('está asignada')) {
            return res.status(400).json({
                ok: false,
                mensaje: error.message
            });
        }
        
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al eliminar materia",
            error: error.message 
        });
    }
};

/**
 * Asignar una materia del catálogo a una carrera
 * Body: { carrera_id, materia_id, numero_semestre }
 */
const asignarMateriaACarreraController = async (req, res) => {
    try {
        const { carrera_id, materia_id, numero_semestre } = req.body;
        
        if (!carrera_id || !materia_id || !numero_semestre) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan datos: carrera_id, materia_id y numero_semestre son obligatorios"
            });
        }

        const asignacion = await asignarACarrera(carrera_id, materia_id, numero_semestre);
        
        if (asignacion === null) {
            return res.status(409).json({
                ok: false,
                mensaje: "La materia ya está asignada a esta carrera"
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Materia asignada a la carrera exitosamente",
            asignacion
        });
    } catch (error) {
        console.error("Error en asignarMateriaACarreraController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al asignar materia",
            error: error.message 
        });
    }
};

/**
 * Desasignar una materia de una carrera
 */
const desasignarMateriaDeCarreraController = async (req, res) => {
    try {
        const { carreraId, materiaId, semestre } = req.params;
        
        const desasignado = await desasignarDeCarrera(
            parseInt(carreraId), 
            parseInt(materiaId), 
            parseInt(semestre)
        );
        
        if (!desasignado) {
            return res.status(404).json({
                ok: false,
                mensaje: "No se encontró la asignación"
            });
        }

        res.json({
            ok: true,
            mensaje: "Materia desasignada de la carrera exitosamente"
        });
    } catch (error) {
        console.error("Error en desasignarMateriaDeCarreraController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al desasignar materia",
            error: error.message 
        });
    }
};

/**
 * Buscar materias por nombre (autocompletado)
 */
const buscarMateriasController = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                ok: false,
                mensaje: "Proporciona un término de búsqueda de al menos 2 caracteres"
            });
        }

        const materias = await buscarPorNombre(q.trim());
        
        res.json({
            ok: true,
            materias
        });
    } catch (error) {
        console.error("Error en buscarMateriasController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al buscar materias",
            error: error.message 
        });
    }
};

export { 
    obtenerMateriasController, 
    obtenerMateriasPorCarreraController,
    obtenerMateriasPorCarreraYSemestreController,
    obtenerMateriaPorIdController, 
    insertarMateriaController, 
    actualizarMateriaController, 
    eliminarMateriaController,
    asignarMateriaACarreraController,
    desasignarMateriaDeCarreraController,
    buscarMateriasController
};
