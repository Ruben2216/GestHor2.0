import { 
    obtenerHorarios, 
    obtenerHorariosPorProfesor,
    obtenerHorariosPorSalon,
    crearHorario, 
    actualizarHorario, 
    eliminarHorario,
    verificarChoqueProfesor,
    verificarChoqueSalon
} from '../models/horarioModel.js';
import { obtenerPorId as obtenerProfesorPorId } from '../models/docenteModel.js';

const listarHorarios = async (req, res) => {
    try {
        const horarios = await obtenerHorarios();
        res.json({ 
            ok: true, 
            horarios 
        });
    } catch (error) {
        console.error('Error en listarHorarios:', error);
        res.status(500).json({ 
            ok: false, 
            mensaje: 'Error al obtener horarios',
            error: error.message 
        });
    }
};

const listarHorariosProfesor = async (req, res) => {
    try {
        const { profesorId } = req.params;
        const horarios = await obtenerHorariosPorProfesor(profesorId);
        res.json({ 
            ok: true, 
            horarios 
        });
    } catch (error) {
        console.error('Error en listarHorariosProfesor:', error);
        res.status(500).json({ 
            ok: false, 
            mensaje: 'Error al obtener horarios del profesor',
            error: error.message 
        });
    }
};

const listarHorariosSalon = async (req, res) => {
    try {
        const { salonId } = req.params;
        const horarios = await obtenerHorariosPorSalon(salonId);
        res.json({ ok: true, horarios });
    } catch (error) {
        console.error('Error en listarHorariosSalon:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener horarios del salón', error: error.message });
    }
};

const registrarHorario = async (req, res) => {
    try {
        const { profesorId, materiaId, salonId, diaSemana, horaInicio, horaFin } = req.body;

        // Validar campos requeridos
        if (!profesorId || !materiaId || !salonId || !diaSemana || !horaInicio || !horaFin) {
            return res.status(400).json({ 
                ok: false, 
                mensaje: 'Todos los campos son requeridos' 
            });
        }

        // Opcional: Lógica de negocio basada en prioridad.
        // Aquí podrías consultar la prioridad del docente y aplicar reglas.
        // Por ejemplo, si un docente de baja prioridad intenta tomar un horario "prime time".
        // const profesor = await obtenerProfesorPorId(profesorId);
        // if (profesor.nivel_prioridad > 2) {
        //     console.log("Advertencia: Asignando horario a docente con baja prioridad.");
        // }

        // Verificar choques de horario para el profesor
        const choqueProfesor = await verificarChoqueProfesor(profesorId, diaSemana, horaInicio, horaFin);
        if (choqueProfesor.length > 0) {
            return res.status(400).json({ 
                ok: false, 
                mensaje: 'Choque de horario: El profesor ya tiene asignada una clase en ese horario' 
            });
        }

        // Verificar choques de horario para el salón
        const choqueSalon = await verificarChoqueSalon(salonId, diaSemana, horaInicio, horaFin);
        if (choqueSalon.length > 0) {
            return res.status(400).json({ 
                ok: false, 
                mensaje: 'Choque de horario: El salón ya está ocupado en ese horario' 
            });
        }

        // Crear el horario
        const nuevoHorario = await crearHorario(profesorId, materiaId, salonId, diaSemana, horaInicio, horaFin);

        res.status(201).json({ 
            ok: true, 
            mensaje: 'Horario creado exitosamente',
            horario: nuevoHorario 
        });
    } catch (error) {
        console.error('Error en registrarHorario:', error);
        res.status(500).json({ 
            ok: false, 
            mensaje: 'Error al crear horario',
            error: error.message 
        });
    }
};

const modificarHorario = async (req, res) => {
    try {
        const { horarioId } = req.params;
        const { profesorId, materiaId, salonId, diaSemana, horaInicio, horaFin } = req.body;

        // Validar campos requeridos
        if (!profesorId || !materiaId || !salonId || !diaSemana || !horaInicio || !horaFin) {
            return res.status(400).json({ 
                ok: false, 
                mensaje: 'Todos los campos son requeridos' 
            });
        }

        // Verificar choques de horario para el profesor (excluyendo el horario actual)
        const choqueProfesor = await verificarChoqueProfesor(profesorId, diaSemana, horaInicio, horaFin, horarioId);
        if (choqueProfesor.length > 0) {
            return res.status(400).json({ 
                ok: false, 
                mensaje: 'Choque de horario: El profesor ya tiene asignada una clase en ese horario' 
            });
        }

        // Verificar choques de horario para el salón (excluyendo el horario actual)
        const choqueSalon = await verificarChoqueSalon(salonId, diaSemana, horaInicio, horaFin, horarioId);
        if (choqueSalon.length > 0) {
            return res.status(400).json({ 
                ok: false, 
                mensaje: 'Choque de horario: El salón ya está ocupado en ese horario' 
            });
        }

        // Actualizar el horario
        const horarioActualizado = await actualizarHorario(horarioId, profesorId, materiaId, salonId, diaSemana, horaInicio, horaFin);

        res.json({ 
            ok: true, 
            mensaje: 'Horario actualizado exitosamente',
            horario: horarioActualizado 
        });
    } catch (error) {
        console.error('Error en modificarHorario:', error);
        res.status(500).json({ 
            ok: false, 
            mensaje: 'Error al actualizar horario',
            error: error.message 
        });
    }
};

const borrarHorario = async (req, res) => {
    try {
        const { horarioId } = req.params;
        
        const resultado = await eliminarHorario(horarioId);
        
        if (resultado.rowCount === 0) {
            return res.status(404).json({ 
                ok: false, 
                mensaje: 'Horario no encontrado' 
            });
        }

        res.json({ 
            ok: true, 
            mensaje: 'Horario eliminado exitosamente' 
        });
    } catch (error) {
        console.error('Error en borrarHorario:', error);
        res.status(500).json({ 
            ok: false, 
            mensaje: 'Error al eliminar horario',
            error: error.message 
        });
    }
};

export {
    listarHorarios,
    listarHorariosProfesor,
    listarHorariosSalon,
    registrarHorario,
    modificarHorario,
    borrarHorario
};
