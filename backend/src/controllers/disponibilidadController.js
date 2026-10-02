import {
    obtenerDisponibilidadProfesor,
    guardarDisponibilidadSlot,
    eliminarDisponibilidadProfesor,
    obtenerPreferenciasProfesor,
    guardarPreferenciasProfesor
} from "../models/disponibilidadModel.js";

const obtenerDisponibilidadController = async (req, res) => {
    try {
        const { profesorId } = req.params;
        const disponibilidad = await obtenerDisponibilidadProfesor(profesorId);
        
        res.json({
            ok: true,
            disponibilidad
        });
    } catch (error) {
        console.error("Error en obtenerDisponibilidadController:", error);
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener disponibilidad",
            error: error.message
        });
    }
};

const guardarDisponibilidadController = async (req, res) => {
    try {
        const { profesorId } = req.params;
        const { turno, availability } = req.body;

        if (!turno || !availability) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan datos: turno y availability son requeridos"
            });
        }

        await eliminarDisponibilidadProfesor(profesorId, turno);

        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        const registrosGuardados = [];

        for (const [slot, diasArray] of Object.entries(availability)) {
            const [horaInicio, horaFin] = slot.split(' - ');
            
            for (let i = 0; i < diasArray.length; i++) {
                if (diasArray[i] === true) {
                    const resultado = await guardarDisponibilidadSlot(
                        profesorId,
                        diasSemana[i],
                        horaInicio,
                        horaFin,
                        turno
                    );
                    registrosGuardados.push(resultado);
                }
            }
        }

        res.json({
            ok: true,
            mensaje: `Disponibilidad ${turno} guardada exitosamente`,
            registros: registrosGuardados.length
        });
    } catch (error) {
        console.error("Error en guardarDisponibilidadController:", error);
        res.status(500).json({
            ok: false,
            mensaje: "Error al guardar disponibilidad",
            error: error.message
        });
    }
};

const obtenerPreferenciasController = async (req, res) => {
    try {
        const { profesorId } = req.params;
        const preferencias = await obtenerPreferenciasProfesor(profesorId);
        
        res.json({
            ok: true,
            preferencias: preferencias || {
                max_horas_dia: 8,
                preferencia_horario: 'Mixto',
                comentarios_adicionales: ''
            }
        });
    } catch (error) {
        console.error("Error en obtenerPreferenciasController:", error);
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener preferencias",
            error: error.message
        });
    }
};

const guardarPreferenciasController = async (req, res) => {
    try {
        const { profesorId } = req.params;
        const { maxHorasDia, preferencia, comentarios } = req.body;

        if (!maxHorasDia || !preferencia) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan datos: maxHorasDia y preferencia son requeridos"
            });
        }

        const resultado = await guardarPreferenciasProfesor(
            profesorId,
            maxHorasDia,
            preferencia,
            comentarios || ''
        );

        res.json({
            ok: true,
            mensaje: "Preferencias guardadas exitosamente",
            preferencias: resultado
        });
    } catch (error) {
        console.error("Error en guardarPreferenciasController:", error);
        res.status(500).json({
            ok: false,
            mensaje: "Error al guardar preferencias",
            error: error.message
        });
    }
};

export {
    obtenerDisponibilidadController,
    guardarDisponibilidadController,
    obtenerPreferenciasController,
    guardarPreferenciasController
};
