import { apiFetch } from "./apiFetch";
import type {
  Shipment,
  CreateShipmentRequest,
  UpdateShipmentStatusRequest,
  ShipmentInfo,
  ShipmentsResponse,
  TrackingRouteResponse,
  InspectionTrackingRouteResponse
} from "./interface/shipmentInterface";

/**
 * Crea un nuevo envío a partir de una inspección
 * @param {CreateShipmentRequest} data - Datos del envío a crear
 * @returns {Promise<Shipment>} - El envío creado
 */
export const createShipment = async (data: CreateShipmentRequest): Promise<Shipment> => {
  try {
    return await apiFetch<Shipment>("/shipments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error al crear el envío:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de envíos con paginación y búsqueda
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} page - Número de página
 * @param {number} size - Tamaño de página
 * @returns {Promise<ShipmentsResponse>} - Lista de envíos
 */
export const getShipments = async (
  searchTerm: string = "",
  page: number = 1,
  size: number = 10
): Promise<ShipmentsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (searchTerm) {
      params.append("searchTerm", searchTerm);
    }

    return await apiFetch<ShipmentsResponse>(`/shipments?${params.toString()}`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener los envíos:", error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un envío específico
 * @param {string} id - ID del envío
 * @returns {Promise<Shipment>} - Detalles del envío
 */
export const getShipmentById = async (id: string): Promise<Shipment> => {
  try {
    return await apiFetch<Shipment>(`/shipments/${id}`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener el envío:", error);
    throw error;
  }
};

/**
 * Actualiza el estado y ubicación de un envío (solo administradores)
 * @param {string} id - ID del envío
 * @param {UpdateShipmentStatusRequest} data - Nuevos datos del estado
 * @returns {Promise<Shipment>} - Envío actualizado
 */
export const updateShipmentStatus = async (
  id: string,
  data: UpdateShipmentStatusRequest
): Promise<Shipment> => {
  try {
    return await apiFetch<Shipment>(`/shipments/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error al actualizar el estado del envío:", error);
    throw error;
  }
};

/**
 * Obtiene información sobre ubicaciones y estados disponibles para cada tipo de envío
 * @returns {Promise<ShipmentInfo>} - Información de configuración
 */
export const getShipmentInfo = async (): Promise<ShipmentInfo> => {
  try {
    return await apiFetch<ShipmentInfo>("/shipments/info", {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener la información de envíos:", error);
    throw error;
  }
};

/**
 * Interfaz para el estado de tracking
 */
export interface TrackingStatus {
  order: number;
  place: string;
  status: string;
  coords: string;
  shipmentStatus: string;
  currentLocation: string;
}

/**
 * Obtiene los estados de tracking para Shenzhen
 * @returns {Promise<TrackingStatus[]>} - Lista de estados de tracking
 * @deprecated Usar getShipmentTrackingRoute en su lugar para tracking dinámico
 */
export const getTrackingStatuses = async (): Promise<TrackingStatus[]> => {
  try {
    return await apiFetch<TrackingStatus[]>("/shipments/tracking/statuses/shenzhen", {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener los estados de tracking:", error);
    throw error;
  }
};

/**
 * Obtiene la ruta de tracking dinámica para un shipment específico
 * @param {string} shipmentId - ID del envío
 * @returns {Promise<TrackingRouteResponse>} - Ruta con puntos segmentados por estado
 */
export const getShipmentTrackingRoute = async (
  shipmentId: string
): Promise<TrackingRouteResponse> => {
  try {
    return await apiFetch<TrackingRouteResponse>(
      `/shipments/${shipmentId}/tracking/route`,
      { method: "GET" }
    );
  } catch (error) {
    console.error("Error al obtener la ruta de tracking:", error);
    throw error;
  }
};

/**
 * Obtiene la ruta de tracking dinámica para una inspección (puntos 1-13)
 * @param {string} inspectionId - ID de la inspección
 * @returns {Promise<InspectionTrackingRouteResponse>} - Ruta con puntos segmentados por estado
 */
export const getInspectionTrackingRoute = async (
  inspectionId: string
): Promise<InspectionTrackingRouteResponse> => {
  try {
    return await apiFetch<InspectionTrackingRouteResponse>(
      `/inspections/${inspectionId}/tracking/route`,
      { method: "GET" }
    );
  } catch (error) {
    console.error("Error al obtener la ruta de tracking de inspección:", error);
    throw error;
  }
}; 