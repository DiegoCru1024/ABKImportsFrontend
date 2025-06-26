import { apiFetch } from "./apiFetch";
import type { QuotationResponseRequest } from "./interface/quotationResponseInterfaces";

/**
 * Obtiene todas las respuestas de una cotización por su ID
 * @param {string} id - El ID de la cotización
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const getAllResponsesForSpecificQuotation = async (id: string) => {
  try {
    const response = await apiFetch(`/quotation-responses/quotation/${id}`);
    return response;
  } catch (error) {
    console.error("Error al obtener la respuesta de la cotización:", error);
    throw error;
  }
};

export interface getAllResponsesForSpecificProductoInQuotationResponse {
    product: ProductBasicInfo;
  responses: Responses[];
}

export interface ProductBasicInfo {
  id: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  url: string;
  comment: string;
  weight: string;
  volume: string;
  number_of_boxes: number;
  attachments: string[];
  statusResponseProduct: string;
  sendResponse: boolean;
}

export interface Responses {
  logistics_service: string;
  unit_price: number;
  incoterms: string;
  total_price: number;
  express_price: number;
  service_fee: number;
  taxes: number;
  recommendations: string;
  additional_comments: string;
  files: string[];
}
/**
 * Obtiene todas las respuestas de un producto en una cotización por su ID
 * @param {string} id - El ID de la cotización
 * @param {string} productId - El ID del producto
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const getAllResponsesForSpecificProductoInQuotation = async (
  id: string,
  productId: string
) => {
  try {
    const response =
      await apiFetch<getAllResponsesForSpecificProductoInQuotationResponse>(
        `/quotation-responses/quotation/${id}/product/${productId}`
      );
    return response;
  } catch (error) {
    console.error("Error al obtener la respuesta de la cotización:", error);
    throw error;
  }
};

/**
 * Crea una respuesta de una cotización (admin)
 * @param {any} data - Los datos a crear
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const createQuatitationResponse = async (data: any) => {
  try {
    const response = await apiFetch(`/quotation-responses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error("Error al crear la respuesta de la cotización:", error);
    throw error;
  }
};

/**
 * Crea una varias de una cotización (admin)
 * @param {QuotationResponseRequest} data - Los datos a crear
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const createQuatitationResponseMultiple = async (
  data: QuotationResponseRequest,
  quotationId: string,
  productId: string
) => {
  try {
    return await apiFetch(
      `/quotation-responses/multiple/quotation/${quotationId}/product/${productId}`,
      {
        //TODO: Cambiar a la ruta correcta
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  } catch (error) {
    console.error("Error al crear la respuesta de la cotización:", error);
    throw error;
  }
};

/**
 * Elimina una respuesta de una cotización por su ID (admin)
 * @param {string} id - El ID de la respuesta
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const deleteQuatitationResponse = async (id: string) => {
  try {
    const response = await apiFetch(`/quotation-responses/${id}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Error al eliminar la respuesta de la cotización:", error);
    throw error;
  }
};

/**
 * Actualiza el estado de una respuesta de una cotización por su ID (admin)
 * @param {string} id - El ID de la respuesta
 * @param {any} data - Los datos a actualizar
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const patchQuatitationResponse = async (id: string, data: any) => {
  try {
    const response = await apiFetch(`/quotation-responses/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error("Error al actualizar la respuesta de la cotización:", error);
    throw error;
  }
};
