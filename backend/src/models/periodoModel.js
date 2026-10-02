import { dbConnection } from "../config/database.js";

/**
 * Modelo para periodos_academicos
 */

const obtenerTodosLosPeriodos = async (start = null, end = null) => {
  try {
    let query = `SELECT * FROM periodos_academicos`;
    const params = [];
    if (start && end) {
      query += ` WHERE fecha_inicio <= $1 AND fecha_fin >= $2`;
      params.push(end, start);
    } else if (start) {
      query += ` WHERE fecha_fin >= $1`;
      params.push(start);
    } else if (end) {
      query += ` WHERE fecha_inicio <= $1`;
      params.push(end);
    }
    query += ` ORDER BY fecha_inicio DESC NULLS LAST, nombre`;
    const periodos = await dbConnection.any(query, params);
    return periodos;
  } catch (error) {
    console.error("Error al obtener periodos:", error);
    throw error;
  }
};

const obtenerPeriodoPorId = async (id_periodo) => {
  try {
    const periodo = await dbConnection.oneOrNone(
      `SELECT * FROM periodos_academicos WHERE id_periodo = $1`,
      [id_periodo]
    );
    return periodo;
  } catch (error) {
    console.error("Error al obtener periodo por id:", error);
    throw error;
  }
};

const crearPeriodo = async (nombre, fecha_inicio = null, fecha_fin = null) => {
  try {
    // evitar duplicados por nombre
    const existe = await dbConnection.oneOrNone(
      `SELECT * FROM periodos_academicos WHERE nombre = $1`,
      [nombre]
    );

    if (existe) {
      return null; // ya existe
    }

    const resultado = await dbConnection.one(
      `INSERT INTO periodos_academicos (nombre, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, fecha_inicio, fecha_fin]
    );

    return resultado;
  } catch (error) {
    console.error("Error al crear periodo:", error);
    throw error;
  }
};

const actualizarPeriodo = async (id_periodo, data) => {
  try {
    const { nombre, fecha_inicio, fecha_fin } = data;
    const resultado = await dbConnection.one(
      `UPDATE periodos_academicos
       SET nombre = $1, fecha_inicio = $2, fecha_fin = $3
       WHERE id_periodo = $4
       RETURNING *`,
      [nombre, fecha_inicio, fecha_fin, id_periodo]
    );
    return resultado;
  } catch (error) {
    console.error("Error al actualizar periodo:", error);
    throw error;
  }
};

const eliminarPeriodo = async (id_periodo) => {
  try {
    // Verificar referencias en horarios y profesor_disponibilidad
    const refHorarios = await dbConnection.one(
      `SELECT COUNT(*)::int AS total FROM horarios WHERE id_periodo = $1`,
      [id_periodo]
    );
    const refDisponibilidad = await dbConnection.one(
      `SELECT COUNT(*)::int AS total FROM profesor_disponibilidad WHERE id_periodo = $1`,
      [id_periodo]
    );

    if ((refHorarios.total || 0) > 0 || (refDisponibilidad.total || 0) > 0) {
      return { deleted: false, reason: "referencias_existentes" };
    }

    const resultado = await dbConnection.result(
      `DELETE FROM periodos_academicos WHERE id_periodo = $1`,
      [id_periodo]
    );

    return { deleted: resultado.rowCount > 0 };
  } catch (error) {
    console.error("Error al eliminar periodo:", error);
    throw error;
  }
};

export {
  crearPeriodo,
  obtenerTodosLosPeriodos,
  obtenerPeriodoPorId,
  actualizarPeriodo,
  eliminarPeriodo,
};
