/**
 * Hook for managing quotation filtering state and logic
 * Provides debounced search and filter state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  QuotationFilters, 
  FilterActions,
  UseQuotationFiltersReturn 
} from '../types';

interface UseQuotationFiltersProps {
  initialFilters?: Partial<QuotationFilters>;
  onFiltersChange?: (filters: QuotationFilters) => void;
  debounceMs?: number;
}

export const useQuotationFilters = ({
  initialFilters = {},
  onFiltersChange,
  debounceMs = 500,
}: UseQuotationFiltersProps = {}): UseQuotationFiltersReturn => {
  // Use ref to store the callback to avoid dependency issues
  const onFiltersChangeRef = useRef(onFiltersChange);
  
  // Update ref when callback changes
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  // State management
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialFilters.searchTerm || "");
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || "all");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Notify parent of filter changes (using ref to avoid infinite loops)
  useEffect(() => {
    const filters: QuotationFilters = {
      searchTerm,
      debouncedSearchTerm,
      status: statusFilter,
    };
    onFiltersChangeRef.current?.(filters);
  }, [debouncedSearchTerm, statusFilter, searchTerm]);

  // Actions
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
  }, []);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const updateStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  return {
    filters: {
      searchTerm,
      debouncedSearchTerm,
      statusFilter,
    },
    actions: {
      setSearchTerm: updateSearchTerm,
      setStatusFilter: updateStatusFilter,
      clearFilters,
    },
  };
};

/**
 * Hook variant that also handles service type filtering
 */
export const useAdvancedQuotationFilters = ({
  initialFilters = {},
  onFiltersChange,
  debounceMs = 500,
}: UseQuotationFiltersProps = {}) => {
  // Use ref to store the callback to avoid dependency issues
  const onFiltersChangeRef = useRef(onFiltersChange);
  
  // Update ref when callback changes
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  const basicFilters = useQuotationFilters({
    initialFilters,
    debounceMs,
  });

  const [serviceTypeFilter, setServiceTypeFilter] = useState(
    initialFilters.serviceType || 'all'
  );

  // Extended filters including service type
  const extendedFilters = {
    ...basicFilters.filters,
    serviceTypeFilter,
  };

  // Notify parent of all filter changes (using ref to avoid infinite loops)
  useEffect(() => {
    const filters: QuotationFilters = {
      ...extendedFilters,
      serviceType: serviceTypeFilter === 'all' ? undefined : serviceTypeFilter as any,
    };
    onFiltersChangeRef.current?.(filters);
  }, [extendedFilters, serviceTypeFilter]);

  const clearAllFilters = useCallback(() => {
    basicFilters.actions.clearFilters();
    setServiceTypeFilter('all');
  }, [basicFilters.actions]);

  return {
    filters: extendedFilters,
    actions: {
      ...basicFilters.actions,
      setServiceTypeFilter,
      clearFilters: clearAllFilters,
    },
  };
};