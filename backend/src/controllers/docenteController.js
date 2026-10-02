import { obtenerTodos, obtenerPorId, obtenerNombreProfesor, insertarDocente, actualizarDocente, eliminarDocente, contarDocentes } from "../models/docenteModel.js";
import { dbConnection } from "../config/database.js";
import { enviarCorreoBienvenida, enviarCorreoConAdjunto } from "../services/emailService.js";

const obtenerDocentesController = async (req, res) => {
    try {
        const docentes = await obtenerTodos();
        res.json({ ok: true, docentes });
    } catch (error) {
        console.error("Error en obtenerDocentesController:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener docentes", error: error.message });
    }
};

const obtenerDocentePorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const docente = await obtenerPorId(id);
        
        if (!docente) {
            return res.status(404).json({ ok: false, mensaje: "Docente no encontrado" });
        }
        
        res.json({ ok: true, docente });
    } catch (error) {
        console.error("Error en obtenerDocentePorIdController:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener docente", error: error.message });
    }
};

const obtenerNombreProfesorController = async (req, res) => {
    try {
        const { id } = req.params;
        const profesor = await obtenerNombreProfesor(id);
        
        if (!profesor) {
            return res.status(404).json({ ok: false, mensaje: "Profesor no encontrado" });
        }
        
        res.json({ ok: true, profesor });
    } catch (error) {
        console.error("Error en obtenerNombreProfesorController:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener nombre del profesor", error: error.message });
    }
};

const insertarDocenteController = async (req, res) => {
    try {
        const docente = req.body;
        
        const resultado = await insertarDocente(docente);
        
        // Verificar si hubo error de duplicado
        if (resultado && resultado.error) {
            const statusCode = 409;
            const mensaje = resultado.error === 'matricula' 
                ? 'La matrícula ya existe en el sistema'
                : 'El email ya está registrado en el sistema';
            
            return res.status(statusCode).json({
                ok: false,
                mensaje: mensaje,
                campo: resultado.error
            });
        }
        
        // Enviar correo con token de acceso (asíncrono)
        const tokenAcceso = resultado.tokenAcceso;
        const nombreCompleto = `${resultado.nombres} ${resultado.apellidos}`;
        
        if (tokenAcceso && resultado.email) {
            enviarCorreoBienvenida({
                email: resultado.email,
                nombreCompleto,
                token: tokenAcceso
            }).then(resultadoEmail => {
                if (resultadoEmail.success) {
                    console.log(` Correo enviado a ${resultado.email}`);
                } else {
                    console.warn(`⚠️ No se pudo enviar correo a ${resultado.email}`);
                }
            }).catch(error => {
                console.error(`❌ Error al enviar correo:`, error);
            });
        }
        
        // Eliminar el token del resultado antes de enviar respuesta
        delete resultado.tokenAcceso;
        
        res.status(201).json({
            ok: true,
            mensaje: "Docente registrado exitosamente. Se ha enviado un correo con la llave de acceso.",
            // Devolvemos el docente con su tipo de contrato para consistencia en el frontend
            docente: {
                ...resultado,
                nombre_tipo: resultado.tipo_contrato_id 
                    ? (await dbConnection.oneOrNone('SELECT nombre_tipo FROM tipos_contrato WHERE tipo_contrato_id = $1', [resultado.tipo_contrato_id]))?.nombre_tipo 
                    : null,
                nivel_prioridad: resultado.tipo_contrato_id 
                    ? (await dbConnection.oneOrNone('SELECT nivel_prioridad FROM tipos_contrato WHERE tipo_contrato_id = $1', [resultado.tipo_contrato_id]))?.nivel_prioridad
                    : null
            }
        });
    } catch (error) {
        console.error("Error en insertarDocenteController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al insertar docente",
            error: error.message 
        });
    }
};

const actualizarDocenteController = async (req, res) => {
    try {
        const { id } = req.params;
        const docente = req.body;
        
        const resultado = await actualizarDocente(id, docente);
        
        res.json({
            ok: true,
            mensaje: "Docente actualizado exitosamente",
            docente: {
                ...resultado,
                nombre_tipo: resultado.tipo_contrato_id 
                    ? (await dbConnection.oneOrNone('SELECT nombre_tipo FROM tipos_contrato WHERE tipo_contrato_id = $1', [resultado.tipo_contrato_id]))?.nombre_tipo 
                    : null,
                nivel_prioridad: resultado.tipo_contrato_id 
                    ? (await dbConnection.oneOrNone('SELECT nivel_prioridad FROM tipos_contrato WHERE tipo_contrato_id = $1', [resultado.tipo_contrato_id]))?.nivel_prioridad
                    : null
            }
        });
    } catch (error) {
        console.error("Error en actualizarDocenteController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al actualizar docente",
            error: error.message 
        });
    }
};

const eliminarDocenteController = async (req, res) => {
    try {
        const { id } = req.params;
        
        const eliminado = await eliminarDocente(id);
        
        if (!eliminado) {
            return res.status(404).json({ ok: false, mensaje: "Docente no encontrado" });
        }
        
        res.json({ ok: true, mensaje: "Docente eliminado exitosamente" });
    } catch (error) {
        console.error("Error en eliminarDocenteController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al eliminar docente",
            error: error.message 
        });
    }
};

/**
 * Obtener estadísticas de docentes (contador)
 * Endpoint: GET /api/docentes/estadisticas
 */
const obtenerEstadisticasDocentesController = async (req, res) => {
    try {
        const total = await contarDocentes();
        res.json({ 
            ok: true, 
            estadisticas: {
                totalDocentes: total
            }
        });
    } catch (error) {
        console.error("Error en obtenerEstadisticasDocentesController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al obtener estadísticas de docentes",
            error: error.message 
        });
    }
};

/**
 * Enviar horario en PDF por correo a un docente
 * Endpoint: POST /api/docentes/:id/enviar-horario
 */
const enviarHorarioController = async (req, res) => {
    try {
        const { id } = req.params;
        const pdfFile = req.file;

        if (!pdfFile) {
            return res.status(400).json({ ok: false, mensaje: "No se recibió ningún archivo PDF." });
        }

        const docente = await obtenerPorId(id);
        if (!docente) {
            return res.status(404).json({ ok: false, mensaje: "Docente no encontrado." });
        }

        await enviarCorreoConAdjunto({
            email: docente.email,
            nombreCompleto: `${docente.nombres} ${docente.apellidos}`,
            pdfBuffer: pdfFile.buffer,
            nombreArchivo: `horario-${docente.nombres.split(' ')[0].toLowerCase()}-${docente.apellidos.split(' ')[0].toLowerCase()}.pdf`
        });

        res.json({
            ok: true,
            mensaje: `Horario enviado exitosamente al correo: ${docente.email}`
        });

    } catch (error) {
        console.error("Error en enviarHorarioController:", error);
        res.status(500).json({ 
            ok: false,
            mensaje: "Error al enviar el horario por correo.",
            error: error.message 
        });
    }
};

export { 
    obtenerDocentesController, 
    obtenerDocentePorIdController, 
    obtenerNombreProfesorController, 
    insertarDocenteController, 
    actualizarDocenteController, 
    eliminarDocenteController, 
    obtenerEstadisticasDocentesController,
    enviarHorarioController
};
