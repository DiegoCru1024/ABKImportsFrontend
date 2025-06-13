// Tipos para producto y formulario
export interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  tamano: string;
  color: string;
  url: string;
  comentario: string;
  tipoServicio: string;
  peso: number;
  volumen: number;
  nro_cajas: number;
  archivos: File[];
}

export interface Quotation {
  products: {
      name: string;
      quantity: number;
      size: string;
      color: string;
      url: string;
      comment: string;
      service_type: string;
      weight: number;
      volume: number;
      number_of_boxes: number;
      attachments: string[];
  }[];
}


