import type { 
  QuotationResponseDto,
  QuotationResponseHookParams,
  QuotationInfoDto,
  DynamicValuesDto,
  ExemptionsDto,
  ServiceCalculationsDto,
  ProductDto,
  ProductVariantDto,
  FinalValuesDto
} from "../types/quotation-response-dto";

interface BuildQuotationResponseParams {
  selectedQuotationId: string;
  quotationDetail: any;
  quotationForm: any;
  calculations: any;
  productsData: any[];
  currentUserId: string;
}

export function buildQuotationResponseDto({
  selectedQuotationId,
  quotationDetail,
  quotationForm,
  calculations,
  productsData,
  currentUserId
}: BuildQuotationResponseParams): QuotationResponseHookParams {
  
  const isPendingView = quotationForm.selectedServiceLogistic === "Pendiente";
  
  // Construir quotationInfo
  const quotationInfo: QuotationInfoDto = {
    quotationId: selectedQuotationId,
    status: "ANSWERED",
    correlative: quotationDetail?.correlative || "",
    date: new Date().toLocaleString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', ''),
    serviceType: quotationForm.selectedServiceLogistic || "",
    cargoType: quotationForm.selectedTypeLoad || "general",
    courier: quotationForm.selectedCourier || "",
    incoterm: quotationForm.selectedIncoterm || "",
    isFirstPurchase: false,
    regime: quotationForm.selectedRegimen || "",
    originCountry: quotationForm.selectedPaisOrigen || "",
    destinationCountry: quotationForm.selectedPaisDestino || "",
    customs: quotationForm.selectedAduana || "",
    originPort: quotationForm.selectedPuertoSalida || "",
    destinationPort: quotationForm.selectedPuertoDestino || "",
    serviceTypeDetail: quotationForm.selectedTipoServicio || "",
    transitTime: quotationForm.tiempoTransito || 0,
    naviera: quotationForm.naviera || "",
    proformaValidity: quotationForm.selectedProformaVigencia || "",
    cbm_total: isPendingView 
      ? (calculations.totalCBM || 0) 
      : (quotationForm.dynamicValues.volumenCBM || 0),
    peso_total: isPendingView 
      ? (calculations.totalWeight || 0) 
      : (quotationForm.dynamicValues.kg || 0),
    id_asesor: currentUserId
  };

  // Construir dynamicValues (solo para servicios no pendientes)
  const dynamicValues: DynamicValuesDto = {
    comercialValue: quotationForm.dynamicValues.comercialValue || 0,
    flete: quotationForm.dynamicValues.flete || 0,
    cajas: quotationForm.dynamicValues.cajas || 0,
    desaduanaje: quotationForm.dynamicValues.desaduanaje || 0,
    kg: quotationForm.dynamicValues.kg || 0,
    ton: quotationForm.dynamicValues.ton || 0,
    kv: quotationForm.dynamicValues.kv || 0,
    fob: quotationForm.dynamicValues.fob || 0,
    seguro: quotationForm.dynamicValues.seguro || 0,
    tipoCambio: quotationForm.dynamicValues.tipoCambio || 0,
    nroBultos: quotationForm.dynamicValues.nroBultos || 0,
    volumenCBM: quotationForm.dynamicValues.volumenCBM || 0,
    calculoFlete: quotationForm.dynamicValues.calculoFlete || 0,
    servicioConsolidado: quotationForm.dynamicValues.servicioConsolidado || 0,
    separacionCarga: quotationForm.dynamicValues.separacionCarga || 0,
    inspeccionProductos: quotationForm.dynamicValues.inspeccionProductos || 0,
    gestionCertificado: quotationForm.dynamicValues.gestionCertificado || 0,
    inspeccionProducto: quotationForm.dynamicValues.inspeccionProducto || 0,
    inspeccionFabrica: quotationForm.dynamicValues.inspeccionFabrica || 0,
    transporteLocal: quotationForm.dynamicValues.transporteLocal || 0,
    otrosServicios: quotationForm.dynamicValues.otrosServicios || 0,
    adValoremRate: quotationForm.dynamicValues.adValoremRate || 0,
    antidumpingGobierno: quotationForm.dynamicValues.antidumpingGobierno || 0,
    antidumpingCantidad: quotationForm.dynamicValues.antidumpingCantidad || 0,
    iscRate: quotationForm.dynamicValues.iscRate || 0,
    igvRate: quotationForm.dynamicValues.igvRate || 0,
    ipmRate: quotationForm.dynamicValues.ipmRate || 0,
    percepcionRate: quotationForm.dynamicValues.percepcionRate || 0,
    transporteLocalChinaEnvio: 0, // Por defecto 0
    transporteLocalClienteEnvio: 0, // Por defecto 0
    cif: parseFloat((quotationForm.cif || 0).toFixed(2)),
    shouldExemptTaxes: quotationForm.exemptionState.obligacionesFiscales || false
  };

  // Construir exemptions
  const exemptions: ExemptionsDto = {
    servicioConsolidadoAereo: isAereoService(quotationForm.selectedServiceLogistic),
    servicioConsolidadoMaritimo: isMaritimoService(quotationForm.selectedServiceLogistic),
    separacionCarga: quotationForm.exemptionState.separacionCarga || false,
    inspeccionProductos: quotationForm.exemptionState.inspeccionProductos || false,
    obligacionesFiscales: quotationForm.exemptionState.obligacionesFiscales || false,
    desaduanajeFleteSaguro: quotationForm.exemptionState.desaduanajeFleteSaguro || false,
    transporteLocalChina: quotationForm.exemptionState.transporteLocalChina || false,
    transporteLocalCliente: quotationForm.exemptionState.transporteLocalCliente || false,
    gestionCertificado: quotationForm.exemptionState.gestionCertificado || false,
    servicioInspeccion: quotationForm.exemptionState.servicioInspeccion || false,
    transporteLocal: quotationForm.exemptionState.transporteLocal || false,
    totalDerechos: quotationForm.exemptionState.totalDerechos || false
  };

  // Construir serviceCalculations
  const serviceFields = quotationForm.getServiceFields();
  const subtotalServices = Object.values(serviceFields).reduce((sum: number, value: any) => sum + (value || 0), 0);
  const igvServices = subtotalServices * 0.18;
  const totalServices = subtotalServices + igvServices;

  const serviceCalculations: ServiceCalculationsDto = {
    serviceFields: {
      servicioConsolidado: serviceFields.servicioConsolidado || 0,
      separacionCarga: serviceFields.separacionCarga || 0,
      inspeccionProductos: serviceFields.inspeccionProductos || 0
    },
    subtotalServices,
    igvServices,
    totalServices,
    fiscalObligations: {
      adValorem: calculations.adValoremAmount || 0,
      totalDerechosDolares: calculations.finalTotal || 0
    },
    importExpenses: {
      servicioConsolidadoFinal: applyExemption(
        serviceFields.servicioConsolidado * 1.18, 
        exemptions.servicioConsolidadoMaritimo || exemptions.servicioConsolidadoAereo
      ),
      separacionCargaFinal: applyExemption(
        serviceFields.separacionCarga * 1.18, 
        exemptions.separacionCarga
      ),
      inspeccionProductosFinal: applyExemption(
        serviceFields.inspeccionProductos * 1.18,
        exemptions.inspeccionProductos
      ),
      servicioConsolidadoMaritimoFinal: applyExemption(
        serviceFields.servicioConsolidado * 1.18,
        exemptions.servicioConsolidadoMaritimo
      ),
      gestionCertificadoFinal: applyExemption(
        quotationForm.dynamicValues.gestionCertificado * 1.18,
        exemptions.gestionCertificado
      ),
      servicioInspeccionFinal: applyExemption(
        quotationForm.dynamicValues.inspeccionProducto * 1.18,
        exemptions.servicioInspeccion
      ),
      transporteLocalFinal: applyExemption(
        quotationForm.dynamicValues.transporteLocal * 1.18,
        exemptions.transporteLocal
      ),
      desaduanajeFleteSaguro: quotationForm.dynamicValues.desaduanaje || 0,
      finalValues: {
        servicioConsolidado: quotationForm.dynamicValues.servicioConsolidado || 0,
        gestionCertificado: quotationForm.dynamicValues.gestionCertificado || 0,
        servicioInspeccion: quotationForm.dynamicValues.inspeccionProducto || 0,
        transporteLocal: quotationForm.dynamicValues.transporteLocal || 0,
        separacionCarga: quotationForm.dynamicValues.separacionCarga || 0,
        inspeccionProductos: quotationForm.dynamicValues.inspeccionProductos || 0,
        desaduanajeFleteSaguro: quotationForm.dynamicValues.desaduanaje || 0,
        transporteLocalChina: 0,
        transporteLocalCliente: 0
      },
      totalGastosImportacion: calculations.finalTotal || 0
    },
    totals: {
      inversionTotal: calculations.finalTotal || 0
    }
  };

  // Construir products array
  const products: ProductDto[] = buildProductsArray(productsData, quotationForm);

  const quotationResponseData: QuotationResponseDto = {
    quotationInfo,
    calculations: {
      dynamicValues,
      exemptions,
      serviceCalculations
    },
    products
  };

  return {
    data: quotationResponseData,
    quotationId: selectedQuotationId
  };
}

function isAereoService(serviceType: string): boolean {
  return serviceType.toLowerCase().includes('express') || serviceType.toLowerCase().includes('aereo');
}

function isMaritimoService(serviceType: string): boolean {
  return serviceType.toLowerCase().includes('maritimo') || serviceType.toLowerCase().includes('consolidado');
}

function applyExemption(value: number, isExempted: boolean): number {
  return isExempted ? 0 : value;
}

function buildProductsArray(productsData: any[], quotationForm: any): ProductDto[] {
  const isPendingView = quotationForm.selectedServiceLogistic === "Pendiente";

  return productsData.map(product => {
    const isProductSelected = quotationForm.productQuotationState[product.id] !== undefined 
      ? quotationForm.productQuotationState[product.id] 
      : true;

    const variants: ProductVariantDto[] = (product.variants || []).map((variant: any) => {
      const isVariantSelected = quotationForm.variantQuotationState[product.id]?.[variant.id] !== undefined
        ? quotationForm.variantQuotationState[product.id][variant.id]
        : true;

      return {
        variantId: variant.originalVariantId || variant.id,
        quantity: variant.quantity || 0,
        precio_unitario: isPendingView 
          ? (variant.price || 0)  // Para vista pendiente: obtener de quotation-product-row (variant.price)
          : (variant.price || 0), // Para vista no pendiente: obtener de editable-unit-cost-table (variant.price)
        precio_express_unitario: isPendingView 
          ? (variant.priceExpress || 0) // Para vista pendiente: obtener de quotation-product-row (variant.priceExpress)
          : 0, // Para vista no pendiente: por defecto 0
        seCotizaVariante: isVariantSelected,
        unitCost: variant.unitCost || undefined
      };
    });

    return {
      productId: product.id,
      name: product.name,
      adminComment: product.adminComment || "", // Se obtiene de QuotationProductRow
      seCotizaProducto: isProductSelected,
      variants
    };
  });
}