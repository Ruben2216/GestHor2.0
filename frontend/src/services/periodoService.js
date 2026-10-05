import apiClient from './apiClient';

const obtenerPeriodos = async (opts = {}) => {
    const params = new URLSearchParams();
    if (opts.start) params.append('start', opts.start);
    if (opts.end) params.append('end', opts.end);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get(`/periodos${suffix}`);
    return response.data;
};

const obtenerPeriodoPorId = async (id) => {
    const response = await apiClient.get(`/periodos/${id}`);
    return response.data;
};

const crearPeriodo = async (periodo) => {
    const response = await apiClient.post('/periodos', periodo);
    return response.data;
};

const actualizarPeriodo = async (id, periodo) => {
    const response = await apiClient.put(`/periodos/${id}`, periodo);
    return response.data;
};

const eliminarPeriodo = async (id) => {
    const response = await apiClient.delete(`/periodos/${id}`);
    return response.data;
};

export { obtenerPeriodos, obtenerPeriodoPorId, crearPeriodo, actualizarPeriodo, eliminarPeriodo };
