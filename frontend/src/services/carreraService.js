import apiClient from './apiClient';

/**
 * Obtener todas las carreras
 */
const obtenerCarreras = async () => {
    const response = await apiClient.get('/carreras');
    return response.data;
};

/**
 * Obtener una carrera por ID (incluye materias por semestre)
 */
const obtenerCarreraPorId = async (id) => {
    const response = await apiClient.get(`/carreras/${id}`);
    return response.data;
};

const crearCarrera = async (carrera) => {
    const response = await apiClient.post('/carreras', carrera);
    return response.data;
};

/**
 * Actualizar una carrera (solo datos básicos)
 */
const actualizarCarrera = async (id, carrera) => {
    const response = await apiClient.put(`/carreras/${id}`, carrera);
    return response.data;
};

/**
 * Eliminar una carrera
 */
const eliminarCarrera = async (id) => {
    const response = await apiClient.delete(`/carreras/${id}`);
    return response.data;
};

const obtenerEstadisticasCarreras = async () => {
    const response = await apiClient.get('/carreras/estadisticas');
    return response.data;
};

export { obtenerCarreras, obtenerCarreraPorId, crearCarrera, actualizarCarrera, eliminarCarrera, obtenerEstadisticasCarreras };
