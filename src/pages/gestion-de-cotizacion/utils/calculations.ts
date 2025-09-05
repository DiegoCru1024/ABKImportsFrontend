/**
 * Business logic utilities for product variant calculations
 * Provides reusable calculation functions and data transformation utilities
 */

import { 
  ProductWithVariants, 
  Variant, 
  calculateProductTotals, 
  calculateTotalPackingData,
  getProductId,
  getVariantId 
} from './validation';

// ================================
// Type Definitions
// ================================

export interface VariantTotals {
  totalPrice: number;
  totalExpress: number;
  totalQuantity: number;
  totalUnitCost: number;
  totalImportCosts: number;
}

export interface PackingTotals {
  totalCBM: number;
  totalWeight: number;
  totalBoxes: number;
}

export interface ProductCalculations {
  variantTotals: VariantTotals;
  packingTotals: PackingTotals;
  averageUnitPrice: number;
  averageExpressCost: number;
  totalMargin: number;
  marginPercentage: number;
}

// ================================
// Product Calculations
// ================================

/**
 * Calculates comprehensive totals for a single product
 */
export const calculateComprehensiveProductTotals = (product: ProductWithVariants): ProductCalculations => {
  const variants = product.variants || [];
  const variantTotals = calculateProductTotals(variants);
  
  // Calculate packing totals
  const packingTotals = {
    totalCBM: product.cbm || 0,
    totalWeight: product.weight || 0,
    totalBoxes: product.boxes || 0,
  };

  // Calculate averages
  const averageUnitPrice = variantTotals.totalQuantity > 0 
    ? variantTotals.totalPrice / variantTotals.totalQuantity 
    : 0;
    
  const averageExpressCost = variants.length > 0 
    ? variantTotals.totalExpress / variants.length 
    : 0;

  // Calculate margin
  const totalMargin = variantTotals.totalPrice - variantTotals.totalUnitCost;
  const marginPercentage = variantTotals.totalPrice > 0 
    ? (totalMargin / variantTotals.totalPrice) * 100 
    : 0;

  return {
    variantTotals,
    packingTotals,
    averageUnitPrice,
    averageExpressCost,
    totalMargin,
    marginPercentage,
  };
};

/**
 * Calculates totals across multiple products
 */
export const calculateMultiProductTotals = (products: ProductWithVariants[]) => {
  let totalCBM = 0;
  let totalWeight = 0;
  let totalBoxes = 0;
  let totalPrice = 0;
  let totalExpress = 0;
  let totalQuantity = 0;
  let totalUnitCost = 0;
  let totalImportCosts = 0;

  products.forEach(product => {
    const calculations = calculateComprehensiveProductTotals(product);
    
    totalCBM += calculations.packingTotals.totalCBM;
    totalWeight += calculations.packingTotals.totalWeight;
    totalBoxes += calculations.packingTotals.totalBoxes;
    totalPrice += calculations.variantTotals.totalPrice;
    totalExpress += calculations.variantTotals.totalExpress;
    totalQuantity += calculations.variantTotals.totalQuantity;
    totalUnitCost += calculations.variantTotals.totalUnitCost;
    totalImportCosts += calculations.variantTotals.totalImportCosts;
  });

  const totalMargin = totalPrice - totalUnitCost;
  const marginPercentage = totalPrice > 0 ? (totalMargin / totalPrice) * 100 : 0;

  return {
    totals: {
      totalCBM,
      totalWeight,
      totalBoxes,
      totalPrice,
      totalExpress,
      totalQuantity,
      totalUnitCost,
      totalImportCosts,
      totalMargin,
      marginPercentage,
    },
    averages: {
      averageCBMPerProduct: products.length > 0 ? totalCBM / products.length : 0,
      averageWeightPerProduct: products.length > 0 ? totalWeight / products.length : 0,
      averagePricePerUnit: totalQuantity > 0 ? totalPrice / totalQuantity : 0,
      averageExpressPerProduct: products.length > 0 ? totalExpress / products.length : 0,
    },
  };
};

// ================================
// Variant Update Logic
// ================================

/**
 * Updates a specific variant field with proper business logic
 */
export const updateVariantField = (
  variant: Variant,
  field: string,
  value: number
): Variant => {
  const updatedVariant = { ...variant, [field]: value };

  // Apply business rules based on field type
  switch (field) {
    case 'quantity':
      // Ensure quantity is a positive integer
      updatedVariant.quantity = Math.max(0, Math.floor(value));
      break;
      
    case 'price':
    case 'express':
    case 'unitCost':
    case 'importCosts':
      // Ensure monetary values are non-negative
      updatedVariant[field] = Math.max(0, value);
      break;
  }

  return updatedVariant;
};

/**
 * Updates a variant within a product's variant array
 */
export const updateProductVariant = (
  product: ProductWithVariants,
  variantIndex: number,
  field: string,
  value: number
): ProductWithVariants => {
  if (!product.variants || variantIndex < 0 || variantIndex >= product.variants.length) {
    return product;
  }

  const updatedVariants = [...product.variants];
  updatedVariants[variantIndex] = updateVariantField(
    updatedVariants[variantIndex],
    field,
    value
  );

  return {
    ...product,
    variants: updatedVariants,
  };
};

// ================================
// State Management Helpers
// ================================

/**
 * Updates a product in a products array
 */
export const updateProductInArray = (
  products: ProductWithVariants[],
  productId: string,
  updates: Partial<ProductWithVariants>
): ProductWithVariants[] => {
  return products.map(product => {
    const currentProductId = getProductId(product);
    if (currentProductId === productId) {
      return { ...product, ...updates };
    }
    return product;
  });
};

/**
 * Updates a variant in a products array using field path notation
 */
export const updateVariantInProductsArray = (
  products: ProductWithVariants[],
  productId: string,
  variantIndex: number,
  field: string,
  value: number
): ProductWithVariants[] => {
  return products.map(product => {
    const currentProductId = getProductId(product);
    if (currentProductId === productId) {
      return updateProductVariant(product, variantIndex, field, value);
    }
    return product;
  });
};

// ================================
// DTO Generation Helpers
// ================================

/**
 * Generates variant response data with correct field mapping
 */
export const generateVariantResponseData = (
  variant: Variant,
  editableVariant?: Variant,
  isQuoted: boolean = true
) => {
  return {
    variantId: getVariantId(variant),
    quantity: Number(variant.quantity) || 0,
    // CORRECT MAPPING: price -> precio_unitario, express -> precio_express
    precio_unitario: editableVariant?.price || variant.price || 0,
    precio_express: editableVariant?.express || variant.express || 0,
    seCotizaVariante: isQuoted,
  };
};

/**
 * Generates product response data with variants
 */
export const generateProductResponseData = (
  product: any,
  editableProduct?: ProductWithVariants,
  productQuotationState: Record<string, boolean> = {},
  variantQuotationState: Record<string, Record<string, boolean>> = {}
) => {
  const productId = getProductId(product);
  
  return {
    productId: productId,
    name: product.name,
    adminComment: editableProduct?.adminComment || product.adminComment || "",
    seCotizaProducto: productQuotationState[productId] !== false,
    variants: (product.variants || []).map((variant: any) => {
      const editableVariant = editableProduct?.variants?.find(
        (ev: any) => getVariantId(ev) === getVariantId(variant)
      );
      
      const isVariantQuoted = variantQuotationState[productId]?.[getVariantId(variant)] !== false;
      
      return generateVariantResponseData(variant, editableVariant, isVariantQuoted);
    }),
  };
};

// ================================
// Field Validation Helpers
// ================================

/**
 * Parses variant field notation (variant_0_price) into components
 */
export const parseVariantFieldPath = (fieldPath: string) => {
  const parts = fieldPath.split('_');
  
  if (parts.length >= 3 && parts[0] === 'variant') {
    return {
      isVariantField: true,
      variantIndex: parseInt(parts[1]),
      fieldName: parts.slice(2).join('_'),
    };
  }
  
  return {
    isVariantField: false,
    variantIndex: -1,
    fieldName: fieldPath,
  };
};

/**
 * Validates if a field path is valid for variant updates
 */
export const isValidVariantField = (fieldName: string): boolean => {
  const validFields = ['price', 'express', 'unitCost', 'importCosts', 'quantity'];
  return validFields.includes(fieldName);
};

/**
 * Validates if a field path is valid for product updates
 */
export const isValidProductField = (fieldName: string): boolean => {
  const validFields = ['adminComment', 'boxes', 'cbm', 'weight', 'url', 'comment'];
  return validFields.includes(fieldName);
};

// ================================
// Data Consistency Helpers
// ================================

/**
 * Ensures all variants have the required fields with default values
 */
export const normalizeVariant = (variant: Variant): Variant => {
  return {
    ...variant,
    quantity: variant.quantity || 0,
    price: variant.price || 0,
    express: variant.express || 0,
    unitCost: variant.unitCost || 0,
    importCosts: variant.importCosts || 0,
  };
};

/**
 * Ensures all products have normalized variants
 */
export const normalizeProduct = (product: ProductWithVariants): ProductWithVariants => {
  return {
    ...product,
    variants: (product.variants || []).map(normalizeVariant),
    adminComment: product.adminComment || "",
    boxes: product.boxes || 0,
    cbm: product.cbm || 0,
    weight: product.weight || 0,
  };
};

/**
 * Normalizes an array of products
 */
export const normalizeProducts = (products: ProductWithVariants[]): ProductWithVariants[] => {
  return products.map(normalizeProduct);
};

// ================================
// Debug and Logging Helpers
// ================================

/**
 * Creates a detailed log of variant update operations
 */
export const logVariantUpdate = (
  productId: string,
  variantIndex: number,
  field: string,
  oldValue: any,
  newValue: any,
  context: string = ''
) => {
  console.log(`[Variant Update] ${context}`, {
    productId,
    variantIndex,
    field,
    oldValue,
    newValue,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Creates a detailed log of product state changes
 */
export const logProductStateChange = (
  operation: string,
  productId: string,
  changes: Record<string, any>,
  context: string = ''
) => {
  console.log(`[Product State] ${operation} - ${context}`, {
    productId,
    changes,
    timestamp: new Date().toISOString(),
  });
};

// Re-export validation utilities for convenience
export * from './validation';