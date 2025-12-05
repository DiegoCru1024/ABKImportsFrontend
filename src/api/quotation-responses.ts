import { apiFetch } from "./apiFetch";
import type {
    QuotationResponseBase,
    CreateUpdateQuotationResponseDTO, SubQuotationSelect, CheckOriginQuotationResponse
} from "./interface/quotation-response/quotation-response-base";
import type {
  QuotationGetResponsesForUsersDTO,
  QuotationResponseListDTO,
  QuotationCreateUpdateResponseDTO,
} from "./interface/quotationResponseInterfaces";

/**
 * Crea una respuesta de una cotización (Admin Only)
 * @param {CreateUpdateQuotationResponseDTO} data - Los datos a crear (SIN quotationId en el body)
 * @param {string} quotationId - El ID de la cotización (va en el path)
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const createQuatitationResponse = async (
  data: CreateUpdateQuotationResponseDTO,
  quotationId: string
) => {
  try {
      const dataWithClientTimestamp = {
          ...data,
          createdAtClient: new Date().toISOString(), // Formato: "2024-01-15T14:30:00.000Z"
      };
    const response = await apiFetch(
      `/quotation-responses/quotation/${quotationId}/complete-service`,
      {
        method: "POST",
        body: JSON.stringify(dataWithClientTimestamp),
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
 * @param {string} quotationId - El ID de la cotización (va en el path)
 * @param {string} quotationResponseId - El ID de la respuesta (va en el path)
 * @param {CreateUpdateQuotationResponseDTO} data - Los datos a actualizar (SIN quotationId en el body)
 * @returns {Promise<any>} - La respuesta de la cotización
 */
export const patchQuatitationResponse = async (
  quotationId: string,
  quotationResponseId: string,
  data: CreateUpdateQuotationResponseDTO
) => {
  try {
    const response = await apiFetch(
      `/quotation-responses/update-responses/${quotationResponseId}/${quotationId}`,
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
      `/quotation-responses/list-responses/${quotationId}?${queryParams.toString()}`,
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
 * @returns {Promise<QuotationGetResponsesForUsersDTO>} - Las respuestas de la cotización
 */
export const getResponsesForUsers = async (quotationId: string) => {
  try {
    const response: QuotationGetResponsesForUsersDTO = await apiFetch(
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
 * @param {string} quotationResponseId - El ID de la cotización
 * @param {string} serviceType - El ID de la respuesta
 * @returns {Promise<QuotationResponseBase>} - Los detalles de la respuesta
 */
export const getDetailsResponse = async (quotationResponseId: string, serviceType: string) => {
  try {
    const response: QuotationResponseBase = await apiFetch(
      `/quotation-responses/details/${quotationResponseId}/${serviceType}`,
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

/**
 * Verifica si existe una cotización de origen para una cotización específica
 * @param {string} quotationId - El ID de la cotización a verificar
 * @returns {Promise<CheckOriginQuotationResponse>} - Resultado de la verificación
 */
export const checkOriginQuotation = async (
    quotationId: string
): Promise<CheckOriginQuotationResponse> => {
    try {
        const response: CheckOriginQuotationResponse = await apiFetch(
            `/quotation-responses/checkRespuestas/${quotationId}`,
            {
                method: "GET",
            }
        );
        return response;
    } catch (error) {
        console.error("Error al verificar cotización de origen:", error);
        throw error;
    }
};

/**
 * Obtiene la lista de sub-cotizaciones de una cotización por su ID (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @returns {Promise<SubQuotationSelect[]>} - La lista de sub-cotizaciones
 */
export const getSubQuotationsList = async (quotationId: string): Promise<SubQuotationSelect[]> => {
    try {
        const response: SubQuotationSelect[] = await apiFetch(
            `/quotation-responses/list-subquotations/${quotationId}`,
            {
                method: "GET",
            }
        );
        return response;
    } catch (error) {
        console.error("Error al obtener la lista de sub-cotizaciones:", error);
        throw error;
    }
};

