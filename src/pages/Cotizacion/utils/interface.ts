// Tipos para producto y formulario
export interface Producto {
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
  attachments: string[]; // URLs de los archivos (para envío final)
  files: File[]; // Archivos originales (para mostrar preview y subir después)
  
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


