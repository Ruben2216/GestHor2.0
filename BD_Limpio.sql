-- ============================================================================
--  GestHor - BD_Limpio.sql
--  Copia LIMPIA: SOLO estructura, sin ningun dato.
--
--  SCRIPT AUTONOMO: crea la base de datos "GestHor" y la deja lista en un
--  solo paso. No hace falta crear la BD ni ejecutar nada mas antes.
--
--  USO EN UBUNTU SERVER:
--      sudo -u postgres psql -f BD_Limpio.sql
--  (o bien: psql -U postgres -d postgres -f BD_Limpio.sql)
--
--  ATENCION: si la base de datos "GestHor" YA EXISTE en el servidor, este
--  script la ELIMINA y la vuelve a crear desde cero con el contenido aqui
--  incluido. No lo ejecutes sobre una BD con datos que quieras conservar.
--
--  Contenido: Incluye tablas, funciones, triggers, indices, llaves y secuencias, pero con las tablas vacias.
--  Generado: 2026-11-12 desde PostgreSQL 17.5, base GestHor.
--  Compatible con PostgreSQL 13 o superior (probado en 17).
-- ============================================================================

\set ON_ERROR_STOP on

\connect postgres

DROP DATABASE IF EXISTS "GestHor" WITH (FORCE);

CREATE DATABASE "GestHor"
    WITH TEMPLATE = template0
         ENCODING = 'UTF8'
         LOCALE = 'C';

\connect "GestHor"

-- ============================================================================
--  VOLCADO DE LA BASE DE DATOS (pg_dump)
-- ============================================================================
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cleanup_expired_auth_tokens(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_auth_tokens() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
    DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '7 days';
    UPDATE user_sessions SET status = 'expired', revoked_at = NOW()
    WHERE expires_at < NOW() AND status = 'active';
END; $$;


--
-- Name: update_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END; $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actividades_solicitudes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actividades_solicitudes (
    actividad_id integer NOT NULL,
    solicitud_id integer NOT NULL,
    tipo_actividad character varying(50) NOT NULL,
    descripcion text NOT NULL,
    fecha_actividad timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_tipo_actividad CHECK (((tipo_actividad)::text = ANY (ARRAY[('PASSWORD_GENERADO'::character varying)::text, ('CONTACTO_ENVIADO'::character varying)::text, ('SOLICITUD_CREADA'::character varying)::text, ('SOLICITUD_RESUELTA'::character varying)::text])))
);


--
-- Name: actividades_solicitudes_actividad_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.actividades_solicitudes_actividad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: actividades_solicitudes_actividad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.actividades_solicitudes_actividad_id_seq OWNED BY public.actividades_solicitudes.actividad_id;


--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria (
    auditoria_id bigint NOT NULL,
    usuario_id integer,
    email character varying(255),
    rol character varying(50),
    fecha_hora timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    direccion_ip text,
    accion character varying(150) NOT NULL,
    resultado character varying(20) NOT NULL,
    recurso character varying(150) NOT NULL,
    metodo_http character varying(10) NOT NULL,
    ruta text NOT NULL
);


--
-- Name: auditoria_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auditoria_auditoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auditoria_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auditoria_auditoria_id_seq OWNED BY public.auditoria.auditoria_id;


--
-- Name: carrera_materias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrera_materias (
    carrera_id integer NOT NULL,
    materia_id integer NOT NULL,
    numero_semestre integer NOT NULL,
    CONSTRAINT check_semestre_positivo CHECK ((numero_semestre > 0))
);


--
-- Name: carreras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carreras (
    carrera_id integer NOT NULL,
    nombre_carrera character varying(255) NOT NULL,
    total_semestres integer NOT NULL
);


--
-- Name: carreras_carrera_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carreras_carrera_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carreras_carrera_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carreras_carrera_id_seq OWNED BY public.carreras.carrera_id;


--
-- Name: edificios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.edificios (
    edificio_id integer NOT NULL,
    lugar_id integer,
    nombre_edificio text,
    tipo_edificio text
);


--
-- Name: edificios_edificio_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.edificios_edificio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edificios_edificio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.edificios_edificio_id_seq OWNED BY public.edificios.edificio_id;


--
-- Name: horarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.horarios (
    horario_id integer NOT NULL,
    profesor_id integer NOT NULL,
    materia_id integer NOT NULL,
    salon_id integer NOT NULL,
    dia_semana character varying(10) NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    id_periodo integer
);


--
-- Name: horarios_horario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.horarios_horario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: horarios_horario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.horarios_horario_id_seq OWNED BY public.horarios.horario_id;


--
-- Name: lugares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lugares (
    lugar_id integer NOT NULL,
    nombre_lugar text,
    tipo_lugar text
);


--
-- Name: lugares_lugar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lugares_lugar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lugares_lugar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lugares_lugar_id_seq OWNED BY public.lugares.lugar_id;


--
-- Name: materias_catalogo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materias_catalogo (
    materia_id integer NOT NULL,
    nombre_materia character varying(255) NOT NULL
);


--
-- Name: materias_catalogo_materia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.materias_catalogo_materia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: materias_catalogo_materia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.materias_catalogo_materia_id_seq OWNED BY public.materias_catalogo.materia_id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    reset_token_id integer NOT NULL,
    usuario_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    revoked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE password_reset_tokens; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.password_reset_tokens IS 'Tokens temporales para recuperación de contraseña';


--
-- Name: password_reset_tokens_reset_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_reset_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_reset_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_reset_token_id_seq OWNED BY public.password_reset_tokens.reset_token_id;


--
-- Name: periodos_academicos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.periodos_academicos (
    id_periodo integer NOT NULL,
    nombre character varying(100) NOT NULL,
    fecha_inicio date,
    fecha_fin date
);


--
-- Name: periodos_academicos_id_periodo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.periodos_academicos_id_periodo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: periodos_academicos_id_periodo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.periodos_academicos_id_periodo_seq OWNED BY public.periodos_academicos.id_periodo;


--
-- Name: permisos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permisos (
    permiso_id integer NOT NULL,
    clave character varying(100) NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);


--
-- Name: TABLE permisos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.permisos IS 'Catálogo de permisos granulares';


--
-- Name: permisos_permiso_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permisos_permiso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permisos_permiso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permisos_permiso_id_seq OWNED BY public.permisos.permiso_id;


--
-- Name: profesor_disponibilidad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profesor_disponibilidad (
    disponibilidad_id integer NOT NULL,
    profesor_id integer NOT NULL,
    dia_semana character varying(10) NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    activo boolean DEFAULT true,
    turno character varying(20),
    id_periodo integer,
    CONSTRAINT check_horario_valido CHECK ((hora_fin > hora_inicio)),
    CONSTRAINT profesor_disponibilidad_turno_check CHECK (((turno)::text = ANY (ARRAY[('matutino'::character varying)::text, ('vespertino'::character varying)::text, ('nocturno'::character varying)::text])))
);


--
-- Name: profesor_disponibilidad_disponibilidad_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profesor_disponibilidad_disponibilidad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profesor_disponibilidad_disponibilidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profesor_disponibilidad_disponibilidad_id_seq OWNED BY public.profesor_disponibilidad.disponibilidad_id;


--
-- Name: profesor_materias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profesor_materias (
    profesor_id integer NOT NULL,
    materia_id integer NOT NULL
);


--
-- Name: profesor_preferencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profesor_preferencias (
    preferencia_id integer NOT NULL,
    profesor_id integer NOT NULL,
    max_horas_dia integer DEFAULT 8,
    preferencia_horario character varying(20) DEFAULT 'Mixto'::character varying,
    comentarios_adicionales text
);


--
-- Name: profesor_preferencias_preferencia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profesor_preferencias_preferencia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profesor_preferencias_preferencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profesor_preferencias_preferencia_id_seq OWNED BY public.profesor_preferencias.preferencia_id;


--
-- Name: profesores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profesores (
    profesor_id integer NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    matricula character varying(50) NOT NULL,
    grado_academico character varying(255),
    numero_plaza character varying(50),
    numero_contrato character varying(50),
    direccion text,
    telefono character varying(20),
    email character varying,
    tipo_contrato_id integer
);


--
-- Name: COLUMN profesores.tipo_contrato_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profesores.tipo_contrato_id IS 'Referencia al tipo de contrato del docente, que define su prioridad de asignación.';


--
-- Name: profesores_profesor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profesores_profesor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profesores_profesor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profesores_profesor_id_seq OWNED BY public.profesores.profesor_id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    refresh_token_id integer NOT NULL,
    usuario_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    jti uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    replaced_by_token_id integer,
    created_at timestamp with time zone DEFAULT now(),
    user_agent text,
    ip_origen text,
    dispositivo text
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.refresh_tokens IS 'Tokens de refresco JWT con rotación y detección de reuso';


--
-- Name: refresh_tokens_refresh_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_refresh_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_refresh_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_refresh_token_id_seq OWNED BY public.refresh_tokens.refresh_token_id;


--
-- Name: rol_permisos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rol_permisos (
    rol_id integer NOT NULL,
    permiso_id integer NOT NULL
);


--
-- Name: TABLE rol_permisos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.rol_permisos IS 'Relación N:M entre roles y permisos';


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    rol_id integer NOT NULL,
    nombre_rol character varying(50) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true,
    fecha_creacion timestamp with time zone DEFAULT now()
);


--
-- Name: roles_rol_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_rol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_rol_id_seq OWNED BY public.roles.rol_id;


--
-- Name: salones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salones (
    salon_id integer NOT NULL,
    edificio_id integer,
    nombre_salon text,
    tipo_salon text
);


--
-- Name: salones_salon_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.salones_salon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: salones_salon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.salones_salon_id_seq OWNED BY public.salones.salon_id;


--
-- Name: solicitudes_recuperacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes_recuperacion (
    solicitud_id integer NOT NULL,
    usuario_id integer NOT NULL,
    motivo text NOT NULL,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_resolucion timestamp without time zone,
    CONSTRAINT chk_estado CHECK (((estado)::text = ANY (ARRAY[('PENDIENTE'::character varying)::text, ('RESUELTA'::character varying)::text])))
);


--
-- Name: solicitudes_recuperacion_solicitud_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_recuperacion_solicitud_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_recuperacion_solicitud_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_recuperacion_solicitud_id_seq OWNED BY public.solicitudes_recuperacion.solicitud_id;


--
-- Name: tipos_contrato; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_contrato (
    tipo_contrato_id integer NOT NULL,
    nombre_tipo character varying(100) NOT NULL,
    nivel_prioridad integer NOT NULL,
    descripcion text
);


--
-- Name: TABLE tipos_contrato; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tipos_contrato IS 'Catálogo de tipos de contrato para docentes (ej. Tiempo Completo, Por Asignatura).';


--
-- Name: COLUMN tipos_contrato.nivel_prioridad; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tipos_contrato.nivel_prioridad IS 'Nivel de prioridad para asignación. Un número menor indica mayor prioridad (ej. 1 es más alto que 2).';


--
-- Name: tipos_contrato_tipo_contrato_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_contrato_tipo_contrato_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipos_contrato_tipo_contrato_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_contrato_tipo_contrato_id_seq OWNED BY public.tipos_contrato.tipo_contrato_id;


--
-- Name: tokens_auth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tokens_auth (
    token_id integer NOT NULL,
    usuario_id integer NOT NULL,
    token character varying(255) NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tokens_auth_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tokens_auth_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tokens_auth_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tokens_auth_token_id_seq OWNED BY public.tokens_auth.token_id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    session_id integer NOT NULL,
    usuario_id integer NOT NULL,
    access_jti uuid NOT NULL,
    refresh_jti uuid NOT NULL,
    ip_origen text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    revoked_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT user_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'revoked'::character varying, 'expired'::character varying])::text[])))
);


--
-- Name: TABLE user_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_sessions IS 'Registro de sesiones de usuario para auditoría';


--
-- Name: user_sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_sessions_session_id_seq OWNED BY public.user_sessions.session_id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    usuario_id integer NOT NULL,
    email character varying(255) NOT NULL,
    rol_id integer NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    password_hash character varying(255),
    nombre character varying(150),
    activo boolean DEFAULT true,
    fecha_actualizacion timestamp with time zone DEFAULT now(),
    ultimo_login timestamp with time zone,
    email_verificado boolean DEFAULT false
);


--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_usuario_id_seq OWNED BY public.usuarios.usuario_id;


--
-- Name: actividades_solicitudes actividad_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades_solicitudes ALTER COLUMN actividad_id SET DEFAULT nextval('public.actividades_solicitudes_actividad_id_seq'::regclass);


--
-- Name: auditoria auditoria_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN auditoria_id SET DEFAULT nextval('public.auditoria_auditoria_id_seq'::regclass);


--
-- Name: carreras carrera_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carreras ALTER COLUMN carrera_id SET DEFAULT nextval('public.carreras_carrera_id_seq'::regclass);


--
-- Name: edificios edificio_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edificios ALTER COLUMN edificio_id SET DEFAULT nextval('public.edificios_edificio_id_seq'::regclass);


--
-- Name: horarios horario_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios ALTER COLUMN horario_id SET DEFAULT nextval('public.horarios_horario_id_seq'::regclass);


--
-- Name: lugares lugar_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares ALTER COLUMN lugar_id SET DEFAULT nextval('public.lugares_lugar_id_seq'::regclass);


--
-- Name: materias_catalogo materia_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materias_catalogo ALTER COLUMN materia_id SET DEFAULT nextval('public.materias_catalogo_materia_id_seq'::regclass);


--
-- Name: password_reset_tokens reset_token_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN reset_token_id SET DEFAULT nextval('public.password_reset_tokens_reset_token_id_seq'::regclass);


--
-- Name: periodos_academicos id_periodo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodos_academicos ALTER COLUMN id_periodo SET DEFAULT nextval('public.periodos_academicos_id_periodo_seq'::regclass);


--
-- Name: permisos permiso_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos ALTER COLUMN permiso_id SET DEFAULT nextval('public.permisos_permiso_id_seq'::regclass);


--
-- Name: profesor_disponibilidad disponibilidad_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_disponibilidad ALTER COLUMN disponibilidad_id SET DEFAULT nextval('public.profesor_disponibilidad_disponibilidad_id_seq'::regclass);


--
-- Name: profesor_preferencias preferencia_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_preferencias ALTER COLUMN preferencia_id SET DEFAULT nextval('public.profesor_preferencias_preferencia_id_seq'::regclass);


--
-- Name: profesores profesor_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesores ALTER COLUMN profesor_id SET DEFAULT nextval('public.profesores_profesor_id_seq'::regclass);


--
-- Name: refresh_tokens refresh_token_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN refresh_token_id SET DEFAULT nextval('public.refresh_tokens_refresh_token_id_seq'::regclass);


--
-- Name: roles rol_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN rol_id SET DEFAULT nextval('public.roles_rol_id_seq'::regclass);


--
-- Name: salones salon_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salones ALTER COLUMN salon_id SET DEFAULT nextval('public.salones_salon_id_seq'::regclass);


--
-- Name: solicitudes_recuperacion solicitud_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_recuperacion ALTER COLUMN solicitud_id SET DEFAULT nextval('public.solicitudes_recuperacion_solicitud_id_seq'::regclass);


--
-- Name: tipos_contrato tipo_contrato_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_contrato ALTER COLUMN tipo_contrato_id SET DEFAULT nextval('public.tipos_contrato_tipo_contrato_id_seq'::regclass);


--
-- Name: tokens_auth token_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens_auth ALTER COLUMN token_id SET DEFAULT nextval('public.tokens_auth_token_id_seq'::regclass);


--
-- Name: user_sessions session_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN session_id SET DEFAULT nextval('public.user_sessions_session_id_seq'::regclass);


--
-- Name: usuarios usuario_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN usuario_id SET DEFAULT nextval('public.usuarios_usuario_id_seq'::regclass);


--
-- Name: actividades_solicitudes actividades_solicitudes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades_solicitudes
    ADD CONSTRAINT actividades_solicitudes_pkey PRIMARY KEY (actividad_id);


--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (auditoria_id);


--
-- Name: carrera_materias carrera_materias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_pkey PRIMARY KEY (carrera_id, materia_id, numero_semestre);


--
-- Name: carreras carreras_nombre_carrera_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carreras
    ADD CONSTRAINT carreras_nombre_carrera_key UNIQUE (nombre_carrera);


--
-- Name: carreras carreras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carreras
    ADD CONSTRAINT carreras_pkey PRIMARY KEY (carrera_id);


--
-- Name: edificios edificios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edificios
    ADD CONSTRAINT edificios_pkey PRIMARY KEY (edificio_id);


--
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (horario_id);


--
-- Name: lugares lugares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares
    ADD CONSTRAINT lugares_pkey PRIMARY KEY (lugar_id);


--
-- Name: materias_catalogo materias_catalogo_nombre_materia_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materias_catalogo
    ADD CONSTRAINT materias_catalogo_nombre_materia_key UNIQUE (nombre_materia);


--
-- Name: materias_catalogo materias_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materias_catalogo
    ADD CONSTRAINT materias_catalogo_pkey PRIMARY KEY (materia_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (reset_token_id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: periodos_academicos periodos_academicos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodos_academicos
    ADD CONSTRAINT periodos_academicos_nombre_key UNIQUE (nombre);


--
-- Name: periodos_academicos periodos_academicos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodos_academicos
    ADD CONSTRAINT periodos_academicos_pkey PRIMARY KEY (id_periodo);


--
-- Name: permisos permisos_clave_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_clave_key UNIQUE (clave);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (permiso_id);


--
-- Name: profesor_disponibilidad profesor_disponibilidad_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT profesor_disponibilidad_pkey PRIMARY KEY (disponibilidad_id);


--
-- Name: profesor_materias profesor_materias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT profesor_materias_pkey PRIMARY KEY (profesor_id, materia_id);


--
-- Name: profesor_preferencias profesor_preferencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_pkey PRIMARY KEY (preferencia_id);


--
-- Name: profesor_preferencias profesor_preferencias_profesor_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_profesor_id_key UNIQUE (profesor_id);


--
-- Name: profesores profesores_matricula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_matricula_key UNIQUE (matricula);


--
-- Name: profesores profesores_numero_contrato_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_numero_contrato_key UNIQUE (numero_contrato);


--
-- Name: profesores profesores_numero_plaza_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_numero_plaza_key UNIQUE (numero_plaza);


--
-- Name: profesores profesores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_pkey PRIMARY KEY (profesor_id);


--
-- Name: refresh_tokens refresh_tokens_jti_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_jti_key UNIQUE (jti);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (refresh_token_id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: rol_permisos rol_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_pkey PRIMARY KEY (rol_id, permiso_id);


--
-- Name: roles roles_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (rol_id);


--
-- Name: salones salones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salones
    ADD CONSTRAINT salones_pkey PRIMARY KEY (salon_id);


--
-- Name: solicitudes_recuperacion solicitudes_recuperacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_recuperacion
    ADD CONSTRAINT solicitudes_recuperacion_pkey PRIMARY KEY (solicitud_id);


--
-- Name: tipos_contrato tipos_contrato_nivel_prioridad_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_nivel_prioridad_key UNIQUE (nivel_prioridad);


--
-- Name: tipos_contrato tipos_contrato_nombre_tipo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_nombre_tipo_key UNIQUE (nombre_tipo);


--
-- Name: tipos_contrato tipos_contrato_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_pkey PRIMARY KEY (tipo_contrato_id);


--
-- Name: tokens_auth tokens_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT tokens_auth_pkey PRIMARY KEY (token_id);


--
-- Name: tokens_auth tokens_auth_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT tokens_auth_token_key UNIQUE (token);


--
-- Name: profesor_disponibilidad uq_disponibilidad_profesor_periodo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT uq_disponibilidad_profesor_periodo UNIQUE (profesor_id, dia_semana, hora_inicio, id_periodo);


--
-- Name: horarios uq_horario_profesor_periodo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_horario_profesor_periodo UNIQUE (profesor_id, dia_semana, hora_inicio, id_periodo);


--
-- Name: horarios uq_horario_salon_periodo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_horario_salon_periodo UNIQUE (salon_id, dia_semana, hora_inicio, id_periodo);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario_id);


--
-- Name: idx_actividades_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_actividades_fecha ON public.actividades_solicitudes USING btree (fecha_actividad DESC);


--
-- Name: idx_actividades_solicitud; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_actividades_solicitud ON public.actividades_solicitudes USING btree (solicitud_id);


--
-- Name: idx_actividades_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_actividades_tipo ON public.actividades_solicitudes USING btree (tipo_actividad);


--
-- Name: idx_auditoria_accion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditoria_accion ON public.auditoria USING btree (accion);


--
-- Name: idx_auditoria_fecha_hora; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditoria_fecha_hora ON public.auditoria USING btree (fecha_hora DESC);


--
-- Name: idx_auditoria_recurso; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditoria_recurso ON public.auditoria USING btree (recurso);


--
-- Name: idx_auditoria_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditoria_usuario ON public.auditoria USING btree (usuario_id);


--
-- Name: idx_password_reset_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_reset_expires ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_reset_token_hash ON public.password_reset_tokens USING btree (token_hash);


--
-- Name: idx_password_reset_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_reset_usuario ON public.password_reset_tokens USING btree (usuario_id);


--
-- Name: idx_pwd_reset_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pwd_reset_expires ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_pwd_reset_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pwd_reset_usuario ON public.password_reset_tokens USING btree (usuario_id);


--
-- Name: idx_refresh_tokens_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_expires ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_refresh_tokens_jti; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_jti ON public.refresh_tokens USING btree (jti);


--
-- Name: idx_refresh_tokens_revoked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_revoked ON public.refresh_tokens USING btree (revoked_at) WHERE (revoked_at IS NULL);


--
-- Name: idx_refresh_tokens_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_usuario ON public.refresh_tokens USING btree (usuario_id);


--
-- Name: idx_sessions_access_jti; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_access_jti ON public.user_sessions USING btree (access_jti);


--
-- Name: idx_sessions_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_expires ON public.user_sessions USING btree (expires_at);


--
-- Name: idx_sessions_refresh_jti; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_refresh_jti ON public.user_sessions USING btree (refresh_jti);


--
-- Name: idx_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_status ON public.user_sessions USING btree (status);


--
-- Name: idx_sessions_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_usuario ON public.user_sessions USING btree (usuario_id);


--
-- Name: idx_solicitudes_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitudes_estado ON public.solicitudes_recuperacion USING btree (estado);


--
-- Name: idx_solicitudes_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitudes_fecha ON public.solicitudes_recuperacion USING btree (fecha_solicitud DESC);


--
-- Name: idx_solicitudes_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitudes_usuario ON public.solicitudes_recuperacion USING btree (usuario_id);


--
-- Name: usuarios trigger_usuarios_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_usuarios_fecha_actualizacion BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_fecha_actualizacion();


--
-- Name: auditoria auditoria_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE SET NULL;


--
-- Name: carrera_materias carrera_materias_carrera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_carrera_id_fkey FOREIGN KEY (carrera_id) REFERENCES public.carreras(carrera_id) ON DELETE CASCADE;


--
-- Name: carrera_materias carrera_materias_materia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- Name: edificios edificios_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edificios
    ADD CONSTRAINT edificios_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares(lugar_id);


--
-- Name: profesor_disponibilidad fk_disponibilidad_periodo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT fk_disponibilidad_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodos_academicos(id_periodo);


--
-- Name: horarios fk_horario_periodo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_horario_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodos_academicos(id_periodo);


--
-- Name: horarios fk_materia_horario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_materia_horario FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- Name: profesor_materias fk_materia_preferencia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT fk_materia_preferencia FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- Name: profesor_disponibilidad fk_profesor_disponibilidad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT fk_profesor_disponibilidad FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- Name: horarios fk_profesor_horario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_profesor_horario FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- Name: profesor_materias fk_profesor_preferencia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT fk_profesor_preferencia FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- Name: usuarios fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id) ON DELETE RESTRICT;


--
-- Name: actividades_solicitudes fk_solicitud; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades_solicitudes
    ADD CONSTRAINT fk_solicitud FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_recuperacion(solicitud_id) ON DELETE CASCADE;


--
-- Name: profesores fk_tipo_contrato; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT fk_tipo_contrato FOREIGN KEY (tipo_contrato_id) REFERENCES public.tipos_contrato(tipo_contrato_id) ON DELETE SET NULL;


--
-- Name: solicitudes_recuperacion fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_recuperacion
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: profesores fk_usuario_profesor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT fk_usuario_profesor FOREIGN KEY (profesor_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: tokens_auth fk_usuario_token; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT fk_usuario_token FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: profesor_preferencias profesor_preferencias_profesor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_replaced_by_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_replaced_by_token_id_fkey FOREIGN KEY (replaced_by_token_id) REFERENCES public.refresh_tokens(refresh_token_id);


--
-- Name: refresh_tokens refresh_tokens_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: rol_permisos rol_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(permiso_id) ON DELETE CASCADE;


--
-- Name: rol_permisos rol_permisos_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id) ON DELETE CASCADE;


--
-- Name: salones salones_edificio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salones
    ADD CONSTRAINT salones_edificio_id_fkey FOREIGN KEY (edificio_id) REFERENCES public.edificios(edificio_id);


--
-- Name: user_sessions user_sessions_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

