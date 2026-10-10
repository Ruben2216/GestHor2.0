import apiClient from './apiClient';

const obtenerMaterias = async () => {
    const response = await apiClient.get('/materias');
    return response.data;
};

const obtenerMateriaPorId = async (id) => {
    const response = await apiClient.get(`/materias/${id}`);
    return response.data;
};

const crearMateria = async (materia) => {
    const response = await apiClient.post('/materias', materia);
    return response.data;
};

const actualizarMateria = async (id, materia) => {
    const response = await apiClient.put(`/materias/${id}`, materia);
    return response.data;
};

const eliminarMateria = async (id) => {
    const response = await apiClient.delete(`/materias/${id}`);
    return response.data;
};

const obtenerMateriasPorCarrera = async (carreraId) => {
    const response = await apiClient.get(`/carreras/${carreraId}/materias`);
    return response.data;
};

const asignarMateriaACarrera = async (carreraId, materiaId, semestre) => {
    const payload = (typeof materiaId === 'object' && materiaId !== null)
        ? {
            carrera_id: Number(carreraId),
            materia_id: Number(materiaId.materia_id || materiaId.id),
            numero_semestre: Number(materiaId.numero_semestre || materiaId.semestre || semestre)
        }
        : {
            carrera_id: Number(carreraId),
            materia_id: Number(materiaId),
            numero_semestre: Number(semestre)
        };
    const response = await apiClient.post(`/carreras/${carreraId}/materias`, payload);
    return response.data;
};

const desasignarMateriaDeCarrera = async (carreraId, materiaId, semestre) => {
    const response = await apiClient.delete(`/carreras/${carreraId}/materias/${materiaId}/${semestre}`);
    return response.data;
};

const buscarMaterias = async (termino) => {
    const response = await apiClient.get('/materias/buscar', { params: { q: termino } });
    return response.data;
};

const obtenerMateriasPorCarreraYSemestre = async (carreraId, semestre) => {
    const response = await apiClient.get(`/materias/carrera/${carreraId}/semestre/${semestre}`);
    return response.data;
};

export {
    obtenerMaterias,
    obtenerMateriaPorId,
    crearMateria,
    actualizarMateria,
    eliminarMateria,
    obtenerMateriasPorCarrera,
    asignarMateriaACarrera,
    desasignarMateriaDeCarrera,
    buscarMaterias,
    obtenerMateriasPorCarreraYSemestre
};


