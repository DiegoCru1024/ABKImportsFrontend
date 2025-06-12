export interface Solicitud {
  id: string;
  cliente: string;
  fecha: string;
}

export interface ProductoItem {
  id: string;
  nombre: string;
  comentarioCliente: string;
  cliente: string;
  cantidad: number;
  especificaciones: string;
  estadoRespuesta: "No respondido" | "Respondido" | "Observado";
  precioUnitario: number;
  recomendaciones: string;
  comentariosAdicionales: string;
  archivos: File[];
  fecha: string;
  url: string;
}

// Estado para respuestas de cotización
export interface QuotationResponse {
  id: string;
  pUnitario: string;
  incoterms: string;
  precioTotal: string;
  precioExpress: string;
  servicioLogistico: string;
  tarifaServicio: string;
  impuestos: string;
  recomendaciones: string;
  comentariosAdicionales: string;
  archivos: File[];
}
