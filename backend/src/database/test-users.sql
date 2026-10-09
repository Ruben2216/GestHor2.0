-- ============================================================================
-- USUARIOS DE PRUEBA PARA DESARROLLO
-- ============================================================================
-- Ejecutar en base de datos de DESARROLLO únicamente
-- NO usar en producción
-- ============================================================================

-- Mismo hash bcrypt de desarrollo que traen los usuarios de prueba en ejecutarFinal.sql
-- (la contraseña se configura en TEST_USER_PASSWORD de backend/.env)

INSERT INTO usuarios (email, password_hash, nombre, rol_id, activo, fecha_creacion, email_verificado)
SELECT v.email, h.hash, v.nombre, r.rol_id, TRUE, NOW(), TRUE
FROM (VALUES
    ('test.admin@unach.mx',      'Test Administrador', 'administrador'),
    ('test.editor@unach.mx',     'Test Editor',        'editor'),
    ('test.profe@unach.mx',      'Test Profesor',      'profesor'),
    ('test.estudiante@unach.mx', 'Test Estudiante',    'estudiante')
) AS v(email, nombre, nombre_rol)
CROSS JOIN (SELECT '$2b$10$IAXr/wbQBhY0zs1yDVlM1ezfeAi9dYmfDjAPs3y8iMcBE9p/peOJW'::varchar) AS h(hash)
JOIN roles r ON r.nombre_rol = v.nombre_rol
ON CONFLICT (email) DO UPDATE SET
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
-- Email: test.editor@unach.mx       | Rol: editor
-- Email: test.profe@unach.mx        | Rol: profesor
-- Email: test.estudiante@unach.mx   | Rol: estudiante (alumno)
-- ============================================================================
