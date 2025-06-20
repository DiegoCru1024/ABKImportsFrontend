import type { Cotizacion } from "./interface";

// Datos de ejemplo
export const cotizaciones: Cotizacion[] = [
  {
    id: "1",
    estado: "Pendiente",
    fecha: new Date("2025-05-12T10:30:00"),
    tipoServicio: "Servicio de transporte",
  },
  {
    id: "2",
    estado: "Revisado",
    fecha: new Date("2025-05-15T10:30:00"),
    tipoServicio: "Servicio de transporte",
  },
  {
    id: "3",
    estado: "Completado",
    fecha: new Date("2025-05-12T10:30:00"),
    tipoServicio: "Servicio de transporte",
  },
  {
    id: "4",
    estado: "Observado",
    fecha: new Date("2025-05-15T10:30:00"),
    tipoServicio: "Servicio de transporte",
  },
  {
    id: "5",
    estado: "Cancelado",
    fecha: new Date("2025-05-15T10:30:00"),
    tipoServicio: "Servicio de transporte",
  },
];
