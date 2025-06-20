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
  user: User;
  productQuantity: number;
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
  comment: string;
  weight: string;
  volume: string;
  number_of_boxes: number;
  attachments: string[];
  responses: any[];
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