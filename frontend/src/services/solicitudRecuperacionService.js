import apiClient from './apiClient';

const crearSolicitudRecuperacion = async (email, motivo) => {
    const response = await apiClient.post('/solicitudes-recuperacion', {
        email,
        motivo
    });
    return response.data;
};

const obtenerSolicitudesPendientes = async () => {
    const response = await apiClient.get('/solicitudes-recuperacion/pendientes');
    return response.data;
};

const obtenerTodasSolicitudes = async () => {
    const response = await apiClient.get('/solicitudes-recuperacion');
    return response.data;
};

const obtenerEstadisticasSolicitudes = async () => {
    const response = await apiClient.get('/solicitudes-recuperacion/estadisticas');
    return response.data;
};

const resolverSolicitud = async (solicitudId) => {
    const response = await apiClient.put(`/solicitudes-recuperacion/${solicitudId}/resolver`);
    return response.data;
};

const regenerarPassword = async (solicitudId) => {
    const response = await apiClient.post(`/solicitudes-recuperacion/${solicitudId}/regenerar-password`);
    return response.data;
};

const obtenerActividadesRecientes = async (limite = 10) => {
    const response = await apiClient.get('/solicitudes-recuperacion/actividades', {
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
