-- ============================================================================
-- MIGRACIÓN MÓDULO 1: AUTENTICACIÓN Y AUTORIZACIÓN BASE
-- ============================================================================
-- Este script crea las tablas necesarias para el sistema de autenticación
-- con JWT (access + refresh tokens), recuperación de contraseña y sesiones.
-- Compatible con PostgreSQL 12+
-- ============================================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLA ROLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    rol_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar roles por defecto
INSERT INTO roles (nombre_rol, descripcion) VALUES
    ('administrador', 'Administrador del sistema con acceso completo'),
    ('editor', 'Editor: crea, modifica y elimina horarios, materias, carreras y lugares. No administra usuarios ni roles'),
    ('profesor', 'Profesor: consulta su horario y materias; modifica solo su disponibilidad, preferencias y materias'),
    ('estudiante', 'Estudiante: solo consulta horarios, materias, carreras, lugares y periodos')
ON CONFLICT (nombre_rol) DO NOTHING;

-- ============================================================================
-- 2. TABLA PERMISOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS permisos (
    permiso_id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- Insertar permisos base
INSERT INTO permisos (clave, nombre, descripcion) VALUES
    ('horarios:leer', 'Leer horarios', 'Permite consultar horarios'),
    ('horarios:crear', 'Crear horarios', 'Permite crear nuevos horarios'),
    ('horarios:editar', 'Editar horarios', 'Permite modificar horarios existentes'),
    ('horarios:eliminar', 'Eliminar horarios', 'Permite eliminar horarios'),
    ('editores:leer', 'Leer editores', 'Permite consultar lista de editores'),
    ('editores:crear', 'Crear editores', 'Permite registrar nuevos editores'),
    ('editores:editar', 'Editar editores', 'Permite modificar datos de editores'),
    ('editores:eliminar', 'Eliminar editores', 'Permite dar de baja editores'),
    ('materias:leer', 'Leer materias', 'Permite consultar materias'),
    ('materias:crear', 'Crear materias', 'Permite crear nuevas materias'),
    ('materias:editar', 'Editar materias', 'Permite modificar materias'),
    ('materias:eliminar', 'Eliminar materias', 'Permite eliminar materias'),
    ('usuarios:leer', 'Leer usuarios', 'Permite consultar usuarios'),
    ('usuarios:crear', 'Crear usuarios', 'Permite crear nuevos usuarios'),
    ('usuarios:editar', 'Editar usuarios', 'Permite modificar usuarios'),
    ('usuarios:eliminar', 'Eliminar usuarios', 'Permite eliminar usuarios'),
    ('roles:leer', 'Leer roles', 'Permite consultar roles'),
    ('roles:gestionar', 'Gestionar roles', 'Permite asignar y revocar roles'),
    ('permisos:leer', 'Leer permisos', 'Permite consultar permisos'),
    ('permisos:gestionar', 'Gestionar permisos', 'Permite asignar y revocar permisos'),
    ('auditoria:leer', 'Leer auditoría', 'Permite consultar logs de auditoría')
ON CONFLICT (clave) DO NOTHING;

-- ============================================================================
-- 3. TABLA RELACIÓN ROL-PERMISOS (N:M)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id INT NOT NULL REFERENCES roles(rol_id) ON DELETE CASCADE,
    permiso_id INT NOT NULL REFERENCES permisos(permiso_id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- Asignar permisos al rol administrador (todos)
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r, permisos p
WHERE r.nombre_rol = 'administrador'
ON CONFLICT DO NOTHING;

-- Asignar permisos básicos al rol editor
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r, permisos p
WHERE r.nombre_rol = 'editor'
  AND p.clave IN ('horarios:leer', 'horarios:crear', 'horarios:editar', 'editores:leer', 'materias:leer')
ON CONFLICT DO NOTHING;

-- Asignar permisos básicos al rol estudiante
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM roles r, permisos p
WHERE r.nombre_rol = 'estudiante'
  AND p.clave IN ('horarios:leer')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. ACTUALIZAR TABLA USUARIOS EXISTENTE
-- ============================================================================
-- Renombrar columna password a password_hash si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'password'
    ) THEN
        ALTER TABLE usuarios RENAME COLUMN password TO password_hash;
    END IF;
END $$;

-- Agregar columnas faltantes
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMPTZ NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE;

-- Asegurar que email sea único
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'usuarios' AND constraint_type = 'UNIQUE' AND constraint_name LIKE '%email%'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);
    END IF;
END $$;

-- ============================================================================
-- 5. TABLA REFRESH TOKENS
-- ============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    refresh_token_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    jti UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NULL,
    replaced_by_token_id INT NULL REFERENCES refresh_tokens(refresh_token_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT NULL,
    ip_origen TEXT NULL,
    dispositivo TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario ON refresh_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_jti ON refresh_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked_at) WHERE revoked_at IS NULL;

-- ============================================================================
-- 6. TABLA PASSWORD RESET TOKENS
-- ============================================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    reset_token_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- ============================================================================
-- 7. TABLA USER SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    access_jti UUID NOT NULL,
    refresh_jti UUID NOT NULL,
    ip_origen TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_usuario ON user_sessions(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_access_jti ON user_sessions(access_jti);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_jti ON user_sessions(refresh_jti);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON user_sessions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- ============================================================================
-- 8. FUNCIONES Y TRIGGERS DE LIMPIEZA AUTOMÁTICA
-- ============================================================================

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_auth_tokens()
RETURNS void AS $$
BEGIN
    -- Limpiar refresh tokens expirados hace más de 30 días
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() - INTERVAL '30 days';

    -- Limpiar password reset tokens expirados hace más de 7 días
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW() - INTERVAL '7 days';

    -- Marcar sesiones expiradas
    UPDATE user_sessions
    SET status = 'expired', revoked_at = NOW()
    WHERE expires_at < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar fecha_actualizacion en usuarios
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS trigger AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS trigger_usuarios_fecha_actualizacion ON usuarios;
CREATE TRIGGER trigger_usuarios_fecha_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- ============================================================================
-- 9. VISTA PARA CONSULTAR USUARIO CON ROL Y PERMISOS
-- ============================================================================
CREATE OR REPLACE VIEW vista_usuario_completo AS
SELECT
    u.usuario_id,
    u.email,
    u.nombre,
    u.activo,
    u.rol_id,
    r.nombre_rol,
    u.fecha_creacion,
    u.fecha_actualizacion,
    u.ultimo_login,
    u.email_verificado,
    COALESCE(
        json_agg(
            json_build_object(
                'permiso_id', p.permiso_id,
                'clave', p.clave,
                'nombre', p.nombre,
                'descripcion', p.descripcion
            )
        ) FILTER (WHERE p.permiso_id IS NOT NULL),
        '[]'::json
    ) AS permisos
FROM usuarios u
LEFT JOIN roles r ON r.rol_id = u.rol_id
LEFT JOIN rol_permisos rp ON rp.rol_id = r.rol_id
LEFT JOIN permisos p ON p.permiso_id = rp.permiso_id AND p.activo = TRUE
WHERE u.activo = TRUE AND r.activo = TRUE
GROUP BY u.usuario_id, r.rol_id;

-- ============================================================================
-- 10. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================
COMMENT ON TABLE roles IS 'Catálogo de roles del sistema';
COMMENT ON TABLE permisos IS 'Catálogo de permisos granulares';
COMMENT ON TABLE rol_permisos IS 'Relación N:M entre roles y permisos';
COMMENT ON TABLE refresh_tokens IS 'Tokens de refresco JWT con rotación y detección de reuso';
COMMENT ON TABLE password_reset_tokens IS 'Tokens temporales para recuperación de contraseña';
COMMENT ON TABLE user_sessions IS 'Registro de sesiones de usuario para auditoría';
COMMENT ON VIEW vista_usuario_completo IS 'Vista consolidada de usuario con rol y permisos';

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================