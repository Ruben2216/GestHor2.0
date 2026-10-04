import * as auditRepository from '../repositories/auditRepository.js';

export async function registrarAuditoria(evento) {
  return auditRepository.registrarAuditoria(evento);
}

export async function consultarAuditoria(filtros) {
  return auditRepository.consultarAuditoria(filtros);
}
