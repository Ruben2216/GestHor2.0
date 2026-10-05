/**
 * ============================================================================
 * GestHor 2.0 - Vista de Consulta de Materias (Rol Alumno)
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import apiClient, { sanitizeApiError } from '../../services/apiClient';
import { MdSearch, MdMenuBook, MdSchool, MdRefresh } from 'react-icons/md';

export default function ConsultaMaterias() {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [resMaterias, resCarreras] = await Promise.all([
        apiClient.get('/materias'),
        apiClient.get('/carreras').catch(() => ({ data: [] })),
      ]);

      const listaMaterias = Array.isArray(resMaterias.data) 
        ? resMaterias.data 
        : resMaterias.data?.data || [];
      
      const listaCarreras = Array.isArray(resCarreras.data) 
        ? resCarreras.data 
        : resCarreras.data?.data || [];

      setMaterias(listaMaterias);
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

  const materiasFiltradas = materias.filter((m) => {
    const nombre = (m.nombre_materia || m.nombre || '').toLowerCase();
    const clave = (m.clave_materia || m.clave || '').toLowerCase();
    const query = busqueda.toLowerCase();

    const coincideBusqueda = !query || nombre.includes(query) || clave.includes(query);
    const coincideCarrera = !filtroCarrera || String(m.carrera_id) === String(filtroCarrera) || m.nombre_carrera === filtroCarrera;
    const coincideSemestre = !filtroSemestre || String(m.numero_semestre || m.semestre) === String(filtroSemestre);

    return coincideBusqueda && coincideCarrera && coincideSemestre;
  });

  return (
    <div>
      {/* Encabezado */}
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
            Catálogo de Materias y Plan de Estudios
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Consulta las asignaturas ofertadas por carrera, semestre y créditos académicos.
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
            cursor: 'pointer'
          }}
        >
          <MdRefresh size={18} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
            Buscar materia o clave
          </label>
          <div style={{ position: 'relative' }}>
            <MdSearch size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Ej. Programación, BD..."
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
      </div>

      {/* Grid de Materias */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <p>Cargando materias...</p>
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', color: '#b91c1c' }}>
          {error}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {materiasFiltradas.map((m, idx) => (
            <div
              key={m.materia_id || idx}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  {m.clave_materia || `MAT-${m.materia_id || idx + 1}`}
                </span>

                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                  {m.numero_semestre ? `${m.numero_semestre}° Semestre` : 'Optativa / General'}
                </span>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                {m.nombre_materia || m.nombre}
              </h4>

              {m.nombre_carrera && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                  <MdSchool size={15} style={{ color: '#2563eb' }} />
                  {m.nombre_carrera}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
