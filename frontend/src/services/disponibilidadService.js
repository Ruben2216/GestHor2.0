import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const obtenerDisponibilidad = async (profesorId) => {
    const response = await axios.get(`${API_URL}/disponibilidad/${profesorId}`);
    return response.data;
};

const guardarDisponibilidad = async (profesorId, turno, availability) => {
    const response = await axios.post(`${API_URL}/disponibilidad/${profesorId}`, {
        turno,
        availability
    });
    return response.data;
};

const obtenerPreferencias = async (profesorId) => {
    const response = await axios.get(`${API_URL}/preferencias/${profesorId}`);
    return response.data;
};

const guardarPreferencias = async (profesorId, maxHorasDia, preferencia, comentarios) => {
    const response = await axios.post(`${API_URL}/preferencias/${profesorId}`, {
        maxHorasDia,
        preferencia,
        comentarios
    });
    return response.data;
};

export { obtenerDisponibilidad, guardarDisponibilidad, obtenerPreferencias, guardarPreferencias };
