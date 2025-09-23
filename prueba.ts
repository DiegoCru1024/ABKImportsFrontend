const objeto = {
  quotationId: "5356e493-7847-492c-a56e-79e0b7a15e97", // Id de la cotizacion asociada
  serviceType: "MARITIME", // Se guarda en el entity de quotation-response.entity.ts ,en el campo de service_type
  response_date: "21/09/2025 22:50:43", // Se guarda en el entity de quotation-response.entity.ts , en el campo de response_date
  advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb", //Se guarda en el entity de quotation-response.entity.ts, y hace referencia al ID de la persona que responde la cotizacion
  responseData: {
    type: "Consolidado Grupal Maritimo",  // Se guarda en el entity de quotation-response.entity.ts , en el campo de type
    resumenInfo: { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de resumen_info
      totalCBM: 0,
      totalWeight: 0,
      totalPrice: 0,
      totalExpress: 0,
      totalQuantity: 0,
    },
    //Información general
    generalInformation: {   // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de general_information
      serviceLogistic: "Consolidado Grupal Maritimo",
      incoterm: "DDP",
      cargoType: "mixto",
      courier: "ups",
    },

    //Configuración Maritima
    maritimeConfig: {  // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de maritime_config
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
    },

    calculations: {
      //Valores Dinamicos
      dynamicValues: { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de dynamic_values
        comercialValue: 0,
        flete: 390,
        cajas: 1,
        kg: 32,
        ton: 0.032,
        fob: 0,
        seguro: 4,
        tipoCambio: 3.7,
        volumenCBM: 322,
        calculoFlete: 900,
        servicioConsolidado: 32,
        separacionCarga: 43,
        inspeccionProductos: 65,
        gestionCertificado: 0,
        inspeccionProducto: 0,
        transporteLocal: 0,
        desaduanaje: 89.9,
        antidumpingGobierno: 3,
        antidumpingCantidad: 4,
        transporteLocalChinaEnvio: 44,
        transporteLocalClienteEnvio: 55,
        cif: 0,
      },
      //Porcentaje de Impuestos
      taxPercentage: { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de tax_percentage
        adValoremRate: 4,
        igvRate: 16,
        ipmRate: 2,
        percepcion: 5,
      },
      //Exoneracion de conceptos
      exemptions: { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de exemptions
        servicioConsolidadoAereo: false,
        servicioConsolidadoMaritimo: false,
        separacionCarga: false,
        inspeccionProductos: false,
        obligacionesFiscales: false,
        gestionCertificado: false,
        servicioInspeccion: false,
        transporteLocal: false,
        totalDerechos: false,
        descuentoGrupalExpress: false,
      },
    },

    serviceCalculations: { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de service_calculations
      serviceFields: {
        servicioConsolidado: 32,
        separacionCarga: 0,
        seguroProductos: 0,
        inspeccionProductos: 0,
        gestionCertificado: 0,
        inspeccionProducto: 0,
        transporteLocal: 0,
      },
      subtotalServices: 32,
      igvServices: 5.76,
      totalServices: 37.76,
    },

    //Obligaciones Fiscales
    fiscalObligations: {  // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de fiscal_obligations
      adValorem: 11592.16,
      igv: 48223.38,
      ipm: 6027.92,
      antidumping: 0,
      totalTaxes: 65843.46,
    },

    //Gastos de importacion
    importCosts: { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de import_costs
      expenseFields: {
        servicioConsolidado: 50,
        separacionCarga: 10,
        seguroProductos: 10,
        inspeccionProducts: 5,
        addvaloremigvipm: {
          descuento: true,
          valor: 23,
        },
        desadunajefleteseguro: 10,
        transporteLocal: 50,
        transporteLocalChinaEnvio: 44,
        transporteLocalClienteEnvio: 55,
      },
      totalExpenses: 37.76,
    },

    // Resumen de cotizacion
    quoteSummary: { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de quote_summary
      comercialValue: 30,
      totalExpenses: 37.76,
      totalInvestment: 67.76,
    },
  },
  products: [
    {
      productId: "8afa06b2-4484-4c6f-8d76-7daf17db5739", //Id producto de products-quotation.entity.ts 
      isQuoted: true, // Se guarda en el entity de quotation-response-products.entity.ts ,en el campo  de se_cotiza_producto
      pricing: { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de pricing
        unitCost: 0,
        importCosts: 0,
        totalCost: 0,
        equivalence: 0,
      },
      variants: [
        {
          variantId: "1bed3569-44ab-4cfb-988c-1b4cd75d7819", //Id de la variante del producto de products-variant.entity.ts 
          quantity: 32, // Se guarda en el entity de quotation-response-variants.entity.ts ,en el campo de quantity
          isQuoted: true, // Se guarda en el entity de quotation-response-variants.entity.ts ,en el campo de se_cotiza_variante
          completePricing: {
            unitCost: 0,  // Se guarda en el entity de quotation-response-variants.entity.ts ,en el campo de precio_unitario
          },
        },
      ],
    },
  ],
};

const prueba2 = {
  type: "Consolidado Grupal Express",
  basicInfo: {
    totalCBM: 0,
    totalPrice: 0,
    totalWeight: 0,
    totalExpress: 0,
    totalQuantity: 0,
  },
  importCosts: {
    expenseFields: {
      seguroProductos: 0,
      separacionCarga: 0,
      transporteLocal: 0,
      addvaloremigvipm: { valor: 2281.71776, descuento: false },
      inspeccionProducts: 876.5,
      servicioConsolidado: 3222,
      desadunajefleteseguro: 322,
      transporteLocalChinaEnvio: 112,
      transporteLocalClienteEnvio: 322,
    },
    totalExpenses: 11969.71776,
  },
  calculations: {
    exemptions: {
      totalDerechos: false,
      separacionCarga: false,
      transporteLocal: false,
      gestionCertificado: false,
      servicioInspeccion: false,
      inspeccionProductos: false,
      obligacionesFiscales: false,
      descuentoGrupalExpress: false,
      servicioConsolidadoAereo: false,
      servicioConsolidadoMaritimo: false,
    },
    dynamicValues: {
      kg: 32,
      cif: 0,
      fob: 4224,
      ton: 0.032,
      cajas: 21,
      flete: 3232,
      seguro: 2232,
      tipoCambio: 3.7,
      volumenCBM: 0,
      desaduanaje: 322,
      calculoFlete: 0,
      comercialValue: 4224,
      separacionCarga: 0,
      transporteLocal: 0,
      gestionCertificado: 0,
      inspeccionProducto: 0,
      antidumpingCantidad: 0,
      antidumpingGobierno: 0,
      inspeccionProductos: 876.5,
      servicioConsolidado: 3222,
      transporteLocalChinaEnvio: 112,
      transporteLocalClienteEnvio: 322,
    },
    taxPercentage: { igvRate: 16, ipmRate: 2, percepcion: 5, adValoremRate: 4 },
  },
  quoteSummary: {
    totalExpenses: 11969.71776,
    comercialValue: 4224,
    totalInvestment: 16193.71776,
  },
  maritimeConfig: {
    regime: "",
    customs: "",
    naviera: "",
    originPort: "",
    transitTime: 0,
    originCountry: "",
    destinationPort: "",
    proformaValidity: "5",
    serviceTypeDetail: "",
    destinationCountry: "",
  },
  fiscalObligations: {
    igv: 1612.0832,
    ipm: 201.5104,
    adValorem: 387.52,
    totalTaxes: 2201.1136,
    antidumping: 0,
  },
  generalInformation: {
    courier: "ups",
    incoterm: "DDP",
    cargoType: "mixto",
    serviceLogistic: "Consolidado Grupal Express",
  },
  serviceCalculations: {
    igvServices: 737.73,
    serviceFields: {
      seguroProductos: 0,
      separacionCarga: 0,
      transporteLocal: 0,
      gestionCertificado: 0,
      inspeccionProducto: 0,
      inspeccionProductos: 876.5,
      servicioConsolidado: 3222,
    },
    totalServices: 4836.23,
    subtotalServices: 4098.5,
  },
};
