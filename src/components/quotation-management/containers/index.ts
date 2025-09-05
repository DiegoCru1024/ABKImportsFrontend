/**
 * Central exports for all quotation management containers
 * Provides a single import point for container components
 */

export { useQuotationListContainer } from './QuotationListContainer';
export { ResponseManagementContainer, useResponseManagementContainer } from './ResponseManagementContainer';

// Re-export container prop types
export type { QuotationListContainerProps } from './QuotationListContainer';
export type { ResponseManagementContainerProps } from './ResponseManagementContainer';

// Legacy exports for backward compatibility
import { useQuotationListContainer } from './QuotationListContainer';
export const QuotationListContainer = useQuotationListContainer;