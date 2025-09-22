export interface QuotationResponseDTO {
  quotationId: string;
  serviceType: string;
  quotationInfo: {
    quotationId: string;
    correlative: string;
    date: string;
    advisorId: string;
  };
  responseData: {
    type: string;
    basicInfo: {
      totalCBM: number;
      totalWeight: number;
      totalPrice: number;
      totalExpress: number;
      totalQuantity: number;
    };
    generalInformation: {
      serviceLogistic: string;
      incoterm: string;
      cargoType: string;
      courier: string;
    };
    maritimeConfig?: {
      regime?: string;
      originCountry?: string;
      destinationCountry?: string;
      customs?: string;
      originPort?: string;
      destinationPort?: string;
      serviceTypeDetail?: string;
      transitTime?: number;
      naviera?: string;
      proformaValidity?: string;
    };
    calculations: {
      dynamicValues: {
        comercialValue: number;
        flete: number;
        cajas: number;
        kg: number;
        ton: number;
        fob: number;
        seguro: number;
        tipoCambio: number;
        volumenCBM: number;
        calculoFlete: number;
        servicioConsolidado: number;
        separacionCarga: number;
        inspeccionProductos: number;
        gestionCertificado: number;
        inspeccionProducto: number;
        transporteLocal: number;
        desaduanaje: number;
        antidumpingGobierno: number;
        antidumpingCantidad: number;
        transporteLocalChinaEnvio: number;
        transporteLocalClienteEnvio: number;
        cif: number;
      };
      taxPercentage: {
        adValoremRate: number;
        igvRate: number;
        ipmRate: number;
        percepcion: number;
      };
      exemptions: {
        servicioConsolidadoAereo: boolean;
        servicioConsolidadoMaritimo: boolean;
        separacionCarga: boolean;
        inspeccionProductos: boolean;
        obligacionesFiscales: boolean;
        gestionCertificado: boolean;
        servicioInspeccion: boolean;
        transporteLocal: boolean;
        totalDerechos: boolean;
        descuentoGrupalExpress: boolean;
      };
    };
    serviceCalculations: {
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
    };
    fiscalObligations: {
      adValorem: number;
      igv: number;
      ipm: number;
      antidumping: number;
      totalTaxes: number;
    };
    importCosts: {
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
    };
    quoteSummary: {
      comercialValue: number;
      totalExpenses: number;
      totalInvestment: number;
    };
  };
  products: {
    productId: string;
    name: string;
    isQuoted: boolean;
    pricing: {
      unitCost: number;
      importCosts: number;
      totalCost: number;
      equivalence: number;
    };
    variants: {
      variantId: string;
      quantity: number;
      isQuoted: boolean;
      completePricing: {
        unitCost: number;
      };
    }[];
  }[];
}