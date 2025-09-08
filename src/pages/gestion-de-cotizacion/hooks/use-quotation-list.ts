import { useState, useEffect } from "react";
import { useGetQuotationsListWithPagination } from "@/hooks/use-quation";
import type { QuotationsByUserResponseInterfaceContent } from "@/api/interface/quotationInterface";

export interface UseQuotationListProps {
  initialPageSize?: number;
}

export function useQuotationList({ initialPageSize = 10 }: UseQuotationListProps = {}) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: initialPageSize,
    totalElements: 0,
    totalPages: 0,
  });

  const {
    data: dataQuotations,
    isLoading,
    isError,
  } = useGetQuotationsListWithPagination(
    debouncedSearchTerm,
    pageInfo.pageNumber,
    pageInfo.pageSize,
    filter === "all" ? "" : filter
  );

  const [data, setData] = useState<QuotationsByUserResponseInterfaceContent[]>([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update data when API response changes
  useEffect(() => {
    if (dataQuotations) {
      setData(dataQuotations.content);
      setPageInfo({
        pageNumber:
          typeof dataQuotations.pageNumber === "string"
            ? parseInt(dataQuotations.pageNumber)
            : dataQuotations.pageNumber,
        pageSize:
          typeof dataQuotations.pageSize === "string"
            ? parseInt(dataQuotations.pageSize)
            : dataQuotations.pageSize,
        totalElements: dataQuotations.totalElements,
        totalPages: dataQuotations.totalPages,
      });
    }
  }, [dataQuotations]);

  const handlePageChange = (newPage: number) => {
    setPageInfo((prev) => ({
      ...prev,
      pageNumber: newPage,
    }));
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPageInfo((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPageInfo((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const clearFilter = () => {
    setFilter("all");
    setPageInfo((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const toggleProductsAccordion = (quotationId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [quotationId]: !prev[quotationId],
    }));
  };

  return {
    // Data
    data,
    pageInfo,
    isLoading,
    isError,
    
    // Search and filter
    searchTerm,
    filter,
    handleSearchChange,
    handleFilterChange,
    clearFilter,
    
    // Pagination
    handlePageChange,
    
    // UI state
    expandedProducts,
    toggleProductsAccordion,
  };
}