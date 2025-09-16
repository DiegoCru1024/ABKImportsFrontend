import type { QuotationResponseBaseDto } from "../types/quotation-response-dto";
import type { QuotationCreateUpdateResponseDTO } from "@/api/interface/quotationResponseInterfaces";

/**
 * Adapter para convertir el nuevo DTO unificado al formato esperado por el backend actual
 * Esto mantiene la compatibilidad mientras se migra gradualmente
 */
export function adaptQuotationResponseToLegacyFormat(
  newDto: QuotationResponseBaseDto
): QuotationCreateUpdateResponseDTO {
  const isComplete = newDto.serviceType !== "PENDING";

  const quotationInfo = {
    quotationId: newDto.quotationInfo.quotationId,
    status: "ANSWERED",
    correlative: newDto.quotationInfo.correlative,
    date: newDto.quotationInfo.date,
    serviceType: newDto.quotationInfo.serviceLogistic,
    cargoType: newDto.quotationInfo.cargoType,
    courier: newDto.quotationInfo.courier,
    incoterm: newDto.quotationInfo.incoterm,
    isFirstPurchase: false,
    regime: newDto.quotationInfo.maritimeConfig?.regime || "",
    originCountry: newDto.quotationInfo.maritimeConfig?.originCountry || "",
    destinationCountry: newDto.quotationInfo.maritimeConfig?.destinationCountry || "",
    customs: newDto.quotationInfo.maritimeConfig?.customs || "",
    originPort: newDto.quotationInfo.maritimeConfig?.originPort || "",
    destinationPort: newDto.quotationInfo.maritimeConfig?.destinationPort || "",
    serviceTypeDetail: newDto.quotationInfo.maritimeConfig?.serviceTypeDetail || "",
    transitTime: newDto.quotationInfo.maritimeConfig?.transitTime || 0,
    naviera: newDto.quotationInfo.maritimeConfig?.naviera || "",
    proformaValidity: newDto.quotationInfo.maritimeConfig?.proformaValidity || "",
    cbm_total: newDto.responseData.basicInfo.totalCBM,
    peso_total: newDto.responseData.basicInfo.totalWeight,
    id_asesor: newDto.quotationInfo.advisorId,
  };

  const calculations = isComplete && newDto.responseData.type !== "PENDING" ? {
    dynamicValues: {
      ...newDto.responseData.calculations.dynamicValues,
      desaduanaje: newDto.responseData.calculations.dynamicValues.desaduanaje || 0,
      ton: newDto.responseData.calculations.dynamicValues.ton || 0,
      kv: 0,
      nroBultos: 0,
      iscRate: 0,
      percepcionRate: 0,
      inspeccionFabrica: 0,
      otrosServicios: 0,
      transporteLocalChinaEnvio: 0,
      transporteLocalClienteEnvio: 0,
      shouldExemptTaxes: newDto.responseData.calculations.exemptions.obligacionesFiscales,
    },
    exemptions: {
      ...newDto.responseData.calculations.exemptions,
      servicioConsolidadoAereo: newDto.responseData.calculations.exemptions.servicioConsolidadoAereo || false,
      servicioConsolidadoMaritimo: newDto.responseData.calculations.exemptions.servicioConsolidadoMaritimo || false,
      desaduanajeFleteSaguro: false,
      transporteLocalChina: false,
      transporteLocalCliente: false,
      gestionCertificado: newDto.responseData.calculations.exemptions.gestionCertificado || false,
      servicioInspeccion: newDto.responseData.calculations.exemptions.servicioInspeccion || false,
      transporteLocal: newDto.responseData.calculations.exemptions.transporteLocal || false,
      totalDerechos: newDto.responseData.calculations.exemptions.totalDerechos || false,
    },
    serviceCalculations: {
      serviceFields: {
        servicioConsolidado: newDto.responseData.calculations.serviceCalculations.serviceFields.servicioConsolidado,
        separacionCarga: newDto.responseData.calculations.serviceCalculations.serviceFields.separacionCarga,
        inspeccionProductos: newDto.responseData.calculations.serviceCalculations.serviceFields.inspeccionProductos,
      },
      subtotalServices: newDto.responseData.calculations.serviceCalculations.subtotalServices,
      igvServices: newDto.responseData.calculations.serviceCalculations.igvServices,
      totalServices: newDto.responseData.calculations.serviceCalculations.totalServices,
      fiscalObligations: {
        adValorem: newDto.responseData.calculations.fiscalObligations.adValorem,
        totalDerechosDolares: newDto.responseData.calculations.fiscalObligations.totalTaxes,
      },
      importExpenses: {
        servicioConsolidadoFinal: newDto.responseData.calculations.serviceCalculations.serviceFields.servicioConsolidado * 1.18,
        separacionCargaFinal: newDto.responseData.calculations.serviceCalculations.serviceFields.separacionCarga * 1.18,
        totalGastosImportacion: newDto.responseData.commercialDetails.totalImportCosts,
      },
      totals: {
        inversionTotal: newDto.responseData.commercialDetails.totalInvestment,
      },
    },
  } : {
    // Valores por defecto para servicios pendientes
    dynamicValues: {
      comercialValue: 0,
      flete: 0,
      cajas: 0,
      desaduanaje: 0,
      kg: newDto.responseData.basicInfo.totalWeight,
      ton: 0,
      kv: 0,
      fob: 0,
      seguro: 0,
      tipoCambio: 3.7,
      nroBultos: 0,
      volumenCBM: newDto.responseData.basicInfo.totalCBM,
      calculoFlete: 0,
      servicioConsolidado: 0,
      separacionCarga: 0,
      inspeccionProductos: 0,
      gestionCertificado: 0,
      inspeccionProducto: 0,
      inspeccionFabrica: 0,
      transporteLocal: 0,
      otrosServicios: 0,
      adValoremRate: 0,
      antidumpingGobierno: 0,
      antidumpingCantidad: 0,
      iscRate: 0,
      igvRate: 0,
      ipmRate: 0,
      percepcionRate: 0,
      transporteLocalChinaEnvio: 0,
      transporteLocalClienteEnvio: 0,
      cif: 0,
      shouldExemptTaxes: false,
    },
    exemptions: {
      servicioConsolidadoAereo: false,
      servicioConsolidadoMaritimo: false,
      separacionCarga: false,
      inspeccionProductos: false,
      obligacionesFiscales: false,
      desaduanajeFleteSaguro: false,
      transporteLocalChina: false,
      transporteLocalCliente: false,
      gestionCertificado: false,
      servicioInspeccion: false,
      transporteLocal: false,
      totalDerechos: false,
    },
    serviceCalculations: {
      serviceFields: {
        servicioConsolidado: 0,
        separacionCarga: 0,
        inspeccionProductos: 0,
      },
      subtotalServices: 0,
      igvServices: 0,
      totalServices: 0,
      fiscalObligations: {
        adValorem: 0,
        totalDerechosDolares: 0,
      },
      importExpenses: {
        servicioConsolidadoFinal: 0,
        separacionCargaFinal: 0,
        totalGastosImportacion: 0,
      },
      totals: {
        inversionTotal: 0,
      },
    },
  };

  const products = newDto.products.map(product => ({
    productId: product.productId,
    name: product.name,
    adminComment: product.adminComment || "",
    seCotizaProducto: product.isQuoted,
    variants: product.variants.map(variant => {
      if (newDto.serviceType === "PENDING" && "pendingPricing" in variant) {
        return {
          variantId: variant.variantId,
          quantity: variant.quantity,
          precio_unitario: variant.pendingPricing.unitPrice,
          precio_express_unitario: variant.pendingPricing.expressPrice,
          seCotizaVariante: variant.isQuoted,
          unitCost: undefined,
        };
      } else if (newDto.serviceType !== "PENDING" && "completePricing" in variant) {
        return {
          variantId: variant.variantId,
          quantity: variant.quantity,
          precio_unitario: variant.completePricing.unitCost,
          precio_express_unitario: 0,
          seCotizaVariante: variant.isQuoted,
          unitCost: variant.completePricing.unitCost,
        };
      } else {
        // Fallback
        return {
          variantId: variant.variantId,
          quantity: variant.quantity,
          precio_unitario: 0,
          precio_express_unitario: 0,
          seCotizaVariante: variant.isQuoted,
          unitCost: undefined,
        };
      }
    }),
  }));

  return {
    quotationInfo,
    calculations,
    products,
  };
}