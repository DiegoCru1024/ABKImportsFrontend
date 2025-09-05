/**
 * Utility functions for quotation data manipulation
 * Pure functions with no side effects
 */

import type { 
  QuotationData, 
  QuotationStatus, 
  StatusConfig,
  QuotationsByUserResponseInterfaceContent 
} from '../types';

// Status configuration mappings
export const statusConfig: Record<QuotationStatus, StatusConfig> = {
  draft: {
    label: "Borrador",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
  pending: {
    label: "Pendiente",
    color: "yellow", 
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  approved: {
    label: "Aprobado",
    color: "green",
    bgColor: "bg-green-100", 
    textColor: "text-green-800",
  },
  cancelled: {
    label: "Cancelado",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
  completed: {
    label: "Completado",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
};

/**
 * Formats quotation status for display
 */
export const formatQuotationStatus = (status: string): string => {
  const normalizedStatus = status.toLowerCase() as QuotationStatus;
  return statusConfig[normalizedStatus]?.label || status;
};

/**
 * Gets status color configuration
 */
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase() as QuotationStatus;
  return statusConfig[normalizedStatus]?.bgColor || "bg-gray-100 text-gray-800";
};

/**
 * Gets full status configuration
 */
export const getStatusConfig = (status: string): StatusConfig => {
  const normalizedStatus = status.toLowerCase() as QuotationStatus;
  return statusConfig[normalizedStatus] || statusConfig.draft;
};

/**
 * Sorts quotations by date
 */
export const sortQuotationsByDate = (
  quotations: QuotationData[],
  direction: 'asc' | 'desc' = 'desc'
): QuotationData[] => {
  return [...quotations].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return direction === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Filters quotations by status
 */
export const filterQuotationsByStatus = (
  quotations: QuotationData[],
  status: string
): QuotationData[] => {
  if (status === 'all' || !status) return quotations;
  return quotations.filter(q => q.status.toLowerCase() === status.toLowerCase());
};

/**
 * Searches quotations by multiple criteria
 */
export const searchQuotations = (
  quotations: QuotationData[],
  searchTerm: string
): QuotationData[] => {
  if (!searchTerm.trim()) return quotations;
  
  const term = searchTerm.toLowerCase();
  return quotations.filter(q => 
    q.correlative.toLowerCase().includes(term) ||
    q.clientName.toLowerCase().includes(term) ||
    q.clientEmail.toLowerCase().includes(term) ||
    q.id.toLowerCase().includes(term) ||
    q.products.some(p => p.name.toLowerCase().includes(term))
  );
};

/**
 * Combines filtering and searching
 */
export const filterAndSearchQuotations = (
  quotations: QuotationData[],
  filters: {
    searchTerm?: string;
    status?: string;
    serviceType?: string;
  }
): QuotationData[] => {
  let result = quotations;

  // Apply status filter
  if (filters.status) {
    result = filterQuotationsByStatus(result, filters.status);
  }

  // Apply service type filter
  if (filters.serviceType && filters.serviceType !== 'all') {
    result = result.filter(q => q.serviceType === filters.serviceType);
  }

  // Apply search
  if (filters.searchTerm) {
    result = searchQuotations(result, filters.searchTerm);
  }

  return result;
};

/**
 * Calculates quotation statistics
 */
export const calculateQuotationStats = (quotations: QuotationData[]) => {
  const total = quotations.length;
  const byStatus = quotations.reduce((acc, quotation) => {
    const status = quotation.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalValue = quotations.reduce((sum, q) => sum + (q.totalValue || 0), 0);
  const averageValue = total > 0 ? totalValue / total : 0;

  const totalProducts = quotations.reduce((sum, q) => sum + q.productQuantity, 0);
  const averageProducts = total > 0 ? totalProducts / total : 0;

  return {
    total,
    byStatus,
    financials: {
      totalValue,
      averageValue,
    },
    products: {
      totalProducts,
      averageProducts,
    },
  };
};

/**
 * Converts legacy API response to normalized format
 */
export const normalizeQuotationData = (
  apiData: QuotationsByUserResponseInterfaceContent
): QuotationData => {
  return {
    id: apiData.quotationId,
    correlative: apiData.correlative,
    clientName: apiData.user.name,
    clientEmail: apiData.user.email,
    status: apiData.status.toLowerCase() as QuotationStatus,
    serviceType: apiData.service_type as any,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    products: [], // Will be populated when needed
    totalValue: 0, // Will be calculated when needed
    responseCount: 0, // Will be fetched when needed
    user: apiData.user,
    productQuantity: apiData.productQuantity,
  };
};

/**
 * Converts array of legacy API responses to normalized format
 */
export const normalizeQuotationList = (
  apiDataList: QuotationsByUserResponseInterfaceContent[]
): QuotationData[] => {
  return apiDataList.map(normalizeQuotationData);
};

/**
 * Gets quotation display priority for sorting
 */
export const getQuotationPriority = (quotation: QuotationData): number => {
  const priorityMap: Record<QuotationStatus, number> = {
    pending: 1,
    draft: 2,
    approved: 3,
    completed: 4,
    cancelled: 5,
  };
  
  return priorityMap[quotation.status] || 99;
};

/**
 * Sorts quotations by priority and date
 */
export const sortQuotationsByPriority = (
  quotations: QuotationData[]
): QuotationData[] => {
  return [...quotations].sort((a, b) => {
    const priorityDiff = getQuotationPriority(a) - getQuotationPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Checks if quotation can be edited
 */
export const canEditQuotation = (quotation: QuotationData): boolean => {
  return ['draft', 'pending'].includes(quotation.status);
};

/**
 * Checks if quotation can be cancelled
 */
export const canCancelQuotation = (quotation: QuotationData): boolean => {
  return ['draft', 'pending', 'approved'].includes(quotation.status);
};

/**
 * Gets available actions for a quotation
 */
export const getQuotationActions = (quotation: QuotationData) => {
  return {
    canView: true,
    canEdit: canEditQuotation(quotation),
    canCancel: canCancelQuotation(quotation),
    canRespond: quotation.status === 'pending',
    canViewResponses: quotation.responseCount > 0,
  };
};

/**
 * Formats quotation correlative for display
 */
export const formatCorrelative = (correlative: string): string => {
  if (!correlative) return '';
  
  // Add formatting if needed (e.g., COT-2024-001)
  if (correlative.length > 0 && !correlative.includes('-')) {
    return `COT-${correlative}`;
  }
  
  return correlative;
};

/**
 * Generates unique quotation ID
 */
export const generateQuotationId = (): string => {
  return `quot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates quotation data structure
 */
export const validateQuotationData = (data: Partial<QuotationData>): boolean => {
  const requiredFields = ['id', 'correlative', 'status'];
  return requiredFields.every(field => data[field as keyof QuotationData]);
};

/**
 * Deep clones quotation data
 */
export const cloneQuotationData = (quotation: QuotationData): QuotationData => {
  return JSON.parse(JSON.stringify(quotation));
};

/**
 * Merges quotation data updates
 */
export const mergeQuotationUpdates = (
  original: QuotationData,
  updates: Partial<QuotationData>
): QuotationData => {
  return {
    ...original,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
};