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
  variants: VariantQuotationCreateResponseDTO[];
}

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
  service_type: string;
  cargo_type: string;
  response_date: string;
}

//!Interfaz para listar las respuestas del administrador y sean vistas por el usuario
export interface QuotationGetResponsesForUsersDTO {
  quotationInfo: {
    correlative: string;
    date: string;
    serviceType: string;
    cargoType: string;
    courier: string;
    incoterm: string;
  };
  user: UserInfo;
  serviceType: string;
  products: ProductsQuotationResponseDTO[];
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