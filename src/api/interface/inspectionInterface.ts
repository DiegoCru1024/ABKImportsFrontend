
export interface Inspection {
  id: string;
  correlative: string;
  quotation_id: string;
  name: string;
  shipping_service_type: string;
  logistics_service: string;
  status: string;
  total_price: string;
}

export interface InspectionResponse {
  content: Inspection[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface InspectionProduct {
  product_id: string;
  name: string;
  quantity: number;
  express_price: string;
  status: string;
  files: string[];
}

export interface InspectionDetail {
  id: string;
  shipping_service_type: string;
  logistics_service: string;
  updated_at: string;
  content: InspectionProduct[];
  total_price: string;
}

