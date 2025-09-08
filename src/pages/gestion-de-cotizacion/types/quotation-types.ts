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

export interface DynamicValues {
  comercialValue: number;
  flete: number;
  cajas: number;
  desaduanaje: number;
  kg: number;
  ton: number;
  kv: number;
  fob: number;
  seguro: number;
  tipoCambio: number;
  nroBultos: number;
  volumenCBM: number;
  calculoFlete: number;
  servicioConsolidado: number;
  separacionCarga: number;
  inspeccionProductos: number;
  gestionCertificado: number;
  inspeccionProducto: number;
  inspeccionFabrica: number;
  transporteLocal: number;
  otrosServicios: number;
  adValoremRate: number;
  antidumpingGobierno: number;
  antidumpingCantidad: number;
  iscRate: number;
  igvRate: number;
  ipmRate: number;
  percepcionRate: number;
  transporteLocalChinaEnvio: number;
  transporteLocalClienteEnvio: number;
}

export interface ExemptionState {
  servicioConsolidadoAereo: boolean;
  separacionCarga: boolean;
  inspeccionProductos: boolean;
  obligacionesFiscales: boolean;
  desaduanajeFleteSaguro: boolean;
  transporteLocalChina: boolean;
  transporteLocalCliente: boolean;
  servicioConsolidadoMaritimo: boolean;
  gestionCertificado: boolean;
  servicioInspeccion: boolean;
  transporteLocal: boolean;
  totalDerechos: boolean;
}

export interface QuotationResponseDTO {
  quotationInfo: {
    quotationId: string;
    status: string;
    correlative: string;
    date: string;
    serviceType: string;
    cargoType: string;
    courier: string;
    incoterm: string;
    isFirstPurchase: boolean;
    regime?: string;
    originCountry?: string;
    destinationCountry?: string;
    customs?: string;
    originPort?: string;
    destinationPort?: string;
    serviceTypeDetail?: string;
    transitTime?: number;
    naviera?: string;
    proformaValidity: string;
    cbm_total: number;
    peso_total: number;
    id_asesor: string;
  };
  calculations: {
    serviceCalculations: Record<string, any>;
    exemptions: ExemptionState;
    dynamicValues: DynamicValues & {
      cif: number;
      shouldExemptTaxes: boolean;
    };
  };
  products: Array<{
    productId: string;
    name: string;
    adminComment: string;
    seCotizaProducto: boolean;
    variants: Array<{
      variantId: string;
      quantity: number;
      precio_unitario: number;
      precio_express: number;
      seCotizaVariante: boolean;
    }>;
  }>;
}