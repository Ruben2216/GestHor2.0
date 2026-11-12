import bcrypt from 'bcrypt';
import { dbConnection } from '../src/config/database.js';

async function seed() {
  const password = process.env.SEED_TEST_PASSWORD || 'DefaultSeedSecurePass#2026';
  const hash = await bcrypt.hash(password, 10);

  // Asegurar roles
  await dbConnection.none(`
    INSERT INTO roles (rol_id, nombre_rol, descripcion) 
    VALUES 
      (1, 'administrador', 'Acceso total al sistema'),
      (2, 'profesor', 'Consulta su horario y materias'),
      (3, 'estudiante', 'Alumno: solo consulta horarios y materias'),
      (4, 'editor', 'Editor: gestiona contenidos')
    ON CONFLICT (rol_id) DO UPDATE SET 
      nombre_rol = EXCLUDED.nombre_rol,
      descripcion = EXCLUDED.descripcion;
  `);

  // Asegurar usuarios estándar (Jest)
  await dbConnection.none(`
    INSERT INTO usuarios (email, password_hash, rol_id, nombre, activo)
    VALUES 
      ('admin@unach.mx', $1, 1, 'Administrador UNACH', true),
      ('profe@unach.mx', $1, 2, 'Profesor UNACH', true),
      ('alumno@unach.mx', $1, 3, 'Alumno UNACH', true),
      ('editor@unach.mx', $1, 4, 'Editor UNACH', true)
    ON CONFLICT (email) DO UPDATE SET 
      password_hash = EXCLUDED.password_hash,
      rol_id = EXCLUDED.rol_id,
      nombre = EXCLUDED.nombre,
      activo = true;
  `, [hash]);

  // Asegurar usuarios para test:permisos (Módulo 2)
  const permisosPass = 'PlaceholderTestPassword#123';
  const permisosHash = await bcrypt.hash(permisosPass, 10);
  await dbConnection.none(`
    INSERT INTO usuarios (email, password_hash, rol_id, nombre, activo)
    VALUES 
      ('test.admin@unach.mx', $1, 1, 'Test Administrador', true),
      ('test.profe@unach.mx', $1, 2, 'Test Profesor', true),
      ('test.estudiante@unach.mx', $1, 3, 'Test Estudiante', true),
      ('test.editor@unach.mx', $1, 4, 'Test Editor', true)
    ON CONFLICT (email) DO UPDATE SET 
      password_hash = EXCLUDED.password_hash,
      rol_id = EXCLUDED.rol_id,
      nombre = EXCLUDED.nombre,
      activo = true;
  `, [permisosHash]);

  // Asegurar registro de profesor para profe@unach.mx y test.profe@unach.mx
  await dbConnection.none(`
    INSERT INTO profesores (profesor_id, nombres, apellidos, matricula, grado_academico, numero_plaza, numero_contrato, direccion, telefono, email, tipo_contrato_id)
    SELECT u.usuario_id, 'Profesor', 'UNACH', 'PROF-0003', 'Maestría', 'PLAZA-0003', 'CONTRATO-0003', 'Tuxtla Gutiérrez, Chiapas', '9610000003', u.email, 1
    FROM usuarios u
    WHERE u.email = 'profe@unach.mx'
    ON CONFLICT (profesor_id) DO UPDATE SET
      nombres = EXCLUDED.nombres,
      apellidos = EXCLUDED.apellidos,
      email = EXCLUDED.email;

    INSERT INTO profesores (profesor_id, nombres, apellidos, matricula, grado_academico, numero_plaza, numero_contrato, direccion, telefono, email, tipo_contrato_id)
    SELECT u.usuario_id, 'Test', 'Profesor', 'TEST001', 'Maestría', 'PLAZA001', 'CONTRATO001', 'Dirección Test', '555-1234', u.email, 1
    FROM usuarios u
    WHERE u.email = 'test.profe@unach.mx'
    ON CONFLICT (profesor_id) DO UPDATE SET
      nombres = EXCLUDED.nombres,
      apellidos = EXCLUDED.apellidos,
      email = EXCLUDED.email;
  `);

  console.log('Usuarios de prueba listos');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error al insertar usuarios:', err);
  process.exit(1);
});
