import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

/**
 * Obtener todas las materias del catálogo global
 */
const obtenerMaterias = async () => {
    const response = await axios.get(`${API_URL}/materias`);
    return response.data;
};

/**
 * Buscar materias por nombre (autocompletado)
 */
const buscarMaterias = async (termino) => {
    const response = await axios.get(`${API_URL}/materias/buscar?q=${encodeURIComponent(termino)}`);
    return response.data;
};

/**
 * Obtener materias asignadas a una carrera específica
 */
const obtenerMateriasPorCarrera = async (carreraId) => {
    const response = await axios.get(`${API_URL}/materias/carrera/${carreraId}`);
    return response.data;
};

/**
 * Obtener materias asignadas a una carrera y semestre específico
 */
const obtenerMateriasPorCarreraYSemestre = async (carreraId, semestre) => {
    const response = await axios.get(`${API_URL}/materias/carrera/${carreraId}/semestre/${semestre}`);
    return response.data;
};

/**
 * Obtener una materia por ID
 */
const obtenerMateriaPorId = async (id) => {
    const response = await axios.get(`${API_URL}/materias/${id}`);
    return response.data;
};

/**
 * Crear una materia en el catálogo global
 */
const crearMateria = async (materia) => {
    const response = await axios.post(`${API_URL}/materias`, materia);
    return response.data;
};

/**
 * Actualizar una materia del catálogo
 */
const actualizarMateria = async (id, materia) => {
    const response = await axios.put(`${API_URL}/materias/${id}`, materia);
    return response.data;
};

/**
 * Eliminar una materia del catálogo (solo si no está asignada)
 */
const eliminarMateria = async (id) => {
    const response = await axios.delete(`${API_URL}/materias/${id}`);
    return response.data;
};

/**
 * Asignar una materia del catálogo a una carrera
 */
const asignarMateriaACarrera = async (carreraId, materiaId, numeroSemestre) => {
    const response = await axios.post(`${API_URL}/materias/asignar`, {
        carrera_id: carreraId,
        materia_id: materiaId,
        numero_semestre: numeroSemestre
    });
    return response.data;
};

/**
 * Desasignar una materia de una carrera
 */
const desasignarMateriaDeCarrera = async (carreraId, materiaId, semestre) => {
    const response = await axios.delete(
        `${API_URL}/materias/desasignar/${carreraId}/${materiaId}/${semestre}`
    );
    return response.data;
};

export {
    obtenerMaterias,
    buscarMaterias,
    obtenerMateriasPorCarrera,
    obtenerMateriasPorCarreraYSemestre,
    obtenerMateriaPorId,
    crearMateria,
    actualizarMateria,
    eliminarMateria,
    asignarMateriaACarrera,
    desasignarMateriaDeCarrera
};
