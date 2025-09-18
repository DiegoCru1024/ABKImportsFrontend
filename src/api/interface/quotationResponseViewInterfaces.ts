export interface QuotationResponseViewUser {
  id: string;
  name: string;
  email: string;
}

export interface QuotationResponseViewInfo {
  quotationId: string;
  correlative: string;
  date: string;
  advisorId: string;
}

export interface BasicInfo {
  totalCBM: number;
  totalWeight: number;
  totalPrice: number;
  totalExpress: number;
  totalQuantity: number;
}

export interface PackingList {
  nroBoxes: number;
  cbm: number;
  pesoKg: number;
  pesoTn: number;
}

export interface CargoHandling {
  fragileProduct: boolean;
  stackProduct: boolean;
}

export interface PendingPricing {
  unitPrice: number;
  expressPrice: number;
}

export interface CompletePricing {
  unitCost: number;
}

export interface ProductPricing {
  totalPrice: number;
  totalWeight: number;
  totalCBM: number;
  totalQuantity: number;
  totalExpress: number;
}

export interface CompleteProductPricing {
  unitCost: number;
  importCosts: number;
  totalCost: number;
  equivalence: number;
}

export interface PendingVariant {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
  isQuoted: boolean;
  pendingPricing: PendingPricing;
  attachments: string[];
}

export interface CompleteVariant {
  variantId: string;
  quantity: number;
  size: string;
  presentation: string;
  model: string;
  color: string;
  isQuoted: boolean;
  completePricing: CompletePricing;
}

export interface PendingProduct {
  productId: string;
  name: string;
  url: string;
  comment: string;
  isQuoted: boolean;
  adminComment: string;
  ghostUrl: string;
  pricing: ProductPricing;
  packingList: PackingList;
  cargoHandling: CargoHandling;
  variants: PendingVariant[];
}

export interface CompleteProduct {
  productId: string;
  name: string;
  url: string;
  comment: string;
  isQuoted: boolean;
  adminComment: string;
  pricing: CompleteProductPricing;
  variants: CompleteVariant[];
  attachments: string[];
}

export interface PendingServiceResponse {
  serviceType: "PENDING";
  type: "PENDING";
  serviceLogistic: string;
  incoterm: string;
  cargoType: string;
  courier: string;
  basicInfo: BasicInfo;
  products: PendingProduct[];
}

export interface CompleteServiceResponse {
  serviceType: "EXPRESS" | "MARITIME";
  type: "EXPRESS" | "MARITIME";
  basicInfo: BasicInfo;
  products: CompleteProduct[];
}

export type ServiceResponse = PendingServiceResponse | CompleteServiceResponse;

export interface QuotationResponseViewDTO {
  quotationInfo: QuotationResponseViewInfo;
  user: QuotationResponseViewUser;
  responseData: ServiceResponse[];
}