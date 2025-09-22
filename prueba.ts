const objeto = {
  quotationId: "5356e493-7847-492c-a56e-79e0b7a15e97",
  serviceType: "MARITIME",
  quotationInfo: {
    quotationId: "5356e493-7847-492c-a56e-79e0b7a15e97",
    correlative: "COT-00003-2025",
    date: "21:09:2025 22:50:43",
    advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb",
  },
  responseData: {
    type: "Consolidado Grupal Maritimo",
    basicInfo: {
      totalCBM: 0,
      totalWeight: 0,
      totalPrice: 0,
      totalExpress: 0,
      totalQuantity: 0,
    },
    //Información general
    generalInformation: {
      serviceLogistic: "Consolidado Grupal Maritimo",
      incoterm: "DDP",
      cargoType: "mixto",
      courier: "ups",
    },

    //Configuración Maritima
    maritimeConfig: {
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
      dynamicValues: {
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
      taxPercentage:{
        adValoremRate: 4,
        igvRate: 16,
        ipmRate: 2,
        percepcion:5
       },
       //Exoneracion de conceptos
      exemptions: {
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

     //Servicios de Carga Consolidada Aérea
     serviceCalculations: {
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
     fiscalObligations: {
      adValorem: 11592.16,
      igv: 48223.385599999994,
      ipm: 6027.923199999999,
      antidumping: 0,
      totalTaxes: 65843.4688,
    },

    //Gastos de importacion
    importCosts:{
      servicioConsolidado:50,

    },
   
    // Resumen de cotizacion
    quoteSummary:{
      comercialValue:30,
      
    },
    commercialDetails: {
      cif: 289804,
      totalImportCosts: 358058.63808,
      totalInvestment: 647862.63808,
    },
  },
  products: [
    {
      productId: "8afa06b2-4484-4c6f-8d76-7daf17db5739",
      name: "<zxcasdasd",
      isQuoted: true,
      pricing: {
        unitCost: 0,
        importCosts: 0,
        totalCost: 0,
        equivalence: 0,
      },
      variants: [
        {
          variantId: "1bed3569-44ab-4cfb-988c-1b4cd75d7819",
          quantity: 32,
          isQuoted: true,
          completePricing: {
            unitCost: 0,
          },
        },
      ],
    },
  ],
};
