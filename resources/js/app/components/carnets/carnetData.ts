export type EstadoPago = "Aprobado" | "Pendiente" | "Rechazado";
export type MetodoPago = "Transferencia / Pago Móvil" | "Zelle" | "Efectivo $" | "Efectivo Bs";
export type EstadoCarnet = "Activo" | "Vencido" | "Anulado";

export interface PagoCredito {
  id: number;
  id_miembro: number;
  fecha: string;
  monto_usd: number;
  monto_bs: number;
  tasa: number;
  creditos: number;
  estado: EstadoPago;
  metodo_pago: MetodoPago;
  referencia: string;
}

export interface CarnetEmitido {
  id: number;
  id_persona: number;
  id_miembro: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: EstadoCarnet;
  numero_carnet: string;
}

export const pagosCredito: PagoCredito[] = [
  {
    id: 1, id_miembro: 1, fecha: "2024-05-14", monto_usd: 250, monto_bs: 9125,
    tasa: 36.5, creditos: 5, estado: "Aprobado", metodo_pago: "Zelle", referencia: "ZLL-20240514-001",
  },
  {
    id: 2, id_miembro: 5, fecha: "2024-05-10", monto_usd: 500, monto_bs: 18250,
    tasa: 36.5, creditos: 10, estado: "Aprobado", metodo_pago: "Transferencia / Pago Móvil", referencia: "TRF-20240510-009",
  },
  {
    id: 3, id_miembro: 2, fecha: "2024-05-08", monto_usd: 150, monto_bs: 5475,
    tasa: 36.5, creditos: 3, estado: "Pendiente", metodo_pago: "Transferencia / Pago Móvil", referencia: "PM-20240508-022",
  },
  {
    id: 4, id_miembro: 6, fecha: "2024-05-03", monto_usd: 200, monto_bs: 7300,
    tasa: 36.5, creditos: 4, estado: "Aprobado", metodo_pago: "Efectivo $", referencia: "EFD-20240503-005",
  },
  {
    id: 5, id_miembro: 3, fecha: "2024-04-28", monto_usd: 100, monto_bs: 3650,
    tasa: 36.5, creditos: 2, estado: "Pendiente", metodo_pago: "Transferencia / Pago Móvil", referencia: "TRF-20240428-014",
  },
  {
    id: 6, id_miembro: 7, fecha: "2024-04-20", monto_usd: 350, monto_bs: 12775,
    tasa: 36.5, creditos: 7, estado: "Aprobado", metodo_pago: "Zelle", referencia: "ZLL-20240420-003",
  },
];

export const carnetsMock: CarnetEmitido[] = [
  {
    id: 1, id_persona: 1, id_miembro: 1,
    fecha_emision: "2024-05-15", fecha_vencimiento: "2025-05-15",
    estado: "Activo", numero_carnet: "AGC-2024-001",
  },
  {
    id: 2, id_persona: 2, id_miembro: 1,
    fecha_emision: "2024-05-15", fecha_vencimiento: "2025-05-15",
    estado: "Activo", numero_carnet: "AGC-2024-002",
  },
  {
    id: 3, id_persona: 4, id_miembro: 2,
    fecha_emision: "2024-05-11", fecha_vencimiento: "2025-05-11",
    estado: "Activo", numero_carnet: "AGC-2024-003",
  },
  {
    id: 4, id_persona: 11, id_miembro: 5,
    fecha_emision: "2024-05-10", fecha_vencimiento: "2025-05-10",
    estado: "Activo", numero_carnet: "AGC-2024-004",
  },
  {
    id: 5, id_persona: 12, id_miembro: 5,
    fecha_emision: "2024-05-10", fecha_vencimiento: "2025-05-10",
    estado: "Activo", numero_carnet: "AGC-2024-005",
  },
  {
    id: 6, id_persona: 13, id_miembro: 6,
    fecha_emision: "2024-05-04", fecha_vencimiento: "2025-05-04",
    estado: "Activo", numero_carnet: "AGC-2024-006",
  },
  {
    id: 7, id_persona: 15, id_miembro: 7,
    fecha_emision: "2024-04-21", fecha_vencimiento: "2025-04-21",
    estado: "Activo", numero_carnet: "AGC-2024-007",
  },
];

export const METODOS_PAGO: MetodoPago[] = ["Transferencia / Pago Móvil", "Zelle", "Efectivo $", "Efectivo Bs"];
export const PRECIO_POR_CREDITO_USD = 5;
