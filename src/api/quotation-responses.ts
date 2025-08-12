import { apiFetch } from "./apiFetch";
import type {
  QuotationResponseDTO,
  QuotationGetResponsesForUsersDTO,
  QuotationResponseListDTO,
} from "./interface/quotationResponseInterfaces";

/**
 * Crea una respuesta de una cotización (Admin Only)
 * @param {QuotationResponseDTO} data - Los datos a crear
 * @param {string} quotationId - El ID de la cotización
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const createQuatitationResponse = async (
  data: QuotationResponseDTO,
  quotationId: string
) => {
  try {
    const response = await apiFetch(
      `/quotation-responses/quotation/${quotationId}/complete-response`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error("Error al crear la respuesta de la cotización:", error);
    throw error;
  }
};

/**
 * Elimina una respuesta de una cotización por su ID (Admin Only)
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
 * Actualiza el estado de una respuesta de una cotización por su ID (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @param {string} quotationResponseId - El ID de la respuesta
 * @param {QuotationResponseDTO} data - Los datos a actualizar
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const patchQuatitationResponse = async (
  quotationId: string,
  quotationResponseId: string,
  data: QuotationResponseDTO
) => {
  try {
    const response = await apiFetch(
      `/quotation-responses/update-responses/${quotationId}/${quotationResponseId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error("Error al actualizar la respuesta de la cotización:", error);
    throw error;
  }
};

/**
 * Lista las respuestas de una cotización (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @param {number} page - La página actual
 * @param {number} size - El tamaño de la página
 * @returns {Promise<QuotationResponseListDTO>} - Las respuestas de la cotización
 */
export const listQuatitationResponses = async (
  quotationId: string,
  page: number,
  size: number
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  try {
    const response: QuotationResponseListDTO = await apiFetch(
      `/quotation-responses/list/${quotationId}?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("Error al listar las respuestas de la cotización:", error);
    throw error;
  }
};

/**
 * Obtiene las respuestas del administrador para un usuario para una cotización (Usuarios no administradores)
 * @param {string} quotationId - El ID de la cotización
 * @returns {Promise<QuotationGetResponsesForUsersDTO[]>} - Las respuestas de la cotización
 */
export const getResponsesForUsers = async (quotationId: string) => {
  try {
    const response: QuotationGetResponsesForUsersDTO[] = await apiFetch(
      `/quotation-responses/get-responses/${quotationId}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("Error al listar las respuestas de los usuarios:", error);
    throw error;
  }
};


/**
 * Obtiene las respuestas de una cotización por su ID (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @param {number} page - La página actual
 * @param {number} size - El tamaño de la página
 * @returns {Promise<QuotationResponseListDTO>} - Las respuestas de la cotización
 */
export const getListResponsesByQuotationId = async (quotationId: string, page: number, size: number) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  try {
    const response: QuotationResponseListDTO = await apiFetch<QuotationResponseListDTO>(
      `/quotation-responses/list/${quotationId}?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("Error al listar las respuestas de la cotización:", error);
    throw error;
  }
};

/**
 * Obtiene los detalles de una respuesta de una cotización por su ID (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @param {string} quotationResponseId - El ID de la respuesta
 * @returns {Promise<QuotationResponseDTO>} - Los detalles de la respuesta
 */
export const getDetailsResponse = async (quotationId: string, quotationResponseId: string) => {
  try {
    const response: QuotationResponseDTO = await apiFetch<QuotationResponseDTO>(
      `/quotation-responses/details/${quotationId}/${quotationResponseId}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("Error al obtener los detalles de la respuesta:", error);
    throw error;
  }
}