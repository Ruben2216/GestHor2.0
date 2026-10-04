import { useCallback, useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import {
  actualizarRol,
  crearRol,
  guardarPermisosRol,
  obtenerPermisosRol,
  obtenerRoles,
} from '../../services/adminSecurityService';
import styles from './AdminSecurity.module.css';

const emptyForm = { nombre_rol: '', descripcion: '', activo: true };

export default function RolesPermisos() {
  usePageTitle('Roles y permisos');
  const [roles, setRoles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await obtenerRoles();
      setRoles(result);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPermissions = useCallback(async (roleId) => {
    if (!roleId) {
      setPermissions([]);
      return;
    }
    try {
      setPermissions(await obtenerPermisosRol(roleId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los permisos.');
    }
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);
  useEffect(() => { loadPermissions(selectedId); }, [loadPermissions, selectedId]);

  const startCreate = () => {
    setSelectedId('');
    setEditing(false);
    setForm(emptyForm);
    setNotice('');
    setError('');
  };

  const selectRole = (role) => {
    setSelectedId(String(role.rol_id));
    setEditing(true);
    setForm({
      nombre_rol: role.nombre_rol,
      descripcion: role.descripcion || '',
      activo: role.activo,
    });
    setNotice('');
    setError('');
  };

  const submitRole = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editing) {
        await actualizarRol(selectedId, form);
        setNotice('Rol actualizado.');
      } else {
        const role = await crearRol(form);
        setSelectedId(String(role.rol_id));
        setEditing(true);
        setNotice('Rol creado. Asígnale permisos antes de dar acceso a usuarios.');
      }
      await loadRoles();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el rol.');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permissionId) => {
    setPermissions((current) => current.map((permission) => (
      permission.permiso_id === permissionId
        ? { ...permission, asignado: !permission.asignado }
        : permission
    )));
  };

  const submitPermissions = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await guardarPermisosRol(
        selectedId,
        permissions.filter((permission) => permission.asignado).map((permission) => permission.permiso_id)
      );
      setNotice('Permisos actualizados.');
      await loadPermissions(selectedId);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron guardar los permisos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2>Roles y permisos</h2>
          <p>Crea roles y administra los permisos asignados a cada uno.</p>
        </div>
        <button className={styles.secondaryButton} type="button" onClick={startCreate}>Nuevo rol</button>
      </header>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}

      <div className={styles.columns}>
        <section className={styles.card}>
          <h3>Roles existentes</h3>
          {loading ? <p>Cargando roles…</p> : roles.length === 0 ? <p>No hay roles registrados.</p> : (
            <ul className={styles.roleList}>
              {roles.map((role) => (
                <li key={role.rol_id}>
                  <button
                    type="button"
                    className={`${styles.roleOption} ${selectedId === String(role.rol_id) ? styles.selected : ''}`}
                    onClick={() => selectRole(role)}
                  >
                    <span><strong>{role.nombre_rol}</strong><small>{role.usuarios} usuarios · {role.activo ? 'Activo' : 'Inactivo'}</small></span>
                    <span aria-hidden="true">›</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.card}>
          <h3>{editing ? 'Editar rol' : 'Crear rol'}</h3>
          <form className={styles.form} onSubmit={submitRole}>
            <label>
              Nombre (identificador)
              <input
                value={form.nombre_rol}
                onChange={(event) => setForm({ ...form, nombre_rol: event.target.value })}
                minLength={2}
                maxLength={50}
                pattern="[a-zA-Z][a-zA-Z0-9_-]*"
                required
              />
            </label>
            <label>
              Descripción
              <textarea
                value={form.descripcion}
                onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                maxLength={500}
                rows={3}
              />
            </label>
            {editing && (
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(event) => setForm({ ...form, activo: event.target.checked })}
                />
                Rol activo
              </label>
            )}
            <button className={styles.primaryButton} type="submit" disabled={saving}>
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear rol'}
            </button>
          </form>
          {editing && (
            <div className={styles.permissionSection}>
              <h3>Permisos asignados</h3>
              {permissions.length === 0 ? <p>Cargando permisos…</p> : (
                <>
                  <div className={styles.permissionList}>
                    {permissions.map((permission) => (
                      <label className={styles.permission} key={permission.permiso_id}>
                        <input
                          type="checkbox"
                          checked={permission.asignado}
                          disabled={!permission.activo || saving}
                          onChange={() => togglePermission(permission.permiso_id)}
                        />
                        <span><strong>{permission.nombre}</strong><small>{permission.clave}</small></span>
                      </label>
                    ))}
                  </div>
                  <button className={styles.primaryButton} type="button" onClick={submitPermissions} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar permisos'}
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
