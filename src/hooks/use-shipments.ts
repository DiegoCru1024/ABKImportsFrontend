import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus,
  getShipmentInfo,
} from "@/api/shipments";
import type {
  CreateShipmentRequest,
  UpdateShipmentStatusRequest,
} from "@/api/interface/shipmentInterface";

/**
 * Hook para obtener la lista de envíos
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} page - Número de página
 * @param {number} size - Tamaño de página
 * @returns {useQuery} - Query para obtener envíos
 */
export function useGetShipments(
  searchTerm: string = "",
  page: number = 1,
  size: number = 10
) {
  return useQuery({
    queryKey: ["Shipments", searchTerm, page, size],
    queryFn: () => getShipments(searchTerm, page, size),
  });
}

/**
 * Hook para obtener un envío por su ID
 * @param {string} id - El ID del envío
 * @returns {useQuery} - Query para obtener un envío por su ID
 */
export function useGetShipmentById(id: string) {
  return useQuery({
    queryKey: ["Shipments", id],
    queryFn: () => getShipmentById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener información de configuración de envíos
 * @returns {useQuery} - Query para obtener información de envíos
 */
export function useGetShipmentInfo() {
  return useQuery({
    queryKey: ["ShipmentInfo"],
    queryFn: () => getShipmentInfo(),
  });
}

/**
 * Hook para crear un nuevo envío
 * @returns {useMutation} - Mutation para crear envío
 */
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShipmentRequest) => createShipment(data),
    onSuccess: () => {
      // Invalidar queries relacionadas con envíos
      queryClient.invalidateQueries({ queryKey: ["Shipments"] });
    },
  });
}

/**
 * Hook para actualizar el estado de un envío
 * @returns {useMutation} - Mutation para actualizar estado
 */
export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShipmentStatusRequest }) =>
      updateShipmentStatus(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas con el envío específico
      queryClient.invalidateQueries({ queryKey: ["Shipments", id] });
      queryClient.invalidateQueries({ queryKey: ["Shipments"] });
    },
  });
} 