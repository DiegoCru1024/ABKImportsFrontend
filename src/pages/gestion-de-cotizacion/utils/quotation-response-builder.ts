// Clean Code: Only import official API interfaces
import type { QuotationResponseBase } from "@/api/interface/quotation-response/quotation-response-base";
import { ServiceType } from "@/api/interface/quotation-response/enums/enum";
import type { ResponseDataPending } from "@/api/interface/quotation-response/dto/pending/response-data-pending";
import type { ResponseDataComplete } from "@/api/interface/quotation-response/dto/complete/response-data-complete";
import type { ResumenInfoInterface } from "@/api/interface/quotation-response/dto/shared/resume-information";
// GeneralInformationInterface not directly used in builder
import type { PendingProductInterface } from "@/api/interface/quotation-response/dto/pending/products/pending-products";
import type { CompleteProductInterface } from "@/api/interface/quotation-response/dto/complete/products/complete-products";
import type { PackingListInterface } from "@/api/interface/quotation-response/dto/pending/products/packing-list";
import type { CargoHandlingInterface } from "@/api/interface/quotation-response/dto/pending/products/cargo-handling";
import type { PendingVariantInterface } from "@/api/interface/quotation-response/dto/pending/variants/pending-variants";
import type { CompleteVariantInterface } from "@/api/interface/quotation-response/dto/complete/variants/complete-variant";
import type { PricingInterface } from "@/api/interface/quotation-response/dto/complete/products/pricing";
import type { CalculationsInterface } from "@/api/interface/quotation-response/dto/complete/objects/calculations";
import type { MaritimeConfigInterface } from "@/api/interface/quotation-response/dto/complete/objects/maritime-config";
import type { FiscalObligationsInterface } from "@/api/interface/quotation-response/dto/complete/objects/fiscal-obligations";
import type { ServiceCalculationsInterface } from "@/api/interface/quotation-response/dto/complete/service-calculations";
import type { ImportCostsInterface } from "@/api/interface/quotation-response/dto/complete/objects/import-costs";
import type { QuoteSummaryInterface } from "@/api/interface/quotation-response/dto/complete/objects/quote-summary";
import type { DynamicValuesInterface } from "@/api/interface/quotation-response/dto/complete/objects/dynamic-values";
import type { ExemptionsInterface } from "@/api/interface/quotation-response/dto/complete/objects/exemptions";
import type { TaxPercentageInterface } from "@/api/interface/quotation-response/dto/complete/tax-percentage";
import type { PendingBuildData, CompleteBuildData } from "../types/quotation-response-dto";

export class QuotationResponseBuilder {
  private baseDto: QuotationResponseBase;

  constructor(
    quotationId: string,
    serviceType: ServiceType,
    quotationDetail?: unknown
  ) {
    this.baseDto = {
      quotationId,
      response_date: new Date(),
      advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb",
      serviceType,
      responseData: null as unknown as ResponseDataPending | ResponseDataComplete,
      products: [],
    };
  }

 
  private extractResumenInfo(data: PendingBuildData): ResumenInfoInterface {
    return {
      totalCBM: data.aggregatedTotals?.totalCBM || 0,
      totalWeight: data.aggregatedTotals?.totalWeight || 0,
      totalPrice: data.aggregatedTotals?.totalPrice || 0,
      totalExpress: data.aggregatedTotals?.totalExpress || 0,
      totalQuantity: data.aggregatedTotals?.totalItems || 0,
    };
  }

  private extractCompleteBasicInfo(data: CompleteBuildData): ResumenInfoInterface {
    const calculations = data.calculations as Record<string, unknown> | undefined;
    return {
      totalCBM: (calculations?.totalCBM as number) || 0,
      totalWeight: (calculations?.totalWeight as number) || 0,
      totalPrice: (calculations?.totalPrice as number) || 0,
      totalExpress: (calculations?.totalExpress as number) || 0,
      totalQuantity: (calculations?.totalQuantity as number) || 0,
    }
  }

  private buildPendingProducts(data: PendingBuildData): PendingProductInterface[] {
    return data.products.map((product) => {
      const productObj = product as Record<string, unknown>;
      const productId = (productObj.productId as string) || (productObj.id as string);

      return {
        productId,
        isQuoted: data.quotationStates.products[productId] !== false,
        adminComment: (productObj.adminComment as string) || "",
        ghostUrl: (productObj.ghostUrl as string) || "",
        packingList: this.buildPackingList(product),
        cargoHandling: this.buildCargoHandling(product),
        variants: this.buildPendingVariants(
          product,
          data.quotationStates.variants[productId] || {}
        ),
      };
    });
  }

  private buildCompleteProducts(data: CompleteBuildData): CompleteProductInterface[] {
    return data.products.map((product) => {
      const productObj = product as Record<string, unknown>;
      return {
        productId: productObj.id as string,
        isQuoted: (productObj.seCotiza as boolean) !== false,
        pricing: this.buildCompleteProductPricing(product),
        variants: this.buildCompleteVariants(product),
      };
    });
  }

  // Removed - pricing is handled at variant level for pending products

  private buildCompleteProductPricing(product: unknown): PricingInterface {
    const productObj = product as Record<string, unknown>;
    return {
      unitCost: (productObj.unitCost as number) || 0,
      importCosts: (productObj.importCosts as number) || 0,
      totalCost: (productObj.totalCost as number) || 0,
      equivalence: (productObj.equivalence as number) || 0,
    };
  }

  private buildPackingList(product: unknown): PackingListInterface | undefined {
    const productObj = product as Record<string, unknown>;
    const packingList = productObj.packingList as Record<string, unknown> | undefined;

    if (!packingList && !productObj.boxes && !productObj.number_of_boxes)
      return undefined;

    return {
      nroBoxes:
        (packingList?.boxes as number) ||
        (productObj.number_of_boxes as number) ||
        (productObj.boxes as number) ||
        0,
      cbm: (packingList?.cbm as number) || parseFloat((productObj.volume as string) || '0') || 0,
      pesoKg: (packingList?.weightKg as number) || parseFloat((productObj.weight as string) || '0') || 0,
      pesoTn:
        (packingList?.weightTon as number) ||
        parseFloat((productObj.weight as string) || '0') / 1000 ||
        0,
    };
  }

  private buildCargoHandling(product: unknown): CargoHandlingInterface | undefined {
    const productObj = product as Record<string, unknown>;
    const cargoHandling = productObj.cargoHandling as Record<string, boolean> | undefined;

    if (!cargoHandling) return undefined;

    return {
      fragileProduct: cargoHandling.fragileProduct || false,
      stackProduct: cargoHandling.stackProduct || false,
    };
  }

  private buildPendingVariants(
    product: unknown,
    variantStates: Record<string, boolean>
  ): PendingVariantInterface[] {
    const productObj = product as Record<string, unknown>;
    const variants = productObj.variants as Record<string, unknown>[] | undefined;

    if (!variants) return [];

    return variants.map((variant) => {
      const variantId = (variant.variantId as string) || (variant.id as string);
      const isQuoted = variantStates[variantId] !== false;

      return {
        variantId,
        quantity: (variant.quantity as number) || 1,
        isQuoted,
        pendingPricing: {
          unitPrice: (variant.price as number) || 0,
          expressPrice: (variant.priceExpress as number) || (variant.express as number) || 0,
        },
      };
    });
  }

  private buildCompleteVariants(product: unknown): CompleteVariantInterface[] {
    const productObj = product as Record<string, unknown>;
    const variants = productObj.variants as Record<string, unknown>[] | undefined;

    if (!variants) return [];

    return variants.map((variant) => ({
      variantId: (variant.originalVariantId as string) || (variant.id as string),
      quantity: (variant.quantity as number) || 1,
      isQuoted: (variant.seCotiza as boolean) !== false,
      completePricing: {
        unitCost: (variant.unitCost as number) || 0,
      },
    }));
  }

  private determineServiceType(
    serviceLogistic: string
  ): ServiceType {
    const maritimeServices = ["Consolidado Maritimo", "Consolidado Grupal Maritimo"];
    return maritimeServices.includes(serviceLogistic)
      ? ServiceType.MARITIME
      : ServiceType.EXPRESS;
  }

  private extractCalculations(data: CompleteBuildData): CalculationsInterface {
    return {
      dynamicValues: this.extractDynamicValues(data),
      taxPercentage: this.extractTaxPercentage(data),
      exemptions: this.extractExemptions(data),
    };
  }

  private extractDynamicValues(data: CompleteBuildData): DynamicValuesInterface {
    const quotationForm = data.quotationForm as Record<string, unknown>;
    const dynamicValues = quotationForm.dynamicValues as Record<string, unknown>;
    return {
      comercialValue: (dynamicValues.comercialValue as number) || 0,
      flete: (dynamicValues.flete as number) || 0,
      cajas: (dynamicValues.cajas as number) || 0,
      kg: (dynamicValues.kg as number) || 0,
      ton: (dynamicValues.ton as number) || 0,
      fob: (dynamicValues.fob as number) || 0,
      seguro: (dynamicValues.seguro as number) || 0,
      tipoCambio: (dynamicValues.tipoCambio as number) || 3.7,
      volumenCBM: (dynamicValues.volumenCBM as number) || 0,
      calculoFlete: (dynamicValues.calculoFlete as number) || 0,
     
      desaduanaje: (dynamicValues.desaduanaje as number) || 0,
      antidumpingGobierno: (dynamicValues.antidumpingGobierno as number) || 0,
      antidumpingCantidad: (dynamicValues.antidumpingCantidad as number) || 0,
      transporteLocalChinaEnvio: (dynamicValues.transporteLocalChinaEnvio as number) || 0,
      transporteLocalClienteEnvio: (dynamicValues.transporteLocalClienteEnvio as number) || 0,
      cif: (dynamicValues.cif as number) || 0,
    };
  }

  private extractFiscalObligations(
    data: CompleteBuildData
  ): FiscalObligationsInterface {
    const calculations = data.calculations as Record<string, unknown>;
    const quotationForm = data.quotationForm as Record<string, unknown>;
    const dynamicValues = quotationForm.dynamicValues as Record<string, unknown>;

    const adValorem = parseFloat(
      ((calculations.adValoremAmount as number) || 0).toFixed(2)
    );
    const isc = parseFloat(((calculations.isc as number) || 0).toFixed(2));
    const igv = parseFloat(((calculations.igv as number) || 0).toFixed(2));
    const ipm = parseFloat(((calculations.ipm as number) || 0).toFixed(2));
    const percepcion = parseFloat(
      ((calculations.percepcion as number) || 0).toFixed(2)
    );
    const antidumpingValor = parseFloat(
      ((calculations.antidumping as number) || 0).toFixed(2)
    );

    return {
      adValorem,
      isc,
      igv,
      ipm,
      antidumping: {
        antidumpingGobierno:
          parseFloat(
            ((dynamicValues.antidumpingGobierno as number) || 0).toFixed(2)
          ) || 0,
        antidumpingCantidad:
          parseFloat(
            ((dynamicValues.antidumpingCantidad as number) || 0).toFixed(2)
          ) || 0,
        antidumpingValor,
      },
      percepcion,
      totalTaxes: parseFloat(
        (adValorem + isc + igv + ipm + antidumpingValor + percepcion).toFixed(
          2
        )
      ),
    };
  }

  private extractServiceCalculations(
    data: CompleteBuildData
  ): ServiceCalculationsInterface {
    const quotationForm = data.quotationForm as Record<string, unknown>;
    const getServiceFields = quotationForm.getServiceFields as () => Record<
      string,
      unknown
    >;
    const dynamicValues = quotationForm.dynamicValues as Record<string, unknown>;
    const serviceFields = getServiceFields();
    const subtotal = Object.values(serviceFields).reduce(
      (sum: number, value: unknown) =>
        sum + ((typeof value === "number" ? value : 0) || 0),
      0
    );

    return {
      serviceFields: {
        servicioConsolidado:
          parseFloat(
            ((serviceFields.servicioConsolidado as number) || 0).toFixed(2)
          ) || 0,
        separacionCarga:
          parseFloat(
            ((serviceFields.separacionCarga as number) || 0).toFixed(2)
          ) || 0,
        seguroProductos:
          parseFloat(
            ((serviceFields.seguroProductos as number) || 0).toFixed(2)
          ) || 0,
        inspeccionProductos:
          parseFloat(
            ((serviceFields.inspeccionProductos as number) || 0).toFixed(2)
          ) || 0,
        gestionCertificado:
          parseFloat(
            ((serviceFields.gestionCertificado as number) || 0).toFixed(2)
          ) || 0,
        inspeccionFabrica:
          parseFloat(
            ((serviceFields.inspeccionFabrica as number) || 0).toFixed(2)
          ) || 0,
        transporteLocal:
          parseFloat(
            ((serviceFields.transporteLocal as number) || 0).toFixed(2)
          ) || 0,
        transporteLocalChina:
          parseFloat(
            ((dynamicValues.transporteLocalChinaEnvio as number) || 0).toFixed(
              2
            )
          ) || 0,
        transporteLocalDestino:
          parseFloat(
            ((dynamicValues.transporteLocalClienteEnvio as number) ||
              0).toFixed(2)
          ) || 0,
        otrosServicios:
          parseFloat(
            ((serviceFields.otrosServicios as number) || 0).toFixed(2)
          ) || 0,
      },
      subtotalServices: parseFloat(subtotal.toFixed(2)),
      igvServices: parseFloat((subtotal * 0.18).toFixed(2)),
      totalServices: parseFloat((subtotal * 1.18).toFixed(2)),
    };
  }

  private extractExemptions(data: CompleteBuildData): ExemptionsInterface {
    const quotationForm = data.quotationForm as Record<string, unknown>;
    const exemptions = quotationForm.exemptionState as Record<string, unknown>;
    return {
      servicioConsolidadoAereo: (exemptions.servicioConsolidadoAereo as boolean) || false,
      servicioConsolidadoMaritimo: (exemptions.servicioConsolidadoMaritimo as boolean) || false,
      separacionCarga: (exemptions.separacionCarga as boolean) || false,
      inspeccionProductos: (exemptions.inspeccionProductos as boolean) || false,
      obligacionesFiscales: (exemptions.obligacionesFiscales as boolean) || false,
      gestionCertificado: (exemptions.gestionCertificado as boolean) || false,
      servicioInspeccion: (exemptions.servicioInspeccion as boolean) || false,
      transporteLocal: (exemptions.transporteLocal as boolean) || false,
      totalDerechos: (exemptions.totalDerechos as boolean) || false,
      descuentoGrupalExpress: (exemptions.descuentoGrupalExpress as boolean) || false,
    };
  }

  private extractTaxPercentage(data: CompleteBuildData): TaxPercentageInterface {
    const quotationForm = data.quotationForm as Record<string, unknown>;
    const dynamicValues = quotationForm.dynamicValues as Record<string, unknown>;
    return {
      adValoremRate: (dynamicValues.adValoremRate as number) || 4,
      igvRate: (dynamicValues.igvRate as number) || 16,
      ipmRate: (dynamicValues.ipmRate as number) || 2,
      percepcion: (dynamicValues.percepcionRate as number) || 5,
    };
  }

  buildForPendingService(data: PendingBuildData): QuotationResponseBase {
    // Build ResponseDataPending using API interfaces
    const responseData: ResponseDataPending = {
      resumenInfo: this.extractResumenInfo(data),
      generalInformation: {
        serviceLogistic: data?.configuration?.serviceLogistic || "Pendiente",
        incoterm: data?.configuration?.incoterm || "DDP",
        cargoType: data?.configuration?.cargoType || "mixto",
        courier: data?.configuration?.courier || "ups"
      }
    };

    this.baseDto.responseData = responseData;
    this.baseDto.products = this.buildPendingProducts(data);
    this.baseDto.serviceType = ServiceType.PENDING;

    return this.baseDto;
  }


  buildForCompleteServiceNew(data: CompleteBuildData): QuotationResponseBase {
    const quotationForm = data.quotationForm as Record<string, unknown>;
    const serviceType = this.determineServiceType(
      quotationForm.selectedServiceLogistic as string
    );

    // Build maritimeConfig using API interface
    const maritimeConfig: MaritimeConfigInterface | undefined = serviceType === "MARITIME" ? {
      regime: (quotationForm.selectedRegimen as string) || "",
      originCountry: (quotationForm.selectedPaisOrigen as string) || "",
      destinationCountry: (quotationForm.selectedPaisDestino as string) || "",
      customs: (quotationForm.selectedAduana as string) || "",
      originPort: (quotationForm.selectedPuertoSalida as string) || "",
      destinationPort: (quotationForm.selectedPuertoDestino as string) || "",
      serviceTypeDetail: (quotationForm.selectedTipoServicio as string) || "",
      transitTime: (quotationForm.tiempoTransito as number) || 0,
      naviera: (quotationForm.naviera as string) || "",
      proformaValidity: (quotationForm.selectedProformaVigencia as string) || "30 días",
    } : undefined;

    // Build ResponseDataComplete using API interfaces
    const responseData: ResponseDataComplete = {
      type: quotationForm.selectedServiceLogistic as string,
      resumenInfo: this.extractCompleteBasicInfo(data),
      generalInformation: {
        serviceLogistic: quotationForm.selectedServiceLogistic as string,
        incoterm: quotationForm.selectedIncoterm as string,
        cargoType: quotationForm.selectedTypeLoad as string,
        courier: quotationForm.selectedCourier as string,
      },
      maritimeConfig,
      calculations: this.extractCalculations(data),
      serviceCalculations: this.extractServiceCalculations(data),
      fiscalObligations: this.extractFiscalObligations(data),
      importCosts: this.extractImportCosts(data),
      quoteSummary: this.extractQuoteSummary(data),
    };

    this.baseDto.serviceType = serviceType;
    this.baseDto.responseData = responseData;
    this.baseDto.products = this.buildCompleteProducts(data);

    return this.baseDto;
  }

  private extractImportCosts(data: CompleteBuildData): ImportCostsInterface {
    const quotationForm = data.quotationForm as Record<string, unknown>;
    const getServiceFields = quotationForm.getServiceFields as () => Record<string, unknown>;
    const serviceFields = getServiceFields();
    const calculations = data.calculations as Record<string, unknown>;
    const dynamicValues = quotationForm.dynamicValues as Record<string, unknown>;
    const exemptionState = quotationForm.exemptionState as Record<string, unknown>;

    return {
      expenseFields: {
        servicioConsolidado: (serviceFields.servicioConsolidado as number) || 0,
        separacionCarga: (serviceFields.separacionCarga as number) || 0,
        seguroProductos: (serviceFields.seguroProductos as number) || 0,
        gestionCertificado: (serviceFields.gestionCertificado as number) || 0,
        inspeccionProductos: (serviceFields.inspeccionProductos as number) || 0,
        addvaloremigvipm: {
          descuento: (exemptionState.obligacionesFiscales as boolean) || false,
          valor: (calculations.totalTaxes as number) || 0,
        },
        totalDerechos:(serviceFields.totalDerechos as number)||0,
        desadunajefleteseguro: (dynamicValues.desaduanaje as number) || 0,
        servicioTransporte: (serviceFields.transporteLocal as number) || 0,
        otrosServicios: (serviceFields.otrosServicios as number) || 0,
      },
      totalExpenses: (calculations.finalTotal as number) || 0,
    };
  }


  private extractQuoteSummary(data: CompleteBuildData): QuoteSummaryInterface {
    const calculations = data.calculations as Record<string, unknown>;
    const quotationForm = data.quotationForm as Record<string, unknown>;
    const dynamicValues = quotationForm.dynamicValues as Record<string, unknown>;

    return {
      comercialValue: (dynamicValues.comercialValue as number) || 0,
      totalExpenses: (calculations.finalTotal as number) || 0,
      totalInvestment: ((dynamicValues.comercialValue as number) || 0) + ((calculations.finalTotal as number) || 0),
    };
  }

}
