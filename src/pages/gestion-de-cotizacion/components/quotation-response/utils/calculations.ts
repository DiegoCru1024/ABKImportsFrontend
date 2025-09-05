import type { 
  ProductData, 
  VariantData, 
  CostingCalculation, 
  ResponseSummary,
  ProcessedResponse 
} from "./interfaces";

/**
 * Calculates costing for individual products and their variants
 */
export const calculateProductCosting = (
  product: ProductData,
  totalCommercialValue: number
): CostingCalculation => {
  const productTotal = product.variants.reduce(
    (sum, variant) => sum + (Number(variant.price) || 0),
    0
  );

  const equivalence = totalCommercialValue > 0 
    ? (productTotal / totalCommercialValue) * 100 
    : 0;

  const importCosts = (equivalence / 100) * 0.0; // Your logic here
  const totalCost = productTotal + importCosts;
  const unitCost = product.quantityTotal > 0 ? totalCost / product.quantityTotal : 0;

  return {
    commercialValue: productTotal,
    importCosts: Math.round(importCosts * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    unitCost: Math.round(unitCost * 100) / 100,
    margin: 0, // Can be calculated based on business logic
    finalPrice: Math.round(totalCost * 100) / 100,
  };
};

/**
 * Calculates unit costs for product variants in table format
 */
export const calculateUnitCostsForTable = (
  products: ProductData[],
  totalCommercialValue: number
) => {
  return products.map(product => {
    const equivalence = totalCommercialValue > 0
      ? ((Number(product.variants[0]?.price) || 0) / totalCommercialValue) * 100
      : 0;

    const importCosts = (equivalence / 100) * 0.0; // Your import cost logic
    const totalCost = (Number(product.variants[0]?.price) || 0) + importCosts;
    const unitCost = product.quantityTotal > 0 ? totalCost / product.quantityTotal : 0;

    return {
      ...product,
      equivalence: Math.round(equivalence * 100) / 100,
      importCosts: Math.round(importCosts * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      unitCost: Math.round(unitCost * 100) / 100,
      price: Number(product.variants[0]?.price) || 0,
      quantity: product.quantityTotal,
    };
  });
};

/**
 * Calculates totals for Pendiente response type
 */
export const calculatePendingTotals = (products: ProductData[]) => {
  const totalExpress = products.reduce((sum, product) => {
    const productTotal = product.variants?.reduce(
      (vSum, variant) => vSum + (Number(variant.price) || 0),
      0
    ) || 0;
    return sum + productTotal;
  }, 0);

  const totalQuantity = products.reduce((sum, product) => {
    if (product.quantityTotal !== undefined) {
      return sum + (Number(product.quantityTotal) || 0);
    }
    
    const productTotal = product.variants?.reduce(
      (vSum, variant) => vSum + (Number(variant.quantity) || 0),
      0
    ) || 0;
    return sum + productTotal;
  }, 0);

  const totalCBM = products.reduce(
    (sum, product) => sum + (Number(product.volume) || 0),
    0
  );

  const totalWeight = products.reduce(
    (sum, product) => sum + (Number(product.weight) || 0),
    0
  );

  const totalPrice = products.reduce((sum, product) => {
    const productTotal = product.variants?.reduce(
      (vSum, variant) => vSum + (Number(variant.price) || 0),
      0
    ) || 0;
    return sum + productTotal;
  }, 0);

  return {
    totalExpress,
    totalQuantity,
    totalCBM,
    totalWeight,
    totalPrice,
  };
};

/**
 * Calculates Factor M for cost calculations
 */
export const calculateFactorM = (products: any[]): number => {
  if (!products || products.length === 0) return 0;
  
  const total = products.reduce((sum, product) => {
    return sum + (product.totalCost || 0);
  }, 0);
  
  return Math.round((total / products.length) * 100) / 100;
};

/**
 * Generates response summary from processed response
 */
export const generateResponseSummary = (response: ProcessedResponse): ResponseSummary => {
  const products = response.data.products || [];
  const metadata = response.displayMetadata;

  const averageUnitCost = metadata.totalQuantity > 0 
    ? metadata.totalValue / metadata.totalQuantity 
    : 0;

  return {
    totalProducts: metadata.productCount,
    totalQuantity: metadata.totalQuantity,
    totalValue: metadata.totalValue,
    averageUnitCost: Math.round(averageUnitCost * 100) / 100,
    totalWeight: metadata.totalWeight,
    totalVolume: metadata.totalVolume,
    serviceType: response.serviceType,
    responseDate: response.data.quotationInfo?.date || '',
  };
};

/**
 * Formats currency values for display
 */
export const formatCurrencyForDisplay = (
  amount: number, 
  currency: string = 'USD', 
  decimals: number = 2
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Formats numeric values with thousand separators
 */
export const formatNumber = (
  value: number, 
  decimals: number = 2
): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Calculates percentage between two values
 */
export const calculatePercentage = (
  value: number, 
  total: number, 
  decimals: number = 2
): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Validates numeric input for calculations
 */
export const validateNumericInput = (value: any): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

/**
 * Rounds number to specified decimal places
 */
export const roundToDecimals = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Calculates totals for a group of responses
 */
export const calculateGroupTotals = (responses: ProcessedResponse[]) => {
  const totals = responses.reduce(
    (acc, response) => ({
      totalProducts: acc.totalProducts + response.displayMetadata.productCount,
      totalQuantity: acc.totalQuantity + response.displayMetadata.totalQuantity,
      totalValue: acc.totalValue + response.displayMetadata.totalValue,
      totalWeight: acc.totalWeight + response.displayMetadata.totalWeight,
      totalVolume: acc.totalVolume + response.displayMetadata.totalVolume,
    }),
    {
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      totalWeight: 0,
      totalVolume: 0,
    }
  );

  return {
    ...totals,
    averageValue: responses.length > 0 ? totals.totalValue / responses.length : 0,
    averageQuantity: responses.length > 0 ? totals.totalQuantity / responses.length : 0,
  };
};