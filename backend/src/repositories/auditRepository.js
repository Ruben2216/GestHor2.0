import { dbConnection } from '../config/database.js';

export async function registrarAuditoria({
  usuarioId,
  email,
  rol,
  direccionIp,
  accion,
  resultado,
  recurso,
  metodoHttp,
  ruta,
}) {
  return dbConnection.none(`
    INSERT INTO auditoria (
      usuario_id, email, rol, direccion_ip, accion, resultado, recurso, metodo_http, ruta
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [usuarioId, email, rol, direccionIp, accion, resultado, recurso, metodoHttp, ruta]);
}

export async function consultarAuditoria({ desde, hasta, usuario, accion, recurso, limit, offset }) {
  const conditions = [];
  const values = [];
  const addCondition = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace('?', `$${values.length}`));
  };

  if (desde) addCondition('fecha_hora >= ?::date', desde);
  if (hasta) addCondition("fecha_hora < (?::date + INTERVAL '1 day')", hasta);
  if (usuario) {
    values.push(`%${usuario}%`);
    const parameter = `$${values.length}`;
    conditions.push(`(email ILIKE ${parameter} OR usuario_id::text ILIKE ${parameter})`);
  }
  if (accion) addCondition('accion ILIKE ?', `%${accion}%`);
  if (recurso) addCondition('recurso = ?', recurso);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const count = await dbConnection.one(
    `SELECT COUNT(*)::integer AS total FROM auditoria ${where}`,
    values
  );
  const rows = await dbConnection.any(`
    SELECT auditoria_id, usuario_id, email, rol, fecha_hora, direccion_ip,
           accion, resultado, recurso, metodo_http, ruta
    FROM auditoria
    ${where}
    ORDER BY fecha_hora DESC, auditoria_id DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `, [...values, limit, offset]);

  return { registros: rows, total: count.total };
}
