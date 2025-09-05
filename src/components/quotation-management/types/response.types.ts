/**
 * Type definitions for quotation response domain
 * Handles response-related data structures
 */

// Response calculation types
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
  cif: number;
  shouldExemptTaxes: boolean;
}

export interface Exemptions {
  servicioConsolidadoAereo: boolean;
  servicioConsolidadoMaritimo: boolean;
  separacionCarga: boolean;
  inspeccionProductos: boolean;
  obligacionesFiscales: boolean;
  desaduanajeFleteSaguro: boolean;
  transporteLocalChina: boolean;
  transporteLocalCliente: boolean;
  gestionCertificado: boolean;
  servicioInspeccion: boolean;
  transporteLocal: boolean;
  totalDerechos: boolean;
}

export interface ServiceFields {
  servicioConsolidado: number;
  separacionCarga: number;
  inspeccionProductos: number;
}

export interface FiscalObligations {
  adValorem: number;
  totalDerechosDolares: number;
}

export interface FinalValues {
  servicioConsolidado: number;
  gestionCertificado: number;
  servicioInspeccion: number;
  transporteLocal: number;
  separacionCarga: number;
  inspeccionProductos: number;
  desaduanajeFleteSaguro: number;
  transporteLocalChina: number;
  transporteLocalCliente: number;
}

export interface ImportExpenses {
  servicioConsolidadoFinal: number;
  separacionCargaFinal: number;
  inspeccionProductosFinal: number;
  servicioConsolidadoMaritimoFinal: number;
  gestionCertificadoFinal: number;
  servicioInspeccionFinal: number;
  transporteLocalFinal: number;
  desaduanajeFleteSaguro: number;
  finalValues: FinalValues;
  totalGastosImportacion: number;
}

export interface ServiceCalculations {
  serviceFields: ServiceFields;
  subtotalServices: number;
  igvServices: number;
  totalServices: number;
  fiscalObligations: FiscalObligations;
  importExpenses: ImportExpenses;
  totals: {
    inversionTotal: number;
  };
}

export interface Calculations {
  serviceCalculations: ServiceCalculations;
  exemptions: Exemptions;
  dynamicValues: DynamicValues;
}

// Response product types
export interface VariantQuotationResponseDTO {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
  price: string;
  unitCost: string;
  importCosts: string;
  seCotizaVariante: boolean;
}

export interface ProductsQuotationResponseDTO {
  productId: string;
  name: string;
  url: string;
  comment: string;
  quantityTotal: number;
  weight: string;
  volume: string;
  number_of_boxes: number;
  adminComment: string;
  seCotizaProducto: boolean;
  attachments: string[];
  variants: VariantQuotationResponseDTO[];
}

export interface ProductsQuotationCreateResponseDTO {
  productId: string;
  name: string;
  adminComment: string;
  seCotizaProducto: boolean;
  variants: VariantQuotationResponseDTO[];
}

// Main response interfaces
export interface QuotationInfo {
  quotationId: string;
  status: string;
  correlative: string;
  date: string;
  serviceType: string;
  cargoType: string;
  courier: string;
  incoterm: string;
  isFirstPurchase: boolean;
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
  id_asesor: string;
}

export interface QuotationCreateUpdateResponseDTO {
  quotationInfo: QuotationInfo;
  calculations: Calculations;
  products: ProductsQuotationCreateResponseDTO[];
}

// Response listing interfaces
export interface ContentQuotationResponseDTO {
  id_quotation_response: string;
  service_type: string;
  cargo_type: string;
  response_date: string;
}

export interface QuotationGetResponsesForUsersDTO {
  quotationInfo: {
    idQuotationResponse: string;
    correlative: string;
    date: string;
    serviceType: string;
    cargoType: string;
    courier: string;
    incoterm: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  serviceType: string;
  products: ProductsQuotationResponseDTO[];
}

export interface QuotationResponseListDTO {
  content: ContentQuotationResponseDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Response management types
export interface ResponseState {
  responses: ContentQuotationResponseDTO[];
  activeResponseId: string;
  editMode: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ResponseActions {
  activateResponse: (responseId: string) => void;
  toggleEditMode: () => void;
  refetch: () => void;
  updateResponse: (data: QuotationCreateUpdateResponseDTO) => void;
}

export interface ResponseManagementProps {
  quotationId: string;
  mode: 'admin' | 'user';
  readonly?: boolean;
  onResponseSelect?: (responseId: string) => void;
}

// Calculation utilities types
export interface CalculationResult {
  success: boolean;
  value: number;
  error?: string;
}

export interface VariantTotals {
  totalPrice: number;
  totalExpress: number;
  totalQuantity: number;
  totalUnitCost: number;
  totalImportCosts: number;
}

// Form validation types
export interface ResponseFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  requiredFields: string[];
}

export interface ValidationRule {
  field: string;
  required: boolean;
  type: 'number' | 'string' | 'boolean';
  min?: number;
  max?: number;
  validator?: (value: unknown) => boolean;
}

// Response table types
export interface ResponseTableProps {
  responses: ContentQuotationResponseDTO[];
  loading?: boolean;
  error?: string;
  onResponseSelect: (responseId: string) => void;
  selectedResponseId?: string;
  showActions?: boolean;
}

export interface ResponseTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: ContentQuotationResponseDTO) => React.ReactNode;
}