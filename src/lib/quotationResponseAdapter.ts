/**
 * Adaptador para convertir datos actuales al nuevo DTO de respuestas de cotización
 */

import type { 
  QuotationResponseDTO, 
  QuotationInfo, 
  DynamicValues, 
  Exemptions, 
  ServiceCalculations, 
  Product, 
  ProductVariant,
  Calculations
} from '@/api/interface/quotationResponseDTO';

/**
 * Crea un DTO de respuesta de cotización desde los datos actuales
 */
export function createQuotationResponseDTO(
  quotationId: string,
  quotationData: any,
  products: any[],
  serviceType: string,
  asesorId: string
): QuotationResponseDTO {
  
  // Información básica de la cotización
  const quotationInfo: QuotationInfo = {
    quotationId,
    status: "ANSWERED",
    correlative: quotationData.correlative || `COT-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    serviceType: serviceType as any,
    cargoType: "general",
    incoterm: "FOB",
    isFirstPurchase: false,
    regime: "importacion_consumo",
    originCountry: "China",
    destinationCountry: "Perú",
    customs: "Callao",
    originPort: "Shanghai",
    destinationPort: "Callao",
    serviceTypeDetail: "consolidado",
    transitTime: 35,
    proformaValidity: "15 días",
    id_asesor: asesorId
  };

  // Agregar campos específicos según el tipo de servicio
  if (serviceType.includes("Express")) {
    quotationInfo.courier = "ups";
  } else if (serviceType.includes("Marítimo")) {
    quotationInfo.naviera = "Maersk";
  }

  // Valores dinámicos iniciales
  const dynamicValues: DynamicValues = {
    comercialValue: 0,
    flete: 250,
    cajas: 0,
    desaduanaje: 150,
    kg: 0,
    ton: 0,
    kv: 0,
    fob: 0,
    seguro: 25,
    tipoCambio: 3.75,
    nroBultos: 0,
    volumenCBM: 0,
    calculoFlete: 250,
    servicioConsolidado: 120,
    separacionCarga: 30,
    inspeccionProductos: 0,
    gestionCertificado: 0,
    inspeccionProducto: 0,
    inspeccionFabrica: 0,
    transporteLocal: 80,
    otrosServicios: 0,
    adValoremRate: 4,
    antidumpingGobierno: 0,
    antidumpingCantidad: 0,
    iscRate: 0,
    igvRate: 16,
    ipmRate: 2,
    percepcionRate: 3.5,
    transporteLocalChinaEnvio: 50,
    transporteLocalClienteEnvio: 80,
    cif: 0,
    shouldExemptTaxes: false
  };

  // Exenciones
  const exemptions: Exemptions = {
    servicioConsolidadoMaritimo: true,
    separacionCarga: true,
    obligacionesFiscales: true,
    totalDerechos: true
  };

  // Cálculos de servicios
  const serviceCalculations: ServiceCalculations = {
    serviceFields: {
      servicioConsolidado: 120,
      separacionCarga: 30,
      inspeccionProductos: 0
    },
    subtotalServices: 150,
    igvServices: 27,
    totalServices: 177,
    fiscalObligations: {
      adValorem: 0,
      totalDerechosDolares: 0
    },
    importExpenses: {
      servicioConsolidadoFinal: 141.6,
      separacionCargaFinal: 35.4,
      totalGastosImportacion: 659.88
    },
    totals: {
      inversionTotal: 0
    }
  };

  // Productos adaptados
  const adaptedProducts: Product[] = products.map(product => ({
    originalProductId: product.id,
    name: product.name,
    adminComment: "",
    seCotizaProducto: true,
    variants: product.variants?.map((variant: any) => ({
      originalVariantId: variant.id,
      size: variant.size || "N/A",
      presentation: variant.presentation || "Unidad",
      model: variant.model || "N/A",
      color: variant.color || "N/A",
      quantity: variant.quantity || 0,
      price: 0,
      unitCost: 0,
      importCosts: 0,
      seCotizaVariante: true
    })) || []
  }));

  // Cálculos
  const calculations: Calculations = {
    dynamicValues,
    exemptions,
    serviceCalculations
  };

  return {
    quotationInfo,
    calculations,
    products: adaptedProducts
  };
}

/**
 * Actualiza los cálculos basados en los productos
 */
export function updateCalculations(
  dto: QuotationResponseDTO,
  products: Product[]
): QuotationResponseDTO {
  
  // Calcular totales de productos
  let totalComercialValue = 0;
  let totalCajas = 0;
  let totalKg = 0;
  let totalVolumenCBM = 0;
  let totalFob = 0;

  products.forEach(product => {
    if (product.seCotizaProducto) {
      product.variants.forEach(variant => {
        if (variant.seCotizaVariante) {
          totalComercialValue += variant.price * variant.quantity;
          totalCajas += variant.quantity;
          totalKg += variant.quantity * 10; // Estimación de peso por unidad
          totalVolumenCBM += variant.quantity * 0.1; // Estimación de volumen por unidad
          totalFob += variant.price * variant.quantity;
        }
      });
    }
  });

  // Actualizar valores dinámicos
  const updatedDynamicValues = {
    ...dto.calculations.dynamicValues,
    comercialValue: totalComercialValue,
    cajas: totalCajas,
    kg: totalKg,
    ton: totalKg / 1000,
    nroBultos: totalCajas,
    volumenCBM: totalVolumenCBM,
    fob: totalFob,
    cif: totalFob + dto.calculations.dynamicValues.flete + dto.calculations.dynamicValues.seguro
  };

  // Actualizar cálculos fiscales
  const adValorem = updatedDynamicValues.cif * (updatedDynamicValues.adValoremRate / 100);
  const totalDerechosDolares = adValorem;

  const updatedServiceCalculations = {
    ...dto.calculations.serviceCalculations,
    fiscalObligations: {
      ...dto.calculations.serviceCalculations.fiscalObligations,
      adValorem,
      totalDerechosDolares
    },
    totals: {
      inversionTotal: updatedDynamicValues.cif + dto.calculations.serviceCalculations.totalServices
    }
  };

  return {
    ...dto,
    calculations: {
      ...dto.calculations,
      dynamicValues: updatedDynamicValues,
      serviceCalculations: updatedServiceCalculations
    },
    products
  };
}

/**
 * Agrega un nuevo producto al DTO
 */
export function addNewProduct(dto: QuotationResponseDTO): QuotationResponseDTO {
  const newProduct: Product = {
    originalProductId: null, // null indica que es un producto nuevo
    name: "Nuevo Producto",
    adminComment: "",
    seCotizaProducto: true,
    variants: [{
      originalVariantId: null, // null indica que es una variante nueva
      size: "N/A",
      presentation: "Unidad",
      model: "N/A",
      color: "N/A",
      quantity: 1,
      price: 0,
      unitCost: 0,
      importCosts: 0,
      seCotizaVariante: true
    }]
  };

  return {
    ...dto,
    products: [...dto.products, newProduct]
  };
}

/**
 * Agrega una nueva variante a un producto
 */
export function addNewVariant(
  dto: QuotationResponseDTO, 
  productIndex: number
): QuotationResponseDTO {
  const newVariant: ProductVariant = {
    originalVariantId: null,
    size: "N/A",
    presentation: "Unidad",
    model: "N/A",
    color: "N/A",
    quantity: 1,
    price: 0,
    unitCost: 0,
    importCosts: 0,
    seCotizaVariante: true
  };

  const updatedProducts = [...dto.products];
  updatedProducts[productIndex] = {
    ...updatedProducts[productIndex],
    variants: [...updatedProducts[productIndex].variants, newVariant]
  };

  return {
    ...dto,
    products: updatedProducts
  };
}

/**
 * Actualiza un producto específico
 */
export function updateProduct(
  dto: QuotationResponseDTO,
  productIndex: number,
  updatedProduct: Product
): QuotationResponseDTO {
  const updatedProducts = [...dto.products];
  updatedProducts[productIndex] = updatedProduct;

  return {
    ...dto,
    products: updatedProducts
  };
}

/**
 * Actualiza una variante específica
 */
export function updateVariant(
  dto: QuotationResponseDTO,
  productIndex: number,
  variantIndex: number,
  updatedVariant: ProductVariant
): QuotationResponseDTO {
  const updatedProducts = [...dto.products];
  const updatedVariants = [...updatedProducts[productIndex].variants];
  updatedVariants[variantIndex] = updatedVariant;

  updatedProducts[productIndex] = {
    ...updatedProducts[productIndex],
    variants: updatedVariants
  };

  return {
    ...dto,
    products: updatedProducts
  };
}

/**
 * Elimina un producto
 */
export function removeProduct(
  dto: QuotationResponseDTO,
  productIndex: number
): QuotationResponseDTO {
  const updatedProducts = dto.products.filter((_, index) => index !== productIndex);
  
  return {
    ...dto,
    products: updatedProducts
  };
}

/**
 * Elimina una variante
 */
export function removeVariant(
  dto: QuotationResponseDTO,
  productIndex: number,
  variantIndex: number
): QuotationResponseDTO {
  const updatedProducts = [...dto.products];
  const updatedVariants = updatedProducts[productIndex].variants.filter(
    (_, index) => index !== variantIndex
  );

  updatedProducts[productIndex] = {
    ...updatedProducts[productIndex],
    variants: updatedVariants
  };

  return {
    ...dto,
    products: updatedProducts
  };
}

/**
 * Valida que el DTO esté completo
 */
export function validateQuotationResponseDTO(dto: QuotationResponseDTO): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar información básica
  if (!dto.quotationInfo.quotationId) {
    errors.push("ID de cotización es requerido");
  }
  if (!dto.quotationInfo.correlative) {
    errors.push("Correlativo es requerido");
  }
  if (!dto.quotationInfo.serviceType) {
    errors.push("Tipo de servicio es requerido");
  }

  // Validar productos
  if (dto.products.length === 0) {
    errors.push("Debe haber al menos un producto");
  }

  dto.products.forEach((product, productIndex) => {
    if (!product.name) {
      errors.push(`Producto ${productIndex + 1}: Nombre es requerido`);
    }
    if (product.variants.length === 0) {
      errors.push(`Producto ${productIndex + 1}: Debe tener al menos una variante`);
    }

    product.variants.forEach((variant, variantIndex) => {
      if (variant.quantity <= 0) {
        errors.push(`Producto ${productIndex + 1}, Variante ${variantIndex + 1}: Cantidad debe ser mayor a 0`);
      }
      if (variant.price < 0) {
        errors.push(`Producto ${productIndex + 1}, Variante ${variantIndex + 1}: Precio no puede ser negativo`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
