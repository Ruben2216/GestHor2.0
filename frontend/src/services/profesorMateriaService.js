import apiClient from './apiClient';

const obtenerMateriasProfesor = async (profesorId) => {
    const response = await apiClient.get(`/profesor-materias/${profesorId}`);
    return response.data;
};

const asignarMateriaProfesor = async (profesorId, materiaId) => {
    const response = await apiClient.post(`/profesor-materias/${profesorId}`, {
        materia_id: materiaId
    });
    return response.data;
};

const eliminarMateriaProfesor = async (profesorId, materiaId) => {
    const response = await apiClient.delete(`/profesor-materias/${profesorId}/${materiaId}`);
    return response.data;
};

const guardarMateriasProfesor = async (profesorId, materias) => {
    const response = await apiClient.post(`/profesor-materias/${profesorId}`, {
        materias
    });
    return response.data;
};

export {
    obtenerMateriasProfesor,
    asignarMateriaProfesor,
    eliminarMateriaProfesor,
    guardarMateriasProfesor
};

