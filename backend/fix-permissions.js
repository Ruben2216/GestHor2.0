import { dbConnection } from './src/config/database.js';

async function fix() {
  // Add missing estudiante role
  await dbConnection.none(`
    INSERT INTO roles (nombre_rol, descripcion, activo, fecha_creacion)
    VALUES ('estudiante', 'Alumno: solo consulta horarios, materias, carreras, lugares y periodos', TRUE, NOW())
    ON CONFLICT (nombre_rol) DO UPDATE SET descripcion = EXCLUDED.descripcion, activo = EXCLUDED.activo
  `);
  console.log('estudiante role added/updated');

  // Update role descriptions
  await dbConnection.none(`UPDATE roles SET descripcion = 'Acceso total al sistema' WHERE nombre_rol = 'administrador'`);
  await dbConnection.none(`UPDATE roles SET descripcion = 'Editor: crea, modifica y elimina horarios, materias, carreras y lugares. No administra usuarios ni roles' WHERE nombre_rol = 'docente'`);
  await dbConnection.none(`UPDATE roles SET descripcion = 'Consulta su horario y materias; modifica solo su disponibilidad, preferencias y materias' WHERE nombre_rol = 'profesor'`);
  await dbConnection.none(`UPDATE roles SET descripcion = 'Alumno: solo consulta horarios, materias, carreras, lugares y periodos' WHERE nombre_rol = 'estudiante'`);
  console.log('Role descriptions updated');

  // Add missing permisos
  await dbConnection.none(`
    INSERT INTO permisos (clave, nombre, descripcion, activo) VALUES
    ('lugares:leer', 'Leer lugares', 'Permite ver lugares, edificios y salones', TRUE),
    ('lugares:crear', 'Crear lugares', 'Permite crear lugares, edificios y salones', TRUE),
    ('lugares:editar', 'Editar lugares', 'Permite modificar lugares, edificios y salones', TRUE),
    ('lugares:eliminar', 'Eliminar lugares', 'Permite eliminar lugares, edificios y salones', TRUE),
    ('periodos:leer', 'Leer periodos', 'Permite ver periodos academicos', TRUE),
    ('periodos:crear', 'Crear periodos', 'Permite crear periodos academicos', TRUE),
    ('periodos:editar', 'Editar periodos', 'Permite modificar periodos academicos', TRUE),
    ('periodos:eliminar', 'Eliminar periodos', 'Permite eliminar periodos academicos', TRUE)
    ON CONFLICT (clave) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, activo = TRUE
  `);
  console.log('Missing permisos added');

  // Clear and reassign rol_permisos for docente, profesor, estudiante
  await dbConnection.none(`DELETE FROM rol_permisos WHERE rol_id IN (SELECT rol_id FROM roles WHERE nombre_rol IN ('docente', 'profesor', 'estudiante'))`);
  console.log('Cleared old rol_permisos for docente, profesor, estudiante');

  // Admin: all perms
  await dbConnection.none(`
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.permiso_id
    FROM roles r CROSS JOIN permisos p
    WHERE r.nombre_rol = 'administrador'
    ON CONFLICT DO NOTHING
  `);
  console.log('Admin permissions assigned');

  // Docente (editor)
  await dbConnection.none(`
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.permiso_id
    FROM roles r JOIN permisos p ON p.clave IN (
      'horarios:leer', 'horarios:crear', 'horarios:editar', 'horarios:eliminar',
      'materias:leer', 'materias:crear', 'materias:editar', 'materias:eliminar',
      'carreras:leer', 'carreras:crear', 'carreras:editar', 'carreras:eliminar',
      'lugares:leer',  'lugares:crear',  'lugares:editar',  'lugares:eliminar',
      'periodos:leer',
      'docentes:leer'
    )
    WHERE r.nombre_rol = 'docente'
    ON CONFLICT DO NOTHING
  `);
  console.log('Docente permissions assigned');

  // Profesor
  await dbConnection.none(`
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.permiso_id
    FROM roles r JOIN permisos p ON p.clave IN (
      'horarios:leer', 'materias:leer', 'carreras:leer', 'lugares:leer', 'periodos:leer'
    )
    WHERE r.nombre_rol = 'profesor'
    ON CONFLICT DO NOTHING
  `);
  console.log('Profesor permissions assigned');

  // Estudiante
  await dbConnection.none(`
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.permiso_id
    FROM roles r JOIN permisos p ON p.clave IN (
      'horarios:leer', 'materias:leer', 'carreras:leer', 'lugares:leer', 'periodos:leer'
    )
    WHERE r.nombre_rol = 'estudiante'
    ON CONFLICT DO NOTHING
  `);
  console.log('Estudiante permissions assigned');

  console.log('Done!');
  process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });