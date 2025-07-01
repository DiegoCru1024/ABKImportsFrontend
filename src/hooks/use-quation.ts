import type { Quotation } from "@/pages/Cotizacion/utils/interface";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuotation, deleteQuotation, getQuotationById, getQuotationsByUser, updateQuotation } from "@/api/quotations";
import { toast } from "sonner";


/**
 * Hook para crear una cotización
 * @returns {useMutation} - Mutación para crear una cotización
 */ 
export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Quotation }) =>
      createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Quotations"],
      });
      toast.success("Cotización creada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al crear la cotización:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al crear la cotización");
      }
    },
  });
}

/**
 * Hook para obtener una cotización por su ID
 * @param {string} id - El ID de la cotización
 * @returns {useQuery} - Consulta para obtener una cotización por su ID
 */ 
export function useGetQuotationById(id: string) {
  const { isLoading, isError, data, refetch, isSuccess } = useQuery({
    queryKey: [
      "Quotation",
      id,
    ], // Clave única que cambia con los parámetros
    queryFn: () =>
      id
        ? getQuotationById(id)
        : Promise.resolve(null),
    enabled: Boolean(id), // Solo ejecuta si hay un ID válido
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
    isSuccess,
  };
}

/**
 * Hook para obtener todas las cotizaciones realizadas por el usuario
 * @returns {useQuery} - Consulta para obtener todas las cotizaciones
 */ 
export function useGetQuotationsListWithPagination(  
  searchTerm: string,
  page: number,
  size: number) {

return useQuery({
  queryKey: ["useGetQuotationsByUser", searchTerm, page, size],
  queryFn: () => getQuotationsByUser(searchTerm, page, size),
});
}

/**
 * Hook para actualizar una cotización
 * @param {string} id - El ID de la cotización
 * @returns {useMutation} - Mutación para actualizar una cotización
 */ 
export function useUpdateQuotation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Quotation }) =>
      updateQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Quotation", id],
      });
      toast.success("Cotización actualizada exitosamente");
    },
    onError: (error) => {
      console.error("Error al actualizar la cotización:", error);
      toast.error("Error al actualizar la cotización");
    },
  });
}

/**
 * Hook para eliminar una cotización
 * @param {string} id - El ID de la cotización
 * @returns {useMutation} - Mutación para eliminar una cotización
 */ 
export function useDeleteQuotation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Quotations"],
      });
      toast.success("Cotización eliminada exitosamente");
    },
    onError: (error) => {
      console.error("Error al eliminar la cotización:", error);
      toast.error("Error al eliminar la cotización");
    },
  });
}