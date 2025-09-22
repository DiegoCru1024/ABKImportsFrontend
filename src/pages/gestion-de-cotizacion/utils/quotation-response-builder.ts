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

import type { QuotationResponseDTO } from "@/types/quotation-response-dto";

export class QuotationResponseBuilder {
  private baseDto: QuotationResponseBaseDto;

  constructor(
    quotationId: string,
    serviceType: ServiceType,
    quotationDetail?: any
  ) {
    this.baseDto = {
      quotationId,
      serviceType,
      quotationInfo: this.buildQuotationInfo(quotationId, quotationDetail),
      responseData: null as any,
      products: [],
    };
  }

  private buildQuotationInfo(
    quotationId: string,
    quotationDetail?: any
  ): QuotationInfoDto {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    // **CORRECCIÓN 1**: Usar el correlativo real de la cotización existente en lugar de generar uno aleatorio
    const correlative =
      quotationDetail?.correlative ||
      `COT-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}-${now.getFullYear()}`;

    return {
      quotationId,
      correlative, // Mapear el correlativo correcto desde quotationDetail
      date: formattedDate,
      advisorId:
        quotationDetail?.advisorId || "75500ef2-e35c-4a77-8074-9104c9d971cb",
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
    return data.products.map((product) => {
      // **CORRECCIÓN 3**: Mapear correctamente el productId
      const productId = product.productId || product.id;

      return {
        productId,
        name: product.name,
        isQuoted: data.quotationStates.products[productId] !== false,
        adminComment: product.adminComment || "",
        ghostUrl: product.ghostUrl || "",
        pricing: this.buildPendingProductPricing(product),
        packingList: this.buildPackingList(product),
        cargoHandling: this.buildCargoHandling(product),
        variants: this.buildPendingVariants(
          product,
          data.quotationStates.variants[productId] || {}
        ),
      };
    });
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
    // **CORRECCIÓN 2**: Mapear correctamente los campos del packingList desde el estado local del producto
    // El producto puede tener packingList actualizado desde la interfaz o usar valores por defecto
    if (!product.packingList && !product.boxes && !product.number_of_boxes)
      return undefined;

    return {
      // Mapear desde packingList.boxes en lugar de packingList.nroBoxes
      nroBoxes:
        product.packingList?.boxes ||
        product.number_of_boxes ||
        product.boxes ||
        0,
      cbm: product.packingList?.cbm || parseFloat(product.volume) || 0,
      // Mapear desde packingList.weightKg en lugar de packingList.pesoKg
      pesoKg: product.packingList?.weightKg || parseFloat(product.weight) || 0,
      // Mapear desde packingList.weightTon en lugar de packingList.pesoTn
      pesoTn:
        product.packingList?.weightTon ||
        parseFloat(product.weight) / 1000 ||
        0,
    };
  }

  private buildCargoHandling(product: any): CargoHandlingDto | undefined {
    if (!product.cargoHandling) return undefined;

    return {
      fragileProduct: product.cargoHandling.fragileProduct || false,
      stackProduct: product.cargoHandling.stackProduct || false,
    };
  }

  private buildPendingVariants(
    product: any,
    variantStates: Record<string, boolean>
  ): PendingProductVariantDto[] {
    if (!product.variants) return [];

    return product.variants.map((variant: any) => {
      // **CORRECCIÓN 3**: Mapear correctamente el variantId y verificar estado de cotización
      const variantId = variant.variantId || variant.id;
      const isQuoted = variantStates[variantId] !== false; // Default a true si no está definido

      return {
        variantId,
        quantity: variant.quantity || 1,
        isQuoted,
        pendingPricing: {
          unitPrice: variant.price || 0,
          expressPrice: variant.priceExpress || variant.express || 0,
        },
      };
    });
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

  private determineServiceType(
    serviceLogistic: string
  ): "EXPRESS" | "MARITIME" {
    const maritimeServices = ["Consolidado Maritimo", "Consolidado Grupal Maritimo"];
    return maritimeServices.includes(serviceLogistic) ? "MARITIME" : "EXPRESS";
  }

  private extractCalculations(data: CompleteBuildData) {
    return {
      dynamicValues: this.extractDynamicValues(data),
      //Obligaciones fiscales
      fiscalObligations: this.extractFiscalObligations(data),
      //Servicios de Carga
      serviceCalculations: this.extractServiceCalculations(data),
      //Excepciones
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
      transporteLocalChinaEnvio: dynamicValues.transporteLocalChinaEnvio || 0,
      transporteLocalClienteEnvio:
        dynamicValues.transporteLocalClienteEnvio || 0,
      cif: dynamicValues.cif || 0,
    };
  }

  private extractFiscalObligations(
    data: CompleteBuildData
  ): FiscalObligationsDto {
    const calculations = data.calculations;
    return {
      adValorem: calculations.adValoremAmount || 0,
      igv: calculations.igv || 0,
      ipm: calculations.ipm || 0,
      antidumping: calculations.antidumping || 0,
      totalTaxes:
        (calculations.adValoremAmount || 0) +
        (calculations.igv || 0) +
        (calculations.ipm || 0) +
        (calculations.antidumping || 0),
    };
  }

  private extractServiceCalculations(
    data: CompleteBuildData
  ): ServiceCalculationsDto {
    const serviceFields = data.quotationForm.getServiceFields();
    const subtotal = Object.values(serviceFields).reduce(
      (sum: number, value: unknown) =>
        sum + ((typeof value === "number" ? value : 0) || 0),
      0
    );

    return {
      serviceFields: {
        servicioConsolidado: serviceFields.servicioConsolidado || 0,
        separacionCarga: serviceFields.separacionCarga || 0,
        seguroProductos: serviceFields.seguroProductos || 0,
        inspeccionProductos: serviceFields.inspeccionProductos || 0,
        gestionCertificado: serviceFields.gestionCertificado || 0,
        inspeccionProducto: serviceFields.inspeccionProducto || 0,
        transporteLocal: serviceFields.transporteLocal || 0,
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
      descuentoGrupalExpress: exemptions.descuentoGrupalExpress || false,
    };
  }

  private extractCommercialDetails(
    data: CompleteBuildData
  ): CommercialDetailsDto {
    const calculations = data.calculations;
    return {
      cif: data.quotationForm.cif || 0,
      totalImportCosts: calculations.finalTotal || 0,
      totalInvestment:
        (data.quotationForm.cif || 0) + (calculations.finalTotal || 0),
    };
  }

  buildForPendingService(data: PendingBuildData): QuotationResponseBaseDto {
    // Actualizar información de cotización para servicios pendientes
    this.baseDto.quotationInfo.serviceLogistic = "Pendiente";



    // Actualizar configuración si está disponible en los datos
    if (data.configuration) {
      this.baseDto.quotationInfo.serviceLogistic =
        data.configuration.serviceLogistic || "Pendiente";
      this.baseDto.quotationInfo.incoterm =
        data.configuration.incoterm || "DDP";
      this.baseDto.quotationInfo.cargoType =
        data.configuration.cargoType || "mixto";
      this.baseDto.quotationInfo.courier = data.configuration.courier || "ups";
    }

    this.baseDto.responseData = {
      type: "PENDING",
      basicInfo: this.extractPendingBasicInfo(data),
      generalInformation:{
        serviceLogistic: data?.configuration?.serviceLogistic || "Pendiente",
        incoterm: data?.configuration?.incoterm || "DDP",
        cargoType:data?.configuration?.cargoType || "mixto",
        courier: data?.configuration?.courier || "ups"
      }
    } as PendingServiceData;

    this.baseDto.products = this.buildPendingProducts(data);
    return this.baseDto;
  }

  buildForCompleteService(data: CompleteBuildData): QuotationResponseBaseDto {
    const serviceType = this.determineServiceType(
      data.quotationForm.selectedServiceLogistic
    );

    // Actualizar información de cotización para servicios completos
    this.baseDto.serviceType = serviceType;
    this.baseDto.quotationInfo.serviceLogistic =
      data.quotationForm.selectedServiceLogistic;
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
      type: data.quotationForm.selectedServiceLogistic,
      basicInfo: this.extractCompleteBasicInfo(data),
      calculations: this.extractCalculations(data),
      commercialDetails: this.extractCommercialDetails(data),
    } as CompleteServiceData;

    this.baseDto.products = this.buildCompleteProducts(data);
    return this.baseDto;
  }

  buildForCompleteServiceNew(data: CompleteBuildData): QuotationResponseDTO {
    const serviceType = this.determineServiceType(
      data.quotationForm.selectedServiceLogistic
    );

    // Construir la configuración marítima si aplica
    const maritimeConfig = serviceType === "MARITIME" ? {
      regime: data.quotationForm.selectedRegimen || "",
      originCountry: data.quotationForm.selectedPaisOrigen || "",
      destinationCountry: data.quotationForm.selectedPaisDestino || "",
      customs: data.quotationForm.selectedAduana || "",
      originPort: data.quotationForm.selectedPuertoSalida || "",
      destinationPort: data.quotationForm.selectedPuertoDestino || "",
      serviceTypeDetail: data.quotationForm.selectedTipoServicio || "",
      transitTime: data.quotationForm.tiempoTransito || 0,
      naviera: data.quotationForm.naviera || "",
      proformaValidity: data.quotationForm.selectedProformaVigencia || "5",
    } : {
      regime: "",
      originCountry: "",
      destinationCountry: "",
      customs: "",
      originPort: "",
      destinationPort: "",
      serviceTypeDetail: "",
      transitTime: 0,
      naviera: "",
      proformaValidity: "5",
    };

    return {
      quotationId: this.baseDto.quotationId,
      serviceType,
      quotationInfo: {
        quotationId: this.baseDto.quotationId,
        correlative: this.baseDto.quotationInfo.correlative,
        date: this.baseDto.quotationInfo.date,
        advisorId: this.baseDto.quotationInfo.advisorId,
      },
      responseData: {
        type: data.quotationForm.selectedServiceLogistic,
        basicInfo: this.extractCompleteBasicInfo(data),
        generalInformation: {
          serviceLogistic: data.quotationForm.selectedServiceLogistic,
          incoterm: data.quotationForm.selectedIncoterm,
          cargoType: data.quotationForm.selectedTypeLoad,
          courier: data.quotationForm.selectedCourier,
        },
        maritimeConfig,
        calculations: {
          dynamicValues: this.extractDynamicValuesNew(data),
          taxPercentage: {
            adValoremRate: data.quotationForm.dynamicValues.adValoremRate || 4,
            igvRate: data.quotationForm.dynamicValues.igvRate || 16,
            ipmRate: data.quotationForm.dynamicValues.ipmRate || 2,
            percepcion: data.quotationForm.dynamicValues.percepcionRate || 5,
          },
          exemptions: this.extractExemptionsNew(data),
        },
        serviceCalculations: this.extractServiceCalculationsNew(data),
        fiscalObligations: this.extractFiscalObligationsNew(data),
        importCosts: this.extractImportCosts(data),
        quoteSummary: this.extractQuoteSummary(data),
      },
      products: this.buildCompleteProductsNew(data),
    };
  }

  private extractImportCosts(data: CompleteBuildData) {
    const serviceFields = data.quotationForm.getServiceFields();
    const calculations = data.calculations;

    return {
      expenseFields: {
        servicioConsolidado: serviceFields.servicioConsolidado || 0,
        separacionCarga: serviceFields.separacionCarga || 0,
        seguroProductos: serviceFields.seguroProductos || 0,
        inspeccionProducts: serviceFields.inspeccionProductos || 0,
        addvaloremigvipm: {
          descuento: data.quotationForm.exemptionState.obligacionesFiscales || false,
          valor: calculations.totalTaxes || 0,
        },
        desadunajefleteseguro: data.quotationForm.dynamicValues.desaduanaje || 0,
        transporteLocal: serviceFields.transporteLocal || 0,
        transporteLocalChinaEnvio: data.quotationForm.dynamicValues.transporteLocalChinaEnvio || 0,
        transporteLocalClienteEnvio: data.quotationForm.dynamicValues.transporteLocalClienteEnvio || 0,
      },
      totalExpenses: calculations.finalTotal || 0,
    };
  }

  private extractDynamicValuesNew(data: CompleteBuildData) {
    const dynamicValues = data.quotationForm.dynamicValues;
    return {
      comercialValue: dynamicValues.comercialValue || 0,
      flete: dynamicValues.flete || 0,
      cajas: dynamicValues.cajas || 0,
      kg: dynamicValues.kg || 0,
      ton: dynamicValues.ton || 0,
      fob: dynamicValues.fob || 0,
      seguro: dynamicValues.seguro || 0,
      tipoCambio: dynamicValues.tipoCambio || 3.7,
      volumenCBM: dynamicValues.volumenCBM || 0,
      calculoFlete: dynamicValues.calculoFlete || 0,
      servicioConsolidado: dynamicValues.servicioConsolidado || 0,
      separacionCarga: dynamicValues.separacionCarga || 0,
      inspeccionProductos: dynamicValues.inspeccionProductos || 0,
      gestionCertificado: dynamicValues.gestionCertificado || 0,
      inspeccionProducto: dynamicValues.inspeccionProducto || 0,
      transporteLocal: dynamicValues.transporteLocal || 0,
      desaduanaje: dynamicValues.desaduanaje || 0,
      antidumpingGobierno: dynamicValues.antidumpingGobierno || 0,
      antidumpingCantidad: dynamicValues.antidumpingCantidad || 0,
      transporteLocalChinaEnvio: dynamicValues.transporteLocalChinaEnvio || 0,
      transporteLocalClienteEnvio: dynamicValues.transporteLocalClienteEnvio || 0,
      cif: dynamicValues.cif || 0,
    };
  }

  private extractExemptionsNew(data: CompleteBuildData) {
    const exemptions = data.quotationForm.exemptionState;
    return {
      servicioConsolidadoAereo: exemptions.servicioConsolidadoAereo || false,
      servicioConsolidadoMaritimo: exemptions.servicioConsolidadoMaritimo || false,
      separacionCarga: exemptions.separacionCarga || false,
      inspeccionProductos: exemptions.inspeccionProductos || false,
      obligacionesFiscales: exemptions.obligacionesFiscales || false,
      gestionCertificado: exemptions.gestionCertificado || false,
      servicioInspeccion: exemptions.servicioInspeccion || false,
      transporteLocal: exemptions.transporteLocal || false,
      totalDerechos: exemptions.totalDerechos || false,
      descuentoGrupalExpress: exemptions.descuentoGrupalExpress || false,
    };
  }

  private extractFiscalObligationsNew(data: CompleteBuildData) {
    const calculations = data.calculations;
    return {
      adValorem: calculations.adValoremAmount || 0,
      igv: calculations.igv || 0,
      ipm: calculations.ipm || 0,
      antidumping: calculations.antidumping || 0,
      totalTaxes:
        (calculations.adValoremAmount || 0) +
        (calculations.igv || 0) +
        (calculations.ipm || 0) +
        (calculations.antidumping || 0),
    };
  }

  private extractServiceCalculationsNew(data: CompleteBuildData) {
    const serviceFields = data.quotationForm.getServiceFields();
    const subtotal = Object.values(serviceFields).reduce(
      (sum: number, value: unknown) =>
        sum + ((typeof value === "number" ? value : 0) || 0),
      0
    );

    return {
      serviceFields: {
        servicioConsolidado: serviceFields.servicioConsolidado || 0,
        separacionCarga: serviceFields.separacionCarga || 0,
        seguroProductos: serviceFields.seguroProductos || 0,
        inspeccionProductos: serviceFields.inspeccionProductos || 0,
        gestionCertificado: serviceFields.gestionCertificado || 0,
        inspeccionProducto: serviceFields.inspeccionProducto || 0,
        transporteLocal: serviceFields.transporteLocal || 0,
      },
      subtotalServices: subtotal,
      igvServices: subtotal * 0.18,
      totalServices: subtotal * 1.18,
    };
  }

  private extractQuoteSummary(data: CompleteBuildData) {
    const calculations = data.calculations;

    return {
      comercialValue: data.quotationForm.dynamicValues.comercialValue || 0,
      totalExpenses: calculations.finalTotal || 0,
      totalInvestment: (data.quotationForm.dynamicValues.comercialValue || 0) + (calculations.finalTotal || 0),
    };
  }

  private buildCompleteProductsNew(data: CompleteBuildData) {
    return data.products.map((product) => ({
      productId: product.id,
      name: product.name,
      isQuoted: product.seCotiza !== false,
      pricing: {
        unitCost: product.unitCost || 0,
        importCosts: product.importCosts || 0,
        totalCost: product.totalCost || 0,
        equivalence: product.equivalence || 0,
      },
      variants: (product.variants || []).map((variant: any) => ({
        variantId: variant.originalVariantId || variant.id,
        quantity: variant.quantity || 1,
        isQuoted: variant.seCotiza !== false,
        completePricing: {
          unitCost: variant.unitCost || 0,
        },
      })),
    }));
  }
}
