import type { Quotation } from "@/pages/cotizacion-page/utils/interface";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuotation,
  deleteQuotation,
  getQuotationById,
  getQuotationsByUser,
  patchQuotation,
  submitDraft,
  updateQuotation,
} from "@/api/quotations";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

/**
 * Hook para crear una cotización
 * @returns {useMutation} - Mutación para crear una cotización
 */
export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Quotation }) => createQuotation(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["useGetQuotationsByUser"],
      });
      if (data.saveAsDraft) {
        toast.success("Borrador creado exitosamente", {
          description:
            "Puede ver su borrador en la sección de mis cotizaciones",
          className: "bg-green-50 border-green-500",
          duration: 3000, // 3 segundos
          descriptionClassName: "text-green-600",
          icon: <Check className="text-green-500" />,
          style: { border: "1px solid #22c55e" },
        });
      } else {
        toast.success("Éxito", {
          description:
            "Cotización creada exitosamente, puede ver su cotización en la sección de mis cotizaciones",
          className: "bg-green-50 border-green-500",
          duration: 3000, // 3 segundos
          descriptionClassName: "text-green-600",
          icon: <Check className="text-green-500" />,
          style: { border: "1px solid #22c55e" },
        });
      }
    },
    onError: (error: any) => {
      console.error("Error al crear la cotización:", error);
      if (error instanceof Error) {
        toast.error("Error", {
          description: `Error: ${error.message}`,
          className: "bg-red-50 border-red-500",
          duration: 3000, // 3 segundos
          descriptionClassName: "text-red-600",
          icon: <X className="text-red-500" />,
          style: { border: "1px solid #ef4444" },
        });
      } else {
        toast.error("Error desconocido al crear la cotización", {
          className: "bg-red-50 border-red-500",
          duration: 3000, // 3 segundos
          descriptionClassName: "text-red-600",
          icon: <X className="text-red-500" />,
          style: { border: "1px solid #ef4444" },
        });
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
    queryKey: ["QuotationById", id], // Clave única que cambia con los parámetros
    queryFn: () => (id ? getQuotationById(id) : Promise.resolve(null)),
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
  size: number
) {
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
    mutationFn: ({ data }: { data: Quotation }) => updateQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["useGetQuotationsByUser"],
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
export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      id ? deleteQuotation(id) : Promise.resolve(null),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["useGetQuotationsByUser"],
      });
      toast.success("Cotización eliminada exitosamente", {
        className: "bg-green-50 border-green-500",
        duration: 3000, // 3 segundos
        descriptionClassName: "text-green-600",
        icon: <Check className="text-green-500" />,
        style: { border: "1px solid #22c55e" },
      });
    },
    onError: (error) => {
      console.error("Error al eliminar la cotización:", error);
      toast.error("Error al eliminar la cotización");
    },
  });
}

/**
 * Hook para actualizar una cotización
 * @param {string} id - El ID de la cotización
 * @returns {useMutation} - Mutación para actualizar una cotización
 */
export function usePatchQuotation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Quotation }) => patchQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["useGetQuotationsByUser"],
      });
      toast.success("Cotización actualizada exitosamente", {
        className: "bg-green-50 border-green-500",
        duration: 3000, // 3 segundos
        descriptionClassName: "text-green-600",
        icon: <Check className="text-green-500" />,
        style: { border: "1px solid #22c55e" },
      });
    },
    onError: (error) => {
      console.error("Error al actualizar la cotización:", error);
      toast.error("Error al actualizar la cotización", {
        className: "bg-red-50 border-red-500",
        duration: 3000, // 3 segundos
        descriptionClassName: "text-red-600",
        icon: <X className="text-red-500" />,
        style: { border: "1px solid #ef4444" },
      });
    },
  });
}

/**
 * Hook para enviar un borrador de cotización
 * @param {string} id - El ID de la cotización
 * @returns {useMutation} - Mutación para enviar un borrador de cotización
 */
export function useSubmitDraft(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Quotation }) => submitDraft(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["useGetQuotationsByUser"],
      });
      toast.success("Borrador enviado exitosamente", {
        className: "bg-green-50 border-green-500",
        duration: 3000, // 3 segundos
        descriptionClassName: "text-green-600",
        icon: <Check className="text-green-500" />,
        style: { border: "1px solid #22c55e" },
      });
    },
    onError: (error) => {
      console.error("Error al enviar el borrador:", error);
      toast.error("Error al enviar el borrador", {
        className: "bg-red-50 border-red-500",
        duration: 3000, // 3 segundos
        descriptionClassName: "text-red-600",
        icon: <X className="text-red-500" />,
        style: { border: "1px solid #ef4444" },
      });
    },
  });
}
