--
-- PostgreSQL database dump
--

\restrict YDFydzIzaoQ3aMfYmMZpO6UtAVmbyO7L548UDJkOb7Np7ofyN5n6xJacbnCrwYf

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
-- Name: estado_pago; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_pago AS ENUM (
    'Vigente',
    'Anulada'
);


--
-- Name: estado_solvencia; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_solvencia AS ENUM (
    'Solvente',
    'Insolvente'
);


--
-- Name: genero_persona; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.genero_persona AS ENUM (
    'Femenino',
    'Masculino'
);


--
-- Name: metodo_pago_carnet; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.metodo_pago_carnet AS ENUM (
    'Pago Movil/Transferencia',
    'Zelle',
    'Efectivo Divisas'
);


--
-- Name: metodo_pago_general; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.metodo_pago_general AS ENUM (
    'Pago Movil/Transferencia',
    'Zelle',
    'Efectivo Divisas',
    'Cruces'
);


--
-- Name: moneda_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.moneda_enum AS ENUM (
    'VES',
    'USD'
);


--
-- Name: operacion_ugavi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.operacion_ugavi AS ENUM (
    'Prestamo_a_UGAVI',
    'Recibo_de_UGAVI'
);


--
-- Name: parentesco_familiar; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.parentesco_familiar AS ENUM (
    'Conyuge',
    'Hijo/a',
    'Padre/Madre',
    'Otro'
);


--
-- Name: tipo_miembro; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_miembro AS ENUM (
    'Juridico',
    'Natural'
);


--
-- Name: tipo_pago_carnet; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_pago_carnet AS ENUM (
    'Pagado',
    'Credito'
);


--
-- Name: tipos_de_explotacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipos_de_explotacion AS ENUM (
    'Leche',
    'Carne',
    'Leche y Carne'
);


--
-- Name: actualizar_saldo_miembro(); Type: FUNCTION; Schema: public; Owner: -
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abonos_obligaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.abonos_obligaciones (
    id bigint NOT NULL,
    obligacion_id bigint NOT NULL,
    fecha date NOT NULL,
    monto_abonado numeric(12,2) NOT NULL,
    monto_banco numeric(12,2) NOT NULL,
    moneda_pago character varying(255) NOT NULL,
    tasa_cambio numeric(12,2),
    banco_id bigint NOT NULL,
    referencia character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    metodo_pago character varying(255),
    CONSTRAINT abonos_obligaciones_moneda_pago_check CHECK (((moneda_pago)::text = ANY ((ARRAY['VES'::character varying, 'USD'::character varying])::text[])))
);


--
-- Name: abonos_obligaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.abonos_obligaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: abonos_obligaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.abonos_obligaciones_id_seq OWNED BY public.abonos_obligaciones.id;


--
-- Name: banco_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banco_tienda (
    id bigint NOT NULL,
    banco_id bigint NOT NULL,
    tienda_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: banco_tienda_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banco_tienda_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banco_tienda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banco_tienda_id_seq OWNED BY public.banco_tienda.id;


--
-- Name: bancos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bancos (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    titular character varying,
    divisa public.moneda_enum,
    propietario character varying(255) DEFAULT 'FONDO'::character varying NOT NULL,
    para_membresias boolean DEFAULT false NOT NULL
);


--
-- Name: bancos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bancos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bancos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bancos_id_seq OWNED BY public.bancos.id;


--
-- Name: beneficiarios_fondo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beneficiarios_fondo (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: beneficiarios_fondo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.beneficiarios_fondo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: beneficiarios_fondo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.beneficiarios_fondo_id_seq OWNED BY public.beneficiarios_fondo.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: carnets_emitidos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carnets_emitidos (
    id_persona bigint NOT NULL,
    id_miembro bigint,
    fecha_emision date NOT NULL,
    fecha_vencimiento date,
    estado character varying(255) DEFAULT 'Activo'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    id bigint NOT NULL
);


--
-- Name: carnets_emitidos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carnets_emitidos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carnets_emitidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carnets_emitidos_id_seq OWNED BY public.carnets_emitidos.id;


--
-- Name: categoria_fondos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categoria_fondos (
    id bigint NOT NULL,
    categoria character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: categoria_fondos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categoria_fondos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categoria_fondos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categoria_fondos_id_seq OWNED BY public.categoria_fondos.id;


--
-- Name: clientes_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes_tienda (
    id bigint CONSTRAINT clientes_tasca_id_not_null NOT NULL,
    nombre character varying(255) CONSTRAINT clientes_tasca_nombre_not_null NOT NULL,
    cedula character varying(255),
    telefono character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tienda_id bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: clientes_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clientes_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clientes_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clientes_tasca_id_seq OWNED BY public.clientes_tienda.id;


--
-- Name: compras_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compras_tienda (
    id bigint CONSTRAINT compras_tasca_id_not_null NOT NULL,
    fecha_compra date CONSTRAINT compras_tasca_fecha_compra_not_null NOT NULL,
    referencia_factura character varying(255),
    total_usd numeric(10,2) DEFAULT '0'::numeric CONSTRAINT compras_tasca_total_usd_not_null NOT NULL,
    estado character varying(255) DEFAULT 'Procesada'::character varying CONSTRAINT compras_tasca_estado_not_null NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    proveedor_id bigint,
    abono_usd numeric(10,2) DEFAULT '0'::numeric CONSTRAINT compras_tasca_abono_usd_not_null NOT NULL,
    tienda_id bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: compras_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.compras_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: compras_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.compras_tasca_id_seq OWNED BY public.compras_tienda.id;


--
-- Name: configuraciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuraciones (
    id bigint NOT NULL,
    clave character varying(255) NOT NULL,
    valor character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: configuraciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuraciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuraciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuraciones_id_seq OWNED BY public.configuraciones.id;


--
-- Name: cruces; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: cruces_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cruces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cruces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cruces_id_seq OWNED BY public.cruces.id;


--
-- Name: cuenta_banco; Type: TABLE; Schema: public; Owner: -
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
    haber numeric(10,2) DEFAULT 0,
    categoria_id bigint,
    beneficiario_id bigint,
    id_pago_tienda bigint,
    id_obligacion bigint,
    id_abono_obligacion bigint
);


--
-- Name: cuenta_banco_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cuenta_banco_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cuenta_banco_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cuenta_banco_id_seq OWNED BY public.cuenta_banco.id;


--
-- Name: cuenta_corriente_ugavi; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: cuenta_corriente_ugavi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cuenta_corriente_ugavi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cuenta_corriente_ugavi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cuenta_corriente_ugavi_id_seq OWNED BY public.cuenta_corriente_ugavi.id;


--
-- Name: cuenta_moneda_extranjera; Type: TABLE; Schema: public; Owner: -
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
    haber numeric(10,2) DEFAULT 0,
    categoria_id bigint,
    beneficiario_id bigint,
    id_pago_tienda bigint,
    id_obligacion bigint,
    id_abono_obligacion bigint
);


--
-- Name: cuenta_moneda_extranjera_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cuenta_moneda_extranjera_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cuenta_moneda_extranjera_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cuenta_moneda_extranjera_id_seq OWNED BY public.cuenta_moneda_extranjera.id;


--
-- Name: documento_miembros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documento_miembros (
    id bigint NOT NULL,
    id_miembro bigint NOT NULL,
    tipo character varying(255) NOT NULL,
    ruta_archivo character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: documento_miembros_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documento_miembros_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documento_miembros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documento_miembros_id_seq OWNED BY public.documento_miembros.id;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facturas (
    id integer NOT NULL,
    id_miembro integer,
    fecha date DEFAULT CURRENT_DATE,
    mes_cuota date,
    pendiente numeric(10,2),
    monto numeric(10,2)
);


--
-- Name: facturas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.facturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: facturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.facturas_id_seq OWNED BY public.facturas.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: ganado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ganado (
    id_miembro integer NOT NULL,
    equino boolean,
    vacuno boolean,
    bufalino boolean,
    caprino boolean,
    porcino boolean
);


--
-- Name: gastos_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gastos_tienda (
    id bigint CONSTRAINT gastos_tasca_id_not_null NOT NULL,
    categoria character varying(255) CONSTRAINT gastos_tasca_categoria_not_null NOT NULL,
    descripcion character varying(255) CONSTRAINT gastos_tasca_descripcion_not_null NOT NULL,
    monto_usd numeric(10,2) CONSTRAINT gastos_tasca_monto_usd_not_null NOT NULL,
    monto_bs numeric(10,2),
    metodo_pago character varying(255) CONSTRAINT gastos_tasca_metodo_pago_not_null NOT NULL,
    fecha date CONSTRAINT gastos_tasca_fecha_not_null NOT NULL,
    proveedor_id bigint,
    compra_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    referencia_pago character varying(255),
    tienda_id bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: gastos_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gastos_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gastos_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gastos_tasca_id_seq OWNED BY public.gastos_tienda.id;


--
-- Name: insumos_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insumos_tienda (
    id bigint CONSTRAINT insumos_tasca_id_not_null NOT NULL,
    nombre character varying(255) CONSTRAINT insumos_tasca_nombre_not_null NOT NULL,
    categoria character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    imagen character varying(255),
    tienda_id bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: insumos_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.insumos_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: insumos_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.insumos_tasca_id_seq OWNED BY public.insumos_tienda.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: libro_compras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libro_compras (
    id integer NOT NULL,
    id_proveedor integer,
    fecha date,
    tipo character varying,
    metodo_pago character varying(255),
    monto numeric(10,2),
    monto_bs numeric(10,2),
    referencia character varying,
    numero_factura character varying,
    numero_control character varying
);


--
-- Name: libro_compras_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.libro_compras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: libro_compras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.libro_compras_id_seq OWNED BY public.libro_compras.id;


--
-- Name: libro_ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libro_ventas (
    id integer NOT NULL,
    id_pago integer,
    id_miembro integer,
    fecha date,
    tipo character varying,
    metodo_pago character varying(255),
    monto numeric(10,2),
    monto_bs numeric(10,2),
    referencia character varying,
    numero_factura character varying,
    numero_control character varying
);


--
-- Name: libro_ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.libro_ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: libro_ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.libro_ventas_id_seq OWNED BY public.libro_ventas.id;


--
-- Name: lotes_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lotes_tienda (
    id bigint CONSTRAINT lotes_tasca_id_not_null NOT NULL,
    id_insumo bigint CONSTRAINT lotes_tasca_id_insumo_not_null NOT NULL,
    codigo_lote character varying(255),
    proveedor_id bigint,
    cantidad_comprada numeric(10,2) CONSTRAINT lotes_tasca_cantidad_comprada_not_null NOT NULL,
    costo_unitario numeric(12,2) DEFAULT '0'::numeric CONSTRAINT lotes_tasca_costo_unitario_not_null NOT NULL,
    stock_actual numeric(10,2) DEFAULT '0'::numeric CONSTRAINT lotes_tasca_stock_actual_not_null NOT NULL,
    fecha_compra date CONSTRAINT lotes_tasca_fecha_compra_not_null NOT NULL,
    fecha_caducidad date,
    estado character varying(255) DEFAULT 'Activo'::character varying CONSTRAINT lotes_tasca_estado_not_null NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    compra_id bigint
);


--
-- Name: lotes_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lotes_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lotes_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lotes_tasca_id_seq OWNED BY public.lotes_tienda.id;


--
-- Name: metodos_pago; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metodos_pago (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    id_banco bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: metodos_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.metodos_pago_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: metodos_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.metodos_pago_id_seq OWNED BY public.metodos_pago.id;


--
-- Name: miembros; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: miembros_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.miembros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: miembros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.miembros_id_seq OWNED BY public.miembros.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: obligaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obligaciones (
    id bigint NOT NULL,
    tipo_obligacion character varying(255) NOT NULL,
    categoria character varying(255) NOT NULL,
    tercero character varying(255) NOT NULL,
    descripcion text,
    monto_original numeric(12,2) NOT NULL,
    monto_abonado numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    moneda character varying(255) NOT NULL,
    fecha_emision date NOT NULL,
    fecha_limite date,
    banco_origen_id bigint,
    estado character varying(255) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    metodo_pago character varying(255),
    CONSTRAINT obligaciones_estado_check CHECK (((estado)::text = ANY ((ARRAY['PENDIENTE'::character varying, 'PARCIAL'::character varying, 'PAGADA'::character varying, 'ANULADA'::character varying])::text[]))),
    CONSTRAINT obligaciones_moneda_check CHECK (((moneda)::text = ANY ((ARRAY['VES'::character varying, 'USD'::character varying])::text[]))),
    CONSTRAINT obligaciones_tipo_obligacion_check CHECK (((tipo_obligacion)::text = ANY ((ARRAY['COBRAR'::character varying, 'PAGAR'::character varying])::text[])))
);


--
-- Name: obligaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.obligaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: obligaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.obligaciones_id_seq OWNED BY public.obligaciones.id;


--
-- Name: pago_venta_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pago_venta_tienda (
    id bigint CONSTRAINT pago_venta_tasca_id_not_null NOT NULL,
    id_pago bigint CONSTRAINT pago_venta_tasca_id_pago_not_null NOT NULL,
    id_venta bigint CONSTRAINT pago_venta_tasca_id_venta_not_null NOT NULL,
    monto_abonado_usd numeric(10,2) CONSTRAINT pago_venta_tasca_monto_abonado_usd_not_null NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: pago_venta_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pago_venta_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pago_venta_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pago_venta_tasca_id_seq OWNED BY public.pago_venta_tienda.id;


--
-- Name: seq_factura_fondo; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_factura_fondo
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seq_factura_ugavi; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_factura_ugavi
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagos (
    id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE,
    monto numeric(10,2),
    monto_bs numeric(10,2),
    tasa_cambio numeric(10,2),
    metodo_pago character varying(255),
    factura_ugavi integer DEFAULT nextval('public.seq_factura_ugavi'::regclass),
    factura_fondo integer DEFAULT nextval('public.seq_factura_fondo'::regclass),
    referencia character varying,
    estado public.estado_pago DEFAULT 'Vigente'::public.estado_pago
);


--
-- Name: pagos_carnets; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: pagos_carnets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pagos_carnets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pagos_carnets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pagos_carnets_id_seq OWNED BY public.pagos_carnets.id;


--
-- Name: pagos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pagos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pagos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pagos_id_seq OWNED BY public.pagos.id;


--
-- Name: pagos_lote_carnets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagos_lote_carnets (
    id integer NOT NULL,
    id_miembro integer,
    monto numeric(10,2),
    monto_bs numeric(10,2),
    moneda public.moneda_enum,
    fecha date,
    metodo_pago character varying(255),
    referencia character varying,
    concepto character varying,
    tipo_pago public.tipo_pago_carnet
);


--
-- Name: pagos_lote_carnets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pagos_lote_carnets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pagos_lote_carnets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pagos_lote_carnets_id_seq OWNED BY public.pagos_lote_carnets.id;


--
-- Name: pagos_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagos_tienda (
    id bigint CONSTRAINT pagos_tasca_id_not_null NOT NULL,
    monto_usd numeric(10,2) CONSTRAINT pagos_tasca_monto_usd_not_null NOT NULL,
    tasa numeric(10,2) CONSTRAINT pagos_tasca_tasa_not_null NOT NULL,
    monto_bs numeric(10,2),
    metodo_pago character varying(255) CONSTRAINT pagos_tasca_metodo_pago_not_null NOT NULL,
    referencia character varying(255),
    fecha_pago date CONSTRAINT pagos_tasca_fecha_pago_not_null NOT NULL,
    anotacion text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tienda_id bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: pagos_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pagos_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pagos_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pagos_tasca_id_seq OWNED BY public.pagos_tienda.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: personas; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: personas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personas_id_seq OWNED BY public.personas.id;


--
-- Name: productos_compuestos_detalles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos_compuestos_detalles (
    id bigint NOT NULL,
    id_padre bigint NOT NULL,
    id_hijo bigint NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: productos_compuestos_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.productos_compuestos_detalles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: productos_compuestos_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.productos_compuestos_detalles_id_seq OWNED BY public.productos_compuestos_detalles.id;


--
-- Name: productos_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos_tienda (
    id bigint CONSTRAINT productos_tasca_id_not_null NOT NULL,
    codigo_barras character varying(255),
    nombre character varying(255) CONSTRAINT productos_tasca_nombre_not_null NOT NULL,
    precio numeric(10,2) CONSTRAINT productos_tasca_precio_not_null NOT NULL,
    categoria character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    id_insumo bigint,
    medida_descuento numeric(10,2) DEFAULT '1'::numeric CONSTRAINT productos_tasca_medida_descuento_not_null NOT NULL,
    tipo character varying(255) DEFAULT 'fisico'::character varying CONSTRAINT productos_tasca_tipo_not_null NOT NULL,
    precio_miembro numeric(10,2),
    tienda_id bigint DEFAULT '1'::bigint NOT NULL,
    CONSTRAINT productos_tasca_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['fisico'::character varying, 'servicio'::character varying, 'compuesto'::character varying])::text[])))
);


--
-- Name: productos_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.productos_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: productos_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.productos_tasca_id_seq OWNED BY public.productos_tienda.id;


--
-- Name: proveedor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proveedor (
    id integer NOT NULL,
    razon_social character varying NOT NULL,
    rif character varying,
    direccion character varying
);


--
-- Name: proveedor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proveedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proveedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proveedor_id_seq OWNED BY public.proveedor.id;


--
-- Name: proveedores_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proveedores_tienda (
    id bigint CONSTRAINT proveedores_tasca_id_not_null NOT NULL,
    nombre character varying(255) CONSTRAINT proveedores_tasca_nombre_not_null NOT NULL,
    identificacion character varying(255),
    telefono character varying(255),
    direccion character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tienda_id bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: proveedores_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proveedores_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proveedores_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proveedores_tasca_id_seq OWNED BY public.proveedores_tienda.id;


--
-- Name: relaciones_familiares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relaciones_familiares (
    id integer NOT NULL,
    id_persona_titular integer,
    id_persona_familiar integer,
    parentesco public.parentesco_familiar
);


--
-- Name: relaciones_familiares_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.relaciones_familiares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: relaciones_familiares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.relaciones_familiares_id_seq OWNED BY public.relaciones_familiares.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: tasas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasas (
    id bigint NOT NULL,
    fecha date NOT NULL,
    monto numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: tasas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasas_id_seq OWNED BY public.tasas.id;


--
-- Name: tiendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tiendas (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    tipo_negocio character varying(255) DEFAULT 'restaurante_bar'::character varying NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT tiendas_tipo_negocio_check CHECK (((tipo_negocio)::text = ANY ((ARRAY['restaurante_bar'::character varying, 'tienda_general'::character varying])::text[])))
);


--
-- Name: tiendas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tiendas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tiendas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tiendas_id_seq OWNED BY public.tiendas.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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
    username character varying(255),
    is_master boolean DEFAULT false NOT NULL,
    modules json,
    default_route character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'visitante'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ventas_tienda_detalles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventas_tienda_detalles (
    id bigint CONSTRAINT ventas_tasca_detalles_id_not_null NOT NULL,
    id_venta bigint CONSTRAINT ventas_tasca_detalles_id_venta_not_null NOT NULL,
    id_producto bigint CONSTRAINT ventas_tasca_detalles_id_producto_not_null NOT NULL,
    cantidad numeric(10,2) CONSTRAINT ventas_tasca_detalles_cantidad_not_null NOT NULL,
    precio_unitario numeric(10,2) CONSTRAINT ventas_tasca_detalles_precio_unitario_not_null NOT NULL,
    subtotal numeric(10,2) CONSTRAINT ventas_tasca_detalles_subtotal_not_null NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: ventas_tasca_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventas_tasca_detalles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventas_tasca_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventas_tasca_detalles_id_seq OWNED BY public.ventas_tienda_detalles.id;


--
-- Name: ventas_tienda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventas_tienda (
    id bigint CONSTRAINT ventas_tasca_id_not_null NOT NULL,
    id_cliente_tasca bigint,
    id_cliente_miembro bigint,
    total numeric(10,2) DEFAULT '0'::numeric CONSTRAINT ventas_tasca_total_not_null NOT NULL,
    descuento numeric(10,2) DEFAULT '0'::numeric CONSTRAINT ventas_tasca_descuento_not_null NOT NULL,
    estado character varying(255) DEFAULT 'Pendiente'::character varying CONSTRAINT ventas_tasca_estado_not_null NOT NULL,
    fecha date CONSTRAINT ventas_tasca_fecha_not_null NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    id_autorizador bigint,
    tasa_bcv numeric(10,2),
    fecha_vencimiento date,
    id_persona bigint,
    cargo_servicio numeric(10,2) DEFAULT 0 CONSTRAINT ventas_tasca_cargo_servicio_not_null NOT NULL,
    tienda_id bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: ventas_tasca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventas_tasca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventas_tasca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventas_tasca_id_seq OWNED BY public.ventas_tienda.id;


--
-- Name: vinculacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vinculacion (
    id_miembro integer NOT NULL,
    id_persona integer NOT NULL,
    representante boolean DEFAULT false,
    director boolean DEFAULT false,
    accionista boolean DEFAULT false,
    presidente boolean DEFAULT false NOT NULL
);


--
-- Name: vinculacion_pagos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vinculacion_pagos (
    id_factura integer NOT NULL,
    id_pago integer NOT NULL,
    monto_aplicado numeric(10,2),
    descuento numeric(10,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: whatsapp_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_logs (
    id bigint NOT NULL,
    miembro_id bigint,
    telefono character varying(255),
    estado character varying(255) DEFAULT 'pendiente'::character varying NOT NULL,
    detalles text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_logs_id_seq OWNED BY public.whatsapp_logs.id;


--
-- Name: abonos_obligaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abonos_obligaciones ALTER COLUMN id SET DEFAULT nextval('public.abonos_obligaciones_id_seq'::regclass);


--
-- Name: banco_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banco_tienda ALTER COLUMN id SET DEFAULT nextval('public.banco_tienda_id_seq'::regclass);


--
-- Name: bancos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bancos ALTER COLUMN id SET DEFAULT nextval('public.bancos_id_seq'::regclass);


--
-- Name: beneficiarios_fondo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiarios_fondo ALTER COLUMN id SET DEFAULT nextval('public.beneficiarios_fondo_id_seq'::regclass);


--
-- Name: carnets_emitidos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carnets_emitidos ALTER COLUMN id SET DEFAULT nextval('public.carnets_emitidos_id_seq'::regclass);


--
-- Name: categoria_fondos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_fondos ALTER COLUMN id SET DEFAULT nextval('public.categoria_fondos_id_seq'::regclass);


--
-- Name: clientes_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes_tienda ALTER COLUMN id SET DEFAULT nextval('public.clientes_tasca_id_seq'::regclass);


--
-- Name: compras_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_tienda ALTER COLUMN id SET DEFAULT nextval('public.compras_tasca_id_seq'::regclass);


--
-- Name: configuraciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones ALTER COLUMN id SET DEFAULT nextval('public.configuraciones_id_seq'::regclass);


--
-- Name: cruces id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cruces ALTER COLUMN id SET DEFAULT nextval('public.cruces_id_seq'::regclass);


--
-- Name: cuenta_banco id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco ALTER COLUMN id SET DEFAULT nextval('public.cuenta_banco_id_seq'::regclass);


--
-- Name: cuenta_corriente_ugavi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_corriente_ugavi ALTER COLUMN id SET DEFAULT nextval('public.cuenta_corriente_ugavi_id_seq'::regclass);


--
-- Name: cuenta_moneda_extranjera id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera ALTER COLUMN id SET DEFAULT nextval('public.cuenta_moneda_extranjera_id_seq'::regclass);


--
-- Name: documento_miembros id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_miembros ALTER COLUMN id SET DEFAULT nextval('public.documento_miembros_id_seq'::regclass);


--
-- Name: facturas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id SET DEFAULT nextval('public.facturas_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: gastos_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastos_tienda ALTER COLUMN id SET DEFAULT nextval('public.gastos_tasca_id_seq'::regclass);


--
-- Name: insumos_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insumos_tienda ALTER COLUMN id SET DEFAULT nextval('public.insumos_tasca_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: libro_compras id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_compras ALTER COLUMN id SET DEFAULT nextval('public.libro_compras_id_seq'::regclass);


--
-- Name: libro_ventas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_ventas ALTER COLUMN id SET DEFAULT nextval('public.libro_ventas_id_seq'::regclass);


--
-- Name: lotes_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lotes_tienda ALTER COLUMN id SET DEFAULT nextval('public.lotes_tasca_id_seq'::regclass);


--
-- Name: metodos_pago id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodos_pago ALTER COLUMN id SET DEFAULT nextval('public.metodos_pago_id_seq'::regclass);


--
-- Name: miembros id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros ALTER COLUMN id SET DEFAULT nextval('public.miembros_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: obligaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obligaciones ALTER COLUMN id SET DEFAULT nextval('public.obligaciones_id_seq'::regclass);


--
-- Name: pago_venta_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago_venta_tienda ALTER COLUMN id SET DEFAULT nextval('public.pago_venta_tasca_id_seq'::regclass);


--
-- Name: pagos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos ALTER COLUMN id SET DEFAULT nextval('public.pagos_id_seq'::regclass);


--
-- Name: pagos_carnets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_carnets ALTER COLUMN id SET DEFAULT nextval('public.pagos_carnets_id_seq'::regclass);


--
-- Name: pagos_lote_carnets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_lote_carnets ALTER COLUMN id SET DEFAULT nextval('public.pagos_lote_carnets_id_seq'::regclass);


--
-- Name: pagos_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_tienda ALTER COLUMN id SET DEFAULT nextval('public.pagos_tasca_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: personas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas ALTER COLUMN id SET DEFAULT nextval('public.personas_id_seq'::regclass);


--
-- Name: productos_compuestos_detalles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_compuestos_detalles ALTER COLUMN id SET DEFAULT nextval('public.productos_compuestos_detalles_id_seq'::regclass);


--
-- Name: productos_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_tienda ALTER COLUMN id SET DEFAULT nextval('public.productos_tasca_id_seq'::regclass);


--
-- Name: proveedor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedor ALTER COLUMN id SET DEFAULT nextval('public.proveedor_id_seq'::regclass);


--
-- Name: proveedores_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores_tienda ALTER COLUMN id SET DEFAULT nextval('public.proveedores_tasca_id_seq'::regclass);


--
-- Name: relaciones_familiares id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relaciones_familiares ALTER COLUMN id SET DEFAULT nextval('public.relaciones_familiares_id_seq'::regclass);


--
-- Name: tasas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasas ALTER COLUMN id SET DEFAULT nextval('public.tasas_id_seq'::regclass);


--
-- Name: tiendas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tiendas ALTER COLUMN id SET DEFAULT nextval('public.tiendas_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: ventas_tienda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda ALTER COLUMN id SET DEFAULT nextval('public.ventas_tasca_id_seq'::regclass);


--
-- Name: ventas_tienda_detalles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda_detalles ALTER COLUMN id SET DEFAULT nextval('public.ventas_tasca_detalles_id_seq'::regclass);


--
-- Name: whatsapp_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_logs ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_logs_id_seq'::regclass);


--
-- Name: abonos_obligaciones abonos_obligaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abonos_obligaciones
    ADD CONSTRAINT abonos_obligaciones_pkey PRIMARY KEY (id);


--
-- Name: banco_tienda banco_tienda_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banco_tienda
    ADD CONSTRAINT banco_tienda_pkey PRIMARY KEY (id);


--
-- Name: bancos bancos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bancos
    ADD CONSTRAINT bancos_pkey PRIMARY KEY (id);


--
-- Name: beneficiarios_fondo beneficiarios_fondo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiarios_fondo
    ADD CONSTRAINT beneficiarios_fondo_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: carnets_emitidos carnets_emitidos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carnets_emitidos
    ADD CONSTRAINT carnets_emitidos_pkey PRIMARY KEY (id);


--
-- Name: categoria_fondos categoria_fondos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_fondos
    ADD CONSTRAINT categoria_fondos_pkey PRIMARY KEY (id);


--
-- Name: clientes_tienda clientes_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes_tienda
    ADD CONSTRAINT clientes_tasca_pkey PRIMARY KEY (id);


--
-- Name: compras_tienda compras_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_tienda
    ADD CONSTRAINT compras_tasca_pkey PRIMARY KEY (id);


--
-- Name: configuraciones configuraciones_clave_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT configuraciones_clave_unique UNIQUE (clave);


--
-- Name: configuraciones configuraciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT configuraciones_pkey PRIMARY KEY (id);


--
-- Name: cruces cruces_id_venta_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cruces
    ADD CONSTRAINT cruces_id_venta_key UNIQUE (id_venta);


--
-- Name: cruces cruces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cruces
    ADD CONSTRAINT cruces_pkey PRIMARY KEY (id);


--
-- Name: cuenta_banco cuenta_banco_id_compra_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_compra_key UNIQUE (id_compra);


--
-- Name: cuenta_banco cuenta_banco_id_venta_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_venta_key UNIQUE (id_venta);


--
-- Name: cuenta_banco cuenta_banco_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_pkey PRIMARY KEY (id);


--
-- Name: cuenta_corriente_ugavi cuenta_corriente_ugavi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_corriente_ugavi
    ADD CONSTRAINT cuenta_corriente_ugavi_pkey PRIMARY KEY (id);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_compra_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_compra_key UNIQUE (id_compra);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_venta_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_venta_key UNIQUE (id_venta);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_pkey PRIMARY KEY (id);


--
-- Name: documento_miembros documento_miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_miembros
    ADD CONSTRAINT documento_miembros_pkey PRIMARY KEY (id);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: ganado ganado_id_miembro_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ganado
    ADD CONSTRAINT ganado_id_miembro_key UNIQUE (id_miembro);


--
-- Name: gastos_tienda gastos_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastos_tienda
    ADD CONSTRAINT gastos_tasca_pkey PRIMARY KEY (id);


--
-- Name: insumos_tienda insumos_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insumos_tienda
    ADD CONSTRAINT insumos_tasca_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: libro_compras libro_compras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_compras
    ADD CONSTRAINT libro_compras_pkey PRIMARY KEY (id);


--
-- Name: libro_ventas libro_ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT libro_ventas_pkey PRIMARY KEY (id);


--
-- Name: lotes_tienda lotes_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lotes_tienda
    ADD CONSTRAINT lotes_tasca_pkey PRIMARY KEY (id);


--
-- Name: metodos_pago metodos_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodos_pago
    ADD CONSTRAINT metodos_pago_pkey PRIMARY KEY (id);


--
-- Name: miembros miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros
    ADD CONSTRAINT miembros_pkey PRIMARY KEY (id);


--
-- Name: miembros miembros_rif_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros
    ADD CONSTRAINT miembros_rif_key UNIQUE (rif);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: obligaciones obligaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obligaciones
    ADD CONSTRAINT obligaciones_pkey PRIMARY KEY (id);


--
-- Name: pago_venta_tienda pago_venta_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago_venta_tienda
    ADD CONSTRAINT pago_venta_tasca_pkey PRIMARY KEY (id);


--
-- Name: pagos_carnets pagos_carnets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_carnets
    ADD CONSTRAINT pagos_carnets_pkey PRIMARY KEY (id);


--
-- Name: pagos_lote_carnets pagos_lote_carnets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_lote_carnets
    ADD CONSTRAINT pagos_lote_carnets_pkey PRIMARY KEY (id);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id);


--
-- Name: pagos_tienda pagos_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_tienda
    ADD CONSTRAINT pagos_tasca_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: personas personas_ci_numero_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_ci_numero_key UNIQUE (ci_numero);


--
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (id);


--
-- Name: productos_compuestos_detalles productos_compuestos_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_compuestos_detalles
    ADD CONSTRAINT productos_compuestos_detalles_pkey PRIMARY KEY (id);


--
-- Name: productos_tienda productos_tasca_codigo_barras_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_tienda
    ADD CONSTRAINT productos_tasca_codigo_barras_unique UNIQUE (codigo_barras);


--
-- Name: productos_tienda productos_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_tienda
    ADD CONSTRAINT productos_tasca_pkey PRIMARY KEY (id);


--
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (id);


--
-- Name: proveedor proveedor_rif_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedor
    ADD CONSTRAINT proveedor_rif_key UNIQUE (rif);


--
-- Name: proveedores_tienda proveedores_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores_tienda
    ADD CONSTRAINT proveedores_tasca_pkey PRIMARY KEY (id);


--
-- Name: relaciones_familiares relaciones_familiares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relaciones_familiares
    ADD CONSTRAINT relaciones_familiares_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tasas tasas_fecha_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasas
    ADD CONSTRAINT tasas_fecha_unique UNIQUE (fecha);


--
-- Name: tasas tasas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasas
    ADD CONSTRAINT tasas_pkey PRIMARY KEY (id);


--
-- Name: tiendas tiendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tiendas
    ADD CONSTRAINT tiendas_pkey PRIMARY KEY (id);


--
-- Name: tiendas tiendas_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tiendas
    ADD CONSTRAINT tiendas_slug_unique UNIQUE (slug);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: ventas_tienda_detalles ventas_tasca_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda_detalles
    ADD CONSTRAINT ventas_tasca_detalles_pkey PRIMARY KEY (id);


--
-- Name: ventas_tienda ventas_tasca_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda
    ADD CONSTRAINT ventas_tasca_pkey PRIMARY KEY (id);


--
-- Name: vinculacion_pagos vinculacion_pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vinculacion_pagos
    ADD CONSTRAINT vinculacion_pagos_pkey PRIMARY KEY (id_factura, id_pago);


--
-- Name: vinculacion vinculacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vinculacion
    ADD CONSTRAINT vinculacion_pkey PRIMARY KEY (id_miembro, id_persona);


--
-- Name: whatsapp_logs whatsapp_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_logs
    ADD CONSTRAINT whatsapp_logs_pkey PRIMARY KEY (id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: facturas trg_actualizar_saldo_miembro; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_actualizar_saldo_miembro AFTER INSERT OR DELETE OR UPDATE OF pendiente ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.actualizar_saldo_miembro();


--
-- Name: abonos_obligaciones abonos_obligaciones_banco_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abonos_obligaciones
    ADD CONSTRAINT abonos_obligaciones_banco_id_foreign FOREIGN KEY (banco_id) REFERENCES public.bancos(id) ON DELETE RESTRICT;


--
-- Name: abonos_obligaciones abonos_obligaciones_obligacion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abonos_obligaciones
    ADD CONSTRAINT abonos_obligaciones_obligacion_id_foreign FOREIGN KEY (obligacion_id) REFERENCES public.obligaciones(id) ON DELETE CASCADE;


--
-- Name: banco_tienda banco_tienda_banco_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banco_tienda
    ADD CONSTRAINT banco_tienda_banco_id_foreign FOREIGN KEY (banco_id) REFERENCES public.bancos(id) ON DELETE CASCADE;


--
-- Name: banco_tienda banco_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banco_tienda
    ADD CONSTRAINT banco_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: carnets_emitidos carnets_emitidos_id_miembro_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carnets_emitidos
    ADD CONSTRAINT carnets_emitidos_id_miembro_foreign FOREIGN KEY (id_miembro) REFERENCES public.miembros(id) ON DELETE CASCADE;


--
-- Name: carnets_emitidos carnets_emitidos_id_persona_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carnets_emitidos
    ADD CONSTRAINT carnets_emitidos_id_persona_foreign FOREIGN KEY (id_persona) REFERENCES public.personas(id) ON DELETE CASCADE;


--
-- Name: clientes_tienda clientes_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes_tienda
    ADD CONSTRAINT clientes_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: compras_tienda compras_tasca_proveedor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_tienda
    ADD CONSTRAINT compras_tasca_proveedor_id_foreign FOREIGN KEY (proveedor_id) REFERENCES public.proveedores_tienda(id) ON DELETE SET NULL;


--
-- Name: compras_tienda compras_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_tienda
    ADD CONSTRAINT compras_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: cruces cruces_id_banco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cruces
    ADD CONSTRAINT cruces_id_banco_fkey FOREIGN KEY (id_banco) REFERENCES public.bancos(id);


--
-- Name: cruces cruces_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cruces
    ADD CONSTRAINT cruces_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.libro_ventas(id);


--
-- Name: cuenta_banco cuenta_banco_beneficiario_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_beneficiario_id_foreign FOREIGN KEY (beneficiario_id) REFERENCES public.beneficiarios_fondo(id) ON DELETE SET NULL;


--
-- Name: cuenta_banco cuenta_banco_categoria_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_categoria_id_foreign FOREIGN KEY (categoria_id) REFERENCES public.categoria_fondos(id) ON DELETE SET NULL;


--
-- Name: cuenta_banco cuenta_banco_id_abono_obligacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_abono_obligacion_foreign FOREIGN KEY (id_abono_obligacion) REFERENCES public.abonos_obligaciones(id) ON DELETE CASCADE;


--
-- Name: cuenta_banco cuenta_banco_id_banco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_banco_fkey FOREIGN KEY (id_banco) REFERENCES public.bancos(id);


--
-- Name: cuenta_banco cuenta_banco_id_banco_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_banco_foreign FOREIGN KEY (id_banco) REFERENCES public.bancos(id) ON DELETE RESTRICT;


--
-- Name: cuenta_banco cuenta_banco_id_compra_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_compra_fkey FOREIGN KEY (id_compra) REFERENCES public.libro_compras(id);


--
-- Name: cuenta_banco cuenta_banco_id_obligacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_obligacion_foreign FOREIGN KEY (id_obligacion) REFERENCES public.obligaciones(id) ON DELETE CASCADE;


--
-- Name: cuenta_banco cuenta_banco_id_pago_tienda_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_pago_tienda_foreign FOREIGN KEY (id_pago_tienda) REFERENCES public.pagos_tienda(id) ON DELETE CASCADE;


--
-- Name: cuenta_banco cuenta_banco_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_banco
    ADD CONSTRAINT cuenta_banco_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.libro_ventas(id);


--
-- Name: cuenta_corriente_ugavi cuenta_corriente_ugavi_id_banco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_corriente_ugavi
    ADD CONSTRAINT cuenta_corriente_ugavi_id_banco_fkey FOREIGN KEY (id_banco) REFERENCES public.bancos(id);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_beneficiario_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_beneficiario_id_foreign FOREIGN KEY (beneficiario_id) REFERENCES public.beneficiarios_fondo(id) ON DELETE SET NULL;


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_categoria_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_categoria_id_foreign FOREIGN KEY (categoria_id) REFERENCES public.categoria_fondos(id) ON DELETE SET NULL;


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_abono_obligacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_abono_obligacion_foreign FOREIGN KEY (id_abono_obligacion) REFERENCES public.abonos_obligaciones(id) ON DELETE CASCADE;


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_banco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_banco_fkey FOREIGN KEY (id_banco) REFERENCES public.bancos(id);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_banco_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_banco_foreign FOREIGN KEY (id_banco) REFERENCES public.bancos(id) ON DELETE RESTRICT;


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_compra_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_compra_fkey FOREIGN KEY (id_compra) REFERENCES public.libro_compras(id);


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_obligacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_obligacion_foreign FOREIGN KEY (id_obligacion) REFERENCES public.obligaciones(id) ON DELETE CASCADE;


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_pago_tienda_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_pago_tienda_foreign FOREIGN KEY (id_pago_tienda) REFERENCES public.pagos_tienda(id) ON DELETE CASCADE;


--
-- Name: cuenta_moneda_extranjera cuenta_moneda_extranjera_id_venta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cuenta_moneda_extranjera
    ADD CONSTRAINT cuenta_moneda_extranjera_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.libro_ventas(id);


--
-- Name: documento_miembros documento_miembros_id_miembro_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_miembros
    ADD CONSTRAINT documento_miembros_id_miembro_foreign FOREIGN KEY (id_miembro) REFERENCES public.miembros(id) ON DELETE CASCADE;


--
-- Name: facturas facturas_id_miembro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_miembro_fkey FOREIGN KEY (id_miembro) REFERENCES public.miembros(id);


--
-- Name: ventas_tienda fk_ventas_tasca_autorizador; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda
    ADD CONSTRAINT fk_ventas_tasca_autorizador FOREIGN KEY (id_autorizador) REFERENCES public.personas(id) ON DELETE SET NULL;


--
-- Name: ventas_tienda fk_ventas_tasca_persona; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda
    ADD CONSTRAINT fk_ventas_tasca_persona FOREIGN KEY (id_persona) REFERENCES public.personas(id) ON DELETE SET NULL;


--
-- Name: ganado ganado_id_miembro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ganado
    ADD CONSTRAINT ganado_id_miembro FOREIGN KEY (id_miembro) REFERENCES public.miembros(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gastos_tienda gastos_tasca_compra_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastos_tienda
    ADD CONSTRAINT gastos_tasca_compra_id_foreign FOREIGN KEY (compra_id) REFERENCES public.compras_tienda(id) ON DELETE CASCADE;


--
-- Name: gastos_tienda gastos_tasca_proveedor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastos_tienda
    ADD CONSTRAINT gastos_tasca_proveedor_id_foreign FOREIGN KEY (proveedor_id) REFERENCES public.proveedores_tienda(id) ON DELETE SET NULL;


--
-- Name: gastos_tienda gastos_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastos_tienda
    ADD CONSTRAINT gastos_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: insumos_tienda insumos_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insumos_tienda
    ADD CONSTRAINT insumos_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: libro_compras libro_compras_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_compras
    ADD CONSTRAINT libro_compras_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id);


--
-- Name: libro_ventas libro_ventas_id_miembro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT libro_ventas_id_miembro_fkey FOREIGN KEY (id_miembro) REFERENCES public.miembros(id);


--
-- Name: libro_ventas libro_ventas_id_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT libro_ventas_id_pago_fkey FOREIGN KEY (id_pago) REFERENCES public.pagos(id);


--
-- Name: lotes_tienda lotes_tasca_compra_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lotes_tienda
    ADD CONSTRAINT lotes_tasca_compra_id_foreign FOREIGN KEY (compra_id) REFERENCES public.compras_tienda(id) ON DELETE CASCADE;


--
-- Name: lotes_tienda lotes_tasca_id_insumo_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lotes_tienda
    ADD CONSTRAINT lotes_tasca_id_insumo_foreign FOREIGN KEY (id_insumo) REFERENCES public.insumos_tienda(id) ON DELETE CASCADE;


--
-- Name: lotes_tienda lotes_tasca_proveedor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lotes_tienda
    ADD CONSTRAINT lotes_tasca_proveedor_id_foreign FOREIGN KEY (proveedor_id) REFERENCES public.proveedor(id) ON DELETE SET NULL;


--
-- Name: metodos_pago metodos_pago_id_banco_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodos_pago
    ADD CONSTRAINT metodos_pago_id_banco_foreign FOREIGN KEY (id_banco) REFERENCES public.bancos(id) ON DELETE SET NULL;


--
-- Name: obligaciones obligaciones_banco_origen_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obligaciones
    ADD CONSTRAINT obligaciones_banco_origen_id_foreign FOREIGN KEY (banco_origen_id) REFERENCES public.bancos(id) ON DELETE SET NULL;


--
-- Name: pago_venta_tienda pago_venta_tasca_id_pago_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago_venta_tienda
    ADD CONSTRAINT pago_venta_tasca_id_pago_foreign FOREIGN KEY (id_pago) REFERENCES public.pagos_tienda(id) ON DELETE CASCADE;


--
-- Name: pago_venta_tienda pago_venta_tasca_id_venta_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago_venta_tienda
    ADD CONSTRAINT pago_venta_tasca_id_venta_foreign FOREIGN KEY (id_venta) REFERENCES public.ventas_tienda(id) ON DELETE CASCADE;


--
-- Name: pagos_carnets pagos_carnets_id_miembro_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_carnets
    ADD CONSTRAINT pagos_carnets_id_miembro_foreign FOREIGN KEY (id_miembro) REFERENCES public.miembros(id) ON DELETE CASCADE;


--
-- Name: pagos_lote_carnets pagos_lote_carnets_id_miembro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_lote_carnets
    ADD CONSTRAINT pagos_lote_carnets_id_miembro_fkey FOREIGN KEY (id_miembro) REFERENCES public.miembros(id);


--
-- Name: pagos_tienda pagos_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_tienda
    ADD CONSTRAINT pagos_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: productos_compuestos_detalles productos_compuestos_detalles_id_hijo_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_compuestos_detalles
    ADD CONSTRAINT productos_compuestos_detalles_id_hijo_foreign FOREIGN KEY (id_hijo) REFERENCES public.productos_tienda(id) ON DELETE CASCADE;


--
-- Name: productos_compuestos_detalles productos_compuestos_detalles_id_padre_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_compuestos_detalles
    ADD CONSTRAINT productos_compuestos_detalles_id_padre_foreign FOREIGN KEY (id_padre) REFERENCES public.productos_tienda(id) ON DELETE CASCADE;


--
-- Name: productos_tienda productos_tasca_id_insumo_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_tienda
    ADD CONSTRAINT productos_tasca_id_insumo_foreign FOREIGN KEY (id_insumo) REFERENCES public.insumos_tienda(id) ON DELETE SET NULL;


--
-- Name: productos_tienda productos_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos_tienda
    ADD CONSTRAINT productos_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: proveedores_tienda proveedores_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores_tienda
    ADD CONSTRAINT proveedores_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: relaciones_familiares relaciones_familiares_id_persona_familiar_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relaciones_familiares
    ADD CONSTRAINT relaciones_familiares_id_persona_familiar_fkey FOREIGN KEY (id_persona_familiar) REFERENCES public.personas(id);


--
-- Name: relaciones_familiares relaciones_familiares_id_persona_titular_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relaciones_familiares
    ADD CONSTRAINT relaciones_familiares_id_persona_titular_fkey FOREIGN KEY (id_persona_titular) REFERENCES public.personas(id);


--
-- Name: ventas_tienda_detalles ventas_tasca_detalles_id_producto_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda_detalles
    ADD CONSTRAINT ventas_tasca_detalles_id_producto_foreign FOREIGN KEY (id_producto) REFERENCES public.productos_tienda(id) ON DELETE RESTRICT;


--
-- Name: ventas_tienda_detalles ventas_tasca_detalles_id_venta_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda_detalles
    ADD CONSTRAINT ventas_tasca_detalles_id_venta_foreign FOREIGN KEY (id_venta) REFERENCES public.ventas_tienda(id) ON DELETE CASCADE;


--
-- Name: ventas_tienda ventas_tasca_id_cliente_miembro_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda
    ADD CONSTRAINT ventas_tasca_id_cliente_miembro_foreign FOREIGN KEY (id_cliente_miembro) REFERENCES public.miembros(id) ON DELETE SET NULL;


--
-- Name: ventas_tienda ventas_tasca_id_cliente_tasca_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda
    ADD CONSTRAINT ventas_tasca_id_cliente_tasca_foreign FOREIGN KEY (id_cliente_tasca) REFERENCES public.clientes_tienda(id) ON DELETE SET NULL;


--
-- Name: ventas_tienda ventas_tienda_tienda_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_tienda
    ADD CONSTRAINT ventas_tienda_tienda_id_foreign FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;


--
-- Name: vinculacion vinculacion_id_miembro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vinculacion
    ADD CONSTRAINT vinculacion_id_miembro_fkey FOREIGN KEY (id_miembro) REFERENCES public.miembros(id);


--
-- Name: vinculacion vinculacion_id_personas_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vinculacion
    ADD CONSTRAINT vinculacion_id_personas_fkey FOREIGN KEY (id_persona) REFERENCES public.personas(id);


--
-- Name: vinculacion_pagos vinculacion_pagos_id_factura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vinculacion_pagos
    ADD CONSTRAINT vinculacion_pagos_id_factura_fkey FOREIGN KEY (id_factura) REFERENCES public.facturas(id);


--
-- Name: vinculacion_pagos vinculacion_pagos_id_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vinculacion_pagos
    ADD CONSTRAINT vinculacion_pagos_id_pago_fkey FOREIGN KEY (id_pago) REFERENCES public.pagos(id);


--
-- PostgreSQL database dump complete
--

\unrestrict YDFydzIzaoQ3aMfYmMZpO6UtAVmbyO7L548UDJkOb7Np7ofyN5n6xJacbnCrwYf

--
-- PostgreSQL database dump
--

\restrict BZtIXqg4KUlhxEU7kYxybNxtytgcfD5UbQZ3O74hRsBGMOXcKo63JJNm7e082fb

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
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_06_15_203709_create_personal_access_tokens_table	1
5	2026_06_17_203349_create_tasas_table	1
17	2026_07_07_224441_create_tasca_tables	2
18	2026_07_08_001158_refactor_pagos_tasca_table	3
19	2026_07_08_002240_add_costo_proveedor_to_productos_tasca_table	4
20	2026_07_08_094233_create_insumos_y_lotes_tasca_table	5
21	2026_07_08_101839_create_compras_tasca_table	6
22	2026_07_08_101840_add_compra_id_to_lotes_tasca_table	7
23	2026_07_08_103735_remove_medida_columns_from_insumos_tasca_table	8
24	2026_07_08_124430_create_tasca_gastos_proveedores_tables	9
25	2026_07_08_130458_add_referencia_pago_to_gastos_tasca_table	10
26	2026_07_08_221808_change_id_to_integer_in_carnets_emitidos_table	11
27	2026_07_14_150215_add_tasa_bcv_to_ventas_tasca_table	12
28	2026_07_16_133007_add_fecha_vencimiento_to_ventas_tasca_table	13
29	2026_07_16_201341_add_tipo_to_productos_tasca_table	14
30	2026_07_16_201355_create_productos_compuestos_detalles_table	15
31	2026_07_21_152531_create_whatsapp_logs_table	16
32	2026_06_25_202127_create_obligaciones_tables	17
33	2026_06_17_204246_add_descuento_to_vinculacion_pagos_table	18
34	2026_06_17_214653_create_actualizar_saldo_miembro_trigger	19
35	2026_06_17_214644_add_monto_to_facturas_table	20
36	2026_06_19_113903_add_presidente_to_vinculacion_table	20
37	2026_06_19_190409_add_carnets_disponibles_to_miembro_table	20
38	2026_06_19_190420_create_pagos_carnets_table	20
39	2026_06_19_190430_create_carnets_emitidos_table	20
40	2026_06_19_195223_create_configuracions_table	20
41	2026_06_19_203040_add_honorario_to_personas	20
42	2026_06_19_203059_make_id_miembro_nullable_in_carnets_emitidos	20
43	2026_06_23_195803_create_documento_miembros_table	20
44	2026_06_26_200517_add_obligacion_fks_to_bancos_tables	20
45	2026_06_30_163534_create_entregas_table	20
46	2026_06_30_163556_add_entrega_id_to_pagos_table	20
47	2026_06_30_181755_add_congelado_to_miembros_table	20
48	2026_07_01_073718_add_currency_splits_to_entregas_table	20
49	2026_07_01_090052_make_banco_id_nullable_in_abonos_obligaciones	20
50	2026_07_01_091121_add_club_pagado_to_entregas	20
51	2026_07_01_095939_add_referencias_to_entregas	20
52	2026_07_01_105214_add_impreso_to_pagos_table	20
53	2026_07_08_140510_add_role_fields_to_users_table	20
54	2026_07_09_082100_add_default_route_to_users_table	20
55	2026_07_09_101000_add_id_autorizador_to_ventas_tasca	20
56	2026_07_10_084522_update_actualizar_saldo_miembro_trigger_for_solvencia	20
57	2026_07_16_113005_add_imagen_to_insumos_tasca_table	20
58	2026_07_16_134849_add_id_persona_to_ventas_tasca_table	20
59	2026_07_17_163405_change_cantidad_to_decimal_in_ventas_tasca_detalles_table	20
60	2026_07_25_193942_add_precio_miembro_to_productos_tasca_table	20
61	2026_07_25_204036_add_cargo_servicio_to_ventas_tasca_table	20
62	2026_08_06_152150_create_categoria_fondos_table	21
63	2026_08_06_152215_add_categoria_id_to_bancos_tables	21
64	2026_08_06_160646_create_beneficiario_fondos_table	21
65	2026_08_06_160704_add_beneficiario_id_to_bancos_tables	21
66	2026_08_07_092427_add_propietario_to_bancos_and_create_metodos_pago	21
67	2026_08_07_093503_remove_propietario_from_metodos_pago	21
68	2026_08_07_164039_create_tiendas_and_banco_tienda_tables	21
69	2026_08_07_164120_rename_tasca_tables_to_tienda_and_add_tienda_id	21
70	2026_08_07_164209_update_bancos_and_metodos_pago_to_membresia	21
71	2026_08_07_201555_change_metodo_pago_to_string_in_pagos_tables	22
72	2026_08_07_204439_add_metodo_pago_to_obligaciones_tables	23
73	2026_08_07_220800_fix_obligacion_fks_in_bancos_tables	24
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 73, true);


--
-- PostgreSQL database dump complete
--

\unrestrict BZtIXqg4KUlhxEU7kYxybNxtytgcfD5UbQZ3O74hRsBGMOXcKo63JJNm7e082fb

