import apiClient from './apiClient';

const obtenerProfesorInfo = async (profesorId) => {
    const response = await apiClient.get(`/profesor/${profesorId}/info`);
    return response.data;
};

const actualizarProfesorInfo = async (profesorId, datos) => {
    const response = await apiClient.put(`/profesor/${profesorId}/info`, datos);
    return response.data;
};

const obtenerInfoHorariosProfesor = async (profesorId) => {
    const response = await apiClient.get(`/profesores/${profesorId}/info-horarios`);
    return response.data;
};

const validarProfesorMateria = async (profesorId, materiaId) => {
    const response = await apiClient.post('/horarios/validar-profesor-materia', {
        profesorId,
        materiaId
    });
    return response.data;
};

export {
    obtenerProfesorInfo,
    actualizarProfesorInfo,
    obtenerInfoHorariosProfesor,
    validarProfesorMateria
};

