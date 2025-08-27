/**
 * DTO Mejorado para Respuestas de Cotización
 * Soporta múltiples tipos de servicio: Express, Marítimo, Consolidado, etc.
 */

// ============================================================================
// INFORMACIÓN BÁSICA DE LA COTIZACIÓN
// ============================================================================

export interface QuotationInfo {
  quotationId: string;
  status: QuotationStatus;
  correlative: string;
  date: string;
  serviceType: ServiceType;
  cargoType: CargoType;
  courier?: string; // Solo para Express
  incoterm: Incoterm;
  isFirstPurchase: boolean;
  regime: Regime;
  originCountry: string;
  destinationCountry: string;
  customs: string;
  originPort: string;
  destinationPort: string;
  serviceTypeDetail: ServiceTypeDetail;
  transitTime: number;
  naviera?: string; // Solo para Marítimo
  proformaValidity: string;
  id_asesor: string;
  clientComments?: string;
  adminComments?: string;
}

export type QuotationStatus = 
  | "PENDING" 
  | "ANSWERED" 
  | "APPROVED" 
  | "REJECTED" 
  | "CANCELLED" 
  | "DRAFT";

export type ServiceType = 
  | "Consolidado Express" 
  | "Consolidado Marítimo" 
  | "Express Directo" 
  | "Marítimo Directo" 
  | "Aéreo Directo";

export type CargoType = "general" | "mixto" | "imo";

export type Incoterm = "EXW" | "FCA" | "CPT" | "CIP" | "DAP" | "DPU" | "DDP" | "FAS" | "FOB" | "CFR" | "CIF";

export type Regime = "importacion_consumo" | "importacion_definitiva" | "temporal";

export type ServiceTypeDetail = "directo" | "consolidado" | "express";

// ============================================================================
// VALORES DINÁMICOS Y CÁLCULOS
// ============================================================================

export interface DynamicValues {
  // Valores comerciales
  comercialValue: number;
  flete: number;
  cajas: number;
  desaduanaje: number;
  kg: number;                    // Peso en KG (para PENDING) o peso total
  ton: number;                   // Peso en toneladas
  kv: number;                    // Factor de conversión
  fob: number;                   // Valor FOB
  seguro: number;                // Seguro
  tipoCambio: number;            // Tipo de cambio
  nroBultos: number;             // Número de bultos
  volumenCBM: number;            // Volumen en CBM (para PENDING) o CBM Total
  
  // Cálculos de flete
  calculoFlete: number;
  
  // Servicios específicos por tipo
  servicioConsolidado: number;
  separacionCarga: number;
  inspeccionProductos: number;
  gestionCertificado: number;
  inspeccionProducto: number;
  inspeccionFabrica: number;
  transporteLocal: number;
  otrosServicios: number;
  
  // Tasas impositivas
  adValoremRate: number;
  antidumpingGobierno: number;
  antidumpingCantidad: number;
  iscRate: number;
  igvRate: number;
  ipmRate: number;
  percepcionRate: number;
  
  // Transporte local
  transporteLocalChinaEnvio: number;
  transporteLocalClienteEnvio: number;
  
  // Valores calculados
  cif: number;
  shouldExemptTaxes: boolean;
}

// ============================================================================
// EXENCIONES Y CONFIGURACIONES
// ============================================================================

export interface Exemptions {
  // Servicios consolidados
  servicioConsolidadoAereo?: boolean;
  servicioConsolidadoMaritimo: boolean;
  
  // Servicios de carga
  separacionCarga: boolean;
  inspeccionProductos?: boolean;
  
  // Obligaciones fiscales
  obligacionesFiscales: boolean;
  desaduanajeFleteSaguro?: boolean;
  totalDerechos: boolean;
  
  // Transporte local
  transporteLocalChina?: boolean;
  transporteLocalCliente?: boolean;
  transporteLocal?: boolean;
  
  // Otros servicios
  gestionCertificado?: boolean;
  servicioInspeccion?: boolean;
}

// ============================================================================
// CÁLCULOS DE SERVICIOS
// ============================================================================

export interface ServiceCalculations {
  serviceFields: {
    servicioConsolidado: number;
    separacionCarga: number;
    inspeccionProductos: number;
  };
  subtotalServices: number;
  igvServices: number;
  totalServices: number;
  
  fiscalObligations: FiscalObligations;
  importExpenses: ImportExpenses;
  totals: {
    inversionTotal: number;
  };
}

export interface FiscalObligations {
  adValorem: number;
  antidumping?: number;
  isc?: number;
  baseIgvIpm?: number;
  igvFiscal?: number;
  ipm?: number;
  percepcion?: number;
  totalDerechosDolares: number;
  totalDerechosSoles?: number;
  totalDerechosDolaresFinal?: number;
}

export interface ImportExpenses {
  servicioConsolidadoFinal: number;
  separacionCargaFinal: number;
  inspeccionProductosFinal?: number;
  servicioConsolidadoMaritimoFinal?: number;
  gestionCertificadoFinal?: number;
  servicioInspeccionFinal?: number;
  transporteLocalFinal?: number;
  desaduanajeFleteSaguro?: number;
  
  finalValues?: {
    servicioConsolidado: number;
    gestionCertificado: number;
    servicioInspeccion: number;
    transporteLocal: number;
    separacionCarga: number;
    inspeccionProductos: number;
    desaduanajeFleteSaguro: number;
    transporteLocalChina: number;
    transporteLocalCliente: number;
  };
  
  totalGastosImportacion: number;
}

// ============================================================================
// PRODUCTOS Y VARIANTES
// ============================================================================

export interface Product {
  originalProductId: string | null; // null para productos nuevos
  name: string;
  adminComment?: string;
  seCotizaProducto: boolean;
  variants: ProductVariant[];
}

export interface ProductVariant {
  originalVariantId: string | null; // null para variantes nuevas
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
  price: number;
  unitCost: number;
  importCosts: number;
  seCotizaVariante: boolean;
}

// ============================================================================
// CÁLCULOS
// ============================================================================

export interface Calculations {
  dynamicValues: DynamicValues;
  exemptions: Exemptions;
  serviceCalculations: ServiceCalculations;
}

// ============================================================================
// DTO PRINCIPAL
// ============================================================================

export interface QuotationResponseDTO {
  quotationInfo: QuotationInfo;
  calculations: Calculations;
  products: Product[];
}

// ============================================================================
// TIPOS DE SERVICIO ESPECÍFICOS
// ============================================================================

export interface ExpressServiceConfig {
  courier: string;
  transitTime: number;
  expressFees: number;
  urgentDelivery: boolean;
}

export interface MaritimeServiceConfig {
  naviera: string;
  containerType: "20ft" | "40ft" | "40hc";
  transitTime: number;
  portFees: number;
  demurrage: number;
}

export interface ConsolidatedServiceConfig {
  consolidationType: "express" | "maritime";
  warehouseFees: number;
  sortingFees: number;
  inspectionFees: number;
}

// ============================================================================
// UTILIDADES Y TIPOS AUXILIARES
// ============================================================================

export type ServiceConfig = 
  | ExpressServiceConfig 
  | MaritimeServiceConfig 
  | ConsolidatedServiceConfig;

export interface QuotationResponseMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: string;
  lastModifiedBy: string;
}

// ============================================================================
// RESPONSES Y REQUESTS
// ============================================================================

export interface CreateQuotationResponseRequest {
  quotationId: string;
  responseData: QuotationResponseDTO;
  metadata?: QuotationResponseMetadata;
}

export interface UpdateQuotationResponseRequest {
  responseId: string;
  responseData: Partial<QuotationResponseDTO>;
  metadata?: Partial<QuotationResponseMetadata>;
}

export interface QuotationResponseResponse {
  id: string;
  quotationId: string;
  responseData: QuotationResponseDTO;
  metadata: QuotationResponseMetadata;
  status: "draft" | "sent" | "approved" | "rejected";
}
