--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
-- Name: estado_pago; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_pago AS ENUM (
    'Vigente',
    'Anulada'
);


ALTER TYPE public.estado_pago OWNER TO postgres;

--
-- Name: estado_solvencia; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_solvencia AS ENUM (
    'Solvente',
    'Insolvente'
);


ALTER TYPE public.estado_solvencia OWNER TO postgres;

--
-- Name: genero_persona; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.genero_persona AS ENUM (
    'Femenino',
    'Masculino'
);


ALTER TYPE public.genero_persona OWNER TO postgres;

--
-- Name: metodo_pago_carnet; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metodo_pago_carnet AS ENUM (
    'Pago Movil/Transferencia',
    'Zelle',
    'Efectivo Divisas'
);


ALTER TYPE public.metodo_pago_carnet OWNER TO postgres;

--
-- Name: metodo_pago_general; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metodo_pago_general AS ENUM (
    'Pago Movil/Transferencia',
    'Zelle',
    'Efectivo Divisas',
    'Cruces'
);


ALTER TYPE public.metodo_pago_general OWNER TO postgres;

--
-- Name: moneda_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.moneda_enum AS ENUM (
    'VES',
    'USD'
);


ALTER TYPE public.moneda_enum OWNER TO postgres;

--
-- Name: operacion_ugavi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.operacion_ugavi AS ENUM (
    'Prestamo_a_UGAVI',
    'Recibo_de_UGAVI'
);


ALTER TYPE public.operacion_ugavi OWNER TO postgres;

--
-- Name: parentesco_familiar; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.parentesco_familiar AS ENUM (
    'Conyuge',
    'Hijo/a',
    'Padre/Madre',
    'Otro'
);


ALTER TYPE public.parentesco_familiar OWNER TO postgres;

--
-- Name: tipo_miembro; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_miembro AS ENUM (
    'Juridico',
    'Natural'
);


ALTER TYPE public.tipo_miembro OWNER TO postgres;

--
-- Name: tipo_pago_carnet; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_pago_carnet AS ENUM (
    'Pagado',
    'Credito'
);


ALTER TYPE public.tipo_pago_carnet OWNER TO postgres;

--
-- Name: tipos_de_explotacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipos_de_explotacion AS ENUM (
    'Leche',
    'Carne',
    'Leche y Carne'
);


ALTER TYPE public.tipos_de_explotacion OWNER TO postgres;

--
-- Name: actualizar_saldo_miembro(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_saldo_miembro() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
            BEGIN
                IF TG_OP = 'DELETE' THEN
                    UPDATE miembros 
                    SET saldo_pendiente = (SELECT COALESCE(SUM(pendiente), 0) FROM facturas WHERE id_miembro = OLD.id_miembro)
                    WHERE id = OLD.id_miembro;
                    RETURN OLD;
                ELSE
                    UPDATE miembros 
                    SET saldo_pendiente = (SELECT COALESCE(SUM(pendiente), 0) FROM facturas WHERE id_miembro = NEW.id_miembro)
                    WHERE id = NEW.id_miembro;
                    RETURN NEW;
                END IF;
            END;
            $$;


ALTER FUNCTION public.actualizar_saldo_miembro() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bancos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bancos (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    titular character varying,
    divisa public.moneda_enum
);


ALTER TABLE public.bancos OWNER TO postgres;

--
-- Name: bancos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bancos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bancos_id_seq OWNER TO postgres;

--
-- Name: bancos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bancos_id_seq OWNED BY public.bancos.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: carnets_emitidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carnets_emitidos (
    id uuid NOT NULL,
    id_persona bigint NOT NULL,
    id_miembro bigint,
    fecha_emision date NOT NULL,
    fecha_vencimiento date,
    estado character varying(255) DEFAULT 'Activo'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.carnets_emitidos OWNER TO postgres;

--
-- Name: configuraciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuraciones (
    id bigint NOT NULL,
    clave character varying(255) NOT NULL,
    valor character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.configuraciones OWNER TO postgres;

--
-- Name: configuraciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuraciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuraciones_id_seq OWNER TO postgres;

--
-- Name: configuraciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuraciones_id_seq OWNED BY public.configuraciones.id;


--
-- Name: cruces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cruces (
    id integer NOT NULL,
    id_venta integer,
    id_banco integer,
    fecha date,
    referencia character varying,
    descripcion character varying,
    haber numeric(10,2)
);


ALTER TABLE public.cruces OWNER TO postgres;

--
-- Name: cruces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cruces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cruces_id_seq OWNER TO postgres;

--
-- Name: cruces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cruces_id_seq OWNED BY public.cruces.id;


--
-- Name: cuenta_banco; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta_banco (
    id integer NOT NULL,
    id_banco integer,
    id_venta integer,
    id_compra integer,
    fecha date,
    tipo_operacion character varying,
    referencia character varying,
    beneficiario character varying,
    descripcion character varying,
    debe numeric(10,2) DEFAULT 0,
    haber numeric(10,2) DEFAULT 0
);


ALTER TABLE public.cuenta_banco OWNER TO postgres;

--
-- Name: cuenta_banco_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuenta_banco_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuenta_banco_id_seq OWNER TO postgres;

--
-- Name: cuenta_banco_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuenta_banco_id_seq OWNED BY public.cuenta_banco.id;


--
-- Name: cuenta_corriente_ugavi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta_corriente_ugavi (
    id integer NOT NULL,
    fecha date,
    tipo_operacion public.operacion_ugavi,
    id_banco integer,
    monto numeric(10,2),
    monto_bs numeric(10,2),
    tasa_cambio numeric(10,2),
    referencia character varying,
    descripcion character varying
);


ALTER TABLE public.cuenta_corriente_ugavi OWNER TO postgres;

--
-- Name: cuenta_corriente_ugavi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuenta_corriente_ugavi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuenta_corriente_ugavi_id_seq OWNER TO postgres;

--
-- Name: cuenta_corriente_ugavi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuenta_corriente_ugavi_id_seq OWNED BY public.cuenta_corriente_ugavi.id;


--
-- Name: cuenta_moneda_extranjera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta_moneda_extranjera (
    id integer NOT NULL,
    id_banco integer,
    id_venta integer,
    id_compra integer,
    fecha date,
    tipo_operacion character varying,
    referencia character varying,
    beneficiario character varying,
    descripcion character varying,
    debe numeric(10,2) DEFAULT 0,
    haber numeric(10,2) DEFAULT 0
);


ALTER TABLE public.cuenta_moneda_extranjera OWNER TO postgres;

--
-- Name: cuenta_moneda_extranjera_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuenta_moneda_extranjera_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuenta_moneda_extranjera_id_seq OWNER TO postgres;

--
-- Name: cuenta_moneda_extranjera_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuenta_moneda_extranjera_id_seq OWNED BY public.cuenta_moneda_extranjera.id;


--
-- Name: documento_miembros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documento_miembros (
    id bigint NOT NULL,
    id_miembro bigint NOT NULL,
    tipo character varying(255) NOT NULL,
    ruta_archivo character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.documento_miembros OWNER TO postgres;

--
-- Name: documento_miembros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documento_miembros_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documento_miembros_id_seq OWNER TO postgres;

--
-- Name: documento_miembros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documento_miembros_id_seq OWNED BY public.documento_miembros.id;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    id integer NOT NULL,
    id_miembro integer,
    fecha date DEFAULT CURRENT_DATE,
    mes_cuota date,
    pendiente numeric(10,2),
    monto numeric(10,2)
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- Name: facturas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_id_seq OWNER TO postgres;

--
-- Name: facturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_id_seq OWNED BY public.facturas.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: ganado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ganado (
    id_miembro integer NOT NULL,
    equino boolean,
    vacuno boolean,
    bufalino boolean,
    caprino boolean,
    porcino boolean
);


ALTER TABLE public.ganado OWNER TO postgres;

--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: libro_compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libro_compras (
    id integer NOT NULL,
    id_proveedor integer,
    fecha date,
    tipo character varying,
    metodo_pago public.metodo_pago_general,
    monto numeric(10,2),
    monto_bs numeric(10,2),
    referencia character varying,
    numero_factura character varying,
    numero_control character varying
);


ALTER TABLE public.libro_compras OWNER TO postgres;

--
-- Name: libro_compras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.libro_compras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.libro_compras_id_seq OWNER TO postgres;

--
-- Name: libro_compras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.libro_compras_id_seq OWNED BY public.libro_compras.id;


--
-- Name: libro_ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libro_ventas (
    id integer NOT NULL,
    id_pago integer,
    id_miembro integer,
    fecha date,
    tipo character varying,
    metodo_pago public.metodo_pago_general,
    monto numeric(10,2),
    monto_bs numeric(10,2),
    referencia character varying,
    numero_factura character varying,
    numero_control character varying
);


ALTER TABLE public.libro_ventas OWNER TO postgres;

--
-- Name: libro_ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.libro_ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.libro_ventas_id_seq OWNER TO postgres;

--
-- Name: libro_ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.libro_ventas_id_seq OWNED BY public.libro_ventas.id;


--
-- Name: miembros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.miembros (
    id integer NOT NULL,
    razon_social character varying,
    acronimo character varying,
    rif character varying,
    fecha_ingreso date,
    tipo public.tipo_miembro,
    direccion character varying,
    hacienda character varying,
    hectareas numeric(10,2),
    solvencia public.estado_solvencia,
    saldo_pendiente numeric(10,2) DEFAULT 0,
    ultimo_mes date,
    correo character varying,
    telefono character varying,
    tipo_explotacion public.tipos_de_explotacion,
    tractores integer DEFAULT 0,
    plantas_electricas integer DEFAULT 0,
    convenio boolean DEFAULT false,
    cupo_gasoil boolean DEFAULT false,
    distribuidor_diesel character varying,
    cantidad_animales integer,
    produccion_leche_diaria numeric,
    token_acceso character varying(32),
    municipio character varying(288),
    parroquia character varying(288),
    password character varying(255),
    carnets_disponibles integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.miembros OWNER TO postgres;

--
-- Name: miembros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.miembros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.miembros_id_seq OWNER TO postgres;

--
-- Name: miembros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.miembros_id_seq OWNED BY public.miembros.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: seq_factura_fondo; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_factura_fondo
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seq_factura_fondo OWNER TO postgres;

--
-- Name: seq_factura_ugavi; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq_factura_ugavi
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seq_factura_ugavi OWNER TO postgres;

--
-- Name: pagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos (
    id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE,
    monto numeric(10,2),
    monto_bs numeric(10,2),
    tasa_cambio numeric(10,2),
    metodo_pago public.metodo_pago_general,
    factura_ugavi integer DEFAULT nextval('public.seq_factura_ugavi'::regclass),
    factura_fondo integer DEFAULT nextval('public.seq_factura_fondo'::regclass),
    referencia character varying,
    estado public.estado_pago DEFAULT 'Vigente'::public.estado_pago
);


ALTER TABLE public.pagos OWNER TO postgres;

--
-- Name: pagos_carnets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos_carnets (
    id bigint NOT NULL,
    id_miembro bigint NOT NULL,
    fecha date NOT NULL,
    monto numeric(10,2) NOT NULL,
    monto_bs numeric(10,2) NOT NULL,
    tasa_cambio numeric(10,4) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    metodo_pago character varying(255) NOT NULL,
    referencia character varying(255),
    cantidad_carnets integer NOT NULL,
    estado character varying(255) DEFAULT 'Pendiente'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.pagos_carnets OWNER TO postgres;

--
-- Name: pagos_carnets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_carnets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_carnets_id_seq OWNER TO postgres;

--
-- Name: pagos_carnets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_carnets_id_seq OWNED BY public.pagos_carnets.id;


--
-- Name: pagos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_id_seq OWNER TO postgres;

--
-- Name: pagos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_id_seq OWNED BY public.pagos.id;


--
-- Name: pagos_lote_carnets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos_lote_carnets (
    id integer NOT NULL,
    id_miembro integer,
    monto numeric(10,2),
    monto_bs numeric(10,2),
    moneda public.moneda_enum,
    fecha date,
    metodo_pago public.metodo_pago_carnet,
    referencia character varying,
    concepto character varying,
    tipo_pago public.tipo_pago_carnet
);


ALTER TABLE public.pagos_lote_carnets OWNER TO postgres;

--
-- Name: pagos_lote_carnets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_lote_carnets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_lote_carnets_id_seq OWNER TO postgres;

--
-- Name: pagos_lote_carnets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_lote_carnets_id_seq OWNED BY public.pagos_lote_carnets.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: personas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personas (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    ci_numero character varying NOT NULL,
    fecha_nacimiento date,
    correo character varying,
    telefono character varying,
    genero public.genero_persona,
    ex_presidente boolean DEFAULT false,
    honorario boolean DEFAULT false NOT NULL
);


ALTER TABLE public.personas OWNER TO postgres;

--
-- Name: personas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personas_id_seq OWNER TO postgres;

--
-- Name: personas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personas_id_seq OWNED BY public.personas.id;


--
-- Name: proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedor (
    id integer NOT NULL,
    razon_social character varying NOT NULL,
    rif character varying,
    direccion character varying
);


ALTER TABLE public.proveedor OWNER TO postgres;

--
-- Name: proveedor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedor_id_seq OWNER TO postgres;

--
-- Name: proveedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedor_id_seq OWNED BY public.proveedor.id;


--
-- Name: relaciones_familiares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relaciones_familiares (
    id integer NOT NULL,
    id_persona_titular integer,
    id_persona_familiar integer,
    parentesco public.parentesco_familiar
);


ALTER TABLE public.relaciones_familiares OWNER TO postgres;

--
-- Name: relaciones_familiares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relaciones_familiares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relaciones_familiares_id_seq OWNER TO postgres;

--
-- Name: relaciones_familiares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relaciones_familiares_id_seq OWNED BY public.relaciones_familiares.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: tasas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasas (
    id bigint NOT NULL,
    fecha date NOT NULL,
    monto numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.tasas OWNER TO postgres;

--
-- Name: tasas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasas_id_seq OWNER TO postgres;

--
-- Name: tasas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasas_id_seq OWNED BY public.tasas.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'visitante'::character varying NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'visitante'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vinculacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vinculacion (
    id_miembro integer NOT NULL,
    id_persona integer NOT NULL,
    representante boolean DEFAULT false,
    director boolean DEFAULT false,
    accionista boolean DEFAULT false,
    presidente boolean DEFAULT false NOT NULL
);


ALTER TABLE public.vinculacion OWNER TO postgres;

--
-- Name: vinculacion_pagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vinculacion_pagos (
    id_factura integer NOT NULL,
    id_pago integer NOT NULL,
    monto_aplicado numeric(10,2),
    descuento numeric(10,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.vinculacion_pagos OWNER TO postgres;

--
-- Name: bancos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos ALTER COLUMN id SET DEFAULT nextval('public.bancos_id_seq'::regclass);


--
-- Name: configuraciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuraciones ALTER COLUMN id SET DEFAULT nextval('public.configuraciones_id_seq'::regclass);


--
-- Name: cruces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cruces ALTER COLUMN id SET DEFAULT nextval('public.cruces_id_seq'::regclass);


--
-- Name: cuenta_banco id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_banco ALTER COLUMN id SET DEFAULT nextval('public.cuenta_banco_id_seq'::regclass);


--
-- Name: cuenta_corriente_ugavi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_corriente_ugavi ALTER COLUMN id SET DEFAULT nextval('public.cuenta_corriente_ugavi_id_seq'::regclass);


--
-- Name: cuenta_moneda_extranjera id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera ALTER COLUMN id SET DEFAULT nextval('public.cuenta_moneda_extranjera_id_seq'::regclass);


--
-- Name: documento_miembros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_miembros ALTER COLUMN id SET DEFAULT nextval('public.documento_miembros_id_seq'::regclass);


--
-- Name: facturas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id SET DEFAULT nextval('public.facturas_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: libro_compras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_compras ALTER COLUMN id SET DEFAULT nextval('public.libro_compras_id_seq'::regclass);


--
-- Name: libro_ventas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas ALTER COLUMN id SET DEFAULT nextval('public.libro_ventas_id_seq'::regclass);


--
-- Name: miembros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros ALTER COLUMN id SET DEFAULT nextval('public.miembros_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: pagos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos ALTER COLUMN id SET DEFAULT nextval('public.pagos_id_seq'::regclass);


--
-- Name: pagos_carnets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_carnets ALTER COLUMN id SET DEFAULT nextval('public.pagos_carnets_id_seq'::regclass);


--
-- Name: pagos_lote_carnets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_lote_carnets ALTER COLUMN id SET DEFAULT nextval('public.pagos_lote_carnets_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: personas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personas ALTER COLUMN id SET DEFAULT nextval('public.personas_id_seq'::regclass);


--
-- Name: proveedor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedor ALTER COLUMN id SET DEFAULT nextval('public.proveedor_id_seq'::regclass);


--
-- Name: relaciones_familiares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relaciones_familiares ALTER COLUMN id SET DEFAULT nextval('public.relaciones_familiares_id_seq'::regclass);


--
-- Name: tasas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasas ALTER COLUMN id SET DEFAULT nextval('public.tasas_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: bancos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bancos (id, nombre, titular, divisa) FROM stdin;
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: carnets_emitidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carnets_emitidos (id, id_persona, id_miembro, fecha_emision, fecha_vencimiento, estado, created_at, updated_at) FROM stdin;
4c9df3de-e7d5-46b3-a513-f9d2ff77abf5	783	102	2026-06-23	2027-06-23	Activo	2026-06-23 19:23:15	2026-06-23 19:23:15
1a0ec4c6-bb76-4524-88de-d19ddbe01cff	355	102	2026-06-23	2027-06-23	Activo	2026-06-23 19:23:15	2026-06-23 19:23:15
d42d324b-2166-441f-a876-6ce3bc922d73	356	102	2026-06-23	2027-06-23	Activo	2026-06-23 19:23:15	2026-06-23 19:23:15
4d5a5e63-bb00-4426-a4f5-8f10df17aa4e	371	119	2026-06-23	2027-06-23	Activo	2026-06-23 19:28:23	2026-06-23 19:28:23
946c790a-0caf-42e7-ac79-72da0abe19e6	365	119	2026-06-23	2027-06-23	Activo	2026-06-23 19:28:24	2026-06-23 19:28:24
b42534d0-85b2-43e7-89b9-e89d8d22e98f	368	119	2026-06-23	2027-06-23	Activo	2026-06-23 19:28:24	2026-06-23 19:28:24
d24236be-1031-478d-84e4-7ac876e65a4a	370	119	2026-06-23	2027-06-23	Activo	2026-06-23 19:28:24	2026-06-23 19:28:24
dd0647dc-1258-406a-b353-3ab3b0960b41	369	119	2026-06-23	2027-06-23	Activo	2026-06-23 19:28:24	2026-06-23 19:28:24
cfe1b5fa-5421-4353-86c0-3860242a7c82	367	119	2026-06-23	2027-06-23	Activo	2026-06-23 19:28:24	2026-06-23 19:28:24
9b8c9e16-d968-4a7c-8414-e7f2e74493c1	366	119	2026-06-23	2027-06-23	Activo	2026-06-23 19:28:25	2026-06-23 19:28:25
\.


--
-- Data for Name: configuraciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuraciones (id, clave, valor, created_at, updated_at) FROM stdin;
1	costo_carnet	5	2026-06-19 19:54:10	2026-06-19 19:54:10
\.


--
-- Data for Name: cruces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cruces (id, id_venta, id_banco, fecha, referencia, descripcion, haber) FROM stdin;
\.


--
-- Data for Name: cuenta_banco; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuenta_banco (id, id_banco, id_venta, id_compra, fecha, tipo_operacion, referencia, beneficiario, descripcion, debe, haber) FROM stdin;
\.


--
-- Data for Name: cuenta_corriente_ugavi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuenta_corriente_ugavi (id, fecha, tipo_operacion, id_banco, monto, monto_bs, tasa_cambio, referencia, descripcion) FROM stdin;
\.


--
-- Data for Name: cuenta_moneda_extranjera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuenta_moneda_extranjera (id, id_banco, id_venta, id_compra, fecha, tipo_operacion, referencia, beneficiario, descripcion, debe, haber) FROM stdin;
\.


--
-- Data for Name: documento_miembros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documento_miembros (id, id_miembro, tipo, ruta_archivo, created_at, updated_at) FROM stdin;
1	407	Registro Mercantil	documentos_miembros/407/1782246507_Registro_mercantil.pdf	2026-06-23 20:28:27	2026-06-23 20:28:27
2	407	RIF	documentos_miembros/407/1782246550_RIF_AGRO_COROCITO.pdf	2026-06-23 20:29:10	2026-06-23 20:29:10
3	407	Cédula	documentos_miembros/407/1782246557_C__dula.pdf	2026-06-23 20:29:17	2026-06-23 20:29:17
4	407	Documento de Propiedad de la Finca	documentos_miembros/407/1782246576_Documento_de_propiedad_de_Corocito.pdf	2026-06-23 20:29:36	2026-06-23 20:29:36
5	407	Doc. del Hierro	documentos_miembros/407/1782246584_Documento_del_hierro.pdf	2026-06-23 20:29:44	2026-06-23 20:29:44
6	407	Hierro (Imagen)	documentos_miembros/407/1782246591_Imagen_del_hierro.jpeg	2026-06-23 20:29:51	2026-06-23 20:29:51
7	119	RIF	documentos_miembros/119/1782247074_rif.pdf	2026-06-23 20:37:54	2026-06-23 20:37:54
8	119	Cédula	documentos_miembros/119/1782247081_cedula.pdf	2026-06-23 20:38:01	2026-06-23 20:38:01
9	119	Documento de Propiedad de la Finca	documentos_miembros/119/1782247098_inti_alvaro.pdf	2026-06-23 20:38:18	2026-06-23 20:38:18
10	119	Doc. del Hierro	documentos_miembros/119/1782247109_hierro_alvaro.pdf	2026-06-23 20:38:29	2026-06-23 20:38:29
11	119	Hierro (Imagen)	documentos_miembros/119/1782247114_IMG_20250516_151122.jpg	2026-06-23 20:38:34	2026-06-23 20:38:34
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (id, id_miembro, fecha, mes_cuota, pendiente, monto) FROM stdin;
2	83	2026-06-17	2026-06-01	0.00	25.00
3	99	2026-06-17	2026-06-01	0.00	25.00
4	102	2026-06-17	2026-06-01	25.00	25.00
5	119	2026-06-17	2026-06-01	25.00	25.00
6	268	2026-06-17	2026-06-01	25.00	25.00
7	127	2026-06-17	2026-06-01	25.00	25.00
8	327	2026-06-17	2026-06-01	25.00	25.00
9	252	2026-06-17	2026-06-01	25.00	25.00
10	324	2026-06-17	2026-06-01	25.00	25.00
11	266	2026-06-17	2026-06-01	25.00	25.00
12	214	2026-06-17	2026-06-01	25.00	25.00
13	261	2026-06-17	2026-06-01	25.00	25.00
14	5	2026-06-17	2026-06-01	25.00	25.00
15	35	2026-06-17	2026-06-01	25.00	25.00
16	16	2026-06-17	2026-06-01	25.00	25.00
17	103	2026-06-17	2026-06-01	25.00	25.00
18	62	2026-06-17	2026-06-01	25.00	25.00
19	94	2026-06-17	2026-06-01	25.00	25.00
20	123	2026-06-17	2026-06-01	25.00	25.00
21	12	2026-06-17	2026-06-01	25.00	25.00
22	25	2026-06-17	2026-06-01	25.00	25.00
23	388	2026-06-17	2026-06-01	25.00	25.00
24	81	2026-06-17	2026-06-01	25.00	25.00
25	4	2026-06-17	2026-06-01	25.00	25.00
26	23	2026-06-17	2026-06-01	25.00	25.00
27	43	2026-06-17	2026-06-01	25.00	25.00
28	54	2026-06-17	2026-06-01	25.00	25.00
29	242	2026-06-17	2026-06-01	25.00	25.00
30	224	2026-06-17	2026-06-01	25.00	25.00
31	217	2026-06-17	2026-06-01	25.00	25.00
32	236	2026-06-17	2026-06-01	25.00	25.00
33	88	2026-06-17	2026-06-01	25.00	25.00
34	284	2026-06-17	2026-06-01	25.00	25.00
35	46	2026-06-17	2026-06-01	25.00	25.00
36	399	2026-06-17	2026-06-01	25.00	25.00
37	289	2026-06-17	2026-06-01	25.00	25.00
38	269	2026-06-17	2026-06-01	25.00	25.00
39	299	2026-06-17	2026-06-01	25.00	25.00
40	206	2026-06-17	2026-06-01	25.00	25.00
41	75	2026-06-17	2026-06-01	25.00	25.00
42	285	2026-06-17	2026-06-01	25.00	25.00
43	181	2026-06-17	2026-06-01	25.00	25.00
44	272	2026-06-17	2026-06-01	25.00	25.00
45	61	2026-06-17	2026-06-01	25.00	25.00
46	65	2026-06-17	2026-06-01	25.00	25.00
47	363	2026-06-17	2026-06-01	25.00	25.00
48	106	2026-06-17	2026-06-01	25.00	25.00
49	30	2026-06-17	2026-06-01	25.00	25.00
50	52	2026-06-17	2026-06-01	25.00	25.00
51	310	2026-06-17	2026-06-01	25.00	25.00
52	376	2026-06-17	2026-06-01	25.00	25.00
53	368	2026-06-17	2026-06-01	25.00	25.00
54	233	2026-06-17	2026-06-01	25.00	25.00
55	198	2026-06-17	2026-06-01	25.00	25.00
56	152	2026-06-17	2026-06-01	25.00	25.00
57	414	2026-06-17	2026-06-01	25.00	25.00
58	377	2026-06-17	2026-06-01	25.00	25.00
59	71	2026-06-17	2026-06-01	25.00	25.00
60	334	2026-06-17	2026-06-01	25.00	25.00
61	89	2026-06-17	2026-06-01	25.00	25.00
62	159	2026-06-17	2026-06-01	25.00	25.00
63	253	2026-06-17	2026-06-01	25.00	25.00
64	301	2026-06-17	2026-06-01	25.00	25.00
65	329	2026-06-17	2026-06-01	25.00	25.00
66	291	2026-06-17	2026-06-01	25.00	25.00
67	387	2026-06-17	2026-06-01	25.00	25.00
68	8	2026-06-17	2026-06-01	25.00	25.00
69	31	2026-06-17	2026-06-01	25.00	25.00
70	174	2026-06-17	2026-06-01	25.00	25.00
71	37	2026-06-17	2026-06-01	25.00	25.00
72	328	2026-06-17	2026-06-01	25.00	25.00
73	142	2026-06-17	2026-06-01	25.00	25.00
74	160	2026-06-17	2026-06-01	25.00	25.00
75	411	2026-06-17	2026-06-01	25.00	25.00
76	413	2026-06-17	2026-06-01	25.00	25.00
77	262	2026-06-17	2026-06-01	25.00	25.00
78	69	2026-06-17	2026-06-01	25.00	25.00
79	396	2026-06-17	2026-06-01	25.00	25.00
80	1	2026-06-17	2026-06-01	25.00	25.00
81	271	2026-06-17	2026-06-01	25.00	25.00
82	98	2026-06-17	2026-06-01	25.00	25.00
83	390	2026-06-17	2026-06-01	25.00	25.00
84	393	2026-06-17	2026-06-01	25.00	25.00
85	137	2026-06-17	2026-06-01	25.00	25.00
86	185	2026-06-17	2026-06-01	25.00	25.00
87	255	2026-06-17	2026-06-01	25.00	25.00
88	407	2026-06-17	2026-06-01	25.00	25.00
89	171	2026-06-17	2026-06-01	25.00	25.00
90	57	2026-06-17	2026-06-01	25.00	25.00
91	378	2026-06-17	2026-06-01	25.00	25.00
92	141	2026-06-17	2026-06-01	25.00	25.00
93	278	2026-06-17	2026-06-01	25.00	25.00
94	124	2026-06-17	2026-06-01	25.00	25.00
95	385	2026-06-17	2026-06-01	25.00	25.00
96	228	2026-06-17	2026-06-01	25.00	25.00
97	421	2026-06-17	2026-06-01	25.00	25.00
98	371	2026-06-17	2026-06-01	25.00	25.00
99	405	2026-06-17	2026-06-01	25.00	25.00
100	9	2026-06-17	2026-06-01	25.00	25.00
101	203	2026-06-17	2026-06-01	25.00	25.00
102	309	2026-06-17	2026-06-01	25.00	25.00
103	202	2026-06-17	2026-06-01	25.00	25.00
104	221	2026-06-17	2026-06-01	25.00	25.00
105	379	2026-06-17	2026-06-01	25.00	25.00
106	199	2026-06-17	2026-06-01	25.00	25.00
107	402	2026-06-17	2026-06-01	25.00	25.00
108	423	2026-06-17	2026-06-01	25.00	25.00
109	389	2026-06-17	2026-06-01	25.00	25.00
110	412	2026-06-17	2026-06-01	25.00	25.00
111	404	2026-06-17	2026-06-01	25.00	25.00
112	125	2026-06-17	2026-06-01	25.00	25.00
113	403	2026-06-17	2026-06-01	25.00	25.00
114	422	2026-06-17	2026-06-01	25.00	25.00
115	408	2026-06-17	2026-06-01	25.00	25.00
1	260	2026-06-17	2026-06-01	0.00	25.00
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: ganado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ganado (id_miembro, equino, vacuno, bufalino, caprino, porcino) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: libro_compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.libro_compras (id, id_proveedor, fecha, tipo, metodo_pago, monto, monto_bs, referencia, numero_factura, numero_control) FROM stdin;
\.


--
-- Data for Name: libro_ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.libro_ventas (id, id_pago, id_miembro, fecha, tipo, metodo_pago, monto, monto_bs, referencia, numero_factura, numero_control) FROM stdin;
\.


--
-- Data for Name: miembros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.miembros (id, razon_social, acronimo, rif, fecha_ingreso, tipo, direccion, hacienda, hectareas, solvencia, saldo_pendiente, ultimo_mes, correo, telefono, tipo_explotacion, tractores, plantas_electricas, convenio, cupo_gasoil, distribuidor_diesel, cantidad_animales, produccion_leche_diaria, token_acceso, municipio, parroquia, password, carnets_disponibles) FROM stdin;
127	Asociacion Civil Hato Las Caracaras	N/A	J-29446022-4	2014-05-02	Juridico	Av Adolfo Lopez Con Calle Oriente Casa S/N	Hda. Las Caracaras	\N	\N	\N	\N	juanpaz15@gmail.com	584146846398	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
327	Agropecuaria Morales Borrelli, C.A	AGROMORCA	J-31568258-6	2025-01-01	Juridico	Zararita Matapalo	Hda. Cantalotodo	400.00	\N	\N	\N	Mecco05@gmail.com	584166621049	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
252	Agropecuaria Las Dos Letras, S.A	N/A	J-070268298	2025-01-01	Juridico	Calle Derecha La Pollera	Agrop. Las Dos Letras	\N	\N	\N	\N	\N	584143630098	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
324	Agropecuaria Llano Bello, S.A	LLABESA	J-07033469-0	2025-01-01	Juridico	Ctra La Villa Machiques Sector Palmita	Hda. Lagunetas	\N	\N	\N	\N	adafel.e.b@hotmail.com	584146502066	Leche y Carne	\N	\N	\N	t	Danca	\N	\N	\N	Machiques de Perijá	Libertad	\N	0
266	Agropecuaria El Romeral, C.A	N/A	J-29595453-0	2025-01-01	Juridico	Ctra Zararita Matapalo, Camino Los Villeros	Agrop. El Romeral	\N	\N	\N	\N	\N	584146214195	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
214	Agropecuaria Puerto España, S.A	AGROPESA	J-31323580-6	2025-01-01	Juridico	Av Concepcion Casa S/N	Agrop. Puerto España	200.00	\N	\N	\N	Robertoromero1@gmail.com	584140373048	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
261	Asociación Civil Agropecuaria Rancho Los Aguacates, C.A	N/A	J-31550477-4	2013-09-12	Juridico	Zararita Matapalo	Rancho Los Aguacates	189.00	\N	\N	\N	Pervenca.20@gmail.com	584121251233	Leche y Carne	2	\N	\N	t	Distribuidora las palmeras	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
171	Inversiones Agropecuarias Maioriello Vallejo, S.A	N/A	J-07029293-8	2025-01-01	Juridico	Ctra El Guaco	Hda. Matapalo	520.00	\N	\N	\N	Pmaioriello@hotmail.com	584126835295	Leche y Carne	8	2	\N	t	Damca	1200	1000	\N	Rosario de Perijá	El Rosario	\N	0
83	Astolfo Angel Berrueta Ortega	N/A	V-03465410-3	2025-01-01	Natural	Calle Central N°164	Hda. La Imperial	\N	\N	0.00	\N	astolfoberruetaortega@gmail.com	584143630223	Leche y Carne	\N	\N	\N	t	Dispasa	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
268	Inversiones Romero Ramirez, C.A	INRORACA	J-30782140-0	2025-01-01	Juridico	Ctra 104 Bqtas Casa Nro S/N Sector Villa Vieja	Hda. La Imperial	304.00	\N	\N	\N	Luisanibalromerotapia@gmail.com	584122931533	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Barranquitas	\N	1
260	Ganaderia Ringut, S.A	N/A	J-41002279-5	2025-01-01	Juridico	Av 18 De Octubre	Hda. Ringut	\N	\N	\N	\N	armillorincon@gmail.com	584146816681	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
99	Inversiones Agropecuaria Los Chacines, C.A	INACHA	J-07009338-2	2025-01-01	Juridico	Calle 27 Con Av 24	Hda. El Cerro	300.00	\N	0.00	\N	inacha.1949@gmail.com	12146432577	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
102	Haciendas, C.A	N/A	J-07022024-4	2013-10-04	Juridico	Km 80 Via La Villa Maracaibo	Hda. Ca	\N	\N	\N	\N	Haciendas.ca@hotmail.com	584125114533	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario / Sixto Zambrano	\N	0
119	Finol Romero Alvaro Luis	N/A	v-4989426	2025-01-01	Natural	Calle 18 De Octubre	Hda. Los Leones	250.00	\N	\N	\N	Alvarofinol@gmail.com	584127807298	Leche y Carne	1	\N	\N	t	Damca	\N	\N	\N	Rosario de Perijá	El Rosario	\N	3
5	Villa Nueva, C.A	N/A	J-29458517-5	2012-01-17	Juridico	Ctra La Culebra	Hda. San Carlos	1151.00	\N	\N	\N	villanuevacana@gmail.com	584126060654	Leche y Carne	4	\N	\N	t	Damca	\N	\N	\N	Machiques de Perijá	Bartolomé de las Casas	\N	0
35	Agropecuaria La Bendicion, C.A	AGROPEBENCA	J-29680653-5	2009-07-13	Juridico	Calle 26 Urdaneta Con Av 22	Hda. San Manuel	\N	\N	\N	\N	neilamestre@hotmail.com	584141663834	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
16	Agropecuaria Santa Fe, C.A	AGROSAFENCA	J-31144830-6	2012-08-28	Juridico	Ctra Aquí Me Quedo Sector Los Limones	Hda. Santa Fe	434.00	\N	\N	\N	agrosfenca@hotmail.com	584246431483	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
103	Inversiones Agropecuaria Rodriguez, C.A	INAROCA	J-07050385-8	2010-12-18	Juridico	Calle Falcon	Hda. San Benito	\N	\N	\N	\N	\N	584146685025	Leche y Carne	\N	\N	\N	t	Damca	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
62	Inversora El Matapalito, C.A.	N/A	V-9.844.040	2010-03-22	Juridico	Ctra La Villa Machiques Casa Fundo Agropecuario Inelmaca Nro S/N	Hda. Matapalito	25.84	\N	\N	\N	Inversoraelmatapalito@gmail.com	584127809931	Leche y Carne	0	1	\N	t	Damca	\N	\N	\N	Machiques de Perijá	Libertad	\N	0
94	Agropecuaria La Bonanza, C.A	AGROBONCA	J-31259897-2	2007-03-21	Juridico	Calle 18 Con Av El Milagro	Hda. La Bonanza	\N	\N	\N	\N	\N	584149635167	Leche y Carne	\N	\N	\N	t	Damca	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
123	Agropecuaria El Zancudo, C.A	AGROZARCA	J-31226450-0	2007-08-16	Juridico	Calle 18 De Octubre	Hda. Rincon Largo	280.00	\N	\N	\N	aer72970@gmail.com	584146714978	Leche y Carne	1	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
12	Agropecuaria Hacienda Rancho R, C.A.	N/A	J-29681684-0	2009-07-06	Juridico	Ctra Guayabo - Redoma Casa Nro S/N Sector Amparo	Hda. Rancho R	221.00	\N	\N	\N	lenisrincon73@hotmail.com	584143623369	Leche y Carne	3	\N	\N	t	La fuente del kerosen	\N	\N	\N	Maracaibo	Caracciolo Parra Pérez (Fuera de Perijá)	\N	0
25	Nolasco Triana- Jose Triana	N/A	V-12344226	2013-04-08	Natural	Donaldo Garcia	Hda. Finca Rosa	125.00	\N	\N	\N	Triananolasco@gmail.com	584128637272	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	Donaldo García (El Cruce)	\N	0
388	Mario Alfredo Saab Zuleta	N/A	V-127582390	2025-01-01	Natural	Urb El Valle	Hda. La Orquidea	80.90	\N	\N	\N	marioasaab@hotmail.com	584127715743	Leche y Carne	1	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
81	Agropecuaria Bema, C.A	AGROBEMACA	J-07043053-2	2013-09-14	Juridico	Urb Rodolfo Rincon	Hda. La Argentina y Santa Clara.	\N	\N	\N	\N	darwin_andres@hotmail.com	584125119701	Leche y Carne	\N	\N	\N	t	Distribuidora las palmeras	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
4	Hato Azteca, C.A	N/A	J-29908045-4	2011-08-19	Juridico	Av Municipal Calle 21- 15	Hda. Azteca	\N	\N	\N	\N	\N	584127871104	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
23	Grupo Rincon Gutierrez, C.A	N/A	J-41206887-3	2013-03-07	Juridico	Calle Vargas Sector San Jose	Hda. Rancho Grande	255.00	\N	\N	\N	agroindustrialcentro@gmail.com	12146160138	Leche y Carne	1	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
43	Agropecuaria Madre Vieja, C. A	N/A	J-31243566-6	2014-02-05	Juridico	Residencias El Corral	Hda. El Toro	\N	\N	\N	\N	\N	584121377672	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
54	Ganaderia Romero Garcia, S.A	GAROGASA	J-30048620-6	2017-01-09	Juridico	Ctra Zararita Matapalo	Hda. Guatire	210.00	\N	\N	\N	\N	584126546257	Leche y Carne	2	2	\N	t	Damca	444	930	\N	Rosario de Perijá	El Rosario	\N	0
242	Comunidad Negreira Y Pacheco	N/A	J-30707082-0	2025-01-01	Juridico	Urb Rodolfo Rincon	Fundo Agropecuario San Rafael	\N	\N	\N	\N	\N	584127872032	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
224	Agropecuaria El Vinculo, C.A	AGROVINCA	J-07043057-5	2008-05-02	Juridico	Ctra 104 Barranquita	Agrop. El Vinculo C,A.	\N	\N	\N	\N	\N	584146747981	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Barranquitas	\N	0
217	Ganaderia Nuevo Centro, C.A	GANUCENCA	J-29673642-1	2011-05-20	Juridico	Av 20 Municipal Entre 26/27	Hda. Centro Nuevo	519.00	\N	\N	\N	ciromestre@hotmail.com	584121262828	Leche y Carne	3	\N	\N	t	Dispasa	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
236	Marquez Arevalo O.	N/A	V- 3468453	2025-01-01	Natural	Av Falcon Casa 24	Hda. La Korea	120.00	\N	\N	\N	aromaster@gmail.com	584166665574	Leche y Carne	5	\N	\N	t	Dispasa	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
88	C.A Hacienda El Ebano	N/A	J-07000925-0	2025-01-01	Juridico	Calle 72 Av 2	C.A Hacienda El Ebano	\N	\N	\N	\N	\N	584248342900	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
284	San Isidro, C.A	N/A	J-30193355-9	2025-01-01	Juridico	C/C Costa Azul Local #2	Rancho R	460.00	\N	\N	\N	mariolossada@hotmail.com	584146968532	Leche y Carne	5	\N	\N	t	Dispasa	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
46	Agropecuaria Meseta, C.A	AGROMECA	J-07012168-8	2025-01-01	Juridico	Aserradero San Juan	Agrop. Meseta C,A.	\N	\N	\N	\N	\N	584246262234	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
399	Desarrollo Agropecuario La California, C.A	DALACA	J-31385594-4	2019-02-28	Juridico	Sector La Culebra	La California C,A.	\N	\N	\N	\N	\N	584127863854	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Bartolomé de las Casas	\N	0
289	Agropecuaria El Tartagal, C.A	AGROTACA	J-07037922-7	2006-09-21	Juridico	Calle Concepcio	Agrop. El Tartagal C,A.	\N	\N	\N	\N	\N	584127863963	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
269	Inversiones Agrocomerciales Romero Tapia, C.A	N/A	J-29438038-7	2025-01-01	Juridico	Caserio Villa Vieja	Inv. Agrocomerciales Romero Tapia	86.00	\N	\N	\N	romerozaida@gmail.com	584143629465	Leche y Carne	6	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
299	Vargas Gutierrez Edgar Guzman	N/A	V-0499075-6	2025-01-01	Natural	Calle 18 De Octubre	Hda. Cañada Honda	\N	\N	\N	\N	abm1903@hotmail.com	584126414031	Leche y Carne	\N	\N	\N	t	Danca	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
206	Inversiones Martinez Aguirre, S.A	INMAGUI	J-31285508-8	2010-05-27	Juridico	Calle 26 Av 21-22	Agrop. Martinez Aguirre	200.00	\N	\N	\N	jsamuelmartinez1806@gmail.com	584146154179	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
75	Agropecuaria Chourio Muños, C.A	N/A	J-30610288-4	2013-09-12	Juridico	104 Barranquita	Hda. El Cotuperiz	150.00	\N	\N	\N	Maxi-61hotmail.com	584126935270	Leche y Carne	1	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Barranquitas	\N	0
285	C.A Agropecuaria Campo Alegre	N/A	J-31034232-7	2025-01-01	Juridico	C/C El Rosario	Hda. Campo Alegre	\N	\N	\N	\N	\N	584146412758	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
181	Marcos Vinicio Graziano Finol	N/A	V-07938646-0	2003-12-08	Natural	Sector Amparo Residencia El Portal Al Lado De La Cañada	Hda La Redoma	\N	\N	\N	\N	marcosgraziano2@gmail.com	584127803189	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Maracaibo	Cacique Mara (Fuera de Perijá)	\N	0
272	Villa Lactea, S.A	VILLASA	J-30862872-7	2006-09-08	Juridico	Sector Amparo Via El Prado	Hda. Villa Lactea	15.00	\N	\N	\N	Villalactea@hotmail.com	584246164670	Leche y Carne	1	\N	\N	t	DAMCA	\N	\N	\N	Maracaibo	Cacique Mara (Fuera de Perijá)	\N	0
61	Agropecuaria Valentina, C.A	N/A	J-30004002-0	2025-01-01	Juridico	Ctra Trilla Los Lechosos Casa Hacienda San Martin	Hda. San Martin	441.00	\N	\N	\N	Eduardochacin_1@yahoo.com	584124738971	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Libertad	\N	0
65	Tito Enrique Castillo	N/A	V-2883277	2011-02-10	Natural	Calle 79 Con Esquina 11	Hda. La Gran China	500.00	\N	\N	\N	Leonardocastillo72@gmail.com	584143603183	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
363	Agropecuaria Martinez Gutierrez, C.A	AGROMAGUCA	J-30367810-0	2015-08-12	Juridico	Urb El Valle	Hda. Los Tamares	\N	\N	\N	\N	\N	584127906823	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
106	Sociedad Civil Aristidez Y Reinerio	N/A	J-31222730-3	2014-04-10	Juridico	Calle 18 De Octubre	Sociedad C. Aristidez Y Reinerio.	\N	\N	\N	\N	hdasantarita@gmail.com	584146062110	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
30	Agropecuaria La Barra, C.A	AGROBACA	J07040856-1	2025-01-01	Juridico	Calle 18 De Octubre	Hda. La Barra	\N	\N	\N	\N	\N	584126888622	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
52	Agropecuaria Romero Martinez, C.A	AGROROMA	J-30654364-3	2025-01-01	Juridico	Av Municipal Entre Calle 25 Y 26	Hda. San Rafael Y Las Taritas	480.00	\N	\N	\N	martinromeromartinez73@gmail.com	584246902670	Leche y Carne	4	\N	\N	t	Dispasa	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
310	Romero Mendez Juan Carlos	N/A	V-11661737	2007-02-01	Natural	Calle El Milagro	Hda Bella Vista	\N	\N	\N	\N	\N	584140379946	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
376	Agropecuaria Re, C.A	N/A	J-31506644-0	2017-03-30	Juridico	Ctra El Crucero	Hda. Corea	\N	\N	\N	\N	Francocriscuolo@hotmail.com	584127864515	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	Donaldo García (El Cruce)	\N	0
368	Ganaderia Pordenone, S.A	N/A	J-31720103-5	2025-01-01	Juridico	Calle 18 Urb El Valle	Hda. Azteca	\N	\N	\N	\N	\N	584126426055	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
233	Sucesion Navarro Ramon Antonio	N/A	J-503420456	2025-01-01	Juridico	Urb Aurora	Hda. Mis Delicias	60.00	\N	\N	\N	victortocuso1976@gmail.com	584143756035	Leche y Carne	1	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
198	Ganaderia Bella Vista, C.A	N/A	J-29906617-6	2020-03-31	Juridico	Urb El Valle	Hda. Bella Vista	350.00	\N	\N	\N	Carogaddi@hotmail.com	584146314899	Leche y Carne	3	\N	\N	t	Distribuidora las palmeras s.a	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
152	Yean Carlos Morales Silva	N/A	V-15659167-6	2014-08-26	Natural	Av Concepcion N° 65	Hda. Buenos Aires	90.00	\N	\N	\N	Yeancarlosmoralessilva@gmail.com	12144071113	Leche y Carne	1	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
414	Hacienda Madrigal, S.A	MADRISA	J-070152931	2025-04-04	Juridico	Av 9 Con Calle 67 Cc Doña Casilda Sector Cecilio Acosta	Hda. Madrigal S,A.	\N	\N	\N	\N	\N	584129647210	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Maracaibo	Olegario Villalobos (Fuera de Perijá)	\N	0
377	Agropecuaria San Nicolas, C.A	AGROSANI	J-07051368-8	2017-03-10	Juridico	Zararita Matapalo	Agrop. San Nicolas	\N	\N	\N	\N	\N	584146367200	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
71	Gomel Jose Sierra Arteaga	N/A	V-04991557-4	2025-01-01	Natural	Urb El Valle Casa N°3	Hda. Campo Verde	\N	\N	\N	\N	gomels61@hotmail.com	584122566962	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
334	Inversiones Agropecuaria Fincas, C.A	N/A	J-30520908-1	2025-01-01	Juridico	Via Puentecito Sector La Quebrada	Hda. Alturitas	100.00	\N	\N	\N	Invagropfincas@gmail.com	584246822977	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
89	Lopez Mauricio Jose	N/A	V-7694520	2013-10-02	Natural	Av 24 Con Calle 18	Hda. Tachira	92.00	\N	\N	\N	Mauriciolopez2544@gmail.com	584126594789	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
159	Inversiones Agropecuaria Los Cañahuates, C.A	INALCA	J-07011471-1	2025-01-01	Juridico	Via Puentecito Sector La Quebrada	Hda. Ave Maria	709.00	\N	\N	\N	Pablomartinezrincon@icloud.com	584126909231	Leche y Carne	5	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
253	Rincon Amaya Y Pirela	N/A	V-7689716	2025-01-01	Juridico	Av 20 N° 27-05	\N	\N	\N	\N	\N	\N	584246067046	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
301	Viateca	N/A	J-00195051-6	2025-01-01	Juridico	104 Barranquita	\N	\N	\N	\N	\N	\N	584246287926	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Barranquitas	\N	0
329	Agropecuaria El Macho, C.A	AGROMASA	J-30542501-9	2025-01-01	Juridico	Urb Simon Bolivar	Hda. Carmen Rosa	470.00	\N	\N	\N	adbdongonzalez329	584126581425	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
291	Agropecuaria El Caimito, C.A	AGROCAINA	J-07019486-3	2025-01-01	Juridico	Calle El Registo	Hda. El Caimito C,A.	1740.00	\N	\N	\N	hjsuarezc@gmail.com	584143601419	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
387	Agropecuaria Manuel Segundo Finol, C.A	MASFINCA	J-07022451-7	2025-01-01	Juridico	C/C Costa Azul Local #2	Agrop. Manuel Segundo Final	\N	\N	\N	\N	agromasfinca@gmail.com	584143611552	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
8	Agropecuaria Carmen Rosa, C.A	N/A	J-07037008-4	2025-01-01	Juridico	Calle Central Frente Plaza Bolivar	Hda. Carmen Rosa	\N	\N	\N	\N	\N	584126582445	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
31	Agropecuaria La Cruz, C.A	AGROCRUZ	J-30003888-4	2025-01-01	Juridico	104 Barranquita	Hda. Villa Nueva	\N	\N	\N	\N	\N	584127805730	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Barranquitas	\N	0
174	Inversiones Agropecuaria Rincon Gonzalez,C.A	RIGOSA	J-07021663-8	2025-01-01	Juridico	Av 20 Ante Municipal	Agrop. Rincon Gonzalez	\N	\N	\N	\N	\N	584127869282	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
37	Agropecuaria Las Marias, C.A	N/A	J-30166542-2	2025-01-01	Juridico	Av Central Frente Plaza Bolivar	Hda. Santa Fe	\N	\N	\N	\N	Isabelromero3@yahoo.es	584127868260	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
328	Ganaderia Corozal Y San Luis, S. A.	GACOSSA	J-30364850-9	2025-01-01	Juridico	Carretera La Quebrada, Sector El Puentecito	Hda. El Corozal	270.00	\N	\N	\N	gerardoferrantel@gmail.com	584143630767	Leche y Carne	2	\N	\N	t	Dispasa / Corozal y San Luis	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
142	Ganaderia El Porvenir, C.A	GAPORCA	J-07054946-7	2025-01-01	Juridico	Carretera Aquí Me Quedo	Ganaderia El Porvenir	\N	\N	\N	\N	Jamoranp@gmail.com	584121212118	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
160	Inversiones El Cuadro, S.A	N/A	J-07024826-2	2025-01-01	Juridico	Calle Concepcion	Null	\N	\N	\N	\N	\N	584127869799	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
411	Jmf Chorro, C.A	N/A	J-40506475-7	2023-07-06	Juridico	Av Entre 19 Y 20 Cc Costa Azul Nivel Pb Local 2	Hda. El Chorro	\N	\N	\N	\N	\N	584143644200	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
413	Agropecuaria V Velarde, C. A.	N/A	J-50448988-3	2024-08-28	Juridico	Av Principal Casa Nro Hacienda La Ceiba	Hda. La Ceiba	219.00	\N	\N	\N	Velaverde1484@gmail.com	584125661622	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
262	Agropecuaria Bolivia, C.A	AGROBOLCA	J-07037173-0	2025-01-01	Juridico	Carretera Via El Caimito	Hda. Bolivia	300.00	\N	\N	\N	agropbolivia1@gmail.com	584246400590	Leche y Carne	3	\N	\N	t	Damca	\N	\N	\N	Rosario de Perijá	El Rosario / Sixto Zambrano	\N	0
69	Aguirre Muñoz Hernan José	N/A	V1612273	2025-01-01	Natural	Calle 18 De Octubre Urb El Valle	Hda. Las Aguas Y Las Taritas	\N	\N	\N	\N	\N	584125286815	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
396	Jonny Willian Vargas Gutierrez	N/A	V076939922	2025-01-01	Natural	Av Santa Teresa Casa Nro 05 Urb La Primera	Hda. El Terminal	237.00	\N	\N	\N	jonnywvarga@gmail.com	584127806951	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
1	Mendez Carrillo Edirmo J.	N/A	V-7936057	2025-01-01	Natural	Av 22 Con Ricauter	Hda. San Antonio	300.00	\N	\N	\N	edirmomendez@yahoo.com	584125465814	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
271	Fincas Romero Sandoval, C.A	FINCAROSA	J-30737446-2	2025-01-01	Juridico	Calle Derecha Diagonal Rumaldo	Hda. Finca Rosa	\N	\N	\N	\N	\N	584125478097	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
98	Chacin Quintero Eulises	N/A	V-7938565	2025-01-01	Natural	Calle Municipal Casa Lisivone	Hda, San Agustin	\N	\N	\N	\N	\N	584127905494	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
390	Ganaderia Cerro Alto, C.A	N/A	J-07016396-8	2025-01-01	Juridico	Ctra Machiques Colon	Hda. Corocito	313.90	\N	\N	\N	casinoroyal1964hotmail.com	584146318483	Leche y Carne	4	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Libertad / Bartolomé de las Casas	\N	0
393	Linolfo Alfredo Gutierrez Romero	N/A	V-07687049-3	2025-01-01	Natural	Av Adolfo Lopez	El Cienegon	\N	\N	\N	\N	\N	584146216661	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
137	Carlos Graziano Ferraro	N/A	V-106787960	2025-01-01	Natural	Calle Concepcio Casa 24 -10	Hda. El Vaticano	180.00	\N	\N	\N	carlosgraziano1950@gmail.com	584146687386	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
185	Inversiones La Culebra, C.A	N/A	J-07026818-2	2025-01-01	Juridico	Ctra La Culebra	Null	\N	\N	\N	\N	\N	584246076791	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Bartolomé de las Casas	\N	0
255	Inversiones Ganaderia El Encanto, C.A	INGANECA	J-30764378-1	2025-01-01	Juridico	Urb El Valle	\N	\N	\N	\N	\N	\N	584246553788	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
407	Agro-Corocito, S.A	N/A	J305815291	2022-06-10	Juridico	Calle 104 Casa S/N Sector Las Guaudas	Hda. Corocito	327.00	\N	\N	\N	Agrocorocito2020@gmail.com	584127715809	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	Barranquitas	\N	0
57	Agropecuaria Serfi Cuevas, C.A	N/A	J-3466679-8	2025-01-01	Juridico	Calle Derecha Mantenimiento Perija	Agrop. Serfi Cuevas C,A.	\N	\N	\N	\N	\N	584127875473	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Libertad	\N	0
378	Angel Arturo Parra Espina	N/A	V-14280650	2017-03-29	Natural	Urb La Trinidad	Hda. Puerto Leon	\N	\N	\N	\N	\N	584246370231	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
141	Ganaderia Hermanos Romero, S.A	GAHERSA	J-30400512-1	2025-01-01	Juridico	Calle Santa Teresa	Hda. Costa Rica	271.00	\N	\N	\N	Gahersa2015@gmail.com	584140709764	Leche y Carne	1	\N	\N	t	Damca	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
278	Sucesion Aref Saab Saab	NO PRESENTA	J-07008811-7	2025-01-01	Juridico	Urb Rodolfo Rincon	Hda. La Libanesa	330.00	\N	\N	\N	francosaab@hotmail.com	584246283671	Leche y Carne	3	1	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
124	Garcia Luis Roberto	N/A	V-3466824	2025-01-01	Natural	Calle Falcon	Hda. Los Leones	\N	\N	\N	\N	Luisrobertogarciav@hotmail.com	584121335522	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
385	Agropecuaria Los Caracolies, C.A	LOSCARCA	J-40467207-9	2025-01-01	Juridico	C/C Costa Azul Local #2	Agrop. Los Caracolies	\N	\N	\N	\N	\N	584149614592	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
228	Inversiones Finol, C.A.	INFICA	J-30452090-5	2025-01-01	Juridico	Calle Central Casa N°114	Hda. El Cañito	\N	\N	\N	\N	evaristofinol@gmail.com	584125144806	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
421	Agropecuaria Los Caños, C.A.	N/A	J-31436250-0	2025-06-16	Juridico	Av Falcon Casa Nro S/N Sector Casco Central	Los Caños  C,A.	245.00	\N	\N	\N	Hayelabotef03@gmail.com	584127864659	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
371	Ganaderia La Bonanza, C.A	GABOCA	J-30880363-4	2025-01-01	Juridico	Av Derecha Casa 14-06	Hda. Canaan	\N	\N	\N	\N	anaaguirrecompeca@hotmail.com	584246592080	Leche y Carne	\N	\N	\N	t	Damca	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
405	Ganadería Cruz Martínez, S.A	CRUZMART, S.A.	J-50051665-7	2025-01-01	Juridico	Avenida 18 De Octubre	Cruz Martinez S,A.	\N	\N	\N	\N	\N	584146379151	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
9	Agropecuaria Doña Blanca, C.A	N/A	J-07041202-6	2025-01-01	Juridico	Calle 85 N°04-104	Hda. Caracas	\N	\N	\N	\N	\N	584122954444	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
203	Martinez Jose Domingo	N/A	V-1614650	2025-01-01	Natural	Urb Rodolfo Rincon	Hda. Miraflores	\N	\N	\N	\N	\N	584246628808	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
309	Zuleta Romero Luvi José	N/A	V-03273779-6	2025-01-01	Natural	Villa Vieja Frente Al Negro Del Porvenir	Hda. La Reina	\N	\N	\N	\N	\N	584121290830	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
202	Martinez Jesus Samuel	N/A	V-7633668	2025-01-01	Natural	Calle 26 Av 21-22	Hda,. Caño Seco	200.00	\N	\N	\N	jsamuelmartinez1806@gmail.com	584146154179	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
221	Montero Arteaga Dioniro Jose	N/A	V-03465400-6	2025-01-01	Natural	Calle Central Casa 2106	Hda. Los Brincos	300.00	\N	\N	\N	Diomirojosemonterogalindo@gmai	12145798259	Leche y Carne	4	\N	\N	t	Damca	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
379	Agrosolution's, C.A	N/A	J-40149392-0	2025-01-01	Juridico	Ctra La Villa Machiques Sector San Juan	Hda. El tranquero	\N	\N	\N	\N	\N	584127877980	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Machiques de Perijá	Libertad / San José	\N	0
199	Inversiones Agropecuaria Maioriello Ugas,C.A	N/A	J-07029294-6	2025-01-01	Juridico	Calle 19 Frente Plaza Bolivar	Hda. El Milagro	150.00	\N	\N	\N	Pascualmaioriello@hotmail.com	584246040740	Leche y Carne	1	\N	\N	t	Trangas	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
402	Agroinversiones La Cuesta, C.A	N/A	J-405131683	2025-01-01	Juridico	Av 18 De Octubre Casa La M Artina	Hda. La Cuesta	\N	\N	\N	\N	\N	584143638339	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
423	Perez Urdaneta Ivan Jose	N/A	11.256.444	2025-01-01	Natural	Calle El Registro	Hda. El Porvenir	305.00	\N	\N	\N	ivanperezurdaneta444@gmail.com	14698700550	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
389	Camilo Alfredo Saab Zuleta	N/A	V-123442160	2025-01-01	Natural	Sector Trujillo 2	Hda. Campo Alegre	96.70	\N	\N	\N	camilosaab@gmail.com	584126439314	Leche y Carne	2	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
412	Angelica Maria Urdaneta Gomez	N/A	V-14.257.008	2025-01-01	Natural	Calle 70 Entre Av. 16B Y 17 Casa N° 16B 28, Sector Paraiso	Hda. San Miguel	360.00	\N	\N	\N	angelicaurdaneta@gmail.com	584146339073	Leche y Carne	0	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
404	Heberto Manuel Finol Romero	N/A	V-14682338	2025-01-01	Natural	Calle 18 De Octubre	Hda. Maria Bonita	629.00	\N	\N	\N	Hebertofinol15@gmail.com	584127899189	Leche y Carne	3	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
125	Inversiones Finol Gaviria, C. A.	N/A	J-07037780-1	2014-05-02	Juridico	Carretera La Quebrada	Hda. Montevideo	595.00	\N	\N	\N	geovannyfinolf@gmail.com	584246555911	Leche y Carne	4	1	\N	t	DISPASA	380	200	\N	Rosario de Perijá	El Rosario	\N	0
403	Agropecuaria Mi Ñiña,C.A	N/A	J-40638137-3	2025-01-01	Juridico	Calle 74 #3F -27 Maracaibo	Hda. Pozo Del Mono	900.00	\N	\N	\N	Collados_raul@hotmail.com	584246630120	Leche y Carne	4	\N	\N	t	Damca	\N	\N	\N	Maracaibo	Olegario Villalobos (Fuera de Perijá)	\N	0
422	Agropecuaria La Trinidad Mf, C.A.	N/A	J-50611643-0	2025-01-01	Juridico	Av Municipal Local Eureka Hipermercado Casco Central	\N	\N	\N	\N	\N	\N	584126423288	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	El Rosario	\N	0
408	Inversiones Tarota, C.A	N/A	J-40296288-6	2025-01-01	Juridico	Sector El Cruce, Parroquia Baru	Inv. Tarota, C,A.	\N	\N	\N	\N	\N	584141684110	Leche y Carne	\N	\N	\N	f	\N	\N	\N	\N	Rosario de Perijá	Donaldo García / Sixto Zambrano *	\N	0
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_06_15_203709_create_personal_access_tokens_table	2
5	2026_06_17_203349_create_tasas_table	2
6	2026_06_17_204246_add_descuento_to_vinculacion_pagos_table	3
7	2026_06_17_214644_add_monto_to_facturas_table	4
8	2026_06_17_214653_create_actualizar_saldo_miembro_trigger	4
9	2026_06_19_113903_add_presidente_to_vinculacion_table	5
10	2026_06_19_190409_add_carnets_disponibles_to_miembro_table	6
11	2026_06_19_190420_create_pagos_carnets_table	6
12	2026_06_19_190430_create_carnets_emitidos_table	6
13	2026_06_19_195223_create_configuracions_table	7
14	2026_06_19_203040_add_honorario_to_personas	8
15	2026_06_19_203059_make_id_miembro_nullable_in_carnets_emitidos	8
16	2026_06_23_195803_create_documento_miembros_table	9
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos (id, fecha, monto, monto_bs, tasa_cambio, metodo_pago, factura_ugavi, factura_fondo, referencia, estado) FROM stdin;
1	2026-03-06	25.00	15500.00	550.00	Zelle	109881	112212	brlmoijenaijemk	Vigente
2	2026-06-17	20.00	11900.00	596.78	Pago Movil/Transferencia	3	3	213332556	Vigente
3	2026-06-18	20.00	12000.00	602.33	Pago Movil/Transferencia	4	4	2232200	Vigente
4	2026-06-23	20.00	12046.40	602.32	Pago Movil/Transferencia	5	5	256456556856	Vigente
\.


--
-- Data for Name: pagos_carnets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos_carnets (id, id_miembro, fecha, monto, monto_bs, tasa_cambio, precio_unitario, metodo_pago, referencia, cantidad_carnets, estado, created_at, updated_at) FROM stdin;
2	102	2026-06-23	15.00	9034.95	602.3300	5.00	Transferencia / Pago Móvil	00012332355	3	Aprobado	2026-06-23 19:20:53	2026-06-23 19:21:13
3	119	2026-06-23	50.00	30116.50	602.3300	5.00	Transferencia / Pago Móvil	41587476841	10	Aprobado	2026-06-23 19:27:53	2026-06-23 19:28:01
\.


--
-- Data for Name: pagos_lote_carnets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos_lote_carnets (id, id_miembro, monto, monto_bs, moneda, fecha, metodo_pago, referencia, concepto, tipo_pago) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: personas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personas (id, nombre, ci_numero, fecha_nacimiento, correo, telefono, genero, ex_presidente, honorario) FROM stdin;
355	Karla Sofia Martinez Martinez	21.039.373	\N	\N	\N	\N	\N	f
356	Aildeana Isolina Rincon Polanco	14.375.383	\N	\N	\N	\N	\N	f
357	Rodrigo Andres Cipolat Rincon	30.315.456	\N	\N	\N	\N	\N	f
358	Maria Virginia Cipolat Paz	16.548.330	\N	\N	\N	\N	\N	f
359	Giovanny David Cipolat Amaya	19.972.469	\N	\N	\N	\N	\N	f
360	Katy Claret Perez Sanchez	11.660.268	\N	\N	\N	\N	\N	f
361	Juan Carlos Rodriguez Romero	7.937.820	\N	\N	\N	\N	\N	f
362	Carlos Augusto Fernandez Martinez	11.256.769	\N	\N	\N	\N	\N	f
363	Lucila Teresa Mancini De Fernandez	13.819.328	\N	\N	\N	\N	\N	f
364	Isabella Maria Fernandez Mancini	32.972.483	\N	\N	\N	\N	\N	f
365	Irmary Martinez Aguirre	18.408.315	\N	\N	\N	\N	\N	f
366	Maria Isabella Finol Graziano	19.225.579	\N	\N	\N	\N	\N	f
367	Roberto Carlos Finol Graziano	15.658.655	\N	\N	\N	\N	\N	f
368	Mariangel Paola Berrueta Boscan	16.549.385	\N	\N	\N	\N	\N	f
369	Carlos Alberto Finol Graziano	15.660.970	\N	\N	\N	\N	\N	f
370	Maria Graziano de Finol	7.688.018	\N	\N	\N	\N	\N	f
371	Alvaro Luis Finol Romero	4.989.426	\N	\N	\N	\N	\N	f
372	Milton Rene Cipolat Gutierrez	11.662.984	\N	\N	\N	\N	\N	f
374	Rita Carmen Romero de Rincon	3.466.768	\N	\N	\N	\N	\N	f
375	Lenis Cecilia Rincon Romero	11.662.932	\N	\N	\N	\N	\N	f
376	Ezequiel Segundo Garcia Aguirre	11.662.877	\N	\N	\N	\N	\N	f
377	Kamila Garcia Nastasi	33.374.267	\N	\N	\N	\N	\N	f
378	Nola Carmen Aguirre de Garcia	3.278.997	\N	\N	\N	\N	\N	f
379	Maria Rosario Garcia Aguirre	10.677.371	\N	\N	\N	\N	\N	f
380	Maria Isabel Nastasi Rios	14.005.638	\N	\N	\N	\N	\N	f
381	Andrea Garcia Nastasi	33.372.991	\N	\N	\N	\N	\N	f
382	Marcela Garcia Nastasi	34.129.664	\N	\N	\N	\N	\N	f
383	Alaine Virginia Castellano Sandoval	25.311.102	\N	\N	\N	\N	\N	f
384	Luis Alfonso Garcia Villasmil	18.704.096	\N	\N	\N	\N	\N	f
385	Dayerling Coromoto Garcia Villasmil	13.471.529	\N	\N	\N	\N	\N	f
386	Luis Daniel Viera Garcia	34.828.156	\N	\N	\N	\N	\N	f
387	Ana Gabriela Garcia Villasmil	15.391.894	\N	\N	\N	\N	\N	f
388	Maria De Jesus Paz Gonzalez	14.681.060	\N	\N	\N	\N	\N	f
389	Luis Ignacio Garcia Paz	33.607.543	\N	\N	\N	\N	\N	f
390	Hector Luis Garcia Villasmil	19.971.473	\N	\N	\N	\N	\N	f
391	Rafaela Bernarda Silva Gutierrez	7.687.204	\N	\N	\N	\N	\N	f
392	Carmelo Antonio Morales Wiles	4.989.316	\N	\N	\N	\N	\N	f
393	Claudia Sofia Rincon Gonzalez	18.703.117	\N	\N	\N	\N	\N	f
394	Maria Albertina Chacin de Gonzalez	7.935.223	\N	\N	\N	\N	\N	f
395	Reinaldo Antonio Gonzalez Martinez	7.690.506	\N	\N	\N	\N	\N	f
396	Aliria Violeta Gonzalez de Sierra	7.630.348	\N	\N	\N	\N	\N	f
401	Sonia Beatriz Chirinos de Rincon	9.008.062	\N	\N	\N	\N	\N	f
402	Douglas Gabriel Rincon Chirinos	19.225.588	\N	\N	\N	\N	\N	f
403	Dayana Paola Rincon Chirinos	17.916.942	\N	\N	\N	\N	\N	f
404	Douglas Enrique Rincon Gonzalez	4.988.363	\N	\N	\N	\N	\N	f
405	Luis Rodriguez Martinez	12.758.387	\N	\N	\N	\N	\N	f
406	Laura Berrueta Montero	11.255.115	\N	\N	\N	\N	\N	f
407	Jose Ignacio Rodriguez Berrueta	32.696.138	\N	\N	\N	\N	\N	f
408	Juliana Rodriguez Berrueta	32.696.140	\N	\N	\N	\N	\N	f
409	Carolina Romero Gaddi	14.945.187	\N	\N	\N	\N	\N	f
410	Inmacolata Gaddi Gonzalez	7.630.954	\N	\N	\N	\N	\N	f
411	Andrea Virginia Maioriello	19.972.673	\N	\N	\N	\N	\N	f
412	Karina Gregoria Maioriello Ugas	8.502.311	\N	\N	\N	\N	\N	f
413	Maritza Rosa Lira De Maioriello	7.934.975	\N	\N	\N	\N	\N	f
414	Pasqual Jose Maioriello Ugas	11.256.302	\N	\N	\N	\N	\N	f
415	Jesus Samuel Martinez Aguirre	7.633.668	\N	\N	\N	\N	\N	f
416	Yoennys Patricia Montero Baptista	18.305.093	\N	\N	\N	\N	\N	f
417	Jose Luis Martinez Rincon	17.479.441	\N	\N	\N	\N	\N	f
418	Andrea Paola Martinez Martinez	30.239.504	\N	\N	\N	\N	\N	f
419	Jose Samuel Martinez Montero	34.675.518	\N	\N	\N	\N	\N	f
420	Ida Herminia Rincon Gonzalez	7.686.594	\N	\N	\N	\N	\N	f
421	Johny Jose Martinez Aguirre	7.633.667	\N	\N	\N	\N	\N	f
422	Ligia Margarita Gutierrez Zuleta	7.932.264	\N	\N	\N	\N	\N	f
423	Roberto Carlo Romero Perozo	14.945.044	\N	\N	\N	\N	\N	f
424	Camila Sofia Romero Avila	31.653.059	\N	\N	\N	\N	\N	f
425	Dieglis Yandis Avila Torres	14.375.764	\N	\N	\N	\N	\N	f
426	Ariannys Valeria Romero Zambrano	32.890.567	\N	\N	\N	\N	\N	f
427	Ciro Segundo Mestre Gonzalez	3.467.675	\N	\N	\N	\N	\N	f
428	Jolibeth Cuevas de Mestre	17.479.712	\N	\N	\N	\N	\N	f
429	Mateo Elias Mestre Cuevas	33.872.572	\N	\N	\N	\N	\N	f
430	Susana Valentina Mestre Cuevas	36.343.416	\N	\N	\N	\N	\N	f
431	Domingo Jose Rincon Ocando	11.661.509	\N	\N	\N	\N	\N	f
432	Alexander David Rincon Gutierrez	25.449.147	\N	\N	\N	\N	\N	f
433	Fabiana Andrea Rincon Gutierrez	27.846.819	\N	\N	\N	\N	\N	f
434	Ana Genoveva Gutierrez De Rincon	11.660.392	\N	\N	\N	\N	\N	f
435	Zuleny del Carmen Rincon Chourio	16.109.588	\N	\N	\N	\N	\N	f
436	Victor Manuel Navarro Garcia	14.233.093	\N	\N	\N	\N	\N	f
437	Ana Sofia Navarro Rincon	29.722.970	\N	\N	\N	\N	\N	f
438	Victor Hugo Navarro Rincon	33.749.240	\N	\N	\N	\N	\N	f
439	Maria Teresa Marquez Acosta	18.305.391	\N	\N	\N	\N	\N	f
440	Carlos Alberto Martinez Marquez	35.045.137	\N	\N	\N	\N	\N	f
441	Luis Carlos Martinez Marquez	35.045.139	\N	\N	\N	\N	\N	f
442	Omar Andres Marquez Ferrer	36.622.124	\N	\N	\N	\N	\N	f
443	Amanda Maria Ferrer Ocando	16.968.783	\N	\N	\N	\N	\N	f
444	Carlos Alberto Martinez Faria	18.408.583	\N	\N	\N	\N	\N	f
445	Arevalo Omar Marquez Delgado	3.468.453	\N	\N	\N	\N	\N	f
446	Alis Teresa Acosta	4.592.182	\N	\N	\N	\N	\N	f
447	Jose Manuel Negreira Corona	7.937.883	\N	\N	\N	\N	\N	f
448	Angel Antonio Negreira Corona	7.937.884	\N	\N	\N	\N	\N	f
449	Maria Gabriela Pacheco Montero	14.945.528	\N	\N	\N	\N	\N	f
398	Maria Graciela Montero Moran	16.967.899	\N	\N	\N	Femenino	\N	f
400	Paula Sofia Maioriello Montero	34.087.757	\N	\N	\N	Femenino	\N	f
450	Manuel Negreira Trigo	E - 323.351	\N	\N	\N	\N	\N	f
451	Gustavo Adolfo Pacheco Montero	11.255.749	\N	\N	\N	\N	\N	f
452	Luis Eduardo Pacheco Montero	13.471.227	\N	\N	\N	\N	\N	f
453	Napoleon Adolfo Pacheco Corona	2.888.833	\N	\N	\N	\N	\N	f
454	Emanuel Jose Negreira Gutierrez	22.228.741	\N	\N	\N	\N	\N	f
455	Mayerlin Camacho de Triana	16.621.936	\N	\N	\N	\N	\N	f
456	Oneira Rodriguez De Triana	4.591.441	\N	\N	\N	\N	\N	f
457	Valesca Andrea Triana	29.722.737	\N	\N	\N	\N	\N	f
458	Genesis Valeria Triana Hernandez	25.984.272	\N	\N	\N	\N	\N	f
459	Nolasco Jose Triana Rodriguez	12.344.226	\N	\N	\N	\N	\N	f
460	Jose Carlos Triana Rodriguez	12.759.946	\N	\N	\N	\N	\N	f
461	Carmen Deisi Prisco	14.152.221	\N	\N	\N	\N	\N	f
462	Nolasco Jose Triana Oberto	31.172.888	\N	\N	\N	\N	\N	f
463	Georges Przytulski Marquez	31.844.916	\N	\N	\N	\N	\N	f
464	Georges Przytulski Suarez	10.678.762	\N	\N	\N	\N	\N	f
465	Satty Del Rosario Marquez Perez	13.100.579	\N	\N	\N	\N	\N	f
466	Bianca Lorena Martinez Finol	17.947.865	\N	\N	\N	\N	\N	f
467	Maria Luisa Przytulski Suarez	7.935.351	\N	\N	\N	\N	\N	f
468	Cesar Augusto Przytulski Suarez	16.969.147	\N	\N	\N	\N	\N	f
469	Geovana Przytulski Marquez	32.777.355	\N	\N	\N	\N	\N	f
470	Luciris Diaz de Rincon	10.201.989	\N	\N	\N	\N	\N	f
471	Maria Veronica Rincon Diaz	27.909.995	\N	\N	\N	\N	\N	f
472	Hector Adolfo Rincon Gutierrez	11.256.139	\N	\N	\N	\N	\N	f
473	Beatriz Magaly Gutierrez de Rincon	3.380.123	\N	\N	\N	\N	\N	f
474	Armilo Antonio Rincon Suarez	2.888.369	\N	\N	\N	\N	\N	f
475	Martha Elena Pirela Garcia	13.471.200	\N	\N	\N	\N	\N	f
476	Hector Velasco Garcia	16.365.330	\N	\N	\N	\N	\N	f
477	Bianca Sofia Velasco Pirela	36.176.137	\N	\N	\N	\N	\N	f
478	Mary Juana Gonzalez Carmona	7.691.740	\N	\N	\N	\N	\N	f
479	Mario Jose Gonzalez Carmona	10.421.260	\N	\N	\N	\N	\N	f
480	Yulis Margarita Diaz Garcia	19.681.622	\N	\N	\N	\N	\N	f
481	German Antonio Rubio Soto	5.024.928	\N	\N	\N	\N	\N	f
482	Giovanna Rodriguez	18.408.213	\N	\N	\N	\N	\N	f
483	Ruben Dario Romero Vera	13.101.051	\N	\N	\N	\N	\N	f
484	Pedro Luis Romero Rodriguez	34.675.771	\N	\N	\N	\N	\N	f
485	Maria Dolores Romero Tapia	7.633.340	\N	\N	\N	\N	\N	f
486	David Fuentes Montero	7.888.246	\N	\N	\N	\N	\N	f
487	Liliana Ramirez de Romero	10.411.802	\N	\N	\N	\N	\N	f
489	Zaida Carmen Romero Tapia	4.987.337	\N	\N	\N	\N	\N	f
490	Jorge Armando Romero Ramirez	19.342.758	\N	\N	\N	\N	\N	f
491	Edgar Silvestre Diaz Fernandez	3.467.854	\N	\N	\N	\N	\N	f
492	Edilida Carmen Romero Tapia	4.987.338	\N	\N	\N	\N	\N	f
493	Wilmer Alberto Quintero Fernandez	5.854.038	\N	\N	\N	\N	\N	f
494	Teolinda Alejandra Romero Iguaran	14.375.497	\N	\N	\N	\N	\N	f
495	Yenipher Jose Martinez Rincon	13.958.451	\N	\N	\N	\N	\N	f
496	Genesis Paola Rincon Martinez	33.036.199	\N	\N	\N	\N	\N	f
497	Isaias Miguel Rincon Martinez	34.129.603	\N	\N	\N	\N	\N	f
498	Lino Rafael Diaz Martinez	19.098.056	\N	\N	\N	\N	\N	f
499	Lino Andres Diaz Romero	30.550.676	\N	\N	\N	\N	\N	f
500	Johanna de Jesus Perez Granados	9.750.307	\N	\N	\N	\N	\N	f
501	Gustavo Adolfo Rincon Brito	12.344.110	\N	\N	\N	\N	\N	f
502	Claire Daiann Luzardo Romero	14.761.107	\N	\N	\N	\N	\N	f
503	Fernando Ramon Lossada Urribarri	4.538.432	\N	\N	\N	\N	\N	f
504	Maria Eugenia Finol de Lossada	4.153.180	\N	\N	\N	\N	\N	f
505	Fernando Manuel Lossada	15.766.618	\N	\N	\N	\N	\N	f
506	Silfredo Geraldo Sandoval Romero	7.818.984	\N	\N	\N	\N	\N	f
507	Luis Manuel Diaz Bravo	17.479.442	\N	\N	\N	\N	\N	f
508	Luis Enrique Diaz Sandoval	4.593.039	\N	\N	\N	\N	\N	f
509	Yulay Bravo de Diaz	4.988.532	\N	\N	\N	\N	\N	f
510	Marianne Diaz Bravo	13.102.525	\N	\N	\N	\N	\N	f
511	Mariela Diaz Bravo	16.548.499	\N	\N	\N	\N	\N	f
512	Luis Jose Perez Diaz	25.950.487	\N	\N	\N	\N	\N	f
513	Nigleny Coromoto Martinez de Suarez	7.934.816	\N	\N	\N	\N	\N	f
514	Jessica Carolina Vargas Baptista	30.633.798	\N	\N	\N	\N	\N	f
515	Edgar Guzman Vargas Gutierrez	4.990.756	\N	\N	\N	\N	\N	f
516	Argelis Rosa Baptista Martinez	7.939.089	\N	\N	\N	\N	\N	f
517	Dayana Garcia Duarte	12.344.558	\N	\N	\N	\N	\N	f
518	Jose Pablo Rincon Garcia	32.964.624	\N	\N	\N	\N	\N	f
519	Ricardo Jose Rincon Garcia	31.204.883	\N	\N	\N	\N	\N	f
520	Luvi Jose Zuleta Romero	3.273.779	\N	\N	\N	\N	\N	f
521	Librada Carmen Tapia Cabrera	4.591.893	\N	\N	\N	\N	\N	f
522	Liliana Carmen Zuleta Tapia	16.548.390	\N	\N	\N	\N	\N	f
523	Hector Jose Garcia Lira	14.945.091	\N	\N	\N	\N	\N	f
524	Maria Gabriela Cruz Martinez	17.480.218	\N	\N	\N	\N	\N	f
525	Jesus Enrique Cruz Martinez	27.192.413	\N	\N	\N	\N	\N	f
526	Leobardo Enrique Cruz Soto	4.991.054	\N	\N	\N	\N	\N	f
527	Leonardo Enrique Cruz Martinez	19.519.370	\N	\N	\N	\N	\N	f
528	Luis David Romero Morales	28.122.161	\N	\N	\N	\N	\N	f
529	Juan Pablo Romero Morales	30.571.349	\N	\N	\N	\N	\N	f
530	Adafel Enrique Berrueta Gutierrez	2.883.459	\N	\N	\N	\N	\N	f
531	Dunis Isabel Pacheco Chirinos	13.471.812	\N	\N	\N	\N	\N	f
532	Angel Augusto Berrueta Lira	31.035.676	\N	\N	\N	\N	\N	f
533	Gerardo Alejandro Ferrante Lira	30.174.430	\N	\N	\N	\N	\N	f
534	Javier Enrique Ferrante Lira	21.038.610	\N	\N	\N	\N	\N	f
535	Gerardo Javier Ferrante Landaeta	5.816.226	\N	\N	\N	\N	\N	f
536	Evelina Lira de Ferrante	7.938.556	\N	\N	\N	\N	\N	f
537	Gerardina Ferrante Lira	21.038.609	\N	\N	\N	\N	\N	f
538	Victor Gerardo Vergara Martinez	19.526.305	\N	\N	\N	\N	\N	f
539	Silvia Maria Aguirre Diaz	18.703.536	\N	\N	\N	\N	\N	f
540	Esperanza Diaz de Aguirre	7.691.362	\N	\N	\N	\N	\N	f
541	Arnedo Jesus Aguirre Batista	4.988.904	\N	\N	\N	\N	\N	f
542	Victor Simon Aguirre Diaz	23.268.117	\N	\N	\N	\N	\N	f
543	Jose Ignacio Martinez Gutierrez	31.502.308	\N	\N	\N	\N	\N	f
544	Maria Eugenia Gutierrez Marcano	7.935.363	\N	\N	\N	\N	\N	f
545	Larry Martinez Martinez	10.676.381	\N	\N	\N	\N	\N	f
546	Ana Aura Finol Chirinos	26.032.790	\N	\N	\N	\N	\N	f
547	Larry Andrez Martinez Gutierrez	23.740.223	\N	\N	\N	\N	\N	f
548	Merys Maire Galindo de Walo	4.591.536	\N	\N	\N	\N	\N	f
549	Mary Zuly Martinez Aguirre	16.109.966	\N	\N	\N	\N	\N	f
550	Leocadio Angel Walo Baez	3.800.008	\N	\N	\N	\N	\N	f
551	Miguel Angel Walo Galindo	18.704.545	\N	\N	\N	\N	\N	f
552	Marco Antonio Walo Galindo	12.758.445	\N	\N	\N	\N	\N	f
553	Ana Victoria Piña Aguirre	23.268.115	\N	\N	\N	\N	\N	f
554	Ana Sofia Piña Aguirre	28.491.427	\N	\N	\N	\N	\N	f
555	Ana Toribia Aguirre Nava	4.990.639	\N	\N	\N	\N	\N	f
556	Lucia Criscuolo Sandoval	36.426.718	\N	\N	\N	\N	\N	f
557	Marcela Criscuolo Sandoval	31.845.262	\N	\N	\N	\N	\N	f
558	Adriana Isabel Sandoval Romero	16.968.172	\N	\N	\N	\N	\N	f
559	Antonella Criscuolo Sandoval	34.455.592	\N	\N	\N	\N	\N	f
560	Orlando Rafael Rincon Vasquez	17.564.947	\N	\N	\N	\N	\N	f
561	Laura Valeria Rodriguez Cabrera	21.509.589	\N	\N	\N	\N	\N	f
562	Ana Cecilia Zuleta Romero	7.930.587	\N	\N	\N	\N	\N	f
563	Maria Cinta Marti de Finol	5.852.038	\N	\N	\N	\N	\N	f
564	Jose Carlos Finol Marti	19.392.988	\N	\N	\N	\N	\N	f
565	Carlos Alberto Finol Martinez	7.630.680	\N	\N	\N	\N	\N	f
566	Mario Alfredo Saab Zuleta	12.758.239	\N	\N	\N	\N	\N	f
567	Mary Lilian Rincon Barroso	15.391.642	\N	\N	\N	\N	\N	f
568	Aref Alfonso Saab Rincon	32.384.721	\N	\N	\N	\N	\N	f
569	Anna Lilian Saab Rincon	33.500.108	\N	\N	\N	\N	\N	f
570	Camilo Alfredo Saab Zuleta	12.344.216	\N	\N	\N	\N	\N	f
571	Kamal Alfredo Saab Moran	30.770.240	\N	\N	\N	\N	\N	f
572	David Ricardo Villalobos Navarro	31.960.227	\N	\N	\N	\N	\N	f
573	Yanetzi Naibeth Navarro Alonso	14.374.168	\N	\N	\N	\N	\N	f
574	Ana Rosario Vargas Gutierrez	10.676.089	\N	\N	\N	\N	\N	f
575	Juan Diego Gutierrez Vargas	29.975.271	\N	\N	\N	\N	\N	f
576	Liana Sofia Gutierrez Vargas	26.126.429	\N	\N	\N	\N	\N	f
577	Rita Elena Rodriguez de Vargas	7.687.448	\N	\N	\N	\N	\N	f
578	Juan Manuel Vargas Gutierrez	4.990.755	\N	\N	\N	\N	\N	f
579	Jonny Willian Vargas Gutierrez	7.693.992	\N	\N	\N	\N	\N	f
580	Lisbeth Torrealba de Vargas	8.809.767	\N	\N	\N	\N	\N	f
581	Jose David Vargas Torrealba	26.126.428	\N	\N	\N	\N	\N	f
582	Enerdo Antonio Ferrer Ortega	4.592.272	\N	\N	\N	\N	\N	f
583	Enerdo Jose Ferrer Morales	21.037.551	\N	\N	\N	\N	\N	f
584	Maria de los Angeles Ferrer caldera	21.510.437	\N	\N	\N	\N	\N	f
585	Maribel morales de Ferrer	7.691.557	\N	\N	\N	\N	\N	f
586	Leidis Veronica Ferrer Morales	16.967.906	\N	\N	\N	\N	\N	f
587	Carmen Teresa Finol Robles	3.467.727	\N	\N	\N	\N	\N	f
588	Ali Ramon Fernandez Nava	3.467.093	\N	\N	\N	\N	\N	f
589	Valentina Fernandez Pasqualatto	35.044.824	\N	\N	\N	\N	\N	f
590	Paulina Pierina Fernandez Pasqualatto	33.190.965	\N	\N	\N	\N	\N	f
591	Paola Pierina Pasqualatto Lopez	16.108.448	\N	\N	\N	\N	\N	f
592	Luis Hernan Fernandez Finol	13.101.372	\N	\N	\N	\N	\N	f
593	Kristin Mabel Ferrer De Fernandez	16.109.244	\N	\N	\N	\N	\N	f
594	Jose Joaquin Fernandez Ferrer	36.129.337	\N	\N	\N	\N	\N	f
595	Kamila Fernandez Ferrer	31.349.078	\N	\N	\N	\N	\N	f
596	Laura Cristina Gonzalez Moran	14.682.797	\N	\N	\N	\N	\N	f
597	Francesca Criscuolo Finol	32.699.027	\N	\N	\N	\N	\N	f
598	Francisco Javier Finol Lopez	13.471.436	\N	\N	\N	\N	\N	f
599	Benjamin Jose Criscuolo Martinez	11.661.870	\N	\N	\N	\N	\N	f
600	Luis Manuel Finol Lopez	11.256.379	\N	\N	\N	\N	\N	f
601	Ana Iris Lopez de Finol	4.593.500	\N	\N	\N	\N	\N	f
602	Antonio Manuel Criscuolo Finol	23.740.337	\N	\N	\N	\N	\N	f
603	Francisco Manuel Finol Gonzalez	33.873.324	\N	\N	\N	\N	\N	f
604	Marta Laura Finol Lopez	12.757.039	\N	\N	\N	\N	\N	f
605	Diana Carolina Belloso Montiel	19.202.677	\N	\N	\N	\N	\N	f
606	Rafael María Collados Jaime	4.529.783	\N	\N	\N	\N	\N	f
607	Tomas Ernesto Collados Luzardo	18.396.352	\N	\N	\N	\N	\N	f
608	Sophia Valentina Urrutia Barrios	21.165.513	\N	\N	\N	\N	\N	f
609	Raul Eduardo Collados Luzardo	17.460.667	\N	\N	\N	\N	\N	f
610	Rosa Virginia Luzardo Aguirre	4.989.632	\N	\N	\N	\N	\N	f
611	Sara Elena Finol Pasqualatto	37.375.381	\N	\N	\N	\N	\N	f
612	Heberto Manuel Finol Romero	14.682.338	\N	\N	\N	\N	\N	f
613	Jhovanna Pierina Pasqualatto Lopez	16.109.669	\N	\N	\N	\N	\N	f
614	Pedro Manuel Finol Pasqualatto	34.612.217	\N	\N	\N	\N	\N	f
615	Rebeca Pierina Finol Pasqualatto	33.637.966	\N	\N	\N	\N	\N	f
616	Luis Sebastian Cruz Martinez	33.786.975	\N	\N	\N	\N	\N	f
617	Andrea Maria Cruz Martinez	33.118.418	\N	\N	\N	\N	\N	f
618	Janine Del Rosario Martinez Lubo	11.255.993	\N	\N	\N	\N	\N	f
619	Luis David Cruz Martinez	23.759.065	\N	\N	\N	\N	\N	f
620	Jose Grabiel Cruz Soto	7.934.604	\N	\N	\N	\N	\N	f
625	Renny Raul Nava Araujo	13.593.369	\N	\N	\N	\N	\N	f
626	Dulce Maria Contreras Acosta	25.819.799	\N	\N	\N	\N	\N	f
627	Jose Manuel Finol Martinez	7.633.796	\N	\N	\N	\N	\N	f
628	Maria Betilde Romero de Finol	4.990.054	\N	\N	\N	\N	\N	f
629	Angelica Maria Urdaneta Gomez	14.257.008	\N	\N	\N	\N	\N	f
630	Yoniser Ramon Urdaneta Fuenmayor	12.713.179	\N	\N	\N	\N	\N	f
631	Victor Alfonso Velarde Castro	16.550.522	\N	\N	\N	\N	\N	f
632	Maria Victoria Velarde Rincon	34.042.222	\N	\N	\N	\N	\N	f
633	Maglenys Margarita Gutierrez Paradas	16.109.280	\N	\N	\N	\N	\N	f
634	Victor Raul Velarde Nava	7.687.072	\N	\N	\N	\N	\N	f
635	Elke Rocio Corona Nava	7.930.538	\N	\N	\N	\N	\N	f
636	Diovid Yovany Martinez Baptista	7.687.101	\N	\N	\N	\N	\N	f
637	David Ricardo Martinez Mandique	17.479.089	\N	\N	\N	\N	\N	f
638	David Jose Martinez Corona	17.480.994	\N	\N	\N	\N	\N	f
623	Ana Kamila Corona Gutierrez	33.323.166	\N	\N	\N	Femenino	\N	f
624	Oscar Daniel Corona Gutierrez	30.567.001	\N	\N	\N	Masculino	\N	f
622	Ana Karelis Gutierrez Villalobos	12.757.672	\N	\N	\N	Femenino	\N	f
639	Juan Diego Paz	21.038.588	\N	\N	\N	\N	\N	f
640	Nelson David Martinez Palmar	26.241.761	\N	\N	\N	\N	\N	f
641	Irma Sofia Martinez Palmar	31.642.373	\N	\N	\N	\N	\N	f
642	Pierangelis Maria Sanchez Castillo	23.470.637	\N	\N	\N	\N	\N	f
643	Alessandro Ferrante Boniforti	12.873.025	\N	\N	\N	\N	\N	f
644	Salvatore Ferrante Chacon	26.575.744	\N	\N	\N	\N	\N	f
645	Silvana Ferrante Chacon	34.266.586	\N	\N	\N	\N	\N	f
646	Natalia Elena Ferrante Boniforti	18.409.654	\N	\N	\N	\N	\N	f
647	Salvador Enrique Ferrante Landaeta	4.155.592	\N	\N	\N	\N	\N	f
648	Mariangel Ferrante Pirela	21.039.201	\N	\N	\N	\N	\N	f
649	Juan Salvador Ferrante Pirela	27.717.847	\N	\N	\N	\N	\N	f
650	Sebastian Ferrante Chacon	30.089.209	\N	\N	\N	\N	\N	f
651	Niove Coromoto Pirela De Ferrante	7.692.027	\N	\N	\N	\N	\N	f
652	Maria Del Rosario Chacon Atencio	13.471.731	\N	\N	\N	\N	\N	f
653	Mario Enrique Romero Martinez	13.819.732	\N	\N	\N	\N	\N	f
654	Daviana Claret Garcia Araujo	13.819.862	\N	\N	\N	\N	\N	f
655	Guadalupe Romero Martinez	7.634.323	\N	\N	\N	\N	\N	f
656	Jose Martin Romero Garcia	36.688.741	\N	\N	\N	\N	\N	f
657	Marcos Romel Romero Martinez	13.819.728	\N	\N	\N	\N	\N	f
658	Maria Arminda Carmona Montero	12.758.562	\N	\N	\N	\N	\N	f
659	Romer Augusto Romero Garcia	27.846.610	\N	\N	\N	\N	\N	f
660	Marcos Daniel Romero Carmona	33.033.215	\N	\N	\N	\N	\N	f
661	Luis Mario Romero Echeto	34.097.982	\N	\N	\N	\N	\N	f
662	Martina de los Angeles Romero Garcia	36.688.739	\N	\N	\N	\N	\N	f
663	Mariana Sofia Romero Echeto	33.031.067	\N	\N	\N	\N	\N	f
664	Aracelis Chiquinquira Echeto Morales	14.946.615	\N	\N	\N	\N	\N	f
665	Paula Andrea Romero Jimenez	27.491.694	\N	\N	\N	\N	\N	f
666	Angelica Maria Romero Robles	32.699.045	\N	\N	\N	\N	\N	f
667	Antonio Jose Romero Robles	25.311.938	\N	\N	\N	\N	\N	f
668	Adafel De Jesus Romero Garcia	10.677.729	\N	\N	\N	\N	\N	f
669	Rebeca Robles Romero	7.935.444	\N	\N	\N	\N	\N	f
670	Jesus Andres Romero Robles	31.349.080	\N	\N	\N	\N	\N	f
671	Maria Laura Carmona	14.681.400	\N	\N	\N	\N	\N	f
672	Dainner Cuevas	13.592.822	\N	\N	\N	\N	\N	f
673	Selfi Jose Cuevas	13.592.820	\N	\N	\N	\N	\N	f
674	Jose Miguel cuevas	18.409.961	\N	\N	\N	\N	\N	f
675	Tobeanny Vivas	18.408.787	\N	\N	\N	\N	\N	f
676	Charyl Suarez	12.344.359	\N	\N	\N	\N	\N	f
677	Yraida Pineda	3.468.342	\N	\N	\N	\N	\N	f
678	Mariangel Cuevas Villalobos	33.033.262	\N	\N	\N	\N	\N	f
679	Maxyuly Villalobos	14.945.948	\N	\N	\N	\N	\N	f
680	Hector Jose Cuevas Mendez	19.681.176	\N	\N	\N	\N	\N	f
681	Pablo Cuevas	30.548.479	\N	\N	\N	\N	\N	f
682	Thomas Cuevas	28.420.346	\N	\N	\N	\N	\N	f
683	Valeria Sofia Chacin Gutierrez	33.318.714	\N	\N	\N	\N	\N	f
684	Aura Ligia Gutierrez de Chacin	10.100.027	\N	\N	\N	\N	\N	f
685	Amanda Sofia Reyes Escorcia	33.372.759	\N	\N	\N	\N	\N	f
686	Victoria Sofia Reyes Romero	32.509.065	\N	\N	\N	\N	\N	f
687	Eudo Ramon Reyes Romero	33.608.477	\N	\N	\N	\N	\N	f
688	Ricauter Ramon Reyes Aguirre	9.844.040	\N	\N	\N	\N	\N	f
689	Irania Gerley Rivera Bracho	23.475.582	\N	\N	\N	\N	\N	f
690	Rony Jose Reyes Chourio	25.819.462	\N	\N	\N	\N	\N	f
691	Leonardo Enrique Castillo Chavez	10.426.230	\N	\N	\N	\N	\N	f
692	Hernan Segundo Aguirre Sandoval	7.692.836	\N	\N	\N	\N	\N	f
693	Ana Isabel Ferreira Cuadrado	13.958.425	\N	\N	\N	\N	\N	f
694	Hernando Antonio Aguirre Sandoval	11.255.151	\N	\N	\N	\N	\N	f
695	Jose Ignacio Aguirre Lozano	32.391.940	\N	\N	\N	\N	\N	f
696	Meris Maria Aguirre Sandoval	7.692.837	\N	\N	\N	\N	\N	f
697	Maria Victoria Aguirre Lozano	28.455.845	\N	\N	\N	\N	\N	f
698	Valeria Sierra Gonzalez	18.409.636	\N	\N	\N	\N	\N	f
699	Mariandreina Sandoval Corona	16.968.171	\N	\N	\N	\N	\N	f
701	Darwin Andres Berrueta Martinez	13.100.049	\N	\N	\N	\N	\N	f
702	Jose Antonio Berrueta Martinez	6.784.918	\N	\N	\N	\N	\N	f
703	Luzmar Karina Berrueta  Martinez	11.661.192	\N	\N	\N	\N	\N	f
704	Andrea Paola Berrueta Pacheco	19.971.880	\N	\N	\N	\N	\N	f
705	Maria Andreina Martinez Berrueta	31.614.199	\N	\N	\N	\N	\N	f
706	Humberto Rodolfo Carmona Padron	7.689.102	\N	\N	\N	\N	\N	f
707	Carmen Mendez De Berrueta	14.681.022	\N	\N	\N	\N	\N	f
708	Angelica Berrueta Mendez	31.960.364	\N	\N	\N	\N	\N	f
709	Duglemis Cristal Hernandez Ovalles	27.457.028	\N	\N	\N	\N	\N	f
710	Mauricio Andres Lopez Baptista	25.449.162	\N	\N	\N	\N	\N	f
711	Miguel Ernesto Chacin Martinez	10.436.133	\N	\N	\N	\N	\N	f
712	Ladi Josefina Zambrano de Chacin	7.631.766	\N	\N	\N	\N	\N	f
713	Eulises Enrique Chacin Quintero	2.880.792	\N	\N	\N	\N	\N	f
714	Ivonne del Rosario Chacin de Romano	7.694.050	\N	\N	\N	\N	\N	f
715	Angel Napoleon Chacin Zambrano	7.938.566	\N	\N	\N	\N	\N	f
716	Ana Virginia Montero de Chacin	11.256.460	\N	\N	\N	\N	\N	f
717	Leonela Carolina Chacin Quintero	25.449.144	\N	\N	\N	\N	\N	f
718	Julio Cesar Chacin Quintero	26.375.064	\N	\N	\N	\N	\N	f
719	Sumaya Carolina Quintero de Chacin	10.675.331	\N	\N	\N	\N	\N	f
720	Lucy Coromoto Duarte Ojeda	15.390.448	\N	\N	\N	\N	\N	f
721	Angelica Sofia Chacin Rincon	33.787.629	\N	\N	\N	\N	\N	f
722	Wilson Jesus Chacin Montero	17.528.868	\N	\N	\N	\N	\N	f
723	Angelina Sofia Chacin Rincon	31.727.299	\N	\N	\N	\N	\N	f
724	Jesus Heberto Marquez Chacin	30.239.534	\N	\N	\N	\N	\N	f
725	Heberto Luis Marquez Chacin	30.239.533	\N	\N	\N	\N	\N	f
726	Nairobis Grizel Chacin Montero	13.100.577	\N	\N	\N	\N	\N	f
727	Laura Virginia Rincon Romero	17.949.536	\N	\N	\N	\N	\N	f
728	Wilson de Jesus Chacin Quintero	3.465.635	\N	\N	\N	\N	\N	f
729	Julia Elena de Chacin	3.468.763	\N	\N	\N	\N	\N	f
730	Anyela Sofia Chacin Rincon	33.787.630	\N	\N	\N	\N	\N	f
731	Franco Alfredo Saab Zuleta	14.682.974	\N	\N	\N	\N	\N	f
732	Juan Camilo Saab Gutierrez	34.245.473	\N	\N	\N	\N	\N	f
733	Camal Saab Zuhaire	7.930.988	\N	\N	\N	\N	\N	f
734	Neida Josefina Zuleta de Saab	3.467.154	\N	\N	\N	\N	\N	f
735	Victor Manuel Velarde Gutierrez	34.042.249	\N	\N	\N	\N	\N	f
736	Diego Andres Saab Navarro	37.077.401	\N	\N	\N	\N	\N	f
738	Francisco Javier Pirela Garcia	16.549.029	\N	\N	\N	\N	\N	f
739	Luis Ernesto Rincon Romero	15.661.872	\N	\N	\N	\N	\N	f
740	Paola Raquel Przytulski Suarez	16.081.219	\N	\N	\N	\N	\N	f
741	Cesar Andres Przytulski Martinez	34.246.057	\N	\N	\N	\N	\N	f
742	Luis Arturo Rincon Fleires	34.042.940	\N	\N	\N	\N	\N	f
743	Yamely Coromoto Martinez de Cruz	7.693.734	\N	\N	\N	\N	\N	f
744	Daniela Paola Carmona Rincon	26.805.962	\N	\N	\N	\N	\N	f
745	Paulina Manuela Rodriguez Perez	29.568.705	\N	\N	\N	\N	\N	f
746	Iria del Rosario Romero Garcia	11.255.586	\N	\N	\N	\N	\N	f
747	Jose Andres Berrueta Pacheco	30.028.111	\N	\N	\N	\N	\N	f
748	Andrea Victoria Romero Sandoval	36.477.802	\N	\N	\N	\N	\N	f
749	Maria Jose Romero Sandoval	34.828.668	\N	\N	\N	\N	\N	f
750	Cosme Manuel Sandoval Fernandez	14.682.152	\N	\N	\N	\N	\N	f
751	Luis Adolfo Sandoval Romero	5.162.960	\N	\N	\N	\N	\N	f
752	Alejandro Enrique Sandoval Fernandez	14.682.151	\N	\N	\N	\N	\N	f
753	Mariangel Daniela Romero Carmona	36.688.815	\N	\N	\N	\N	\N	f
754	Jose Angel Mestre Urdaneta	11.259.933	\N	\N	\N	\N	\N	f
755	Maria Angela Mestre Villalobos	30.139.550	\N	\N	\N	\N	\N	f
756	Jesus David Vargas Torrealba	34.042.343	\N	\N	\N	\N	\N	f
757	Maria Teresa Rincon Zuleta	7.639.113	\N	\N	\N	\N	\N	f
758	Martin Manuel Martinez Morales	7.692.998	\N	\N	\N	\N	\N	f
759	Pablo Martin Martinez Rincon	28.319.788	\N	\N	\N	\N	\N	f
760	Jesus Alberto Rincon Zuleta	7.639.114	\N	\N	\N	\N	\N	f
761	Maria Cleotilde Arteaga	7.692.018	\N	\N	\N	\N	\N	f
762	Maria Eugenia González Carmona	7.933.094	\N	\N	\N	\N	\N	f
763	Juliza Elena Chacin Montero	11.662.211	\N	\N	\N	\N	\N	f
764	Santiago David Martinez Sandoval	34.130.051	\N	\N	\N	\N	\N	f
765	Yubisay Sandoval de Martinez	12.759.737	\N	\N	\N	\N	\N	f
766	Oslardo Enrique Martinez Martinez	11.661.198	\N	\N	\N	\N	\N	f
767	Isabela Sofia Martinez Ruidiaz	34.130.060	\N	\N	\N	\N	\N	f
768	Nelson Omar Rosales Rangel	9.237.633	\N	\N	\N	\N	\N	f
769	Rosmary Del Carmen Rincon Soto	28.520.884	\N	\N	\N	\N	\N	f
770	Alejandro José Zuleta Mestre	25.311.968	\N	\N	\N	\N	\N	f
771	Pierina Paola Zuleta Mestre	19.971.346	\N	\N	\N	\N	\N	f
772	Neila Cecilia Mestre Urdaneta	7.688.420	\N	\N	\N	\N	\N	f
773	Nelly Josefina Mestre de Salamanca	7.634.217	\N	\N	\N	\N	\N	f
774	Héctor Segundo Salamanca Finol	7.632.163	\N	\N	\N	\N	\N	f
775	Carlos Albonio Rincon Gonzalez	7.686.595	\N	\N	\N	\N	\N	f
776	Maria Marcela De Rincon	7.690.238	\N	\N	\N	\N	\N	f
777	Corina Maria Rincon	26.426.165	\N	\N	\N	\N	\N	f
778	Carla Maria Rincon	18.703.228	\N	\N	\N	\N	\N	f
779	Lariana Barbara Martinez Martinez	28.122.162	\N	\N	\N	\N	\N	f
780	Karelis Chiquinquira Morales Cuevas	13.100.091	\N	\N	\N	\N	\N	f
781	Juan Carlos Romero Mendez	11.661.737	\N	\N	\N	\N	\N	f
782	Dalmiro Ramon Garcia Duarte	7.938.795	\N	\N	\N	\N	\N	f
783	Pedro Jose Cipolat Martinez	4.707.490	\N	\N	\N	\N	\N	f
784	Mario Jose Fernandez Finol	18.305.077	\N	\N	\N	\N	\N	f
785	Sandy Claret Mercado Garcia	18.704.215	\N	\N	\N	\N	\N	f
786	Hugo Jose Suarez Carmona	3.468.565	\N	\N	\N	\N	\N	f
787	Fasse Yulieth Borhoquez	23.264.935	\N	\N	\N	\N	\N	f
2	Adafel Enrique Berrueta Gutierrez	11.660.205	\N	\N	\N	\N	t	f
3	Jose Francisco Fernandez Finol	14.682.249	\N	\N	\N	\N	f	f
4	Gerardo Antonio Rincon Gutierrez	11.660.167	\N	\N	\N	\N	f	f
6	Martin Jose Romero Martinez	11.660.651	\N	\N	\N	\N	f	f
7	Eduardo Jose Chacin Martinez	7.639.440	1964-05-24	\N	\N	\N	t	f
8	Gomel Jose Sierra Arteaga	4.991.557	1961-02-26	\N	\N	\N	t	f
9	Luis Roberto Garcia Villasmil	14.374.541	\N	\N	\N	\N	f	f
10	Jose Abel Romero Garcia	14.681.831	\N	\N	\N	\N	f	f
13	Mario Alberto Lossada Finol	17.070.542	\N	\N	\N	\N	f	f
14	Francisco Criscuolo Martinez	12.344.351	\N	\N	\N	\N	f	f
15	Linolfo Alfredo Gutierrez Romero	7.687.049	\N	\N	\N	\N	f	f
16	Homero Cesar Chacin Zambrano	7.938.565	\N	\N	\N	\N	t	f
17	Nerio Luis Corona Lopez	7.939.227	1970-07-14	\N	\N	\N	f	f
18	Yean Carlos Morales Silva	15.659.167	1981-05-10	\N	12144071113	\N	f	f
19	Clelia Alba Soto	4.987.607	\N	\N		\N	f	f
488	Luis Anibal Romero Tapia	7.633.337	\N	\N	\N	\N	f	f
22	Carlos Graziano Ferraro	10.678.796	\N	\N	\N	\N	f	f
23	Janette Eugenia Garcia De Soto	15.854.593	\N	\N	\N	\N	f	f
24	Evaristo Esteban Finol Carmona	19.439.218	\N	\N	\N	\N	f	f
25	Jose Antonio Moran	5.854.883	\N	\N	\N	\N	f	f
26	Astolfo Angel Berrueta Ortega	3.465.410	\N	\N	\N	\N	f	f
27	Geovany Dario Finol Paez	14.862.654	\N	\N	\N	\N	f	f
28	Jorge Luis Montiel Atencio	4.157.522	\N	\N	\N	\N	f	f
29	Marcos Vinicio Graziano Finol	7.938.646	\N	\N	\N	\N	f	f
30	Diomiro Jose Montero Galindo	7.694.525	\N	\N	\N	\N	f	f
31	Isabel Cristina Romero Sandoval	4.990.082	\N	\N	\N	\N	f	f
32	Hayel Jesus Maria Aboltef Ledezma	21.039.065	\N	\N	\N	\N	f	f
34	Hugo Valentin Sandoval Barboza	9.709.022	\N	\N	\N	\N	f	f
35	Juan Evangelista Paz Arteaga	7.694.879	\N	\N	\N	\N	f	f
36	Angel Arturo Parra Espina	14.280.650	\N	\N	\N	\N	f	f
37	Edecio Segundo Montero Martinez	3.465.133	\N	\N	\N	\N	f	f
38	Jose Domingo Martinez Bermudez	1.614.650	\N	\N	\N	\N	f	f
39	Mario Enrique Romero Sandoval	7.938.516	\N	\N	\N	\N	f	f
40	Humberto Enrique Finol Martinez	4.152.924	\N	\N	\N	\N	f	f
41	Edirmo José Mendez Carrillo	7.936.057	\N	\N	\N	\N	f	f
12	Pedro Jose Maioriello Vallejo	13.592.621	\N	pmaioriello@gmail.com	584126835295	Masculino	f	f
399	Pedro Manuel Maioriello Montero	37.482.077	\N	\N	\N	Masculino	\N	f
33	Abdon Enrique Gonzalez Moran	3.466.200	\N	\N	\N	Masculino	f	f
42	Nixio Balmiro Morales Baptista	7.939.088	\N	\N	\N	\N	f	f
43	Maximino Adolfo Lopez	7.691.258	\N	\N	\N	\N	f	f
44	Ivan Jose Perez Urdaneta	11.256.444	\N	\N	\N	\N	f	f
45	Eleazar Ricardo Soto Belloso	3.113.211	\N	\N	\N	\N	f	f
46	Luis Guillermo Amaya Rincón	7.689.716	1964-08-31	\N	584246067046	\N	f	f
47	Luis Rodolfo Machado Silva	3.507.402	\N	\N	584248342900	\N	f	f
700	Iria Carmen Sandoval Luzardo	4.591.295	\N	\N	\N	Femenino	\N	f
1	Victor Raul Sandoval Luzardo	7.631.816	1961-07-12	vrsl@yahoo.com	\N	Masculino	f	f
621	Oscar Jesus Corona Moran	13.102.646	\N	\N	\N	Masculino	\N	f
397	Pierina Isabel Maioriello Montero	32.983.633	\N	\N	\N	Femenino	\N	f
\.


--
-- Data for Name: proveedor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedor (id, razon_social, rif, direccion) FROM stdin;
\.


--
-- Data for Name: relaciones_familiares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relaciones_familiares (id, id_persona_titular, id_persona_familiar, parentesco) FROM stdin;
1	474	470	Otro
2	474	471	Otro
3	474	472	Otro
4	474	473	Otro
5	728	721	Otro
6	728	722	Otro
7	728	723	Otro
8	728	724	Otro
9	728	725	Otro
10	728	726	Otro
11	728	727	Otro
12	728	729	Otro
13	728	730	Otro
14	728	763	Otro
15	783	355	Otro
16	783	356	Otro
17	783	357	Otro
18	783	358	Otro
19	783	359	Otro
20	371	365	Otro
21	371	366	Otro
22	371	367	Otro
23	371	368	Otro
24	371	369	Otro
25	371	370	Otro
26	464	463	Otro
27	464	465	Otro
28	464	466	Otro
29	464	467	Otro
30	464	468	Otro
31	464	469	Otro
32	464	740	Otro
33	464	741	Otro
34	2	530	Otro
35	2	531	Otro
36	2	532	Otro
37	483	482	Otro
38	483	484	Otro
39	423	424	Otro
40	423	425	Otro
41	423	426	Otro
42	423	782	Otro
43	738	475	Otro
44	738	476	Otro
45	738	477	Otro
46	12	399	Otro
48	12	398	Otro
49	12	400	Otro
50	773	770	Otro
51	773	771	Otro
52	773	772	Otro
53	773	774	Otro
54	395	394	Otro
55	361	360	Otro
56	361	745	Otro
57	688	685	Otro
58	688	689	Otro
59	688	690	Otro
60	376	377	Otro
61	376	378	Otro
62	376	379	Otro
63	376	380	Otro
64	376	381	Otro
65	376	382	Otro
66	375	372	Otro
67	375	374	Otro
68	375	739	Otro
69	375	742	Otro
70	459	455	Otro
71	459	456	Otro
72	459	457	Otro
73	459	458	Otro
74	459	460	Otro
75	459	461	Otro
76	459	462	Otro
77	566	567	Otro
78	566	568	Otro
79	566	569	Otro
80	701	702	Otro
81	701	703	Otro
82	701	704	Otro
83	701	705	Otro
84	701	706	Otro
85	701	707	Otro
86	701	708	Otro
87	701	747	Otro
88	3	587	Otro
89	3	588	Otro
90	3	589	Otro
91	3	590	Otro
92	3	591	Otro
93	3	592	Otro
94	3	593	Otro
95	3	594	Otro
96	3	595	Otro
97	432	431	Otro
98	432	433	Otro
99	432	434	Otro
100	640	635	Otro
101	640	636	Otro
102	640	637	Otro
103	640	638	Otro
104	640	639	Otro
105	640	641	Otro
106	640	642	Otro
107	668	665	Otro
108	668	666	Otro
109	668	667	Otro
110	668	669	Otro
111	668	670	Otro
112	453	447	Otro
113	453	448	Otro
114	453	449	Otro
115	453	450	Otro
116	453	451	Otro
117	453	452	Otro
118	453	454	Otro
119	427	428	Otro
120	427	429	Otro
121	427	430	Otro
122	427	754	Otro
123	427	755	Otro
124	445	439	Otro
125	445	440	Otro
126	445	441	Otro
127	445	442	Otro
128	445	443	Otro
129	445	444	Otro
130	445	446	Otro
131	45	47	Otro
132	504	502	Otro
133	504	503	Otro
134	504	505	Otro
135	504	13	Otro
136	647	643	Otro
137	647	644	Otro
138	647	645	Otro
139	647	646	Otro
140	647	648	Otro
141	647	649	Otro
142	647	650	Otro
143	647	651	Otro
144	647	652	Otro
145	582	583	Otro
146	582	584	Otro
147	582	585	Otro
148	582	586	Otro
149	508	507	Otro
150	508	509	Otro
151	508	510	Otro
152	508	511	Otro
153	508	512	Otro
154	489	485	Otro
155	489	486	Otro
156	489	487	Otro
157	489	490	Otro
158	489	491	Otro
159	489	492	Otro
160	515	514	Otro
161	515	516	Otro
162	421	422	Otro
163	506	750	Otro
164	506	751	Otro
165	506	752	Otro
166	17	493	Otro
167	17	494	Otro
168	17	495	Otro
169	17	496	Otro
170	17	497	Otro
171	17	498	Otro
172	17	499	Otro
173	17	500	Otro
174	17	501	Otro
175	684	683	Otro
176	684	7	Otro
177	545	543	Otro
178	545	544	Otro
179	545	546	Otro
180	545	547	Otro
181	545	779	Otro
182	362	363	Otro
183	362	364	Otro
184	4	517	Otro
185	4	518	Otro
186	4	519	Otro
187	6	653	Otro
188	6	654	Otro
189	6	655	Otro
190	6	656	Otro
191	6	657	Otro
192	6	658	Otro
193	6	659	Otro
194	6	660	Otro
195	6	661	Otro
196	6	662	Otro
197	6	663	Otro
198	6	664	Otro
199	6	753	Otro
200	781	528	Otro
201	781	529	Otro
202	781	780	Otro
203	14	556	Otro
204	14	557	Otro
205	14	558	Otro
206	14	559	Otro
207	552	548	Otro
208	552	549	Otro
209	552	550	Otro
210	436	435	Otro
211	436	437	Otro
212	436	438	Otro
213	409	410	Otro
214	18	391	Otro
215	18	392	Otro
216	560	561	Otro
217	698	8	Otro
218	539	538	Otro
219	539	540	Otro
220	539	541	Otro
221	539	542	Otro
222	710	709	Otro
223	759	393	Otro
224	759	757	Otro
225	759	758	Otro
226	759	760	Otro
227	759	761	Otro
228	786	513	Otro
229	1	699	Otro
230	19	524	Otro
231	19	525	Otro
232	19	526	Otro
233	19	527	Otro
234	19	743	Otro
235	19	744	Otro
236	404	401	Otro
237	404	402	Otro
238	404	403	Otro
239	404	775	Otro
240	404	776	Otro
241	404	777	Otro
242	404	778	Otro
243	404	787	Otro
244	535	533	Otro
245	535	534	Otro
246	535	536	Otro
247	535	537	Otro
248	627	628	Otro
249	634	631	Otro
250	634	632	Otro
251	634	633	Otro
252	634	735	Otro
253	478	479	Otro
254	478	480	Otro
255	478	481	Otro
256	478	762	Otro
257	478	768	Otro
258	692	693	Otro
259	692	694	Otro
260	692	695	Otro
261	692	696	Otro
262	692	697	Otro
263	579	577	Otro
264	579	578	Otro
265	579	580	Otro
266	579	581	Otro
267	579	756	Otro
268	16	712	Otro
269	16	713	Otro
270	16	714	Otro
271	16	715	Otro
272	16	716	Otro
273	16	717	Otro
274	16	718	Otro
275	16	719	Otro
276	16	720	Otro
277	574	575	Otro
278	574	576	Otro
279	574	15	Otro
280	406	405	Otro
281	406	407	Otro
282	406	408	Otro
283	766	764	Otro
284	766	765	Otro
285	766	767	Otro
288	673	671	Otro
289	673	672	Otro
290	673	674	Otro
291	673	675	Otro
292	673	676	Otro
293	673	677	Otro
294	673	678	Otro
295	673	679	Otro
296	673	680	Otro
297	673	681	Otro
298	673	682	Otro
299	10	686	Otro
300	10	687	Otro
301	10	746	Otro
302	10	748	Otro
303	10	749	Otro
304	731	732	Otro
305	731	733	Otro
306	731	734	Otro
307	384	383	Otro
308	384	385	Otro
309	384	386	Otro
310	384	387	Otro
311	384	388	Otro
312	384	389	Otro
313	384	390	Otro
314	384	9	Otro
315	564	563	Otro
316	564	565	Otro
317	553	551	Otro
318	553	554	Otro
319	553	555	Otro
320	619	616	Otro
321	619	617	Otro
322	619	618	Otro
323	619	620	Otro
324	619	769	Otro
325	520	521	Otro
326	520	522	Otro
327	520	523	Otro
328	415	416	Otro
329	415	417	Otro
330	415	418	Otro
331	415	419	Otro
332	415	420	Otro
333	414	411	Otro
334	414	412	Otro
335	414	413	Otro
336	600	596	Otro
337	600	597	Otro
338	600	598	Otro
339	600	599	Otro
340	600	601	Otro
341	600	602	Otro
342	600	603	Otro
343	600	604	Otro
344	570	571	Otro
345	570	572	Otro
346	570	573	Otro
347	570	736	Otro
348	629	630	Otro
349	612	611	Otro
350	612	613	Otro
351	612	614	Otro
352	612	615	Otro
353	609	605	Otro
354	609	606	Otro
355	609	607	Otro
356	609	608	Otro
357	609	610	Otro
358	784	785	Otro
359	626	625	Otro
286	621	623	Hijo/a
287	621	624	Hijo/a
47	12	397	Hijo/a
360	621	622	Conyuge
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
QtWs7psiCLwh5BODfmkEbUjnyNAeHgbrg8CzCh0a	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJxWTBYejBuRU5iWWdIZDhyMThjalpJaDNnWXJvWFBnTWdYaG1SNFdaIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hZG1pblwvbWllbWJyb3MiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=	1781615764
yK0nYDn3r4atR6b21bkDXBJYV6xYfRqYkDrBFoTJ	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJRWTQ0cnFub2xZNTFtV3FYdU4xb1J3TVdLeEd4dGNsRE1veEJ2MFpBIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hZG1pblwvcGFnb3MiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=	1781732930
BuhHyqzcUMKQwPsMX0fPtJZ1Q836pjbh131gWAXH	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJhVGkwQUtkbXJVczJlbEd5eXpNQ1ZTZTZXWmhVSmJHS3FsT2o0dUNFIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hZG1pblwvcGFnb3MiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=	1781786089
JbEDYMwXEfYwAXjVZDeOBzXvThFXsEVE3fb9pV9q	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJyRGMxSW5yZDQ2QU5pNmNHOGY3WmRVTnFEZXNCbEpSWVBTSTZhcDhyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hZG1pblwvbWllbWJyb3MiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=	1781868742
hmkemGgLYDAQoKo5CkNMJLLmCggnLyryxo1WNkbi	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJmRFQybllIbkxaNThXZFJqMW8zMjREaWg0UGI4aEhORmtBTzRnUzZpIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hZG1pblwvbWllbWJyb3MiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=	1781873472
GjrdYi7nBxbOaRqIK8U4SjGOqDFvrr1HpByoXB9h	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJOdFVpeVlNcFpCTnlzQ2d4ZjZkVHpqS1NJbDNudUNZM0hGQ2pVbkhOIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9pbWdcL2ZvbmRvX3JlZ3VsYXIuanBnIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19	1781902607
pT82X6BT1WHawTUYfB23aITy2DELeLzkefrUGZ7h	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJ1V05remdOcGVHcEFhb1pOcHN4Q3lVVXd1QzRKREVDQjFFWXE1VkZTIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hZG1pblwvY2FybmV0cyIsInJvdXRlIjpudWxsfSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==	1782216886
15A6tC6pntLDUIRQii036CYeeECnL6ovjzYZyOHr	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJYWkYxeGJJT2RxT2xiRnZUcjFSN1JlY0tjaHJpVlgyTXg2TXdmTlJtIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC8ud2VsbC1rbm93blwvYXBwc3BlY2lmaWNcL2NvbS5jaHJvbWUuZGV2dG9vbHMuanNvbiIsInJvdXRlIjpudWxsfSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==	1782247956
\.


--
-- Data for Name: tasas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasas (id, fecha, monto, created_at, updated_at) FROM stdin;
1	2026-06-17	596.78	2026-06-17 20:35:08	2026-06-17 20:35:08
2	2026-06-18	602.33	2026-06-18 12:34:31	2026-06-18 12:34:31
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, email_verified_at, password, role, remember_token, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vinculacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vinculacion (id_miembro, id_persona, representante, director, accionista, presidente) FROM stdin;
12	375	t	f	t	f
16	395	t	f	t	f
23	432	t	f	t	f
25	459	t	f	t	f
31	19	t	f	t	f
35	773	t	f	t	f
43	640	t	f	t	f
46	647	t	f	t	f
54	668	t	f	t	f
57	673	t	f	t	f
61	684	t	f	t	f
62	688	t	f	t	f
65	691	t	f	t	f
69	692	t	f	t	f
71	698	t	f	t	f
81	701	t	f	t	f
89	710	t	f	t	f
94	711	t	f	t	f
98	16	t	f	t	f
99	728	t	f	t	f
102	783	t	f	t	f
103	361	t	f	t	f
106	362	t	f	t	f
119	371	t	f	t	f
123	376	t	f	t	f
124	384	t	f	t	f
152	18	t	f	t	f
159	759	t	f	t	f
160	396	t	f	t	f
174	404	t	f	t	f
185	406	t	f	t	f
198	409	t	f	t	f
199	414	t	f	t	f
202	415	t	f	t	f
206	421	t	f	t	f
214	423	t	f	t	f
217	427	t	f	t	f
233	436	t	f	t	f
236	445	t	f	t	f
242	453	t	f	t	f
252	464	t	f	t	f
255	766	t	f	t	f
260	474	t	f	t	f
261	738	t	f	t	f
262	478	t	f	t	f
266	483	t	f	t	f
269	489	t	f	t	f
272	17	t	f	t	f
278	731	t	f	t	f
284	504	t	f	t	f
285	506	t	f	t	f
289	508	t	f	t	f
291	786	t	f	t	f
299	515	t	f	t	f
309	520	t	f	t	f
310	781	t	f	t	f
328	535	t	f	t	f
334	539	t	f	t	f
363	545	t	f	t	f
368	552	t	f	t	f
371	553	t	f	t	f
377	560	t	f	t	f
379	562	t	f	t	f
385	564	t	f	t	f
388	566	t	f	t	f
389	570	t	f	t	f
393	574	t	f	t	f
396	579	t	f	t	f
399	582	t	f	t	f
402	600	t	f	t	f
403	609	t	f	t	f
404	612	t	f	t	f
405	619	t	f	t	f
408	626	t	f	t	f
411	627	t	f	t	f
412	629	t	f	t	f
413	634	t	f	t	f
422	784	t	f	t	f
141	10	t	f	t	f
4	3	t	f	t	f
52	6	t	f	t	f
376	14	t	f	t	f
30	4	t	f	t	f
324	2	t	f	t	f
137	22	t	f	t	f
414	23	t	f	t	f
142	25	t	f	t	f
228	24	t	t	t	f
83	26	t	f	t	f
125	27	t	f	t	f
5	28	t	f	t	f
181	29	t	f	t	f
221	30	t	f	t	f
37	31	t	f	t	f
421	32	t	f	t	f
390	34	t	f	t	f
127	35	t	f	t	f
378	36	t	f	t	f
224	37	t	f	t	f
203	38	t	f	t	f
271	39	t	f	t	f
387	40	t	f	t	f
1	41	t	f	t	f
327	42	t	f	t	f
75	43	t	f	t	f
423	44	t	f	t	f
88	45	t	f	t	f
253	46	t	f	t	f
301	45	t	f	t	f
268	488	t	f	t	f
102	355	f	f	f	f
102	356	f	f	f	f
102	357	f	f	f	f
102	358	f	f	f	f
102	359	f	f	f	f
103	360	f	f	f	f
106	363	f	f	f	f
106	364	f	f	f	f
119	365	f	f	f	f
119	366	f	f	f	f
119	367	f	f	f	f
119	368	f	f	f	f
119	369	f	f	f	f
119	370	f	f	f	f
12	372	f	f	f	f
12	374	f	f	f	f
123	377	f	f	f	f
123	378	f	f	f	f
123	379	f	f	f	f
123	380	f	f	f	f
123	381	f	f	f	f
123	382	f	f	f	f
124	383	f	f	f	f
124	385	f	f	f	f
124	386	f	f	f	f
124	387	f	f	f	f
124	388	f	f	f	f
124	389	f	f	f	f
124	390	f	f	f	f
152	391	f	f	f	f
152	392	f	f	f	f
159	393	f	f	f	f
16	394	f	f	f	f
174	401	f	f	f	f
174	402	f	f	f	f
174	403	f	f	f	f
185	405	f	f	f	f
185	407	f	f	f	f
185	408	f	f	f	f
198	410	f	f	f	f
199	411	f	f	f	f
199	412	f	f	f	f
199	413	f	f	f	f
202	416	f	f	f	f
202	417	f	f	f	f
202	418	f	f	f	f
202	419	f	f	f	f
202	420	f	f	f	f
206	422	f	f	f	f
214	424	f	f	f	f
214	425	f	f	f	f
214	426	f	f	f	f
217	428	f	f	f	f
217	429	f	f	f	f
217	430	f	f	f	f
23	431	f	f	f	f
23	433	f	f	f	f
23	434	f	f	f	f
233	435	f	f	f	f
233	437	f	f	f	f
233	438	f	f	f	f
236	439	f	f	f	f
236	440	f	f	f	f
236	441	f	f	f	f
236	442	f	f	f	f
236	443	f	f	f	f
236	444	f	f	f	f
236	446	f	f	f	f
407	621	t	f	t	f
329	33	t	f	t	f
242	447	f	f	f	f
242	448	f	f	f	f
242	449	f	f	f	f
242	450	f	f	f	f
242	451	f	f	f	f
242	452	f	f	f	f
242	454	f	f	f	f
25	455	f	f	f	f
25	456	f	f	f	f
25	457	f	f	f	f
25	458	f	f	f	f
25	460	f	f	f	f
25	461	f	f	f	f
25	462	f	f	f	f
252	463	f	f	f	f
252	465	f	f	f	f
252	466	f	f	f	f
252	467	f	f	f	f
252	468	f	f	f	f
252	469	f	f	f	f
260	470	f	f	f	f
260	471	f	f	f	f
260	472	f	f	f	f
260	473	f	f	f	f
261	475	f	f	f	f
261	476	f	f	f	f
261	477	f	f	f	f
262	479	f	f	f	f
262	480	f	f	f	f
262	481	f	f	f	f
266	482	f	f	f	f
266	484	f	f	f	f
269	485	f	f	f	f
269	486	f	f	f	f
269	487	f	f	f	f
269	490	f	f	f	f
269	491	f	f	f	f
269	492	f	f	f	f
272	493	f	f	f	f
272	494	f	f	f	f
272	495	f	f	f	f
272	496	f	f	f	f
272	497	f	f	f	f
272	498	f	f	f	f
272	499	f	f	f	f
272	500	f	f	f	f
272	501	f	f	f	f
284	502	f	f	f	f
284	503	f	f	f	f
284	505	f	f	f	f
289	507	f	f	f	f
289	509	f	f	f	f
289	510	f	f	f	f
289	511	f	f	f	f
289	512	f	f	f	f
291	513	f	f	f	f
299	514	f	f	f	f
299	516	f	f	f	f
30	517	f	f	f	f
30	518	f	f	f	f
30	519	f	f	f	f
309	521	f	f	f	f
309	522	f	f	f	f
309	523	f	f	f	f
31	524	f	f	f	f
31	525	f	f	f	f
31	526	f	f	f	f
31	527	f	f	f	f
310	528	f	f	f	f
310	529	f	f	f	f
324	530	f	f	f	f
324	531	f	f	f	f
324	532	f	f	f	f
328	533	f	f	f	f
328	534	f	f	f	f
328	536	f	f	f	f
328	537	f	f	f	f
334	538	f	f	f	f
334	540	f	f	f	f
334	541	f	f	f	f
334	542	f	f	f	f
363	543	f	f	f	f
363	544	f	f	f	f
363	546	f	f	f	f
363	547	f	f	f	f
368	548	f	f	f	f
368	549	f	f	f	f
368	550	f	f	f	f
371	551	f	f	f	f
371	554	f	f	f	f
371	555	f	f	f	f
376	556	f	f	f	f
376	557	f	f	f	f
376	558	f	f	f	f
376	559	f	f	f	f
377	561	f	f	f	f
385	563	f	f	f	f
385	565	f	f	f	f
388	567	f	f	f	f
388	568	f	f	f	f
388	569	f	f	f	f
389	571	f	f	f	f
389	572	f	f	f	f
389	573	f	f	f	f
393	575	f	f	f	f
393	576	f	f	f	f
396	577	f	f	f	f
396	578	f	f	f	f
396	580	f	f	f	f
396	581	f	f	f	f
399	583	f	f	f	f
399	584	f	f	f	f
399	585	f	f	f	f
399	586	f	f	f	f
4	587	f	f	f	f
4	588	f	f	f	f
4	589	f	f	f	f
4	590	f	f	f	f
4	591	f	f	f	f
4	592	f	f	f	f
4	593	f	f	f	f
4	594	f	f	f	f
4	595	f	f	f	f
402	596	f	f	f	f
402	597	f	f	f	f
402	598	f	f	f	f
402	599	f	f	f	f
402	601	f	f	f	f
402	602	f	f	f	f
402	603	f	f	f	f
402	604	f	f	f	f
403	605	f	f	f	f
403	606	f	f	f	f
403	607	f	f	f	f
403	608	f	f	f	f
403	610	f	f	f	f
404	611	f	f	f	f
404	613	f	f	f	f
404	614	f	f	f	f
404	615	f	f	f	f
405	616	f	f	f	f
405	617	f	f	f	f
405	618	f	f	f	f
405	620	f	f	f	f
408	625	f	f	f	f
411	628	f	f	f	f
412	630	f	f	f	f
413	631	f	f	f	f
413	632	f	f	f	f
413	633	f	f	f	f
43	635	f	f	f	f
43	636	f	f	f	f
43	637	f	f	f	f
43	638	f	f	f	f
43	639	f	f	f	f
43	641	f	f	f	f
43	642	f	f	f	f
46	643	f	f	f	f
46	644	f	f	f	f
46	645	f	f	f	f
46	646	f	f	f	f
46	648	f	f	f	f
46	649	f	f	f	f
46	650	f	f	f	f
46	651	f	f	f	f
46	652	f	f	f	f
52	653	f	f	f	f
52	654	f	f	f	f
52	655	f	f	f	f
52	656	f	f	f	f
52	657	f	f	f	f
52	658	f	f	f	f
52	659	f	f	f	f
52	660	f	f	f	f
52	661	f	f	f	f
52	662	f	f	f	f
52	663	f	f	f	f
52	664	f	f	f	f
54	665	f	f	f	f
54	666	f	f	f	f
54	667	f	f	f	f
54	669	f	f	f	f
407	624	f	f	f	f
407	623	f	f	f	f
54	670	f	f	f	f
57	671	f	f	f	f
57	672	f	f	f	f
57	674	f	f	f	f
57	675	f	f	f	f
57	676	f	f	f	f
57	677	f	f	f	f
57	678	f	f	f	f
57	679	f	f	f	f
57	680	f	f	f	f
57	681	f	f	f	f
57	682	f	f	f	f
61	683	f	f	f	f
62	685	f	f	f	f
141	686	f	f	f	f
141	687	f	f	f	f
62	689	f	f	f	f
62	690	f	f	f	f
69	693	f	f	f	f
69	694	f	f	f	f
69	695	f	f	f	f
69	696	f	f	f	f
69	697	f	f	f	f
8	699	f	f	f	f
81	702	f	f	f	f
81	703	f	f	f	f
81	704	f	f	f	f
81	705	f	f	f	f
81	706	f	f	f	f
81	707	f	f	f	f
81	708	f	f	f	f
89	709	f	f	f	f
98	712	f	f	f	f
98	713	f	f	f	f
98	714	f	f	f	f
98	715	f	f	f	f
98	716	f	f	f	f
98	717	f	f	f	f
98	718	f	f	f	f
98	719	f	f	f	f
98	720	f	f	f	f
99	721	f	f	f	f
99	722	f	f	f	f
99	723	f	f	f	f
99	724	f	f	f	f
99	725	f	f	f	f
99	726	f	f	f	f
99	727	f	f	f	f
99	729	f	f	f	f
99	730	f	f	f	f
278	732	f	f	f	f
278	733	f	f	f	f
278	734	f	f	f	f
413	735	f	f	f	f
389	736	f	f	f	f
12	739	f	f	f	f
252	740	f	f	f	f
252	741	f	f	f	f
12	742	f	f	f	f
31	743	f	f	f	f
31	744	f	f	f	f
103	745	f	f	f	f
141	746	f	f	f	f
81	747	f	f	f	f
141	748	f	f	f	f
141	749	f	f	f	f
285	750	f	f	f	f
285	751	f	f	f	f
285	752	f	f	f	f
52	753	f	f	f	f
217	754	f	f	f	f
217	755	f	f	f	f
396	756	f	f	f	f
159	757	f	f	f	f
159	758	f	f	f	f
159	760	f	f	f	f
159	761	f	f	f	f
262	762	f	f	f	f
99	763	f	f	f	f
255	764	f	f	f	f
255	765	f	f	f	f
255	767	f	f	f	f
262	768	f	f	f	f
405	769	f	f	f	f
35	770	f	f	f	f
35	771	f	f	f	f
35	772	f	f	f	f
35	774	f	f	f	f
174	775	f	f	f	f
174	776	f	f	f	f
174	777	f	f	f	f
174	778	f	f	f	f
363	779	f	f	f	f
310	780	f	f	f	f
214	782	f	f	f	f
422	785	f	f	f	f
174	787	f	f	f	f
61	7	f	f	f	f
71	8	f	f	f	f
124	9	f	f	f	f
284	13	f	f	f	f
393	15	f	f	f	f
88	47	f	f	f	f
8	700	f	f	t	f
8	1	t	t	t	f
171	398	f	f	f	f
171	400	f	f	f	f
171	399	f	f	f	f
171	12	t	t	t	t
171	397	f	f	f	f
407	622	f	f	f	f
\.


--
-- Data for Name: vinculacion_pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vinculacion_pagos (id_factura, id_pago, monto_aplicado, descuento) FROM stdin;
1	2	20.00	5.00
2	3	20.00	5.00
3	4	20.00	5.00
\.


--
-- Name: bancos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bancos_id_seq', 1, false);


--
-- Name: configuraciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuraciones_id_seq', 1, true);


--
-- Name: cruces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cruces_id_seq', 1, false);


--
-- Name: cuenta_banco_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuenta_banco_id_seq', 1, false);


--
-- Name: cuenta_corriente_ugavi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuenta_corriente_ugavi_id_seq', 1, false);


--
-- Name: cuenta_moneda_extranjera_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuenta_moneda_extranjera_id_seq', 1, false);


--
-- Name: documento_miembros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documento_miembros_id_seq', 11, true);


--
-- Name: facturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facturas_id_seq', 115, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: libro_compras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.libro_compras_id_seq', 1, false);


--
-- Name: libro_ventas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.libro_ventas_id_seq', 1, false);


--
-- Name: miembros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.miembros_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 16, true);


--
-- Name: pagos_carnets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_carnets_id_seq', 3, true);


--
-- Name: pagos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_id_seq', 4, true);


--
-- Name: pagos_lote_carnets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_lote_carnets_id_seq', 1, false);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- Name: personas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personas_id_seq', 47, true);


--
-- Name: proveedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedor_id_seq', 1, false);


--
-- Name: relaciones_familiares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.relaciones_familiares_id_seq', 2, true);


--
-- Name: seq_factura_fondo; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_factura_fondo', 5, true);


--
-- Name: seq_factura_ugavi; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seq_factura_ugavi', 5, true);


--
-- Name: tasas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasas_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: bancos bancos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos
    ADD CONSTRAINT bancos_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: carnets_emitidos carnets_emitidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carnets_emitidos
    ADD CONSTRAINT carnets_emitidos_pkey PRIMARY KEY (id);


--
-- Name: configuraciones configuraciones_clave_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT configuraciones_clave_unique UNIQUE (clave);


--
-- Name: configuraciones configuraciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT configuraciones_pkey PRIMARY KEY (id);


--
-- Name: cruces cruces_id_venta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cruces
    ADD CONSTRAINT cruces_id_venta_key UNIQUE (id_venta);


--
-- Name: cruces cruces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cruces
    ADD CONSTRAINT cruces_pkey PRIMARY KEY (id);


--
-- Name: cuenta_banco cuenta_banco_id_compra_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_compra_key UNIQUE (id_compra);


--
-- Name: cuenta_banco cuenta_banco_id_venta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_venta_key UNIQUE (id_venta);


--
-- Name: cuenta_banco cuenta_banco_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_pkey PRIMARY KEY (id);


--
-- Name: cuenta_corriente_ugavi cuenta_corriente_ugavi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_corriente_ugavi
    ADD CONSTRAINT cuenta_corriente_ugavi_pkey PRIMARY KEY (id);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_compra_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_compra_key UNIQUE (id_compra);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_venta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_venta_key UNIQUE (id_venta);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_pkey PRIMARY KEY (id);


--
-- Name: documento_miembros documento_miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_miembros
    ADD CONSTRAINT documento_miembros_pkey PRIMARY KEY (id);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: ganado ganado_id_miembro_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ganado
    ADD CONSTRAINT ganado_id_miembro_key UNIQUE (id_miembro);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: libro_compras libro_compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_compras
    ADD CONSTRAINT libro_compras_pkey PRIMARY KEY (id);


--
-- Name: libro_ventas libro_ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT libro_ventas_pkey PRIMARY KEY (id);


--
-- Name: miembros miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros
    ADD CONSTRAINT miembros_pkey PRIMARY KEY (id);


--
-- Name: miembros miembros_rif_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros
    ADD CONSTRAINT miembros_rif_key UNIQUE (rif);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: pagos_carnets pagos_carnets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_carnets
    ADD CONSTRAINT pagos_carnets_pkey PRIMARY KEY (id);


--
-- Name: pagos_lote_carnets pagos_lote_carnets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_lote_carnets
    ADD CONSTRAINT pagos_lote_carnets_pkey PRIMARY KEY (id);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: personas personas_ci_numero_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_ci_numero_key UNIQUE (ci_numero);


--
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (id);


--
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (id);


--
-- Name: proveedor proveedor_rif_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedor
    ADD CONSTRAINT proveedor_rif_key UNIQUE (rif);


--
-- Name: relaciones_familiares relaciones_familiares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relaciones_familiares
    ADD CONSTRAINT relaciones_familiares_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tasas tasas_fecha_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasas
    ADD CONSTRAINT tasas_fecha_unique UNIQUE (fecha);


--
-- Name: tasas tasas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasas
    ADD CONSTRAINT tasas_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vinculacion_pagos vinculacion_pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinculacion_pagos
    ADD CONSTRAINT vinculacion_pagos_pkey PRIMARY KEY (id_factura, id_pago);


--
-- Name: vinculacion vinculacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinculacion
    ADD CONSTRAINT vinculacion_pkey PRIMARY KEY (id_miembro, id_persona);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: facturas trg_actualizar_saldo_miembro; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_actualizar_saldo_miembro AFTER INSERT OR DELETE OR UPDATE OF pendiente ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.actualizar_saldo_miembro();


--
-- Name: carnets_emitidos carnets_emitidos_id_miembro_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carnets_emitidos
    ADD CONSTRAINT carnets_emitidos_id_miembro_foreign FOREIGN KEY (id_miembro) REFERENCES public.miembros(id) ON DELETE CASCADE;


--
-- Name: carnets_emitidos carnets_emitidos_id_persona_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carnets_emitidos
    ADD CONSTRAINT carnets_emitidos_id_persona_foreign FOREIGN KEY (id_persona) REFERENCES public.personas(id) ON DELETE CASCADE;


--
-- Name: cruces cruces_id_banco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cruces
    ADD CONSTRAINT cruces_id_banco_fkey FOREIGN KEY (id_banco) REFERENCES public.bancos(id);


--
-- Name: cruces cruces_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cruces
    ADD CONSTRAINT cruces_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.libro_ventas(id);


--
-- Name: cuenta_banco cuenta_banco_id_banco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_banco_fkey FOREIGN KEY (id_banco) REFERENCES public.bancos(id);


--
-- Name: cuenta_banco cuenta_banco_id_compra_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_compra_fkey FOREIGN KEY (id_compra) REFERENCES public.libro_compras(id);


--
-- Name: cuenta_banco cuenta_banco_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.libro_ventas(id);


--
-- Name: cuenta_corriente_ugavi cuenta_corriente_ugavi_id_banco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_corriente_ugavi
    ADD CONSTRAINT cuenta_corriente_ugavi_id_banco_fkey FOREIGN KEY (id_banco) REFERENCES public.bancos(id);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_banco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_banco_fkey FOREIGN KEY (id_banco) REFERENCES public.bancos(id);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_compra_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_compra_fkey FOREIGN KEY (id_compra) REFERENCES public.libro_compras(id);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.libro_ventas(id);


--
-- Name: documento_miembros documento_miembros_id_miembro_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_miembros
    ADD CONSTRAINT documento_miembros_id_miembro_foreign FOREIGN KEY (id_miembro) REFERENCES public.miembros(id) ON DELETE CASCADE;


--
-- Name: facturas facturas_id_miembro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_miembro_fkey FOREIGN KEY (id_miembro) REFERENCES public.miembros(id);


--
-- Name: ganado ganado_id_miembro; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ganado
    ADD CONSTRAINT ganado_id_miembro FOREIGN KEY (id_miembro) REFERENCES public.miembros(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: libro_compras libro_compras_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_compras
    ADD CONSTRAINT libro_compras_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id);


--
-- Name: libro_ventas libro_ventas_id_miembro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT libro_ventas_id_miembro_fkey FOREIGN KEY (id_miembro) REFERENCES public.miembros(id);


--
-- Name: libro_ventas libro_ventas_id_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT libro_ventas_id_pago_fkey FOREIGN KEY (id_pago) REFERENCES public.pagos(id);


--
-- Name: pagos_carnets pagos_carnets_id_miembro_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_carnets
    ADD CONSTRAINT pagos_carnets_id_miembro_foreign FOREIGN KEY (id_miembro) REFERENCES public.miembros(id) ON DELETE CASCADE;


--
-- Name: pagos_lote_carnets pagos_lote_carnets_id_miembro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_lote_carnets
    ADD CONSTRAINT pagos_lote_carnets_id_miembro_fkey FOREIGN KEY (id_miembro) REFERENCES public.miembros(id);


--
-- Name: relaciones_familiares relaciones_familiares_id_persona_familiar_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relaciones_familiares
    ADD CONSTRAINT relaciones_familiares_id_persona_familiar_fkey FOREIGN KEY (id_persona_familiar) REFERENCES public.personas(id);


--
-- Name: relaciones_familiares relaciones_familiares_id_persona_titular_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relaciones_familiares
    ADD CONSTRAINT relaciones_familiares_id_persona_titular_fkey FOREIGN KEY (id_persona_titular) REFERENCES public.personas(id);


--
-- Name: vinculacion vinculacion_id_miembro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinculacion
    ADD CONSTRAINT vinculacion_id_miembro_fkey FOREIGN KEY (id_miembro) REFERENCES public.miembros(id);


--
-- Name: vinculacion vinculacion_id_personas_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinculacion
    ADD CONSTRAINT vinculacion_id_personas_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id);


--
-- Name: vinculacion_pagos vinculacion_pagos_id_factura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinculacion_pagos
    ADD CONSTRAINT vinculacion_pagos_id_factura_fkey FOREIGN KEY (id_factura) REFERENCES public.facturas(id);


--
-- Name: vinculacion_pagos vinculacion_pagos_id_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinculacion_pagos
    ADD CONSTRAINT vinculacion_pagos_id_pago_fkey FOREIGN KEY (id_pago) REFERENCES public.pagos(id);


--
-- PostgreSQL database dump complete
--

\unrestrict R1wWQwOt89S9Fm7fHag6Rx3KBDGzUdGnCHpxsrHYCNesgAzQiRBFBZK9ngH5Iqs

