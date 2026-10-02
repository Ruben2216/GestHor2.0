--
-- PostgreSQL database dump
--

\restrict 1qVMkFmcKqALnwf27uUPC1T9Ni1mfXa3IzXXdVCPxvSiSJfkdt4NnZ7BWh5lNyi

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

-- Started on 2025-10-26 17:59:26 CST

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

DROP DATABASE IF EXISTS "GestHor";
--
-- TOC entry 3631 (class 1262 OID 32768)
-- Name: GestHor; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "GestHor" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE "GestHor" OWNER TO postgres;

\unrestrict 1qVMkFmcKqALnwf27uUPC1T9Ni1mfXa3IzXXdVCPxvSiSJfkdt4NnZ7BWh5lNyi
\connect "GestHor"
\restrict 1qVMkFmcKqALnwf27uUPC1T9Ni1mfXa3IzXXdVCPxvSiSJfkdt4NnZ7BWh5lNyi

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 238 (class 1259 OID 73794)
-- Name: actividades_solicitudes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actividades_solicitudes (
    actividad_id integer NOT NULL,
    solicitud_id integer NOT NULL,
    tipo_actividad character varying(50) NOT NULL,
    descripcion text NOT NULL,
    fecha_actividad timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_tipo_actividad CHECK (((tipo_actividad)::text = ANY ((ARRAY['PASSWORD_GENERADO'::character varying, 'CONTACTO_ENVIADO'::character varying, 'SOLICITUD_CREADA'::character varying, 'SOLICITUD_RESUELTA'::character varying])::text[])))
);


ALTER TABLE public.actividades_solicitudes OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 73793)
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
-- TOC entry 3632 (class 0 OID 0)
-- Dependencies: 237
-- Name: actividades_solicitudes_actividad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actividades_solicitudes_actividad_id_seq OWNED BY public.actividades_solicitudes.actividad_id;


--
-- TOC entry 230 (class 1259 OID 57354)
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
-- TOC entry 222 (class 1259 OID 33511)
-- Name: carreras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carreras (
    carrera_id integer NOT NULL,
    nombre_carrera character varying(255) NOT NULL,
    total_semestres integer NOT NULL
);


ALTER TABLE public.carreras OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 33514)
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
-- TOC entry 3633 (class 0 OID 0)
-- Dependencies: 223
-- Name: carreras_carrera_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carreras_carrera_id_seq OWNED BY public.carreras.carrera_id;


--
-- TOC entry 242 (class 1259 OID 73824)
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
-- TOC entry 241 (class 1259 OID 73823)
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
-- TOC entry 3634 (class 0 OID 0)
-- Dependencies: 241
-- Name: edificios_edificio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.edificios_edificio_id_seq OWNED BY public.edificios.edificio_id;


--
-- TOC entry 225 (class 1259 OID 33530)
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
-- TOC entry 226 (class 1259 OID 33533)
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
-- TOC entry 3635 (class 0 OID 0)
-- Dependencies: 226
-- Name: horarios_horario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horarios_horario_id_seq OWNED BY public.horarios.horario_id;


--
-- TOC entry 240 (class 1259 OID 73815)
-- Name: lugares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lugares (
    lugar_id integer NOT NULL,
    nombre_lugar text,
    tipo_lugar text
);


ALTER TABLE public.lugares OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 73814)
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
-- TOC entry 3636 (class 0 OID 0)
-- Dependencies: 239
-- Name: lugares_lugar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lugares_lugar_id_seq OWNED BY public.lugares.lugar_id;


--
-- TOC entry 229 (class 1259 OID 57345)
-- Name: materias_catalogo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materias_catalogo (
    materia_id integer NOT NULL,
    nombre_materia character varying(255) NOT NULL
);


ALTER TABLE public.materias_catalogo OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 57344)
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
-- TOC entry 3637 (class 0 OID 0)
-- Dependencies: 228
-- Name: materias_catalogo_materia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materias_catalogo_materia_id_seq OWNED BY public.materias_catalogo.materia_id;


--
-- TOC entry 248 (class 1259 OID 90113)
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
-- TOC entry 247 (class 1259 OID 90112)
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
-- TOC entry 3638 (class 0 OID 0)
-- Dependencies: 247
-- Name: periodos_academicos_id_periodo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.periodos_academicos_id_periodo_seq OWNED BY public.periodos_academicos.id_periodo;


--
-- TOC entry 232 (class 1259 OID 65547)
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
    CONSTRAINT profesor_disponibilidad_turno_check CHECK (((turno)::text = ANY ((ARRAY['matutino'::character varying, 'vespertino'::character varying, 'nocturno'::character varying])::text[])))
);


ALTER TABLE public.profesor_disponibilidad OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 65546)
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
-- TOC entry 3639 (class 0 OID 0)
-- Dependencies: 231
-- Name: profesor_disponibilidad_disponibilidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesor_disponibilidad_disponibilidad_id_seq OWNED BY public.profesor_disponibilidad.disponibilidad_id;


--
-- TOC entry 224 (class 1259 OID 33519)
-- Name: profesor_materias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesor_materias (
    profesor_id integer NOT NULL,
    materia_id integer NOT NULL
);


ALTER TABLE public.profesor_materias OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 65566)
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
-- TOC entry 233 (class 1259 OID 65565)
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
-- TOC entry 3640 (class 0 OID 0)
-- Dependencies: 233
-- Name: profesor_preferencias_preferencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesor_preferencias_preferencia_id_seq OWNED BY public.profesor_preferencias.preferencia_id;


--
-- TOC entry 221 (class 1259 OID 33506)
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
-- TOC entry 3641 (class 0 OID 0)
-- Dependencies: 221
-- Name: COLUMN profesores.tipo_contrato_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.tipo_contrato_id IS 'Referencia al tipo de contrato del docente, que define su prioridad de asignación.';


--
-- TOC entry 227 (class 1259 OID 49152)
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
-- TOC entry 3642 (class 0 OID 0)
-- Dependencies: 227
-- Name: profesores_profesor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesores_profesor_id_seq OWNED BY public.profesores.profesor_id;


--
-- TOC entry 215 (class 1259 OID 33490)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    rol_id integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 33493)
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
-- TOC entry 3643 (class 0 OID 0)
-- Dependencies: 216
-- Name: roles_rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_rol_id_seq OWNED BY public.roles.rol_id;


--
-- TOC entry 244 (class 1259 OID 73838)
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
-- TOC entry 243 (class 1259 OID 73837)
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
-- TOC entry 3644 (class 0 OID 0)
-- Dependencies: 243
-- Name: salones_salon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salones_salon_id_seq OWNED BY public.salones.salon_id;


--
-- TOC entry 236 (class 1259 OID 73774)
-- Name: solicitudes_recuperacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitudes_recuperacion (
    solicitud_id integer NOT NULL,
    usuario_id integer NOT NULL,
    motivo text NOT NULL,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_resolucion timestamp without time zone,
    CONSTRAINT chk_estado CHECK (((estado)::text = ANY ((ARRAY['PENDIENTE'::character varying, 'RESUELTA'::character varying])::text[])))
);


ALTER TABLE public.solicitudes_recuperacion OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 73773)
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
-- TOC entry 3645 (class 0 OID 0)
-- Dependencies: 235
-- Name: solicitudes_recuperacion_solicitud_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_recuperacion_solicitud_id_seq OWNED BY public.solicitudes_recuperacion.solicitud_id;


--
-- TOC entry 246 (class 1259 OID 82021)
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
-- TOC entry 3646 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE tipos_contrato; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tipos_contrato IS 'Catálogo de tipos de contrato para docentes (ej. Tiempo Completo, Por Asignatura).';


--
-- TOC entry 3647 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN tipos_contrato.nivel_prioridad; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tipos_contrato.nivel_prioridad IS 'Nivel de prioridad para asignación. Un número menor indica mayor prioridad (ej. 1 es más alto que 2).';


--
-- TOC entry 245 (class 1259 OID 82020)
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
-- TOC entry 3648 (class 0 OID 0)
-- Dependencies: 245
-- Name: tipos_contrato_tipo_contrato_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_contrato_tipo_contrato_id_seq OWNED BY public.tipos_contrato.tipo_contrato_id;


--
-- TOC entry 219 (class 1259 OID 33501)
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
-- TOC entry 220 (class 1259 OID 33505)
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
-- TOC entry 3649 (class 0 OID 0)
-- Dependencies: 220
-- Name: tokens_auth_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tokens_auth_token_id_seq OWNED BY public.tokens_auth.token_id;


--
-- TOC entry 217 (class 1259 OID 33494)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    usuario_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    rol_id integer NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 33500)
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
-- TOC entry 3650 (class 0 OID 0)
-- Dependencies: 218
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_usuario_id_seq OWNED BY public.usuarios.usuario_id;


--
-- TOC entry 3347 (class 2604 OID 73797)
-- Name: actividades_solicitudes actividad_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividades_solicitudes ALTER COLUMN actividad_id SET DEFAULT nextval('public.actividades_solicitudes_actividad_id_seq'::regclass);


--
-- TOC entry 3336 (class 2604 OID 33534)
-- Name: carreras carrera_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carreras ALTER COLUMN carrera_id SET DEFAULT nextval('public.carreras_carrera_id_seq'::regclass);


--
-- TOC entry 3350 (class 2604 OID 73827)
-- Name: edificios edificio_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edificios ALTER COLUMN edificio_id SET DEFAULT nextval('public.edificios_edificio_id_seq'::regclass);


--
-- TOC entry 3337 (class 2604 OID 33535)
-- Name: horarios horario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios ALTER COLUMN horario_id SET DEFAULT nextval('public.horarios_horario_id_seq'::regclass);


--
-- TOC entry 3349 (class 2604 OID 73818)
-- Name: lugares lugar_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares ALTER COLUMN lugar_id SET DEFAULT nextval('public.lugares_lugar_id_seq'::regclass);


--
-- TOC entry 3338 (class 2604 OID 57348)
-- Name: materias_catalogo materia_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_catalogo ALTER COLUMN materia_id SET DEFAULT nextval('public.materias_catalogo_materia_id_seq'::regclass);


--
-- TOC entry 3353 (class 2604 OID 90116)
-- Name: periodos_academicos id_periodo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos_academicos ALTER COLUMN id_periodo SET DEFAULT nextval('public.periodos_academicos_id_periodo_seq'::regclass);


--
-- TOC entry 3339 (class 2604 OID 65550)
-- Name: profesor_disponibilidad disponibilidad_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad ALTER COLUMN disponibilidad_id SET DEFAULT nextval('public.profesor_disponibilidad_disponibilidad_id_seq'::regclass);


--
-- TOC entry 3341 (class 2604 OID 65569)
-- Name: profesor_preferencias preferencia_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_preferencias ALTER COLUMN preferencia_id SET DEFAULT nextval('public.profesor_preferencias_preferencia_id_seq'::regclass);


--
-- TOC entry 3335 (class 2604 OID 49161)
-- Name: profesores profesor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores ALTER COLUMN profesor_id SET DEFAULT nextval('public.profesores_profesor_id_seq'::regclass);


--
-- TOC entry 3330 (class 2604 OID 33537)
-- Name: roles rol_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN rol_id SET DEFAULT nextval('public.roles_rol_id_seq'::regclass);


--
-- TOC entry 3351 (class 2604 OID 73841)
-- Name: salones salon_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salones ALTER COLUMN salon_id SET DEFAULT nextval('public.salones_salon_id_seq'::regclass);


--
-- TOC entry 3344 (class 2604 OID 73777)
-- Name: solicitudes_recuperacion solicitud_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_recuperacion ALTER COLUMN solicitud_id SET DEFAULT nextval('public.solicitudes_recuperacion_solicitud_id_seq'::regclass);


--
-- TOC entry 3352 (class 2604 OID 82024)
-- Name: tipos_contrato tipo_contrato_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_contrato ALTER COLUMN tipo_contrato_id SET DEFAULT nextval('public.tipos_contrato_tipo_contrato_id_seq'::regclass);


--
-- TOC entry 3333 (class 2604 OID 33539)
-- Name: tokens_auth token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_auth ALTER COLUMN token_id SET DEFAULT nextval('public.tokens_auth_token_id_seq'::regclass);


--
-- TOC entry 3331 (class 2604 OID 33541)
-- Name: usuarios usuario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN usuario_id SET DEFAULT nextval('public.usuarios_usuario_id_seq'::regclass);


--
-- TOC entry 3615 (class 0 OID 73794)
-- Dependencies: 238
-- Data for Name: actividades_solicitudes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actividades_solicitudes (actividad_id, solicitud_id, tipo_actividad, descripcion, fecha_actividad) FROM stdin;
1	4	SOLICITUD_CREADA	Solicitud creada por rubenclemente221@gmail.com	2025-10-18 21:26:03.97347
2	4	PASSWORD_GENERADO	Nueva contraseña enviada a Jose Clemente Corzo	2025-10-18 21:26:29.673193
3	5	SOLICITUD_CREADA	Solicitud creada por rubenclemente221@gmail.com	2025-10-19 01:07:58.045253
4	6	SOLICITUD_CREADA	Solicitud creada por manuel.sandoval@unach.mx	2025-10-22 20:13:11.228162
5	6	PASSWORD_GENERADO	Nueva contraseña enviada a SANDOVAL Sed enim et vero eum	2025-10-22 20:13:50.432962
\.


--
-- TOC entry 3607 (class 0 OID 57354)
-- Dependencies: 230
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
-- TOC entry 3599 (class 0 OID 33511)
-- Dependencies: 222
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
-- TOC entry 3619 (class 0 OID 73824)
-- Dependencies: 242
-- Data for Name: edificios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.edificios (edificio_id, lugar_id, nombre_edificio, tipo_edificio) FROM stdin;
1	1	Edificio A	\N
2	2	EDIFICIO A	\N
\.


--
-- TOC entry 3602 (class 0 OID 33530)
-- Dependencies: 225
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios (horario_id, profesor_id, materia_id, salon_id, dia_semana, hora_inicio, hora_fin, id_periodo) FROM stdin;
16	18	34	3	Jueves	09:00:00	10:00:00	\N
19	18	34	5	Lunes	07:00:00	08:00:00	\N
\.


--
-- TOC entry 3617 (class 0 OID 73815)
-- Dependencies: 240
-- Data for Name: lugares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lugares (lugar_id, nombre_lugar, tipo_lugar) FROM stdin;
1	Faculta de Ingenieria	Facultad
2	Facultad de contaduria	Facultad
\.


--
-- TOC entry 3606 (class 0 OID 57345)
-- Dependencies: 229
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
-- TOC entry 3625 (class 0 OID 90113)
-- Dependencies: 248
-- Data for Name: periodos_academicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.periodos_academicos (id_periodo, nombre, fecha_inicio, fecha_fin) FROM stdin;
2	Semestre 2026-01	2026-02-01	2026-06-15
1	Semestre 2025-02	2025-08-12	2025-11-24
\.


--
-- TOC entry 3609 (class 0 OID 65547)
-- Dependencies: 232
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
-- TOC entry 3601 (class 0 OID 33519)
-- Dependencies: 224
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
-- TOC entry 3611 (class 0 OID 65566)
-- Dependencies: 234
-- Data for Name: profesor_preferencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesor_preferencias (preferencia_id, profesor_id, max_horas_dia, preferencia_horario, comentarios_adicionales) FROM stdin;
3	18	8	Mixto	Pura buenaa materia
\.


--
-- TOC entry 3598 (class 0 OID 33506)
-- Dependencies: 221
-- Data for Name: profesores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesores (profesor_id, nombres, apellidos, matricula, grado_academico, numero_plaza, numero_contrato, direccion, telefono, email, tipo_contrato_id) FROM stdin;
18	Jose	Clemente Corzo	Soluta esse asperior	Impedit numquam obc	Quidem irure alias n	Ut sint quasi quibu	Calle San Bernardino 261	9612215796	rubenclemente221@gmail.com	1
29	2	Quasi dolores nihil 	Illo duis culpa veli	Ad consectetur aut f	Quas qui ea corrupti	Sunt eos nisi sint 	Non sequi voluptate 	3422234432	subebo@mailinator.com	2
31	Et sint voluptatem	Sapiente voluptate a	Quam consequat Ad n	Asperiores cillum qu	Asperiores est eiusm	Aut ad amet earum s	Voluptates adipisci 	2132132132	josttravieso@gmail.com	1
32	Id voluptatem Poss	Ipsa asperiores aut	Do sint maxime adip	Saepe aspernatur do 	Dolore sint voluptat	Quae nobis voluptate	Consequat Ipsam dis	3545454654	jose.clemente48@unach.mx	2
\.


--
-- TOC entry 3592 (class 0 OID 33490)
-- Dependencies: 215
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (rol_id, nombre_rol) FROM stdin;
1	administrador
2	profesor
\.


--
-- TOC entry 3621 (class 0 OID 73838)
-- Dependencies: 244
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
-- TOC entry 3613 (class 0 OID 73774)
-- Dependencies: 236
-- Data for Name: solicitudes_recuperacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes_recuperacion (solicitud_id, usuario_id, motivo, estado, fecha_solicitud, fecha_resolucion) FROM stdin;
1	3	Olvidé mi contraseña de acceso	PENDIENTE	2025-10-18 20:53:31.158449	\N
2	3	Olvidé mi contraseña de acceso	RESUELTA	2025-10-18 20:57:07.405418	2025-10-18 20:58:41.404439
4	18	wa	RESUELTA	2025-10-18 21:26:03.952768	2025-10-18 21:26:29.670535
5	18	hgvgvh	PENDIENTE	2025-10-19 01:07:57.981867	\N
6	21	se me perdio	RESUELTA	2025-10-22 20:13:11.210213	2025-10-22 20:13:50.430753
\.


--
-- TOC entry 3623 (class 0 OID 82021)
-- Dependencies: 246
-- Data for Name: tipos_contrato; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_contrato (tipo_contrato_id, nombre_tipo, nivel_prioridad, descripcion) FROM stdin;
1	Tiempo Completo	1	Docente con máxima carga horaria y prioridad en asignación.
2	Tres Cuartos de Tiempo	2	Docente con carga horaria reducida.
3	Medio Tiempo	3	Docente con 20 horas semanales.
4	Por Asignatura	4	Docente pagado por hora/materia impartida. Menor prioridad.
\.


--
-- TOC entry 3596 (class 0 OID 33501)
-- Dependencies: 219
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
16	31	baMC&RC8	2025-10-26 05:48:51.996767-06
17	32	PDZH97eU	2025-10-26 05:55:07.115583-06
\.


--
-- TOC entry 3594 (class 0 OID 33494)
-- Dependencies: 217
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (usuario_id, email, password, rol_id, fecha_creacion) FROM stdin;
2	admin@unach.mx	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	1	2025-10-12 00:52:53.83231-06
10	hidyt@mailinator.com	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	2	2025-10-12 02:21:57.446188-06
11	fycibekix@mailinator.com	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	2	2025-10-12 02:27:54.578438-06
13	wusega@unach.com	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	2	2025-10-16 04:48:48.519577-06
14	rigoberto@unach.mx	$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G	2	2025-10-16 08:47:30.319158-06
3	profe@unach.mx	$2b$10$Y4qkh6tgzAuSLjjJ2SI8ze30olHCfdFBRKYJuYe35Vdj1VauFNFyq	2	2025-10-12 00:53:37.286524-06
18	rubenclemente221@gmail.com	$2b$10$4cgBf7GJEKKKSysOG9WtUuSA6R4iDNE11lrmIgmYCP68mGYzCNUmG	2	2025-10-16 11:57:29.622588-06
21	manuel.sandoval@unach.mx	$2b$10$I7FEbIBSHPwAzuMsUfKhjeQzg77k2dUvtirexCAARQNmYKncUs9DO	2	2025-10-22 20:08:16.120931-06
22	najoqeje@mailinator.com	$2b$10$FzAbEPoUg9OvGcsURMexJ.4qphm2tFlPzKI0miAn/pnSHPFlibvU2	2	2025-10-24 06:29:32.479756-06
23	myqa@mailinator.com	$2b$10$wscyJZV66rxkrHTZvcKE5uYcMU.HNI0loZbOLcijrc/bWiJOvsTK.	2	2025-10-24 06:34:52.806866-06
24	tysozad@mailinator.com	$2b$10$EtDLCIH6XRYKgg0tkwWGYuGejIAfxNNJKVDmmiIoHSX2dmuCV/ymS	2	2025-10-24 06:38:12.12558-06
25	qefy@mailinator.com	$2b$10$XNRBqxYDFWffsSW855sF6uTTclV22DMyKW9bfoWuBr0rSD7nn1mka	2	2025-10-24 07:03:52.61077-06
26	zyzesojig@mailinator.com	$2b$10$awEIOlSGLrRcAKa7nQfzY.YRNws0kRIys.1po0OaHiFsNIJzNNr0e	2	2025-10-24 13:57:17.719771-06
29	subebo@mailinator.com	$2b$10$3PWKlaPdu06rIwUTSsYfWOyoLqObc0T2L.lREqBetgQ1zQ3X1SlDe	2	2025-10-26 05:41:04.910788-06
31	josttravieso@gmail.com	$2b$10$2B/xdlqhZ7z4zjkgXtd0Cew7sj5OM5U.6gRUqGq8RnfWobXNbel9m	2	2025-10-26 05:48:51.991687-06
32	jose.clemente48@unach.mx	$2b$10$3CJYMH2ZzX07v3I2x/vRl.Bnjgl2FSsqiYg4XSltxeY.C3JQhqRl6	2	2025-10-26 05:55:07.102831-06
\.


--
-- TOC entry 3651 (class 0 OID 0)
-- Dependencies: 237
-- Name: actividades_solicitudes_actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actividades_solicitudes_actividad_id_seq', 5, true);


--
-- TOC entry 3652 (class 0 OID 0)
-- Dependencies: 223
-- Name: carreras_carrera_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carreras_carrera_id_seq', 58, true);


--
-- TOC entry 3653 (class 0 OID 0)
-- Dependencies: 241
-- Name: edificios_edificio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.edificios_edificio_id_seq', 2, true);


--
-- TOC entry 3654 (class 0 OID 0)
-- Dependencies: 226
-- Name: horarios_horario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_horario_id_seq', 19, true);


--
-- TOC entry 3655 (class 0 OID 0)
-- Dependencies: 239
-- Name: lugares_lugar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lugares_lugar_id_seq', 2, true);


--
-- TOC entry 3656 (class 0 OID 0)
-- Dependencies: 228
-- Name: materias_catalogo_materia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materias_catalogo_materia_id_seq', 60, true);


--
-- TOC entry 3657 (class 0 OID 0)
-- Dependencies: 247
-- Name: periodos_academicos_id_periodo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodos_academicos_id_periodo_seq', 2, true);


--
-- TOC entry 3658 (class 0 OID 0)
-- Dependencies: 231
-- Name: profesor_disponibilidad_disponibilidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesor_disponibilidad_disponibilidad_id_seq', 181, true);


--
-- TOC entry 3659 (class 0 OID 0)
-- Dependencies: 233
-- Name: profesor_preferencias_preferencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesor_preferencias_preferencia_id_seq', 3, true);


--
-- TOC entry 3660 (class 0 OID 0)
-- Dependencies: 227
-- Name: profesores_profesor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesores_profesor_id_seq', 7, true);


--
-- TOC entry 3661 (class 0 OID 0)
-- Dependencies: 216
-- Name: roles_rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_rol_id_seq', 2, true);


--
-- TOC entry 3662 (class 0 OID 0)
-- Dependencies: 243
-- Name: salones_salon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salones_salon_id_seq', 5, true);


--
-- TOC entry 3663 (class 0 OID 0)
-- Dependencies: 235
-- Name: solicitudes_recuperacion_solicitud_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_recuperacion_solicitud_id_seq', 6, true);


--
-- TOC entry 3664 (class 0 OID 0)
-- Dependencies: 245
-- Name: tipos_contrato_tipo_contrato_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_contrato_tipo_contrato_id_seq', 4, true);


--
-- TOC entry 3665 (class 0 OID 0)
-- Dependencies: 220
-- Name: tokens_auth_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tokens_auth_token_id_seq', 17, true);


--
-- TOC entry 3666 (class 0 OID 0)
-- Dependencies: 218
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_usuario_id_seq', 32, true);


--
-- TOC entry 3411 (class 2606 OID 73803)
-- Name: actividades_solicitudes actividades_solicitudes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividades_solicitudes
    ADD CONSTRAINT actividades_solicitudes_pkey PRIMARY KEY (actividad_id);


--
-- TOC entry 3396 (class 2606 OID 57359)
-- Name: carrera_materias carrera_materias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_pkey PRIMARY KEY (carrera_id, materia_id, numero_semestre);


--
-- TOC entry 3380 (class 2606 OID 33563)
-- Name: carreras carreras_nombre_carrera_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carreras
    ADD CONSTRAINT carreras_nombre_carrera_key UNIQUE (nombre_carrera);


--
-- TOC entry 3382 (class 2606 OID 33543)
-- Name: carreras carreras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carreras
    ADD CONSTRAINT carreras_pkey PRIMARY KEY (carrera_id);


--
-- TOC entry 3418 (class 2606 OID 73831)
-- Name: edificios edificios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edificios
    ADD CONSTRAINT edificios_pkey PRIMARY KEY (edificio_id);


--
-- TOC entry 3386 (class 2606 OID 33545)
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (horario_id);


--
-- TOC entry 3416 (class 2606 OID 73822)
-- Name: lugares lugares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares
    ADD CONSTRAINT lugares_pkey PRIMARY KEY (lugar_id);


--
-- TOC entry 3392 (class 2606 OID 57353)
-- Name: materias_catalogo materias_catalogo_nombre_materia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_catalogo
    ADD CONSTRAINT materias_catalogo_nombre_materia_key UNIQUE (nombre_materia);


--
-- TOC entry 3394 (class 2606 OID 57351)
-- Name: materias_catalogo materias_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_catalogo
    ADD CONSTRAINT materias_catalogo_pkey PRIMARY KEY (materia_id);


--
-- TOC entry 3428 (class 2606 OID 90120)
-- Name: periodos_academicos periodos_academicos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos_academicos
    ADD CONSTRAINT periodos_academicos_nombre_key UNIQUE (nombre);


--
-- TOC entry 3430 (class 2606 OID 90118)
-- Name: periodos_academicos periodos_academicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos_academicos
    ADD CONSTRAINT periodos_academicos_pkey PRIMARY KEY (id_periodo);


--
-- TOC entry 3398 (class 2606 OID 65555)
-- Name: profesor_disponibilidad profesor_disponibilidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT profesor_disponibilidad_pkey PRIMARY KEY (disponibilidad_id);


--
-- TOC entry 3384 (class 2606 OID 33549)
-- Name: profesor_materias profesor_materias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT profesor_materias_pkey PRIMARY KEY (profesor_id, materia_id);


--
-- TOC entry 3402 (class 2606 OID 65575)
-- Name: profesor_preferencias profesor_preferencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_pkey PRIMARY KEY (preferencia_id);


--
-- TOC entry 3404 (class 2606 OID 65577)
-- Name: profesor_preferencias profesor_preferencias_profesor_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_profesor_id_key UNIQUE (profesor_id);


--
-- TOC entry 3372 (class 2606 OID 33565)
-- Name: profesores profesores_matricula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_matricula_key UNIQUE (matricula);


--
-- TOC entry 3374 (class 2606 OID 33567)
-- Name: profesores profesores_numero_contrato_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_numero_contrato_key UNIQUE (numero_contrato);


--
-- TOC entry 3376 (class 2606 OID 33569)
-- Name: profesores profesores_numero_plaza_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_numero_plaza_key UNIQUE (numero_plaza);


--
-- TOC entry 3378 (class 2606 OID 33551)
-- Name: profesores profesores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_pkey PRIMARY KEY (profesor_id);


--
-- TOC entry 3360 (class 2606 OID 33571)
-- Name: roles roles_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);


--
-- TOC entry 3362 (class 2606 OID 33553)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (rol_id);


--
-- TOC entry 3420 (class 2606 OID 73845)
-- Name: salones salones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salones
    ADD CONSTRAINT salones_pkey PRIMARY KEY (salon_id);


--
-- TOC entry 3409 (class 2606 OID 73784)
-- Name: solicitudes_recuperacion solicitudes_recuperacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_recuperacion
    ADD CONSTRAINT solicitudes_recuperacion_pkey PRIMARY KEY (solicitud_id);


--
-- TOC entry 3422 (class 2606 OID 82032)
-- Name: tipos_contrato tipos_contrato_nivel_prioridad_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_nivel_prioridad_key UNIQUE (nivel_prioridad);


--
-- TOC entry 3424 (class 2606 OID 82030)
-- Name: tipos_contrato tipos_contrato_nombre_tipo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_nombre_tipo_key UNIQUE (nombre_tipo);


--
-- TOC entry 3426 (class 2606 OID 82028)
-- Name: tipos_contrato tipos_contrato_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_contrato
    ADD CONSTRAINT tipos_contrato_pkey PRIMARY KEY (tipo_contrato_id);


--
-- TOC entry 3368 (class 2606 OID 33557)
-- Name: tokens_auth tokens_auth_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT tokens_auth_pkey PRIMARY KEY (token_id);


--
-- TOC entry 3370 (class 2606 OID 33573)
-- Name: tokens_auth tokens_auth_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT tokens_auth_token_key UNIQUE (token);


--
-- TOC entry 3400 (class 2606 OID 90136)
-- Name: profesor_disponibilidad uq_disponibilidad_profesor_periodo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT uq_disponibilidad_profesor_periodo UNIQUE (profesor_id, dia_semana, hora_inicio, id_periodo);


--
-- TOC entry 3388 (class 2606 OID 90127)
-- Name: horarios uq_horario_profesor_periodo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_horario_profesor_periodo UNIQUE (profesor_id, dia_semana, hora_inicio, id_periodo);


--
-- TOC entry 3390 (class 2606 OID 90129)
-- Name: horarios uq_horario_salon_periodo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_horario_salon_periodo UNIQUE (salon_id, dia_semana, hora_inicio, id_periodo);


--
-- TOC entry 3364 (class 2606 OID 33583)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 3366 (class 2606 OID 33561)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 3412 (class 1259 OID 73810)
-- Name: idx_actividades_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividades_fecha ON public.actividades_solicitudes USING btree (fecha_actividad DESC);


--
-- TOC entry 3413 (class 1259 OID 73809)
-- Name: idx_actividades_solicitud; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividades_solicitud ON public.actividades_solicitudes USING btree (solicitud_id);


--
-- TOC entry 3414 (class 1259 OID 73811)
-- Name: idx_actividades_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividades_tipo ON public.actividades_solicitudes USING btree (tipo_actividad);


--
-- TOC entry 3405 (class 1259 OID 73790)
-- Name: idx_solicitudes_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitudes_estado ON public.solicitudes_recuperacion USING btree (estado);


--
-- TOC entry 3406 (class 1259 OID 73792)
-- Name: idx_solicitudes_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitudes_fecha ON public.solicitudes_recuperacion USING btree (fecha_solicitud DESC);


--
-- TOC entry 3407 (class 1259 OID 73791)
-- Name: idx_solicitudes_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitudes_usuario ON public.solicitudes_recuperacion USING btree (usuario_id);


--
-- TOC entry 3440 (class 2606 OID 57360)
-- Name: carrera_materias carrera_materias_carrera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_carrera_id_fkey FOREIGN KEY (carrera_id) REFERENCES public.carreras(carrera_id) ON DELETE CASCADE;


--
-- TOC entry 3441 (class 2606 OID 57365)
-- Name: carrera_materias carrera_materias_materia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_materias
    ADD CONSTRAINT carrera_materias_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- TOC entry 3447 (class 2606 OID 73832)
-- Name: edificios edificios_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edificios
    ADD CONSTRAINT edificios_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares(lugar_id);


--
-- TOC entry 3442 (class 2606 OID 90130)
-- Name: profesor_disponibilidad fk_disponibilidad_periodo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT fk_disponibilidad_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodos_academicos(id_periodo);


--
-- TOC entry 3437 (class 2606 OID 90121)
-- Name: horarios fk_horario_periodo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_horario_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodos_academicos(id_periodo);


--
-- TOC entry 3438 (class 2606 OID 65536)
-- Name: horarios fk_materia_horario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_materia_horario FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- TOC entry 3435 (class 2606 OID 65541)
-- Name: profesor_materias fk_materia_preferencia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT fk_materia_preferencia FOREIGN KEY (materia_id) REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE;


--
-- TOC entry 3443 (class 2606 OID 65558)
-- Name: profesor_disponibilidad fk_profesor_disponibilidad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_disponibilidad
    ADD CONSTRAINT fk_profesor_disponibilidad FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- TOC entry 3439 (class 2606 OID 33599)
-- Name: horarios fk_profesor_horario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT fk_profesor_horario FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- TOC entry 3436 (class 2606 OID 33604)
-- Name: profesor_materias fk_profesor_preferencia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_materias
    ADD CONSTRAINT fk_profesor_preferencia FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- TOC entry 3431 (class 2606 OID 33609)
-- Name: usuarios fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id) ON DELETE RESTRICT;


--
-- TOC entry 3446 (class 2606 OID 73804)
-- Name: actividades_solicitudes fk_solicitud; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividades_solicitudes
    ADD CONSTRAINT fk_solicitud FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_recuperacion(solicitud_id) ON DELETE CASCADE;


--
-- TOC entry 3433 (class 2606 OID 82033)
-- Name: profesores fk_tipo_contrato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT fk_tipo_contrato FOREIGN KEY (tipo_contrato_id) REFERENCES public.tipos_contrato(tipo_contrato_id) ON DELETE SET NULL;


--
-- TOC entry 3445 (class 2606 OID 73785)
-- Name: solicitudes_recuperacion fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_recuperacion
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- TOC entry 3434 (class 2606 OID 33624)
-- Name: profesores fk_usuario_profesor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT fk_usuario_profesor FOREIGN KEY (profesor_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- TOC entry 3432 (class 2606 OID 33629)
-- Name: tokens_auth fk_usuario_token; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_auth
    ADD CONSTRAINT fk_usuario_token FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- TOC entry 3444 (class 2606 OID 65578)
-- Name: profesor_preferencias profesor_preferencias_profesor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_preferencias
    ADD CONSTRAINT profesor_preferencias_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.profesores(profesor_id) ON DELETE CASCADE;


--
-- TOC entry 3448 (class 2606 OID 73846)
-- Name: salones salones_edificio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salones
    ADD CONSTRAINT salones_edificio_id_fkey FOREIGN KEY (edificio_id) REFERENCES public.edificios(edificio_id);


-- Completed on 2025-10-26 17:59:27 CST

--
-- PostgreSQL database dump complete
--

\unrestrict 1qVMkFmcKqALnwf27uUPC1T9Ni1mfXa3IzXXdVCPxvSiSJfkdt4NnZ7BWh5lNyi

