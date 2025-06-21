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

export interface QuotationResponseRequest {
  status: string;
  responses: {
    unit_price: number;
    incoterms: string;
    total_price: number;
    express_price: number;
    logistics_service: string;
    service_fee: number;
    taxes: number;
    recommendations: string;
    additional_comments: string;
    files: string[]; // URLs de AWS
  }[];
}

export interface AdminQuotationResponse {
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
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  type: "admin" | "user"; // Asumí que puede ser solo admin o user, puedes añadir otros tipos si es necesario
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  url: string;
  comment: string;
  service_type: string;
  weight: string;
  volume: string;
  number_of_boxes: number;
  attachments: string[]; // Array de URLs
}

export interface StatusHistory {
  id: string;
  status: string;
  observations: string[]; // Asumí que es un array de observaciones
  timestamp: string; // Fecha ISO
}

export interface QuotationById {
  id: string;
  user: User;
  products: Product[];
  status: string;
  statusHistory: StatusHistory[];
  createdAt: string; // Fecha ISO
  updatedAt: string; // Fecha ISO
}
