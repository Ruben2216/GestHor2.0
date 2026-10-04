import { useCallback, useEffect, useMemo, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import {
  asignarRolUsuario,
  obtenerRoles,
  obtenerUsuarios,
} from '../../services/adminSecurityService';
import styles from './AdminSecurity.module.css';

export default function UsuariosRoles() {
  usePageTitle('Asignar roles');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [pendingRoles, setPendingRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResult, rolesResult] = await Promise.all([obtenerUsuarios(), obtenerRoles()]);
      setUsers(usersResult);
      setRoles(rolesResult.filter((role) => role.activo));
      setPendingRoles(Object.fromEntries(usersResult.map((user) => [user.usuario_id, String(user.rol_id)])));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar usuarios y roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => (
      user.email.toLowerCase().includes(query)
      || (user.nombre || '').toLowerCase().includes(query)
      || String(user.usuario_id).includes(query)
      || user.nombre_rol.toLowerCase().includes(query)
    ));
  }, [search, users]);

  const saveRole = async (user) => {
    const roleId = Number(pendingRoles[user.usuario_id]);
    if (!roleId || roleId === Number(user.rol_id)) return;

    setSavingId(user.usuario_id);
    setError('');
    setNotice('');
    try {
      const result = await asignarRolUsuario(user.usuario_id, roleId);
      setNotice(result.message);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el rol del usuario.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2>Asignar roles a usuarios</h2>
          <p>Selecciona un rol activo para cada cuenta. Cambiar el rol cerrará las sesiones del usuario.</p>
        </div>
        <button className={styles.secondaryButton} type="button" onClick={loadData} disabled={loading}>
          Actualizar
        </button>
      </header>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}

      <section className={styles.card}>
        <label className={styles.searchLabel}>
          Buscar usuario
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Correo, nombre, ID o rol"
          />
        </label>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr><th>Usuario</th><th>Correo</th><th>Rol actual</th><th>Nuevo rol</th><th>Estado</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="6">Cargando usuarios…</td></tr>}
              {!loading && filteredUsers.length === 0 && <tr><td colSpan="6">No hay usuarios que coincidan con la búsqueda.</td></tr>}
              {!loading && filteredUsers.map((user) => {
                const isCurrentUser = String(currentUser?.usuario_id) === String(user.usuario_id);
                const selectedRoleId = Number(pendingRoles[user.usuario_id]);
                const canChange = user.activo && !isCurrentUser && selectedRoleId !== Number(user.rol_id);
                return (
                  <tr key={user.usuario_id}>
                    <td>{user.nombre || `Usuario ${user.usuario_id}`}{isCurrentUser && <small className={styles.muted}> (tu cuenta)</small>}</td>
                    <td>{user.email}</td>
                    <td>{user.nombre_rol}</td>
                    <td>
                      <select
                        value={pendingRoles[user.usuario_id] || ''}
                        disabled={!user.activo || isCurrentUser || savingId === user.usuario_id}
                        onChange={(event) => setPendingRoles({ ...pendingRoles, [user.usuario_id]: event.target.value })}
                        aria-label={`Nuevo rol para ${user.email}`}
                      >
                        {roles.map((role) => (
                          <option key={role.rol_id} value={role.rol_id}>{role.nombre_rol}</option>
                        ))}
                      </select>
                    </td>
                    <td><span className={user.activo ? styles.success : styles.failure}>{user.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      {isCurrentUser ? <span className={styles.muted}>No editable</span> : (
                        <button
                          className={styles.primaryButton}
                          type="button"
                          disabled={!canChange || savingId === user.usuario_id}
                          onClick={() => saveRole(user)}
                        >
                          {savingId === user.usuario_id ? 'Guardando…' : 'Asignar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
