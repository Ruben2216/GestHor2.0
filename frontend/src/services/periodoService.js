import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const obtenerPeriodos = async (opts = {}) => {
    const params = new URLSearchParams();
    if (opts.start) params.append('start', opts.start);
    if (opts.end) params.append('end', opts.end);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await axios.get(`${API_URL}/periodos${suffix}`);
    return response.data;
};

const obtenerPeriodoPorId = async (id) => {
    const response = await axios.get(`${API_URL}/periodos/${id}`);
    return response.data;
};

const crearPeriodo = async (periodo) => {
    const response = await axios.post(`${API_URL}/periodos`, periodo);
    return response.data;
};

const actualizarPeriodo = async (id, periodo) => {
    const response = await axios.put(`${API_URL}/periodos/${id}`, periodo);
    return response.data;
};

const eliminarPeriodo = async (id) => {
    const response = await axios.delete(`${API_URL}/periodos/${id}`);
    return response.data;
};

export { obtenerPeriodos, obtenerPeriodoPorId, crearPeriodo, actualizarPeriodo, eliminarPeriodo };
