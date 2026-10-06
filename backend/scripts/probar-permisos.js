// Pruebas de criterios de aceptación - Módulo 2 (roles, permisos y protección)
import 'dotenv/config';

const API = process.env.API_URL || 'http://localhost:3000/api';
const PASSWORD = process.env.TEST_USER_PASSWORD || 'PlaceholderTestPassword#123';
const NO_EXISTE = 999999;

let fallos = 0;
let total = 0;

async function login(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const body = await res.json();
  if (!body.ok) throw new Error(`No se pudo iniciar sesión con ${email}: ${body.message}`);
  return { token: body.data.accessToken, id: body.data.usuario.id };
}

async function pedir(method, ruta, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${ruta}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return res.status;
}

// esperado: número exacto, o 'permitido' (cualquier status que no sea 401/403)
async function prueba(descripcion, method, ruta, token, esperado, body) {
  total++;
  const status = await pedir(method, ruta, token, body);
  const ok = esperado === 'permitido' ? status !== 401 && status !== 403 : status === esperado;
  if (!ok) fallos++;
  const esperadoTxt = esperado === 'permitido' ? 'permitido' : esperado;
  console.log(`  ${ok ? '[OK]   ' : '[FALLA]'} ${descripcion.padEnd(62)} ${method.padEnd(6)} ${ruta} -> ${status}${ok ? '' : ` (esperado ${esperadoTxt})`}`);
}

async function main() {
  console.log(`\nProbando contra ${API}\n`);

  console.log('== Sin JWT -> 401');
  await prueba('Consultar horarios sin token', 'GET', '/horarios', null, 401);
  await prueba('Crear horario sin token', 'POST', '/horarios', null, 401, {});
  await prueba('Eliminar docente sin token', 'DELETE', `/docentes/${NO_EXISTE}`, null, 401);
  await prueba('Token inválido', 'GET', '/materias', 'token-falso', 401);
  await prueba('Consultar permisos sin token', 'GET', '/auth/permisos', null, 401);

  console.log('\n== Rutas públicas siguen públicas');
  await prueba('Crear solicitud de recuperación (sin sesión)', 'POST', '/solicitudes-recuperacion', null, 'permitido', {});

  const admin = await login('test.admin@unach.mx');
  const editor = await login('test.editor@unach.mx');
  const profe = await login('test.profe@unach.mx');
  const alumno = await login('test.estudiante@unach.mx');

  console.log('\n== Endpoint de permisos del usuario');
  for (const [nombre, u] of [['administrador', admin], ['editor (docente)', editor], ['profesor', profe], ['alumno (estudiante)', alumno]]) {
    const res = await fetch(`${API}/auth/permisos`, { headers: { Authorization: `Bearer ${u.token}` } });
    const body = await res.json();
    total++;
    const ok = res.status === 200 && Array.isArray(body.data?.permisos);
    if (!ok) fallos++;
    console.log(`  ${ok ? '[OK]   ' : '[FALLA]'} ${nombre.padEnd(20)} rol=${body.data?.rol} permisos=${body.data?.permisos?.length}`);
  }

  console.log('\n== Alumno: consulta horarios, pero no crea ni elimina -> 403');
  await prueba('Alumno consulta horarios', 'GET', '/horarios', alumno.token, 200);
  await prueba('Alumno consulta materias', 'GET', '/materias', alumno.token, 200);
  await prueba('Alumno consulta carreras', 'GET', '/carreras', alumno.token, 200);
  await prueba('Alumno crea horario', 'POST', '/horarios', alumno.token, 403, {});
  await prueba('Alumno edita horario', 'PUT', `/horarios/${NO_EXISTE}`, alumno.token, 403, {});
  await prueba('Alumno elimina horario', 'DELETE', `/horarios/${NO_EXISTE}`, alumno.token, 403);
  await prueba('Alumno crea materia', 'POST', '/materias', alumno.token, 403, {});
  await prueba('Alumno consulta docentes', 'GET', '/docentes', alumno.token, 403);

  console.log('\n== Editor: modifica contenido, pero no usuarios ni roles');
  await prueba('Editor consulta horarios', 'GET', '/horarios', editor.token, 200);
  await prueba('Editor elimina horario', 'DELETE', `/horarios/${NO_EXISTE}`, editor.token, 'permitido');
  await prueba('Editor edita materia', 'PUT', `/materias/${NO_EXISTE}`, editor.token, 'permitido', {});
  await prueba('Editor elimina carrera', 'DELETE', `/carreras/${NO_EXISTE}`, editor.token, 'permitido');
  await prueba('Editor elimina salón', 'DELETE', `/salones/${NO_EXISTE}`, editor.token, 'permitido');
  await prueba('Editor crea docente (es crear usuario)', 'POST', '/docentes', editor.token, 403, {});
  await prueba('Editor elimina docente', 'DELETE', `/docentes/${NO_EXISTE}`, editor.token, 403);
  await prueba('Editor gestiona solicitudes de cuentas', 'GET', '/solicitudes-recuperacion', editor.token, 403);
  await prueba('Editor regenera contraseña', 'POST', `/solicitudes-recuperacion/${NO_EXISTE}/regenerar-password`, editor.token, 403);
  await prueba('Editor crea periodo (configuración)', 'POST', '/periodos', editor.token, 403, {});

  console.log('\n== Profesor: su propia información sí, funciones administrativas no');
  await prueba('Profesor consulta su horario', 'GET', `/horarios/profesor/${profe.id}`, profe.token, 200);
  await prueba('Profesor consulta su nombre', 'GET', `/profesor/nombre/${profe.id}`, profe.token, 200);
  await prueba('Profesor consulta su disponibilidad', 'GET', `/disponibilidad/${profe.id}`, profe.token, 200);
  await prueba('Profesor consulta sus preferencias', 'GET', `/preferencias/${profe.id}`, profe.token, 200);
  await prueba('Profesor consulta sus materias', 'GET', `/profesor-materias/${profe.id}`, profe.token, 200);
  await prueba('Profesor busca materias', 'GET', '/materias/buscar?q=ma', profe.token, 200);
  await prueba('Profesor consulta disponibilidad de otro', 'GET', `/disponibilidad/${admin.id}`, profe.token, 403);
  await prueba('Profesor modifica disponibilidad de otro', 'POST', `/disponibilidad/${admin.id}`, profe.token, 403, {});
  await prueba('Profesor modifica materias de otro', 'POST', `/profesor-materias/${admin.id}`, profe.token, 403, {});
  await prueba('Profesor consulta docentes', 'GET', '/docentes', profe.token, 403);
  await prueba('Profesor crea horario', 'POST', '/horarios', profe.token, 403, {});
  await prueba('Profesor elimina materia', 'DELETE', `/materias/${NO_EXISTE}`, profe.token, 403);
  await prueba('Profesor gestiona solicitudes de cuentas', 'GET', '/solicitudes-recuperacion', profe.token, 403);

  console.log('\n== Administrador: acceso total (rutas existentes conservan su funcionalidad)');
  await prueba('Admin consulta docentes', 'GET', '/docentes', admin.token, 200);
  await prueba('Admin consulta estadísticas de docentes', 'GET', '/docentes/estadisticas', admin.token, 200);
  await prueba('Admin consulta horarios', 'GET', '/horarios', admin.token, 200);
  await prueba('Admin consulta lugares', 'GET', '/lugares', admin.token, 200);
  await prueba('Admin consulta periodos', 'GET', '/periodos', admin.token, 200);
  await prueba('Admin consulta tipos de contrato', 'GET', '/tipos-contrato', admin.token, 200);
  await prueba('Admin consulta solicitudes de recuperación', 'GET', '/solicitudes-recuperacion', admin.token, 200);
  await prueba('Admin consulta disponibilidad de un profesor', 'GET', `/disponibilidad/${profe.id}`, admin.token, 200);
  await prueba('Admin elimina docente', 'DELETE', `/docentes/${NO_EXISTE}`, admin.token, 'permitido');

  console.log(`\n${fallos === 0 ? '[OK]   ' : '[FALLA]'} ${total - fallos}/${total} pruebas correctas\n`);
  process.exit(fallos === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\nError ejecutando las pruebas:', err.message);
  console.error('   ¿Está corriendo el backend y se cargó test-users.sql?\n');
  process.exit(1);
});
