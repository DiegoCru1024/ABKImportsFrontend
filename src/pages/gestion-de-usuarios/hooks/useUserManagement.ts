import { useState, useEffect } from "react";
import { useGetAllUserProfileWithPagination } from "@/hooks/use-user-hook";
import type { UserProfile } from "@/api/interface/user";

interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Hook para obtener los usuarios con paginación
  const {
    data: userData,
    isLoading,
    error,
  } = useGetAllUserProfileWithPagination(searchTerm, currentPage, pageSize);

  // Actualizar datos cuando cambia la respuesta
  useEffect(() => {
    if (userData) {
      setUsers(userData.content || []);
      setPageInfo({
        pageNumber:
          typeof userData.pageNumber === "string"
            ? parseInt(userData.pageNumber)
            : userData.pageNumber || 1,
        pageSize:
          typeof userData.pageSize === "string"
            ? parseInt(userData.pageSize)
            : userData.pageSize || 10,
        totalElements: userData.totalElements || 0,
        totalPages: userData.totalPages || 0,
      });
    }
  }, [userData]);

  // Manejo de cambio de página
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Manejo de búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Resetear a la primera página
  };

  return {
    users,
    pageInfo,
    searchTerm,
    currentPage,
    pageSize,
    isLoading,
    error,
    handlePageChange,
    handleSearch,
  };
};
