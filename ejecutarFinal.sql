--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cleanup_expired_auth_tokens(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.cleanup_expired_auth_tokens() OWNER TO postgres;

--
-- Name: update_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END; $$;


ALTER FUNCTION public.update_fecha_actualizacion() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actividades_solicitudes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actividades_solicitudes (
    actividad_id integer NOT NULL,
    solicitud_id integer NOT NULL,
    tipo_actividad character varying(50) NOT NULL,
    descripcion text NOT NULL,
    fecha_actividad timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_tipo_actividad CHECK (((tipo_actividad)::text = ANY (ARRAY[('PASSWORD_GENERADO'::character varying)::text, ('CONTACTO_ENVIADO'::character varying)::text, ('SOLICITUD_CREADA'::character varying)::text, ('SOLICITUD_RESUELTA'::character varying)::text])))
);


ALTER TABLE public.actividades_solicitudes OWNER TO postgres;

--
-- Name: actividades_solicitudes_actividad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actividades_solicitudes_actividad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actividades_solicitudes_actividad_id_seq OWNER TO postgres;

--
-- Name: actividades_solicitudes_actividad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actividades_solicitudes_actividad_id_seq OWNED BY public.actividades_solicitudes.actividad_id;


--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- Name: auditoria_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_auditoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_auditoria_id_seq OWNER TO postgres;

--
-- Name: auditoria_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_auditoria_id_seq OWNED BY public.auditoria.auditoria_id;


--
-- Name: carrera_materias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrera_materias (
    carrera_id integer NOT NULL,
    materia_id integer NOT NULL,
    numero_semestre integer NOT NULL,
    CONSTRAINT check_semestre_positivo CHECK ((numero_semestre > 0))
);


ALTER TABLE public.carrera_materias OWNER TO postgres;

--
-- Name: carreras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carreras (
    carrera_id integer NOT NULL,
    nombre_carrera character varying(255) NOT NULL,
    total_semestres integer NOT NULL
);


ALTER TABLE public.carreras OWNER TO postgres;

--
-- Name: carreras_carrera_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carreras_carrera_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carreras_carrera_id_seq OWNER TO postgres;

--
-- Name: carreras_carrera_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carreras_carrera_id_seq OWNED BY public.carreras.carrera_id;


--
-- Name: edificios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.edificios (
    edificio_id integer NOT NULL,
    lugar_id integer,
    nombre_edificio text,
    tipo_edificio text
);


ALTER TABLE public.edificios OWNER TO postgres;

--
-- Name: edificios_edificio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.edificios_edificio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.edificios_edificio_id_seq OWNER TO postgres;

--
-- Name: edificios_edificio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.edificios_edificio_id_seq OWNED BY public.edificios.edificio_id;


--
-- Name: horarios; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.horarios OWNER TO postgres;

--
-- Name: horarios_horario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horarios_horario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horarios_horario_id_seq OWNER TO postgres;

--
-- Name: horarios_horario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horarios_horario_id_seq OWNED BY public.horarios.horario_id;


--
-- Name: lugares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lugares (
    lugar_id integer NOT NULL,
    nombre_lugar text,
    tipo_lugar text
);


ALTER TABLE public.lugares OWNER TO postgres;

--
-- Name: lugares_lugar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lugares_lugar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lugares_lugar_id_seq OWNER TO postgres;

--
-- Name: lugares_lugar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lugares_lugar_id_seq OWNED BY public.lugares.lugar_id;


--
-- Name: materias_catalogo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materias_catalogo (
    materia_id integer NOT NULL,
    nombre_materia character varying(255) NOT NULL
);


ALTER TABLE public.materias_catalogo OWNER TO postgres;

--
-- Name: materias_catalogo_materia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materias_catalogo_materia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materias_catalogo_materia_id_seq OWNER TO postgres;

--
-- Name: materias_catalogo_materia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materias_catalogo_materia_id_seq OWNED BY public.materias_catalogo.materia_id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: TABLE password_reset_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.password_reset_tokens IS 'Tokens temporales para recuperación de contraseña';


--
-- Name: password_reset_tokens_reset_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_reset_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_reset_token_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_reset_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_reset_token_id_seq OWNED BY public.password_reset_tokens.reset_token_id;


--
-- Name: periodos_academicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.periodos_academicos (
    id_periodo integer NOT NULL,
    nombre character varying(100) NOT NULL,
    fecha_inicio date,
    fecha_fin date
);


ALTER TABLE public.periodos_academicos OWNER TO postgres;

--
-- Name: periodos_academicos_id_periodo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.periodos_academicos_id_periodo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.periodos_academicos_id_periodo_seq OWNER TO postgres;

--
-- Name: periodos_academicos_id_periodo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.periodos_academicos_id_periodo_seq OWNED BY public.periodos_academicos.id_periodo;


--
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    permiso_id integer NOT NULL,
    clave character varying(100) NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- Name: TABLE permisos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.permisos IS 'Catálogo de permisos granulares';


--
-- Name: permisos_permiso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_permiso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permisos_permiso_id_seq OWNER TO postgres;

--
-- Name: permisos_permiso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_permiso_id_seq OWNED BY public.permisos.permiso_id;


--
-- Name: profesor_disponibilidad; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.profesor_disponibilidad OWNER TO postgres;

--
-- Name: profesor_disponibilidad_disponibilidad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesor_disponibilidad_disponibilidad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesor_disponibilidad_disponibilidad_id_seq OWNER TO postgres;

--
-- Name: profesor_disponibilidad_disponibilidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesor_disponibilidad_disponibilidad_id_seq OWNED BY public.profesor_disponibilidad.disponibilidad_id;


--
-- Name: profesor_materias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesor_materias (
    profesor_id integer NOT NULL,
    materia_id integer NOT NULL
);


ALTER TABLE public.profesor_materias OWNER TO postgres;

--
-- Name: profesor_preferencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesor_preferencias (
    preferencia_id integer NOT NULL,
    profesor_id integer NOT NULL,
    max_horas_dia integer DEFAULT 8,
    preferencia_horario character varying(20) DEFAULT 'Mixto'::character varying,
    comentarios_adicionales text
);


ALTER TABLE public.profesor_preferencias OWNER TO postgres;

--
-- Name: profesor_preferencias_preferencia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesor_preferencias_preferencia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesor_preferencias_preferencia_id_seq OWNER TO postgres;

--
-- Name: profesor_preferencias_preferencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesor_preferencias_preferencia_id_seq OWNED BY public.profesor_preferencias.preferencia_id;


--
-- Name: profesores; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.profesores OWNER TO postgres;

--
-- Name: COLUMN profesores.tipo_contrato_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.tipo_contrato_id IS 'Referencia al tipo de contrato del docente, que define su prioridad de asignación.';


--
-- Name: profesores_profesor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesores_profesor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesores_profesor_id_seq OWNER TO postgres;

--
-- Name: profesores_profesor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesores_profesor_id_seq OWNED BY public.profesores.profesor_id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.refresh_tokens IS 'Tokens de refresco JWT con rotación y detección de reuso';


--
-- Name: refresh_tokens_refresh_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_refresh_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_refresh_token_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_refresh_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_refresh_token_id_seq OWNED BY public.refresh_tokens.refresh_token_id;


--
-- Name: rol_permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol_permisos (
    rol_id integer NOT NULL,
    permiso_id integer NOT NULL
);


ALTER TABLE public.rol_permisos OWNER TO postgres;

--
-- Name: TABLE rol_permisos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.rol_permisos IS 'Relación N:M entre roles y permisos';


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    rol_id integer NOT NULL,
    nombre_rol character varying(50) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true,
    fecha_creacion timestamp with time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_rol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_rol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_rol_id_seq OWNER TO postgres;

--
-- Name: roles_rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_rol_id_seq OWNED BY public.roles.rol_id;


--
-- Name: salones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salones (
    salon_id integer NOT NULL,
    edificio_id integer,
    nombre_salon text,
    tipo_salon text
);


ALTER TABLE public.salones OWNER TO postgres;

--
-- Name: salones_salon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salones_salon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salones_salon_id_seq OWNER TO postgres;

--
-- Name: salones_salon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salones_salon_id_seq OWNED BY public.salones.salon_id;


--
-- Name: solicitudes_recuperacion; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.solicitudes_recuperacion OWNER TO postgres;

--
-- Name: solicitudes_recuperacion_solicitud_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitudes_recuperacion_solicitud_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitudes_recuperacion_solicitud_id_seq OWNER TO postgres;

--
-- Name: solicitudes_recuperacion_solicitud_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_recuperacion_solicitud_id_seq OWNED BY public.solicitudes_recuperacion.solicitud_id;


--
-- Name: tipos_contrato; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_contrato (
    tipo_contrato_id integer NOT NULL,
    nombre_tipo character varying(100) NOT NULL,
    nivel_prioridad integer NOT NULL,
    descripcion text
);


ALTER TABLE public.tipos_contrato OWNER TO postgres;

--
-- Name: TABLE tipos_contrato; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tipos_contrato IS 'Catálogo de tipos de contrato para docentes (ej. Tiempo Completo, Por Asignatura).';


--
-- Name: COLUMN tipos_contrato.nivel_prioridad; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tipos_contrato.nivel_prioridad IS 'Nivel de prioridad para asignación. Un número menor indica mayor prioridad (ej. 1 es más alto que 2).';


--
-- Name: tipos_contrato_tipo_contrato_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_contrato_tipo_contrato_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_contrato_tipo_contrato_id_seq OWNER TO postgres;

--
-- Name: tipos_contrato_tipo_contrato_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_contrato_tipo_contrato_id_seq OWNED BY public.tipos_contrato.tipo_contrato_id;


--
-- Name: tokens_auth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tokens_auth (
    token_id integer NOT NULL,
    usuario_id integer NOT NULL,
    token character varying(255) NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tokens_auth OWNER TO postgres;

--
-- Name: tokens_auth_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tokens_auth_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tokens_auth_token_id_seq OWNER TO postgres;

--
-- Name: tokens_auth_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tokens_auth_token_id_seq OWNED BY public.tokens_auth.token_id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: TABLE user_sessions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_sessions IS 'Registro de sesiones de usuario para auditoría';


--
-- Name: user_sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_sessions_session_id_seq OWNER TO postgres;

--
-- Name: user_sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_session_id_seq OWNED BY public.user_sessions.session_id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_usuario_id_seq OWNER TO postgres;

--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_usuario_id_seq OWNED BY public.usuarios.usuario_id;


--
-- Name: actividades_solicitudes actividad_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividades_solicitudes ALTER COLUMN actividad_id SET DEFAULT nextval('public.actividades_solicitudes_actividad_id_seq'::regclass);


--
-- Name: auditoria auditoria_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN auditoria_id SET DEFAULT nextval('public.auditoria_auditoria_id_seq'::regclass);


--
-- Name: carreras carrera_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carreras ALTER COLUMN carrera_id SET DEFAULT nextval('public.carreras_carrera_id_seq'::regclass);


--
-- Name: edificios edificio_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edificios ALTER COLUMN edificio_id SET DEFAULT nextval('public.edificios_edificio_id_seq'::regclass);


--
-- Name: horarios horario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios ALTER COLUMN horario_id SET DEFAULT nextval('public.horarios_horario_id_seq'::regclass);


--
-- Name: lugares lugar_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares ALTER COLUMN lugar_id SET DEFAULT nextval('public.lugares_lugar_id_seq'::regclass);


--
-- Name: materias_catalogo materia_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_catalogo ALTER COLUMN materia_id SET DEFAULT nextval('public.materias_catalogo_materia_id_seq'::regclass);


--
-- Name: password_reset_tokens reset_token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN reset_token_id SET DEFAULT nextval('public.password_reset_tokens_reset_token_id_seq'::regclass);


--
-- Name: periodos_academicos id_periodo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos_academicos ALTER COLUMN id_periodo SET DEFAULT nextval('public.periodos_academicos_id_periodo_seq'::regclass);


--
-- Name: permisos permiso_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN permiso_id SET DEFAULT nextval('public.permisos_permiso_id_seq'::regclass);


--
-- Name: profesor_disponibilidad disponibilidad_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad ALTER COLUMN disponibilidad_id SET DEFAULT nextval('public.profesor_disponibilidad_disponibilidad_id_seq'::regclass);


--
-- Name: profesor_preferencias preferencia_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_preferencias ALTER COLUMN preferencia_id SET DEFAULT nextval('public.profesor_preferencias_preferencia_id_seq'::regclass);


--
-- Name: profesores profesor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores ALTER COLUMN profesor_id SET DEFAULT nextval('public.profesores_profesor_id_seq'::regclass);


--
-- Name: refresh_tokens refresh_token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN refresh_token_id SET DEFAULT nextval('public.refresh_tokens_refresh_token_id_seq'::regclass);


--
-- Name: roles rol_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN rol_id SET DEFAULT nextval('public.roles_rol_id_seq'::regclass);


--
-- Name: salones salon_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salones ALTER COLUMN salon_id SET DEFAULT nextval('public.salones_salon_id_seq'::regclass);


--
-- Name: solicitudes_recuperacion solicitud_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_recuperacion ALTER COLUMN solicitud_id SET DEFAULT nextval('public.solicitudes_recuperacion_solicitud_id_seq'::regclass);


--
-- Name: tipos_contrato tipo_contrato_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_contrato ALTER COLUMN tipo_contrato_id SET DEFAULT nextval('public.tipos_contrato_tipo_contrato_id_seq'::regclass);


--
-- Name: tokens_auth token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_auth ALTER COLUMN token_id SET DEFAULT nextval('public.tokens_auth_token_id_seq'::regclass);


--
-- Name: user_sessions session_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN session_id SET DEFAULT nextval('public.user_sessions_session_id_seq'::regclass);


--
-- Name: usuarios usuario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN usuario_id SET DEFAULT nextval('public.usuarios_usuario_id_seq'::regclass);


--
-- Data for Name: actividades_solicitudes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actividades_solicitudes (actividad_id, solicitud_id, tipo_actividad, descripcion, fecha_actividad) FROM stdin;
1	4	SOLICITUD_CREADA	Solicitud creada por rubenclemente221@gmail.com	2025-10-18 21:26:03.97347
2	4	PASSWORD_GENERADO	Nueva contraseña enviada a Jose Clemente Corzo	2025-10-18 21:26:29.673193
3	5	SOLICITUD_CREADA	Solicitud creada por rubenclemente221@gmail.com	2025-10-19 01:07:58.045253
4	6	SOLICITUD_CREADA	Solicitud creada por manuel.sandoval@unach.mx	2025-10-22 20:13:11.228162
5	6	PASSWORD_GENERADO	Nueva contraseña enviada a SANDOVAL Sed enim et vero eum	2025-10-22 20:13:50.432962
6	7	SOLICITUD_CREADA	Solicitud creada por josttravieso@gmail.com	2026-10-05 15:37:03.846875
7	8	SOLICITUD_CREADA	Solicitud creada por josttravieso@gmail.com	2026-10-05 17:40:33.269695
8	8	PASSWORD_GENERADO	Nueva contraseña enviada a Et sint voluptatem Sapiente voluptate a	2026-10-05 19:41:53.908496
9	8	PASSWORD_GENERADO	Nueva contraseña enviada a Et sint voluptatem Sapiente voluptate a	2026-10-05 19:42:36.407945
10	7	PASSWORD_GENERADO	Nueva contraseña enviada a Et sint voluptatem Sapiente voluptate a	2026-10-05 19:43:12.375546
11	7	PASSWORD_GENERADO	Nueva contraseña enviada a Et sint voluptatem Sapiente voluptate a	2026-10-05 19:46:16.720205
12	9	SOLICITUD_CREADA	Solicitud creada por josttravieso@gmail.com	2026-10-05 19:49:32.993634
13	9	PASSWORD_GENERADO	Nueva contraseña enviada a Et sint voluptatem Sapiente voluptate a	2026-10-05 19:50:19.650896
14	10	SOLICITUD_CREADA	Solicitud creada por test@test.com	2026-10-08 03:34:45.092424
15	11	SOLICITUD_CREADA	Solicitud creada por test@test.com	2026-10-08 03:35:18.8523
16	12	SOLICITUD_CREADA	Solicitud creada por josttravieso@gmail.com	2026-10-09 00:08:30.157339
17	12	PASSWORD_GENERADO	Nueva contraseña enviada a Et sint voluptatem Sapiente voluptate a	2026-10-09 00:08:43.790768
\.


--
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria (auditoria_id, usuario_id, email, rol, fecha_hora, direccion_ip, accion, resultado, recurso, metodo_http, ruta) FROM stdin;
1	\N	josttravieso@gmail.com	\N	2026-10-05 15:33:25.277238-06	::1	solicitudes-recuperacion_post_fallido	fallido	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
2	\N	josttravieso@gmail.com	\N	2026-10-05 15:37:03.871828-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
3	\N	test.admin@unach.mx	\N	2026-10-05 15:37:15.846065-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
4	\N	test.admin@unach.mx	\N	2026-10-05 15:37:29.311196-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
5	\N	test.admin@unach.mx	\N	2026-10-05 15:37:31.792615-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
6	\N	test.admin@unach.mx	\N	2026-10-05 15:37:36.665612-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
7	2	admin@unach.mx	administrador	2026-10-05 15:37:43.72444-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
8	2	admin@unach.mx	administrador	2026-10-05 15:37:56.465911-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
9	\N	josttravieso@gmail.com	\N	2026-10-05 17:40:33.29005-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
10	\N	admin@unach.mx	\N	2026-10-05 19:09:13.527133-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
11	\N	admin@unach.mx	\N	2026-10-05 19:09:22.037399-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
12	\N	admin@unach.mx	\N	2026-10-05 19:09:22.939059-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
13	\N	admin@unach.mx	\N	2026-10-05 19:09:23.323502-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
14	\N	admin@unach.mx	\N	2026-10-05 19:09:23.732089-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
15	\N	admin@unach.mx	\N	2026-10-05 19:09:24.120243-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
16	\N	admin@unach.mx	\N	2026-10-05 19:09:24.535339-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
17	2	admin@unach.mx	administrador	2026-10-05 19:09:30.30947-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
18	2	admin@unach.mx	administrador	2026-10-05 19:13:24.544536-06	::1	solicitudes-recuperacion_post_fallido	fallido	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion/8/regenerar-password
19	2	admin@unach.mx	administrador	2026-10-05 19:13:34.56527-06	::1	solicitudes-recuperacion_post_fallido	fallido	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion/8/regenerar-password
20	2	admin@unach.mx	administrador	2026-10-05 19:16:39.956362-06	::1	usuarios_put_exitoso	exitoso	usuarios	PUT	/api/admin/usuarios/32/rol
21	2	admin@unach.mx	administrador	2026-10-05 19:16:41.727798-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
22	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:16:48.11947-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
23	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:17:04.106609-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
24	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:17:12.469785-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
25	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:17:37.68712-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
26	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:17:38.767542-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
27	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:17:40.579444-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
28	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:17:44.034258-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
29	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:17:47.4549-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
30	\N	jose.clemente48@unach.mx	\N	2026-10-05 19:17:48.593338-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
31	2	admin@unach.mx	administrador	2026-10-05 19:18:02.324882-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
32	2	admin@unach.mx	administrador	2026-10-05 19:18:07.34531-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
33	2	admin@unach.mx	administrador	2026-10-05 19:18:17.216109-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
34	2	admin@unach.mx	administrador	2026-10-05 19:18:31.781455-06	::1	usuarios_put_exitoso	exitoso	usuarios	PUT	/api/admin/usuarios/36/rol
35	2	admin@unach.mx	administrador	2026-10-05 19:18:32.739119-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
36	\N	test.profe@unach.mx	\N	2026-10-05 19:18:39.656527-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
37	\N	test.profe@unach.mx	\N	2026-10-05 19:18:42.816817-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
38	\N	test.profe@unach.mx	\N	2026-10-05 19:18:47.406306-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
39	\N	test.profe@unach.mx	\N	2026-10-05 19:18:49.986099-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
40	\N	test.profe@unach.mx	\N	2026-10-05 19:18:50.509898-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
41	\N	test.profe@unach.mx	\N	2026-10-05 19:18:50.674348-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
42	\N	test.profe@unach.mx	\N	2026-10-05 19:18:50.830121-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
43	\N	test.profe@unach.mx	\N	2026-10-05 19:18:50.996755-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
44	\N	test.profe@unach.mx	\N	2026-10-05 19:18:51.133415-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
45	\N	test.profe@unach.mx	\N	2026-10-05 19:18:56.599584-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
46	\N	test.profe@unach.mx	\N	2026-10-05 19:18:58.862079-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
47	\N	profe@unach.mx	\N	2026-10-05 19:19:44.921158-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
48	\N	profe@unach.mx	\N	2026-10-05 19:20:06.418406-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
49	\N	profe@unach.mx	\N	2026-10-05 19:20:07.077968-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
50	\N	profe@unach.mx	\N	2026-10-05 19:20:14.450493-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
51	\N	test.profe@unach.mx	\N	2026-10-05 19:20:32.479423-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
52	\N	test.profe@unach.mx	\N	2026-10-05 19:20:33.388439-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
53	\N	test.profe@unach.mx	\N	2026-10-05 19:20:39.878095-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
54	\N	test.profe@unach.mx	\N	2026-10-05 19:20:40.633687-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
55	\N	test.admin@unach.mx	\N	2026-10-05 19:20:52.829388-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
56	\N	test.admin@unach.mx	\N	2026-10-05 19:20:58.117613-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
57	\N	test.admin@unach.mx	\N	2026-10-05 19:21:07.392565-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
58	\N	test.admin@unach.mx	\N	2026-10-05 19:21:10.038983-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
59	\N	test.admin@unach.mx	\N	2026-10-05 19:21:14.652686-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
60	\N	test.admin@unach.mx	\N	2026-10-05 19:21:41.596963-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
61	\N	test.admin@unach.mx	\N	2026-10-05 19:21:46.769295-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
62	\N	test.admin@unach.mx	\N	2026-10-05 19:21:50.979562-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
63	\N	test.admin@unach.mx	\N	2026-10-05 19:21:51.894842-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
64	\N	admin@unach.mx	\N	2026-10-05 19:22:05.522899-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
65	\N	admin@unach.mx	\N	2026-10-05 19:22:18.631946-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
66	\N	admin@unach.mx	\N	2026-10-05 19:22:19.921641-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
67	\N	admin@unach.mx	\N	2026-10-05 19:22:22.590363-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
68	\N	profe@unach.mx	\N	2026-10-05 19:22:30.289684-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
69	\N	admin@unach.mx	\N	2026-10-05 19:22:35.456639-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
70	\N	admin@unach.mx	\N	2026-10-05 19:22:42.476237-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
71	\N	admin@unach.mx	\N	2026-10-05 19:22:44.158048-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
72	\N	admin@unach.mx	\N	2026-10-05 19:22:51.698344-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
73	\N	admin@unach.mx	\N	2026-10-05 19:22:52.973109-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
74	2	admin@unach.mx	administrador	2026-10-05 19:23:19.22275-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
75	2	admin@unach.mx	administrador	2026-10-05 19:23:21.369844-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
76	\N	profe@unach.mx	\N	2026-10-05 19:23:27.607301-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
77	\N	profe@unach.mx	\N	2026-10-05 19:23:32.983752-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
78	\N	profe@unach.mx	\N	2026-10-05 19:23:38.276263-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
79	36	test.profe@unach.mx	administrador	2026-10-05 19:24:48.63271-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
80	36	test.profe@unach.mx	administrador	2026-10-05 19:24:51.069646-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
81	36	test.profe@unach.mx	administrador	2026-10-05 19:25:01.983374-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
82	36	test.profe@unach.mx	administrador	2026-10-05 19:25:03.705384-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
83	2	admin@unach.mx	administrador	2026-10-05 19:25:17.912026-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
84	2	admin@unach.mx	administrador	2026-10-05 19:25:36.45804-06	::1	usuarios_put_exitoso	exitoso	usuarios	PUT	/api/admin/usuarios/36/rol
85	2	admin@unach.mx	administrador	2026-10-05 19:25:37.129307-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
86	36	test.profe@unach.mx	profesor	2026-10-05 19:25:45.810179-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
87	36	test.profe@unach.mx	profesor	2026-10-05 19:25:52.314659-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
88	2	admin@unach.mx	administrador	2026-10-05 19:26:13.233054-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
89	2	admin@unach.mx	administrador	2026-10-05 19:26:36.6605-06	::1	usuarios_put_exitoso	exitoso	usuarios	PUT	/api/admin/usuarios/36/rol
90	2	admin@unach.mx	administrador	2026-10-05 19:26:37.55988-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
91	36	test.profe@unach.mx	administrador	2026-10-05 19:26:46.555444-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
92	36	test.profe@unach.mx	administrador	2026-10-05 19:28:19.04-06	::1	solicitudes-recuperacion_post_fallido	fallido	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion/8/regenerar-password
93	36	test.profe@unach.mx	administrador	2026-10-05 19:28:45.382695-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
94	\N	admin@unach.mx	\N	2026-10-05 19:29:00.453943-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
95	\N	admin@unach.mx	\N	2026-10-05 19:29:05.707077-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
96	2	admin@unach.mx	administrador	2026-10-05 19:29:25.305568-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
97	2	admin@unach.mx	administrador	2026-10-05 19:30:05.28893-06	::1	roles_post_exitoso	exitoso	roles	POST	/api/admin/roles
98	2	admin@unach.mx	administrador	2026-10-05 19:30:22.183181-06	::1	roles_put_exitoso	exitoso	roles	PUT	/api/admin/roles/4
99	2	admin@unach.mx	administrador	2026-10-05 19:30:26.109834-06	::1	roles_put_exitoso	exitoso	roles	PUT	/api/admin/roles/4
100	2	admin@unach.mx	administrador	2026-10-05 19:30:26.978527-06	::1	roles_put_exitoso	exitoso	roles	PUT	/api/admin/roles/4
101	2	admin@unach.mx	administrador	2026-10-05 19:30:40.823792-06	::1	usuarios_put_exitoso	exitoso	usuarios	PUT	/api/admin/usuarios/36/rol
102	2	admin@unach.mx	administrador	2026-10-05 19:30:51.492976-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
103	\N	profesor@unach.mx	\N	2026-10-05 19:30:58.712525-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
104	\N	test.admin@unach.mx	\N	2026-10-05 19:31:06.839581-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
105	36	test.profe@unach.mx	editor	2026-10-05 19:31:13.898203-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
106	36	test.profe@unach.mx	editor	2026-10-05 19:32:40.853642-06	::1	docentes_post_fallido	fallido	docentes	POST	/api/docentes
107	36	test.profe@unach.mx	editor	2026-10-05 19:32:45.26819-06	::1	docentes_post_fallido	fallido	docentes	POST	/api/docentes
108	36	test.profe@unach.mx	editor	2026-10-05 19:32:54.017039-06	::1	docentes_post_fallido	fallido	docentes	POST	/api/docentes
109	36	test.profe@unach.mx	editor	2026-10-05 19:32:56.507937-06	::1	docentes_post_fallido	fallido	docentes	POST	/api/docentes
110	36	test.profe@unach.mx	editor	2026-10-05 19:33:07.480896-06	::1	docentes_post_fallido	fallido	docentes	POST	/api/docentes
111	36	test.profe@unach.mx	editor	2026-10-05 19:33:11.61872-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
165	\N	\N	\N	2026-10-08 03:31:18.665092-06	::1	autenticacion_post_fallido	fallido	autenticacion	POST	/api/auth/refresh
112	2	admin@unach.mx	administrador	2026-10-05 19:33:18.947716-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
113	2	admin@unach.mx	administrador	2026-10-05 19:33:38.592385-06	::1	permisos_put_exitoso	exitoso	permisos	PUT	/api/admin/roles/4/permisos
114	2	admin@unach.mx	administrador	2026-10-05 19:33:49.421343-06	::1	permisos_put_exitoso	exitoso	permisos	PUT	/api/admin/roles/4/permisos
115	2	admin@unach.mx	administrador	2026-10-05 19:33:50.728179-06	::1	permisos_put_exitoso	exitoso	permisos	PUT	/api/admin/roles/4/permisos
116	2	admin@unach.mx	administrador	2026-10-05 19:34:06.182394-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
117	36	test.profe@unach.mx	editor	2026-10-05 19:34:14.686664-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
118	\N	test.admin@unach.mx	\N	2026-10-05 19:35:09.448554-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
119	36	test.profe@unach.mx	editor	2026-10-05 19:35:53.293417-06	::1	docentes_post_fallido	fallido	docentes	POST	/api/docentes
120	36	test.profe@unach.mx	editor	2026-10-05 19:36:27.29147-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
121	2	admin@unach.mx	administrador	2026-10-05 19:36:37.055647-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
122	2	admin@unach.mx	administrador	2026-10-05 19:38:23.325074-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
123	2	admin@unach.mx	administrador	2026-10-05 19:38:28.288889-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
124	2	admin@unach.mx	administrador	2026-10-05 19:39:09.649548-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
125	36	test.profe@unach.mx	editor	2026-10-05 19:39:26.08044-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
126	35	test.admin@unach.mx	administrador	2026-10-05 19:39:57.392371-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
127	35	test.admin@unach.mx	administrador	2026-10-05 19:39:57.639091-06	::1	solicitudes-recuperacion_post_fallido	fallido	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion/8/regenerar-password
128	36	test.profe@unach.mx	editor	2026-10-05 19:40:21.727423-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
129	35	test.admin@unach.mx	administrador	2026-10-05 19:42:34.963906-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
130	35	test.admin@unach.mx	administrador	2026-10-05 19:42:37.528866-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion/8/regenerar-password
131	2	admin@unach.mx	administrador	2026-10-05 19:42:46.502695-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
132	2	admin@unach.mx	administrador	2026-10-05 19:43:12.460804-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion/7/regenerar-password
133	2	admin@unach.mx	administrador	2026-10-05 19:43:46.194816-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
134	\N	josttravieso@gmail.com	\N	2026-10-05 19:43:50.980693-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
135	2	admin@unach.mx	administrador	2026-10-05 19:48:22.045561-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
136	2	admin@unach.mx	administrador	2026-10-05 19:49:24.965585-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
137	\N	josttravieso@gmail.com	\N	2026-10-05 19:49:33.004191-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
138	2	admin@unach.mx	administrador	2026-10-05 19:49:40.416853-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
139	2	admin@unach.mx	administrador	2026-10-05 19:50:19.709732-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion/9/regenerar-password
140	2	admin@unach.mx	administrador	2026-10-05 19:50:35.884226-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
141	31	josttravieso@gmail.com	profesor	2026-10-05 19:50:41.063862-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
142	31	josttravieso@gmail.com	profesor	2026-10-05 19:51:20.521792-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
143	\N	admin@unach.mx	\N	2026-10-08 03:24:00.201695-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
144	\N	admin@unach.mx	\N	2026-10-08 03:24:15.274164-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
145	35	test.admin@unach.mx	administrador	2026-10-08 03:24:36.211443-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
146	36	test.profe@unach.mx	profesor	2026-10-08 03:24:48.354217-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
147	39	test.estudiante@unach.mx	estudiante	2026-10-08 03:24:54.6877-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
148	40	test.editor@unach.mx	docente	2026-10-08 03:25:06.556806-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
149	\N	\N	\N	2026-10-08 03:25:24.997396-06	::1	autenticacion_post_exitoso	exitoso	autenticacion	POST	/api/auth/refresh
150	39	test.estudiante@unach.mx	estudiante	2026-10-08 03:26:07.009885-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
151	40	test.editor@unach.mx	docente	2026-10-08 03:26:50.1009-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
152	\N	test.admin@unach.mx	\N	2026-10-08 03:27:13.654058-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
153	\N	nonexistent@unach.mx	\N	2026-10-08 03:27:23.157117-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
154	35	test.admin@unach.mx	administrador	2026-10-08 03:28:02.895626-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
155	\N	\N	\N	2026-10-08 03:28:13.06581-06	::1	autenticacion_post_fallido	fallido	autenticacion	POST	/api/auth/refresh
156	\N	test.admin@unach.mx	\N	2026-10-08 03:28:51.015042-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
157	\N	test.admin@unach.mx	\N	2026-10-08 03:29:04.986481-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
158	36	test.profe@unach.mx	profesor	2026-10-08 03:29:29.629887-06	::1	cambio_contrasena_exitoso	exitoso	autenticacion	POST	/api/auth/change-password
159	\N	test.profe@unach.mx	\N	2026-10-08 03:29:38.353317-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
160	\N	test.profe@unach.mx	\N	2026-10-08 03:29:47.518895-06	::1	recuperacion_solicitada_exitoso	exitoso	autenticacion	POST	/api/auth/forgot-password
161	\N	test.admin@unach.mx	\N	2026-10-08 03:30:08.259928-06	::1	recuperacion_solicitada_exitoso	exitoso	autenticacion	POST	/api/auth/forgot-password
162	\N	\N	\N	2026-10-08 03:30:43.718373-06	::1	contrasena_restablecida_fallido	fallido	autenticacion	POST	/api/auth/reset-password
163	\N	test.editor@unach.mx	\N	2026-10-08 03:30:52.944598-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
164	\N	\N	\N	2026-10-08 03:31:04.621433-06	::1	autenticacion_post_exitoso	exitoso	autenticacion	POST	/api/auth/refresh
166	\N	\N	\N	2026-10-08 03:31:43.787935-06	::1	autenticacion_post_fallido	fallido	autenticacion	POST	/api/auth/refresh
167	\N	test.admin@unach.mx	\N	2026-10-08 03:32:52.632215-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
168	\N	test.estudiante@unach.mx	\N	2026-10-08 03:33:02.27801-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
169	\N	test@test.com	\N	2026-10-08 03:34:45.109603-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
170	\N	test@test.com	\N	2026-10-08 03:35:18.858423-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
171	\N	test@test.com	\N	2026-10-08 03:38:04.114556-06	::1	solicitudes-recuperacion_post_fallido	fallido	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
172	35	test.admin@unach.mx	administrador	2026-10-08 03:38:11.41439-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
173	\N	\N	\N	2026-10-08 03:38:41.139606-06	::1	autenticacion_post_exitoso	exitoso	autenticacion	POST	/api/auth/refresh
174	35	test.admin@unach.mx	administrador	2026-10-08 03:39:15.921685-06	::1	cambio_contrasena_exitoso	exitoso	autenticacion	POST	/api/auth/change-password
175	\N	test.admin@unach.mx	\N	2026-10-08 03:40:13.628894-06	::1	recuperacion_solicitada_exitoso	exitoso	autenticacion	POST	/api/auth/forgot-password
176	\N	\N	\N	2026-10-08 03:40:30.194688-06	::1	logout_fallido	fallido	autenticacion	POST	/api/auth/logout
177	35	test.admin@unach.mx	administrador	2026-10-08 03:40:37.609974-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
178	35	test.admin@unach.mx	administrador	2026-10-08 03:40:56.610383-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
179	\N	test.profe@unach.mx	\N	2026-10-08 03:41:12.262193-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
180	36	test.profe@unach.mx	profesor	2026-10-08 03:41:22.202224-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
181	39	test.estudiante@unach.mx	estudiante	2026-10-08 03:41:28.523213-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
182	40	test.editor@unach.mx	docente	2026-10-08 03:41:34.639918-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
183	2	admin@unach.mx	administrador	2026-10-08 03:51:03.101289-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
184	2	admin@unach.mx	administrador	2026-10-08 03:53:50.312738-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
185	\N	josttravieso@gmail.com	\N	2026-10-08 03:53:55.294648-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
186	31	josttravieso@gmail.com	profesor	2026-10-08 03:54:03.652872-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
187	31	josttravieso@gmail.com	profesor	2026-10-08 03:54:08.746414-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
188	31	josttravieso@gmail.com	profesor	2026-10-08 03:54:15.845985-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
189	31	josttravieso@gmail.com	profesor	2026-10-08 03:54:29.526625-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
190	31	josttravieso@gmail.com	profesor	2026-10-08 03:54:39.3772-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
191	31	josttravieso@gmail.com	profesor	2026-10-08 03:54:41.668097-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
192	31	josttravieso@gmail.com	profesor	2026-10-08 03:55:16.017983-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
193	31	josttravieso@gmail.com	profesor	2026-10-08 03:55:20.083322-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
194	31	josttravieso@gmail.com	profesor	2026-10-08 03:58:28.417189-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
195	31	josttravieso@gmail.com	profesor	2026-10-08 03:58:36.414258-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
196	31	josttravieso@gmail.com	profesor	2026-10-08 04:00:22.83518-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
197	31	josttravieso@gmail.com	profesor	2026-10-08 04:01:18.203207-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
198	\N	josttravieso@gmail.com	\N	2026-10-08 04:01:36.626097-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
199	40	test.editor@unach.mx	editor	2026-10-08 04:07:00.881683-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
200	\N	test.profe@unach.mx	\N	2026-10-08 04:07:48.667928-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
201	36	test.profe@unach.mx	profesor	2026-10-08 04:08:01.785153-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
202	35	test.admin@unach.mx	administrador	2026-10-08 04:08:17.725769-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
203	39	test.estudiante@unach.mx	estudiante	2026-10-08 04:09:09.010645-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
204	\N	\N	\N	2026-10-08 04:10:44.558861-06	::1	autenticacion_post_exitoso	exitoso	autenticacion	POST	/api/auth/refresh
205	40	test.editor@unach.mx	editor	2026-10-08 04:11:09.126293-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
206	\N	\N	\N	2026-10-08 04:11:23.937247-06	::1	autenticacion_post_fallido	fallido	autenticacion	POST	/api/auth/refresh
207	\N	test.profe@unach.mx	\N	2026-10-08 04:22:16.957083-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
208	\N	josttravieso@gmail.com	\N	2026-10-08 05:07:56.83808-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
209	\N	josttravieso@gmail.com	\N	2026-10-08 05:08:07.763895-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
210	\N	admin@unach.mx	\N	2026-10-08 05:09:15.478306-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
211	\N	test.profe@unach.mx	\N	2026-10-08 05:09:49.814165-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
212	\N	test.profe@unach.mx	\N	2026-10-08 05:09:58.441369-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
213	\N	test.profe@unach.mx	\N	2026-10-08 05:10:31.037155-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
214	2	admin@unach.mx	administrador	2026-10-08 05:10:37.943756-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
215	2	admin@unach.mx	administrador	2026-10-08 05:10:41.768155-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
216	31	josttravieso@gmail.com	profesor	2026-10-08 05:10:46.40111-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
217	31	josttravieso@gmail.com	profesor	2026-10-08 05:10:49.552656-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
218	\N	josttravieso@gmail.com	\N	2026-10-08 05:11:43.247991-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
219	\N	rubenclemente221@gmail.com	\N	2026-10-08 05:11:56.090477-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
220	\N	admin@unach.mx	\N	2026-10-08 05:12:02.014703-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
221	\N	admin@unach.mx	\N	2026-10-08 05:12:03.327103-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
222	31	josttravieso@gmail.com	profesor	2026-10-08 05:12:20.475409-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
223	\N	test.profe@unach.mx	\N	2026-10-08 05:13:06.788726-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
224	\N	test.editor@unach.mx	\N	2026-10-08 05:13:28.482182-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
225	\N	nonexistent@test.com	\N	2026-10-08 05:14:00.077557-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
226	\N	josttravieso@gmail.com	\N	2026-10-08 05:30:40.02974-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
227	\N	josttravieso@gmail.com	\N	2026-10-08 05:31:06.241991-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
228	31	josttravieso@gmail.com	profesor	2026-10-08 05:31:09.08912-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
229	31	josttravieso@gmail.com	profesor	2026-10-08 05:31:12.413616-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
230	31	josttravieso@gmail.com	profesor	2026-10-08 05:31:15.076232-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
231	31	josttravieso@gmail.com	profesor	2026-10-08 05:31:17.331003-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
232	31	josttravieso@gmail.com	profesor	2026-10-08 05:31:21.089035-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
233	31	josttravieso@gmail.com	profesor	2026-10-08 05:31:27.789317-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
234	31	josttravieso@gmail.com	profesor	2026-10-08 05:31:31.960391-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
235	\N	josttravieso@gmail.com	\N	2026-10-08 23:43:49.529727-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
236	2	admin@unach.mx	administrador	2026-10-08 23:43:58.345021-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
237	2	admin@unach.mx	administrador	2026-10-08 23:44:02.070416-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
238	31	josttravieso@gmail.com	profesor	2026-10-08 23:44:11.589629-06	::1	google_login_exitoso	exitoso	autenticacion	GET	/api/auth/google/callback
239	31	josttravieso@gmail.com	profesor	2026-10-08 23:44:15.122123-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
240	35	test.admin@unach.mx	administrador	2026-10-08 23:57:53.46119-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
241	\N	test.admin@unach.mx	\N	2026-10-08 23:57:53.575989-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
242	\N	\N	\N	2026-10-08 23:57:53.678815-06	::1	autenticacion_post_exitoso	exitoso	autenticacion	POST	/api/auth/refresh
243	\N	\N	\N	2026-10-08 23:57:53.692999-06	::1	autenticacion_post_fallido	fallido	autenticacion	POST	/api/auth/refresh
244	35	test.admin@unach.mx	administrador	2026-10-08 23:57:54.221363-06	::1	cambio_contrasena_exitoso	exitoso	autenticacion	POST	/api/auth/change-password
245	35	test.admin@unach.mx	administrador	2026-10-08 23:57:54.516569-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
246	\N	test.admin@unach.mx	\N	2026-10-08 23:57:56.617464-06	::1	recuperacion_solicitada_exitoso	exitoso	autenticacion	POST	/api/auth/forgot-password
247	35	test.admin@unach.mx	administrador	2026-10-08 23:57:56.63634-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
248	\N	test.admin@unach.mx	\N	2026-10-08 23:59:15.443393-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
249	\N	test.admin@unach.mx	\N	2026-10-08 23:59:15.870143-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
250	\N	\N	\N	2026-10-08 23:59:15.883965-06	::1	autenticacion_post_fallido	fallido	autenticacion	POST	/api/auth/refresh
251	35	test.admin@unach.mx	administrador	2026-10-08 23:59:31.590621-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
252	\N	test.admin@unach.mx	\N	2026-10-08 23:59:31.693858-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
253	\N	\N	\N	2026-10-08 23:59:31.734927-06	::1	autenticacion_post_exitoso	exitoso	autenticacion	POST	/api/auth/refresh
254	\N	\N	\N	2026-10-08 23:59:31.742299-06	::1	autenticacion_post_fallido	fallido	autenticacion	POST	/api/auth/refresh
255	35	test.admin@unach.mx	administrador	2026-10-08 23:59:32.237617-06	::1	cambio_contrasena_exitoso	exitoso	autenticacion	POST	/api/auth/change-password
256	35	test.admin@unach.mx	administrador	2026-10-08 23:59:32.532026-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
257	\N	test.admin@unach.mx	\N	2026-10-08 23:59:34.304299-06	::1	recuperacion_solicitada_exitoso	exitoso	autenticacion	POST	/api/auth/forgot-password
258	35	test.admin@unach.mx	administrador	2026-10-08 23:59:34.321227-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
259	\N	josttravieso@gmail.com	\N	2026-10-09 00:00:05.710658-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
260	\N	josttravieso@gmail.com	\N	2026-10-09 00:00:10.60244-06	::1	solicitudes-recuperacion_post_fallido	fallido	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
261	\N	josttravieso@gmail.com	\N	2026-10-09 00:02:13.420119-06	::1	solicitudes-recuperacion_post_fallido	fallido	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
262	\N	josttravieso@gmail.com	\N	2026-10-09 00:04:22.892203-06	::1	recuperacion_solicitada_exitoso	exitoso	autenticacion	POST	/api/auth/forgot-password
263	\N	admin@unach.mx	\N	2026-10-09 00:05:59.380924-06	::1	login_fallido	fallido	autenticacion	POST	/api/auth/login
264	2	admin@unach.mx	administrador	2026-10-09 00:06:02.809587-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
265	2	admin@unach.mx	administrador	2026-10-09 00:08:24.270868-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
266	\N	josttravieso@gmail.com	\N	2026-10-09 00:08:30.161673-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion
267	2	admin@unach.mx	administrador	2026-10-09 00:08:36.632077-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
268	2	admin@unach.mx	administrador	2026-10-09 00:08:43.813761-06	::1	solicitudes-recuperacion_post_exitoso	exitoso	solicitudes-recuperacion	POST	/api/solicitudes-recuperacion/12/regenerar-password
269	2	admin@unach.mx	administrador	2026-10-09 00:08:55.698063-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
270	31	josttravieso@gmail.com	profesor	2026-10-09 00:09:02.655088-06	::1	login_exitoso	exitoso	autenticacion	POST	/api/auth/login
271	31	josttravieso@gmail.com	profesor	2026-10-09 00:09:18.945424-06	::1	logout_exitoso	exitoso	autenticacion	POST	/api/auth/logout
\.


--
-- Data for Name: carrera_materias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrera_materias (carrera_id, materia_id, numero_semestre) FROM stdin;
5	5	1
5	5	2
5	5	3
5	5	4
5	5	5
5	5	6
8	22	1
20	38	1
20	56	2
20	14	3
20	28	4
20	28	5
20	28	6
20	28	7
20	14	8
20	14	9
20	14	10
57	34	1
57	28	7
47	14	2
20	20	1
41	34	1
41	24	2
41	31	3
41	38	4
41	36	5
41	32	6
41	33	7
41	10	8
41	23	9
\.


--
-- Data for Name: carreras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carreras (carrera_id, nombre_carrera, total_semestres) FROM stdin;
5	Ingenieria en sistemas	6
6	Licenciatura en Caficultura	8
7	Ingeniero Agrónomo en Ganadería Ambiental	9
8	Ingeniero en Desarrollo Agroambiental	9
9	Ingeniería en Desarrollo Rural	9
10	Ingeniería Agroindustrial	9
11	Ingeniería Forestal	9
12	Ingeniero Agrónomo	9
13	Medicina Veterinaria y Zootecnia (Maya)	10
14	Medicina Veterinaria y Zootecnia (Mezcalapa)	10
15	Licenciatura en Medicina Veterinaria y Zootecnia	10
16	Licenciatura en Gerontología	8
17	Licenciatura en Médico Cirujano	12
18	Licenciatura en Químico Farmacobiólogo	9
19	Licenciatura en Enseñanza del Inglés	8
20	Arquitectura	10
21	Ingeniería Civil	10
22	Ingeniería Hidráulica	9
23	Ingeniería en Ciencias de los Materiales	9
24	Licenciatura en Antropología Social	8
25	Licenciatura en Bibliotecología y Gestión de Información	8
26	Licenciatura en Comunicación	8
27	Licenciatura en Economía	9
28	Licenciatura en Historia	8
29	Licenciatura en Filosofía	8
30	Licenciatura en Lengua y Literatura Hispanoamericanas	8
31	Licenciatura en Pedagogía	8
32	Licenciatura en Puericultura y Desarrollo Infantil	8
33	Licenciatura en Sociología	8
34	Licenciatura en Derecho	10
35	Licenciatura en Administración	8
36	Licenciatura en Agronegocios	8
37	Licenciatura en Comercio Internacional	8
38	Licenciatura en Contaduría	8
39	Licenciatura en Gestión Turística	8
40	Licenciatura en Sistemas Computacionales	9
41	Ingeniería en Desarrollo y Tecnologías de Software	9
42	Licenciatura en Danza	8
43	Licenciatura en Gestión y Autodesarrollo Indígena	8
44	Licenciatura en Gestión para el Desarrollo y la Diversidad	8
45	Licenciatura en Seguridad Alimentaria	8
46	Licenciatura en Desarrollo Municipal y Gobernabilidad	8
47	Licenciatura en Tecnologías de Información y Comunicación Aplicadas a la Educación	8
48	Licenciatura en Gerencia Social	8
49	Licenciatura en Estadística y Sistemas de Información	9
50	Licenciatura en Gestión de la Micro, Pequeña y Mediana Empresa	8
51	Licenciatura en Inglés	8
52	Licenciatura en Derechos Humanos	8
53	Licenciatura en Física	9
54	Ingeniero en Sistemas Costeros	9
55	Ingeniería Física	9
56	Ingeniero Biotecnólogo	9
57	Matemáticas Aplicadas	9
58	Licenciatura en Matemáticas	8
\.


--
-- Data for Name: edificios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.edificios (edificio_id, lugar_id, nombre_edificio, tipo_edificio) FROM stdin;
1	1	Edificio A	\N
2	2	EDIFICIO A	\N
\.


--
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios (horario_id, profesor_id, materia_id, salon_id, dia_semana, hora_inicio, hora_fin, id_periodo) FROM stdin;
16	18	34	3	Jueves	09:00:00	10:00:00	\N
19	18	34	5	Lunes	07:00:00	08:00:00	\N
\.


--
-- Data for Name: lugares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lugares (lugar_id, nombre_lugar, tipo_lugar) FROM stdin;
1	Faculta de Ingenieria	Facultad
2	Facultad de contaduria	Facultad
\.


--
-- Data for Name: materias_catalogo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materias_catalogo (materia_id, nombre_materia) FROM stdin;
5	Matematicas
6	FISICA
7	MATEMATICAS DISCRETAS
8	PROGRAMACION ESTRUCTURADA
9	FUNDAMENTOS DE MATEMATICAS
10	METODOLOGIA DE LA PROGRAMACION
11	TALLER DE COMPETENCIAS INFORMACIONALES
12	ÁLGEBRA LINEAL
13	ESTRUCTURA DE DATOS
14	CALCULO DIFERENCIAL
15	PROGRAMACION ORIENTADA A OBJETOS
16	ELECTRICIDAD Y ELECTRONICA
17	TALLER DE METODOLOGIA DE LA INVESTIGACION
18	METODOS NUMERICOS
19	CALCULO INTEGRAL
20	SISTEMAS DIGITALES
21	DISEÑO DE BASES DE DATOS
22	DESARROLLO HUMANO
23	PROGRAMACION AVANZADA
24	TALLER DE DESARROLLO 1
25	ARQUITECTURA DE COMPUTADORAS
26	ECUACIONES DIFERENCIALES
27	PROBABILIDAD Y ESTADISTICA
29	PROGRAMACION DISTRIBUIDA Y EN PARALELO
30	ESTUDIO DE LAS ORGANIZACIONES
31	TALLER DE DESARROLLO 2
32	INVESTIGACION DE OPERACIONES
33	TEORIA MATEMATICA DE LA COMPUTACION
34	CALIDAD EN LOS PROCESOS DE DESARROLLO DE SOFTWARE
35	TRADUCTORES DE BAJO NIVEL
36	FUNDAMENTOS DE REDES
37	TOPICOS AVANZADOS DE BASES DE DATOS
38	TALLER DE DESARROLLO 3
39	PRACTICA PROFESIONAL 1
40	ECONOMIA
41	COMPILADORES
42	CONTABILIDAD Y FINANZAS
43	MODELOS Y METODOLOGIAS DE DESARROLLO DE SOFTWARE
44	PROTOCOLOS DE ENRUTAMIENTO
45	INTERFACES HUMANO COMPUTADORA
46	TALLER DE DESARROLLO 4
47	SISTEMAS OPERATIVOS
48	INTELIGENCIA ARTIFICIAL
49	DESARROLLO DE APLICACIONES WEB Y MOVILES
50	CONMUTADORES Y REDES INALAMBRICAS
51	PRACTICA PROFESIONAL 2
52	OPTATIVA 1
53	OPTATIVA 2
54	GRAFICACION
55	COMPUTO DISTRIBUIDO
56	ADMINISTRACION DE SISTEMAS OPERATIVOS
57	TALLER DE INVESTIGACION EN LAS CIENCIAS COMPUTACIONALES
58	OPTATIVA 3
59	OPTATIVA 4
60	OPTATIVA 5
28	ADMINISTRACION DE BASES DE DATOS
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (reset_token_id, usuario_id, token_hash, expires_at, used_at, revoked, created_at) FROM stdin;
1	36	fee7a57dda4d5dad1b60b1ee5da99efcdd6912a2e4d8139497f973062315bd6c	2026-10-03 11:44:17.87-06	\N	t	2026-10-03 10:44:17.879829-06
2	36	dffb4bf2663989bac5dc1882eafd88011e1372c8f8af63b0d2df11fa7ed04b7d	2026-10-03 11:47:28.625-06	2026-10-03 10:47:30.954652-06	t	2026-10-03 10:47:28.64623-06
3	36	d7d70ef274413241125aef83a7e90344887e492c2447cf60ebef5394625ca102	2026-10-03 11:47:31.866-06	2026-10-03 10:47:34.666218-06	t	2026-10-03 10:47:31.86845-06
5	36	eb5a75e068fff9dccb84220df476c212059502838e9472ce5686ab7edd5abf59	2026-10-08 04:29:45.133-06	\N	f	2026-10-08 03:29:45.154189-06
4	35	58c624289c1022475c64f5726a29e3b36c41db6a7c2883f7f6d55fe31aa830ef	2026-10-03 11:50:57.214-06	2026-10-03 10:50:59.074463-06	t	2026-10-03 10:50:57.226862-06
6	35	de57a4fb107f3d0aea081e0dd07db49f6cd9c5e947cb276304768316e57ef847	2026-10-08 04:30:06.618-06	\N	t	2026-10-08 03:30:06.624549-06
7	35	6f6e6875bdff0209f9835f96fa3b9f896579e8476c5b1435f1553bb41e6a66f4	2026-10-08 04:40:11.999-06	\N	t	2026-10-08 03:40:12.016107-06
8	35	1f65065b1d882e178a5a7f35c48eb2d609ce24a0106ea278aec153f783f3f065	2026-10-09 00:57:54.521-06	\N	t	2026-10-08 23:57:54.531232-06
9	35	7e91ae1ed64fd43b0b9753afca1cf5998c3773ebc2dac36633a1e4c493c954e3	2026-10-09 00:59:32.535-06	\N	f	2026-10-08 23:59:32.543237-06
10	31	831fc73432132fe08588540d4597a3ed12678bc2d20945d200c8082f3850c376	2026-10-09 01:04:21.17-06	\N	f	2026-10-09 00:04:21.199357-06
\.


--
-- Data for Name: periodos_academicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.periodos_academicos (id_periodo, nombre, fecha_inicio, fecha_fin) FROM stdin;
2	Semestre 2026-01	2026-02-01	2026-06-15
1	Semestre 2025-02	2025-08-12	2025-11-24
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (permiso_id, clave, nombre, descripcion, activo) FROM stdin;
1	usuarios:leer	Leer usuarios	Permite listar y ver detalles de usuarios	t
2	usuarios:crear	Crear usuarios	Permite crear nuevos usuarios	t
3	usuarios:editar	Editar usuarios	Permite modificar usuarios existentes	t
4	usuarios:eliminar	Eliminar usuarios	Permite eliminar usuarios	t
5	roles:leer	Leer roles	Permite listar y ver roles	t
6	roles:crear	Crear roles	Permite crear nuevos roles	t
7	roles:editar	Editar roles	Permite modificar roles existentes	t
8	roles:eliminar	Eliminar roles	Permite eliminar roles	t
9	horarios:leer	Leer horarios	Permite ver horarios	t
10	horarios:crear	Crear horarios	Permite crear horarios	t
11	horarios:editar	Editar horarios	Permite modificar horarios	t
12	horarios:eliminar	Eliminar horarios	Permite eliminar horarios	t
13	materias:leer	Leer materias	Permite ver cat logo de materias	t
14	materias:crear	Crear materias	Permite crear materias	t
15	materias:editar	Editar materias	Permite modificar materias	t
16	materias:eliminar	Eliminar materias	Permite eliminar materias	t
17	profesores:leer	Leer profesores	Permite ver profesores	t
18	profesores:crear	Crear profesores	Permite crear profesores	t
19	profesores:editar	Editar profesores	Permite modificar profesores	t
20	profesores:eliminar	Eliminar profesores	Permite eliminar profesores	t
21	carreras:leer	Leer carreras	Permite ver carreras	t
22	carreras:crear	Crear carreras	Permite crear carreras	t
23	carreras:editar	Editar carreras	Permite modificar carreras	t
24	carreras:eliminar	Eliminar carreras	Permite eliminar carreras	t
26	reportes:leer	Leer reportes	Permite generar y ver reportes	t
27	roles:gestionar	Gestionar roles	Permite crear, editar y activar roles	t
28	permisos:gestionar	Gestionar permisos	Permite asignar y revocar permisos por rol	t
25	auditoria:leer	Consultar auditoría	Permite consultar el registro de auditoría	t
30	lugares:leer	Leer lugares	Permite ver lugares, edificios y salones	t
31	lugares:crear	Crear lugares	Permite crear lugares, edificios y salones	t
32	lugares:editar	Editar lugares	Permite modificar lugares, edificios y salones	t
33	lugares:eliminar	Eliminar lugares	Permite eliminar lugares, edificios y salones	t
34	periodos:leer	Leer periodos	Permite ver periodos academicos	t
35	periodos:crear	Crear periodos	Permite crear periodos academicos	t
36	periodos:editar	Editar periodos	Permite modificar periodos academicos	t
37	periodos:eliminar	Eliminar periodos	Permite eliminar periodos academicos	t
38	editores:leer	Leer editores	Permite consultar lista de editores	t
39	editores:crear	Crear editores	Permite registrar nuevos editores	t
40	editores:editar	Editar editores	Permite modificar datos de editores	t
41	editores:eliminar	Eliminar editores	Permite dar de baja editores	t
\.


--
-- Data for Name: profesor_disponibilidad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesor_disponibilidad (disponibilidad_id, profesor_id, dia_semana, hora_inicio, hora_fin, activo, turno, id_periodo) FROM stdin;
77	18	Lunes	07:00:00	08:00:00	t	matutino	\N
78	18	Martes	07:00:00	08:00:00	t	matutino	\N
79	18	Miércoles	07:00:00	08:00:00	t	matutino	\N
80	18	Jueves	07:00:00	08:00:00	t	matutino	\N
81	18	Viernes	07:00:00	08:00:00	t	matutino	\N
82	18	Lunes	08:00:00	09:00:00	t	matutino	\N
83	18	Martes	08:00:00	09:00:00	t	matutino	\N
84	18	Miércoles	08:00:00	09:00:00	t	matutino	\N
85	18	Jueves	08:00:00	09:00:00	t	matutino	\N
86	18	Viernes	08:00:00	09:00:00	t	matutino	\N
87	18	Lunes	09:00:00	10:00:00	t	matutino	\N
88	18	Martes	09:00:00	10:00:00	t	matutino	\N
89	18	Miércoles	09:00:00	10:00:00	t	matutino	\N
90	18	Jueves	09:00:00	10:00:00	t	matutino	\N
91	18	Viernes	09:00:00	10:00:00	t	matutino	\N
92	18	Lunes	10:00:00	11:00:00	t	matutino	\N
93	18	Martes	10:00:00	11:00:00	t	matutino	\N
94	18	Miércoles	10:00:00	11:00:00	t	matutino	\N
95	18	Jueves	10:00:00	11:00:00	t	matutino	\N
96	18	Viernes	10:00:00	11:00:00	t	matutino	\N
97	18	Lunes	11:00:00	12:00:00	t	matutino	\N
98	18	Martes	11:00:00	12:00:00	t	matutino	\N
99	18	Miércoles	11:00:00	12:00:00	t	matutino	\N
100	18	Jueves	11:00:00	12:00:00	t	matutino	\N
101	18	Viernes	11:00:00	12:00:00	t	matutino	\N
102	18	Lunes	12:00:00	13:00:00	t	matutino	\N
103	18	Martes	12:00:00	13:00:00	t	matutino	\N
104	18	Miércoles	12:00:00	13:00:00	t	matutino	\N
105	18	Jueves	12:00:00	13:00:00	t	matutino	\N
106	18	Viernes	12:00:00	13:00:00	t	matutino	\N
107	18	Lunes	13:00:00	14:00:00	t	matutino	\N
108	18	Martes	13:00:00	14:00:00	t	matutino	\N
109	18	Miércoles	13:00:00	14:00:00	t	matutino	\N
110	18	Jueves	13:00:00	14:00:00	t	matutino	\N
111	18	Viernes	13:00:00	14:00:00	t	matutino	\N
112	31	Lunes	07:00:00	08:00:00	t	matutino	\N
113	31	Martes	07:00:00	08:00:00	t	matutino	\N
114	31	Miércoles	07:00:00	08:00:00	t	matutino	\N
115	31	Jueves	07:00:00	08:00:00	t	matutino	\N
116	31	Viernes	07:00:00	08:00:00	t	matutino	\N
117	31	Lunes	08:00:00	09:00:00	t	matutino	\N
118	31	Martes	08:00:00	09:00:00	t	matutino	\N
119	31	Miércoles	08:00:00	09:00:00	t	matutino	\N
120	31	Jueves	08:00:00	09:00:00	t	matutino	\N
121	31	Viernes	08:00:00	09:00:00	t	matutino	\N
122	31	Lunes	09:00:00	10:00:00	t	matutino	\N
123	31	Martes	09:00:00	10:00:00	t	matutino	\N
124	31	Miércoles	09:00:00	10:00:00	t	matutino	\N
125	31	Jueves	09:00:00	10:00:00	t	matutino	\N
126	31	Viernes	09:00:00	10:00:00	t	matutino	\N
127	31	Lunes	10:00:00	11:00:00	t	matutino	\N
128	31	Martes	10:00:00	11:00:00	t	matutino	\N
129	31	Miércoles	10:00:00	11:00:00	t	matutino	\N
130	31	Jueves	10:00:00	11:00:00	t	matutino	\N
131	31	Viernes	10:00:00	11:00:00	t	matutino	\N
132	31	Lunes	11:00:00	12:00:00	t	matutino	\N
133	31	Martes	11:00:00	12:00:00	t	matutino	\N
134	31	Miércoles	11:00:00	12:00:00	t	matutino	\N
135	31	Jueves	11:00:00	12:00:00	t	matutino	\N
136	31	Viernes	11:00:00	12:00:00	t	matutino	\N
137	31	Lunes	12:00:00	13:00:00	t	matutino	\N
138	31	Martes	12:00:00	13:00:00	t	matutino	\N
139	31	Miércoles	12:00:00	13:00:00	t	matutino	\N
140	31	Jueves	12:00:00	13:00:00	t	matutino	\N
141	31	Viernes	12:00:00	13:00:00	t	matutino	\N
142	31	Lunes	13:00:00	14:00:00	t	matutino	\N
143	31	Martes	13:00:00	14:00:00	t	matutino	\N
144	31	Miércoles	13:00:00	14:00:00	t	matutino	\N
145	31	Jueves	13:00:00	14:00:00	t	matutino	\N
146	31	Viernes	13:00:00	14:00:00	t	matutino	\N
147	32	Lunes	07:00:00	08:00:00	t	matutino	\N
148	32	Martes	07:00:00	08:00:00	t	matutino	\N
149	32	Miércoles	07:00:00	08:00:00	t	matutino	\N
150	32	Jueves	07:00:00	08:00:00	t	matutino	\N
151	32	Viernes	07:00:00	08:00:00	t	matutino	\N
152	32	Lunes	08:00:00	09:00:00	t	matutino	\N
153	32	Martes	08:00:00	09:00:00	t	matutino	\N
154	32	Miércoles	08:00:00	09:00:00	t	matutino	\N
155	32	Jueves	08:00:00	09:00:00	t	matutino	\N
156	32	Viernes	08:00:00	09:00:00	t	matutino	\N
157	32	Lunes	09:00:00	10:00:00	t	matutino	\N
158	32	Martes	09:00:00	10:00:00	t	matutino	\N
159	32	Miércoles	09:00:00	10:00:00	t	matutino	\N
160	32	Jueves	09:00:00	10:00:00	t	matutino	\N
161	32	Viernes	09:00:00	10:00:00	t	matutino	\N
162	32	Lunes	10:00:00	11:00:00	t	matutino	\N
163	32	Martes	10:00:00	11:00:00	t	matutino	\N
164	32	Miércoles	10:00:00	11:00:00	t	matutino	\N
165	32	Jueves	10:00:00	11:00:00	t	matutino	\N
166	32	Viernes	10:00:00	11:00:00	t	matutino	\N
167	32	Lunes	11:00:00	12:00:00	t	matutino	\N
168	32	Martes	11:00:00	12:00:00	t	matutino	\N
169	32	Miércoles	11:00:00	12:00:00	t	matutino	\N
170	32	Jueves	11:00:00	12:00:00	t	matutino	\N
171	32	Viernes	11:00:00	12:00:00	t	matutino	\N
172	32	Lunes	12:00:00	13:00:00	t	matutino	\N
173	32	Martes	12:00:00	13:00:00	t	matutino	\N
174	32	Miércoles	12:00:00	13:00:00	t	matutino	\N
175	32	Jueves	12:00:00	13:00:00	t	matutino	\N
176	32	Viernes	12:00:00	13:00:00	t	matutino	\N
177	32	Lunes	13:00:00	14:00:00	t	matutino	\N
178	32	Martes	13:00:00	14:00:00	t	matutino	\N
179	32	Miércoles	13:00:00	14:00:00	t	matutino	\N
180	32	Jueves	13:00:00	14:00:00	t	matutino	\N
181	32	Viernes	13:00:00	14:00:00	t	matutino	\N
\.


--
-- Data for Name: profesor_materias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesor_materias (profesor_id, materia_id) FROM stdin;
18	34
18	37
18	38
31	34
31	38
32	34
\.


--
-- Data for Name: profesor_preferencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesor_preferencias (preferencia_id, profesor_id, max_horas_dia, preferencia_horario, comentarios_adicionales) FROM stdin;
3	18	8	Mixto	Pura buenaa materia
\.


--
-- Data for Name: profesores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesores (profesor_id, nombres, apellidos, matricula, grado_academico, numero_plaza, numero_contrato, direccion, telefono, email, tipo_contrato_id) FROM stdin;
18	Jose	Clemente Corzo	Soluta esse asperior	Impedit numquam obc	Quidem irure alias n	Ut sint quasi quibu	Calle San Bernardino 261	9612215796	rubenclemente221@gmail.com	1
29	2	Quasi dolores nihil 	Illo duis culpa veli	Ad consectetur aut f	Quas qui ea corrupti	Sunt eos nisi sint 	Non sequi voluptate 	3422234432	subebo@mailinator.com	2
31	Et sint voluptatem	Sapiente voluptate a	Quam consequat Ad n	Asperiores cillum qu	Asperiores est eiusm	Aut ad amet earum s	Voluptates adipisci 	2132132132	josttravieso@gmail.com	1
32	Id voluptatem Poss	Ipsa asperiores aut	Do sint maxime adip	Saepe aspernatur do 	Dolore sint voluptat	Quae nobis voluptate	Consequat Ipsam dis	3545454654	jose.clemente48@unach.mx	2
36	Test	Profesor	TEST001	Maestría	PLAZA001	CONTRATO001	Dirección Test	555-1234	test.profe@unach.mx	1
35	Test	Admin	TEST000	Doctorado	PLAZA000	CONTRATO000	Dirección Test	555-0000	test.admin@unach.mx	1
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (refresh_token_id, usuario_id, token_hash, jti, expires_at, revoked_at, replaced_by_token_id, created_at, user_agent, ip_origen, dispositivo) FROM stdin;
1	34	5257ef4e8b588774956bb89d659bbd011db08700dae1c0e1bdb96034f858cfd6	781f7d7c-8d6c-426b-9f7a-6deaf1c9b5c9	2026-10-09 23:52:53.375-06	\N	\N	2026-10-02 23:52:53.376266-06	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	::1	\N
2	34	89e94cfdd5ae0db2562e713e9deaa8cf9843aa5cf1885191ccbf2a14bf963d9d	094812e3-e078-4db8-9a0a-2d4baea8e593	2026-10-09 23:53:16.68-06	\N	\N	2026-10-02 23:53:16.681046-06	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	::1	\N
3	34	0d13840d18ecc1a5d6919733f4e0e1d2e949f269a6a8e48926ecb9e721f07599	67cda545-e4e2-4c4f-9f93-472b73bda6ea	2026-10-09 23:53:32.897-06	\N	\N	2026-10-02 23:53:32.897754-06	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	::1	\N
4	34	afa6a8f41fc5961d1f0b8f56a4cd257376e75e1edb505fece3c4b149cfcc619f	b10aac93-ba2f-4d43-871d-cab94cc19851	2026-10-09 23:55:13.336-06	\N	\N	2026-10-02 23:55:13.338313-06	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	::1	\N
5	34	40a2a07b6200098bcc2220bb28940bd3ee7593585eca244a2fc93c54c0fe54c1	c3d87774-3e4f-4a2b-b96f-9b2026be10a3	2026-10-09 23:56:10.371-06	\N	\N	2026-10-02 23:56:10.373431-06	curl/8.21.0	::1	\N
6	34	9be93d0e3802930c28348be9c188eb129f83c30fd42c43e72f441b0de1311807	b72153a1-1cc4-416e-9fab-06c88191296d	2026-10-09 23:57:02.36-06	\N	\N	2026-10-02 23:57:02.362873-06	curl/8.21.0	::1	\N
7	34	260ea5fb938c592f3eb83fc2a3be8c43a89dcebc5203ec17243943bddd60d183	85a2a485-fa10-4e9a-8039-6b44c0a9b76c	2026-10-09 23:57:24.118-06	\N	\N	2026-10-02 23:57:24.120652-06	curl/8.21.0	::1	\N
8	34	4fa207e1f86ac5131c8c5e004fc15269a03b1cee84fc9b9ed99081b6c742c3ef	a385b29b-8719-4bfe-83a4-e27787aaef68	2026-10-09 23:57:56.81-06	\N	\N	2026-10-02 23:57:56.812419-06	curl/8.21.0	::1	\N
9	34	570cdc620f493c411ae07b77ff1e268a223e76a9a9ca8d6605d752d120b66d47	d81d1f73-3185-441a-8e71-ec3f9b9f6ee5	2026-10-10 02:39:21.366-06	\N	\N	2026-10-03 02:39:21.370312-06	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	::1	\N
10	34	b2ab68d9ac3179b778cb9db047d578834def830ab1cc39ba294770df25a384fd	ab4a3184-28bd-4ca3-a9fa-35ba3672a860	2026-10-10 02:39:39.158-06	\N	\N	2026-10-03 02:39:39.159781-06	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	::1	\N
11	34	152fb70fe218c29663e6cd75cd7c25306ffc4789c9a8683bc6a1eae4c4be73d5	7a770f07-4752-4937-b85b-2e650d1095c3	2026-10-10 02:43:23.675-06	\N	\N	2026-10-03 02:43:23.679966-06	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	::1	\N
12	34	4d8cc30ee3016348672d3f7a7119558388171a5574252e31461f492f32e9fb89	242a2beb-1d50-4d84-b943-7aef556ecd12	2026-10-10 02:44:32.201-06	\N	\N	2026-10-03 02:44:32.206296-06	test-agent	127.0.0.1	\N
13	34	44d0facb149c59474f4a679bc1773fadd07e959b784f608440d35e9956b2087f	d8cf03f5-2c2a-4136-b9f8-b5646cf4062f	2026-10-10 02:55:27.588-06	\N	\N	2026-10-03 02:55:27.591951-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
14	34	b60f88090bf0acdb0da52d203fd3171735e1506760b4fc40ebbfa673a503aac4	c32c6035-fd73-4b7e-a124-e4b981d0bf6b	2026-10-10 02:55:41.464-06	\N	\N	2026-10-03 02:55:41.466229-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
15	34	ada061e53d161c5e477b3ba9247e68da7209bd4d943d834d6bfc601f2c78bc68	8b52f6c3-9654-4e0c-8a89-5d59f244674b	2026-10-10 02:56:52.267-06	\N	\N	2026-10-03 02:56:52.269097-06	curl/8.21.0	::1	\N
16	34	4a17f81aa9156794b539a8c49b01f4d75eaf8564bdff31c1f2385c64e21ab349	042564d6-ecf3-430e-8ac4-a8b72d458d83	2026-10-10 02:57:44.308-06	\N	\N	2026-10-03 02:57:44.309615-06	curl/8.21.0	::1	\N
17	34	408e13c63c99e1dc99848e67485dc581c3fdfef467d160021fa73a77de3fc5e8	e30de71e-c967-4431-93a2-bbefc6023c3c	2026-10-10 02:57:59.256-06	\N	\N	2026-10-03 02:57:59.257824-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
18	34	bdd0edafc755ab5ad5507505cd952e26002d8ccb358498877abf77ce48a3474d	f03c0b4d-f879-440c-978d-0776c0f67757	2026-10-10 02:58:35.414-06	\N	\N	2026-10-03 02:58:35.418416-06	curl/8.21.0	::1	\N
19	34	f768236504bc51592895c1dda83c4c3d47775bf89c0541c3c350c629f3eca367	124fc4d4-9e81-49a1-a4a7-cbbe5a78d89c	2026-10-10 03:00:19.689-06	\N	\N	2026-10-03 03:00:19.703431-06	curl/8.21.0	::1	\N
20	34	f3da4e601806fbcd58b9940c8e3d1e54a32119869aaa5e50291b873707cca19a	fb91051d-7a40-4f11-82c0-e5da4f75f77e	2026-10-10 03:01:26.092-06	\N	\N	2026-10-03 03:01:26.10406-06	curl/8.21.0	::1	\N
21	34	a2620c9d2ff84f7ba10b3227959d7d3994df1339096db4f6544e64da37fb50bc	f14e5cf9-7696-4734-ab01-10cbd88fd6ea	2026-10-10 03:06:47.344-06	\N	\N	2026-10-03 03:06:47.356406-06	curl/8.21.0	::1	\N
22	34	d90ea044142aa4997b558e37dd77b569f2437bf6a49bad57aa9b2ed45224e6a7	3a8abbb1-75ea-4da2-8e87-344955f20b29	2026-10-10 03:07:03.603-06	\N	\N	2026-10-03 03:07:03.604493-06	curl/8.21.0	::1	\N
23	34	1daecb37cfa1ea049037028f6cf9be80ebdac721099a83b5b0a82ad1c05a6352	d20c4dcd-fb2f-41fb-8b9a-5b800fe80ed6	2026-10-10 03:07:14.486-06	\N	\N	2026-10-03 03:07:14.488065-06	curl/8.21.0	::1	\N
24	34	b02f089412d41ebaf3d00c6bb6cd6b9f0f7592b2693124fb6227e9c83dae913a	abfa9b3a-6505-4ceb-a4ee-a5f4b5b5a89b	2026-10-10 03:07:36.646-06	\N	\N	2026-10-03 03:07:36.647573-06	curl/8.21.0	::1	\N
25	34	7fa47c46b179ed8f097e8c7ad6a335ac455f51de251637036a0880d8c7167b8d	76e42e84-d49e-4e04-9883-8e99a177087a	2026-10-10 03:10:04.062-06	\N	\N	2026-10-03 03:10:04.064494-06	curl/8.21.0	::1	\N
26	34	69b2289074f3eb6ff47b18ea87f77f4ef103329bfe87f170f079e87b40e1997a	6e68cd93-a971-4deb-948e-d345d9a6cd43	2026-10-10 03:10:46.087-06	\N	\N	2026-10-03 03:10:46.090989-06	curl/8.21.0	::1	\N
27	34	0b918ff33d0b8d55ce732ab65590b35cecaba4db75fa5d22c73450aa420e0fc7	42338a66-d01b-403e-81de-5023f0179221	2026-10-10 03:11:39.127-06	\N	\N	2026-10-03 03:11:39.134263-06	curl/8.21.0	::1	\N
28	34	75a8cec6b28feb12d1af698e8023002a9dea54aed8b94ad7e960d51116dde7bb	6c819882-bf6a-4b25-9075-1df881cf68d3	2026-10-10 03:17:28.247-06	\N	\N	2026-10-03 03:17:28.251374-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
29	34	4ce0645036f69b5feefc81eef2e1b13abb0ffe5ed349c1611d98a49b9a94a3be	18f0779c-a933-49e5-95c4-985fa08379a2	2026-10-10 03:18:54.703-06	\N	\N	2026-10-03 03:18:54.70568-06	curl/8.21.0	::1	\N
96	35	4d4e309d8cb8d32fb931ac93f957e29d3ca7bb6355c15b85bba0169f8ee8c93a	9408a1b5-47b4-4749-8f4b-721db695cfdb	2026-10-15 03:40:37.586-06	2026-10-08 03:40:56.600497-06	\N	2026-10-08 03:40:37.587387-06	curl/8.21.0	::1	\N
102	31	f7218fc7fb8bd2630a5d0e0f1e92a3bc72f291483826974d7c2b4e0a24caa14b	ad48aafb-853f-4128-a7d1-84ea655b943a	2026-10-15 03:54:15.83-06	2026-10-08 03:54:29.518421-06	\N	2026-10-08 03:54:15.832823-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
103	31	642d9515e704a2fd3df97f9123c55391d22e20729270dba6ae71b03a74af3e69	f5156641-d0e0-4b9a-9a88-bff9bcf59f6d	2026-10-15 03:54:39.367-06	2026-10-08 03:54:41.636414-06	\N	2026-10-08 03:54:39.369331-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
107	40	183e5704f4c6fa53152cc784a1d925a218bbf8a5f7cf4a55d8a9c581d55335d3	7bcee2b2-9071-4833-9f31-5dd9b27bd114	2026-10-15 04:07:00.844-06	2026-10-08 04:10:44.541055-06	111	2026-10-08 04:07:00.852876-06	curl/8.21.0	::1	\N
112	2	9d331c76de029e0a112b3a4770f15a2d0fb820f37568c9d95108f1aee8ab8a8b	a7b72a3f-6647-4dad-a522-48fb6097591f	2026-10-15 05:10:37.891-06	2026-10-08 05:10:41.733181-06	\N	2026-10-08 05:10:37.896153-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
34	36	a15184cca0593c199761969c2f4f3adf155733f832bb13d36a66cbd332696c48	cffcefec-e546-4d80-8e4e-d7b036809365	2026-10-10 03:32:38.383-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 03:32:38.386542-06	curl/8.21.0	::1	\N
32	35	2bdc52ead7d976208eaaac3c5b00165508f2c4f3e1e5d993821e19daf0819615	b6813306-3b28-4dc3-b510-2c561facd028	2026-10-10 03:26:59.922-06	2026-10-03 10:50:56.346355-06	\N	2026-10-03 03:26:59.923731-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
37	35	a937fb8a56beae0244b81419543ac9620bf973bb576b439396c2918004d198a2	49776557-a58f-4128-a18e-ef22a853d809	2026-10-10 10:26:41.825-06	2026-10-03 10:50:56.346355-06	\N	2026-10-03 10:26:41.827588-06	curl/8.21.0	::1	\N
116	31	751f5e2b31ca10616f553ea80289b616427e00b45e3b126d9b5e4c3b760ccea3	d3930fb2-dca7-4e2f-9127-2547721c0259	2026-10-15 05:31:15.063-06	2026-10-08 05:31:17.309346-06	\N	2026-10-08 05:31:15.064154-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
118	31	75a6698cc044166435ea4fef2ac3470ed6d009008984cd7652e18e4603739b08	d114ce9b-8639-4a59-942a-04a815ccf028	2026-10-15 05:31:31.945-06	\N	\N	2026-10-08 05:31:31.946176-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
97	36	44b480b67b1ae0bbdf8bf8afd9233469fa018be8c34146458c7dd588ed3988f8	ff0bb9a9-d075-4ecc-9a8c-dc780c3b26ce	2026-10-15 03:41:22.187-06	\N	\N	2026-10-08 03:41:22.189819-06	curl/8.21.0	::1	\N
40	36	477e02e2210720f6dc45e4a86f756e1cb42efc428c78b737ed25aafde4ebcece	d73c8531-154d-4935-a9e6-800a51824624	2026-10-10 10:28:36.793-06	2026-10-03 10:28:36.82953-06	41	2026-10-03 10:28:36.799103-06	test-agent	127.0.0.1	\N
30	36	e322766ea74166801784870f01a5095d6893f0ec0ab3cc9f1a754e4370476b9b	905719ef-ebcf-49d6-b287-b2692d0305f8	2026-10-10 03:24:42.553-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 03:24:42.556774-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
31	36	a28bd539ed1de95dba50057956ab08c535f9e178cfeec5307a1ceada140e0e87	eafa626e-da18-43d0-b4fe-3b74550c0950	2026-10-10 03:26:20.006-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 03:26:20.009023-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
33	36	c330661140222a5e0ba6be7e40fedb318ec2af169e9c5e3a76088bc71d8015c3	cba1976f-2dfc-438f-88d2-f1042da07743	2026-10-10 03:27:13.968-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 03:27:13.970953-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
35	36	ee8dc9a3b7114e530b2cc76ad283206230363fea4a217677eacd6daabc3c975e	118cea34-bbc1-412b-8b14-c979e9527512	2026-10-10 10:13:31.661-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 10:13:31.665193-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
36	36	f6821589b83e79a8a0396459254d8b87016a34c9a5a2e8fd93351d134f09f7ae	a8884c89-2740-4fc1-9e6d-f8c3a4646679	2026-10-10 10:26:16.618-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 10:26:16.621063-06	curl/8.21.0	::1	\N
38	36	e7271f95c61d6a95f3104e577ad39b77ab2a7552287541d6c99ecd779d74546b	6f16f8d7-f12a-48fb-b352-c43294c36009	2026-10-10 10:27:20.229-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 10:27:20.23137-06	curl/8.21.0	::1	\N
39	36	de20b32d1813b89178fbeec04062fdbea9934093a83c1ae1c987528e1fa0a1c3	0c9b2fb3-7e2f-4db7-961e-6d4163b3e2f0	2026-10-10 10:27:41.468-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 10:27:41.471524-06	curl/8.21.0	::1	\N
41	36	94d5922891e431259c691e0c3cadca3901ceef863dc819e5ef1b252c8672dd21	5482492c-8e93-4609-8396-c63eacce7f4d	2026-10-10 10:28:36.837-06	2026-10-03 10:28:36.850174-06	\N	2026-10-03 10:28:36.838339-06	test-agent	127.0.0.1	\N
98	39	573fe352d4c3abda2bca9d6e25f560796aca1a8c060d9f21ff2d6e9b7289bf8b	70285736-8aef-4de5-98cd-30dbcf23ba61	2026-10-15 03:41:28.518-06	\N	\N	2026-10-08 03:41:28.520145-06	curl/8.21.0	::1	\N
42	36	5a27bd632263626fb9ec0eafbc3582225ad236df2b9623e5e1b515a1b03a6951	c2220f6f-774f-4323-8c08-d19a3ddee4ed	2026-10-10 10:30:50.606-06	2026-10-03 10:30:50.644421-06	43	2026-10-03 10:30:50.61208-06	test-agent	127.0.0.1	\N
43	36	1f3a4d9a59c9e4250eddc7adfc5751ca5ae6f40eef9e3898a888914e3f3011a7	eaf753ec-0505-4d03-8c1d-bf34c4bc7126	2026-10-10 10:30:50.648-06	2026-10-03 10:30:50.657461-06	\N	2026-10-03 10:30:50.649007-06	test-agent	127.0.0.1	\N
44	36	6adf529c786772b13501fe6ed14fd6fcd6e2100e4edc9416df4f930fe485ec24	aababeb2-ad5c-425b-814a-0616f649e1ef	2026-10-10 10:35:45.955-06	2026-10-03 10:43:20.301625-06	\N	2026-10-03 10:35:45.959622-06	test-agent	127.0.0.1	\N
104	31	fd84b5e98b8e0a8a9f69d08dcc6e79faf711ab009769f039c0eac90026dd24ca	2fed8f37-9bb0-45ec-becd-25ef145094d6	2026-10-15 03:55:15.884-06	2026-10-08 03:55:20.060557-06	\N	2026-10-08 03:55:15.886494-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
45	36	81df017e708148664fa7186aa8753c1057ed45fe9953198ecfc9b49093517c76	478bfbd8-7ad0-42bf-8f05-ad8e52d41b1a	2026-10-10 10:43:20.926-06	2026-10-03 10:44:17.281399-06	\N	2026-10-03 10:43:20.931276-06	test-agent	127.0.0.1	\N
108	36	b0c349f186220ec02cdbb82c9846f4ddb0e04b0605006254aa9e522086ee5eb6	f7df1620-1cd6-42ad-96ab-0d73709107ca	2026-10-15 04:08:01.772-06	\N	\N	2026-10-08 04:08:01.774232-06	curl/8.21.0	::1	\N
46	36	1fc5106f7bd89890f036113fe9423dadb0c96b01a46fe42a11dfff7a3c4eace3	53a770c3-dcfe-4e62-a960-1bf9590907fe	2026-10-10 10:44:17.857-06	2026-10-03 10:47:27.97179-06	\N	2026-10-03 10:44:17.863154-06	test-agent	127.0.0.1	\N
47	36	2463bedb3ac90975d038f222680820e69bec965c37a01e03017be0d433ad2d11	6f30fc61-b9a1-4814-929d-c32cc8dd14f5	2026-10-10 10:47:28.589-06	2026-10-03 10:47:30.957181-06	\N	2026-10-03 10:47:28.595055-06	test-agent	127.0.0.1	\N
99	40	a283ff3f7b35d20aa9b655621ed8ecb45b4468939a19ef3dba732cf42bb04a85	269f21c7-0671-4b06-b078-a9b9d53e5413	2026-10-15 03:41:34.635-06	2026-10-08 04:11:23.919952-06	\N	2026-10-08 03:41:34.636845-06	curl/8.21.0	::1	\N
113	31	bdfaf562ceb06cea60d8de98e3cc7f026b2bbec5684b899d62872a487399dd08	0ddcc3ad-d8e7-4321-99f1-6f69ffd9da24	2026-10-15 05:10:46.362-06	2026-10-08 05:10:49.529816-06	\N	2026-10-08 05:10:46.36405-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
49	36	14e28fe5104aa68df80f52b5d06d8e7647653e4a241aece0cbe570dbbecdd4bf	85e2572b-a6aa-4903-8ddd-11830f51500e	2026-10-10 10:47:31.849-06	2026-10-03 10:47:31.859969-06	50	2026-10-03 10:47:31.85042-06	test-agent	127.0.0.1	\N
48	36	ce91fc6f6835d48f4c099be37be56024458eb1b65ae062af89dd4c1dcd83b129	032634b5-57b2-44ce-825a-6e6cf391d5f2	2026-10-10 10:47:31.24-06	2026-10-03 10:47:34.666997-06	\N	2026-10-03 10:47:31.241814-06	test-agent	127.0.0.1	\N
50	36	411eea4075af4889c26db24e301022d9e1392a8cc07bc19368ccd268782f0a59	686022d2-29ce-48c5-9eb9-e4a3f9d3e8e0	2026-10-10 10:47:31.862-06	2026-10-03 10:47:34.666997-06	\N	2026-10-03 10:47:31.863133-06	test-agent	127.0.0.1	\N
119	2	3659076b2d1f32ec6d5571894b20de4d9e51325d566356de277d51fc4e232c7c	d7ca5776-afb9-4ce7-bc98-5807b80dc835	2026-10-15 23:43:58.205-06	2026-10-08 23:44:02.055637-06	\N	2026-10-08 23:43:58.20841-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
51	35	34b343fff067b1818b4231c677421d8c9e78d340ada4a91145cbbf80b9b41d9a	48354281-9d2f-4ccd-a795-7e104ab53251	2026-10-10 10:50:56.296-06	2026-10-03 10:50:56.335834-06	52	2026-10-03 10:50:56.300689-06	test-agent	127.0.0.1	\N
52	35	d8412af5f66b2de6955df73d7ed198978e044cacc16881d28db98e285ef6f0f9	56c4d7cd-16ce-4b9b-a1fc-981663d046da	2026-10-10 10:50:56.34-06	2026-10-03 10:50:56.346355-06	\N	2026-10-03 10:50:56.340753-06	test-agent	127.0.0.1	\N
53	35	95a24b2c7289dd44a36fc714ff744fe2994961788feb3fb08df6834cd70e2c00	c00484a3-987d-42ae-b3bc-1cbae9e22aac	2026-10-10 10:50:57.209-06	2026-10-03 10:50:59.075287-06	\N	2026-10-03 10:50:57.21012-06	test-agent	127.0.0.1	\N
121	35	74795df60869cb475b77f0f3c5688a69afe2e0bf1daa665af57127936f86da63	75d78898-a252-4f3a-a5b4-d71ab45ee44d	2026-10-15 23:57:53.387-06	2026-10-08 23:57:53.665336-06	122	2026-10-08 23:57:53.39515-06	node	::1	\N
109	35	7ea7cbc48d0a541d00a00ac799d6b656e76ca946a7bfc5b92e87468a8b849025	a2e3af07-9bcc-4fc4-822c-6dcae93ccc75	2026-10-15 04:08:17.719-06	2026-10-08 23:57:53.689073-06	\N	2026-10-08 04:08:17.720992-06	curl/8.21.0	::1	\N
57	35	da874f67a6e6159b5be864341dab662ef9ae7270d4c9b722e3e42a5b1f190d06	4a8c0e2d-5fe4-4a7d-9b0f-4360121e0f8b	2026-10-11 03:52:59.309-06	2026-10-04 03:54:07.065847-06	59	2026-10-04 03:52:59.317641-06	curl/8.21.0	::1	\N
54	36	92b276091149984f29c36592c80abf819a4028c2d5e49805af8b11b3c77ebc9b	e3b1567a-da4e-4f11-9259-15c22062fe3f	2026-10-10 10:50:59.365-06	2026-10-05 19:18:31.747859-06	\N	2026-10-03 10:50:59.365729-06	test-agent	127.0.0.1	\N
55	36	fef2c35d12b86d74ee11958a354d3a8edeec11ee5a8112fcc288439a12d64475	d8ecc0b3-17ed-4a3e-866a-1f31ccaa6da0	2026-10-11 03:42:53.531-06	2026-10-05 19:18:31.747859-06	\N	2026-10-04 03:42:53.536791-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
56	36	16ba8cd17e46e3d6f8a041eab80fb77923b1c12ded8048050f4f9a74a213926d	0c3e621f-78a6-480f-b730-859f36887662	2026-10-11 03:44:30.312-06	2026-10-05 19:18:31.747859-06	\N	2026-10-04 03:44:30.314941-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
122	35	483845e839772383c91503e0d3d5ca72b523e018916f731cb166c96d35d6f212	60c6efdb-f435-4ead-95a6-040a8dd2c61d	2026-10-15 23:57:53.67-06	2026-10-08 23:57:53.689073-06	\N	2026-10-08 23:57:53.671825-06	node	::1	\N
86	35	9255e5593e1c8f2d6d92053fffa72d1572b24a12b6b11824033fd84fa6fdf605	f3e5f6a9-6af8-47a6-9bf2-8283864e74eb	2026-10-15 03:24:36.121-06	2026-10-08 03:25:24.879783-06	90	2026-10-08 03:24:36.124241-06	curl/8.21.0	::1	\N
90	35	ddc89f96b31d6ea02536a4a5b3a5ca64f2bd64c0d022afb529a4f062dad0399f	ec626cac-6af3-42e4-a969-a83adfd307fd	2026-10-15 03:25:24.944-06	2026-10-08 03:28:02.861604-06	\N	2026-10-08 03:25:24.94648-06	curl/8.21.0	::1	\N
92	40	b97de1d3d28eb2823467ffdb3bf65e107ae9123fc90bd85acfd1e02bcc3ec69c	42488922-82d6-4b14-9a31-ba283bf77c4c	2026-10-15 03:26:50.083-06	2026-10-08 03:31:04.589347-06	93	2026-10-08 03:26:50.0859-06	curl/8.21.0	::1	\N
123	35	b5c966707a0e40c9b5487d43e773fa6d3d82273111dc11fc6952cfdbf6f6f9e4	bcc33685-2ceb-4229-a6c0-f39336b9142f	2026-10-15 23:57:54.51-06	2026-10-08 23:57:56.630944-06	\N	2026-10-08 23:57:54.511925-06	node	::1	\N
100	2	394b632ee032c9fee44f4abafbd14cc3210148cb9bb7a12c1b9d980292c7a338	fcc1904a-5764-4f03-92b8-9e7c3b330ef2	2026-10-15 03:51:02.972-06	2026-10-08 03:53:50.271794-06	\N	2026-10-08 03:51:02.97582-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
105	31	2ea6dcc3f8555379c016bde5dead68f4ba717fff6768f72ea309e109d3270a25	940e9bda-4cfc-450e-bf1a-2f99abb22e91	2026-10-15 03:58:27.859-06	2026-10-08 03:58:36.386576-06	\N	2026-10-08 03:58:27.860946-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
110	39	ff049ac0f7205191d6d6066aea03b95391d0fd2ec526d543f3457e8bede02678	153e514d-d575-4e6f-b917-05d072b27908	2026-10-15 04:09:08.986-06	\N	\N	2026-10-08 04:09:08.987356-06	curl/8.21.0	::1	\N
62	2	c7df8e88b4ff1a65fc7e5427f4320d4cf3a136c2220687210b475f00b4f94236	b105d350-a920-4e26-b9b6-c5d7f82570ad	2026-10-12 15:37:43.665-06	2026-10-05 15:37:56.450002-06	\N	2026-10-05 15:37:43.667226-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
114	31	ce4abbd7c1a8f3bb2d95ebe9ba7c7c5ae375dba206a0964518d3f0eb25c66968	4f9550cf-6106-4ca5-b9a8-31ef79c61af3	2026-10-15 05:12:20.416-06	\N	\N	2026-10-08 05:12:20.418872-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
63	2	716413d9e80a2ceca01a3e3ebfaa8bc1252d0df045afebfd19cd6fa805d629e6	61a6eab9-feae-4b6d-9340-1d1619d16464	2026-10-12 19:09:30.223-06	2026-10-05 19:16:41.714373-06	\N	2026-10-05 19:09:30.225398-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
64	2	fe2e3dff6818aad29b6df03b31cddbfc3aa771934d686eb3059d017862f24ad8	e35e757b-c6e2-4cc3-9f81-4ca78a56db92	2026-10-12 19:18:02.288-06	2026-10-05 19:18:07.329223-06	\N	2026-10-05 19:18:02.291104-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
61	36	d277c0a9c20eb10d82513a9a7b7dff3b2963835e847c39de73a9eb36d8a33a90	6b46a899-805d-4e3a-8b94-e540445949e8	2026-10-11 03:58:32.807-06	2026-10-05 19:18:31.747859-06	\N	2026-10-04 03:58:32.809526-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
65	2	5dfe9a82141ed5a9a6d08f2428100cb017c4c67d11e34d8d8f117160a4b390f7	a23f26b9-297b-4386-aca7-bc8cbb0a9c21	2026-10-12 19:18:17.208-06	2026-10-05 19:18:32.72483-06	\N	2026-10-05 19:18:17.209144-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
66	2	5ea18feb807c1f638e1c6454ba74512edef3345b4754a3f28d054eeb73d2fcdf	fbb742a3-c357-4461-a6bf-7c86e09861de	2026-10-12 19:23:19.187-06	2026-10-05 19:23:21.285713-06	\N	2026-10-05 19:23:19.189413-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
67	36	fccbc2bc3f5ac5cfe1a52425e51e5574d2f550e481cc742d8de794ac77333270	76229e9a-251c-4454-b3b4-53d08bb2e101	2026-10-12 19:24:48.612-06	2026-10-05 19:24:51.052236-06	\N	2026-10-05 19:24:48.613396-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
68	36	9dc47ad556875521fa75e6db2884b790ac7beda762cd2e65a955e77b6472e5c5	654a7372-6264-4f62-9547-f647f61dfa95	2026-10-12 19:25:01.97-06	2026-10-05 19:25:03.686008-06	\N	2026-10-05 19:25:01.972139-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
69	2	968c2f8b05e75e62489e2ac9136045bcec9cb41cccb052343f4176da840208b9	5281bd57-f25d-45d5-a1a7-aeb453854a81	2026-10-12 19:25:17.9-06	2026-10-05 19:25:37.115906-06	\N	2026-10-05 19:25:17.901576-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
70	36	3b6391df9c0d343f20e0424565b43b9089942c10ecb5711b7332f3f86fb80a0d	ad0cfc1c-1841-41db-96bb-68c0d6ba509b	2026-10-12 19:25:45.801-06	2026-10-05 19:25:52.304707-06	\N	2026-10-05 19:25:45.803193-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
71	2	7967973a9aa71bbeb9983a4c38cb0f5dcd4b125f01d35ae317e28e1b3974b9ee	7aba37c0-6512-45b5-b7d1-99b2bf17391d	2026-10-12 19:26:13.219-06	2026-10-05 19:26:37.545245-06	\N	2026-10-05 19:26:13.221523-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
72	36	bc61769139dff02b2bc8f900c7e8349469c2da942092238800908d62793383c0	e5216476-b18d-4265-97c6-99bdbba0ee61	2026-10-12 19:26:46.547-06	2026-10-05 19:28:45.362585-06	\N	2026-10-05 19:26:46.548982-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
73	2	d7fd886dd8da910a51cfee0cbe579375e5ffb671f0f9d03533a4a4dbbee77900	2f5ecb0c-03b2-4945-9e52-29e8c0b6f5e9	2026-10-12 19:29:25.28-06	2026-10-05 19:30:51.474588-06	\N	2026-10-05 19:29:25.282816-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
74	36	431eee7db5aa0d2c3a5c7789429c61045d6b4f64316e917b0c6ca6a5535da786	436648ea-1670-4ee4-85cb-e189758bec00	2026-10-12 19:31:13.876-06	2026-10-05 19:33:11.602395-06	\N	2026-10-05 19:31:13.877845-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
75	2	eac7573dd01f9a54ee56c3e2ef992b756bde351b8e0979d8805dedc6e437ce9f	cdf64173-5233-4ff7-8e47-3afb5b74109f	2026-10-12 19:33:18.929-06	2026-10-05 19:34:06.162955-06	\N	2026-10-05 19:33:18.932743-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
76	36	ed1b5bbac292352d2a0df1ae5cae474c24873ff6e6163fdefb49e37a7128df3d	7e6aad60-dba0-4cfa-938f-87e81637d2b0	2026-10-12 19:34:14.676-06	2026-10-05 19:36:27.264909-06	\N	2026-10-05 19:34:14.678586-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
77	2	2a0bb60b10153888fa9aea5e8098c28ac800fe0ce4c50698bc1bf435f92193cb	b5e40faa-685b-42c5-853c-a9c20e0f1c74	2026-10-12 19:36:37.039-06	2026-10-05 19:38:23.298028-06	\N	2026-10-05 19:36:37.042135-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
78	2	2ea12db67365ed620d9e5e22da4a1b1464c350a932a5ef3788ec099d578e4c97	896f1600-5ce8-47ad-8eac-b1b6dc252bd2	2026-10-12 19:38:28.277-06	2026-10-05 19:39:09.628716-06	\N	2026-10-05 19:38:28.280402-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
79	36	e4181716b102caf7cf6bf7b67ab8c313c86eab6787f18503276cf52690470d76	521ee0e7-47b9-4ad2-9f4b-5d1df7b39b47	2026-10-12 19:39:26.063-06	2026-10-05 19:40:21.666291-06	\N	2026-10-05 19:39:26.065676-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
82	2	19a406b49cc31aa4e045f53ee3d1ac411da135040f917ad4a7bc92b6ea34ebb8	f78ed629-9826-4aec-b52f-d08a4e9b04d7	2026-10-12 19:42:46.49-06	2026-10-05 19:43:46.164088-06	\N	2026-10-05 19:42:46.49272-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
83	2	a9f81e16d17079adab52e2307c72ad8598e72006fac7292e9b8999cd83858224	379ee438-f0a0-4565-ba58-209de0c71aa4	2026-10-12 19:48:21.999-06	2026-10-05 19:49:24.943048-06	\N	2026-10-05 19:48:22.001354-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
84	2	167ac6d58915830bcecdde1e615aa8b0ad2c5bd3d2fda1d065dd598990899767	002f5655-3e58-406b-852f-debac86883f1	2026-10-12 19:49:40.404-06	2026-10-05 19:50:35.863808-06	\N	2026-10-05 19:49:40.405885-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
85	31	ba6d37404c753ebf3efa2b5ac10bd8fbf328a2df0e1f19b58bf5b221b84c883a	733f9360-1720-458c-a74e-873013076e6d	2026-10-12 19:50:41.047-06	2026-10-05 19:51:20.489963-06	\N	2026-10-05 19:50:41.048758-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
88	39	7852aea73ec2c5cac963a325aab0036bed37d52f4a5d0050a87794ddb6bfb602	c62a04aa-485a-417e-b53a-2a8dc3cd3a5f	2026-10-15 03:24:54.68-06	\N	\N	2026-10-08 03:24:54.68347-06	curl/8.21.0	::1	\N
91	39	d113bf27400f7e795bc2d9b0f7be709a27c057ecc32204477da09198f8cefa10	d8c13f3b-4fe2-4bef-8995-12467824b5dd	2026-10-15 03:26:06.985-06	\N	\N	2026-10-08 03:26:06.986563-06	curl/8.21.0	::1	\N
87	36	36a1a04058de5e2778954bb48e2236289a7e8073c6ca8ccb3fffaa5d16ca9d09	73926c0c-b05b-426c-b0c9-f7c4e6ea817f	2026-10-15 03:24:48.339-06	2026-10-08 03:29:29.619694-06	\N	2026-10-08 03:24:48.341751-06	curl/8.21.0	::1	\N
89	40	b78090ba0a1f18bfac842f401f9a7faf5f1fa7a0cd1a6ce64f4198c85908c221	933ca521-4c5e-437e-99ba-26470fbce6de	2026-10-15 03:25:06.539-06	2026-10-08 03:31:18.658796-06	\N	2026-10-08 03:25:06.540277-06	curl/8.21.0	::1	\N
58	35	403b33f766854bee2cdfaf6e6bba6303df8dcc73e16d24168c7fcd11be065415	47cfee86-2270-4e92-824d-92a324e4a586	2026-10-11 03:53:07.005-06	2026-10-08 03:28:13.056394-06	\N	2026-10-04 03:53:07.006961-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
59	35	89b3dd94f87ea7186f31e0f230e9ee13773f2ab5b1d48fa950963c716951c165	da54fbd9-4d5c-47e0-aba7-3c463298a60f	2026-10-11 03:54:07.081-06	2026-10-08 03:28:13.056394-06	\N	2026-10-04 03:54:07.082574-06	curl/8.21.0	::1	\N
60	35	0e6848f6e0747ad4fca9416b36d161e1c336cf9eda88cefbaf411847116f28e9	43ae21e6-8991-456c-9602-201155899cea	2026-10-11 03:55:04.085-06	2026-10-08 03:28:13.056394-06	\N	2026-10-04 03:55:04.087708-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
80	35	f8bbf1eec8f3cbd2e5c78e6a2aa99e9469220f3b560eba8facbbf174f1802824	ef3097b6-bf49-42c9-92d1-fe74c090ac12	2026-10-12 19:39:57.363-06	2026-10-08 03:28:13.056394-06	\N	2026-10-05 19:39:57.368334-06	node-fetch	::1	\N
81	35	ad6a21f03a16af3ef1e62ecc52278770631405dac2b799f9897aeaa6bb565583	3957efc4-cdac-4210-b027-0faeeec1a366	2026-10-12 19:42:34.618-06	2026-10-08 03:28:13.056394-06	\N	2026-10-05 19:42:34.698065-06	node-fetch	::1	\N
95	35	044e330b89b493e16b21ea1a860830d69af61bb19f3cda76b3c34f2b6ecbcd55	f805828e-d33d-47f1-8636-5d510b20b19a	2026-10-15 03:38:41.128-06	2026-10-08 03:39:15.908956-06	\N	2026-10-08 03:38:41.131592-06	curl/8.21.0	::1	\N
93	40	b6f442d256a3ae2d4bd7e0c5520c6c8f6cf301bce08e3f5a1b78661871315b7a	b15446e6-2786-4ee1-a3ef-07aa0b179f28	2026-10-15 03:31:04.6-06	2026-10-08 03:31:18.658796-06	\N	2026-10-08 03:31:04.602275-06	curl/8.21.0	::1	\N
94	35	037bc1e937a5471cc5693a02f0088a8c62429d619481a709ddc3eb5d7699dce3	73cc447c-1837-457e-9a2c-246f0e38fbd8	2026-10-15 03:38:11.364-06	2026-10-08 03:38:41.119556-06	95	2026-10-08 03:38:11.368115-06	curl/8.21.0	::1	\N
101	31	741e2b58746ce19d16f6e43fd333f8b5b05519593504644d9dd5f1557ee17f36	47dac433-3307-4739-b91c-772d7fc2e648	2026-10-15 03:54:03.609-06	2026-10-08 03:54:08.718312-06	\N	2026-10-08 03:54:03.612502-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
106	31	117ed0cc35913d001fc6a282bf9cba26f507d5a2e97a8c1249b48a69c38cee5d	15d14d40-7845-47b0-a77c-b1e2c67773a9	2026-10-15 04:00:22.748-06	2026-10-08 04:01:18.142212-06	\N	2026-10-08 04:00:22.754267-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
111	40	1062508c363219933bea5314aa304301d125367a0cad95c1585896d0051d3b28	73d67db2-698a-40ff-9438-ae0f6155ef9b	2026-10-15 04:10:44.551-06	2026-10-08 04:11:09.107349-06	\N	2026-10-08 04:10:44.552393-06	curl/8.21.0	::1	\N
115	31	072bdc00dda55779514d5f34d18fbf1272a524ce735d36fa290037b1185b7502	aeb99ea1-851d-4a7d-9eb1-774c35e53016	2026-10-15 05:31:09.05-06	2026-10-08 05:31:12.390994-06	\N	2026-10-08 05:31:09.052819-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
117	31	20119791fc63b70e996759a447d6aedb5f6ca39fba052a3e5f3d9eba2fad5ad0	e82a4946-2bc3-4967-bb7b-aec65525a4e1	2026-10-15 05:31:21.077-06	2026-10-08 05:31:27.784781-06	\N	2026-10-08 05:31:21.078661-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
120	31	55881dbe13468911754372a118913adc62e2100f1ec475c5ff91f12d73bed73f	02036d1e-f965-4c4b-b2ad-a16ed80f14c3	2026-10-15 23:44:11.564-06	2026-10-08 23:44:15.110762-06	\N	2026-10-08 23:44:11.565583-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
124	35	26015004535c752c12f6ff05c01d33d742e05f499570a8af8d894fc5eb0711da	76680b9d-4477-4258-a45c-7b2b4cd1c849	2026-10-15 23:59:31.562-06	2026-10-08 23:59:31.728639-06	125	2026-10-08 23:59:31.564382-06	node	::1	\N
125	35	efa0a099e049f0479fc77b1c7b490046815b16816a9ee49a31a151f71947b407	19c6c1ad-473f-4337-8957-eb35fdb74975	2026-10-15 23:59:31.73-06	2026-10-08 23:59:31.740511-06	\N	2026-10-08 23:59:31.731337-06	node	::1	\N
126	35	63aae8a4f119cc1c9cc71b608c8b8e1d99f86a11385e9ed846370833e5b99aec	e855ffe5-14fc-4750-83e7-11b87bf6ba18	2026-10-15 23:59:32.526-06	2026-10-08 23:59:34.314061-06	\N	2026-10-08 23:59:32.527919-06	node	::1	\N
127	2	689b1b039dcb87e1ccdff48f51d361d137f72a4604db74ae8fb3a12e6fbf9868	701b4ced-e979-4c5a-9e98-e5b52f22c97f	2026-10-16 00:06:02.738-06	2026-10-09 00:08:24.248865-06	\N	2026-10-09 00:06:02.739398-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
128	2	9bd8a8a24ac64155396bd62827419c0aba38632b5331154fb09921d8e704fa2d	1850bfae-f47b-43af-ae4e-549c97d50d4d	2026-10-16 00:08:36.618-06	2026-10-09 00:08:55.685555-06	\N	2026-10-09 00:08:36.620145-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
129	31	5b838b0bf8c90d39688ba30e103f08c1e93e0b9ab2f4beb473d1515d29d26b14	f06d6c5d-d536-401f-8f2d-ffd646827341	2026-10-16 00:09:02.643-06	2026-10-09 00:09:18.873716-06	\N	2026-10-09 00:09:02.643935-06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	::1	\N
\.


--
-- Data for Name: rol_permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol_permisos (rol_id, permiso_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
1	13
1	14
1	15
1	16
1	17
1	18
1	19
1	20
1	21
1	22
1	23
1	24
1	25
1	26
1	27
1	28
1	30
1	31
1	32
1	33
1	34
1	35
1	36
1	37
2	9
2	13
2	21
2	30
2	34
3	9
3	13
3	21
3	30
3	34
4	9
4	10
4	11
4	12
4	13
4	14
4	15
4	16
4	21
4	22
4	23
4	24
4	30
4	31
4	32
4	33
4	34
4	38
1	38
1	39
1	40
1	41
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (rol_id, nombre_rol, descripcion, activo, fecha_creacion) FROM stdin;
1	administrador	Acceso total al sistema	t	2026-10-02 11:05:54.790049-06
2	profesor	Consulta su horario y materias	t	2026-10-02 11:05:54.790049-06
3	estudiante	Alumno: solo consulta horarios y materias	t	2026-10-05 14:38:01.944803-06
4	editor	Editor: gestiona contenidos	t	2026-10-05 19:30:05.282733-06
\.


--
-- Data for Name: salones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salones (salon_id, edificio_id, nombre_salon, tipo_salon) FROM stdin;
1	1	B4	Taller
2	1	B3	Aula
3	1	B2	\N
4	2	101	\N
5	2	102	\N
\.


--
-- Data for Name: solicitudes_recuperacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes_recuperacion (solicitud_id, usuario_id, motivo, estado, fecha_solicitud, fecha_resolucion) FROM stdin;
1	3	Olvidé mi contraseña de acceso	PENDIENTE	2025-10-18 20:53:31.158449	\N
2	3	Olvidé mi contraseña de acceso	RESUELTA	2025-10-18 20:57:07.405418	2025-10-18 20:58:41.404439
4	18	wa	RESUELTA	2025-10-18 21:26:03.952768	2025-10-18 21:26:29.670535
5	18	hgvgvh	PENDIENTE	2025-10-19 01:07:57.981867	\N
6	21	se me perdio	RESUELTA	2025-10-22 20:13:11.210213	2025-10-22 20:13:50.430753
8	31	vhvbjh	RESUELTA	2026-10-05 17:40:33.252506	2026-10-05 19:42:36.401816
7	31	nj	RESUELTA	2026-10-05 15:37:03.818061	2026-10-05 19:46:16.711834
9	31	dw	RESUELTA	2026-10-05 19:49:32.98921	2026-10-05 19:50:19.646568
10	34	test	PENDIENTE	2026-10-08 03:34:45.078265	\N
11	34	test	PENDIENTE	2026-10-08 03:35:18.847678	\N
12	31	hj	RESUELTA	2026-10-09 00:08:30.154069	2026-10-09 00:08:43.787557
\.


--
-- Data for Name: tipos_contrato; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_contrato (tipo_contrato_id, nombre_tipo, nivel_prioridad, descripcion) FROM stdin;
1	Tiempo Completo	1	Docente con máxima carga horaria y prioridad en asignación.
2	Tres Cuartos de Tiempo	2	Docente con carga horaria reducida.
3	Medio Tiempo	3	Docente con 20 horas semanales.
4	Por Asignatura	4	Docente pagado por hora/materia impartida. Menor prioridad.
\.


--
-- Data for Name: tokens_auth; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tokens_auth (token_id, usuario_id, token, fecha_creacion) FROM stdin;
5	3	KLE6@V%F	2025-10-18 20:58:41.396683-06
2	18	g7gR&P35	2025-10-18 21:26:29.6683-06
6	21	BgANBVV9	2025-10-22 20:13:50.429165-06
7	22	xEBTjePT	2025-10-24 06:29:32.489921-06
8	23	xA9s3JFS	2025-10-24 06:34:52.829691-06
9	24	#W&V8ewz	2025-10-24 06:38:12.142082-06
10	25	MRynD6Lu	2025-10-24 07:03:52.669967-06
11	26	2y6x&hyf	2025-10-24 13:57:17.764369-06
14	29	bLPpcFui	2025-10-26 05:41:04.918708-06
17	32	PDZH97eU	2025-10-26 05:55:07.115583-06
16	31	xXd4jWCE	2026-10-09 00:08:43.784987-06
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (session_id, usuario_id, access_jti, refresh_jti, ip_origen, user_agent, created_at, revoked_at, expires_at, status) FROM stdin;
1	34	edbd50a5-f63b-4a2c-90e9-f508a84289fd	781f7d7c-8d6c-426b-9f7a-6deaf1c9b5c9	::1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	2026-10-02 23:52:53.393622-06	\N	2026-10-09 23:52:53.392-06	active
2	34	175ee102-feea-4b3d-a287-697c8cf57619	094812e3-e078-4db8-9a0a-2d4baea8e593	::1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	2026-10-02 23:53:16.687054-06	\N	2026-10-09 23:53:16.686-06	active
3	34	aa8f6b78-de39-46db-909b-397ee886186d	67cda545-e4e2-4c4f-9f93-472b73bda6ea	::1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	2026-10-02 23:53:32.901795-06	\N	2026-10-09 23:53:32.901-06	active
4	34	cd078baf-0510-41b3-aaea-698b94c71c3d	b10aac93-ba2f-4d43-871d-cab94cc19851	::1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	2026-10-02 23:55:13.342788-06	\N	2026-10-09 23:55:13.341-06	active
5	34	112e8347-86bf-4222-a1e6-e34abcbc3e18	c3d87774-3e4f-4a2b-b96f-9b2026be10a3	::1	curl/8.21.0	2026-10-02 23:56:10.37757-06	\N	2026-10-09 23:56:10.376-06	active
6	34	d8340511-9004-4c64-9776-4c2cf6728f0d	b72153a1-1cc4-416e-9fab-06c88191296d	::1	curl/8.21.0	2026-10-02 23:57:02.368111-06	\N	2026-10-09 23:57:02.366-06	active
7	34	b92b8960-6f23-4588-8995-48e8235dcd8e	85a2a485-fa10-4e9a-8039-6b44c0a9b76c	::1	curl/8.21.0	2026-10-02 23:57:24.12499-06	\N	2026-10-09 23:57:24.123-06	active
8	34	d8fd08c0-2f1b-4911-a83f-1b903a12bc7e	a385b29b-8719-4bfe-83a4-e27787aaef68	::1	curl/8.21.0	2026-10-02 23:57:56.817387-06	\N	2026-10-09 23:57:56.815-06	active
9	34	56b71a7b-0f98-4cba-950c-d35410027612	d81d1f73-3185-441a-8e71-ec3f9b9f6ee5	::1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	2026-10-03 02:39:21.392453-06	\N	2026-10-10 02:39:21.389-06	active
10	34	961bd8ee-009c-4452-ba47-cf90db2138f6	ab4a3184-28bd-4ca3-a9fa-35ba3672a860	::1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	2026-10-03 02:39:39.167181-06	\N	2026-10-10 02:39:39.166-06	active
11	34	bc4a8707-f62e-4cb8-819d-163ce9d4f385	7a770f07-4752-4937-b85b-2e650d1095c3	::1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26300; es-419) PowerShell/7.6.6	2026-10-03 02:43:23.688247-06	\N	2026-10-10 02:43:23.687-06	active
12	34	9648b083-ea24-42ce-9555-b28b8ea94c5e	242a2beb-1d50-4d84-b943-7aef556ecd12	127.0.0.1	test-agent	2026-10-03 02:44:32.229749-06	\N	2026-10-10 02:44:32.226-06	active
13	34	0ad98923-8cff-438d-a621-876c016ababf	d8cf03f5-2c2a-4136-b9f8-b5646cf4062f	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 02:55:27.611374-06	\N	2026-10-10 02:55:27.609-06	active
14	34	035f53c9-a89f-4dd9-af1b-6bdfb708be59	c32c6035-fd73-4b7e-a124-e4b981d0bf6b	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 02:55:41.503383-06	\N	2026-10-10 02:55:41.502-06	active
15	34	4ee4d3e1-7003-4c70-8383-9d08a8a3b4b5	8b52f6c3-9654-4e0c-8a89-5d59f244674b	::1	curl/8.21.0	2026-10-03 02:56:52.282944-06	\N	2026-10-10 02:56:52.281-06	active
16	34	6ac1cd4e-f79c-4d77-9c82-b6b2fcb26353	042564d6-ecf3-430e-8ac4-a8b72d458d83	::1	curl/8.21.0	2026-10-03 02:57:44.321668-06	\N	2026-10-10 02:57:44.32-06	active
17	34	3df0a254-d69e-428c-999b-3d98607e9b52	e30de71e-c967-4431-93a2-bbefc6023c3c	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 02:57:59.265159-06	\N	2026-10-10 02:57:59.264-06	active
18	34	fc0bdc19-6bd7-4a00-b541-15bfc4826626	f03c0b4d-f879-440c-978d-0776c0f67757	::1	curl/8.21.0	2026-10-03 02:58:35.428057-06	\N	2026-10-10 02:58:35.426-06	active
19	34	63a22b51-935e-43d1-a57f-705d60f0781f	124fc4d4-9e81-49a1-a4a7-cbbe5a78d89c	::1	curl/8.21.0	2026-10-03 03:00:19.718232-06	\N	2026-10-10 03:00:19.716-06	active
20	34	ef03e3a2-a7f5-41fd-bd07-be7343f527bc	fb91051d-7a40-4f11-82c0-e5da4f75f77e	::1	curl/8.21.0	2026-10-03 03:01:26.122436-06	\N	2026-10-10 03:01:26.119-06	active
21	34	c17f4e45-f263-4100-bfc5-cc13177b179c	f14e5cf9-7696-4734-ab01-10cbd88fd6ea	::1	curl/8.21.0	2026-10-03 03:06:47.380787-06	\N	2026-10-10 03:06:47.378-06	active
22	34	280741a1-1985-4d60-b74c-cc00a920a1c2	3a8abbb1-75ea-4da2-8e87-344955f20b29	::1	curl/8.21.0	2026-10-03 03:07:03.609625-06	\N	2026-10-10 03:07:03.608-06	active
23	34	f3ceb132-1e7f-4e83-9367-a4ceeb5722a1	d20c4dcd-fb2f-41fb-8b9a-5b800fe80ed6	::1	curl/8.21.0	2026-10-03 03:07:14.49469-06	\N	2026-10-10 03:07:14.493-06	active
24	34	b7e05491-92f7-49a1-84fe-a8c4ad1ee90a	abfa9b3a-6505-4ceb-a4ee-a5f4b5b5a89b	::1	curl/8.21.0	2026-10-03 03:07:36.65413-06	\N	2026-10-10 03:07:36.653-06	active
25	34	26f61d44-8dc3-4cd1-a7e8-aa43f9e652ab	76e42e84-d49e-4e04-9883-8e99a177087a	::1	curl/8.21.0	2026-10-03 03:10:04.068296-06	\N	2026-10-10 03:10:04.067-06	active
26	34	fcc687dc-4003-4796-aed2-e4b8853beb25	6e68cd93-a971-4deb-948e-d345d9a6cd43	::1	curl/8.21.0	2026-10-03 03:10:46.103415-06	\N	2026-10-10 03:10:46.1-06	active
27	34	70d29be6-a15b-4456-8f52-2bf49f716bfb	42338a66-d01b-403e-81de-5023f0179221	::1	curl/8.21.0	2026-10-03 03:11:39.14484-06	\N	2026-10-10 03:11:39.143-06	active
28	34	2bf5cc64-c904-4f0c-9f8b-1ea4acec0799	6c819882-bf6a-4b25-9075-1df881cf68d3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 03:17:28.271566-06	\N	2026-10-10 03:17:28.269-06	active
29	34	4cc3b96e-efa6-47ac-982b-ece7802f66fb	18f0779c-a933-49e5-95c4-985fa08379a2	::1	curl/8.21.0	2026-10-03 03:18:54.714087-06	\N	2026-10-10 03:18:54.713-06	active
104	31	04ccbe07-661d-4414-ae2c-3c7777c24324	2fed8f37-9bb0-45ec-becd-25ef145094d6	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 03:55:15.902351-06	2026-10-08 03:55:20.079198-06	2026-10-15 03:55:15.9-06	revoked
107	40	8d18bfb0-4444-484d-8bd3-95e8d7a25b79	7bcee2b2-9071-4833-9f31-5dd9b27bd114	::1	curl/8.21.0	2026-10-08 04:07:00.863679-06	\N	2026-10-15 04:07:00.862-06	active
111	40	43e83c97-8af3-4347-b6df-abb3ff1b2eaa	73d67db2-698a-40ff-9438-ae0f6155ef9b	::1	curl/8.21.0	2026-10-08 04:10:44.555714-06	2026-10-08 04:11:09.119948-06	2026-10-15 04:10:44.555-06	revoked
114	31	1cc9efd6-08a2-428a-acf0-a33f0ef2c30e	4f9550cf-6106-4ca5-b9a8-31ef79c61af3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 05:12:20.445574-06	\N	2026-10-15 05:12:20.443-06	active
119	2	2711c9df-6d9c-47f4-87f7-196d45a40449	d7ca5776-afb9-4ce7-bc98-5807b80dc835	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 23:43:58.231572-06	2026-10-08 23:44:02.067335-06	2026-10-15 23:43:58.229-06	revoked
121	35	507b2dcb-4a65-4be6-b556-d8cd582c37e4	75d78898-a252-4f3a-a5b4-d71ab45ee44d	::1	node	2026-10-08 23:57:53.433148-06	2026-10-08 23:57:54.219021-06	2026-10-15 23:57:53.431-06	revoked
122	35	2bd11acd-f5fb-476c-bd8b-b0d03bf24492	60c6efdb-f435-4ead-95a6-040a8dd2c61d	::1	node	2026-10-08 23:57:53.675572-06	2026-10-08 23:57:54.219021-06	2026-10-15 23:57:53.674-06	revoked
41	36	aad5231d-b56d-4ae6-974d-36901e9f7753	5482492c-8e93-4609-8396-c63eacce7f4d	127.0.0.1	test-agent	2026-10-03 10:28:36.844253-06	2026-10-03 10:28:36.861265-06	2026-10-10 10:28:36.843-06	revoked
123	35	6665f34e-4a6f-471c-9bee-2819d90950fb	bcc33685-2ceb-4229-a6c0-f39336b9142f	::1	node	2026-10-08 23:57:54.514558-06	2026-10-08 23:57:56.633203-06	2026-10-15 23:57:54.513-06	revoked
43	36	7fc4bea8-6ee7-4387-884b-cc749908de33	eaf753ec-0505-4d03-8c1d-bf34c4bc7126	127.0.0.1	test-agent	2026-10-03 10:30:50.652191-06	2026-10-03 10:30:50.668729-06	2026-10-10 10:30:50.651-06	revoked
30	36	70673974-ce2e-4883-9861-1b613cab93bc	905719ef-ebcf-49d6-b287-b2692d0305f8	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 03:24:42.581781-06	2026-10-03 10:32:46.71558-06	2026-10-10 03:24:42.576-06	revoked
31	36	b376bae4-4105-49ed-bf06-51d7b50249ac	eafa626e-da18-43d0-b4fe-3b74550c0950	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 03:26:20.037729-06	2026-10-03 10:32:46.71558-06	2026-10-10 03:26:20.035-06	revoked
33	36	1d90c24c-6f8b-4078-975f-eadde821f395	cba1976f-2dfc-438f-88d2-f1042da07743	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 03:27:13.983537-06	2026-10-03 10:32:46.71558-06	2026-10-10 03:27:13.981-06	revoked
34	36	7ed79fc4-e262-43a5-bd6f-69cb3284f5cf	cffcefec-e546-4d80-8e4e-d7b036809365	::1	curl/8.21.0	2026-10-03 03:32:38.395384-06	2026-10-03 10:32:46.71558-06	2026-10-10 03:32:38.394-06	revoked
35	36	42d22c52-ab7d-482f-a91b-d466e48d4674	118cea34-bbc1-412b-8b14-c979e9527512	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 10:13:31.681453-06	2026-10-03 10:32:46.71558-06	2026-10-10 10:13:31.679-06	revoked
36	36	f60b4c84-4187-4a73-8b22-54c17ae40331	a8884c89-2740-4fc1-9e6d-f8c3a4646679	::1	curl/8.21.0	2026-10-03 10:26:16.634913-06	2026-10-03 10:32:46.71558-06	2026-10-10 10:26:16.633-06	revoked
38	36	3d4c057c-e01a-4368-a233-efb4394040c4	6f16f8d7-f12a-48fb-b352-c43294c36009	::1	curl/8.21.0	2026-10-03 10:27:20.235233-06	2026-10-03 10:32:46.71558-06	2026-10-10 10:27:20.233-06	revoked
39	36	85e52612-e9fa-4251-9f4e-7591571d7e2b	0c9b2fb3-7e2f-4db7-961e-6d4163b3e2f0	::1	curl/8.21.0	2026-10-03 10:27:41.485086-06	2026-10-03 10:32:46.71558-06	2026-10-10 10:27:41.483-06	revoked
32	35	2a3b1462-cad0-4bb3-abea-987e3ece936c	b6813306-3b28-4dc3-b510-2c561facd028	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-03 03:26:59.932777-06	2026-10-03 10:50:56.910239-06	2026-10-10 03:26:59.931-06	revoked
37	35	0d79a3a4-3757-4642-b346-a730188edd65	49776557-a58f-4128-a18e-ef22a853d809	::1	curl/8.21.0	2026-10-03 10:26:41.830615-06	2026-10-03 10:50:56.910239-06	2026-10-10 10:26:41.828-06	revoked
127	2	53cba314-5e92-42e8-9db0-4982a856bb7a	701b4ced-e979-4c5a-9e98-e5b52f22c97f	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-09 00:06:02.774699-06	2026-10-09 00:08:24.266396-06	2026-10-16 00:06:02.773-06	revoked
40	36	74509529-1bc1-4ae7-914d-d8a303fd2de7	d73c8531-154d-4935-a9e6-800a51824624	127.0.0.1	test-agent	2026-10-03 10:28:36.804936-06	2026-10-03 10:32:46.71558-06	2026-10-10 10:28:36.804-06	revoked
42	36	ff00834c-ac4e-40f0-88ba-2a4eb0d40d4c	c2220f6f-774f-4323-8c08-d19a3ddee4ed	127.0.0.1	test-agent	2026-10-03 10:30:50.628367-06	2026-10-03 10:32:46.71558-06	2026-10-10 10:30:50.627-06	revoked
44	36	b7acd3a1-cc85-40f6-8502-720455c0d2a0	aababeb2-ad5c-425b-814a-0616f649e1ef	127.0.0.1	test-agent	2026-10-03 10:35:45.978028-06	2026-10-03 10:43:20.308756-06	2026-10-10 10:35:45.976-06	revoked
105	31	8116441c-0611-440a-acea-f69515633e96	940e9bda-4cfc-450e-bf1a-2f99abb22e91	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 03:58:27.904627-06	2026-10-08 03:58:36.408578-06	2026-10-15 03:58:27.902-06	revoked
45	36	09535b65-6157-464c-a49e-5a928e33ed99	478bfbd8-7ad0-42bf-8f05-ad8e52d41b1a	127.0.0.1	test-agent	2026-10-03 10:43:20.936475-06	2026-10-03 10:44:17.288773-06	2026-10-10 10:43:20.935-06	revoked
108	36	715fde77-9e0d-41dd-9821-213021abe2c4	f7df1620-1cd6-42ad-96ab-0d73709107ca	::1	curl/8.21.0	2026-10-08 04:08:01.779509-06	\N	2026-10-15 04:08:01.778-06	active
46	36	932a0af7-c581-4523-8ff7-523eb69f1c28	53a770c3-dcfe-4e62-a960-1bf9590907fe	127.0.0.1	test-agent	2026-10-03 10:44:17.867299-06	2026-10-03 10:47:27.981833-06	2026-10-10 10:44:17.866-06	revoked
112	2	7a45b8d2-1e74-42b2-b3d8-0bf80885ad0e	a7b72a3f-6647-4dad-a522-48fb6097591f	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 05:10:37.909052-06	2026-10-08 05:10:41.758531-06	2026-10-15 05:10:37.907-06	revoked
115	31	dc5461a7-1a0e-4919-b7a9-aa9d660e4d6b	aeb99ea1-851d-4a7d-9eb1-774c35e53016	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 05:31:09.066887-06	2026-10-08 05:31:12.409703-06	2026-10-15 05:31:09.065-06	revoked
51	35	8845dd0e-987b-42c6-9d5e-9893dd7aee0a	48354281-9d2f-4ccd-a795-7e104ab53251	127.0.0.1	test-agent	2026-10-03 10:50:56.309847-06	2026-10-03 10:50:56.910239-06	2026-10-10 10:50:56.309-06	revoked
52	35	b8819dc7-1ee1-423c-bfdc-3532bdbea69e	56c4d7cd-16ce-4b9b-a1fc-981663d046da	127.0.0.1	test-agent	2026-10-03 10:50:56.343348-06	2026-10-03 10:50:56.910239-06	2026-10-10 10:50:56.343-06	revoked
109	35	02521c69-a6bf-4e63-9d1b-c92bcf15c371	a2e3af07-9bcc-4fc4-822c-6dcae93ccc75	::1	curl/8.21.0	2026-10-08 04:08:17.723168-06	2026-10-08 23:57:54.219021-06	2026-10-15 04:08:17.722-06	revoked
62	2	4ebdff33-0eac-4035-b11d-90d108aa319c	b105d350-a920-4e26-b9b6-c5d7f82570ad	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 15:37:43.701931-06	2026-10-05 15:37:56.462418-06	2026-10-12 15:37:43.7-06	revoked
63	2	460d1d86-536c-4c07-a976-ba1089fff83a	61a6eab9-feae-4b6d-9340-1d1619d16464	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:09:30.273487-06	2026-10-05 19:16:41.724105-06	2026-10-12 19:09:30.272-06	revoked
64	2	60569ae9-0db2-4232-a632-79fbe84efb10	e35e757b-c6e2-4cc3-9f81-4ca78a56db92	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:18:02.31139-06	2026-10-05 19:18:07.341288-06	2026-10-12 19:18:02.309-06	revoked
47	36	3eb213c7-8670-46c0-b8d9-bf5f4120a828	6f30fc61-b9a1-4814-929d-c32cc8dd14f5	127.0.0.1	test-agent	2026-10-03 10:47:28.614036-06	2026-10-05 19:18:31.747859-06	2026-10-10 10:47:28.612-06	revoked
48	36	113963c1-df22-4c5e-9d88-8e91adf49330	032634b5-57b2-44ce-825a-6e6cf391d5f2	127.0.0.1	test-agent	2026-10-03 10:47:31.244119-06	2026-10-05 19:18:31.747859-06	2026-10-10 10:47:31.243-06	revoked
49	36	28af9216-206c-402d-ac1e-bc2d4df6949b	85e2572b-a6aa-4903-8ddd-11830f51500e	127.0.0.1	test-agent	2026-10-03 10:47:31.852033-06	2026-10-05 19:18:31.747859-06	2026-10-10 10:47:31.851-06	revoked
50	36	d7d0e3ba-18ef-4a47-8c1b-dd9bc79790fd	686022d2-29ce-48c5-9eb9-e4a3f9d3e8e0	127.0.0.1	test-agent	2026-10-03 10:47:31.866098-06	2026-10-05 19:18:31.747859-06	2026-10-10 10:47:31.865-06	revoked
54	36	336acb7e-54a8-472d-bd0c-5e92c57bc2ac	e3b1567a-da4e-4f11-9259-15c22062fe3f	127.0.0.1	test-agent	2026-10-03 10:50:59.366976-06	2026-10-05 19:18:31.747859-06	2026-10-10 10:50:59.366-06	revoked
55	36	34ade57f-93fc-455c-8f51-c6c76f8453b6	d8ecc0b3-17ed-4a3e-866a-1f31ccaa6da0	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-04 03:42:53.575437-06	2026-10-05 19:18:31.747859-06	2026-10-11 03:42:53.572-06	revoked
56	36	20ea838b-189e-4359-9349-66b7ab97fe37	0c3e621f-78a6-480f-b730-859f36887662	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-04 03:44:30.336586-06	2026-10-05 19:18:31.747859-06	2026-10-11 03:44:30.335-06	revoked
61	36	244c4d04-e746-4701-be03-9ec0b9ddf9b4	6b46a899-805d-4e3a-8b94-e540445949e8	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-04 03:58:32.841886-06	2026-10-05 19:18:31.747859-06	2026-10-11 03:58:32.84-06	revoked
65	2	0fba5e35-f143-4e39-a122-6dc20907ba8c	a23f26b9-297b-4386-aca7-bc8cbb0a9c21	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:18:17.212212-06	2026-10-05 19:18:32.735958-06	2026-10-12 19:18:17.211-06	revoked
66	2	8f295fba-c295-46a6-9dfb-9ea7b8e73883	fbb742a3-c357-4461-a6bf-7c86e09861de	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:23:19.204876-06	2026-10-05 19:23:21.36301-06	2026-10-12 19:23:19.203-06	revoked
67	36	9fc92a89-c0b7-4c50-ba22-0d854e94b874	76229e9a-251c-4454-b3b4-53d08bb2e101	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:24:48.623715-06	2026-10-05 19:24:51.064766-06	2026-10-12 19:24:48.622-06	revoked
68	36	166d70c2-3c15-493b-8bad-0a7f41eada85	654a7372-6264-4f62-9547-f647f61dfa95	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:25:01.977762-06	2026-10-05 19:25:03.699505-06	2026-10-12 19:25:01.976-06	revoked
69	2	cce8c65c-d888-4206-8292-aa66c2793433	5281bd57-f25d-45d5-a1a7-aeb453854a81	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:25:17.906914-06	2026-10-05 19:25:37.126648-06	2026-10-12 19:25:17.905-06	revoked
70	36	7e4970b1-c930-4d42-97c1-8ba338b9f271	ad0cfc1c-1841-41db-96bb-68c0d6ba509b	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:25:45.80699-06	2026-10-05 19:25:52.311552-06	2026-10-12 19:25:45.805-06	revoked
71	2	0224df66-d0bf-40d0-a6f3-6107cc1a8385	7aba37c0-6512-45b5-b7d1-99b2bf17391d	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:26:13.227383-06	2026-10-05 19:26:37.557077-06	2026-10-12 19:26:13.226-06	revoked
72	36	fe1cfd1f-c146-4191-b9f1-3f93dc74a7fc	e5216476-b18d-4265-97c6-99bdbba0ee61	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:26:46.552014-06	2026-10-05 19:28:45.378867-06	2026-10-12 19:26:46.55-06	revoked
73	2	43c8f505-260f-415b-a2f4-74e7994d053a	2f5ecb0c-03b2-4945-9e52-29e8c0b6f5e9	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:29:25.29076-06	2026-10-05 19:30:51.488949-06	2026-10-12 19:29:25.289-06	revoked
74	36	786d6310-b349-49e4-be4c-f7d6ef6281a4	436648ea-1670-4ee4-85cb-e189758bec00	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:31:13.889775-06	2026-10-05 19:33:11.615331-06	2026-10-12 19:31:13.888-06	revoked
75	2	f6f30a58-2b8c-46d7-b254-b2eb83540624	cdf64173-5233-4ff7-8e47-3afb5b74109f	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:33:18.938094-06	2026-10-05 19:34:06.178448-06	2026-10-12 19:33:18.936-06	revoked
76	36	c4ee5e21-b37c-4d31-97c8-5f2ec8832928	7e6aad60-dba0-4cfa-938f-87e81637d2b0	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:34:14.682001-06	2026-10-05 19:36:27.284387-06	2026-10-12 19:34:14.68-06	revoked
77	2	f158c539-fb73-4773-a7b2-e930e1a99e71	b5e40faa-685b-42c5-853c-a9c20e0f1c74	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:36:37.046849-06	2026-10-05 19:38:23.316976-06	2026-10-12 19:36:37.045-06	revoked
78	2	91a17971-add4-43b8-a3f9-8d34dc3abdea	896f1600-5ce8-47ad-8eac-b1b6dc252bd2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:38:28.283825-06	2026-10-05 19:39:09.644914-06	2026-10-12 19:38:28.282-06	revoked
79	36	765cd0bc-bbd7-4dc9-b5bc-1bc1992c95ba	521ee0e7-47b9-4ad2-9f4b-5d1df7b39b47	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:39:26.07381-06	2026-10-05 19:40:21.723035-06	2026-10-12 19:39:26.072-06	revoked
82	2	40f1b568-62ad-47bd-a076-5d861ca5a3ce	f78ed629-9826-4aec-b52f-d08a4e9b04d7	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:42:46.496365-06	2026-10-05 19:43:46.188848-06	2026-10-12 19:42:46.494-06	revoked
83	2	08eda111-8404-44da-8639-d3a1e2894a91	379ee438-f0a0-4565-ba58-209de0c71aa4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:48:22.023624-06	2026-10-05 19:49:24.960317-06	2026-10-12 19:48:22.022-06	revoked
84	2	510e08b4-cb3c-4394-8e18-168708b141b8	002f5655-3e58-406b-852f-debac86883f1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:49:40.411579-06	2026-10-05 19:50:35.879803-06	2026-10-12 19:49:40.41-06	revoked
53	35	a655e59f-ad82-41f9-ad49-dc2e89e5900d	c00484a3-987d-42ae-b3bc-1cbae9e22aac	127.0.0.1	test-agent	2026-10-03 10:50:57.212387-06	2026-10-08 03:39:15.918467-06	2026-10-10 10:50:57.212-06	revoked
85	31	bcfe9b1c-c641-49d0-b583-73adb9e25572	733f9360-1720-458c-a74e-873013076e6d	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-05 19:50:41.052379-06	2026-10-05 19:51:20.51387-06	2026-10-12 19:50:41.05-06	revoked
106	31	f3c9ac97-623e-46fa-b379-eec995cb82e0	15d14d40-7845-47b0-a77c-b1e2c67773a9	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 04:00:22.771925-06	2026-10-08 04:01:18.177246-06	2026-10-15 04:00:22.77-06	revoked
110	39	7b7dd7a0-01ba-4f40-b35a-9b1540969cce	153e514d-d575-4e6f-b917-05d072b27908	::1	curl/8.21.0	2026-10-08 04:09:08.998744-06	\N	2026-10-15 04:09:08.998-06	active
88	39	39438bb4-1e7d-4f00-92b0-a1f3e444f87e	c62a04aa-485a-417e-b53a-2a8dc3cd3a5f	::1	curl/8.21.0	2026-10-08 03:24:54.685179-06	\N	2026-10-15 03:24:54.682-06	active
89	40	3be755ba-8f9e-4c6b-a217-2be81a9689fe	933ca521-4c5e-437e-99ba-26470fbce6de	::1	curl/8.21.0	2026-10-08 03:25:06.545382-06	\N	2026-10-15 03:25:06.544-06	active
91	39	92ed58cc-b5d6-4b0a-bf4e-a8892a942f59	d8c13f3b-4fe2-4bef-8995-12467824b5dd	::1	curl/8.21.0	2026-10-08 03:26:06.994042-06	\N	2026-10-15 03:26:06.992-06	active
92	40	64f099e4-6279-4051-9376-8326ca892223	42488922-82d6-4b14-9a31-ba283bf77c4c	::1	curl/8.21.0	2026-10-08 03:26:50.092152-06	\N	2026-10-15 03:26:50.089-06	active
90	35	70810003-62fe-40d5-a714-579eb2af1ace	ec626cac-6af3-42e4-a969-a83adfd307fd	::1	curl/8.21.0	2026-10-08 03:25:24.97348-06	2026-10-08 03:28:02.885406-06	2026-10-15 03:25:24.972-06	revoked
87	36	46f3da85-6f2b-49a0-a230-e838a28260a5	73926c0c-b05b-426c-b0c9-f7c4e6ea817f	::1	curl/8.21.0	2026-10-08 03:24:48.346028-06	2026-10-08 03:29:29.626637-06	2026-10-15 03:24:48.343-06	revoked
93	40	7a6181e2-da32-4f3b-a7ab-48f7de7ae197	b15446e6-2786-4ee1-a3ef-07aa0b179f28	::1	curl/8.21.0	2026-10-08 03:31:04.617289-06	\N	2026-10-15 03:31:04.615-06	active
113	31	1726f6d9-a23d-4511-9bc7-1bf7dd40cbf1	0ddcc3ad-d8e7-4321-99f1-6f69ffd9da24	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 05:10:46.372077-06	2026-10-08 05:10:49.546936-06	2026-10-15 05:10:46.37-06	revoked
57	35	b5dd09d0-eaf9-40f7-9906-af4fe8596656	4a8c0e2d-5fe4-4a7d-9b0f-4360121e0f8b	::1	curl/8.21.0	2026-10-04 03:52:59.352688-06	2026-10-08 03:39:15.918467-06	2026-10-11 03:52:59.349-06	revoked
58	35	35a4e84b-517a-4ce1-a479-79e69562247d	47cfee86-2270-4e92-824d-92a324e4a586	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-04 03:53:07.014234-06	2026-10-08 03:39:15.918467-06	2026-10-11 03:53:07.012-06	revoked
59	35	d3e439a1-6339-471d-961a-4bad259c5891	da54fbd9-4d5c-47e0-aba7-3c463298a60f	::1	curl/8.21.0	2026-10-04 03:54:07.088805-06	2026-10-08 03:39:15.918467-06	2026-10-11 03:54:07.087-06	revoked
60	35	8d014362-b83f-44dd-a124-3e1004e45c8e	43ae21e6-8991-456c-9602-201155899cea	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-04 03:55:04.098382-06	2026-10-08 03:39:15.918467-06	2026-10-11 03:55:04.096-06	revoked
80	35	fc971e8d-e29e-4f04-8288-c99f568d9a30	ef3097b6-bf49-42c9-92d1-fe74c090ac12	::1	node-fetch	2026-10-05 19:39:57.37567-06	2026-10-08 03:39:15.918467-06	2026-10-12 19:39:57.373-06	revoked
81	35	00c393b5-5f23-4584-8bed-a4aadf00bffe	3957efc4-cdac-4210-b027-0faeeec1a366	::1	node-fetch	2026-10-05 19:42:34.726616-06	2026-10-08 03:39:15.918467-06	2026-10-12 19:42:34.724-06	revoked
86	35	cf715589-12eb-4160-a6b3-71e1ba23e6b3	f3e5f6a9-6af8-47a6-9bf2-8283864e74eb	::1	curl/8.21.0	2026-10-08 03:24:36.163516-06	2026-10-08 03:39:15.918467-06	2026-10-15 03:24:36.16-06	revoked
94	35	e4662c06-335e-4aa5-9e95-b77aded728b4	73cc447c-1837-457e-9a2c-246f0e38fbd8	::1	curl/8.21.0	2026-10-08 03:38:11.38552-06	2026-10-08 03:39:15.918467-06	2026-10-15 03:38:11.382-06	revoked
95	35	5e199dd9-61c3-4dec-916e-03e115fb034e	f805828e-d33d-47f1-8636-5d510b20b19a	::1	curl/8.21.0	2026-10-08 03:38:41.135846-06	2026-10-08 03:39:15.918467-06	2026-10-15 03:38:41.133-06	revoked
116	31	6d94ff15-86b2-4e41-b98e-925b661aa6b2	d3930fb2-dca7-4e2f-9127-2547721c0259	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 05:31:15.067686-06	2026-10-08 05:31:17.325899-06	2026-10-15 05:31:15.067-06	revoked
96	35	5f7c8285-8edc-490a-859f-fa976b5c4feb	9408a1b5-47b4-4749-8f4b-721db695cfdb	::1	curl/8.21.0	2026-10-08 03:40:37.606347-06	2026-10-08 03:40:56.606495-06	2026-10-15 03:40:37.605-06	revoked
97	36	e7f441e9-b529-4034-aa09-0ac41b868d49	ff0bb9a9-d075-4ecc-9a8c-dc780c3b26ce	::1	curl/8.21.0	2026-10-08 03:41:22.194949-06	\N	2026-10-15 03:41:22.192-06	active
98	39	5bdf4557-9eea-4fe2-a560-dd8f37ec0f58	70285736-8aef-4de5-98cd-30dbcf23ba61	::1	curl/8.21.0	2026-10-08 03:41:28.521202-06	\N	2026-10-15 03:41:28.519-06	active
99	40	f6ee954b-b0fc-4447-afef-ff33f9a7b5fc	269f21c7-0671-4b06-b078-a9b9d53e5413	::1	curl/8.21.0	2026-10-08 03:41:34.638048-06	\N	2026-10-15 03:41:34.636-06	active
117	31	04d1a8a7-f8d8-4d01-9503-ebc55f430c2b	e82a4946-2bc3-4967-bb7b-aec65525a4e1	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 05:31:21.082603-06	2026-10-08 05:31:27.786413-06	2026-10-15 05:31:21.081-06	revoked
100	2	a0fc4ac5-bef9-4b05-9a4b-61fcac6bfee2	fcc1904a-5764-4f03-92b8-9e7c3b330ef2	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 03:51:03.043104-06	2026-10-08 03:53:50.300242-06	2026-10-15 03:51:03.04-06	revoked
118	31	af3c2c85-ae58-4f25-ae9a-ed29d1d7fd78	d114ce9b-8639-4a59-942a-04a815ccf028	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 05:31:31.951525-06	\N	2026-10-15 05:31:31.95-06	active
101	31	03455e94-bf97-4892-9542-6f96939993ec	47dac433-3307-4739-b91c-772d7fc2e648	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 03:54:03.619324-06	2026-10-08 03:54:08.739919-06	2026-10-15 03:54:03.617-06	revoked
120	31	8f8a3f8a-1955-459a-805c-b18776c96ad5	02036d1e-f965-4c4b-b2ad-a16ed80f14c3	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 23:44:11.570329-06	2026-10-08 23:44:15.119325-06	2026-10-15 23:44:11.568-06	revoked
102	31	6336f3b8-4f98-4c77-8e06-4fdc5bf4102e	ad48aafb-853f-4128-a7d1-84ea655b943a	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 03:54:15.836478-06	2026-10-08 03:54:29.521947-06	2026-10-15 03:54:15.835-06	revoked
124	35	9a9f99c0-c8a3-4a72-98e4-fc1b2b90941d	76680b9d-4477-4258-a45c-7b2b4cd1c849	::1	node	2026-10-08 23:59:31.576051-06	2026-10-08 23:59:32.235294-06	2026-10-15 23:59:31.574-06	revoked
103	31	ff1f9c3f-7eb3-49c8-bf29-b9b97802d809	f5156641-d0e0-4b9a-9a88-bff9bcf59f6d	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-08 03:54:39.371504-06	2026-10-08 03:54:41.66108-06	2026-10-15 03:54:39.369-06	revoked
125	35	f9a52158-9aa6-4331-bd74-4a31195be336	19c6c1ad-473f-4337-8957-eb35fdb74975	::1	node	2026-10-08 23:59:31.73372-06	2026-10-08 23:59:32.235294-06	2026-10-15 23:59:31.732-06	revoked
126	35	2ae18814-00fd-4b4c-a5ca-4c526b9e7acc	e855ffe5-14fc-4750-83e7-11b87bf6ba18	::1	node	2026-10-08 23:59:32.530055-06	2026-10-08 23:59:34.315689-06	2026-10-15 23:59:32.529-06	revoked
128	2	da74c38f-62b1-4235-a0a8-a60d4afd26e8	1850bfae-f47b-43af-ae4e-549c97d50d4d	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-09 00:08:36.622801-06	2026-10-09 00:08:55.695091-06	2026-10-16 00:08:36.622-06	revoked
129	31	40de4494-f4e1-4bef-b165-0cb9aa02ad2c	f06d6c5d-d536-401f-8f2d-ffd646827341	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36	2026-10-09 00:09:02.6476-06	2026-10-09 00:09:18.904481-06	2026-10-16 00:09:02.647-06	revoked
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (usuario_id, email, rol_id, fecha_creacion, password_hash, nombre, activo, fecha_actualizacion, ultimo_login, email_verificado) FROM stdin;
10	hidyt@mailinator.com	2	2025-10-12 02:21:57.446188-06	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	\N	t	2026-10-02 11:05:54.966664-06	\N	f
11	fycibekix@mailinator.com	2	2025-10-12 02:27:54.578438-06	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	\N	t	2026-10-02 11:05:54.966664-06	\N	f
13	wusega@unach.com	2	2025-10-16 04:48:48.519577-06	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	\N	t	2026-10-02 11:05:54.966664-06	\N	f
14	rigoberto@unach.mx	2	2025-10-16 08:47:30.319158-06	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	\N	t	2026-10-02 11:05:54.966664-06	\N	f
3	profe@unach.mx	2	2025-10-12 00:53:37.286524-06	$2b$10$Y4qkh6tgzAuSLjjJ2SI8ze30olHCfdFBRKYJuYe35Vdj1VauFNFyq	\N	t	2026-10-02 11:05:54.966664-06	\N	f
18	rubenclemente221@gmail.com	2	2025-10-16 11:57:29.622588-06	$2b$10$4cgBf7GJEKKKSysOG9WtUuSA6R4iDNE11lrmIgmYCP68mGYzCNUmG	\N	t	2026-10-02 11:05:54.966664-06	\N	f
21	manuel.sandoval@unach.mx	2	2025-10-22 20:08:16.120931-06	$2b$10$I7FEbIBSHPwAzuMsUfKhjeQzg77k2dUvtirexCAARQNmYKncUs9DO	\N	t	2026-10-02 11:05:54.966664-06	\N	f
22	najoqeje@mailinator.com	2	2025-10-24 06:29:32.479756-06	$2b$10$FzAbEPoUg9OvGcsURMexJ.4qphm2tFlPzKI0miAn/pnSHPFlibvU2	\N	t	2026-10-02 11:05:54.966664-06	\N	f
23	myqa@mailinator.com	2	2025-10-24 06:34:52.806866-06	$2b$10$wscyJZV66rxkrHTZvcKE5uYcMU.HNI0loZbOLcijrc/bWiJOvsTK.	\N	t	2026-10-02 11:05:54.966664-06	\N	f
24	tysozad@mailinator.com	2	2025-10-24 06:38:12.12558-06	$2b$10$EtDLCIH6XRYKgg0tkwWGYuGejIAfxNNJKVDmmiIoHSX2dmuCV/ymS	\N	t	2026-10-02 11:05:54.966664-06	\N	f
25	qefy@mailinator.com	2	2025-10-24 07:03:52.61077-06	$2b$10$XNRBqxYDFWffsSW855sF6uTTclV22DMyKW9bfoWuBr0rSD7nn1mka	\N	t	2026-10-02 11:05:54.966664-06	\N	f
26	zyzesojig@mailinator.com	2	2025-10-24 13:57:17.719771-06	$2b$10$awEIOlSGLrRcAKa7nQfzY.YRNws0kRIys.1po0OaHiFsNIJzNNr0e	\N	t	2026-10-02 11:05:54.966664-06	\N	f
29	subebo@mailinator.com	2	2025-10-26 05:41:04.910788-06	$2b$10$3PWKlaPdu06rIwUTSsYfWOyoLqObc0T2L.lREqBetgQ1zQ3X1SlDe	\N	t	2026-10-02 11:05:54.966664-06	\N	f
36	test.profe@unach.mx	2	2026-10-03 03:24:20.760297-06	$2b$10$IAXr/wbQBhY0zs1yDVlM1ezfeAi9dYmfDjAPs3y8iMcBE9p/peOJW	Test Profesor	t	2026-10-08 23:59:24.812775-06	2026-10-08 04:08:01.782199-06	t
39	test.estudiante@unach.mx	3	2026-10-05 19:39:50.674413-06	$2b$10$IAXr/wbQBhY0zs1yDVlM1ezfeAi9dYmfDjAPs3y8iMcBE9p/peOJW	Test Estudiante	t	2026-10-08 23:59:24.812775-06	2026-10-08 04:09:09.001814-06	f
40	test.editor@unach.mx	4	2026-10-05 19:39:50.674413-06	$2b$10$IAXr/wbQBhY0zs1yDVlM1ezfeAi9dYmfDjAPs3y8iMcBE9p/peOJW	Test Editor	t	2026-10-08 23:59:24.812775-06	2026-10-08 04:07:00.867873-06	f
32	jose.clemente48@unach.mx	1	2025-10-26 05:55:07.102831-06	$2b$10$3CJYMH2ZzX07v3I2x/vRl.Bnjgl2FSsqiYg4XSltxeY.C3JQhqRl6	\N	t	2026-10-05 19:16:39.90578-06	\N	f
35	test.admin@unach.mx	1	2026-10-03 03:24:20.742968-06	$2b$10$IAXr/wbQBhY0zs1yDVlM1ezfeAi9dYmfDjAPs3y8iMcBE9p/peOJW	Test Administrador	t	2026-10-08 23:59:32.530801-06	2026-10-08 23:59:32.530801-06	t
2	admin@unach.mx	1	2025-10-12 00:52:53.83231-06	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	\N	t	2026-10-09 00:08:36.625665-06	2026-10-09 00:08:36.625665-06	f
31	josttravieso@gmail.com	2	2025-10-26 05:48:51.991687-06	$2b$10$VgHKWlXeYrA01I8VCa/fSeWP1bl5D7S7gEloQkko8vDhFggNJbyBC	\N	t	2026-10-09 00:09:02.649843-06	2026-10-09 00:09:02.649843-06	f
34	test@test.com	1	2026-10-02 23:52:43.874742-06	$2b$12$yAtMkuextHpkZ4956PYyiOkOlT9GTOVsSJwRvrC1txZspe9xKmQAO	Usuario Test	t	2026-10-02 23:52:43.874742-06	2026-10-03 03:18:54.716752-06	f
\.


--
-- Name: actividades_solicitudes_actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actividades_solicitudes_actividad_id_seq', 17, true);


--
-- Name: auditoria_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_auditoria_id_seq', 271, true);


--
-- Name: carreras_carrera_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carreras_carrera_id_seq', 58, true);


--
-- Name: edificios_edificio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.edificios_edificio_id_seq', 2, true);


--
-- Name: horarios_horario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_horario_id_seq', 19, true);


--
-- Name: lugares_lugar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lugares_lugar_id_seq', 2, true);


--
-- Name: materias_catalogo_materia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materias_catalogo_materia_id_seq', 60, true);


--
-- Name: password_reset_tokens_reset_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_reset_token_id_seq', 10, true);


--
-- Name: periodos_academicos_id_periodo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodos_academicos_id_periodo_seq', 2, true);


--
-- Name: permisos_permiso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permisos_permiso_id_seq', 41, true);


--
-- Name: profesor_disponibilidad_disponibilidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesor_disponibilidad_disponibilidad_id_seq', 181, true);


--
-- Name: profesor_preferencias_preferencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesor_preferencias_preferencia_id_seq', 3, true);


--
-- Name: profesores_profesor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesores_profesor_id_seq', 7, true);


--
-- Name: refresh_tokens_refresh_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_refresh_token_id_seq', 129, true);


--
-- Name: roles_rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_rol_id_seq', 4, true);


--
-- Name: salones_salon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salones_salon_id_seq', 5, true);


--
-- Name: solicitudes_recuperacion_solicitud_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_recuperacion_solicitud_id_seq', 12, true);


--
-- Name: tipos_contrato_tipo_contrato_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_contrato_tipo_contrato_id_seq', 4, true);


--
-- Name: tokens_auth_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tokens_auth_token_id_seq', 17, true);


--
-- Name: user_sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_session_id_seq', 129, true);


--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_usuario_id_seq', 48, true);


--
-- Name: actividades_solicitudes actividades_solicitudes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividades_solicitudes
    ADD CONSTRAINT actividades_solicitudes_pkey PRIMARY KEY (actividad_id);


--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (auditoria_id);


--
-- Name: carrera_materias carrera_materias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_pkey PRIMARY KEY (carrera_id, materia_id, numero_semestre);


--
-- Name: carreras carreras_nombre_carrera_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carreras
    ADD CONSTRAINT carreras_nombre_carrera_key UNIQUE (nombre_carrera);


--
-- Name: carreras carreras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carreras
    ADD CONSTRAINT carreras_pkey PRIMARY KEY (carrera_id);


--
-- Name: edificios edificios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edificios
    ADD CONSTRAINT edificios_pkey PRIMARY KEY (edificio_id);


--
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (horario_id);


--
-- Name: lugares lugares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares
    ADD CONSTRAINT lugares_pkey PRIMARY KEY (lugar_id);


--
-- Name: materias_catalogo materias_catalogo_nombre_materia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_catalogo
    ADD CONSTRAINT materias_catalogo_nombre_materia_key UNIQUE (nombre_materia);


--
-- Name: materias_catalogo materias_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_catalogo
    ADD CONSTRAINT materias_catalogo_pkey PRIMARY KEY (materia_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (reset_token_id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: periodos_academicos periodos_academicos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos_academicos
    ADD CONSTRAINT periodos_academicos_nombre_key UNIQUE (nombre);


--
-- Name: periodos_academicos periodos_academicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos_academicos
    ADD CONSTRAINT periodos_academicos_pkey PRIMARY KEY (id_periodo);


--
-- Name: permisos permisos_clave_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_clave_key UNIQUE (clave);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (permiso_id);


--
-- Name: profesor_disponibilidad profesor_disponibilidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT profesor_disponibilidad_pkey PRIMARY KEY (disponibilidad_id);


--
-- Name: profesor_materias profesor_materias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT profesor_materias_pkey PRIMARY KEY (profesor_id, materia_id);


--
-- Name: profesor_preferencias profesor_preferencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_pkey PRIMARY KEY (preferencia_id);


--
-- Name: profesor_preferencias profesor_preferencias_profesor_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_profesor_id_key UNIQUE (profesor_id);


--
-- Name: profesores profesores_matricula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_matricula_key UNIQUE (matricula);


--
-- Name: profesores profesores_numero_contrato_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_numero_contrato_key UNIQUE (numero_contrato);


--
-- Name: profesores profesores_numero_plaza_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_numero_plaza_key UNIQUE (numero_plaza);


--
-- Name: profesores profesores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_pkey PRIMARY KEY (profesor_id);


--
-- Name: refresh_tokens refresh_tokens_jti_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_jti_key UNIQUE (jti);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (refresh_token_id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: rol_permisos rol_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_pkey PRIMARY KEY (rol_id, permiso_id);


--
-- Name: roles roles_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (rol_id);


--
-- Name: salones salones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salones
    ADD CONSTRAINT salones_pkey PRIMARY KEY (salon_id);


--
-- Name: solicitudes_recuperacion solicitudes_recuperacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_recuperacion
    ADD CONSTRAINT solicitudes_recuperacion_pkey PRIMARY KEY (solicitud_id);


--
-- Name: tipos_contrato tipos_contrato_nivel_prioridad_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_nivel_prioridad_key UNIQUE (nivel_prioridad);


--
-- Name: tipos_contrato tipos_contrato_nombre_tipo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_nombre_tipo_key UNIQUE (nombre_tipo);


--
-- Name: tipos_contrato tipos_contrato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_pkey PRIMARY KEY (tipo_contrato_id);


--
-- Name: tokens_auth tokens_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT tokens_auth_pkey PRIMARY KEY (token_id);


--
-- Name: tokens_auth tokens_auth_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT tokens_auth_token_key UNIQUE (token);


--
-- Name: profesor_disponibilidad uq_disponibilidad_profesor_periodo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT uq_disponibilidad_profesor_periodo UNIQUE (profesor_id, dia_semana, hora_inicio, id_periodo);


--
-- Name: horarios uq_horario_profesor_periodo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_horario_profesor_periodo UNIQUE (profesor_id, dia_semana, hora_inicio, id_periodo);


--
-- Name: horarios uq_horario_salon_periodo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_horario_salon_periodo UNIQUE (salon_id, dia_semana, hora_inicio, id_periodo);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario_id);


--
-- Name: idx_actividades_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividades_fecha ON public.actividades_solicitudes USING btree (fecha_actividad DESC);


--
-- Name: idx_actividades_solicitud; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividades_solicitud ON public.actividades_solicitudes USING btree (solicitud_id);


--
-- Name: idx_actividades_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividades_tipo ON public.actividades_solicitudes USING btree (tipo_actividad);


--
-- Name: idx_auditoria_accion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_accion ON public.auditoria USING btree (accion);


--
-- Name: idx_auditoria_fecha_hora; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_fecha_hora ON public.auditoria USING btree (fecha_hora DESC);


--
-- Name: idx_auditoria_recurso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_recurso ON public.auditoria USING btree (recurso);


--
-- Name: idx_auditoria_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_usuario ON public.auditoria USING btree (usuario_id);


--
-- Name: idx_password_reset_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_expires ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_token_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_token_hash ON public.password_reset_tokens USING btree (token_hash);


--
-- Name: idx_password_reset_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_usuario ON public.password_reset_tokens USING btree (usuario_id);


--
-- Name: idx_pwd_reset_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pwd_reset_expires ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_pwd_reset_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pwd_reset_usuario ON public.password_reset_tokens USING btree (usuario_id);


--
-- Name: idx_refresh_tokens_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_expires ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_refresh_tokens_jti; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_jti ON public.refresh_tokens USING btree (jti);


--
-- Name: idx_refresh_tokens_revoked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_revoked ON public.refresh_tokens USING btree (revoked_at) WHERE (revoked_at IS NULL);


--
-- Name: idx_refresh_tokens_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_usuario ON public.refresh_tokens USING btree (usuario_id);


--
-- Name: idx_sessions_access_jti; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_access_jti ON public.user_sessions USING btree (access_jti);


--
-- Name: idx_sessions_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_expires ON public.user_sessions USING btree (expires_at);


--
-- Name: idx_sessions_refresh_jti; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_refresh_jti ON public.user_sessions USING btree (refresh_jti);


--
-- Name: idx_sessions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_status ON public.user_sessions USING btree (status);


--
-- Name: idx_sessions_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_usuario ON public.user_sessions USING btree (usuario_id);


--
-- Name: idx_solicitudes_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitudes_estado ON public.solicitudes_recuperacion USING btree (estado);


--
-- Name: idx_solicitudes_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitudes_fecha ON public.solicitudes_recuperacion USING btree (fecha_solicitud DESC);


--
-- Name: idx_solicitudes_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitudes_usuario ON public.solicitudes_recuperacion USING btree (usuario_id);


--
-- Name: usuarios trigger_usuarios_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_usuarios_fecha_actualizacion BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_fecha_actualizacion();


--
-- Name: auditoria auditoria_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE SET NULL;


--
-- Name: carrera_materias carrera_materias_carrera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_carrera_id_fkey FOREIGN KEY (carrera_id) REFERENCES public.carreras(carrera_id) ON DELETE CASCADE;


--
-- Name: carrera_materias carrera_materias_materia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- Name: edificios edificios_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edificios
    ADD CONSTRAINT edificios_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares(lugar_id);


--
-- Name: profesor_disponibilidad fk_disponibilidad_periodo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT fk_disponibilidad_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodos_academicos(id_periodo);


--
-- Name: horarios fk_horario_periodo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_horario_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodos_academicos(id_periodo);


--
-- Name: horarios fk_materia_horario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_materia_horario FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- Name: profesor_materias fk_materia_preferencia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT fk_materia_preferencia FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- Name: profesor_disponibilidad fk_profesor_disponibilidad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT fk_profesor_disponibilidad FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- Name: horarios fk_profesor_horario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_profesor_horario FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- Name: profesor_materias fk_profesor_preferencia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT fk_profesor_preferencia FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- Name: usuarios fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id) ON DELETE RESTRICT;


--
-- Name: actividades_solicitudes fk_solicitud; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividades_solicitudes
    ADD CONSTRAINT fk_solicitud FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_recuperacion(solicitud_id) ON DELETE CASCADE;


--
-- Name: profesores fk_tipo_contrato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT fk_tipo_contrato FOREIGN KEY (tipo_contrato_id) REFERENCES public.tipos_contrato(tipo_contrato_id) ON DELETE SET NULL;


--
-- Name: solicitudes_recuperacion fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_recuperacion
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: profesores fk_usuario_profesor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT fk_usuario_profesor FOREIGN KEY (profesor_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: tokens_auth fk_usuario_token; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT fk_usuario_token FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: profesor_preferencias profesor_preferencias_profesor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_replaced_by_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_replaced_by_token_id_fkey FOREIGN KEY (replaced_by_token_id) REFERENCES public.refresh_tokens(refresh_token_id);


--
-- Name: refresh_tokens refresh_tokens_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: rol_permisos rol_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(permiso_id) ON DELETE CASCADE;


--
-- Name: rol_permisos rol_permisos_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id) ON DELETE CASCADE;


--
-- Name: salones salones_edificio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salones
    ADD CONSTRAINT salones_edificio_id_fkey FOREIGN KEY (edificio_id) REFERENCES public.edificios(edificio_id);


--
-- Name: user_sessions user_sessions_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

