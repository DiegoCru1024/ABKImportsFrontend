import {
  createQuatitationResponse,
  createQuatitationResponseMultiple,
  deleteQuatitationResponse,
  getAllResponsesForSpecificProductoInQuotation,
  getAllResponsesForSpecificQuotation,
  patchQuatitationResponse,
} from "@/api/apiQuotationResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { QuotationResponseRequest } from "@/pages/GestionDeCotizacion/components/utils/interface";

/**
 * Interfaz para la respuesta de una cotización
 * @interface QuotationResponse
 * @property {string} quotation_id - El ID de la cotización
 * @property {string} product_id - El ID del producto
 * @property {string} status - El estado de la respuesta
 * @property {number} unit_price - El precio unitario
 * @property {string} incoterms - Los incoterms
 * @property {number} total_price - El precio total
 * @property {number} express_price - El precio express
 * @property {string} logistics_service - El servicio de logística
 * @property {number} service_fee - El servicio de logística
 * @property {number} taxes - Los impuestos
 * @property {string} recommendations - Las recomendaciones
 * @property {string} additional_comments - Los comentarios adicionales
 * @property {string[]} files - Los archivos
 */
export interface QuotationResponse {
  quotation_id: string;
  product_id: string;
  status: string;
  unit_price: number;
  incoterms: string;
  total_price: number;
  express_price: number;
  logistics_service: string;
  service_fee: number;
  taxes: number;
  recommendations: string;
  additional_comments: string;
  files: string[];
}

/**
 * Hook para crear una respuesta de una cotización
 * @returns {useMutation} - La respuesta de la cotización creada
 */
export function useCreateQuatitationResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: QuotationResponse }) =>
      createQuatitationResponse(data),
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
 * Hook para crear varias respuestas de una cotización
 * @returns {useMutation} - La respuesta de la cotización creada
 */
export function useCreateQuatitationResponseMultiple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      quotationId,
      productId,
    }: {
      data: QuotationResponseRequest;
      quotationId: string;
      productId: string;
    }) => createQuatitationResponseMultiple(data, quotationId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allQuatitationResponse"],
      });
      toast.success("Respuestas de cotización creadas exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al crear las respuestas de la cotización:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error(
          "Error desconocido al crear las respuestas de la cotización"
        );
      }
    },
  });
}

/**
 * Hook para obtener todas las respuestas de una cotización
 * @param {string} quotationId - El ID de la cotización
 * @returns {useQuery} - Las respuestas de la cotización
 */
export function useGetAllQuatitationResponse(quotationId: string) {
  return useQuery({
    queryKey: ["allQuatitationResponse", quotationId],
    queryFn: () => getAllResponsesForSpecificQuotation(quotationId),
  });
}

/**
 * Hook para obtener todas las respuestas de un producto en una cotización
 * @param {string} quotationId - El ID de la cotización
 * @param {string} productId - El ID del producto
 * @returns {useQuery} - Las respuestas de la cotización
 */
export function useGetAllQuatitationResponseForSpecificProduct(
  quotationId: string,
  productId: string
) {
  return useQuery({
    queryKey: [
      "allQuatitationResponseForSpecificProduct",
      quotationId,
      productId,
    ],
    queryFn: () =>
      getAllResponsesForSpecificProductoInQuotation(quotationId, productId),
  });
}

/**
 * Hook para eliminar una respuesta de una cotización
 * @param {string} id - El ID de la respuesta
 * @returns {useMutation} - La respuesta de la cotización eliminada
 */
export function useDeleteQuatitationResponse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteQuatitationResponse(id),
    onSuccess: () => {
      toast.success("Respuesta de cotización eliminada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar la respuesta de la cotización:", error);
      throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["allQuatitationResponse"],
      });
    },
  });
}

/**
 * Hook para actualizar una respuesta de una cotización
 * @param {string} id - El ID de la respuesta
 * @returns {useMutation} - La respuesta de la cotización actualizada
 */
export function usePatchQuatitationResponse(id: string) {
  return useMutation({
    mutationFn: ({ data }: { data: QuotationResponse }) =>
      patchQuatitationResponse(id, data),
    onSuccess: () => {
      toast.success("Respuesta de cotización actualizada exitosamente");
    },
    onError: (error: any) => {
      console.error(
        "Error al actualizar la respuesta de la cotización:",
        error
      );
      throw error;
    },
  });
}
