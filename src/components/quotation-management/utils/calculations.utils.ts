/**
 * Enhanced calculation utilities with better type safety
 * Moved from page-specific utils to shared utilities
 */

import type { 
  CalculationResult, 
  VariantTotals, 
  VariantData,
  DynamicValues,
  ServiceCalculations,
  ImportExpenses 
} from '../types';

/**
 * Safe calculation wrapper that handles errors and edge cases
 */
export const safeCalculate = (
  calculation: () => number,
  fallback: number = 0
): CalculationResult => {
  try {
    const value = calculation();
    
    if (!isFinite(value) || isNaN(value)) {
      return {
        success: false,
        value: fallback,
        error: 'Calculation resulted in invalid number',
      };
    }
    
    return {
      success: true,
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
    };
  } catch (error) {
    return {
      success: false,
      value: fallback,
      error: error instanceof Error ? error.message : 'Unknown calculation error',
    };
  }
};

/**
 * Calculates totals for product variants
 */
export const calculateVariantTotals = (variants: VariantData[]): VariantTotals => {
  return variants.reduce((totals, variant) => {
    const price = Number(variant.price || 0);
    const quantity = Number(variant.quantity || 0);
    const unitCost = Number(variant.unitCost || 0);
    const importCosts = Number(variant.importCosts || 0);
    
    return {
      totalPrice: totals.totalPrice + (price * quantity),
      totalExpress: totals.totalExpress, // Express is per variant, not multiplied
      totalQuantity: totals.totalQuantity + quantity,
      totalUnitCost: totals.totalUnitCost + (unitCost * quantity),
      totalImportCosts: totals.totalImportCosts + (importCosts * quantity),
    };
  }, {
    totalPrice: 0,
    totalExpress: 0,
    totalQuantity: 0,
    totalUnitCost: 0,
    totalImportCosts: 0,
  });
};

/**
 * Calculates commercial value from variants
 */
export const calculateCommercialValue = (variants: VariantData[]): number => {
  const result = safeCalculate(() => {
    return variants.reduce((total, variant) => {
      const price = Number(variant.price || 0);
      const quantity = Number(variant.quantity || 0);
      return total + (price * quantity);
    }, 0);
  });
  
  return result.value;
};

/**
 * Calculates total weight from variants
 */
export const calculateTotalWeight = (variants: VariantData[]): number => {
  const result = safeCalculate(() => {
    return variants.reduce((total, variant) => {
      const quantity = Number(variant.quantity || 0);
      // Assuming weight is stored somewhere, using 1 as default
      const weight = 1; // This should come from product data
      return total + (quantity * weight);
    }, 0);
  });
  
  return result.value;
};

/**
 * Calculates FOB value
 */
export const calculateFOB = (commercialValue: number, flete: number = 0): number => {
  const result = safeCalculate(() => commercialValue + flete);
  return result.value;
};

/**
 * Calculates CIF value
 */
export const calculateCIF = (fob: number, seguro: number = 0): number => {
  const result = safeCalculate(() => fob + seguro);
  return result.value;
};

/**
 * Calculates ad valorem tax
 */
export const calculateAdValorem = (cif: number, rate: number): number => {
  const result = safeCalculate(() => cif * (rate / 100));
  return result.value;
};

/**
 * Calculates IGV (VAT) 
 */
export const calculateIGV = (taxableAmount: number, rate: number = 18): number => {
  const result = safeCalculate(() => taxableAmount * (rate / 100));
  return result.value;
};

/**
 * Calculates ISC (Selective Consumption Tax)
 */
export const calculateISC = (taxableAmount: number, rate: number): number => {
  const result = safeCalculate(() => taxableAmount * (rate / 100));
  return result.value;
};

/**
 * Calculates IPM (Municipal Promotion Tax)
 */
export const calculateIPM = (cif: number, rate: number = 2): number => {
  const result = safeCalculate(() => cif * (rate / 100));
  return result.value;
};

/**
 * Calculates perception tax
 */
export const calculatePerception = (igv: number, rate: number): number => {
  const result = safeCalculate(() => igv * (rate / 100));
  return result.value;
};

/**
 * Calculates total taxes
 */
export const calculateTotalTaxes = (
  adValorem: number,
  igv: number,
  isc: number = 0,
  ipm: number = 0
): number => {
  const result = safeCalculate(() => adValorem + igv + isc + ipm);
  return result.value;
};

/**
 * Calculates customs clearance costs
 */
export const calculateCustomsClearance = (
  cif: number,
  baseRate: number = 150,
  percentageRate: number = 0
): number => {
  const result = safeCalculate(() => {
    const percentageCost = cif * (percentageRate / 100);
    return baseRate + percentageCost;
  });
  return result.value;
};

/**
 * Calculates freight costs based on weight/volume
 */
export const calculateFreight = (
  weight: number,
  volume: number,
  ratePerKg: number = 5,
  ratePerCBM: number = 100
): number => {
  const result = safeCalculate(() => {
    const weightCost = weight * ratePerKg;
    const volumeCost = volume * ratePerCBM;
    return Math.max(weightCost, volumeCost); // Charge based on higher value
  });
  return result.value;
};

/**
 * Calculates insurance costs
 */
export const calculateInsurance = (
  commercialValue: number,
  rate: number = 0.5
): number => {
  const result = safeCalculate(() => commercialValue * (rate / 100));
  return result.value;
};

/**
 * Calculates service consolidation costs
 */
export const calculateServiceConsolidation = (
  isAerial: boolean,
  isMaritime: boolean,
  baseCost: number,
  aerialRate: number = 1.2,
  maritimeRate: number = 1.0
): number => {
  const result = safeCalculate(() => {
    let rate = 1.0;
    if (isAerial) rate = aerialRate;
    if (isMaritime) rate = maritimeRate;
    return baseCost * rate;
  });
  return result.value;
};

/**
 * Calculates total import costs
 */
export const calculateTotalImportCosts = (
  cif: number,
  taxes: number,
  customsClearance: number,
  additionalServices: number = 0
): number => {
  const result = safeCalculate(() => 
    cif + taxes + customsClearance + additionalServices
  );
  return result.value;
};

/**
 * Calculates total investment (landed cost)
 */
export const calculateTotalInvestment = (
  importCosts: number,
  localTransport: number = 0,
  otherCosts: number = 0
): number => {
  const result = safeCalculate(() => 
    importCosts + localTransport + otherCosts
  );
  return result.value;
};

/**
 * Calculates margin and markup
 */
export const calculateMargin = (sellingPrice: number, cost: number) => {
  const margin = safeCalculate(() => sellingPrice - cost);
  const marginPercentage = safeCalculate(() => 
    cost > 0 ? (margin.value / cost) * 100 : 0
  );
  const markup = safeCalculate(() => 
    sellingPrice > 0 ? (margin.value / sellingPrice) * 100 : 0
  );
  
  return {
    margin: margin.value,
    marginPercentage: marginPercentage.value,
    markup: markup.value,
  };
};

/**
 * Calculates unit costs based on total costs and quantities
 */
export const calculateUnitCosts = (
  totalCosts: number,
  totalQuantity: number
): number => {
  const result = safeCalculate(() => 
    totalQuantity > 0 ? totalCosts / totalQuantity : 0
  );
  return result.value;
};

/**
 * Validates calculation inputs
 */
export const validateCalculationInputs = (
  inputs: Record<string, number>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  Object.entries(inputs).forEach(([key, value]) => {
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${key} must be a valid number`);
    }
    if (value < 0) {
      errors.push(`${key} cannot be negative`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Converts between currencies (simplified)
 */
export const convertCurrency = (
  amount: number,
  exchangeRate: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'PEN'
): number => {
  const result = safeCalculate(() => {
    if (fromCurrency === toCurrency) return amount;
    if (fromCurrency === 'USD' && toCurrency === 'PEN') {
      return amount * exchangeRate;
    }
    if (fromCurrency === 'PEN' && toCurrency === 'USD') {
      return amount / exchangeRate;
    }
    return amount; // Default to same amount if conversion not supported
  });
  return result.value;
};

/**
 * Formats monetary values for display
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Rounds monetary values to appropriate precision
 */
export const roundCurrency = (amount: number, precision: number = 2): number => {
  const factor = Math.pow(10, precision);
  return Math.round(amount * factor) / factor;
};