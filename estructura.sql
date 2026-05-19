--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: arbitro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arbitro (
    id_arbitro integer NOT NULL,
    categoria character varying(50),
    especializacion character varying(50),
    estado character varying(50) DEFAULT 'Activo'::character varying,
    id_usuario integer
);


ALTER TABLE public.arbitro OWNER TO postgres;

--
-- Name: arbitro_id_arbitro_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arbitro_id_arbitro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.arbitro_id_arbitro_seq OWNER TO postgres;

--
-- Name: arbitro_id_arbitro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arbitro_id_arbitro_seq OWNED BY public.arbitro.id_arbitro;


--
-- Name: asesor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asesor (
    id_asesor integer NOT NULL,
    estado_asesor character varying(20) DEFAULT 'Activo'::character varying,
    id_usuario integer
);


ALTER TABLE public.asesor OWNER TO postgres;

--
-- Name: asesor_id_asesor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asesor_id_asesor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asesor_id_asesor_seq OWNER TO postgres;

--
-- Name: asesor_id_asesor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asesor_id_asesor_seq OWNED BY public.asesor.id_asesor;


--
-- Name: asistencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencia (
    id_asistencia integer NOT NULL,
    fecha date,
    tipo_sesion character varying(100),
    asistio boolean DEFAULT true,
    justificacion text,
    id_arbitro integer
);


ALTER TABLE public.asistencia OWNER TO postgres;

--
-- Name: asistencia_id_asistencia_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asistencia_id_asistencia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asistencia_id_asistencia_seq OWNER TO postgres;

--
-- Name: asistencia_id_asistencia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asistencia_id_asistencia_seq OWNED BY public.asistencia.id_asistencia;


--
-- Name: cuerpo_tecnico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuerpo_tecnico (
    id_cuerpo integer NOT NULL,
    ci character varying(20),
    nombre character varying(150),
    rol character varying(100),
    id_equipo integer
);


ALTER TABLE public.cuerpo_tecnico OWNER TO postgres;

--
-- Name: cuerpo_tecnico_id_cuerpo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuerpo_tecnico_id_cuerpo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuerpo_tecnico_id_cuerpo_seq OWNER TO postgres;

--
-- Name: cuerpo_tecnico_id_cuerpo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuerpo_tecnico_id_cuerpo_seq OWNED BY public.cuerpo_tecnico.id_cuerpo;


--
-- Name: designado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designado (
    id_designado integer NOT NULL,
    funcion character varying(50),
    estado character varying(50) DEFAULT 'Pendiente'::character varying,
    novedad text,
    id_partido integer,
    id_arbitro integer
);


ALTER TABLE public.designado OWNER TO postgres;

--
-- Name: designado_id_designado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.designado_id_designado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.designado_id_designado_seq OWNER TO postgres;

--
-- Name: designado_id_designado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.designado_id_designado_seq OWNED BY public.designado.id_designado;


--
-- Name: equipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipo (
    id_equipo integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.equipo OWNER TO postgres;

--
-- Name: equipo_id_equipo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipo_id_equipo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipo_id_equipo_seq OWNER TO postgres;

--
-- Name: equipo_id_equipo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipo_id_equipo_seq OWNED BY public.equipo.id_equipo;


--
-- Name: evaluacion_partido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluacion_partido (
    id_evaluacion integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE,
    nota numeric(5,2),
    criterio_tecnico text,
    criterio_fisico text,
    criterio_actitud text,
    observacion text,
    recomendacion text,
    id_asesor integer,
    id_designado integer
);


ALTER TABLE public.evaluacion_partido OWNER TO postgres;

--
-- Name: evaluacion_partido_id_evaluacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluacion_partido_id_evaluacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluacion_partido_id_evaluacion_seq OWNER TO postgres;

--
-- Name: evaluacion_partido_id_evaluacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluacion_partido_id_evaluacion_seq OWNED BY public.evaluacion_partido.id_evaluacion;


--
-- Name: historial_categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_categoria (
    id_categoria integer NOT NULL,
    fecha_asignacion date,
    motivo text,
    id_arbitro integer
);


ALTER TABLE public.historial_categoria OWNER TO postgres;

--
-- Name: historial_categoria_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_categoria_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_categoria_id_categoria_seq OWNER TO postgres;

--
-- Name: historial_categoria_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_categoria_id_categoria_seq OWNED BY public.historial_categoria.id_categoria;


--
-- Name: inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventario (
    id_inventario integer NOT NULL,
    tipo character varying(100),
    cantidad integer,
    descripcion text,
    id_usuario integer
);


ALTER TABLE public.inventario OWNER TO postgres;

--
-- Name: inventario_id_inventario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventario_id_inventario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventario_id_inventario_seq OWNER TO postgres;

--
-- Name: inventario_id_inventario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventario_id_inventario_seq OWNED BY public.inventario.id_inventario;


--
-- Name: jugador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jugador (
    id_jugador integer NOT NULL,
    ci character varying(20),
    nombre character varying(150),
    dorsal integer,
    id_equipo integer
);


ALTER TABLE public.jugador OWNER TO postgres;

--
-- Name: jugador_id_jugador_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jugador_id_jugador_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jugador_id_jugador_seq OWNER TO postgres;

--
-- Name: jugador_id_jugador_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jugador_id_jugador_seq OWNED BY public.jugador.id_jugador;


--
-- Name: partido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partido (
    id_partido integer NOT NULL,
    fecha date NOT NULL,
    hora time without time zone NOT NULL,
    ubicacion character varying(200),
    liga character varying(100),
    categoria character varying(50),
    estado character varying(50) DEFAULT 'Programado'::character varying,
    honorario numeric(10,2),
    id_equipo_local integer,
    id_equipo_visitante integer,
    goles_local integer DEFAULT 0,
    goles_visitante integer DEFAULT 0,
    ganador character varying(100)
);


ALTER TABLE public.partido OWNER TO postgres;

--
-- Name: partido_id_partido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.partido_id_partido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partido_id_partido_seq OWNER TO postgres;

--
-- Name: partido_id_partido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.partido_id_partido_seq OWNED BY public.partido.id_partido;


--
-- Name: permiso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permiso (
    id_permiso integer NOT NULL,
    fecha_solicitud date DEFAULT CURRENT_DATE,
    fecha_inicio date,
    fecha_fin date,
    motivo text,
    estado character varying(50),
    id_arbitro integer
);


ALTER TABLE public.permiso OWNER TO postgres;

--
-- Name: permiso_id_permiso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permiso_id_permiso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permiso_id_permiso_seq OWNER TO postgres;

--
-- Name: permiso_id_permiso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permiso_id_permiso_seq OWNED BY public.permiso.id_permiso;


--
-- Name: prueba_escrita; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prueba_escrita (
    id_pruescrita integer NOT NULL,
    fecha date,
    tema character varying(200),
    nota numeric(5,2),
    observacion text,
    id_arbitro integer
);


ALTER TABLE public.prueba_escrita OWNER TO postgres;

--
-- Name: prueba_escrita_id_pruescrita_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prueba_escrita_id_pruescrita_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prueba_escrita_id_pruescrita_seq OWNER TO postgres;

--
-- Name: prueba_escrita_id_pruescrita_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prueba_escrita_id_pruescrita_seq OWNED BY public.prueba_escrita.id_pruescrita;


--
-- Name: prueba_fisica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prueba_fisica (
    id_prufisica integer NOT NULL,
    tipo_prueba character varying(100),
    fecha date,
    hora time without time zone,
    resultado character varying(100),
    observacion text,
    id_arbitro integer
);


ALTER TABLE public.prueba_fisica OWNER TO postgres;

--
-- Name: prueba_fisica_id_prufisica_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prueba_fisica_id_prufisica_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prueba_fisica_id_prufisica_seq OWNER TO postgres;

--
-- Name: prueba_fisica_id_prufisica_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prueba_fisica_id_prufisica_seq OWNED BY public.prueba_fisica.id_prufisica;


--
-- Name: sancion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sancion (
    id_sancion integer NOT NULL,
    fecha_sancion date,
    motivo text,
    duracion character varying(50),
    fecha_fin date,
    estado character varying(50),
    id_arbitro integer
);


ALTER TABLE public.sancion OWNER TO postgres;

--
-- Name: sancion_id_sancion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sancion_id_sancion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sancion_id_sancion_seq OWNER TO postgres;

--
-- Name: sancion_id_sancion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sancion_id_sancion_seq OWNED BY public.sancion.id_sancion;


--
-- Name: sanciona; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sanciona (
    id_sanciona integer NOT NULL,
    id_jugador integer,
    id_cuerpo integer,
    id_arbitro integer,
    minuto integer,
    tipo character varying(50),
    descripcion text
);


ALTER TABLE public.sanciona OWNER TO postgres;

--
-- Name: sanciona_id_sanciona_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sanciona_id_sanciona_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sanciona_id_sanciona_seq OWNER TO postgres;

--
-- Name: sanciona_id_sanciona_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sanciona_id_sanciona_seq OWNED BY public.sanciona.id_sanciona;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    ci character varying(20) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido_paterno character varying(100) NOT NULL,
    apellido_materno character varying(100),
    email character varying(150),
    telefono character varying(20),
    genero character varying(20),
    foto text,
    fecha_nacimiento date,
    password_hash text NOT NULL,
    activo boolean DEFAULT true,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ultimo_login timestamp without time zone,
    rol character varying(50)
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- Name: arbitro id_arbitro; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arbitro ALTER COLUMN id_arbitro SET DEFAULT nextval('public.arbitro_id_arbitro_seq'::regclass);


--
-- Name: asesor id_asesor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asesor ALTER COLUMN id_asesor SET DEFAULT nextval('public.asesor_id_asesor_seq'::regclass);


--
-- Name: asistencia id_asistencia; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia ALTER COLUMN id_asistencia SET DEFAULT nextval('public.asistencia_id_asistencia_seq'::regclass);


--
-- Name: cuerpo_tecnico id_cuerpo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuerpo_tecnico ALTER COLUMN id_cuerpo SET DEFAULT nextval('public.cuerpo_tecnico_id_cuerpo_seq'::regclass);


--
-- Name: designado id_designado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designado ALTER COLUMN id_designado SET DEFAULT nextval('public.designado_id_designado_seq'::regclass);


--
-- Name: equipo id_equipo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo ALTER COLUMN id_equipo SET DEFAULT nextval('public.equipo_id_equipo_seq'::regclass);


--
-- Name: evaluacion_partido id_evaluacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_partido ALTER COLUMN id_evaluacion SET DEFAULT nextval('public.evaluacion_partido_id_evaluacion_seq'::regclass);


--
-- Name: historial_categoria id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_categoria ALTER COLUMN id_categoria SET DEFAULT nextval('public.historial_categoria_id_categoria_seq'::regclass);


--
-- Name: inventario id_inventario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario ALTER COLUMN id_inventario SET DEFAULT nextval('public.inventario_id_inventario_seq'::regclass);


--
-- Name: jugador id_jugador; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugador ALTER COLUMN id_jugador SET DEFAULT nextval('public.jugador_id_jugador_seq'::regclass);


--
-- Name: partido id_partido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partido ALTER COLUMN id_partido SET DEFAULT nextval('public.partido_id_partido_seq'::regclass);


--
-- Name: permiso id_permiso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso ALTER COLUMN id_permiso SET DEFAULT nextval('public.permiso_id_permiso_seq'::regclass);


--
-- Name: prueba_escrita id_pruescrita; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prueba_escrita ALTER COLUMN id_pruescrita SET DEFAULT nextval('public.prueba_escrita_id_pruescrita_seq'::regclass);


--
-- Name: prueba_fisica id_prufisica; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prueba_fisica ALTER COLUMN id_prufisica SET DEFAULT nextval('public.prueba_fisica_id_prufisica_seq'::regclass);


--
-- Name: sancion id_sancion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sancion ALTER COLUMN id_sancion SET DEFAULT nextval('public.sancion_id_sancion_seq'::regclass);


--
-- Name: sanciona id_sanciona; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanciona ALTER COLUMN id_sanciona SET DEFAULT nextval('public.sanciona_id_sanciona_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- Name: arbitro arbitro_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arbitro
    ADD CONSTRAINT arbitro_id_usuario_key UNIQUE (id_usuario);


--
-- Name: arbitro arbitro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arbitro
    ADD CONSTRAINT arbitro_pkey PRIMARY KEY (id_arbitro);


--
-- Name: asesor asesor_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asesor
    ADD CONSTRAINT asesor_id_usuario_key UNIQUE (id_usuario);


--
-- Name: asesor asesor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asesor
    ADD CONSTRAINT asesor_pkey PRIMARY KEY (id_asesor);


--
-- Name: asistencia asistencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia
    ADD CONSTRAINT asistencia_pkey PRIMARY KEY (id_asistencia);


--
-- Name: cuerpo_tecnico cuerpo_tecnico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuerpo_tecnico
    ADD CONSTRAINT cuerpo_tecnico_pkey PRIMARY KEY (id_cuerpo);


--
-- Name: designado designado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designado
    ADD CONSTRAINT designado_pkey PRIMARY KEY (id_designado);


--
-- Name: equipo equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_pkey PRIMARY KEY (id_equipo);


--
-- Name: evaluacion_partido evaluacion_partido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_partido
    ADD CONSTRAINT evaluacion_partido_pkey PRIMARY KEY (id_evaluacion);


--
-- Name: historial_categoria historial_categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_categoria
    ADD CONSTRAINT historial_categoria_pkey PRIMARY KEY (id_categoria);


--
-- Name: inventario inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario
    ADD CONSTRAINT inventario_pkey PRIMARY KEY (id_inventario);


--
-- Name: jugador jugador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugador
    ADD CONSTRAINT jugador_pkey PRIMARY KEY (id_jugador);


--
-- Name: partido partido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partido
    ADD CONSTRAINT partido_pkey PRIMARY KEY (id_partido);


--
-- Name: permiso permiso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT permiso_pkey PRIMARY KEY (id_permiso);


--
-- Name: prueba_escrita prueba_escrita_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prueba_escrita
    ADD CONSTRAINT prueba_escrita_pkey PRIMARY KEY (id_pruescrita);


--
-- Name: prueba_fisica prueba_fisica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prueba_fisica
    ADD CONSTRAINT prueba_fisica_pkey PRIMARY KEY (id_prufisica);


--
-- Name: sancion sancion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sancion
    ADD CONSTRAINT sancion_pkey PRIMARY KEY (id_sancion);


--
-- Name: sanciona sanciona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanciona
    ADD CONSTRAINT sanciona_pkey PRIMARY KEY (id_sanciona);


--
-- Name: usuario usuario_ci_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_ci_key UNIQUE (ci);


--
-- Name: usuario usuario_nombre_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_nombre_usuario_key UNIQUE (nombre_usuario);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: arbitro arbitro_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arbitro
    ADD CONSTRAINT arbitro_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: asesor asesor_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asesor
    ADD CONSTRAINT asesor_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: asistencia asistencia_id_arbitro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia
    ADD CONSTRAINT asistencia_id_arbitro_fkey FOREIGN KEY (id_arbitro) REFERENCES public.arbitro(id_arbitro) ON DELETE CASCADE;


--
-- Name: cuerpo_tecnico cuerpo_tecnico_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuerpo_tecnico
    ADD CONSTRAINT cuerpo_tecnico_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id_equipo) ON DELETE CASCADE;


--
-- Name: designado designado_id_arbitro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designado
    ADD CONSTRAINT designado_id_arbitro_fkey FOREIGN KEY (id_arbitro) REFERENCES public.arbitro(id_arbitro) ON DELETE CASCADE;


--
-- Name: designado designado_id_partido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designado
    ADD CONSTRAINT designado_id_partido_fkey FOREIGN KEY (id_partido) REFERENCES public.partido(id_partido) ON DELETE CASCADE;


--
-- Name: evaluacion_partido evaluacion_partido_id_asesor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_partido
    ADD CONSTRAINT evaluacion_partido_id_asesor_fkey FOREIGN KEY (id_asesor) REFERENCES public.asesor(id_asesor);


--
-- Name: evaluacion_partido evaluacion_partido_id_designado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_partido
    ADD CONSTRAINT evaluacion_partido_id_designado_fkey FOREIGN KEY (id_designado) REFERENCES public.designado(id_designado) ON DELETE CASCADE;


--
-- Name: historial_categoria historial_categoria_id_arbitro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_categoria
    ADD CONSTRAINT historial_categoria_id_arbitro_fkey FOREIGN KEY (id_arbitro) REFERENCES public.arbitro(id_arbitro) ON DELETE CASCADE;


--
-- Name: inventario inventario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario
    ADD CONSTRAINT inventario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: jugador jugador_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugador
    ADD CONSTRAINT jugador_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id_equipo) ON DELETE CASCADE;


--
-- Name: partido partido_id_equipo_local_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partido
    ADD CONSTRAINT partido_id_equipo_local_fkey FOREIGN KEY (id_equipo_local) REFERENCES public.equipo(id_equipo);


--
-- Name: partido partido_id_equipo_visitante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partido
    ADD CONSTRAINT partido_id_equipo_visitante_fkey FOREIGN KEY (id_equipo_visitante) REFERENCES public.equipo(id_equipo);


--
-- Name: permiso permiso_id_arbitro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT permiso_id_arbitro_fkey FOREIGN KEY (id_arbitro) REFERENCES public.arbitro(id_arbitro) ON DELETE CASCADE;


--
-- Name: prueba_escrita prueba_escrita_id_arbitro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prueba_escrita
    ADD CONSTRAINT prueba_escrita_id_arbitro_fkey FOREIGN KEY (id_arbitro) REFERENCES public.arbitro(id_arbitro) ON DELETE CASCADE;


--
-- Name: prueba_fisica prueba_fisica_id_arbitro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prueba_fisica
    ADD CONSTRAINT prueba_fisica_id_arbitro_fkey FOREIGN KEY (id_arbitro) REFERENCES public.arbitro(id_arbitro) ON DELETE CASCADE;


--
-- Name: sancion sancion_id_arbitro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sancion
    ADD CONSTRAINT sancion_id_arbitro_fkey FOREIGN KEY (id_arbitro) REFERENCES public.arbitro(id_arbitro) ON DELETE CASCADE;


--
-- Name: sanciona sanciona_id_arbitro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanciona
    ADD CONSTRAINT sanciona_id_arbitro_fkey FOREIGN KEY (id_arbitro) REFERENCES public.arbitro(id_arbitro);


--
-- Name: sanciona sanciona_id_cuerpo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanciona
    ADD CONSTRAINT sanciona_id_cuerpo_fkey FOREIGN KEY (id_cuerpo) REFERENCES public.cuerpo_tecnico(id_cuerpo);


--
-- Name: sanciona sanciona_id_jugador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanciona
    ADD CONSTRAINT sanciona_id_jugador_fkey FOREIGN KEY (id_jugador) REFERENCES public.jugador(id_jugador);


--
-- PostgreSQL database dump complete
--

