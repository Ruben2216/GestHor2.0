import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

/**
 * Obtener todas las carreras
 */
const obtenerCarreras = async () => {
    const response = await axios.get(`${API_URL}/carreras`);
    return response.data;
};

/**
 * Obtener una carrera por ID (incluye materias por semestre)
 */
const obtenerCarreraPorId = async (id) => {
    const response = await axios.get(`${API_URL}/carreras/${id}`);
    return response.data;
};

const crearCarrera = async (carrera) => {
    const response = await axios.post(`${API_URL}/carreras`, carrera);
    return response.data;
};

/**
 * Actualizar una carrera (solo datos básicos)
 */
const actualizarCarrera = async (id, carrera) => {
    const response = await axios.put(`${API_URL}/carreras/${id}`, carrera);
    return response.data;
};

/**
 * Eliminar una carrera
 */
const eliminarCarrera = async (id) => {
    const response = await axios.delete(`${API_URL}/carreras/${id}`);
    return response.data;
};

const obtenerEstadisticasCarreras = async () => {
    const response = await axios.get(`${API_URL}/carreras/estadisticas`);
    return response.data;
};

export { obtenerCarreras, obtenerCarreraPorId, crearCarrera, actualizarCarrera, eliminarCarrera, obtenerEstadisticasCarreras };
