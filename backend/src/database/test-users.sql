-- ============================================================================
-- USUARIOS DE PRUEBA PARA DESARROLLO
-- ============================================================================
-- Ejecutar en base de datos de DESARROLLO únicamente
-- NO usar en producción
-- Requiere: ejecutarFinal.sql, 001_auth_module.sql y 002_roles_permisos.sql
-- ============================================================================

-- Hash bcrypt de ejemplo para desarrollo local (Reemplazar según políticas del entorno)
-- La columna legacy "password" es NOT NULL en ejecutarFinal.sql, por eso se llena con el mismo hash.

INSERT INTO usuarios (email, password, password_hash, nombre, rol_id, activo, fecha_creacion, email_verificado)
SELECT v.email, h.hash, h.hash, v.nombre, r.rol_id, TRUE, NOW(), TRUE
FROM (VALUES
    ('test.admin@unach.mx',      'Test Admin',      'administrador'),
    ('test.editor@unach.mx',     'Test Editor',     'docente'),
    ('test.profe@unach.mx',      'Test Profesor',   'profesor'),
    ('test.estudiante@unach.mx', 'Test Estudiante', 'estudiante')
) AS v(email, nombre, nombre_rol)
CROSS JOIN (SELECT '$2b$12$QPIlb.vUezYMbU2dwkyCCObzYsp/KqVvxiG6jJBS2374p4rfnSVWC'::varchar) AS h(hash)
JOIN roles r ON r.nombre_rol = v.nombre_rol
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    password_hash = EXCLUDED.password_hash,
    nombre = EXCLUDED.nombre,
    rol_id = EXCLUDED.rol_id,
    activo = EXCLUDED.activo,
    email_verificado = EXCLUDED.email_verificado;

-- El profesor de prueba necesita su registro en "profesores" (profesor_id = usuario_id)
INSERT INTO profesores (profesor_id, nombres, apellidos, matricula, email)
SELECT usuario_id, 'Test', 'Profesor', 'TEST-0001', email
FROM usuarios
WHERE email = 'test.profe@unach.mx'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- USUARIOS DE PRUEBA REGISTRADOS
-- ============================================================================
-- Email: test.admin@unach.mx        | Rol: administrador
-- Email: test.editor@unach.mx       | Rol: docente (editor)
-- Email: test.profe@unach.mx        | Rol: profesor
-- Email: test.estudiante@unach.mx   | Rol: estudiante (alumno)
-- ============================================================================
