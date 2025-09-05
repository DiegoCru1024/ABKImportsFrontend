/**
 * Central exports for all quotation management types
 * Provides a single import point for type definitions
 */

// Re-export all quotation types
export * from './quotation.types';
export * from './response.types';

// Common utility types used across the module
export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface SearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export interface FilterProps<T = unknown> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  placeholder?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ActionButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// Event handler types
export type QuotationSelectHandler = (quotationId: string) => void;
export type ResponseSelectHandler = (responseId: string) => void;
export type FilterChangeHandler<T> = (value: T) => void;
export type SearchChangeHandler = (term: string) => void;
export type PageChangeHandler = (page: number) => void;

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// Hook return types
export interface UseQuotationFiltersReturn {
  filters: {
    searchTerm: string;
    debouncedSearchTerm: string;
    statusFilter: string;
  };
  actions: {
    setSearchTerm: (term: string) => void;
    setStatusFilter: (status: string) => void;
    clearFilters: () => void;
  };
}

export interface UseResponseManagementReturn {
  state: {
    responses: ContentQuotationResponseDTO[];
    activeResponseId: string;
    editMode: boolean;
    isLoading: boolean;
    error: string | null;
  };
  actions: {
    activateResponse: (responseId: string) => void;
    toggleEditMode: () => void;
    refetch: () => void;
    updateResponse: (data: QuotationCreateUpdateResponseDTO) => void;
  };
}

export interface UseQuotationNavigationReturn {
  state: {
    currentView: ViewMode;
    selectedQuotationId: string | null;
    previousView?: ViewMode;
  };
  actions: {
    setView: (view: ViewMode) => void;
    selectQuotation: (id: string) => void;
    goBack: () => void;
    reset: () => void;
  };
}