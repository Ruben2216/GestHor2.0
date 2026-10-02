import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Obtener materias de un profesor
const obtenerMateriasProfesor = async (profesorId) => {
    const response = await axios.get(`${API_URL}/profesor-materias/${profesorId}`);
    return response.data;
};

// Asignar materia a profesor
const asignarMateriaProfesor = async (profesorId, materiaId) => {
    const response = await axios.post(`${API_URL}/profesor-materias/${profesorId}`, {
        materia_id: materiaId
    });
    return response.data;
};

// Eliminar materia de profesor
const eliminarMateriaProfesor = async (profesorId, materiaId) => {
    const response = await axios.delete(`${API_URL}/profesor-materias/${profesorId}/${materiaId}`);
    return response.data;
};

export { obtenerMateriasProfesor, asignarMateriaProfesor, eliminarMateriaProfesor };
