/**
 * Type definitions for QuotationFilters component
 */

export interface QuotationFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  serviceTypeFilter?: string;
  onServiceTypeChange?: (serviceType: string) => void;
  onClearFilters: () => void;
  showAdvancedFilters?: boolean;
  compact?: boolean;
  className?: string;
  statistics?: {
    total: number;
    byStatus: Record<string, number>;
  };
}

export interface QuotationFiltersCompactProps 
  extends Omit<QuotationFiltersProps, 'compact' | 'showAdvancedFilters'> {
  showStatusOnly?: boolean;
}