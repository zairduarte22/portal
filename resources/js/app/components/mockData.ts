export type TipoMiembro = "Juridico" | "Natural";
export type EstadoSolvencia = "Solvente" | "Insolvente";
export type TipoExplotacion = "Leche" | "Carne" | "Leche y Carne";
export type GeneroPersona = "Femenino" | "Masculino";

export interface Persona {
  id: number;
  nombre: string;
  ci_numero: string;
  fecha_nacimiento: string;
  correo: string;
  telefono: string;
  genero: GeneroPersona;
  ex_presidente: boolean;
  honorario?: boolean;
}

export interface Factura {
  id: number;
  id_miembro: number;
  fecha: string;
  mes_cuota: string;
  pendiente: number;
}

export interface Pago {
  id: number;
  fecha: string;
  monto: number;
  monto_bs: number;
  tasa_cambio: number;
  metodo_pago: string;
  factura_ugavi: string | number | null;
  factura_fondo: string | number | null;
  referencia: string;
  estado: string;
}

export interface VinculacionPago {
  id_factura: number;
  id_pago: number;
  monto_aplicado: number;
  descuento: number;
}

export interface RelacionFamiliar {
  id: number;
  id_persona_titular: number;
  id_persona_familiar: number;
  parentesco: string;
}

export interface Vinculacion {
  id_miembro: number;
  id_persona: number;
  representante: boolean;
  director: boolean;
  accionista: boolean;
  presidente: boolean;
  // Extended UI properties for relations
  parentesco?: string | null;
  id_persona_titular?: number | null;
}

export interface Miembro {
  id: number;
  razon_social: string;
  acronimo: string;
  rif: string;
  fecha_ingreso: string;
  tipo: TipoMiembro;
  direccion: string;
  hacienda: string;
  hectareas: number;
  solvencia: EstadoSolvencia;
  saldo_pendiente: number;
  ultimo_mes: string;
  correo?: string;
  telefono?: string;
  tipo_explotacion: TipoExplotacion;
  tractores: number;
  plantas_electricas: number;
  convenio: boolean;
  carnets_disponibles: number;
  cupo_gasoil: boolean;
  distribuidor_diesel?: string;
  cantidad_animales: number;
  produccion_leche_diaria: number;
  municipio?: string;
  parroquia?: string;
  congelado?: boolean;
  congelado_hasta?: string | null;
}


export const miembros: Miembro[] = [
  {
    id: 1,
    razon_social: "Agropecuaria Los Llanos C.A.",
    acronimo: "AGROLL",
    rif: "J-30145678-9",
    fecha_ingreso: "2015-03-12",
    tipo: "Juridico",
    direccion: "Carretera Nacional, Km 45, Barinas",
    hacienda: "Hato San Pedro",
    hectareas: 850.5,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "contacto@agroll.com.ve",
    telefono: "+58-273-4561234",
    tipo_explotacion: "Leche y Carne",
    tractores: 4,
    plantas_electricas: 2,
    convenio: true,
    carnets_disponibles: 12,
    cupo_gasoil: true,
    distribuidor_diesel: "PDVSA Barinas",
    cantidad_animales: 620,
    produccion_leche_diaria: 1850,
    municipio: "Barinas",
    parroquia: "CorazÃ³n de JesÃºs",
  },
  {
    id: 2,
    razon_social: "Finca El Palmar S.A.",
    acronimo: "FELPAL",
    rif: "J-29876543-1",
    fecha_ingreso: "2018-07-22",
    tipo: "Juridico",
    direccion: "Sector Palmar, Apure",
    hacienda: "El Palmar",
    hectareas: 420.0,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "elpalmar@gmail.com",
    telefono: "+58-247-3210987",
    tipo_explotacion: "Leche y Carne",
    tractores: 2,
    plantas_electricas: 1,
    convenio: true,
    carnets_disponibles: 8,
    cupo_gasoil: true,
    distribuidor_diesel: "PDVSA San Fernando",
    cantidad_animales: 380,
    produccion_leche_diaria: 2100,
    municipio: "San Fernando",
    parroquia: "San Rafael de Atamaica",
  },
  {
    id: 3,
    razon_social: "Hacienda Santa Rosa C.A.",
    acronimo: "HASARO",
    rif: "J-40123456-7",
    fecha_ingreso: "2020-01-15",
    tipo: "Juridico",
    direccion: "VÃ­a La FrÃ­a, MÃ©rida",
    hacienda: "Santa Rosa",
    hectareas: 275.75,
    solvencia: "Insolvente",
    saldo_pendiente: 145000,
    ultimo_mes: "2024-02-01",
    correo: "santarosa@hacienda.ve",
    telefono: "+58-274-5678901",
    tipo_explotacion: "Leche y Carne",
    tractores: 1,
    plantas_electricas: 1,
    convenio: false,
    carnets_disponibles: 5,
    cupo_gasoil: false,
    distribuidor_diesel: "",
    cantidad_animales: 195,
    produccion_leche_diaria: 580,
    municipio: "Zea",
    parroquia: "San Pablo",
  },
  {
    id: 4,
    razon_social: "Granja AvÃ­cola El Progreso C.A.",
    acronimo: "GRAEPRO",
    rif: "J-38765432-0",
    fecha_ingreso: "2019-09-08",
    tipo: "Juridico",
    direccion: "Zona Industrial, Maracay",
    hacienda: "El Progreso",
    hectareas: 120.0,
    solvencia: "Insolvente",
    saldo_pendiente: 380000,
    ultimo_mes: "2023-11-01",
    correo: "granja.progreso@ve.com",
    telefono: "+58-243-4567890",
    tipo_explotacion: "Leche y Carne",
    tractores: 0,
    plantas_electricas: 3,
    convenio: false,
    carnets_disponibles: 3,
    cupo_gasoil: false,
    distribuidor_diesel: "",
    cantidad_animales: 45000,
    produccion_leche_diaria: 0,
    municipio: "Girardot",
    parroquia: "El LimÃ³n",
  },
  {
    id: 5,
    razon_social: "Agropecuaria RÃ­o Verde C.A.",
    acronimo: "AGRIRV",
    rif: "J-31234567-8",
    fecha_ingreso: "2016-11-30",
    tipo: "Natural",
    direccion: "Carretera Portuguesa, Km 12",
    hacienda: "Hato RÃ­o Verde",
    hectareas: 1250.0,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "rioverde@agropecuaria.ve",
    telefono: "+58-255-3456789",
    tipo_explotacion: "Leche y Carne",
    tractores: 6,
    plantas_electricas: 3,
    convenio: true,
    carnets_disponibles: 20,
    cupo_gasoil: true,
    distribuidor_diesel: "PDVSA Acarigua",
    cantidad_animales: 980,
    produccion_leche_diaria: 3200,
    municipio: "Araure",
    parroquia: "Araure",
  },
  {
    id: 6,
    razon_social: "Finca La Esperanza S.R.L.",
    acronimo: "FLESP",
    rif: "J-35678901-2",
    fecha_ingreso: "2021-04-18",
    tipo: "Juridico",
    direccion: "Sector Las Matas, Cojedes",
    hacienda: "La Esperanza",
    hectareas: 530.25,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "esperanza@finca.com.ve",
    telefono: "+58-258-2345678",
    tipo_explotacion: "Leche y Carne",
    tractores: 3,
    plantas_electricas: 2,
    convenio: true,
    carnets_disponibles: 10,
    cupo_gasoil: true,
    distribuidor_diesel: "PDVSA Tinaquillo",
    cantidad_animales: 420,
    produccion_leche_diaria: 1450,
    municipio: "Tinaquillo",
    parroquia: "Tinaquillo",
  },
  {
    id: 7,
    razon_social: "Cooperativa Agraria Los Andes",
    acronimo: "COAGLAND",
    rif: "J-28901234-5",
    fecha_ingreso: "2014-06-03",
    tipo: "Juridico",
    direccion: "La Grita, TÃ¡chira",
    hacienda: "Finca Los Andes",
    hectareas: 340.0,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "losandes.coop@gmail.com",
    telefono: "+58-276-4890123",
    tipo_explotacion: "Leche y Carne",
    tractores: 2,
    plantas_electricas: 1,
    convenio: false,
    carnets_disponibles: 6,
    cupo_gasoil: false,
    distribuidor_diesel: "",
    cantidad_animales: 0,
    produccion_leche_diaria: 0,
    municipio: "La Grita",
    parroquia: "La Grita",
  },
  {
    id: 8,
    razon_social: "Porcicultura El Valle C.A.",
    acronimo: "PORVALL",
    rif: "J-42345678-3",
    fecha_ingreso: "2022-08-14",
    tipo: "Juridico",
    direccion: "Valles del Tuy, Miranda",
    hacienda: "El Valle",
    hectareas: 85.5,
    solvencia: "Insolvente",
    saldo_pendiente: 72000,
    ultimo_mes: "2024-03-01",
    correo: "porcicultura.elvalle@ve.com",
    telefono: "+58-239-5678901",
    tipo_explotacion: "Leche y Carne",
    tractores: 0,
    plantas_electricas: 2,
    convenio: false,
    carnets_disponibles: 4,
    cupo_gasoil: false,
    distribuidor_diesel: "",
    cantidad_animales: 1200,
    produccion_leche_diaria: 0,
    municipio: "Urdaneta",
    parroquia: "Cartanal",
  },
];

export const personas: Persona[] = [
  { id: 1, nombre: "Carlos Alberto Mendoza RÃ­os", ci_numero: "V-8.234.567", fecha_nacimiento: "1968-04-15", correo: "cmendoza@agroll.com.ve", telefono: "+58-412-3456789", genero: "Masculino", ex_presidente: false },
  { id: 2, nombre: "MarÃ­a Eugenia Salazar PÃ©rez", ci_numero: "V-10.456.789", fecha_nacimiento: "1975-09-22", correo: "msalazar@agroll.com.ve", telefono: "+58-414-5678901", genero: "Femenino", ex_presidente: false },
  { id: 3, nombre: "JosÃ© RamÃ³n Torrealba GuzmÃ¡n", ci_numero: "V-6.789.012", fecha_nacimiento: "1955-12-03", correo: "jtorrealba@agroll.com.ve", telefono: "+58-416-7890123", genero: "Masculino", ex_presidente: true },
  { id: 4, nombre: "Luisa Fernanda Viloria Castro", ci_numero: "V-15.234.890", fecha_nacimiento: "1982-07-18", correo: "lviloria@elpalmar.ve", telefono: "+58-424-2345678", genero: "Femenino", ex_presidente: false },
  { id: 5, nombre: "AndrÃ©s Felipe Contreras Blanco", ci_numero: "V-12.567.321", fecha_nacimiento: "1979-03-30", correo: "acontreras@elpalmar.ve", telefono: "+58-426-3456789", genero: "Masculino", ex_presidente: false },
  { id: 6, nombre: "Gloria Patricia Rojas Medina", ci_numero: "V-18.901.234", fecha_nacimiento: "1990-11-05", correo: "grojas@hacienda.ve", telefono: "+58-412-9012345", genero: "Femenino", ex_presidente: false },
  { id: 7, nombre: "Ricardo Alfredo Montoya LÃ³pez", ci_numero: "V-9.123.456", fecha_nacimiento: "1963-06-20", correo: "rmontoya@hacienda.ve", telefono: "+58-414-0123456", genero: "Masculino", ex_presidente: true },
  { id: 8, nombre: "Pedro Antonio GarcÃ­a HernÃ¡ndez", ci_numero: "V-14.678.901", fecha_nacimiento: "1985-02-14", correo: "pgarcia@progreso.ve", telefono: "+58-416-1234567", genero: "Masculino", ex_presidente: false },
  { id: 9, nombre: "SofÃ­a Alejandra Ruiz Torres", ci_numero: "V-20.345.678", fecha_nacimiento: "1995-08-28", correo: "sruiz@progreso.ve", telefono: "+58-424-2345670", genero: "Femenino", ex_presidente: false },
  { id: 10, nombre: "RamÃ³n Eduardo Castellanos Vega", ci_numero: "V-5.890.123", fecha_nacimiento: "1948-01-12", correo: "rcastellanos@rioverde.ve", telefono: "+58-426-4567890", genero: "Masculino", ex_presidente: true },
  { id: 11, nombre: "Ana Cristina Espinoza Delgado", ci_numero: "V-11.234.567", fecha_nacimiento: "1973-05-17", correo: "aespinoza@rioverde.ve", telefono: "+58-412-5678901", genero: "Femenino", ex_presidente: false },
  { id: 12, nombre: "Miguel Ãngel Fuentes DÃ­az", ci_numero: "V-16.789.012", fecha_nacimiento: "1988-10-09", correo: "mfuentes@rioverde.ve", telefono: "+58-414-6789012", genero: "Masculino", ex_presidente: false },
  { id: 13, nombre: "Carmen LucÃ­a BermÃºdez Soto", ci_numero: "V-13.456.789", fecha_nacimiento: "1980-04-22", correo: "cbermudez@esperanza.ve", telefono: "+58-416-7890123", genero: "Femenino", ex_presidente: false },
  { id: 14, nombre: "Luis Alberto Pacheco Moreno", ci_numero: "V-7.012.345", fecha_nacimiento: "1958-08-07", correo: "lpacheco@esperanza.ve", telefono: "+58-424-8901234", genero: "Masculino", ex_presidente: false },
  { id: 15, nombre: "Roberto JesÃºs Alvarado Pinto", ci_numero: "V-4.567.890", fecha_nacimiento: "1944-03-25", correo: "ralvarado@losandes.ve", telefono: "+58-426-9012345", genero: "Masculino", ex_presidente: true },
  { id: 16, nombre: "Isabel Margarita Colmenares RÃ­os", ci_numero: "V-19.123.456", fecha_nacimiento: "1992-12-14", correo: "icolmenares@losandes.ve", telefono: "+58-412-0123456", genero: "Femenino", ex_presidente: false },
  { id: 17, nombre: "Francisco JosÃ© Quintero Navarro", ci_numero: "V-17.456.789", fecha_nacimiento: "1989-07-03", correo: "fquintero@elvalle.ve", telefono: "+58-414-1234567", genero: "Masculino", ex_presidente: false },
];

export const vinculaciones: Vinculacion[] = [
  { id_miembro: 1, id_persona: 1, representante: true, director: true, accionista: true, presidente: true },
  { id_miembro: 1, id_persona: 2, representante: false, director: true, accionista: true, presidente: false },
  { id_miembro: 1, id_persona: 3, representante: false, director: false, accionista: true, presidente: false },
  { id_miembro: 2, id_persona: 4, representante: true, director: true, accionista: true, presidente: true },
  { id_miembro: 2, id_persona: 5, representante: false, director: true, accionista: false, presidente: false },
  { id_miembro: 3, id_persona: 6, representante: true, director: true, accionista: true, presidente: true },
  { id_miembro: 3, id_persona: 7, representante: false, director: false, accionista: true, presidente: false },
  { id_miembro: 4, id_persona: 8, representante: true, director: true, accionista: true, presidente: true },
  { id_miembro: 4, id_persona: 9, representante: false, director: false, accionista: true, presidente: false },
  { id_miembro: 5, id_persona: 10, representante: false, director: false, accionista: true, presidente: false },
  { id_miembro: 5, id_persona: 11, representante: true, director: true, accionista: true, presidente: true },
  { id_miembro: 5, id_persona: 12, representante: false, director: true, accionista: false, presidente: false },
  { id_miembro: 6, id_persona: 13, representante: true, director: true, accionista: true, presidente: true },
  { id_miembro: 6, id_persona: 14, representante: false, director: true, accionista: true, presidente: false },
  { id_miembro: 7, id_persona: 15, representante: false, director: false, accionista: true, presidente: false },
  { id_miembro: 7, id_persona: 16, representante: true, director: true, accionista: false, presidente: true },
  { id_miembro: 8, id_persona: 17, representante: true, director: true, accionista: true, presidente: true },
];

export const facturas: Factura[] = [
    {
        "id": 1,
        "id_miembro": 260,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 2,
        "id_miembro": 83,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 3,
        "id_miembro": 99,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 4,
        "id_miembro": 102,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 5,
        "id_miembro": 119,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 6,
        "id_miembro": 268,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 7,
        "id_miembro": 127,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 8,
        "id_miembro": 327,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 9,
        "id_miembro": 252,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 10,
        "id_miembro": 324,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 11,
        "id_miembro": 266,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 12,
        "id_miembro": 214,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 13,
        "id_miembro": 261,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 14,
        "id_miembro": 5,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 15,
        "id_miembro": 35,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 16,
        "id_miembro": 16,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 17,
        "id_miembro": 103,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 18,
        "id_miembro": 62,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 19,
        "id_miembro": 94,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 20,
        "id_miembro": 123,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 21,
        "id_miembro": 12,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 22,
        "id_miembro": 25,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 23,
        "id_miembro": 388,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 24,
        "id_miembro": 81,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 25,
        "id_miembro": 4,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 26,
        "id_miembro": 23,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 27,
        "id_miembro": 43,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 28,
        "id_miembro": 54,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 29,
        "id_miembro": 242,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 30,
        "id_miembro": 224,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 31,
        "id_miembro": 217,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 32,
        "id_miembro": 236,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 33,
        "id_miembro": 88,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 34,
        "id_miembro": 284,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 35,
        "id_miembro": 46,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 36,
        "id_miembro": 399,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 37,
        "id_miembro": 289,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 38,
        "id_miembro": 269,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 39,
        "id_miembro": 299,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 40,
        "id_miembro": 206,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 41,
        "id_miembro": 75,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 42,
        "id_miembro": 285,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 43,
        "id_miembro": 181,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 44,
        "id_miembro": 272,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 45,
        "id_miembro": 61,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 46,
        "id_miembro": 65,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 47,
        "id_miembro": 363,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 48,
        "id_miembro": 106,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 49,
        "id_miembro": 30,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 50,
        "id_miembro": 52,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 51,
        "id_miembro": 310,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 52,
        "id_miembro": 376,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 53,
        "id_miembro": 368,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 54,
        "id_miembro": 233,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 55,
        "id_miembro": 198,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 56,
        "id_miembro": 152,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 57,
        "id_miembro": 414,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 58,
        "id_miembro": 377,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 59,
        "id_miembro": 71,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 60,
        "id_miembro": 334,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 61,
        "id_miembro": 89,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 62,
        "id_miembro": 159,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 63,
        "id_miembro": 253,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 64,
        "id_miembro": 301,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 65,
        "id_miembro": 329,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 66,
        "id_miembro": 291,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 67,
        "id_miembro": 387,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 68,
        "id_miembro": 8,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 69,
        "id_miembro": 31,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 70,
        "id_miembro": 174,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 71,
        "id_miembro": 37,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 72,
        "id_miembro": 328,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 73,
        "id_miembro": 142,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 74,
        "id_miembro": 160,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 75,
        "id_miembro": 411,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 76,
        "id_miembro": 413,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 77,
        "id_miembro": 262,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 78,
        "id_miembro": 69,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 79,
        "id_miembro": 396,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 80,
        "id_miembro": 1,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 81,
        "id_miembro": 271,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 82,
        "id_miembro": 98,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 83,
        "id_miembro": 390,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 84,
        "id_miembro": 393,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 85,
        "id_miembro": 137,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 86,
        "id_miembro": 185,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 87,
        "id_miembro": 255,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 88,
        "id_miembro": 407,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 89,
        "id_miembro": 171,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 90,
        "id_miembro": 57,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 91,
        "id_miembro": 378,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 92,
        "id_miembro": 141,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 93,
        "id_miembro": 278,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 94,
        "id_miembro": 124,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 95,
        "id_miembro": 385,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 96,
        "id_miembro": 228,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 97,
        "id_miembro": 421,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 98,
        "id_miembro": 371,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 99,
        "id_miembro": 405,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 100,
        "id_miembro": 9,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 101,
        "id_miembro": 203,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 102,
        "id_miembro": 309,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 103,
        "id_miembro": 202,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 104,
        "id_miembro": 221,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 105,
        "id_miembro": 379,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 106,
        "id_miembro": 199,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 107,
        "id_miembro": 402,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 108,
        "id_miembro": 423,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 109,
        "id_miembro": 389,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 110,
        "id_miembro": 412,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 111,
        "id_miembro": 404,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 112,
        "id_miembro": 125,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 113,
        "id_miembro": 403,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 114,
        "id_miembro": 422,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    },
    {
        "id": 115,
        "id_miembro": 408,
        "fecha": "2026-06-17",
        "mes_cuota": "2026-06-01",
        "pendiente": 25.00
    }
];

export const pagos: Pago[] = [
    {
        "id": 1,
        "fecha": "2026-03-06",
        "monto": 25.00,
        "monto_bs": 15500.00,
        "tasa_cambio": 550.00,
        "metodo_pago": "Zelle",
        "factura_ugavi": 109881,
        "factura_fondo": 112212,
        "referencia": "brlmoijenaijemk",
        "estado": "Vigente"
    }
];

export const vinculacion_pagos: VinculacionPago[] = [];


export const TIPOS_MIEMBRO: TipoMiembro[] = ["Juridico", "Natural"];
export const ESTADOS_SOLVENCIA: EstadoSolvencia[] = ["Solvente", "Insolvente"];
export const TIPOS_EXPLOTACION: TipoExplotacion[] = ["Leche", "Carne", "Leche y Carne"];
export const GENEROS: GeneroPersona[] = ["Femenino", "Masculino"];


