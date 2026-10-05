import apiClient from './apiClient';

/**
 * Obtener todos los horarios
 */
const obtenerHorarios = async () => {
    const response = await apiClient.get('/horarios');
    return response.data;
};

/**
 * Obtener horarios de un profesor específico
 */
const obtenerHorariosProfesor = async (profesorId) => {
    const response = await apiClient.get(`/horarios/profesor/${profesorId}`);
    return response.data;
};

/**
 * Crear un nuevo horario
 */
const crearHorario = async (horarioData) => {
    const response = await apiClient.post('/horarios', horarioData);
    return response.data;
};

/**
 * Actualizar un horario existente
 */
const actualizarHorario = async (horarioId, horarioData) => {
    const response = await apiClient.put(`/horarios/${horarioId}`, horarioData);
    return response.data;
};

/**
 * Eliminar un horario
 */
const eliminarHorario = async (horarioId) => {
    const response = await apiClient.delete(`/horarios/${horarioId}`);
    return response.data;
};

export { obtenerHorarios, obtenerHorariosProfesor, crearHorario, actualizarHorario, eliminarHorario };
