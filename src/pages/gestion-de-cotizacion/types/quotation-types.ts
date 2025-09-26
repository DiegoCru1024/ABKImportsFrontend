// UI-specific types - keep only what's needed for forms and UI
export interface FilterOption {
  value: string;
  label: string;
}

export interface QuotationProduct {
  productId: string;
  name: string;
  quantity: number;
  size?: string;
  color?: string;
  url?: string;
  comment?: string;
  attachments?: string[];
  weight?: string;
  volume?: string;
  variants?: QuotationProductVariant[];
}

export interface QuotationProductVariant {
  id: string;
  variantId: string;
  name?: string;
  model?: string;
  size?: string;
  color?: string;
  presentation?: string;
  quantity: number;
  price: number;
  express: number;
  unitCost?: number;
  importCosts?: number;
}

export interface QuotationUser {
  id: string;
  name: string;
  email: string;
}

export interface QuotationDetail {
  quotationId: string;
  correlative: string;
  status: string;
  user: QuotationUser;
  products: QuotationProduct[];
  createdAt: string;
  updatedAt: string;
}

// NOTE: DynamicValues, ExemptionState, and QuotationResponseDTO interfaces
// have been removed - use official API interfaces from:
// @/api/interface/quotation-response/dto/complete/objects/dynamic-values
// @/api/interface/quotation-response/dto/complete/objects/exemptions
// @/api/interface/quotation-response/quotation-response-base