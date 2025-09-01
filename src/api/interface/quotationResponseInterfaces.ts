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

export interface dynamicValues {
  comercialValue: number,
  flete: number,
  cajas: number,
  desaduanaje: number,
  kg: number,
  ton: number,
  kv: number,
  fob: number,
  seguro: number,
  tipoCambio: number,
  nroBultos: number,
  volumenCBM: number,
  calculoFlete: number,
  servicioConsolidado: number,
  separacionCarga: number,
  inspeccionProductos: number,
  gestionCertificado: number,
  inspeccionProducto: number,
  inspeccionFabrica: number,
  transporteLocal: number,
  otrosServicios: number,
  adValoremRate: number,
  antidumpingGobierno: number,
  antidumpingCantidad: number,
  iscRate: number,
  igvRate: number,
  ipmRate: number,
  percepcionRate: number,
  transporteLocalChinaEnvio: number,
  transporteLocalClienteEnvio: number,
  cif: number,
  shouldExemptTaxes: boolean
}

export interface Exemptions {
  servicioConsolidadoAereo: boolean,
  servicioConsolidadoMaritimo: boolean,
  separacionCarga: boolean,
  inspeccionProductos: boolean,
  obligacionesFiscales: boolean,
  desaduanajeFleteSaguro: boolean,
  transporteLocalChina: boolean,
  transporteLocalCliente: boolean,
  gestionCertificado: boolean,
  servicioInspeccion: boolean,
  transporteLocal: boolean,
  totalDerechos: boolean
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
  inspeccionProductosFinal: number;
  servicioConsolidadoMaritimoFinal: number;
  gestionCertificadoFinal: number;
  servicioInspeccionFinal: number;
  transporteLocalFinal: number;
  desaduanajeFleteSaguro: number;
  finalValues: finalValues;
  totalGastosImportacion: number;
}

export interface finalValues {
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
  adminComment: string;
  seCotizaProducto: boolean;
  variants: VariantQuotationResponseDTO[];
}

export interface VariantQuotationResponseDTO {
  variantId: string;
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


export interface Calculations {
  serviceCalculations: ServiceCalculations;
  exemptions: Exemptions;
  dynamicValues: dynamicValues;
}


//!INTERFACES PARA CREAR UNA RESPUESTA DE UNA COTIZACIÓN
export interface QuotationCreateUpdateResponseDTO {
  quotationInfo: QuotationInfo;
  calculations: Calculations;
  products: ProductsQuotationResponseDTO[];
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
  serviceType: string;
  serviceCalculations: ServiceCalculations;
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

//*****************************************************************************************************/
//********************* INTERFACES UNIFICADAS PARA CREACIÓN Y EDICIÓN *********************************/
//*****************************************************************************************************/

// Interfaz para variantes de productos en el DTO unificado
export interface QuotationResponseVariantDTO {
  id_quotation_response_variant?: string;
  price: number;
  quantity: number;
  total: number;
  import_costs: number;
  unit_cost: number;
  se_cotiza_variante: boolean;
  quotationResponseProductId?: string;
  productVariantId: string;
  size?: string;
  presentation?: string;
  model?: string;
  color?: string;
}

// Interfaz para productos en el DTO unificado
export interface QuotationResponseProductDTO {
  id_quotation_response_products?: string;
  item: number;
  name: string;
  quotationResponseIdQuotationResponse?: string;
  productQuotationIdProductQuotation: string;
  se_cotiza_producto: boolean;
  status: string;
  admin_comment: string;
  variants: QuotationResponseVariantDTO[];
}

// Interfaz para la respuesta principal en el DTO unificado
export interface QuotationResponseMainDTO {
  id_quotation_response?: string;
  created_at?: string;
  last_modified?: string;
  is_active?: boolean;
  quotationIdQuotation: string;
  status: string;
  response_date: string;
  service_type: string;
  cargo_type: string;
  courier: string;
  incoterm: string;
  is_first_purchase: boolean;
  regime?: string;
  origin_country?: string;
  destination_country?: string;
  customs?: string;
  origin_port?: string;
  destination_port?: string;
  service_type_detail?: string;
  transit_time_days?: number;
  shipping_company?: string;
  proforma_validity_days?: number;
  advisorIdUsuario: string;
  advisor_name?: string;
  is_maritime_service: boolean;
  client_comments?: string;
  admin_comments?: string;
  calculation_details: {
    correlative: string;
    dynamicValues: dynamicValues;
    exemptions: Exemptions;
    serviceCalculations: ServiceCalculations;
  };
}

// DTO unificado para creación y edición de respuestas de cotización
export interface QuotationResponseCompleteDTO {
  quotationResponse: QuotationResponseMainDTO;
  products: QuotationResponseProductDTO[];
}
