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
  attachments: string[];
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


