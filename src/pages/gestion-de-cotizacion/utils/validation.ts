/**
 * Validation utilities for product variant logic
 * Provides validation functions for products, variants, and business rules
 */

// ================================
// Type Definitions
// ================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProductWithVariants {
  id?: string;
  productId?: string;
  name: string;
  adminComment?: string;
  boxes?: number;
  cbm?: number;
  weight?: number;
  variants?: Variant[];
  attachments?: string[];
  url?: string;
  comment?: string;
}

export interface Variant {
  variantId?: string;
  id?: string;
  size?: string;
  presentation?: string;
  model?: string;
  color?: string;
  quantity: number;
  price?: number;
  express?: number;
  unitCost?: number;
  importCosts?: number;
}

// ================================
// Product Validation
// ================================

/**
 * Validates a product with its variants
 */
export const validateProductData = (product: ProductWithVariants): ValidationResult => {
  const errors: string[] = [];

  // Product name validation
  if (!product.name || product.name.trim() === '') {
    errors.push('Product name is required');
  }

  // Product ID validation
  if (!product.id && !product.productId) {
    errors.push('Product must have an ID');
  }

  // Variants validation
  if (!product.variants || product.variants.length === 0) {
    errors.push('Product must have at least one variant');
  } else {
    product.variants.forEach((variant, index) => {
      const variantErrors = validateVariantData(variant);
      if (!variantErrors.isValid) {
        variantErrors.errors.forEach(error => {
          errors.push(`Variant ${index + 1}: ${error}`);
        });
      }
    });
  }

  // Packing list validation
  if (product.boxes !== undefined && product.boxes < 0) {
    errors.push('Number of boxes cannot be negative');
  }

  if (product.cbm !== undefined && product.cbm < 0) {
    errors.push('CBM cannot be negative');
  }

  if (product.weight !== undefined && product.weight < 0) {
    errors.push('Weight cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ================================
// Variant Validation
// ================================

/**
 * Validates a single variant
 */
export const validateVariantData = (variant: Variant): ValidationResult => {
  const errors: string[] = [];

  // Variant ID validation
  if (!variant.variantId && !variant.id) {
    errors.push('Variant must have an ID');
  }

  // Quantity validation
  if (variant.quantity === undefined || variant.quantity === null) {
    errors.push('Quantity is required');
  } else if (!Number.isInteger(variant.quantity) || variant.quantity <= 0) {
    errors.push('Quantity must be a positive integer');
  }

  // Price validation
  if (variant.price !== undefined && variant.price < 0) {
    errors.push('Price cannot be negative');
  }

  // Express cost validation
  if (variant.express !== undefined && variant.express < 0) {
    errors.push('Express cost cannot be negative');
  }

  // Unit cost validation
  if (variant.unitCost !== undefined && variant.unitCost < 0) {
    errors.push('Unit cost cannot be negative');
  }

  // Import costs validation
  if (variant.importCosts !== undefined && variant.importCosts < 0) {
    errors.push('Import costs cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates variant input field values
 */
export const validateVariantInput = (field: string, value: number): ValidationResult => {
  const errors: string[] = [];

  switch (field) {
    case 'price':
    case 'express':
    case 'unitCost':
    case 'importCosts':
      if (value < 0) {
        errors.push(`${field} cannot be negative`);
      }
      if (!isFinite(value)) {
        errors.push(`${field} must be a valid number`);
      }
      break;
    
    case 'quantity':
      if (!Number.isInteger(value) || value <= 0) {
        errors.push('Quantity must be a positive integer');
      }
      break;

    default:
      // No specific validation for unknown fields
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ================================
// Business Rules Validation
// ================================

/**
 * Validates minimum margin requirements
 */
export const validateMinimumMargin = (unitCost: number, price: number, minimumMarginPercent: number = 10): ValidationResult => {
  const errors: string[] = [];

  if (unitCost > 0 && price > 0) {
    const margin = ((price - unitCost) / price) * 100;
    if (margin < minimumMarginPercent) {
      errors.push(`Margin ${margin.toFixed(1)}% is below minimum required margin of ${minimumMarginPercent}%`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates product totals calculation
 */
export const validateProductTotals = (variants: Variant[]): ValidationResult => {
  const errors: string[] = [];

  if (!variants || variants.length === 0) {
    errors.push('No variants provided for totals calculation');
    return { isValid: false, errors };
  }

  let totalQuantity = 0;
  let totalPrice = 0;
  let totalExpress = 0;

  variants.forEach((variant, index) => {
    if (variant.quantity > 0) {
      totalQuantity += variant.quantity;
      totalPrice += (variant.price || 0) * variant.quantity;
      totalExpress += variant.express || 0;
    } else {
      errors.push(`Variant ${index + 1} has invalid quantity: ${variant.quantity}`);
    }
  });

  if (totalQuantity === 0) {
    errors.push('Total quantity cannot be zero');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ================================
// DTO Validation
// ================================

/**
 * Validates quotation response DTO structure
 */
export interface QuotationResponseDTO {
  quotationInfo: any;
  calculations: any;
  products: ProductResponseData[];
}

export interface ProductResponseData {
  productId: string;
  name: string;
  adminComment: string;
  seCotizaProducto: boolean;
  variants: VariantResponseData[];
}

export interface VariantResponseData {
  variantId: string;
  quantity: number;
  precio_unitario: number;
  precio_express: number;
  seCotizaVariante: boolean;
}

/**
 * Validates response DTO before sending to backend
 */
export const validateQuotationResponseDTO = (dto: QuotationResponseDTO): ValidationResult => {
  const errors: string[] = [];

  // Quotation info validation
  if (!dto.quotationInfo) {
    errors.push('Quotation info is required');
  } else {
    if (!dto.quotationInfo.quotationId) {
      errors.push('Quotation ID is required');
    }
    if (!dto.quotationInfo.serviceType) {
      errors.push('Service type is required');
    }
  }

  // Products validation
  if (!dto.products || dto.products.length === 0) {
    errors.push('At least one product is required');
  } else {
    dto.products.forEach((product, index) => {
      if (!product.productId) {
        errors.push(`Product ${index + 1}: Product ID is required`);
      }
      if (!product.name) {
        errors.push(`Product ${index + 1}: Product name is required`);
      }
      
      // Variants validation
      if (!product.variants || product.variants.length === 0) {
        errors.push(`Product ${index + 1}: At least one variant is required`);
      } else {
        product.variants.forEach((variant, vIndex) => {
          if (!variant.variantId) {
            errors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Variant ID is required`);
          }
          if (variant.quantity <= 0) {
            errors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Quantity must be positive`);
          }
          if (variant.precio_unitario < 0) {
            errors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Unit price cannot be negative`);
          }
          if (variant.precio_express < 0) {
            errors.push(`Product ${index + 1}, Variant ${vIndex + 1}: Express price cannot be negative`);
          }
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ================================
// Calculation Utilities
// ================================

/**
 * Calculates product totals from variants
 */
export const calculateProductTotals = (variants: Variant[]) => {
  return variants.reduce((totals, variant) => ({
    totalPrice: totals.totalPrice + ((variant.price || 0) * variant.quantity),
    totalExpress: totals.totalExpress + (variant.express || 0),
    totalQuantity: totals.totalQuantity + variant.quantity,
    totalUnitCost: totals.totalUnitCost + ((variant.unitCost || 0) * variant.quantity),
    totalImportCosts: totals.totalImportCosts + (variant.importCosts || 0),
  }), { 
    totalPrice: 0, 
    totalExpress: 0, 
    totalQuantity: 0,
    totalUnitCost: 0,
    totalImportCosts: 0,
  });
};

/**
 * Calculates total CBM and weight from products
 */
export const calculateTotalPackingData = (products: ProductWithVariants[]) => {
  return products.reduce((totals, product) => ({
    totalCBM: totals.totalCBM + (product.cbm || 0),
    totalWeight: totals.totalWeight + (product.weight || 0),
    totalBoxes: totals.totalBoxes + (product.boxes || 0),
  }), {
    totalCBM: 0,
    totalWeight: 0,
    totalBoxes: 0,
  });
};

// ================================
// Helper Functions
// ================================

/**
 * Gets the product ID in a consistent way
 */
export const getProductId = (product: ProductWithVariants): string => {
  return product.id || product.productId || '';
};

/**
 * Gets the variant ID in a consistent way
 */
export const getVariantId = (variant: Variant): string => {
  return variant.variantId || variant.id || '';
};

/**
 * Creates a validation summary for multiple products
 */
export const validateMultipleProducts = (products: ProductWithVariants[]): ValidationResult => {
  const allErrors: string[] = [];

  products.forEach((product, index) => {
    const productValidation = validateProductData(product);
    if (!productValidation.isValid) {
      productValidation.errors.forEach(error => {
        allErrors.push(`Product ${index + 1}: ${error}`);
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};