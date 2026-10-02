import * as lugaresModel from '../models/lugaresModel.js';

const obtenerEstructura = async (req, res) => {
    try {
        const estructura = await lugaresModel.obtenerEstructuraLugares();
        res.json({ ok: true, lugares: estructura });
    } catch (error) {
        console.error('Error al obtener estructura de lugares:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener lugares', error: error.message });
    }
};

// LUGARES
const crearLugar = async (req, res) => {
    try {
        const { nombre_lugar, tipo_lugar } = req.body;
        if (!nombre_lugar) return res.status(400).json({ ok: false, mensaje: 'nombre_lugar es requerido' });
        const nuevo = await lugaresModel.crearLugar(nombre_lugar, tipo_lugar || null);
        res.status(201).json({ ok: true, lugar: nuevo });
    } catch (error) {
        console.error('Error al crear lugar:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al crear lugar', error: error.message });
    }
};

const actualizarLugar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_lugar, tipo_lugar } = req.body;
        const actualizado = await lugaresModel.actualizarLugar(id, nombre_lugar, tipo_lugar);
        res.json({ ok: true, lugar: actualizado });
    } catch (error) {
        console.error('Error al actualizar lugar:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar lugar', error: error.message });
    }
};

const eliminarLugarController = async (req, res) => {
    try {
        const { id } = req.params;
        await lugaresModel.eliminarLugar(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar lugar:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar lugar', error: error.message });
    }
};

// EDIFICIOS
const crearEdificioController = async (req, res) => {
    try {
        const { lugar_id, nombre_edificio, tipo_edificio } = req.body;
        if (!lugar_id || !nombre_edificio) return res.status(400).json({ ok: false, mensaje: 'lugar_id y nombre_edificio son requeridos' });
        const nuevo = await lugaresModel.crearEdificio(lugar_id, nombre_edificio, tipo_edificio || null);
        res.status(201).json({ ok: true, edificio: nuevo });
    } catch (error) {
        console.error('Error al crear edificio:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al crear edificio', error: error.message });
    }
};

const actualizarEdificioController = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_edificio, tipo_edificio } = req.body;
        const actualizado = await lugaresModel.actualizarEdificio(id, nombre_edificio, tipo_edificio);
        res.json({ ok: true, edificio: actualizado });
    } catch (error) {
        console.error('Error al actualizar edificio:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar edificio', error: error.message });
    }
};

const eliminarEdificioController = async (req, res) => {
    try {
        const { id } = req.params;
        await lugaresModel.eliminarEdificio(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar edificio:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar edificio', error: error.message });
    }
};

// SALONES
const crearSalonController = async (req, res) => {
    try {
        const { edificio_id, nombre_salon, tipo_salon } = req.body;
        if (!edificio_id || !nombre_salon) return res.status(400).json({ ok: false, mensaje: 'edificio_id y nombre_salon son requeridos' });
        const nuevo = await lugaresModel.crearSalon(edificio_id, nombre_salon, tipo_salon || null);
        res.status(201).json({ ok: true, salon: nuevo });
    } catch (error) {
        console.error('Error al crear salon:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al crear salon', error: error.message });
    }
};

const actualizarSalonController = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_salon, tipo_salon } = req.body;
        const actualizado = await lugaresModel.actualizarSalon(id, nombre_salon, tipo_salon);
        res.json({ ok: true, salon: actualizado });
    } catch (error) {
        console.error('Error al actualizar salon:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar salon', error: error.message });
    }
};

const eliminarSalonController = async (req, res) => {
    try {
        const { id } = req.params;
        await lugaresModel.eliminarSalon(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar salon:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar salon', error: error.message });
    }
};

export {
    obtenerEstructura,
    crearLugar,
    actualizarLugar,
    eliminarLugarController,
    crearEdificioController,
    actualizarEdificioController,
    eliminarEdificioController,
    crearSalonController,
    actualizarSalonController,
    eliminarSalonController
};
