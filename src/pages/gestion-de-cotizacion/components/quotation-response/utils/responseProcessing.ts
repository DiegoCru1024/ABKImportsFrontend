import type { QuotationGetResponsesForUsersDTO } from "@/api/interface/quotationResponseInterfaces";
import type {
  ProcessedResponse,
  ResponseGroup,
  DisplayMetadata,
  FilterCriteria,
  ProcessingOptions,
  EnhancedQuotationResponse,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "./interfaces";

/**
 * Generates a unique identifier for a response based on service type and response ID
 */
export const generateUniqueId = (response: QuotationGetResponsesForUsersDTO, index: number): string => {
  const responseId = response.quotationInfo?.idQuotationResponse || `temp-${index}`;
  return `${response.serviceType}-${responseId}`;
};

/**
 * Calculates display metadata for a response
 */
export const calculateDisplayMetadata = (response: QuotationGetResponsesForUsersDTO): DisplayMetadata => {
  const products = response.products || [];
  
  const productCount = products.length;
  
  const totalQuantity = products.reduce((sum, product) => {
    if (product.quantityTotal !== undefined) {
      return sum + (Number(product.quantityTotal) || 0);
    }
    
    const variantQuantity = product.variants?.reduce(
      (vSum, variant) => vSum + (Number(variant.quantity) || 0),
      0
    ) || 0;
    
    return sum + variantQuantity;
  }, 0);

  const totalValue = products.reduce((sum, product) => {
    const productTotal = product.variants?.reduce(
      (vSum, variant) => vSum + (Number(variant.price) || 0),
      0
    ) || 0;
    return sum + productTotal;
  }, 0);

  const totalWeight = products.reduce(
    (sum, product) => sum + (Number(product.weight) || 0),
    0
  );

  const totalVolume = products.reduce(
    (sum, product) => sum + (Number(product.volume) || 0),
    0
  );

  const hasVariants = products.some(product => 
    product.variants && product.variants.length > 0
  );

  return {
    productCount,
    totalValue,
    hasVariants,
    totalQuantity,
    totalWeight,
    totalVolume,
  };
};

/**
 * Validates response data structure
 */
export const validateResponseData = (response: QuotationGetResponsesForUsersDTO): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  if (!response.serviceType) {
    errors.push({
      field: 'serviceType',
      message: 'Service type is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!response.products || response.products.length === 0) {
    warnings.push({
      field: 'products',
      message: 'Response has no products',
      code: 'EMPTY_PRODUCTS',
    });
  }

  // Validate product structure
  if (response.products) {
    response.products.forEach((product, index) => {
      if (!product.name) {
        errors.push({
          field: `products[${index}].name`,
          message: 'Product name is required',
          code: 'REQUIRED_FIELD',
        });
      }

      if (!product.variants || product.variants.length === 0) {
        warnings.push({
          field: `products[${index}].variants`,
          message: 'Product has no variants',
          code: 'EMPTY_VARIANTS',
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Processes raw responses into enhanced format with unique identification
 */
export const processQuotationResponses = (
  rawResponses: QuotationGetResponsesForUsersDTO[],
  options: ProcessingOptions = {}
): ProcessedResponse[] => {
  const { 
    includeCalculations = false, 
    validateData = true, 
    generateSummary = true,
    sortByDate = true 
  } = options;

  if (!rawResponses || rawResponses.length === 0) {
    return [];
  }

  let processedResponses = rawResponses.map((response, index) => {
    // Validate if requested
    if (validateData) {
      const validation = validateResponseData(response);
      if (!validation.isValid) {
        console.warn(`Response validation failed for index ${index}:`, validation.errors);
      }
    }

    // Generate unique ID
    const uniqueId = generateUniqueId(response, index);
    
    // Calculate display metadata
    const displayMetadata = calculateDisplayMetadata(response);

    const processedResponse: ProcessedResponse = {
      uniqueId,
      serviceType: response.serviceType,
      responseId: response.quotationInfo?.idQuotationResponse || `temp-${index}`,
      data: response,
      isActive: false,
      processedAt: new Date().toISOString(),
      displayMetadata,
    };

    return processedResponse;
  });

  // Sort by date if requested
  if (sortByDate) {
    processedResponses = processedResponses.sort((a, b) => {
      const dateA = new Date(a.data.quotationInfo?.date || 0);
      const dateB = new Date(b.data.quotationInfo?.date || 0);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }

  return processedResponses;
};

/**
 * Groups processed responses by service type
 */
export const groupResponsesByServiceType = (
  responses: ProcessedResponse[]
): Record<string, ResponseGroup> => {
  const grouped = responses.reduce((groups, response) => {
    const { serviceType } = response;
    
    if (!groups[serviceType]) {
      groups[serviceType] = {
        serviceType,
        responses: [],
        defaultActive: response, // Will be overridden
        count: 0,
      };
    }
    
    groups[serviceType].responses.push(response);
    groups[serviceType].count = groups[serviceType].responses.length;
    
    return groups;
  }, {} as Record<string, ResponseGroup>);

  // Set default active for each group and mark the first response as active
  Object.values(grouped).forEach(group => {
    if (group.responses.length > 0) {
      group.defaultActive = group.responses[0];
      group.responses[0].isActive = true;
    }
  });

  return grouped;
};

/**
 * Filters responses based on criteria
 */
export const filterResponses = (
  responses: ProcessedResponse[],
  filters: FilterCriteria
): ProcessedResponse[] => {
  return responses.filter(response => {
    // Service type filter
    if (filters.serviceType && response.serviceType !== filters.serviceType) {
      return false;
    }

    // Response ID filter
    if (filters.responseId && response.responseId !== filters.responseId) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const responseDate = new Date(response.data.quotationInfo?.date || 0);
      if (responseDate < filters.dateRange.start || responseDate > filters.dateRange.end) {
        return false;
      }
    }

    // Status filter (if implemented in the future)
    if (filters.status && response.data.quotationInfo?.status !== filters.status) {
      return false;
    }

    return true;
  });
};

/**
 * Finds a response by unique ID
 */
export const findResponseByUniqueId = (
  responses: ProcessedResponse[],
  uniqueId: string
): ProcessedResponse | undefined => {
  return responses.find(response => response.uniqueId === uniqueId);
};

/**
 * Gets all unique service types from responses
 */
export const getUniqueServiceTypes = (responses: ProcessedResponse[]): string[] => {
  const serviceTypes = responses.map(response => response.serviceType);
  return Array.from(new Set(serviceTypes));
};

/**
 * Activates a specific response and deactivates others
 */
export const activateResponse = (
  responses: ProcessedResponse[],
  targetUniqueId: string
): ProcessedResponse[] => {
  return responses.map(response => ({
    ...response,
    isActive: response.uniqueId === targetUniqueId,
  }));
};

/**
 * Calculates aggregate statistics for responses
 */
export const calculateResponseStatistics = (responses: ProcessedResponse[]) => {
  const totalResponses = responses.length;
  const serviceTypes = getUniqueServiceTypes(responses);
  
  const totalProducts = responses.reduce(
    (sum, response) => sum + response.displayMetadata.productCount, 
    0
  );
  
  const totalValue = responses.reduce(
    (sum, response) => sum + response.displayMetadata.totalValue, 
    0
  );
  
  const totalQuantity = responses.reduce(
    (sum, response) => sum + response.displayMetadata.totalQuantity, 
    0
  );

  const averageProductsPerResponse = totalProducts / totalResponses || 0;
  const averageValuePerResponse = totalValue / totalResponses || 0;

  return {
    totalResponses,
    serviceTypes,
    totalProducts,
    totalValue,
    totalQuantity,
    averageProductsPerResponse,
    averageValuePerResponse,
  };
};

/**
 * Checks if responses need reprocessing based on timestamp
 */
export const shouldReprocessResponses = (
  responses: ProcessedResponse[],
  maxAgeMinutes: number = 30
): boolean => {
  if (responses.length === 0) return true;
  
  const now = new Date().getTime();
  const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
  
  return responses.some(response => {
    const processedTime = new Date(response.processedAt).getTime();
    return (now - processedTime) > maxAge;
  });
};

/**
 * Merges updated response data while preserving processing metadata
 */
export const mergeResponseUpdate = (
  existingResponse: ProcessedResponse,
  updatedData: QuotationGetResponsesForUsersDTO
): ProcessedResponse => {
  const newDisplayMetadata = calculateDisplayMetadata(updatedData);
  
  return {
    ...existingResponse,
    data: updatedData,
    displayMetadata: newDisplayMetadata,
    processedAt: new Date().toISOString(),
  };
};

/**
 * Exports response data for external use (CSV, Excel, etc.)
 */
export const exportResponsesData = (responses: ProcessedResponse[]) => {
  return responses.map(response => ({
    uniqueId: response.uniqueId,
    serviceType: response.serviceType,
    responseId: response.responseId,
    correlative: response.data.quotationInfo?.correlative || '',
    date: response.data.quotationInfo?.date || '',
    productCount: response.displayMetadata.productCount,
    totalQuantity: response.displayMetadata.totalQuantity,
    totalValue: response.displayMetadata.totalValue,
    totalWeight: response.displayMetadata.totalWeight,
    totalVolume: response.displayMetadata.totalVolume,
    hasVariants: response.displayMetadata.hasVariants,
    processedAt: response.processedAt,
  }));
};