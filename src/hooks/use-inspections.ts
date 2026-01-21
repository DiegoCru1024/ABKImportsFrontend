import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteInspection, generateInspectionId, getInspectionById, getInspectionsByUser, updateInspection, updateInspectionProduct, getInspectionTrackingStatuses, updateInspectionTrackingStatus } from "@/api/inspection";

/**
 * Hook para generar un ID de inspección
 * @returns {useMutation} - Mutación para generar un ID de inspección
 */ 
export function useGenerateInspectionId() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ quotation_id, subquotation_id }: { quotation_id: string, subquotation_id: string }) =>
        generateInspectionId(quotation_id, subquotation_id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["Inspections"],
        });
        toast.success("ID de inspección generado exitosamente");
      },
      onError: (error: any) => {
        console.error("Error al generar el ID de inspección:", error);
        if (error instanceof Error) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error("Error desconocido al generar el ID de inspección");
        }
      },
    });
  }
  

  /**
   * Hook para obtener todas las inspecciones
   * @returns {useQuery} - Query para obtener todas las inspecciones
   */
    export function useGetInspectionsByUser(searchTerm:string,page:number,size:number) {
    return useQuery({
      queryKey: ["Inspections"],
      queryFn: () => getInspectionsByUser(searchTerm,page,size),
    });
  }
  
  /**
   * Hook para obtener una inspección por su ID
   * @param {string} id - El ID de la inspección
   * @returns {useQuery} - Query para obtener una inspección por su ID
   */
  export function useGetInspectionById(id: string) {
    return useQuery({
      queryKey: ["Inspections", id],
      queryFn: () => getInspectionById(id),
      enabled: !!id,
    });
  }
  
  /**
   * Hook para actualizar una inspección
   * @param {string} id - El ID de la inspección
   * @returns {useMutation} - Mutación para actualizar una inspección
   */
  export function useUpdateInspection(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (body: any) => updateInspection(id, body),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["Inspections", id],
        });
        toast.success("Inspección actualizada exitosamente");
      },
      onError: (error: any) => {
        console.error("Error al actualizar la inspección:", error);
        if (error instanceof Error) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error("Error desconocido al actualizar la inspección");
        }
      },
    });
  }
  
  /**
   * Hook para eliminar una inspección
   * @param {string} id - El ID de la inspección
   * @returns {useMutation} - Mutación para eliminar una inspección
   */
  export function useDeleteInspection(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => deleteInspection(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["Inspections", id],
        });
        toast.success("Inspección eliminada exitosamente");
      },
      onError: (error: any) => {
        console.error("Error al eliminar la inspección:", error);
        if (error instanceof Error) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error("Error desconocido al eliminar la inspección");
        }
      },
    });
  }

/**
 * Hook para actualizar un producto específico de una inspección
 * @param {string} inspectionId - El ID de la inspección
 * @param {string} productId - El ID del producto
 * @returns {useMutation} - Mutación para actualizar un producto de inspección
 */
export function useUpdateInspectionProduct(inspectionId: string, productId: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: { status: string; files: string[] }) =>
        updateInspectionProduct(inspectionId, productId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["Inspections", inspectionId],
        });
        toast.success("Producto actualizado exitosamente");
      },
      onError: (error: unknown) => {
        console.error("Error al actualizar el producto:", error);
        if (error instanceof Error) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error("Error desconocido al actualizar el producto");
        }
      },
    });
  }

/**
 * Hook para obtener todos los estados de tracking de inspección
 * @returns {useQuery} - Query con la lista de estados ordenados (1-13)
 */
export function useGetInspectionTrackingStatuses() {
  return useQuery({
    queryKey: ["InspectionTrackingStatuses"],
    queryFn: () => getInspectionTrackingStatuses(),
    staleTime: 1000 * 60 * 60, // 1 hora - los estados no cambian frecuentemente
  });
}

/**
 * Hook para actualizar el estado de tracking de una inspección
 * @param {string} inspectionId - ID de la inspección
 * @returns {useMutation} - Mutación para actualizar el estado
 */
export function useUpdateInspectionTrackingStatus(inspectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateInspectionTrackingStatus(inspectionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Inspections", inspectionId] });
      queryClient.invalidateQueries({ queryKey: ["InspectionTrackingRoute", inspectionId] });
      toast.success("Estado de tracking actualizado exitosamente");
    },
    onError: (error: Error) => {
      console.error("Error al actualizar el estado de tracking:", error);
      toast.error(error.message || "Error al actualizar el estado de tracking");
    },
  });
}