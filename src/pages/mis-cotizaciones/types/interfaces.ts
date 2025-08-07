// Interfaces para Mis Cotizaciones

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface QuotationListItem {
  id: string;
  correlative: string;
  status: string;
  service_type: string;
  quantityProducts: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationListResponse {
  content: QuotationListItem[];
  pageNumber: string;
  pageSize: string;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductDetail {
  id: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  url: string;
  statusResponseProduct: string;
  sendResponse: boolean;
  comment: string;
  weight: string;
  volume: string;
  number_of_boxes: number;
  attachments: string[];
}

export interface StatusHistory {
  id: string;
  status: string;
  observations: any[];
  timestamp: string;
}

export interface QuotationDetail {
  id: string;
  correlative: string;
  user: User;
  products: ProductDetail[];
  status: string;
  service_type: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface QuotationResponse {
  id: string;
  quotation: any;
  product: any;
  status: string;
  unit_price: number;
  incoterms: string;
  total_price: number;
  express_price: number;
  logistics_service: string;
  service_fee: number;
  taxes: number;
  recommendations: string;
  additional_comments: string;
  files: string[];
  response_date: string;
  created_at: string;
  updated_at: string;
} 