// Tipos para variantes de productos
export interface ProductVariantDTO {
  id: string; // ID temporal para gestión local en el formulario (no se envía al backend)
  variantId?: string; // ID del backend: si existe, se actualiza; si no, se crea
  size?: string;
  presentation?: string;
  model?: string;
  color?: string;
  quantity: number;
}

// Tipos para producto con variantes
export interface ProductWithVariantsDTO {
  productId?: string; // Opcional: si existe, se actualiza; si no, se crea
  name: string;
  url?: string;
  comment?: string;
  weight?: number;
  volume?: number;
  number_of_boxes?: number;
  variants: ProductVariantDTO[];
  attachments: string[]; // URLs de los archivos (para envío final)
  files?: File[]; // Archivos originales (para mostrar preview y subir después)
}

// Interface para el DTO de cotización que se envía al backend
export interface QuotationDTO {
  service_type: string;
  products: {
    productId?: string; // Opcional: si existe, se actualiza; si no, se crea
    name: string;
    url?: string;
    comment?: string;
    weight?: number;
    volume?: number;
    number_of_boxes?: number;
    variants: {
      id: string;
      variantId?: string; // Opcional: si existe, se actualiza; si no, se crea
      size?: string;
      presentation?: string;
      model?: string;
      color?: string;
      quantity: number;
    }[];
    attachments: string[];
  }[];
  saveAsDraft?: boolean;
}

// Tipos para compatibilidad con el código existente (deprecated)
export interface Producto {
  name: string;
  quantity: number;
  size: string;
  color: string;
  url: string;
  comment: string;
  weight: number;
  volume: number;
  number_of_boxes: number;
  attachments: string[];
  files: File[];
}

// Tipo principal para cotización (con variantes)
export interface Quotation {
  service_type: string;
  products: {
    productId?: string; // Opcional: si existe, se actualiza; si no, se crea
    name: string;
    url?: string;
    comment?: string;
    weight?: number;
    volume?: number;
    number_of_boxes?: number;
    variants: {
      variantId?: string|null; // Opcional: si existe, se actualiza; si no, se crea
      size?: string;
      presentation?: string;
      model?: string;
      color?: string;
      quantity: number;
    }[];
    attachments: string[];
  }[];
  saveAsDraft?: boolean;
}

// Tipo legacy para compatibilidad (deprecated)
export interface QuotationLegacy {
  service_type: string;
  products: {
      name: string;
      quantity: number;
      size: string;
      color: string;
      url: string;
      comment: string;
      weight: number;
      volume: number;
      number_of_boxes: number;
      attachments: string[];
  }[];
  saveAsDraft?: boolean;
}


