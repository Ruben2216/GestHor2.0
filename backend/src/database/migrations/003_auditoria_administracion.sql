CREATE TABLE IF NOT EXISTS public.auditoria (
    auditoria_id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES public.usuarios(usuario_id) ON DELETE SET NULL,
    email VARCHAR(255),
    rol VARCHAR(50),
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    direccion_ip TEXT,
    accion VARCHAR(150) NOT NULL,
    resultado VARCHAR(20) NOT NULL,
    recurso VARCHAR(150) NOT NULL,
    metodo_http VARCHAR(10) NOT NULL,
    ruta TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha_hora
    ON public.auditoria (fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario
    ON public.auditoria (usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion
    ON public.auditoria (accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_recurso
    ON public.auditoria (recurso);

INSERT INTO public.permisos (clave, nombre, descripcion, activo)
VALUES
    ('roles:gestionar', 'Gestionar roles', 'Permite crear, editar y activar roles', TRUE),
    ('permisos:gestionar', 'Gestionar permisos', 'Permite asignar y revocar permisos por rol', TRUE),
    ('auditoria:leer', 'Consultar auditoría', 'Permite consultar el registro de auditoría', TRUE)
ON CONFLICT (clave) DO UPDATE
SET nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    activo = TRUE;

INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.rol_id, p.permiso_id
FROM public.roles r
CROSS JOIN public.permisos p
WHERE r.nombre_rol = 'administrador'
  AND p.clave IN ('roles:gestionar', 'permisos:gestionar', 'auditoria:leer')
ON CONFLICT DO NOTHING;
