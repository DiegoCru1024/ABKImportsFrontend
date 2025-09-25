import { QuotationResponseBuilder } from "./quotation-response-builder";
import type { QuotationResponseDTO } from "@/types/quotation-response-dto";
import type { ServiceType } from "@/api/interface/quotation-response/enums/enum";
import type {
  PendingBuildData,
  CompleteBuildData,
  QuotationResponseBaseDto
} from "../types/quotation-response-dto";

export interface GeneralInformationInterface {
  serviceLogistic: string;
  incoterm: string;
  cargoType: string;
  courier: string;
}

export interface MaritimeConfigInterface {
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
}

export interface PackingListInterface {
  boxes: number;
  cbm: number;
  weightKg: number;
  weightTon: number;
}

export interface CargoHandlingInterface {
  fragileProduct: boolean;
  stackProduct: boolean;
}

export interface PendingProductData {
  productId: string;
  isQuoted: boolean;
  adminComment?: string;
  ghostUrl?: string;
  packingList?: PackingListInterface;
  cargoHandling?: CargoHandlingInterface;
  variants: Array<{
    variantId: string;
    quantity: number;
    isQuoted: boolean;
    unitPrice: number;
    expressPrice: number;
  }>;
}

export interface CompleteProductData {
  productId: string;
  isQuoted: boolean;
  unitCost: number;
  importCosts: number;
  totalCost: number;
  equivalence: number;
  variants: Array<{
    variantId: string;
    quantity: number;
    isQuoted: boolean;
    unitCost: number;
  }>;
}

export interface CalculationsInterface {
  dynamicValues: {
    comercialValue: number;
    flete: number;
    seguro: number;
    tipoCambio: number;
    cif: number;
    servicioConsolidado: number;
    separacionCarga: number;
    inspeccionProductos: number;
    desaduanaje: number;
    transporteLocalChinaEnvio: number;
    transporteLocalClienteEnvio: number;
    adValoremRate: number;
    igvRate: number;
    ipmRate: number;
    antidumpingAmount?: number;
  };
  taxPercentage: {
    adValoremRate: number;
    igvRate: number;
    ipmRate: number;
    percepcion?: number;
  };
  exemptions: {
    obligacionesFiscales: boolean;
    separacionCarga: boolean;
    inspeccionProductos: boolean;
    servicioConsolidadoAereo?: boolean;
    servicioConsolidadoMaritimo?: boolean;
    totalDerechos?: boolean;
    descuentoGrupalExpress?: boolean;
  };
}

export interface ServiceCalculationsInterface {
  serviceFields: {
    servicioConsolidado: number;
    separacionCarga: number;
    seguroProductos: number;
    inspeccionProductos: number;
    gestionCertificado: number;
    inspeccionProducto: number;
    transporteLocal: number;
  };
  subtotalServices: number;
  igvServices: number;
  totalServices: number;
}

export interface FiscalObligationsInterface {
  adValorem: number;
  igv: number;
  ipm: number;
  antidumping: number;
  totalTaxes: number;
}

export interface ImportCostsInterface {
  expenseFields: {
    servicioConsolidado: number;
    separacionCarga: number;
    seguroProductos: number;
    inspeccionProducts: number;
    addvaloremigvipm: {
      descuento: boolean;
      valor: number;
    };
    desadunajefleteseguro: number;
    transporteLocal: number;
    transporteLocalChinaEnvio: number;
    transporteLocalClienteEnvio: number;
  };
  totalExpenses: number;
}

export interface QuoteSummaryInterface {
  comercialValue: number;
  totalExpenses: number;
  totalInvestment: number;
}

/**
 * QuotationResponseDirector - Implementa el patrón Director para orquestar
 * la construcción de respuestas de cotización complejas.
 *
 * Este director simplifica el proceso de construcción de respuestas de cotización
 * proporcionando métodos estáticos para los casos de uso más comunes.
 */
export class QuotationResponseDirector {
  /**
   * Construye una respuesta de cotización para servicios pendientes
   * @param data - Datos necesarios para construir la respuesta pendiente
   * @returns QuotationResponseBaseDto para servicio pendiente
   */
  static buildPendingService(data: {
    quotationId: string;
    advisorId: string;
    logisticConfig: GeneralInformationInterface;
    products: PendingProductData[];
    aggregatedTotals?: {
      totalCBM: number;
      totalWeight: number;
      totalPrice: number;
      totalExpress: number;
      totalItems: number;
    };
    quotationStates?: {
      products: Record<string, boolean>;
      variants: Record<string, Record<string, boolean>>;
    };
    quotationDetail?: any;
  }): QuotationResponseBaseDto {
    // Crear el builder para servicios pendientes
    const builder = new QuotationResponseBuilder(
      data.quotationId,
      "PENDING" as ServiceType,
      data.quotationDetail
    );

    // Preparar los datos en el formato esperado por el builder actual
    const pendingBuildData: PendingBuildData = {
      products: data.products.map(product => ({
        id: product.productId,
        productId: product.productId,
        name: product.productId, // Se puede mejorar con más información
        adminComment: product.adminComment || "",
        ghostUrl: product.ghostUrl || "",
        packingList: product.packingList ? {
          boxes: product.packingList.boxes,
          cbm: product.packingList.cbm,
          weightKg: product.packingList.weightKg,
          weightTon: product.packingList.weightTon,
        } : undefined,
        cargoHandling: product.cargoHandling,
        variants: product.variants.map(variant => ({
          id: variant.variantId,
          variantId: variant.variantId,
          quantity: variant.quantity,
          price: variant.unitPrice,
          priceExpress: variant.expressPrice,
          express: variant.expressPrice,
        })),
      })),
      aggregatedTotals: data.aggregatedTotals || {
        totalCBM: 0,
        totalWeight: 0,
        totalPrice: 0,
        totalExpress: 0,
        totalItems: 0,
      },
      quotationStates: data.quotationStates || {
        products: {},
        variants: {},
      },
      configuration: data.logisticConfig,
      quotationDetail: data.quotationDetail,
    };

    return builder.buildForPendingService(pendingBuildData);
  }

  /**
   * Construye una respuesta de cotización para servicios marítimos completos
   * @param data - Datos necesarios para construir la respuesta marítima
   * @returns QuotationResponseDTO para servicio marítimo completo
   */
  static buildCompleteMaritimeService(data: {
    quotationId: string;
    advisorId: string;
    logisticConfig: GeneralInformationInterface;
    maritimeConfig: MaritimeConfigInterface;
    products: CompleteProductData[];
    calculations: CalculationsInterface;
    serviceCalculations: ServiceCalculationsInterface;
    importCosts: ImportCostsInterface;
    quoteSummary: QuoteSummaryInterface;
    cifValue: number;
    taxRates: {
      adValoremRate: number;
      igvRate: number;
      ipmRate: number;
      antidumpingAmount?: number;
    };
    quotationDetail?: any;
  }): QuotationResponseDTO {
    // Crear el builder para servicios marítimos
    const builder = new QuotationResponseBuilder(
      data.quotationId,
      "MARITIME" as ServiceType,
      data.quotationDetail
    );

    // Preparar los datos en el formato esperado por el builder
    const completeBuildData: CompleteBuildData = {
      quotationForm: {
        selectedServiceLogistic: data.logisticConfig.serviceLogistic,
        selectedIncoterm: data.logisticConfig.incoterm,
        selectedTypeLoad: data.logisticConfig.cargoType,
        selectedCourier: data.logisticConfig.courier,
        selectedRegimen: data.maritimeConfig.regime,
        selectedPaisOrigen: data.maritimeConfig.originCountry,
        selectedPaisDestino: data.maritimeConfig.destinationCountry,
        selectedAduana: data.maritimeConfig.customs,
        selectedPuertoSalida: data.maritimeConfig.originPort,
        selectedPuertoDestino: data.maritimeConfig.destinationPort,
        selectedTipoServicio: data.maritimeConfig.serviceTypeDetail,
        tiempoTransito: data.maritimeConfig.transitTime,
        naviera: data.maritimeConfig.naviera,
        selectedProformaVigencia: data.maritimeConfig.proformaValidity,
        dynamicValues: {
          ...data.calculations.dynamicValues,
          ...data.taxRates,
        },
        exemptionState: data.calculations.exemptions,
        cif: data.cifValue,
        getServiceFields: () => data.serviceCalculations.serviceFields,
      },
      calculations: {
        totalCBM: 0,
        totalWeight: 0,
        totalPrice: 0,
        totalExpress: 0,
        totalQuantity: 0,
        adValoremAmount: data.cifValue * (data.taxRates.adValoremRate / 100),
        igv: data.cifValue * (data.taxRates.igvRate / 100),
        ipm: data.cifValue * (data.taxRates.ipmRate / 100),
        antidumping: data.taxRates.antidumpingAmount || 0,
        totalTaxes: 0,
        finalTotal: data.quoteSummary.totalExpenses,
      },
      products: data.products.map(product => ({
        id: product.productId,
        name: product.productId, // Se puede mejorar con más información
        seCotiza: product.isQuoted,
        unitCost: product.unitCost,
        importCosts: product.importCosts,
        totalCost: product.totalCost,
        equivalence: product.equivalence,
        variants: product.variants.map(variant => ({
          id: variant.variantId,
          originalVariantId: variant.variantId,
          quantity: variant.quantity,
          seCotiza: variant.isQuoted,
          unitCost: variant.unitCost,
        })),
      })),
      quotationDetail: data.quotationDetail,
    };

    // Calcular totalTaxes automáticamente
    completeBuildData.calculations.totalTaxes =
      completeBuildData.calculations.adValoremAmount +
      completeBuildData.calculations.igv +
      completeBuildData.calculations.ipm +
      completeBuildData.calculations.antidumping;

    return builder.buildForCompleteServiceNew(completeBuildData);
  }

  /**
   * Construye una respuesta de cotización para servicios express completos
   * @param data - Datos necesarios para construir la respuesta express
   * @returns QuotationResponseDTO para servicio express completo
   */
  static buildCompleteExpressService(data: {
    quotationId: string;
    advisorId: string;
    logisticConfig: GeneralInformationInterface;
    products: CompleteProductData[];
    calculations: CalculationsInterface;
    serviceCalculations: ServiceCalculationsInterface;
    importCosts: ImportCostsInterface;
    quoteSummary: QuoteSummaryInterface;
    cifValue: number;
    taxRates: {
      adValoremRate: number;
      igvRate: number;
      ipmRate: number;
      antidumpingAmount?: number;
    };
    quotationDetail?: any;
  }): QuotationResponseDTO {
    // Crear el builder para servicios express
    const builder = new QuotationResponseBuilder(
      data.quotationId,
      "EXPRESS" as ServiceType,
      data.quotationDetail
    );

    // Preparar los datos en el formato esperado por el builder
    const completeBuildData: CompleteBuildData = {
      quotationForm: {
        selectedServiceLogistic: data.logisticConfig.serviceLogistic,
        selectedIncoterm: data.logisticConfig.incoterm,
        selectedTypeLoad: data.logisticConfig.cargoType,
        selectedCourier: data.logisticConfig.courier,
        dynamicValues: {
          ...data.calculations.dynamicValues,
          ...data.taxRates,
        },
        exemptionState: data.calculations.exemptions,
        cif: data.cifValue,
        getServiceFields: () => data.serviceCalculations.serviceFields,
      },
      calculations: {
        totalCBM: 0,
        totalWeight: 0,
        totalPrice: 0,
        totalExpress: 0,
        totalQuantity: 0,
        adValoremAmount: data.cifValue * (data.taxRates.adValoremRate / 100),
        igv: data.cifValue * (data.taxRates.igvRate / 100),
        ipm: data.cifValue * (data.taxRates.ipmRate / 100),
        antidumping: data.taxRates.antidumpingAmount || 0,
        totalTaxes: 0,
        finalTotal: data.quoteSummary.totalExpenses,
      },
      products: data.products.map(product => ({
        id: product.productId,
        name: product.productId, // Se puede mejorar con más información
        seCotiza: product.isQuoted,
        unitCost: product.unitCost,
        importCosts: product.importCosts,
        totalCost: product.totalCost,
        equivalence: product.equivalence,
        variants: product.variants.map(variant => ({
          id: variant.variantId,
          originalVariantId: variant.variantId,
          quantity: variant.quantity,
          seCotiza: variant.isQuoted,
          unitCost: variant.unitCost,
        })),
      })),
      quotationDetail: data.quotationDetail,
    };

    // Calcular totalTaxes automáticamente
    completeBuildData.calculations.totalTaxes =
      completeBuildData.calculations.adValoremAmount +
      completeBuildData.calculations.igv +
      completeBuildData.calculations.ipm +
      completeBuildData.calculations.antidumping;

    return builder.buildForCompleteServiceNew(completeBuildData);
  }

  /**
   * Factory method para crear la configuración marítima por defecto
   * @param overrides - Configuraciones personalizadas para sobrescribir los valores por defecto
   * @returns MaritimeConfigInterface con valores por defecto
   */
  static createDefaultMaritimeConfig(overrides: Partial<MaritimeConfigInterface> = {}): MaritimeConfigInterface {
    return {
      regime: "Importación Definitiva",
      originCountry: "China",
      destinationCountry: "Perú",
      customs: "Callao",
      originPort: "Shanghai",
      destinationPort: "Callao",
      serviceTypeDetail: "FCL",
      transitTime: 25,
      naviera: "COSCO",
      proformaValidity: "30 días",
      ...overrides,
    };
  }

  /**
   * Factory method para crear configuración logística por defecto
   * @param serviceType - Tipo de servicio ("Pendiente", "Consolidado Maritimo", "Consolidado Grupal Express", etc.)
   * @param overrides - Configuraciones personalizadas para sobrescribir los valores por defecto
   * @returns GeneralInformationInterface con valores por defecto
   */
  static createDefaultLogisticConfig(
    serviceType: string,
    overrides: Partial<GeneralInformationInterface> = {}
  ): GeneralInformationInterface {
    const baseConfig = {
      serviceLogistic: serviceType,
      incoterm: "DDP",
      cargoType: "mixto",
      courier: "ups",
      ...overrides,
    };

    // Ajustar configuración basada en el tipo de servicio
    if (serviceType.includes("Maritimo")) {
      baseConfig.incoterm = "FOB";
      baseConfig.cargoType = "contenedor";
      baseConfig.courier = "maritimo";
    }

    return baseConfig;
  }

  /**
   * Valida si los datos proporcionados son válidos para construir una respuesta
   * @param data - Datos a validar
   * @returns Array de errores de validación (vacío si es válido)
   */
  static validateBuildData(data: {
    quotationId?: string;
    products?: any[];
    logisticConfig?: GeneralInformationInterface;
  }): string[] {
    const errors: string[] = [];

    if (!data.quotationId) {
      errors.push("quotationId es requerido");
    }

    if (!data.products || data.products.length === 0) {
      errors.push("Al menos un producto es requerido");
    }

    if (!data.logisticConfig) {
      errors.push("Configuración logística es requerida");
    } else {
      if (!data.logisticConfig.serviceLogistic) {
        errors.push("serviceLogistic es requerido en la configuración logística");
      }
      if (!data.logisticConfig.incoterm) {
        errors.push("incoterm es requerido en la configuración logística");
      }
    }

    return errors;
  }
}