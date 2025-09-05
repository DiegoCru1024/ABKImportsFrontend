/**
 * Hook for quotation list management
 * Handles data fetching, filtering, and pagination logic
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGetQuotationsListWithPagination } from '@/hooks/use-quation';
import { useQuotationFilters } from '../hooks';
import { 
  normalizeQuotationList, 
  filterAndSearchQuotations, 
  sortQuotationsByPriority 
} from '../utils';
import type { 
  QuotationData, 
  PageInfo
} from '../types';

export interface QuotationListContainerProps {
  onQuotationSelect: (quotationId: string) => void;
  onViewMode: (mode: 'list' | 'details' | 'responses') => void;
  initialPageSize?: number;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useQuotationListContainer = ({
  onQuotationSelect,
  onViewMode,
  initialPageSize = 10,
  enableFiltering = true,
  enableSorting = true,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: QuotationListContainerProps) => {
  // Pagination state
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    pageNumber: 1,
    pageSize: initialPageSize,
    totalElements: 0,
    totalPages: 0,
  });

  // Filtering state with stable callback
  const onFiltersChangeCallback = useCallback((newFilters: any) => {
    // Reset to first page when filters change
    setPageInfo(prev => ({ ...prev, pageNumber: 1 }));
  }, []);

  const { filters, actions: filterActions } = useQuotationFilters({
    onFiltersChange: onFiltersChangeCallback,
  });

  // API data fetching
  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetQuotationsListWithPagination(
    filters.debouncedSearchTerm,
    pageInfo.pageNumber,
    pageInfo.pageSize,
    filters.statusFilter === "all" ? "" : filters.statusFilter
  );

  // Processed quotation data
  const quotations = useMemo(() => {
    if (!apiData?.content) return [];
    
    let processedData = normalizeQuotationList(apiData.content);
    
    // Apply additional filtering if enabled
    if (enableFiltering) {
      processedData = filterAndSearchQuotations(processedData, {
        searchTerm: filters.searchTerm,
        status: filters.statusFilter,
      });
    }
    
    // Apply sorting if enabled
    if (enableSorting) {
      processedData = sortQuotationsByPriority(processedData);
    }
    
    return processedData;
  }, [apiData?.content, filters, enableFiltering, enableSorting]);

  // Update page info when API data changes
  useEffect(() => {
    if (apiData) {
      setPageInfo({
        pageNumber: typeof apiData.pageNumber === 'string' 
          ? parseInt(apiData.pageNumber) 
          : apiData.pageNumber,
        pageSize: typeof apiData.pageSize === 'string' 
          ? parseInt(apiData.pageSize) 
          : apiData.pageSize,
        totalElements: apiData.totalElements,
        totalPages: apiData.totalPages,
      });
    }
  }, [apiData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPageInfo(prev => ({
      ...prev,
      pageNumber: newPage,
    }));
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageInfo(prev => ({
      ...prev,
      pageSize: newSize,
      pageNumber: 1, // Reset to first page
    }));
  }, []);

  // Action handlers
  const handleViewDetails = useCallback((quotationId: string) => {
    onQuotationSelect(quotationId);
    onViewMode('details');
  }, [onQuotationSelect, onViewMode]);

  const handleViewResponses = useCallback((quotationId: string) => {
    onQuotationSelect(quotationId);
    onViewMode('responses');
  }, [onQuotationSelect, onViewMode]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Statistics
  const stats = useMemo(() => {
    const total = quotations.length;
    const byStatus = quotations.reduce((acc, quotation) => {
      const status = quotation.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byStatus };
  }, [quotations]);

  return {
    // Data
    quotations,
    pageInfo,
    stats,
    
    // Loading states
    isLoading,
    isError,
    error: error?.message || null,
    
    // Filter state and actions
    filters,
    filterActions,
    
    // Pagination actions
    handlePageChange,
    handlePageSizeChange,
    
    // Quotation actions
    handleViewDetails,
    handleViewResponses,
    
    // Utility actions
    handleRefresh,
    refetch,
  };
};