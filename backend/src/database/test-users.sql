-- ============================================================================
-- USUARIOS DE PRUEBA PARA DESARROLLO
-- ============================================================================
-- Ejecutar en base de datos de DESARROLLO únicamente
-- NO usar en producción
-- ============================================================================

-- Contraseña para todos los usuarios de prueba: test1234
-- Hash bcrypt (12 rounds): $2b$12$QPIlb.vUezYMbU2dwkyCCObzYsp/KqVvxiG6jJBS2374p4rfnSVWC

-- Verificar/obtener rol_id de administrador y profesor
-- INSERT solo si no existe (evita duplicados)

-- Usuario de prueba: Administrador
INSERT INTO usuarios (email, password_hash, nombre, rol_id, activo, fecha_creacion, email_verificado)
VALUES (
    'test.admin@unach.mx',
    '$2b$12$QPIlb.vUezYMbU2dwkyCCObzYsp/KqVvxiG6jJBS2374p4rfnSVWC',  -- test1234
    'Test Admin',
    (SELECT rol_id FROM roles WHERE nombre_rol = 'administrador' LIMIT 1),
    TRUE,
    NOW(),
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    nombre = EXCLUDED.nombre,
    rol_id = EXCLUDED.rol_id,
    activo = EXCLUDED.activo,
    email_verificado = EXCLUDED.email_verificado;

-- Usuario de prueba: Profesor
INSERT INTO usuarios (email, password_hash, nombre, rol_id, activo, fecha_creacion, email_verificado)
VALUES (
    'test.profe@unach.mx',
    '$2b$12$QPIlb.vUezYMbU2dwkyCCObzYsp/KqVvxiG6jJBS2374p4rfnSVWC',  -- test1234
    'Test Profesor',
    (SELECT rol_id FROM roles WHERE nombre_rol = 'profesor' LIMIT 1),
    TRUE,
    NOW(),
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    nombre = EXCLUDED.nombre,
    rol_id = EXCLUDED.rol_id,
    activo = EXCLUDED.activo,
    email_verificado = EXCLUDED.email_verificado;

-- Usuario de prueba: Estudiante (si existe rol estudiante)
INSERT INTO usuarios (email, password_hash, nombre, rol_id, activo, fecha_creacion, email_verificado)
VALUES (
    'test.estudiante@unach.mx',
    '$2b$12$QPIlb.vUezYMbU2dwkyCCObzYsp/KqVvxiG6jJBS2374p4rfnSVWC',  -- test1234
    'Test Estudiante',
    (SELECT rol_id FROM roles WHERE nombre_rol = 'estudiante' LIMIT 1),
    TRUE,
    NOW(),
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    nombre = EXCLUDED.nombre,
    rol_id = EXCLUDED.rol_id,
    activo = EXCLUDED.activo,
    email_verificado = EXCLUDED.email_verificado;

-- ============================================================================
-- CREDENCIALES DE PRUEBA
-- ============================================================================
-- Email: test.admin@unach.mx        | Password: test1234 | Rol: administrador
-- Email: test.profe@unach.mx        | Password: test1234 | Rol: profesor
-- Email: test.estudiante@unach.mx   | Password: test1234 | Rol: estudiante (si existe)
-- ============================================================================