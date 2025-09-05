/**
 * Validation utilities for quotation responses
 * Provides reusable validation functions and business rules
 */

import type { 
  ResponseFormValidation,
  ValidationRule,
  QuotationCreateUpdateResponseDTO,
  VariantQuotationResponseDTO 
} from '../types';

/**
 * Validates required fields in quotation response
 */
export const validateRequiredFields = (
  data: Partial<QuotationCreateUpdateResponseDTO>
): ResponseFormValidation => {
  const errors: Record<string, string> = {};
  const requiredFields: string[] = [];

  // Validate quotation info
  if (!data.quotationInfo?.serviceType) {
    errors.serviceType = 'Service type is required';
    requiredFields.push('serviceType');
  }

  if (!data.quotationInfo?.cargoType) {
    errors.cargoType = 'Cargo type is required';
    requiredFields.push('cargoType');
  }

  // Validate calculations
  if (!data.calculations?.dynamicValues?.comercialValue || 
      data.calculations.dynamicValues.comercialValue <= 0) {
    errors.comercialValue = 'Commercial value must be greater than 0';
    requiredFields.push('comercialValue');
  }

  // Validate products
  if (!data.products || data.products.length === 0) {
    errors.products = 'At least one product must be quoted';
    requiredFields.push('products');
  } else {
    // Validate each product
    data.products.forEach((product, index) => {
      if (!product.seCotizaProducto) {
        errors[`product_${index}`] = 'Product must be marked for quotation';
        requiredFields.push(`product_${index}`);
      }

      // Validate variants
      if (!product.variants || product.variants.length === 0) {
        errors[`product_${index}_variants`] = 'Product must have at least one variant';
        requiredFields.push(`product_${index}_variants`);
      } else {
        product.variants.forEach((variant, variantIndex) => {
          if (variant.seCotizaVariante) {
            if (!variant.price || Number(variant.price) <= 0) {
              errors[`variant_${index}_${variantIndex}_price`] = 'Variant price is required';
              requiredFields.push(`variant_${index}_${variantIndex}_price`);
            }
            if (!variant.unitCost || Number(variant.unitCost) <= 0) {
              errors[`variant_${index}_${variantIndex}_unitCost`] = 'Unit cost is required';
              requiredFields.push(`variant_${index}_${variantIndex}_unitCost`);
            }
          }
        });
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    requiredFields,
  };
};

/**
 * Validates numeric field constraints
 */
export const validateNumericField = (
  value: number,
  rules: {
    min?: number;
    max?: number;
    required?: boolean;
  }
): { isValid: boolean; error?: string } => {
  if (rules.required && (value === undefined || value === null)) {
    return { isValid: false, error: 'Field is required' };
  }

  if (value !== undefined && value !== null) {
    if (isNaN(value)) {
      return { isValid: false, error: 'Must be a valid number' };
    }

    if (rules.min !== undefined && value < rules.min) {
      return { isValid: false, error: `Must be at least ${rules.min}` };
    }

    if (rules.max !== undefined && value > rules.max) {
      return { isValid: false, error: `Must be at most ${rules.max}` };
    }
  }

  return { isValid: true };
};

/**
 * Validates variant data
 */
export const validateVariant = (
  variant: VariantQuotationResponseDTO
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (variant.seCotizaVariante) {
    // Price validation
    const priceValue = Number(variant.price);
    const priceValidation = validateNumericField(priceValue, {
      min: 0,
      required: true,
    });
    if (!priceValidation.isValid) {
      errors.price = priceValidation.error!;
    }

    // Unit cost validation
    const unitCostValue = Number(variant.unitCost);
    const unitCostValidation = validateNumericField(unitCostValue, {
      min: 0,
      required: true,
    });
    if (!unitCostValidation.isValid) {
      errors.unitCost = unitCostValidation.error!;
    }

    // Import costs validation
    const importCostsValue = Number(variant.importCosts);
    const importCostsValidation = validateNumericField(importCostsValue, {
      min: 0,
      required: false,
    });
    if (!importCostsValidation.isValid) {
      errors.importCosts = importCostsValidation.error!;
    }

    // Quantity validation
    const quantityValidation = validateNumericField(variant.quantity, {
      min: 1,
      required: true,
    });
    if (!quantityValidation.isValid) {
      errors.quantity = quantityValidation.error!;
    }

    // Business rule: unit cost should not exceed price
    if (priceValue > 0 && unitCostValue > 0 && unitCostValue > priceValue) {
      errors.unitCost = 'Unit cost cannot exceed selling price';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates service type requirements
 */
export const validateServiceTypeRequirements = (
  serviceType: string,
  calculations: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  switch (serviceType.toLowerCase()) {
    case 'maritimo':
      if (!calculations.dynamicValues?.naviera) {
        errors.naviera = 'Shipping line is required for maritime service';
      }
      if (!calculations.dynamicValues?.transitTime || calculations.dynamicValues.transitTime <= 0) {
        errors.transitTime = 'Transit time is required for maritime service';
      }
      break;

    case 'aereo':
      if (!calculations.dynamicValues?.courier) {
        errors.courier = 'Courier is required for aerial service';
      }
      break;

    case 'courier':
      if (!calculations.dynamicValues?.courier) {
        errors.courier = 'Courier service is required';
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates calculation consistency
 */
export const validateCalculationConsistency = (
  calculations: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (calculations.dynamicValues) {
    const {
      comercialValue,
      flete,
      seguro,
      fob,
      cif,
      tipoCambio,
    } = calculations.dynamicValues;

    // FOB should equal commercial value + freight
    if (fob && comercialValue && flete) {
      const expectedFOB = comercialValue + flete;
      if (Math.abs(fob - expectedFOB) > 0.01) {
        errors.fob = 'FOB calculation is inconsistent';
      }
    }

    // CIF should equal FOB + insurance
    if (cif && fob && seguro) {
      const expectedCIF = fob + seguro;
      if (Math.abs(cif - expectedCIF) > 0.01) {
        errors.cif = 'CIF calculation is inconsistent';
      }
    }

    // Exchange rate should be positive
    if (tipoCambio && tipoCambio <= 0) {
      errors.tipoCambio = 'Exchange rate must be positive';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates exemption logic
 */
export const validateExemptions = (
  exemptions: any,
  dynamicValues: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // If taxes are exempted, tax amounts should be zero
  if (exemptions.obligacionesFiscales) {
    if (dynamicValues.adValoremRate && dynamicValues.adValoremRate > 0) {
      errors.adValoremRate = 'Ad Valorem rate should be 0 when tax obligations are exempted';
    }
    if (dynamicValues.igvRate && dynamicValues.igvRate > 0) {
      errors.igvRate = 'IGV rate should be 0 when tax obligations are exempted';
    }
  }

  // If freight insurance is exempted, related costs should be zero
  if (exemptions.desaduanajeFleteSaguro) {
    if (dynamicValues.desaduanaje && dynamicValues.desaduanaje > 0) {
      errors.desaduanaje = 'Customs clearance should be 0 when exempted';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Comprehensive validation for quotation response
 */
export const validateQuotationResponse = (
  data: QuotationCreateUpdateResponseDTO
): ResponseFormValidation => {
  const validations = [
    validateRequiredFields(data),
    validateServiceTypeRequirements(data.quotationInfo.serviceType, data.calculations),
    validateCalculationConsistency(data.calculations),
    validateExemptions(data.calculations.exemptions, data.calculations.dynamicValues),
  ];

  const allErrors = validations.reduce((acc, validation) => ({
    ...acc,
    ...validation.errors,
  }), {});

  const allRequiredFields = validations.reduce((acc, validation) => [
    ...acc,
    ...(validation.requiredFields || []),
  ], [] as string[]);

  return {
    isValid: validations.every(v => v.isValid),
    errors: allErrors,
    requiredFields: allRequiredFields,
  };
};

/**
 * Validates business rules for minimum order values
 */
export const validateMinimumOrderValue = (
  comercialValue: number,
  serviceType: string
): { isValid: boolean; error?: string } => {
  const minimumValues = {
    maritimo: 1000,
    aereo: 500,
    courier: 100,
  };

  const minValue = minimumValues[serviceType.toLowerCase() as keyof typeof minimumValues] || 0;

  if (comercialValue < minValue) {
    return {
      isValid: false,
      error: `Minimum order value for ${serviceType} is $${minValue}`,
    };
  }

  return { isValid: true };
};

/**
 * Validates profit margin requirements
 */
export const validateProfitMargin = (
  sellingPrice: number,
  cost: number,
  minimumMarginPercent: number = 10
): { isValid: boolean; error?: string } => {
  if (cost <= 0 || sellingPrice <= 0) {
    return { isValid: true }; // Skip validation if values are not set
  }

  const margin = sellingPrice - cost;
  const marginPercent = (margin / cost) * 100;

  if (marginPercent < minimumMarginPercent) {
    return {
      isValid: false,
      error: `Profit margin (${marginPercent.toFixed(1)}%) is below minimum requirement (${minimumMarginPercent}%)`,
    };
  }

  return { isValid: true };
};