import { dbConnection } from "../config/database.js";

const obtenerTiposContratoController = async (req, res) => {
  try {
    const tipos = await dbConnection.any('SELECT tipo_contrato_id, nombre_tipo, nivel_prioridad, descripcion FROM tipos_contrato ORDER BY nivel_prioridad');
    res.json({ ok: true, tiposContrato: tipos });
  } catch (error) {
    console.error('Error en obtenerTiposContratoController:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener tipos de contrato', error: error.message });
  }
};

const crearTipoContratoController = async (req, res) => {
  try {
    const { nombre_tipo, nivel_prioridad, descripcion } = req.body;
    if (!nombre_tipo || nivel_prioridad == null) {
      return res.status(400).json({ ok: false, mensaje: 'nombre_tipo y nivel_prioridad son obligatorios' });
    }

    const resultado = await dbConnection.one(
      `INSERT INTO tipos_contrato (nombre_tipo, nivel_prioridad, descripcion)
       VALUES ($1, $2, $3) RETURNING tipo_contrato_id, nombre_tipo, nivel_prioridad, descripcion`,
      [nombre_tipo, nivel_prioridad, descripcion]
    );

    res.status(201).json({ ok: true, tipoContrato: resultado });
  } catch (error) {
    console.error('Error en crearTipoContratoController:', error);
    // Manejar violaciones de unicidad
    if (error.code === '23505') {
      return res.status(409).json({ ok: false, mensaje: 'Ya existe un tipo de contrato con ese nombre o prioridad', error: error.detail });
    }
    res.status(500).json({ ok: false, mensaje: 'Error al crear tipo de contrato', error: error.message });
  }
};

const actualizarTipoContratoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_tipo, nivel_prioridad, descripcion } = req.body;

    const updated = await dbConnection.one(
      `UPDATE tipos_contrato SET nombre_tipo = $1, nivel_prioridad = $2, descripcion = $3
       WHERE tipo_contrato_id = $4
       RETURNING tipo_contrato_id, nombre_tipo, nivel_prioridad, descripcion`,
      [nombre_tipo, nivel_prioridad, descripcion, id]
    );

    res.json({ ok: true, tipoContrato: updated });
  } catch (error) {
    console.error('Error en actualizarTipoContratoController:', error);
    if (error.code === '23505') {
      return res.status(409).json({ ok: false, mensaje: 'Nombre o prioridad ya en uso', error: error.detail });
    }
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar tipo de contrato', error: error.message });
  }
};

export { obtenerTiposContratoController, crearTipoContratoController, actualizarTipoContratoController };
