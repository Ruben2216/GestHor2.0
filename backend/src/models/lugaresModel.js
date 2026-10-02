import { dbConnection } from '../config/database.js';

// LUGARES
export const obtenerLugares = async () => {
    const query = `SELECT lugar_id, nombre_lugar, tipo_lugar FROM lugares ORDER BY nombre_lugar`;
    return await dbConnection.any(query);
};

export const crearLugar = async (nombreLugar, tipoLugar) => {
    const query = `
        INSERT INTO lugares (nombre_lugar, tipo_lugar)
        VALUES ($1, $2)
        RETURNING *
    `;
    return await dbConnection.one(query, [nombreLugar, tipoLugar]);
};

export const actualizarLugar = async (lugarId, nombreLugar, tipoLugar) => {
    const query = `
        UPDATE lugares SET nombre_lugar = $2, tipo_lugar = $3
        WHERE lugar_id = $1
        RETURNING *
    `;
    return await dbConnection.one(query, [lugarId, nombreLugar, tipoLugar]);
};

export const eliminarLugar = async (lugarId) => {
    const query = `DELETE FROM lugares WHERE lugar_id = $1`;
    return await dbConnection.result(query, [lugarId]);
};

// EDIFICIOS
export const obtenerEdificiosPorLugar = async (lugarId) => {
    const query = `
        SELECT edificio_id, lugar_id, nombre_edificio, tipo_edificio
        FROM edificios
        WHERE lugar_id = $1
        ORDER BY nombre_edificio
    `;
    return await dbConnection.any(query, [lugarId]);
};

export const crearEdificio = async (lugarId, nombreEdificio, tipoEdificio) => {
    const query = `
        INSERT INTO edificios (lugar_id, nombre_edificio, tipo_edificio)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    return await dbConnection.one(query, [lugarId, nombreEdificio, tipoEdificio]);
};

export const actualizarEdificio = async (edificioId, nombreEdificio, tipoEdificio) => {
    const query = `
        UPDATE edificios SET nombre_edificio = $2, tipo_edificio = $3
        WHERE edificio_id = $1
        RETURNING *
    `;
    return await dbConnection.one(query, [edificioId, nombreEdificio, tipoEdificio]);
};

export const eliminarEdificio = async (edificioId) => {
    const query = `DELETE FROM edificios WHERE edificio_id = $1`;
    return await dbConnection.result(query, [edificioId]);
};

// SALONES
export const obtenerSalonesPorEdificio = async (edificioId) => {
    const query = `
        SELECT salon_id, edificio_id, nombre_salon, tipo_salon
        FROM salones
        WHERE edificio_id = $1
        ORDER BY nombre_salon
    `;
    return await dbConnection.any(query, [edificioId]);
};

export const crearSalon = async (edificioId, nombreSalon, tipoSalon) => {
    const query = `
        INSERT INTO salones (edificio_id, nombre_salon, tipo_salon)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    return await dbConnection.one(query, [edificioId, nombreSalon, tipoSalon]);
};

export const actualizarSalon = async (salonId, nombreSalon, tipoSalon) => {
    const query = `
        UPDATE salones SET nombre_salon = $2, tipo_salon = $3
        WHERE salon_id = $1
        RETURNING *
    `;
    return await dbConnection.one(query, [salonId, nombreSalon, tipoSalon]);
};

export const eliminarSalon = async (salonId) => {
    const query = `DELETE FROM salones WHERE salon_id = $1`;
    return await dbConnection.result(query, [salonId]);
};

// Obtener estructura completa: lugares -> edificios -> salones
export const obtenerEstructuraLugares = async () => {
    const lugares = await obtenerLugares();
    for (let lugar of lugares) {
        const edificios = await obtenerEdificiosPorLugar(lugar.lugar_id);
        for (let edificio of edificios) {
            const salones = await obtenerSalonesPorEdificio(edificio.edificio_id);
            edificio.salones = salones;
        }
        lugar.edificios = edificios;
    }
    return lugares;
};
