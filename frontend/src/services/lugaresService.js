import apiClient from './apiClient';

const obtenerEstructura = async () => {
    const res = await apiClient.get('/lugares/estructura');
    return res.data;
};

const obtenerLugares = async () => {
    const res = await apiClient.get('/lugares');
    return res.data;
};

const crearLugar = async (lugar) => {
    const res = await apiClient.post('/lugares', lugar);
    return res.data;
};

const actualizarLugar = async (id, lugar) => {
    const res = await apiClient.put(`/lugares/${id}`, lugar);
    return res.data;
};

const eliminarLugar = async (id) => {
    const res = await apiClient.delete(`/lugares/${id}`);
    return res.data;
};

// Edificios
const crearEdificio = async (edificio) => {
    const res = await apiClient.post('/edificios', edificio);
    return res.data;
};

const actualizarEdificio = async (id, edificio) => {
    const res = await apiClient.put(`/edificios/${id}`, edificio);
    return res.data;
};

const eliminarEdificio = async (id) => {
    const res = await apiClient.delete(`/edificios/${id}`);
    return res.data;
};

// Salones
const crearSalon = async (salon) => {
    const res = await apiClient.post('/salones', salon);
    return res.data;
};

const actualizarSalon = async (id, salon) => {
    const res = await apiClient.put(`/salones/${id}`, salon);
    return res.data;
};

const eliminarSalon = async (id) => {
    const res = await apiClient.delete(`/salones/${id}`);
    return res.data;
};

export {
  obtenerEstructura,
  obtenerLugares,
  crearLugar,
  actualizarLugar,
  eliminarLugar,
  crearEdificio,
  actualizarEdificio,
  eliminarEdificio,
  crearSalon,
  actualizarSalon,
  eliminarSalon,
};