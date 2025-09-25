export interface QuotationInfoDto {
  quotationId: string;
  correlative: string;
  date: string;
  advisorId: string;
  serviceLogistic: string;
  incoterm: string;
  cargoType: string;
  courier: string;
  maritimeConfig?: {
    regime: string;
    originCountry: string;
    destinationCountry: string;
    customs: string;
    originPort: string;
    destinationPort: string;
    serviceTypeDetail: string;
    transitTime: number;
    naviera: string;
    proformaValidity: string;
  };
}

export interface DynamicValuesDto {
  comercialValue: number;
  flete: number;
  cajas: number;
  kg: number;
  ton?: number;
  fob: number;
  seguro: number;
  tipoCambio: number;
  volumenCBM?: number;
  calculoFlete?: number;
  servicioConsolidado: number;
  separacionCarga: number;
  inspeccionProductos: number;
  gestionCertificado?: number;
  inspeccionProducto?: number;
  transporteLocal?: number;
  desaduanaje?: number;
  adValoremRate: number;
  igvRate: number;
  ipmRate: number;
  antidumpingGobierno?: number;
  antidumpingCantidad?: number;
  transporteLocalChinaEnvio?: number;
  transporteLocalClienteEnvio?: number;
  cif: number;
}

export interface ExemptionsDto {
  servicioConsolidadoAereo?: boolean;
  servicioConsolidadoMaritimo?: boolean;
  separacionCarga: boolean;
  inspeccionProductos: boolean;
  obligacionesFiscales: boolean;
  gestionCertificado?: boolean;
  servicioInspeccion?: boolean;
  transporteLocal?: boolean;
  totalDerechos?: boolean;
  descuentoGrupalExpress?: boolean;
}

export interface ServiceFieldsDto {
  servicioConsolidado: number;
  separacionCarga?: number;
  seguroProductos?: number;
  inspeccionProductos: number;
  gestionCertificado?: number;
  inspeccionProducto?: number;
  transporteLocal?: number;
}

export interface FiscalObligationsDto {
  adValorem: number;
  igv: number;
  ipm: number;
  antidumping?: number;
  totalTaxes: number;
}

export interface CommercialDetailsDto {
  cif: number;
  totalImportCosts: number;
  totalInvestment: number;
}

export interface ServiceCalculationsDto {
  serviceFields: ServiceFieldsDto;
  subtotalServices: number;
  igvServices: number;
  totalServices: number;
}

export interface BasicInfoDto {
  totalCBM: number;
  totalWeight: number;
  totalPrice: number;
  totalExpress: number;
  totalQuantity: number;
}

export interface PendingServiceData {
  type: "PENDING";
  basicInfo: BasicInfoDto;
  generalInformation: {
    serviceLogistic: string;
    incoterm: string;
    cargoType: string;
    courier: string;
  };
}

export interface CompleteServiceData {
  type: "EXPRESS" | "MARITIME";
  basicInfo: BasicInfoDto;
  calculations: {
    dynamicValues: DynamicValuesDto;
    fiscalObligations: FiscalObligationsDto;
    serviceCalculations: ServiceCalculationsDto;
    exemptions: ExemptionsDto;
  };
  commercialDetails: CommercialDetailsDto;
}

export interface PackingListDto {
  nroBoxes: number;
  cbm: number;
  pesoKg: number;
  pesoTn: number;
}

export interface CargoHandlingDto {
  fragileProduct: boolean;
  stackProduct: boolean;
}

export interface PendingProductPricingDto {
  totalPrice: number;
  totalWeight: number;
  totalCBM: number;
  totalQuantity: number;
  totalExpress: number;
}

export interface CompleteProductPricingDto {
  unitCost: number;
  importCosts: number;
  totalCost: number;
  equivalence: number;
}

export interface PendingProductVariantDto {
  variantId: string;
  quantity: number;
  isQuoted: boolean;
  pendingPricing: {
    unitPrice: number;
    expressPrice: number;
  };
}

export interface CompleteProductVariantDto {
  variantId: string;
  quantity: number;
  isQuoted: boolean;
  completePricing: {
    unitCost: number;
  };
}

export interface ProductResponseDto {
  productId: string;
  name: string;
  isQuoted: boolean;
  adminComment?: string;
  ghostUrl?: string;
  pricing: PendingProductPricingDto | CompleteProductPricingDto;
  packingList?: PackingListDto;
  cargoHandling?: CargoHandlingDto;
  variants: PendingProductVariantDto[] | CompleteProductVariantDto[];
}

export interface QuotationResponseBaseDto {
  quotationId: string;
  quotationInfo: QuotationInfoDto;
  serviceType: "PENDING" | "EXPRESS" | "MARITIME";
  responseData: PendingServiceData | CompleteServiceData;
  products: ProductResponseDto[];
}

export interface QuotationResponseHookParams {
  data: QuotationResponseBaseDto;
  quotationId: string;
}

export interface PendingBuildData {
  products: any[];
  aggregatedTotals: any;
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
  quotationDetail?: any;
}

export interface CompleteBuildData {
  quotationForm: any;
  calculations: any;
  products: any[];
  quotationDetail: any;
}

//export type ServiceType = "PENDING" | "EXPRESS" | "MARITIME";