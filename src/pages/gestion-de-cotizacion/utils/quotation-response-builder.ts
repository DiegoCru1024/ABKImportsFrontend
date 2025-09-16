import type {
  QuotationResponseBaseDto,
  PendingServiceData,
  CompleteServiceData,
  ProductResponseDto,
  QuotationInfoDto,
  PendingBuildData,
  CompleteBuildData,
  ServiceType,
  PendingProductVariantDto,
  CompleteProductVariantDto,
  BasicInfoDto,
  DynamicValuesDto,
  FiscalObligationsDto,
  ServiceCalculationsDto,
  ExemptionsDto,
  CommercialDetailsDto,
  PendingProductPricingDto,
  CompleteProductPricingDto,
  PackingListDto,
  CargoHandlingDto,
} from "../types/quotation-response-dto";

export class QuotationResponseBuilder {
  private baseDto: QuotationResponseBaseDto;

  constructor(quotationId: string, serviceType: ServiceType) {
    this.baseDto = {
      quotationId,
      serviceType,
      quotationInfo: this.buildQuotationInfo(quotationId),
      responseData: null as any,
      products: [],
    };
  }

  private buildQuotationInfo(quotationId: string): QuotationInfoDto {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

    return {
      quotationId,
      correlative: `COT-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${now.getFullYear()}`,
      date: formattedDate,
      advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb", // TODO: Obtener del contexto de auth
      serviceLogistic: "Pendiente",
      incoterm: "DDP",
      cargoType: "mixto",
      courier: "ups",
    };
  }

  private extractPendingBasicInfo(data: PendingBuildData): BasicInfoDto {
    return {
      totalCBM: data.aggregatedTotals?.totalCBM || 0,
      totalWeight: data.aggregatedTotals?.totalWeight || 0,
      totalPrice: data.aggregatedTotals?.totalPrice || 0,
      totalExpress: data.aggregatedTotals?.totalExpress || 0,
      totalQuantity: data.aggregatedTotals?.totalItems || 0,
    };
  }

  private extractCompleteBasicInfo(data: CompleteBuildData): BasicInfoDto {
    return {
      totalCBM: data.calculations?.totalCBM || 0,
      totalWeight: data.calculations?.totalWeight || 0,
      totalPrice: data.calculations?.totalPrice || 0,
      totalExpress: data.calculations?.totalExpress || 0,
      totalQuantity: data.calculations?.totalQuantity || 0,
    };
  }

  private buildPendingProducts(data: PendingBuildData): ProductResponseDto[] {
    return data.products.map((product) => ({
      productId: product.id,
      name: product.name,
      isQuoted: data.quotationStates.products[product.id] !== false,
      adminComment: product.adminComment || "",
      ghostUrl: product.ghostUrl || "",
      pricing: this.buildPendingProductPricing(product),
      packingList: this.buildPackingList(product),
      cargoHandling: this.buildCargoHandling(product),
      variants: this.buildPendingVariants(product, data.quotationStates.variants[product.id] || {}),
    }));
  }

  private buildCompleteProducts(data: CompleteBuildData): ProductResponseDto[] {
    return data.products.map((product) => ({
      productId: product.id,
      name: product.name,
      isQuoted: product.seCotiza !== false,
      pricing: this.buildCompleteProductPricing(product),
      variants: this.buildCompleteVariants(product),
    }));
  }

  private buildPendingProductPricing(product: any): PendingProductPricingDto {
    return {
      totalPrice: product.price || 0,
      totalWeight: product.weight || 0,
      totalCBM: product.cbm || 0,
      totalQuantity: product.quantity || product.boxes || 1,
      totalExpress: product.express || 0,
    };
  }

  private buildCompleteProductPricing(product: any): CompleteProductPricingDto {
    return {
      unitCost: product.unitCost || 0,
      importCosts: product.importCosts || 0,
      totalCost: product.totalCost || 0,
      equivalence: product.equivalence || 0,
    };
  }

  private buildPackingList(product: any): PackingListDto | undefined {
    if (!product.packingList && !product.boxes) return undefined;

    return {
      nroBoxes: product.packingList?.nroBoxes || product.boxes || 0,
      cbm: product.packingList?.cbm || product.cbm || 0,
      pesoKg: product.packingList?.pesoKg || product.weight || 0,
      pesoTn: product.packingList?.pesoTn || (product.weight / 1000) || 0,
    };
  }

  private buildCargoHandling(product: any): CargoHandlingDto | undefined {
    if (!product.cargoHandling) return undefined;

    return {
      fragileProduct: product.cargoHandling.fragileProduct || false,
      stackProduct: product.cargoHandling.stackProduct || false,
    };
  }

  private buildPendingVariants(product: any, variantStates: Record<string, boolean>): PendingProductVariantDto[] {
    if (!product.variants) return [];

    return product.variants.map((variant: any) => ({
      variantId: variant.id,
      quantity: variant.quantity || 1,
      isQuoted: variantStates[variant.id] !== false,
      pendingPricing: {
        unitPrice: variant.price || 0,
        expressPrice: variant.priceExpress || variant.express || 0,
      },
    }));
  }

  private buildCompleteVariants(product: any): CompleteProductVariantDto[] {
    if (!product.variants) return [];

    return product.variants.map((variant: any) => ({
      variantId: variant.originalVariantId || variant.id,
      quantity: variant.quantity || 1,
      isQuoted: variant.seCotiza !== false,
      completePricing: {
        unitCost: variant.unitCost || 0,
      },
    }));
  }

  private determineServiceType(serviceLogistic: string): "EXPRESS" | "MARITIME" {
    const maritimeServices = ["Consolidado Maritimo", "Contenedor Completo"];
    return maritimeServices.includes(serviceLogistic) ? "MARITIME" : "EXPRESS";
  }

  private extractCalculations(data: CompleteBuildData) {
    return {
      dynamicValues: this.extractDynamicValues(data),
      fiscalObligations: this.extractFiscalObligations(data),
      serviceCalculations: this.extractServiceCalculations(data),
      exemptions: this.extractExemptions(data),
    };
  }

  private extractDynamicValues(data: CompleteBuildData): DynamicValuesDto {
    const dynamicValues = data.quotationForm.dynamicValues;
    return {
      comercialValue: dynamicValues.comercialValue || 0,
      flete: dynamicValues.flete || 0,
      cajas: dynamicValues.cajas || 0,
      kg: dynamicValues.kg || 0,
      ton: dynamicValues.ton,
      fob: dynamicValues.fob || 0,
      seguro: dynamicValues.seguro || 0,
      tipoCambio: dynamicValues.tipoCambio || 3.7,
      volumenCBM: dynamicValues.volumenCBM,
      calculoFlete: dynamicValues.calculoFlete,
      servicioConsolidado: dynamicValues.servicioConsolidado || 0,
      separacionCarga: dynamicValues.separacionCarga || 0,
      inspeccionProductos: dynamicValues.inspeccionProductos || 0,
      gestionCertificado: dynamicValues.gestionCertificado,
      inspeccionProducto: dynamicValues.inspeccionProducto,
      transporteLocal: dynamicValues.transporteLocal,
      desaduanaje: dynamicValues.desaduanaje,
      adValoremRate: dynamicValues.adValoremRate || 4.0,
      igvRate: dynamicValues.igvRate || 18.0,
      ipmRate: dynamicValues.ipmRate || 2.0,
      antidumpingGobierno: dynamicValues.antidumpingGobierno,
      antidumpingCantidad: dynamicValues.antidumpingCantidad,
      cif: dynamicValues.cif || 0,
    };
  }

  private extractFiscalObligations(data: CompleteBuildData): FiscalObligationsDto {
    const calculations = data.calculations;
    return {
      adValorem: calculations.adValoremAmount || 0,
      igv: calculations.igv || 0,
      ipm: calculations.ipm || 0,
      antidumping: calculations.antidumping || 0,
      totalTaxes: (calculations.adValoremAmount || 0) + (calculations.igv || 0) + (calculations.ipm || 0) + (calculations.antidumping || 0),
    };
  }

  private extractServiceCalculations(data: CompleteBuildData): ServiceCalculationsDto {
    const serviceFields = data.quotationForm.getServiceFields();
    const subtotal = Object.values(serviceFields).reduce((sum, value) => sum + (value || 0), 0);

    return {
      serviceFields: {
        servicioConsolidado: serviceFields.servicioConsolidado || 0,
        separacionCarga: serviceFields.separacionCarga || 0,
        inspeccionProductos: serviceFields.inspeccionProductos || 0,
        gestionCertificado: serviceFields.gestionCertificado,
        inspeccionProducto: serviceFields.inspeccionProducto,
        transporteLocal: serviceFields.transporteLocal,
      },
      subtotalServices: subtotal,
      igvServices: subtotal * 0.18,
      totalServices: subtotal * 1.18,
    };
  }

  private extractExemptions(data: CompleteBuildData): ExemptionsDto {
    const exemptions = data.quotationForm.exemptionState;
    return {
      servicioConsolidadoAereo: exemptions.servicioConsolidadoAereo,
      servicioConsolidadoMaritimo: exemptions.servicioConsolidadoMaritimo,
      separacionCarga: exemptions.separacionCarga || false,
      inspeccionProductos: exemptions.inspeccionProductos || false,
      obligacionesFiscales: exemptions.obligacionesFiscales || false,
      gestionCertificado: exemptions.gestionCertificado,
      servicioInspeccion: exemptions.servicioInspeccion,
      transporteLocal: exemptions.transporteLocal,
      totalDerechos: exemptions.totalDerechos,
    };
  }

  private extractCommercialDetails(data: CompleteBuildData): CommercialDetailsDto {
    const calculations = data.calculations;
    return {
      cif: data.quotationForm.cif || 0,
      totalImportCosts: calculations.finalTotal || 0,
      totalInvestment: (data.quotationForm.cif || 0) + (calculations.finalTotal || 0),
    };
  }

  buildForPendingService(data: PendingBuildData): QuotationResponseBaseDto {
    // Actualizar información de cotización para servicios pendientes
    this.baseDto.quotationInfo.serviceLogistic = "Pendiente";

    this.baseDto.responseData = {
      type: "PENDING",
      basicInfo: this.extractPendingBasicInfo(data),
    } as PendingServiceData;

    this.baseDto.products = this.buildPendingProducts(data);
    return this.baseDto;
  }

  buildForCompleteService(data: CompleteBuildData): QuotationResponseBaseDto {
    const serviceType = this.determineServiceType(data.quotationForm.selectedServiceLogistic);

    // Actualizar información de cotización para servicios completos
    this.baseDto.serviceType = serviceType;
    this.baseDto.quotationInfo.serviceLogistic = data.quotationForm.selectedServiceLogistic;
    this.baseDto.quotationInfo.incoterm = data.quotationForm.selectedIncoterm;
    this.baseDto.quotationInfo.cargoType = data.quotationForm.selectedTypeLoad;
    this.baseDto.quotationInfo.courier = data.quotationForm.selectedCourier;

    // Agregar configuración marítima si aplica
    if (serviceType === "MARITIME") {
      this.baseDto.quotationInfo.maritimeConfig = {
        regime: data.quotationForm.selectedRegimen,
        originCountry: data.quotationForm.selectedPaisOrigen,
        destinationCountry: data.quotationForm.selectedPaisDestino,
        customs: data.quotationForm.selectedAduana,
        originPort: data.quotationForm.selectedPuertoSalida,
        destinationPort: data.quotationForm.selectedPuertoDestino,
        serviceTypeDetail: data.quotationForm.selectedTipoServicio,
        transitTime: data.quotationForm.tiempoTransito,
        naviera: data.quotationForm.naviera,
        proformaValidity: data.quotationForm.selectedProformaVigencia,
      };
    }

    this.baseDto.responseData = {
      type: serviceType,
      basicInfo: this.extractCompleteBasicInfo(data),
      calculations: this.extractCalculations(data),
      commercialDetails: this.extractCommercialDetails(data),
    } as CompleteServiceData;

    this.baseDto.products = this.buildCompleteProducts(data);
    return this.baseDto;
  }
}