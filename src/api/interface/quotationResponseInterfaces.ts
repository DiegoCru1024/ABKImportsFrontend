export interface QuotationResponseRequest {
  statusResponseProduct: string;
  sendResponse: boolean;
  responses: QuotationResponse[];
}

export interface QuotationResponse {
  logistics_service: string;
  unit_price: number;
  incoterms: string;
  total_price: number;
  express_price: number;
  service_fee: number;
  taxes: number;
  recommendations: string;
  additional_comments: string;
  weight: number | null;
  volume: number | null;
  number_of_boxes: number | null;
  international_freight: number | null;
  customs_clearance: number | null;
  delivery: number | null;
  other_expenses: number | null;
  files: string[]; // URLs de AWS
}


export interface getAllResponsesForSpecificProductoInQuotationResponse {
  product: ProductBasicInfo;
responses: Responses[];
}

export interface ProductBasicInfo {
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
statusResponseProduct: string;
sendResponse: boolean;
}


export interface Responses {
  logistics_service: string;
  unit_price: number;
  incoterms: string;
  total_price: number;
  express_price: number;
  service_fee: number;
  taxes: number;
  recommendations: string;
  additional_comments: string;
  files: string[];
}