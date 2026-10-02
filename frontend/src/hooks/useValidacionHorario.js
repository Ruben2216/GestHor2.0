import { useState } from 'react';
import { useToast } from '../components/ui/NotificacionFlotante';
import { obtenerInfoHorariosProfesor, validarProfesorMateria } from '../services/profesorInfoService';
import showConfirm from '../components/ui/ConfirmModal';

/**
 * Hook personalizado para validar asignación de horarios
 * Principio: Single Responsibility - Manejo de lógica de validación
 * Reutilizable en cualquier componente de asignación de horarios
 */
export const useValidacionHorario = () => {
    const [loading, setLoading] = useState(false);
    const [infoProfesor, setInfoProfesor] = useState(null);
    const { notify } = useToast();

    /**
     * Obtener información completa del profesor
     */
    const cargarInfoProfesor = async (profesorId) => {
        try {
            setLoading(true);
            const response = await obtenerInfoHorariosProfesor(profesorId);
            
            if (response.ok) {
                setInfoProfesor(response.data);
                return response.data;
            }
            
            throw new Error(response.mensaje || 'Error al cargar información del profesor');
        } catch (error) {
            console.error('Error en cargarInfoProfesor:', error);
            notify({ type: 'error', message: 'Error al cargar información del profesor: ' + error.message });
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Validar si el profesor puede impartir la materia
     * Retorna true si puede continuar con la asignación
     * Retorna false si el usuario cancela
     */
    const validarAsignacion = async (profesorId, materiaId, nombreProfesor, nombreMateria) => {
        try {
            setLoading(true);
            const response = await validarProfesorMateria(profesorId, materiaId);
            
            if (!response.ok) {
                throw new Error(response.mensaje || 'Error al validar profesor-materia');
            }

            // Si el profesor puede impartir la materia, continuar sin confirmación
            if (response.puedeImpartir) {
                return true;
            }

            // Si NO puede, mostrar advertencia y pedir confirmación
            const mensaje = `ADVERTENCIA\n\n` +
                `La materia "${nombreMateria}" NO está registrada en el perfil del profesor "${nombreProfesor}".\n\n` +
                `El profesor no ha declarado que puede impartir esta materia.\n\n` +
                `¿Deseas asignarla de todas formas?\n\n` +
                `Sugerencia: Primero puedes agregar la materia al perfil del profesor en la sección "Docentes".`;

            // Mostrar modal visual atractivo en lugar de window.confirm
            try {
                const acepto = await showConfirm(mensaje);
                return Boolean(acepto);
            } catch (e) {
                console.error('Error mostrando modal de confirmación:', e);
                return false;
            }
        } catch (error) {
            console.error('Error en validarAsignacion:', error);
            notify({ type: 'error', message: 'Error al validar: ' + error.message });
            return false;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Verificar si el profesor tiene disponibilidad en un horario específico
     * Retorna true si tiene disponibilidad, false si no
     */
    const verificarDisponibilidad = (diaSemana, horaInicio, horaFin) => {
        if (!infoProfesor?.disponibilidad || infoProfesor.disponibilidad.length === 0) {
            // Si no hay disponibilidad configurada, mostrar advertencia pero permitir
            const mensaje = `⚠️ ADVERTENCIA\n\n` +
                `El profesor no ha configurado su disponibilidad horaria.\n\n` +
                `¿Deseas asignar el horario de todas formas?`;
            
            return window.confirm(mensaje);
        }

        // Buscar si existe un slot que coincida
        const tieneDisponibilidad = infoProfesor.disponibilidad.some(slot => {
            return slot.dia_semana === diaSemana &&
                   slot.hora_inicio <= horaInicio &&
                   slot.hora_fin >= horaFin;
        });

        if (!tieneDisponibilidad) {
            const mensaje = `ADVERTENCIA\n\n` +
                `El profesor no ha marcado disponibilidad para:\n` +
                `${diaSemana} de ${horaInicio} a ${horaFin}\n\n` +
                `¿Deseas asignar el horario de todas formas?`;
            
            return window.confirm(mensaje);
        }

        return true;
    };

    /**
     * Validación completa: materia + disponibilidad
     */
    const validarAsignacionCompleta = async (
        profesorId, 
        materiaId, 
        nombreProfesor, 
        nombreMateria,
        diaSemana,
        horaInicio,
        horaFin
    ) => {
        // 1. Cargar info del profesor si no está cargada
        if (!infoProfesor || infoProfesor.profesorId !== profesorId) {
            await cargarInfoProfesor(profesorId);
        }

        // 2. Validar materia
        const materiaValida = await validarAsignacion(profesorId, materiaId, nombreProfesor, nombreMateria);
        if (!materiaValida) return false;

        // 3. Validar disponibilidad
        const disponibilidadValida = verificarDisponibilidad(diaSemana, horaInicio, horaFin);
        if (!disponibilidadValida) return false;

        return true;
    };

    return {
        loading,
        infoProfesor,
        cargarInfoProfesor,
        validarAsignacion,
        verificarDisponibilidad,
        validarAsignacionCompleta
    };
};
