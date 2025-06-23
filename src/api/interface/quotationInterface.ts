/**
 * Interfaz para la respuesta de una cotización por su ID
 */
export interface QuotationResponseIdInterface {
  id: string;
  correlative: string;
  statusResponseQuotation: string;
  summaryByServiceType: SumaryByServiceTypeInterface[];
  user: {
    id: string;
    name: string;
    email: string;
  };
  products: ProductoResponseIdInterface[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfaz para el resumen por tipo de servicio
 */
export interface SumaryByServiceTypeInterface{
  service_type: string;
  total_price: number;
  express_price: number;
  service_fee: number;
  taxes: number;
}

/**
 * Interfaz para el producto de la cotización
 */
export interface ProductoResponseIdInterface {
  id: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  url: string;
  comment: string;
  weight: string;
  volume: string;
  number_of_boxes: number;
  attachments: string[];
  statusResponseProduct: string | null;
  sendResponse: boolean;
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
  id: string;
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
