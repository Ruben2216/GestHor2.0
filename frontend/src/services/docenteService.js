import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const obtenerDocentes = async () => {
    const response = await axios.get(`${API_URL}/docentes`);
    return response.data;
};

const obtenerDocentePorId = async (id) => {
    const response = await axios.get(`${API_URL}/docentes/${id}`);
    return response.data;
};

const obtenerNombreProfesor = async (id) => {
    const response = await axios.get(`${API_URL}/profesor/nombre/${id}`);
    return response.data;
};

const crearDocente = async (docente) => {
    const response = await axios.post(`${API_URL}/docentes`, docente);
    return response.data;
};

const actualizarDocente = async (id, docente) => {
    const response = await axios.put(`${API_URL}/docentes/${id}`, docente);
    return response.data;
};

const eliminarDocente = async (id) => {
    const response = await axios.delete(`${API_URL}/docentes/${id}`);
    return response.data;
};

const obtenerEstadisticasDocentes = async () => {
    const response = await axios.get(`${API_URL}/docentes/estadisticas`);
    return response.data;
};

const enviarHorarioPorCorreo = async (profesorId, pdfBlob) => {
    const formData = new FormData();
    formData.append('horarioPdf', pdfBlob, 'horario.pdf');

    const response = await axios.post(`${API_URL}/docentes/${profesorId}/enviar-horario`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const sugerirDocentes = async ({ materiaId, dia, inicio, fin }) => {
    const response = await axios.get(`${API_URL}/sugerencias/docentes`, {
        params: { materiaId, dia, inicio, fin }
    });
    return response.data;
};

export { obtenerDocentes, obtenerDocentePorId, obtenerNombreProfesor, crearDocente, actualizarDocente, eliminarDocente, obtenerEstadisticasDocentes, enviarHorarioPorCorreo, sugerirDocentes };
