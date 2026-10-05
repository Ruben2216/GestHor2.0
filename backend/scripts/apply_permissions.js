import { dbConnection } from '../src/config/database.js';

async function applyPermissions() {
  console.log('Aplicando permisos en la base de datos...');

  // 1. Insertar todos los permisos requeridos
  await dbConnection.none(`
    INSERT INTO permisos (clave, nombre, descripcion) VALUES
      ('docentes:leer',      'Leer docentes',      'Permite ver informacion de docentes'),
      ('docentes:crear',     'Crear docentes',     'Permite registrar nuevos docentes'),
      ('docentes:editar',    'Editar docentes',    'Permite modificar datos de docentes'),
      ('docentes:eliminar',  'Eliminar docentes',  'Permite eliminar docentes'),
      ('lugares:leer',       'Leer lugares',       'Permite ver lugares, edificios y salones'),
      ('lugares:crear',      'Crear lugares',      'Permite crear lugares, edificios y salones'),
      ('lugares:editar',     'Editar lugares',     'Permite modificar lugares, edificios y salones'),
      ('lugares:eliminar',   'Eliminar lugares',   'Permite eliminar lugares, edificios y salones'),
      ('periodos:leer',      'Leer periodos',      'Permite ver periodos academicos'),
      ('periodos:crear',     'Crear periodos',     'Permite crear periodos academicos'),
      ('periodos:editar',    'Editar periodos',    'Permite modificar periodos academicos'),
      ('periodos:eliminar',  'Eliminar periodos',  'Permite eliminar periodos academicos')
    ON CONFLICT (clave) DO NOTHING;
  `);

  // 2. Administrador: todos los permisos
  await dbConnection.none(`
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.permiso_id
    FROM roles r CROSS JOIN permisos p
    WHERE r.nombre_rol = 'administrador'
    ON CONFLICT DO NOTHING;
  `);

  // 3. Editor (docente)
  await dbConnection.none(`
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.permiso_id
    FROM roles r JOIN permisos p ON p.clave IN (
      'horarios:leer', 'horarios:crear', 'horarios:editar', 'horarios:eliminar',
      'materias:leer', 'materias:crear', 'materias:editar', 'materias:eliminar',
      'carreras:leer', 'carreras:crear', 'carreras:editar', 'carreras:eliminar',
      'lugares:leer',  'lugares:crear',  'lugares:editar',  'lugares:eliminar',
      'periodos:leer',
      'docentes:leer', 'docentes:crear', 'docentes:editar'
    )
    WHERE r.nombre_rol = 'docente'
    ON CONFLICT DO NOTHING;
  `);

  // 4. Profesor
  await dbConnection.none(`
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.permiso_id
    FROM roles r JOIN permisos p ON p.clave IN (
      'horarios:leer', 'materias:leer', 'carreras:leer', 'lugares:leer', 'periodos:leer', 'docentes:leer'
    )
    WHERE r.nombre_rol = 'profesor'
    ON CONFLICT DO NOTHING;
  `);

  // 5. Alumno (estudiante)
  await dbConnection.none(`
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.permiso_id
    FROM roles r JOIN permisos p ON p.clave IN (
      'horarios:leer', 'materias:leer', 'carreras:leer', 'lugares:leer', 'periodos:leer'
    )
    WHERE r.nombre_rol = 'estudiante'
    ON CONFLICT DO NOTHING;
  `);

  console.log('Permisos aplicados correctamente');
  process.exit(0);
}

applyPermissions().catch(err => {
  console.error('Error aplicando permisos:', err);
  process.exit(1);
});
