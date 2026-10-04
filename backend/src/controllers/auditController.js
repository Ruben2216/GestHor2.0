import * as auditService from '../services/auditService.js';

export async function consultarAuditoriaController(req, res) {
  const { desde, hasta, usuario, accion, recurso } = req.query;
  const limit = Number.parseInt(req.query.limit, 10) || 50;
  const offset = Number.parseInt(req.query.offset, 10) || 0;

  if ((desde && Number.isNaN(Date.parse(desde))) || (hasta && Number.isNaN(Date.parse(hasta)))) {
    return res.status(400).json({ ok: false, message: 'Las fechas del filtro no son válidas' });
  }
  if (desde && hasta && desde > hasta) {
    return res.status(400).json({ ok: false, message: 'La fecha inicial debe ser anterior a la fecha final' });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) {
    return res.status(400).json({ ok: false, message: 'Los parámetros de paginación no son válidos' });
  }

  try {
    const result = await auditService.consultarAuditoria({
      desde, hasta, usuario, accion, recurso, limit, offset,
    });
    return res.json({ ok: true, ...result, limit, offset });
  } catch (error) {
    console.error('Error al consultar auditoría:', error);
    return res.status(500).json({ ok: false, message: 'No se pudo consultar la auditoría' });
  }
}
