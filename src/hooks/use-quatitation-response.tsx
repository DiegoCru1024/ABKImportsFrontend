import {
  createQuatitationResponse,
  deleteQuatitationResponse,
  patchQuatitationResponse,
  getResponsesForUsers,
  listQuatitationResponses,
  getListResponsesByQuotationId,
  getDetailsResponse,
  } from "@/api/quotation-responses";
import type { 
  QuotationCreateUpdateResponseDTO
} from "@/api/interface/quotationResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


/**
 * Hook para crear una respuesta de una cotización con valores por defecto
 * @returns {useMutation} - La respuesta de la cotización creada
 */
export function useCreateQuatitationResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      quotationId,
    }: {
      data: QuotationCreateUpdateResponseDTO;
      quotationId: string;
    }) => {
      return createQuatitationResponse(data, quotationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allQuatitationResponse"],
      });
      toast.success("Respuesta de cotización creada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al crear la respuesta de la cotización:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al crear la respuesta de la cotización");
      }
    },
  });
}

/**
 * Hook para eliminar una respuesta de una cotización
 * @param {string} quotationResponseId - El ID de la respuesta
 * @returns {useMutation} - La respuesta de la cotización eliminada
 */
export function useDeleteQuatitationResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quotationResponseId: string) => deleteQuatitationResponse(quotationResponseId),
    onSuccess: () => {
      toast.success("Respuesta de cotización eliminada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar la respuesta de la cotización:", error);
      throw error;
    },
    onSettled: () => {
      // Invalida tanto el listado general como el listado por quotationId
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [key] = query.queryKey as unknown as [string];
          return (
            key === "allQuatitationResponse" ||
            key === "getListResponsesByQuotationId"
          );
        },
      });
    },
  });
}

/**
 * Hook para actualizar una respuesta de una cotización
 * @param {string} quotationId - El ID de la cotización
 * @param {string} quotationResponseId - El ID de la respuesta
 * @returns {useMutation} - La respuesta de la cotización actualizada
 */
export function usePatchQuatitationResponse(quotationId: string, quotationResponseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: QuotationCreateUpdateResponseDTO;
    }) => patchQuatitationResponse(quotationId, quotationResponseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allQuatitationResponse"],
      });
      toast.success("Respuesta de cotización actualizada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar la respuesta de la cotización:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al actualizar la respuesta de la cotización");
      }
    },
  });
}

/**
 * Hook para listar las respuestas de una cotización
 * @param {string} quotationId - El ID de la cotización
 * @param {number} page - La página actual
 * @param {number} size - El tamaño de la página
 * @returns {useQuery} - Las respuestas de la cotización
 */
export function useListQuatitationResponse(quotationId: string, page: number, size: number) {
  return useQuery({
    queryKey: ["allQuatitationResponse", quotationId, page, size],
    queryFn: () => listQuatitationResponses(quotationId, page, size),
  });
}

/**
 * Hook para obtener las respuestas de una cotización
 * @param {string} quotationId - El ID de la cotización
 * @returns {useQuery} - Las respuestas de la cotización
 */
export function useGetQuatitationResponse(quotationId: string) {
  return useQuery({
    queryKey: ["allQuatitationResponse", quotationId],
    queryFn: () => getResponsesForUsers(quotationId),
  });
}


/**
 * Hook para obtener las respuestas de una cotización por su ID (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @param {number} page - La página actual
 * @param {number} size - El tamaño de la página
 * @returns {useQuery} - Las respuestas de la cotización
 */
export function useGetListResponsesByQuotationId(quotationId: string, page: number, size: number) {
  return useQuery({
    queryKey: ["getListResponsesByQuotationId", quotationId, page, size],
    queryFn: () => getListResponsesByQuotationId(quotationId, page, size),
    enabled: Boolean(quotationId),
  });
}


/**
 * Hook para obtener los detalles de una respuesta de una cotización por su ID (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @param {string} quotationResponseId - El ID de la respuesta
 * @returns {useQuery} - Los detalles de la respuesta
 */
export function useGetDetailsResponse(quotationId: string, quotationResponseId: string) {
  return useQuery({
    queryKey: ["getDetailsResponse", quotationId, quotationResponseId],
    queryFn: () => getDetailsResponse(quotationId, quotationResponseId),
  });
}
