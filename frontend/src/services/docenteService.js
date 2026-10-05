import apiClient from './apiClient';

const obtenerDocentes = async () => {
    const response = await apiClient.get('/docentes');
    return response.data;
};

const obtenerDocentePorId = async (id) => {
    const response = await apiClient.get(`/docentes/${id}`);
    return response.data;
};

const obtenerNombreProfesor = async (id) => {
    const response = await apiClient.get(`/profesor/nombre/${id}`);
    return response.data;
};

const crearDocente = async (docente) => {
    const response = await apiClient.post('/docentes', docente);
    return response.data;
};

const actualizarDocente = async (id, docente) => {
    const response = await apiClient.put(`/docentes/${id}`, docente);
    return response.data;
};

const eliminarDocente = async (id) => {
    const response = await apiClient.delete(`/docentes/${id}`);
    return response.data;
};

const obtenerEstadisticasDocentes = async () => {
    const response = await apiClient.get('/docentes/estadisticas');
    return response.data;
};

const enviarHorarioPorCorreo = async (profesorId, pdfBlob) => {
    const formData = new FormData();
    formData.append('horarioPdf', pdfBlob, 'horario.pdf');

    const response = await apiClient.post(`/docentes/${profesorId}/enviar-horario`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const sugerirDocentes = async ({ materiaId, dia, inicio, fin }) => {
    const response = await apiClient.get('/sugerencias/docentes', {
        params: { materiaId, dia, inicio, fin }
    });
    return response.data;
};

export { 
    obtenerDocentes, 
    obtenerDocentePorId, 
    obtenerNombreProfesor, 
    crearDocente, 
    actualizarDocente, 
    eliminarDocente, 
    obtenerEstadisticasDocentes, 
    enviarHorarioPorCorreo, 
    sugerirDocentes 
};
