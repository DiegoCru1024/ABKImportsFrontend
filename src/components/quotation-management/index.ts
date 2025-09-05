/**
 * Central exports for the entire quotation management module
 * Provides a single import point for all module components, hooks, and utilities
 */

// Component exports
export * from './components';
export * from './containers';

// Hook exports  
export * from './hooks';

// Utility exports
export * from './utils';

// Type exports
export * from './types';

// Module metadata
export const QuotationManagementModule = {
  name: 'Quotation Management',
  version: '2.0.0',
  description: 'Modular quotation management system with enhanced architecture',
  components: [
    'QuotationCard',
    'ResponseTable', 
    'ProductAccordion',
    'QuotationFilters',
  ],
  containers: [
    'QuotationListContainer',
    'ResponseManagementContainer',
  ],
  hooks: [
    'useQuotationFilters',
    'useQuotationNavigation', 
    'useResponseManagement',
  ],
  utilities: [
    'quotation.utils',
    'calculations.utils',
    'validation.utils',
  ],
};