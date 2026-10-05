/**
 * ============================================================================
 * GestHor 2.0 - Vista de Consulta de Horarios (Rol Alumno)
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 * 
 * Cumplimiento:
 * - Modo Estricto de Solo Lectura (sin acciones de POST, PUT, DELETE).
 * - Filtros rápidos por Carrera, Semestre y Día.
 * - Visualización tabular y en tarjetas.
 */

import React, { useState, useEffect } from 'react';
import apiClient, { sanitizeApiError } from '../../services/apiClient';
import { 
  MdSearch, 
  MdAccessTime, 
  MdRoom, 
  MdPerson, 
  MdCalendarMonth, 
  MdSchool,
  MdRefresh
} from 'react-icons/md';

export default function ConsultaHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('');
  const [filtroDia, setFiltroDia] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [resHorarios, resCarreras] = await Promise.all([
        apiClient.get('/horarios'),
        apiClient.get('/carreras').catch(() => ({ data: [] })),
      ]);

      const listaHorarios = Array.isArray(resHorarios.data) 
        ? resHorarios.data 
        : resHorarios.data?.data || [];
      
      const listaCarreras = Array.isArray(resCarreras.data) 
        ? resCarreras.data 
        : resCarreras.data?.data || [];

      setHorarios(listaHorarios);
      setCarreras(listaCarreras);
    } catch (err) {
      const sanitized = sanitizeApiError(err);
      setError(sanitized.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado de horarios
  const horariosFiltrados = horarios.filter((h) => {
    const materiaNombre = (h.nombre_materia || h.materia || '').toLowerCase();
    const docenteNombre = `${h.docente_nombres || h.profesor_nombre || ''} ${h.docente_apellidos || ''}`.toLowerCase();
    const salonNombre = (h.nombre_salon || h.salon || '').toLowerCase();
    const query = busqueda.toLowerCase();

    const coincideBusqueda = !query || 
      materiaNombre.includes(query) || 
      docenteNombre.includes(query) || 
      salonNombre.includes(query);

    const coincideCarrera = !filtroCarrera || String(h.carrera_id) === String(filtroCarrera) || h.nombre_carrera === filtroCarrera;
    const coincideSemestre = !filtroSemestre || String(h.numero_semestre || h.semestre) === String(filtroSemestre);
    const coincideDia = !filtroDia || (h.dia_semana || h.dia) === filtroDia;

    return coincideBusqueda && coincideCarrera && coincideSemestre && coincideDia;
  });

  return (
    <div>
      {/* Encabezado de la página */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            Consulta de Horarios de Clase
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Visualiza la asignación de materias, salones y docentes por semestre. (Modo solo lectura)
          </p>
        </div>

        <button
          onClick={cargarDatos}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <MdRefresh size={18} />
          Actualizar Horarios
        </button>
      </div>

      {/* Barra de Filtros */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Buscador */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
            Buscar materia o profesor
          </label>
          <div style={{ position: 'relative' }}>
            <MdSearch size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Ej. Algoritmos, Pérez..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Filtro Carrera */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
            Carrera
          </label>
          <select
            value={filtroCarrera}
            onChange={(e) => setFiltroCarrera(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Todas las carreras</option>
            {carreras.map((c) => (
              <option key={c.carrera_id || c.id} value={c.carrera_id || c.id}>
                {c.nombre_carrera || c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Semestre */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
            Semestre
          </label>
          <select
            value={filtroSemestre}
            onChange={(e) => setFiltroSemestre(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Todos los semestres</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
              <option key={sem} value={sem}>{sem}° Semestre</option>
            ))}
          </select>
        </div>

        {/* Filtro Día */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
            Día de la semana
          </label>
          <select
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Todos los días</option>
            {diasSemana.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estados de Carga / Error */}
      {cargando && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Cargando horarios de clase...</p>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px',
          color: '#b91c1c',
          marginBottom: '24px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Listado de Horarios */}
      {!cargando && !error && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
              Mostrando <strong>{horariosFiltrados.length}</strong> sesiones encontradas
            </div>
          </div>

          {horariosFiltrados.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px dashed #cbd5e1',
              color: '#64748b'
            }}>
              <MdCalendarMonth size={48} style={{ color: '#94a3b8', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                No se encontraron horarios para los filtros seleccionados
              </h3>
              <p style={{ fontSize: '14px' }}>Intenta cambiar los parámetros de búsqueda o selecciona otra carrera/semestre.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {horariosFiltrados.map((h, idx) => (
                <div
                  key={h.horario_id || idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#2563eb'
                  }} />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {h.dia_semana || h.dia || 'Día a asignar'}
                      </span>

                      <span style={{
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '600'
                      }}>
                        {h.numero_semestre ? `${h.numero_semestre}° Semestre` : ''}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', lineHeight: 1.4 }}>
                      {h.nombre_materia || h.materia || 'Asignatura'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdAccessTime size={16} style={{ color: '#2563eb' }} />
                        <span>
                          <strong>{h.hora_inicio || h.inicio}</strong> - <strong>{h.hora_fin || h.fin}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdRoom size={16} style={{ color: '#16a34a' }} />
                        <span>Salón: <strong>{h.nombre_salon || h.salon || 'Por asignar'}</strong> {h.nombre_edificio ? `(${h.nombre_edificio})` : ''}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdPerson size={16} style={{ color: '#9333ea' }} />
                        <span>Profesor: <strong>{h.docente_nombres || h.profesor_nombre || 'Docente asignado'} {h.docente_apellidos || ''}</strong></span>
                      </div>

                      {h.nombre_carrera && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MdSchool size={16} style={{ color: '#ea580c' }} />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{h.nombre_carrera}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
