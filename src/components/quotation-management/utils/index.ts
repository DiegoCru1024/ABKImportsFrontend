/**
 * Central exports for all quotation management utilities
 * Provides a single import point for utility functions
 */

// Re-export all utility functions
export * from './quotation.utils';
export * from './calculations.utils';
export * from './validation.utils';

// Re-export commonly used functions with aliases for convenience
export {
  formatQuotationStatus as formatStatus,
  getStatusColor as getStatusStyles,
  sortQuotationsByDate as sortByDate,
  filterQuotationsByStatus as filterByStatus,
  searchQuotations as searchByTerm,
} from './quotation.utils';

export {
  safeCalculate as calculate,
  calculateVariantTotals as getVariantTotals,
  formatCurrency as formatMoney,
} from './calculations.utils';

export {
  validateQuotationResponse as validateResponse,
  validateRequiredFields as checkRequiredFields,
} from './validation.utils';