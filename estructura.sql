--
-- Table structure for table job_batches
--

CREATE TABLE job_batches (
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
-- Table structure for table pagos_lote_carnets
--

CREATE TABLE pagos_lote_carnets (
    id integer NOT NULL DEFAULT nextval('pagos_lote_carnets_id_seq'::regclass),
    id_miembro integer,
    monto numeric,
    monto_bs numeric,
    moneda USER-DEFINED,
    fecha date,
    metodo_pago USER-DEFINED,
    referencia character varying,
    concepto character varying,
    tipo_pago USER-DEFINED
);

--
-- Table structure for table tasas
--

CREATE TABLE tasas (
    id bigint NOT NULL DEFAULT nextval('tasas_id_seq'::regclass),
    fecha date NOT NULL,
    monto numeric NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table documento_miembros
--

CREATE TABLE documento_miembros (
    id bigint NOT NULL DEFAULT nextval('documento_miembros_id_seq'::regclass),
    id_miembro bigint NOT NULL,
    tipo character varying(255) NOT NULL,
    ruta_archivo character varying(255) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table cuenta_corriente_ugavi
--

CREATE TABLE cuenta_corriente_ugavi (
    id integer NOT NULL DEFAULT nextval('cuenta_corriente_ugavi_id_seq'::regclass),
    fecha date,
    tipo_operacion USER-DEFINED,
    id_banco integer,
    monto numeric,
    monto_bs numeric,
    tasa_cambio numeric,
    referencia character varying,
    descripcion character varying
);

--
-- Table structure for table clientes_tasca
--

CREATE TABLE clientes_tasca (
    id bigint NOT NULL DEFAULT nextval('clientes_tasca_id_seq'::regclass),
    nombre character varying(255) NOT NULL,
    cedula character varying(255),
    telefono character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table libro_ventas
--

CREATE TABLE libro_ventas (
    id integer NOT NULL DEFAULT nextval('libro_ventas_id_seq'::regclass),
    id_pago integer,
    id_miembro integer,
    fecha date,
    tipo character varying,
    metodo_pago USER-DEFINED,
    monto numeric,
    monto_bs numeric,
    referencia character varying,
    numero_factura character varying,
    numero_control character varying
);

--
-- Table structure for table migrations
--

CREATE TABLE migrations (
    id integer NOT NULL DEFAULT nextval('migrations_id_seq'::regclass),
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);

--
-- Table structure for table obligaciones
--

CREATE TABLE obligaciones (
    id bigint NOT NULL DEFAULT nextval('obligaciones_id_seq'::regclass),
    tipo_obligacion character varying(255) NOT NULL,
    categoria character varying(255) NOT NULL,
    tercero character varying(255) NOT NULL,
    descripcion text,
    monto_original numeric NOT NULL,
    monto_abonado numeric NOT NULL DEFAULT '0'::numeric,
    moneda character varying(255) NOT NULL,
    fecha_emision date NOT NULL,
    fecha_limite date,
    banco_origen_id bigint,
    estado character varying(255) NOT NULL DEFAULT 'PENDIENTE'::character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table pagos
--

CREATE TABLE pagos (
    id integer NOT NULL DEFAULT nextval('pagos_id_seq'::regclass),
    fecha date DEFAULT CURRENT_DATE,
    monto numeric,
    monto_bs numeric,
    tasa_cambio numeric,
    metodo_pago USER-DEFINED,
    factura_ugavi integer DEFAULT nextval('seq_factura_ugavi'::regclass),
    factura_fondo integer DEFAULT nextval('seq_factura_fondo'::regclass),
    referencia character varying,
    estado USER-DEFINED DEFAULT 'Vigente'::estado_pago,
    entrega_id bigint,
    impreso boolean NOT NULL DEFAULT false
);

--
-- Table structure for table miembros
--

CREATE TABLE miembros (
    id integer NOT NULL DEFAULT nextval('miembros_id_seq'::regclass),
    razon_social character varying,
    acronimo character varying,
    rif character varying,
    fecha_ingreso date,
    tipo USER-DEFINED,
    direccion character varying,
    hacienda character varying,
    hectareas numeric,
    solvencia USER-DEFINED,
    saldo_pendiente numeric,
    ultimo_mes date,
    correo character varying,
    telefono character varying,
    tipo_explotacion USER-DEFINED,
    tractores integer,
    plantas_electricas integer,
    convenio boolean DEFAULT false,
    cupo_gasoil boolean DEFAULT false,
    distribuidor_diesel character varying,
    cantidad_animales integer,
    produccion_leche_diaria numeric,
    token_acceso character varying(32),
    municipio character varying(288),
    parroquia character varying(288),
    password character varying(255),
    carnets_disponibles integer NOT NULL,
    congelado boolean NOT NULL DEFAULT false,
    congelado_hasta date
);

--
-- Table structure for table pagos_carnets
--

CREATE TABLE pagos_carnets (
    id bigint NOT NULL DEFAULT nextval('pagos_carnets_id_seq'::regclass),
    id_miembro bigint NOT NULL,
    fecha date NOT NULL,
    monto numeric NOT NULL,
    monto_bs numeric NOT NULL,
    tasa_cambio numeric NOT NULL,
    precio_unitario numeric NOT NULL,
    metodo_pago character varying(255) NOT NULL,
    referencia character varying(255),
    cantidad_carnets integer NOT NULL,
    estado character varying(255) NOT NULL DEFAULT 'Pendiente'::character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table proveedores_tasca
--

CREATE TABLE proveedores_tasca (
    id bigint NOT NULL DEFAULT nextval('proveedores_tasca_id_seq'::regclass),
    nombre character varying(255) NOT NULL,
    identificacion character varying(255),
    telefono character varying(255),
    direccion character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table insumos_tasca
--

CREATE TABLE insumos_tasca (
    id bigint NOT NULL DEFAULT nextval('insumos_tasca_id_seq'::regclass),
    nombre character varying(255) NOT NULL,
    categoria character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    imagen character varying(255)
);

--
-- Table structure for table carnets_emitidos
--

CREATE TABLE carnets_emitidos (
    id_persona bigint NOT NULL,
    id_miembro bigint,
    fecha_emision date NOT NULL,
    fecha_vencimiento date,
    estado character varying(255) NOT NULL DEFAULT 'Activo'::character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    id bigint NOT NULL DEFAULT nextval('carnets_emitidos_id_seq'::regclass)
);

--
-- Table structure for table compras_tasca
--

CREATE TABLE compras_tasca (
    id bigint NOT NULL DEFAULT nextval('compras_tasca_id_seq'::regclass),
    fecha_compra date NOT NULL,
    referencia_factura character varying(255),
    total_usd numeric NOT NULL DEFAULT '0'::numeric,
    estado character varying(255) NOT NULL DEFAULT 'Procesada'::character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    proveedor_id bigint,
    abono_usd numeric NOT NULL DEFAULT '0'::numeric
);

--
-- Table structure for table cache
--

CREATE TABLE cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);

--
-- Table structure for table cache_locks
--

CREATE TABLE cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);

--
-- Table structure for table facturas
--

CREATE TABLE facturas (
    id integer NOT NULL DEFAULT nextval('facturas_id_seq'::regclass),
    id_miembro integer,
    fecha date DEFAULT CURRENT_DATE,
    mes_cuota date,
    pendiente numeric,
    monto numeric
);

--
-- Table structure for table entregas
--

CREATE TABLE entregas (
    id bigint NOT NULL DEFAULT nextval('entregas_id_seq'::regclass),
    fecha date NOT NULL,
    rango_desde date NOT NULL,
    rango_hasta date NOT NULL,
    total_efectivo numeric NOT NULL DEFAULT '0'::numeric,
    total_cruces numeric NOT NULL DEFAULT '0'::numeric,
    ugavi_base numeric NOT NULL DEFAULT '0'::numeric,
    club_base numeric NOT NULL DEFAULT '0'::numeric,
    descuento_cruces numeric NOT NULL DEFAULT '0'::numeric,
    monto_pagado_ugavi numeric NOT NULL DEFAULT '0'::numeric,
    metodo_pago character varying(255),
    referencia character varying(255),
    tasa_cambio numeric NOT NULL DEFAULT '1'::numeric,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    total_bs numeric NOT NULL DEFAULT '0'::numeric,
    total_usd numeric NOT NULL DEFAULT '0'::numeric,
    ugavi_base_bs numeric NOT NULL DEFAULT '0'::numeric,
    ugavi_base_usd numeric NOT NULL DEFAULT '0'::numeric,
    club_base_bs numeric NOT NULL DEFAULT '0'::numeric,
    club_base_usd numeric NOT NULL DEFAULT '0'::numeric,
    descuento_cruces_bs numeric NOT NULL DEFAULT '0'::numeric,
    descuento_cruces_usd numeric NOT NULL DEFAULT '0'::numeric,
    monto_pagado_ugavi_bs numeric NOT NULL DEFAULT '0'::numeric,
    monto_pagado_ugavi_usd numeric NOT NULL DEFAULT '0'::numeric,
    monto_pagado_club_bs numeric NOT NULL DEFAULT '0'::numeric,
    monto_pagado_club_usd numeric NOT NULL DEFAULT '0'::numeric,
    referencia_ugavi_usd character varying(255),
    referencia_ugavi_bs character varying(255),
    referencia_club_usd character varying(255),
    referencia_club_bs character varying(255)
);

--
-- Table structure for table cruces
--

CREATE TABLE cruces (
    id integer NOT NULL DEFAULT nextval('cruces_id_seq'::regclass),
    id_venta integer,
    id_banco integer,
    fecha date,
    referencia character varying,
    descripcion character varying,
    haber numeric
);

--
-- Table structure for table cuenta_banco
--

CREATE TABLE cuenta_banco (
    id integer NOT NULL DEFAULT nextval('cuenta_banco_id_seq'::regclass),
    id_banco integer,
    id_venta integer,
    id_compra integer,
    fecha date,
    tipo_operacion character varying,
    referencia character varying,
    beneficiario character varying,
    descripcion character varying,
    debe numeric,
    haber numeric,
    id_obligacion bigint,
    id_abono_obligacion bigint
);

--
-- Table structure for table bancos
--

CREATE TABLE bancos (
    id integer NOT NULL DEFAULT nextval('bancos_id_seq'::regclass),
    nombre character varying NOT NULL,
    titular character varying,
    divisa USER-DEFINED
);

--
-- Table structure for table cuenta_moneda_extranjera
--

CREATE TABLE cuenta_moneda_extranjera (
    id integer NOT NULL DEFAULT nextval('cuenta_moneda_extranjera_id_seq'::regclass),
    id_banco integer,
    id_venta integer,
    id_compra integer,
    fecha date,
    tipo_operacion character varying,
    referencia character varying,
    beneficiario character varying,
    descripcion character varying,
    debe numeric,
    haber numeric,
    id_obligacion bigint,
    id_abono_obligacion bigint
);

--
-- Table structure for table jobs
--

CREATE TABLE jobs (
    id bigint NOT NULL DEFAULT nextval('jobs_id_seq'::regclass),
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);

--
-- Table structure for table ganado
--

CREATE TABLE ganado (
    id_miembro integer NOT NULL,
    equino boolean,
    vacuno boolean,
    bufalino boolean,
    caprino boolean,
    porcino boolean
);

--
-- Table structure for table pago_venta_tasca
--

CREATE TABLE pago_venta_tasca (
    id bigint NOT NULL DEFAULT nextval('pago_venta_tasca_id_seq'::regclass),
    id_pago bigint NOT NULL,
    id_venta bigint NOT NULL,
    monto_abonado_usd numeric NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table personas
--

CREATE TABLE personas (
    id integer NOT NULL DEFAULT nextval('personas_id_seq'::regclass),
    nombre character varying NOT NULL,
    ci_numero character varying NOT NULL,
    fecha_nacimiento date,
    correo character varying,
    telefono character varying,
    genero USER-DEFINED,
    ex_presidente boolean DEFAULT false,
    honorario boolean NOT NULL DEFAULT false
);

--
-- Table structure for table relaciones_familiares
--

CREATE TABLE relaciones_familiares (
    id integer NOT NULL DEFAULT nextval('relaciones_familiares_id_seq'::regclass),
    id_persona_titular integer,
    id_persona_familiar integer,
    parentesco USER-DEFINED
);

--
-- Table structure for table ventas_tasca_detalles
--

CREATE TABLE ventas_tasca_detalles (
    id bigint NOT NULL DEFAULT nextval('ventas_tasca_detalles_id_seq'::regclass),
    id_venta bigint NOT NULL,
    id_producto bigint NOT NULL,
    cantidad numeric NOT NULL,
    precio_unitario numeric NOT NULL,
    subtotal numeric NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table vinculacion_pagos
--

CREATE TABLE vinculacion_pagos (
    id_factura integer NOT NULL,
    id_pago integer NOT NULL,
    monto_aplicado numeric,
    descuento numeric NOT NULL DEFAULT '0'::numeric
);

--
-- Table structure for table users
--

CREATE TABLE users (
    id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp without time zone,
    password character varying(255) NOT NULL,
    role character varying(255) NOT NULL DEFAULT 'visitante'::character varying,
    remember_token character varying(100),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    username character varying(255),
    is_master boolean NOT NULL DEFAULT false,
    modules json,
    default_route character varying(255)
);

--
-- Table structure for table configuraciones
--

CREATE TABLE configuraciones (
    id bigint NOT NULL DEFAULT nextval('configuraciones_id_seq'::regclass),
    clave character varying(255) NOT NULL,
    valor character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table failed_jobs
--

CREATE TABLE failed_jobs (
    id bigint NOT NULL DEFAULT nextval('failed_jobs_id_seq'::regclass),
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--
-- Table structure for table gastos_tasca
--

CREATE TABLE gastos_tasca (
    id bigint NOT NULL DEFAULT nextval('gastos_tasca_id_seq'::regclass),
    categoria character varying(255) NOT NULL,
    descripcion character varying(255) NOT NULL,
    monto_usd numeric NOT NULL,
    monto_bs numeric,
    metodo_pago character varying(255) NOT NULL,
    fecha date NOT NULL,
    proveedor_id bigint,
    compra_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    referencia_pago character varying(255)
);

--
-- Table structure for table libro_compras
--

CREATE TABLE libro_compras (
    id integer NOT NULL DEFAULT nextval('libro_compras_id_seq'::regclass),
    id_proveedor integer,
    fecha date,
    tipo character varying,
    metodo_pago USER-DEFINED,
    monto numeric,
    monto_bs numeric,
    referencia character varying,
    numero_factura character varying,
    numero_control character varying
);

--
-- Table structure for table lotes_tasca
--

CREATE TABLE lotes_tasca (
    id bigint NOT NULL DEFAULT nextval('lotes_tasca_id_seq'::regclass),
    id_insumo bigint NOT NULL,
    codigo_lote character varying(255),
    proveedor_id bigint,
    cantidad_comprada numeric NOT NULL,
    costo_unitario numeric NOT NULL DEFAULT '0'::numeric,
    stock_actual numeric NOT NULL DEFAULT '0'::numeric,
    fecha_compra date NOT NULL,
    fecha_caducidad date,
    estado character varying(255) NOT NULL DEFAULT 'Activo'::character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    compra_id bigint
);

--
-- Table structure for table pagos_tasca
--

CREATE TABLE pagos_tasca (
    id bigint NOT NULL DEFAULT nextval('pagos_tasca_id_seq'::regclass),
    monto_usd numeric NOT NULL,
    tasa numeric NOT NULL,
    monto_bs numeric,
    metodo_pago character varying(255) NOT NULL,
    referencia character varying(255),
    fecha_pago date NOT NULL,
    anotacion text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table personal_access_tokens
--

CREATE TABLE personal_access_tokens (
    id bigint NOT NULL DEFAULT nextval('personal_access_tokens_id_seq'::regclass),
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table sessions
--

CREATE TABLE sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);

--
-- Table structure for table vinculacion
--

CREATE TABLE vinculacion (
    id_miembro integer NOT NULL,
    id_persona integer NOT NULL,
    representante boolean DEFAULT false,
    director boolean DEFAULT false,
    accionista boolean DEFAULT false,
    presidente boolean NOT NULL DEFAULT false
);

--
-- Table structure for table abonos_obligaciones
--

CREATE TABLE abonos_obligaciones (
    id bigint NOT NULL DEFAULT nextval('abonos_obligaciones_id_seq'::regclass),
    obligacion_id bigint NOT NULL,
    fecha date NOT NULL,
    monto_abonado numeric NOT NULL,
    monto_banco numeric NOT NULL,
    moneda_pago character varying(255) NOT NULL,
    tasa_cambio numeric,
    banco_id bigint,
    referencia character varying(255) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table password_reset_tokens
--

CREATE TABLE password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp without time zone
);

--
-- Table structure for table proveedor
--

CREATE TABLE proveedor (
    id integer NOT NULL DEFAULT nextval('proveedor_id_seq'::regclass),
    razon_social character varying NOT NULL,
    rif character varying,
    direccion character varying
);

--
-- Table structure for table ventas_tasca
--

CREATE TABLE ventas_tasca (
    id bigint NOT NULL DEFAULT nextval('ventas_tasca_id_seq'::regclass),
    id_cliente_tasca bigint,
    id_cliente_miembro bigint,
    total numeric NOT NULL DEFAULT '0'::numeric,
    descuento numeric NOT NULL DEFAULT '0'::numeric,
    estado character varying(255) NOT NULL DEFAULT 'Pendiente'::character varying,
    fecha date NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    id_autorizador integer,
    tasa_bcv numeric,
    fecha_vencimiento date,
    id_persona bigint,
    cargo_servicio numeric NOT NULL
);

--
-- Table structure for table productos_compuestos_detalles
--

CREATE TABLE productos_compuestos_detalles (
    id bigint NOT NULL DEFAULT nextval('productos_compuestos_detalles_id_seq'::regclass),
    id_padre bigint NOT NULL,
    id_hijo bigint NOT NULL,
    cantidad numeric NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table whatsapp_logs
--

CREATE TABLE whatsapp_logs (
    id bigint NOT NULL DEFAULT nextval('whatsapp_logs_id_seq'::regclass),
    miembro_id bigint,
    telefono character varying(255),
    estado character varying(255) NOT NULL DEFAULT 'pendiente'::character varying,
    detalles text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Table structure for table productos_tasca
--

CREATE TABLE productos_tasca (
    id bigint NOT NULL DEFAULT nextval('productos_tasca_id_seq'::regclass),
    codigo_barras character varying(255),
    nombre character varying(255) NOT NULL,
    precio numeric NOT NULL,
    categoria character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    id_insumo bigint,
    medida_descuento numeric NOT NULL DEFAULT '1'::numeric,
    tipo character varying(255) DEFAULT 'fisico'::character varying,
    precio_miembro numeric
);

