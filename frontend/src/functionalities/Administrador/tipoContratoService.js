import apiClient from '../../services/apiClient';

export async function obtenerTiposContrato() {
    const res = await apiClient.get('/tipos-contrato');
    return res.data;
}

export async function crearTipoContrato(data) {
    const res = await apiClient.post('/tipos-contrato', data);
    return res.data;
}

export async function actualizarTipoContrato(id, data) {
    const res = await apiClient.put(`/tipos-contrato/${id}`, data);
    return res.data;
}

export async function eliminarTipoContrato(id) {
    const res = await apiClient.delete(`/tipos-contrato/${id}`);
    return res.data;
}
