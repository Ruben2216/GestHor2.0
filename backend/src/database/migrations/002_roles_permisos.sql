-- ============================================================================
-- MIGRACIÓN MÓDULO 2: ROLES, PERMISOS Y PROTECCIÓN DEL BACKEND
-- ============================================================================
-- Equivalencia con los roles:
--   administrador  -> administrador  (acceso total)
--   editor         -> docente        (crea, edita y elimina contenido; no administra usuarios)
--   alumno         -> estudiante     (solo consulta)
--   profesor       -> profesor       (consulta y modifica únicamente su propia información)
-- ============================================================================

-- ============================================================================
-- 1. DESCRIPCIÓN DE LOS ROLES
-- ============================================================================
UPDATE roles SET descripcion = 'Acceso total al sistema'
WHERE nombre_rol = 'administrador';

UPDATE roles SET descripcion = 'Editor: crea, modifica y elimina horarios, materias, carreras y lugares. No administra usuarios ni roles'
WHERE nombre_rol = 'docente';

UPDATE roles SET descripcion = 'Consulta su horario y materias; modifica solo su disponibilidad, preferencias y materias'
WHERE nombre_rol = 'profesor';

UPDATE roles SET descripcion = 'Alumno: solo consulta horarios, materias, carreras, lugares y periodos'
WHERE nombre_rol = 'estudiante';

-- ============================================================================
-- 2. PERMISOS PARA CATÁLOGOS QUE NO TENÍAN PERMISO PROPIO
-- ============================================================================
INSERT INTO permisos (clave, nombre, descripcion) VALUES
    ('lugares:leer',      'Leer lugares',      'Permite ver lugares, edificios y salones'),
    ('lugares:crear',     'Crear lugares',     'Permite crear lugares, edificios y salones'),
    ('lugares:editar',    'Editar lugares',    'Permite modificar lugares, edificios y salones'),
    ('lugares:eliminar',  'Eliminar lugares',  'Permite eliminar lugares, edificios y salones'),
    ('periodos:leer',     'Leer periodos',     'Permite ver periodos académicos'),
    ('periodos:crear',    'Crear periodos',    'Permite crear periodos académicos'),
    ('periodos:editar',   'Editar periodos',   'Permite modificar periodos académicos'),
    ('periodos:eliminar', 'Eliminar periodos', 'Permite eliminar periodos académicos')
ON CONFLICT (clave) DO NOTHING;

-- ============================================================================
-- 3. ASIGNACIÓN DE PERMISOS POR ROL
-- ============================================================================
DELETE FROM rol_permisos
WHERE rol_id IN (SELECT rol_id FROM roles WHERE nombre_rol IN ('docente', 'profesor', 'estudiante'));

-- Administrador: todos los permisos
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r CROSS JOIN permisos p
WHERE r.nombre_rol = 'administrador'
ON CONFLICT DO NOTHING;

-- Editor (docente)
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
ON CONFLICT DO NOTHING;

-- Profesor: solo lectura. Su propia disponibilidad, preferencias y materias
-- se autorizan en el backend comparando el profesorId con el usuario del token.
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r JOIN permisos p ON p.clave IN (
    'horarios:leer', 'materias:leer', 'carreras:leer', 'lugares:leer', 'periodos:leer'
)
WHERE r.nombre_rol = 'profesor'
ON CONFLICT DO NOTHING;

-- Alumno (estudiante): solo lectura
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r JOIN permisos p ON p.clave IN (
    'horarios:leer', 'materias:leer', 'carreras:leer', 'lugares:leer', 'periodos:leer'
)
WHERE r.nombre_rol = 'estudiante'
ON CONFLICT DO NOTHING;