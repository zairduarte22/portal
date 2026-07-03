export type TipoMiembro = "Activo" | "Pasivo" | "Honorario" | "Fundador";
export type EstadoSolvencia = "Solvente" | "Insolvente" | "En_Mora" | "Exonerado";
export type TipoExplotacion = "Ganadería" | "Agricultura" | "Mixta" | "Avicultura" | "Porcicultura" | "Lechería";
export type GeneroPersona = "Masculino" | "Femenino" | "Otro";

export interface Persona {
  id: number;
  nombre: string;
  ci_numero: string;
  fecha_nacimiento: string;
  correo: string;
  telefono: string;
  genero: GeneroPersona;
  ex_presidente: boolean;
  id_miembro: number;
}

export interface Vinculacion {
  id_miembro: number;
  id_persona: number;
  representante: boolean;
  director: boolean;
  accionista: boolean;
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
  correo: string;
  telefono: string;
  tipo_explotacion: TipoExplotacion;
  tractores: number;
  plantas_electricas: number;
  convenio: boolean;
  carnets_disponibles: number;
  cupo_gasoil: boolean;
  distribuidor_diesel: string;
  cantidad_animales: number;
  produccion_leche_diaria: number;
  municipio: string;
  parroquia: string;
}

export const miembros: Miembro[] = [
  {
    id: 1,
    razon_social: "Agropecuaria Los Llanos C.A.",
    acronimo: "AGROLL",
    rif: "J-30145678-9",
    fecha_ingreso: "2015-03-12",
    tipo: "Activo",
    direccion: "Carretera Nacional, Km 45, Barinas",
    hacienda: "Hato San Pedro",
    hectareas: 850.5,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "contacto@agroll.com.ve",
    telefono: "+58-273-4561234",
    tipo_explotacion: "Ganadería",
    tractores: 4,
    plantas_electricas: 2,
    convenio: true,
    carnets_disponibles: 12,
    cupo_gasoil: true,
    distribuidor_diesel: "PDVSA Barinas",
    cantidad_animales: 620,
    produccion_leche_diaria: 1850,
    municipio: "Barinas",
    parroquia: "Corazón de Jesús",
  },
  {
    id: 2,
    razon_social: "Finca El Palmar S.A.",
    acronimo: "FELPAL",
    rif: "J-29876543-1",
    fecha_ingreso: "2018-07-22",
    tipo: "Activo",
    direccion: "Sector Palmar, Apure",
    hacienda: "El Palmar",
    hectareas: 420.0,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "elpalmar@gmail.com",
    telefono: "+58-247-3210987",
    tipo_explotacion: "Lechería",
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
    tipo: "Activo",
    direccion: "Vía La Fría, Mérida",
    hacienda: "Santa Rosa",
    hectareas: 275.75,
    solvencia: "En_Mora",
    saldo_pendiente: 145000,
    ultimo_mes: "2024-02-01",
    correo: "santarosa@hacienda.ve",
    telefono: "+58-274-5678901",
    tipo_explotacion: "Mixta",
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
    razon_social: "Granja Avícola El Progreso C.A.",
    acronimo: "GRAEPRO",
    rif: "J-38765432-0",
    fecha_ingreso: "2019-09-08",
    tipo: "Activo",
    direccion: "Zona Industrial, Maracay",
    hacienda: "El Progreso",
    hectareas: 120.0,
    solvencia: "Insolvente",
    saldo_pendiente: 380000,
    ultimo_mes: "2023-11-01",
    correo: "granja.progreso@ve.com",
    telefono: "+58-243-4567890",
    tipo_explotacion: "Avicultura",
    tractores: 0,
    plantas_electricas: 3,
    convenio: false,
    carnets_disponibles: 3,
    cupo_gasoil: false,
    distribuidor_diesel: "",
    cantidad_animales: 45000,
    produccion_leche_diaria: 0,
    municipio: "Girardot",
    parroquia: "El Limón",
  },
  {
    id: 5,
    razon_social: "Agropecuaria Río Verde C.A.",
    acronimo: "AGRIRV",
    rif: "J-31234567-8",
    fecha_ingreso: "2016-11-30",
    tipo: "Fundador",
    direccion: "Carretera Portuguesa, Km 12",
    hacienda: "Hato Río Verde",
    hectareas: 1250.0,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "rioverde@agropecuaria.ve",
    telefono: "+58-255-3456789",
    tipo_explotacion: "Ganadería",
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
    tipo: "Activo",
    direccion: "Sector Las Matas, Cojedes",
    hacienda: "La Esperanza",
    hectareas: 530.25,
    solvencia: "Solvente",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "esperanza@finca.com.ve",
    telefono: "+58-258-2345678",
    tipo_explotacion: "Mixta",
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
    tipo: "Honorario",
    direccion: "La Grita, Táchira",
    hacienda: "Finca Los Andes",
    hectareas: 340.0,
    solvencia: "Exonerado",
    saldo_pendiente: 0,
    ultimo_mes: "2024-05-01",
    correo: "losandes.coop@gmail.com",
    telefono: "+58-276-4890123",
    tipo_explotacion: "Agricultura",
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
    tipo: "Activo",
    direccion: "Valles del Tuy, Miranda",
    hacienda: "El Valle",
    hectareas: 85.5,
    solvencia: "En_Mora",
    saldo_pendiente: 72000,
    ultimo_mes: "2024-03-01",
    correo: "porcicultura.elvalle@ve.com",
    telefono: "+58-239-5678901",
    tipo_explotacion: "Porcicultura",
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
  { id: 1, nombre: "Carlos Alberto Mendoza Ríos", ci_numero: "V-8.234.567", fecha_nacimiento: "1968-04-15", correo: "cmendoza@agroll.com.ve", telefono: "+58-412-3456789", genero: "Masculino", ex_presidente: false, id_miembro: 1 },
  { id: 2, nombre: "María Eugenia Salazar Pérez", ci_numero: "V-10.456.789", fecha_nacimiento: "1975-09-22", correo: "msalazar@agroll.com.ve", telefono: "+58-414-5678901", genero: "Femenino", ex_presidente: false, id_miembro: 1 },
  { id: 3, nombre: "José Ramón Torrealba Guzmán", ci_numero: "V-6.789.012", fecha_nacimiento: "1955-12-03", correo: "jtorrealba@agroll.com.ve", telefono: "+58-416-7890123", genero: "Masculino", ex_presidente: true, id_miembro: 1 },
  { id: 4, nombre: "Luisa Fernanda Viloria Castro", ci_numero: "V-15.234.890", fecha_nacimiento: "1982-07-18", correo: "lviloria@elpalmar.ve", telefono: "+58-424-2345678", genero: "Femenino", ex_presidente: false, id_miembro: 2 },
  { id: 5, nombre: "Andrés Felipe Contreras Blanco", ci_numero: "V-12.567.321", fecha_nacimiento: "1979-03-30", correo: "acontreras@elpalmar.ve", telefono: "+58-426-3456789", genero: "Masculino", ex_presidente: false, id_miembro: 2 },
  { id: 6, nombre: "Gloria Patricia Rojas Medina", ci_numero: "V-18.901.234", fecha_nacimiento: "1990-11-05", correo: "grojas@hacienda.ve", telefono: "+58-412-9012345", genero: "Femenino", ex_presidente: false, id_miembro: 3 },
  { id: 7, nombre: "Ricardo Alfredo Montoya López", ci_numero: "V-9.123.456", fecha_nacimiento: "1963-06-20", correo: "rmontoya@hacienda.ve", telefono: "+58-414-0123456", genero: "Masculino", ex_presidente: true, id_miembro: 3 },
  { id: 8, nombre: "Pedro Antonio García Hernández", ci_numero: "V-14.678.901", fecha_nacimiento: "1985-02-14", correo: "pgarcia@progreso.ve", telefono: "+58-416-1234567", genero: "Masculino", ex_presidente: false, id_miembro: 4 },
  { id: 9, nombre: "Sofía Alejandra Ruiz Torres", ci_numero: "V-20.345.678", fecha_nacimiento: "1995-08-28", correo: "sruiz@progreso.ve", telefono: "+58-424-2345670", genero: "Femenino", ex_presidente: false, id_miembro: 4 },
  { id: 10, nombre: "Ramón Eduardo Castellanos Vega", ci_numero: "V-5.890.123", fecha_nacimiento: "1948-01-12", correo: "rcastellanos@rioverde.ve", telefono: "+58-426-4567890", genero: "Masculino", ex_presidente: true, id_miembro: 5 },
  { id: 11, nombre: "Ana Cristina Espinoza Delgado", ci_numero: "V-11.234.567", fecha_nacimiento: "1973-05-17", correo: "aespinoza@rioverde.ve", telefono: "+58-412-5678901", genero: "Femenino", ex_presidente: false, id_miembro: 5 },
  { id: 12, nombre: "Miguel Ángel Fuentes Díaz", ci_numero: "V-16.789.012", fecha_nacimiento: "1988-10-09", correo: "mfuentes@rioverde.ve", telefono: "+58-414-6789012", genero: "Masculino", ex_presidente: false, id_miembro: 5 },
  { id: 13, nombre: "Carmen Lucía Bermúdez Soto", ci_numero: "V-13.456.789", fecha_nacimiento: "1980-04-22", correo: "cbermudez@esperanza.ve", telefono: "+58-416-7890123", genero: "Femenino", ex_presidente: false, id_miembro: 6 },
  { id: 14, nombre: "Luis Alberto Pacheco Moreno", ci_numero: "V-7.012.345", fecha_nacimiento: "1958-08-07", correo: "lpacheco@esperanza.ve", telefono: "+58-424-8901234", genero: "Masculino", ex_presidente: false, id_miembro: 6 },
  { id: 15, nombre: "Roberto Jesús Alvarado Pinto", ci_numero: "V-4.567.890", fecha_nacimiento: "1944-03-25", correo: "ralvarado@losandes.ve", telefono: "+58-426-9012345", genero: "Masculino", ex_presidente: true, id_miembro: 7 },
  { id: 16, nombre: "Isabel Margarita Colmenares Ríos", ci_numero: "V-19.123.456", fecha_nacimiento: "1992-12-14", correo: "icolmenares@losandes.ve", telefono: "+58-412-0123456", genero: "Femenino", ex_presidente: false, id_miembro: 7 },
  { id: 17, nombre: "Francisco José Quintero Navarro", ci_numero: "V-17.456.789", fecha_nacimiento: "1989-07-03", correo: "fquintero@elvalle.ve", telefono: "+58-414-1234567", genero: "Masculino", ex_presidente: false, id_miembro: 8 },
];

export const vinculaciones: Vinculacion[] = [
  { id_miembro: 1, id_persona: 1, representante: true, director: true, accionista: true },
  { id_miembro: 1, id_persona: 2, representante: false, director: true, accionista: true },
  { id_miembro: 1, id_persona: 3, representante: false, director: false, accionista: true },
  { id_miembro: 2, id_persona: 4, representante: true, director: true, accionista: true },
  { id_miembro: 2, id_persona: 5, representante: false, director: true, accionista: false },
  { id_miembro: 3, id_persona: 6, representante: true, director: true, accionista: true },
  { id_miembro: 3, id_persona: 7, representante: false, director: false, accionista: true },
  { id_miembro: 4, id_persona: 8, representante: true, director: true, accionista: true },
  { id_miembro: 4, id_persona: 9, representante: false, director: false, accionista: true },
  { id_miembro: 5, id_persona: 10, representante: false, director: false, accionista: true },
  { id_miembro: 5, id_persona: 11, representante: true, director: true, accionista: true },
  { id_miembro: 5, id_persona: 12, representante: false, director: true, accionista: false },
  { id_miembro: 6, id_persona: 13, representante: true, director: true, accionista: true },
  { id_miembro: 6, id_persona: 14, representante: false, director: true, accionista: true },
  { id_miembro: 7, id_persona: 15, representante: false, director: false, accionista: true },
  { id_miembro: 7, id_persona: 16, representante: true, director: true, accionista: false },
  { id_miembro: 8, id_persona: 17, representante: true, director: true, accionista: true },
];

export const TIPOS_MIEMBRO: TipoMiembro[] = ["Activo", "Pasivo", "Honorario", "Fundador"];
export const ESTADOS_SOLVENCIA: EstadoSolvencia[] = ["Solvente", "Insolvente", "En_Mora", "Exonerado"];
export const TIPOS_EXPLOTACION: TipoExplotacion[] = ["Ganadería", "Agricultura", "Mixta", "Avicultura", "Porcicultura", "Lechería"];
export const GENEROS: GeneroPersona[] = ["Masculino", "Femenino", "Otro"];
