import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus,
  getShipmentInfo,
  getShipmentTrackingRoute,
  getInspectionTrackingRoute,
  getShipmentTrackingStatuses,
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
    mutationFn: (variables: { id: string; data: UpdateShipmentStatusRequest }) =>
      updateShipmentStatus(variables.id, variables.data),
    onSuccess: (_: any, variables: { id: string; data: UpdateShipmentStatusRequest }) => {
      // Invalidar queries relacionadas con el envío específico
      queryClient.invalidateQueries({ queryKey: ["Shipments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["Shipments"] });
      // Invalidar también la ruta de tracking
      queryClient.invalidateQueries({ queryKey: ["ShipmentTrackingRoute", variables.id] });
    },
  });
}

/**
 * Hook para obtener la ruta de tracking dinámica de un shipment
 * @param {string} shipmentId - ID del envío
 * @returns {useQuery} - Query con la ruta de tracking segmentada
 */
export function useGetShipmentTrackingRoute(shipmentId: string) {
  return useQuery({
    queryKey: ["ShipmentTrackingRoute", shipmentId],
    queryFn: () => getShipmentTrackingRoute(shipmentId),
    enabled: !!shipmentId,
    staleTime: 30000,
  });
}

/**
 * Hook para obtener la ruta de tracking dinámica de una inspección (puntos 1-13)
 * @param {string} inspectionId - ID de la inspección
 * @returns {useQuery} - Query con la ruta de tracking segmentada
 */
export function useGetInspectionTrackingRoute(inspectionId: string) {
  return useQuery({
    queryKey: ["InspectionTrackingRoute", inspectionId],
    queryFn: () => getInspectionTrackingRoute(inspectionId),
    enabled: !!inspectionId,
    staleTime: 30000,
  });
}

/**
 * Hook para obtener los estados de tracking de shipments (puntos 14-45)
 */
export function useGetShipmentTrackingStatuses() {
  return useQuery({
    queryKey: ["ShipmentTrackingStatuses"],
    queryFn: () => getShipmentTrackingStatuses(),
    staleTime: 1000 * 60 * 60,
  });
} 