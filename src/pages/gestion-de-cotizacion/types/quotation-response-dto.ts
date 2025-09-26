// Interfaces específicas para el builder - NO DUPLICAR las interfaces API

// Build data interfaces for internal use only
export interface PendingBuildData {
  products: unknown[];
  aggregatedTotals: {
    totalCBM: number;
    totalWeight: number;
    totalPrice: number;
    totalExpress: number;
    totalItems: number;
  };
  quotationStates: {
    products: Record<string, boolean>;
    variants: Record<string, Record<string, boolean>>;
  };
  configuration?: {
    serviceLogistic: string;
    incoterm: string;
    cargoType: string;
    courier: string;
  };
  quotationDetail?: unknown;
}

export interface CompleteBuildData {
  quotationForm: unknown;
  calculations: unknown;
  products: unknown[];
  quotationDetail: unknown;
}

// Legacy interface - use API ResponseDataComplete instead
export interface QuotationResponseDTO {
  quotationId: string;
  serviceType: "EXPRESS" | "MARITIME";
  quotationInfo: {
    quotationId: string;
    correlative: string;
    date: string;
    advisorId: string;
  };
  responseData: unknown; // Use ResponseDataComplete from API
  products: unknown[]; // Use CompleteProductInterface[] from API
}