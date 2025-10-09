/**
 * Interfaz para la respuesta de una cotización por su ID
 */
export interface QuotationResponseIdInterface {
  quotationId: string;
  correlative: string;
  status: string;
  service_type: string;
  products: ProductoResponseIdInterface[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfaz para el producto de la cotización
 */
export interface ProductoResponseIdInterface {
  productId: string;
  name: string;
  url: string;
  comment: string;
  quantityTotal: number;
  weight: string;
  volume: string;
  number_of_boxes: number;
  variants: VariantResponseIdInterface[];
  attachments: string[];
  adminComment?: string;
}

export interface VariantResponseIdInterface {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
}

/**
 * Interfaz para la respuesta de las cotizaciones por el usuario
 */
export interface QuotationsByUserResponseInterface {
  content: QuotationsByUserResponseInterfaceContent[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Interfaz para el contenido de las cotizaciones por el usuario
 */
export interface QuotationsByUserResponseInterfaceContent {
  quotationId: string;
  correlative: string;
  status: string;
  service_type: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  productQuantity: number;
  createdAt: string;
  updatedAt: string;
}
