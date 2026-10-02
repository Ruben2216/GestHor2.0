import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const crearSolicitudRecuperacion = async (email, motivo) => {
    const response = await axios.post(`${API_URL}/solicitudes-recuperacion`, {
        email,
        motivo
    });
    return response.data;
};

const obtenerSolicitudesPendientes = async () => {
    const response = await axios.get(`${API_URL}/solicitudes-recuperacion/pendientes`);
    return response.data;
};

const obtenerTodasSolicitudes = async () => {
    const response = await axios.get(`${API_URL}/solicitudes-recuperacion`);
    return response.data;
};

const obtenerEstadisticasSolicitudes = async () => {
    const response = await axios.get(`${API_URL}/solicitudes-recuperacion/estadisticas`);
    return response.data;
};

const resolverSolicitud = async (solicitudId) => {
    const response = await axios.put(`${API_URL}/solicitudes-recuperacion/${solicitudId}/resolver`);
    return response.data;
};

const regenerarPassword = async (solicitudId) => {
    const response = await axios.post(`${API_URL}/solicitudes-recuperacion/${solicitudId}/regenerar-password`);
    return response.data;
};

const obtenerActividadesRecientes = async (limite = 10) => {
    const response = await axios.get(`${API_URL}/solicitudes-recuperacion/actividades`, {
        params: { limite }
    });
    return response.data;
};

export {
    crearSolicitudRecuperacion,
    obtenerSolicitudesPendientes,
    obtenerTodasSolicitudes,
    obtenerEstadisticasSolicitudes,
    resolverSolicitud,
    regenerarPassword,
    obtenerActividadesRecientes
};
