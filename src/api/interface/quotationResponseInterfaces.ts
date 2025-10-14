import type { CompleteProductInterface } from "./quotation-response/dto/complete/products/complete-products";
import type { ResponseDataComplete } from "./quotation-response/dto/complete/response-data-complete";
import type { PendingProductInterface } from "./quotation-response/dto/pending/products/pending-products";
import type { ResponseDataPending } from "./quotation-response/dto/pending/response-data-pending";
import type { ServiceType } from "./quotation-response/enums/enum";
import type { UserDTO } from "./user";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

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
  cbm_total: number;
  peso_total: number;
  id_asesor: string;
}

export interface dynamicValues {
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

export interface serviceFields {
  servicioConsolidado: number;
  separacionCarga: number;
  inspeccionProductos: number;
}

export interface fiscalObligations {
  adValorem: number;
  totalDerechosDolares: number;
}

export interface importExpenses {
  servicioConsolidadoFinal: number;
  separacionCargaFinal: number;
  totalGastosImportacion: number;
}

export interface ServiceCalculations {
  serviceFields: serviceFields;
  subtotalServices: number;
  igvServices: number;
  totalServices: number;
  fiscalObligations: fiscalObligations;
  importExpenses: importExpenses;
  totals: {
    inversionTotal: number;
  };
}

export interface ProductsQuotationResponseDTO {
  productId: string;
  name: string;
  url: string;
  comment: string;
  quantityTotal?: number;
  weight?: string;
  volume?: string;
  number_of_boxes?: number;
  adminComment: string;
  seCotizaProducto?: boolean;
  isQuoted: boolean;
  attachments: string[];
  ghostUrl?: string;
  cargoHandling?: {
    fragileProduct: boolean;
    stackProduct: boolean;
  };
  packingList?: {
    nroBoxes: number;
    cbm: number;
    pesoKg: number;
    pesoTn: number;
  };
  pricing?: {
    totalPrice: number;
    totalWeight: number;
    totalCBM: number;
    totalQuantity: number;
    totalExpress: number;
    unitCost?: number;
    importCosts?: number;
    totalCost?: number;
    equivalence?: number;
  };
  variants: VariantQuotationResponseDTO[];
}

export interface ProductsQuotationCreateResponseDTO {
  productId: string;
  name: string;
  adminComment: string;
  seCotizaProducto: boolean;
  variants: VariantQuotationCreateResponseDTO[];
}

export interface VariantQuotationResponseDTO {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
  price?: string;
  unitCost?: string;
  importCosts?: string;
  seCotizaVariante?: boolean;
  isQuoted: boolean;
  attachments?: string[];
  pendingPricing?: {
    unitPrice: number;
    expressPrice: number;
  };
  completePricing?: {
    unitCost: number;
  };
}

// Nueva interfaz para variantes de creación con la estructura correcta
export interface VariantQuotationCreateResponseDTO {
  variantId: string;
  quantity: number;
  precio_unitario: number;
  precio_express_unitario: number;
  seCotizaVariante: boolean;
  unitCost?: number;
}

export interface Calculations {
  serviceCalculations: ServiceCalculations;
  exemptions: Exemptions;
  dynamicValues: dynamicValues;
}

//!INTERFACES PARA CREAR UNA RESPUESTA DE UNA COTIZACIÓN
export interface QuotationCreateUpdateResponseDTO {
  quotationInfo: QuotationInfo;
  calculations: Calculations;
  products: ProductsQuotationCreateResponseDTO[];
}

//*****************************************************************************************************/
//********************* INTERFACES PARA LISTAR LAS RESPUESTAS DE UNA COTIZACIÓN ***********************/
//*****************************************************************************************************/

export interface contentQuotationResponseDTO {
  id_quotation_response: string;
  response_date: string;
  advisorName: string;
  serviceType: string;
}


export interface ResponseInformationDTO{
  responseId: string | null;
  response_date: Date;
  advisorId: string;
  serviceType: ServiceType;
  responseData: ResponseDataPending | ResponseDataComplete;
  products: PendingProductInterface[]|CompleteProductInterface[];
}

//!Interfaz para listar las respuestas del administrador y sean vistas por el usuario
export interface QuotationGetResponsesForUsersDTO {
  quotationId: string;
  correlative: string;
  user: UserDTO;
  responses: ResponseInformationDTO[];
}

//!Interfaz para listar las respuestas de una cotización
export interface QuotationResponseListDTO {
  content: contentQuotationResponseDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}