import { API_URL } from "../../config";
import { apiFetch } from "./apiFetch";
import type { InspectionResponse, InspectionDetail, InspectionTrackingStatusesResponse, InspectionOrderSummary, InspectionShipmentsResponse } from "./interface/inspectionInterface";

/**
 * Obtiene todas las inspecciones que ha realizado el usuario
 * @returns {Promise<>} - Las inspecciones
 */
export const getInspectionsByUser = async (searchTerm: string, page: number, size: number) => {

    const url = new URL(
        "/inspections",
        API_URL
    )
    if (searchTerm) {
        url.searchParams.append("searchTerm", searchTerm.toString());
    }

    url.searchParams.append("page", page.toString());
    url.searchParams.append("size", size.toString());

    try {
        return await apiFetch<InspectionResponse>(url.pathname + url.search, {
            method: "GET",
        });
    } catch (error) {
        console.error("Error al obtener las inspecciones:", error);
        throw error;
    }
};







/**
 * Genera un ID de inspección para una cotización
 * @param {string} quotation_id - El ID de la cotización
 * @param {string} shipping_service_type - El tipo de servicio de envío
 * @returns {Promise<any>} - El ID de la inspección
 */
export const generateInspectionId = async (quotation_id: string, subquotation_id: string) => {
    console.log("Esto se está enviando", JSON.stringify({
        quotation_id,
        subquotation_id
    }))
    try {
        return await apiFetch(`/inspections`, {
            method: "POST",
            body: JSON.stringify({
                quotation_id,
                subquotation_id
            })
        });
    } catch (error) {
        console.error("Error al generar el ID de inspección:", error);
        throw error;
    }
}

/**
 * Obtiene una inspección por su ID
 * @param {string} id - El ID de la inspección
 * @returns {Promise<InspectionDetail>} - La inspección detallada
 */
export const getInspectionById = async (id: string): Promise<InspectionDetail> => {
    try {
        return await apiFetch<InspectionDetail>(`/inspections/${id}`, {
            method: "GET",
        });
    } catch (error) {
        console.error("Error al obtener la inspección:", error);
        throw error;
    }
}


/**
 * Actualiza una inspección por su ID
 * @param {string} id - El ID de la inspección
 * @param {any} body - El cuerpo de la inspección
 * @returns {Promise<any>} - La inspección actualizada
 */
export const updateInspection = async (id: string, body: any) => {
    try {
        return await apiFetch(`/inspections/${id}`, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error("Error al actualizar la inspección:", error);
        throw error;
    }
}


/**
 * Elimina una inspección por su ID
 * @param {string} id - El ID de la inspección
 * @returns {Promise<any>} - La inspección eliminada
 */
export const deleteInspection = async (id: string) => {
    try {
        return await apiFetch(`/inspections/${id}`, {
            method: "DELETE",
        });
    } catch (error) {
        console.error("Error al eliminar la inspección:", error);
        throw error;
    }
}

/**
 * Actualiza un producto específico de una inspección
 * @param {string} inspectionId - El ID de la inspección
 * @param {string} productId - El ID del producto
 * @param {object} data - Los datos a actualizar (status y files)
 * @returns {Promise<any>} - El producto actualizado
 */
export const updateInspectionProduct = async (
    inspectionId: string,
    productId: string,
    data: { status: string; files: string[] }
) => {
    try {
        return await apiFetch(`/inspections/${inspectionId}/products/${productId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error("Error al actualizar el producto de la inspección:", error);
        throw error;
    }
}

/**
 * Obtiene todos los estados disponibles para el tracking de inspección
 * @returns {Promise<InspectionTrackingStatusesResponse>} - Lista de estados ordenados (1-13)
 */
export const getInspectionTrackingStatuses = async (): Promise<InspectionTrackingStatusesResponse> => {
    try {
        return await apiFetch<InspectionTrackingStatusesResponse>("/inspections/tracking/statuses", {
            method: "GET",
        });
    } catch (error) {
        console.error("Error al obtener los estados de tracking:", error);
        throw error;
    }
}

/** Datos para actualizar el estado de tracking */
export interface UpdateTrackingStatusData {
    status: string;
    tracking_point: number;
}

/**
 * Actualiza el estado de tracking de una inspección
 * @param {string} inspectionId - ID de la inspección
 * @param {UpdateTrackingStatusData} data - Nuevo estado y punto de tracking
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export const updateInspectionTrackingStatus = async (
    inspectionId: string,
    data: UpdateTrackingStatusData
): Promise<{ success: boolean; message?: string }> => {
    try {
        return await apiFetch(`/inspections/${inspectionId}/tracking/status`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error("Error al actualizar el estado de tracking:", error);
        throw error;
    }
}

/**
 * Obtiene el resumen financiero y canal aduanero de una inspeccion
 */
export const getInspectionOrderSummary = async (id: string): Promise<InspectionOrderSummary> => {
  try {
    return await apiFetch<InspectionOrderSummary>(`/inspections/${id}/order-summary`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener el resumen del pedido:", error);
    throw error;
  }
};

/**
 * Obtiene los shipments vinculados a una inspeccion
 */
export const getInspectionShipments = async (id: string): Promise<InspectionShipmentsResponse> => {
  try {
    return await apiFetch<InspectionShipmentsResponse>(`/inspections/${id}/shipments`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener los shipments de la inspeccion:", error);
    throw error;
  }
};
