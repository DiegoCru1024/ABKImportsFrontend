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
  files: string[]; // URLs de AWS
}
