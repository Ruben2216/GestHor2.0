import apiClient from './apiClient';

const obtenerDisponibilidad = async (profesorId) => {
    const response = await apiClient.get(`/disponibilidad/${profesorId}`);
    return response.data;
};

const guardarDisponibilidad = async (profesorId, turno, availability) => {
    const response = await apiClient.post(`/disponibilidad/${profesorId}`, {
        turno,
        availability
    });
    return response.data;
};

const obtenerPreferencias = async (profesorId) => {
    const response = await apiClient.get(`/preferencias/${profesorId}`);
    return response.data;
};

const guardarPreferencias = async (profesorId, maxHorasDia, preferencia, comentarios) => {
    const response = await apiClient.post(`/preferencias/${profesorId}`, {
        maxHorasDia,
        preferencia,
        comentarios
    });
    return response.data;
};

export { obtenerDisponibilidad, guardarDisponibilidad, obtenerPreferencias, guardarPreferencias };
