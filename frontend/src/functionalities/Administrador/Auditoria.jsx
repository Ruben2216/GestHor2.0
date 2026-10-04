import { useCallback, useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { consultarAuditoria } from '../../services/adminSecurityService';
import styles from './AdminSecurity.module.css';

const pageSize = 50;
const initialFilters = { desde: '', hasta: '', usuario: '', accion: '', recurso: '' };

function formatDate(value) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

export default function Auditoria() {
  usePageTitle('Auditoría');
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const result = await consultarAuditoria({ ...appliedFilters, limit: pageSize, offset });
      setRecords(result.registros);
      setTotal(result.total);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la auditoría.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, offset]);

  useEffect(() => { loadAudit(); }, [loadAudit]);

  const submitFilters = (event) => {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setOffset(0);
    setAppliedFilters(initialFilters);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2>Auditoría del sistema</h2>
          <p>Registro de accesos y operaciones. Los registros son de solo lectura.</p>
        </div>
        <button className={styles.secondaryButton} type="button" onClick={loadAudit} disabled={loading}>
          Actualizar
        </button>
      </header>

      <form className={`${styles.card} ${styles.filters}`} onSubmit={submitFilters}>
        <label>Desde<input type="date" value={filters.desde} onChange={(event) => setFilters({ ...filters, desde: event.target.value })} /></label>
        <label>Hasta<input type="date" value={filters.hasta} onChange={(event) => setFilters({ ...filters, hasta: event.target.value })} /></label>
        <label>Usuario (correo o ID)<input value={filters.usuario} onChange={(event) => setFilters({ ...filters, usuario: event.target.value })} /></label>
        <label>Acción<input value={filters.accion} onChange={(event) => setFilters({ ...filters, accion: event.target.value })} placeholder="Ej. login, horarios" /></label>
        <label>Módulo
          <select value={filters.recurso} onChange={(event) => setFilters({ ...filters, recurso: event.target.value })}>
            <option value="">Todos</option>
            <option value="autenticacion">Autenticación</option>
            <option value="roles">Roles</option>
            <option value="permisos">Permisos</option>
            <option value="auditoria">Auditoría</option>
            <option value="usuarios">Usuarios</option>
            <option value="horarios">Horarios</option>
            <option value="materias">Materias</option>
            <option value="docentes">Docentes</option>
            <option value="carreras">Carreras</option>
            <option value="lugares">Lugares</option>
            <option value="periodos">Periodos</option>
            <option value="disponibilidad">Disponibilidad</option>
            <option value="profesor-materias">Materias de profesores</option>
            <option value="solicitudes-recuperacion">Solicitudes de recuperación</option>
            <option value="tipos-contrato">Tipos de contrato</option>
            <option value="sugerencias">Sugerencias</option>
          </select>
        </label>
        <div className={styles.filterActions}>
          <button className={styles.primaryButton} type="submit">Filtrar</button>
          <button className={styles.secondaryButton} type="button" onClick={resetFilters}>Limpiar</button>
        </div>
      </form>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <section className={`${styles.card} ${styles.tableCard}`}>
        <div className={styles.tableHeader}><h3>Registros ({total})</h3><span>{loading ? 'Cargando…' : `Mostrando ${records.length}`}</span></div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha y hora</th><th>Usuario</th><th>Rol</th><th>IP</th>
                <th>Acción</th><th>Resultado</th><th>Recurso</th><th>Método / ruta</th>
              </tr>
            </thead>
            <tbody>
              {!loading && records.length === 0 && <tr><td colSpan="8">No hay registros que coincidan con los filtros.</td></tr>}
              {records.map((record) => (
                <tr key={record.auditoria_id}>
                  <td>{formatDate(record.fecha_hora)}</td>
                  <td>{record.email || (record.usuario_id ? `ID ${record.usuario_id}` : 'No identificado')}</td>
                  <td>{record.rol || '—'}</td>
                  <td>{record.direccion_ip || '—'}</td>
                  <td>{record.accion}</td>
                  <td><span className={record.resultado === 'exitoso' ? styles.success : styles.failure}>{record.resultado}</span></td>
                  <td>{record.recurso}</td>
                  <td><code>{record.metodo_http} {record.ruta}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.pagination}>
          <button className={styles.secondaryButton} type="button" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - pageSize))}>Anterior</button>
          <span>{total === 0 ? 0 : offset + 1}–{Math.min(offset + records.length, total)} de {total}</span>
          <button className={styles.secondaryButton} type="button" disabled={offset + pageSize >= total || loading} onClick={() => setOffset(offset + pageSize)}>Siguiente</button>
        </div>
      </section>
    </section>
  );
}
