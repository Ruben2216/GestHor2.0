import {
  crearPeriodo,
  obtenerTodosLosPeriodos,
  obtenerPeriodoPorId,
  actualizarPeriodo,
  eliminarPeriodo,
} from "../models/periodoModel.js";
import { sanitize } from "../utils/sanitizeJson.js";

const sendJson = (req, res, payload, status = 200) => {
  if (req.get('X-Raw-Dates')) {
    return res.status(status).json(payload);
  }
  try {
    return res.status(status).json(sanitize(payload));
  } catch (e) {
    return res.status(status).json(payload);
  }
};

/**
 * Controladores para periodos académicos
 */

const crearPeriodoController = async (req, res) => {
  try {
    const { nombre, fecha_inicio, fecha_fin } = req.body;

    if (!nombre) {
      return res.status(400).json({ ok: false, message: "El nombre es requerido" });
    }

    const resultado = await crearPeriodo(nombre, fecha_inicio || null, fecha_fin || null);
    if (!resultado) {
      return sendJson(req, res, { ok: false, message: "Periodo ya existe" }, 409);
    }

    return sendJson(req, res, { ok: true, periodo: resultado }, 201);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al crear periodo" });
  }
};

const obtenerPeriodosController = async (req, res) => {
  try {
    const { start, end } = req.query;
  const periodos = await obtenerTodosLosPeriodos(start || null, end || null);
  return sendJson(req, res, { ok: true, periodos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener periodos" });
  }
};

const obtenerPeriodoPorIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const periodo = await obtenerPeriodoPorId(id);
  if (!periodo) return sendJson(req, res, { ok: false, message: "Periodo no encontrado" }, 404);
  return sendJson(req, res, { ok: true, periodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener periodo" });
  }
};

const actualizarPeriodoController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
  const actualizado = await actualizarPeriodo(id, data);
  return sendJson(req, res, { ok: true, periodo: actualizado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al actualizar periodo" });
  }
};

const eliminarPeriodoController = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await eliminarPeriodo(id);
    if (!resultado.deleted) {
      if (resultado.reason === "referencias_existentes") {
        return sendJson(req, res, { ok: false, message: "No se puede eliminar: existen horarios o disponibilidades vinculadas" }, 400);
      }
      return sendJson(req, res, { ok: false, message: "Periodo no encontrado" }, 404);
    }
    return sendJson(req, res, { ok: true, message: "Periodo eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al eliminar periodo" });
  }
};

export {
  crearPeriodoController,
  obtenerPeriodosController,
  obtenerPeriodoPorIdController,
  actualizarPeriodoController,
  eliminarPeriodoController,
};
