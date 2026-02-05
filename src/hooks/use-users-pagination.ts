import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUserProfileWithPagination } from "@/api/apiUser";

export const useUsersPagination = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users-pagination", searchTerm, page, size],
    queryFn: () => getAllUserProfileWithPagination(searchTerm, page, size),
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset a la primera página cuando se busca
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  return {
    users: data?.content || [],
    pageInfo: {
      pageNumber: data?.pageNumber || 1,
      pageSize: data?.pageSize || size,
      totalElements: data?.totalElements || 0,
      totalPages: data?.totalPages || 0,
    },
    searchTerm,
    isLoading,
    isError,
    handleSearchChange,
    handlePageChange,
    clearSearch,
    refetch,
  };
};
