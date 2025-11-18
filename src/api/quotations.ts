import type { QuotationPayload, QuotationPayloadAdministrador } from "@/pages/cotizacion-page/utils/types/api.types";
import { apiFetch } from "./apiFetch";

import type {
  QuotationResponseIdInterface,
  QuotationsByUserResponseInterface,
} from "./interface/quotationInterface";

/**
 * Crea una nueva cotización
 * @param {QuotationPayload} quotation - La cotización a crear
 * @returns {Promise<any>} - La cotización creada
 */
export const createQuotation = async (quotation: QuotationPayload) => {
  //console.log("Estas esta la informacion de la cotizacion", JSON.stringify(quotation,null,2));
  try {
    return await apiFetch("/quotations", {
      method: "POST",
      body: JSON.stringify(quotation),
    });
  } catch (error) {
    console.error("Error al crear la cotización:", error);
    throw error;
  }
};


/**
 * Crea una nueva cotización
 * @param {QuotationPayloadAdministrador} quotation - La cotización a crear
 * @returns {Promise<any>} - La cotización creada
 */
export const createQuotationAdministrador = async (quotation: QuotationPayloadAdministrador) => {
  //console.log("Estas esta la informacion de la cotizacion", JSON.stringify(quotation,null,2));
  try {
    return await apiFetch("/quotations/admin", {
      method: "POST",
      body: JSON.stringify(quotation),
    });
  } catch (error) {
    console.error("Error al crear la cotización:", error);
    throw error;
  }
};


/**
 * Obtiene una cotización por su ID
 * @param {string} id - El ID de la cotización
 * @returns {Promise<any>} - La cotización
 */
export const getQuotationById = async (id: string) => {
  try {
    return await apiFetch<QuotationResponseIdInterface>(`/quotations/${id}`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener la cotización:", error);
    throw error;
  }
};

/**
 * Obtiene todas las cotizaciones que ha realizado el usuario
 * @returns {Promise<QuotationsByUserResponseInterface>} - Las cotizaciones
 */
export const getQuotationsByUser = async (
  searchTerm: string,
  page: number,
  size: number,
  filter?:string
) => {
  let endpoint = "/quotations";
  
  // Crear los parámetros de búsqueda y agregarlos a la URL si es necesario
  const params: URLSearchParams = new URLSearchParams();
  
  if (searchTerm) {
    params.append("searchTerm", searchTerm);
  }

  // Agregar los parámetros de paginación
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter){
    params.append("status", filter.toString());
  }

  // Si hay parámetros, los agregamos al endpoint
  if (params.toString()) {
    endpoint = `${endpoint}?${params.toString()}`;
  }

  try {
    return await apiFetch<QuotationsByUserResponseInterface>(endpoint, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener las cotizaciones:", error);
    throw error;
  }
};

/**
 * Actualiza una cotización por su ID
 * @param {string} id - El ID de la cotización
 * @param {QuotationPayload} quotation - La cotización a actualizar
 * @returns {Promise<any>} - La cotización actualizada
 */
export const updateQuotation = async (id: string, quotation: QuotationPayload) => {
  try {
    return await apiFetch(`/quotations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(quotation),
    });
  } catch (error) {
    console.error("Error al actualizar la cotización:", error);
    throw error;
  }
};

/**
 * Elimina una cotización por su ID
 * @param {string} id - El ID de la cotización
 * @returns {Promise<any>} - La cotización eliminada
 */
export const deleteQuotation = async (id: string) => {
  try {
    console.log("Eliminando cotizacion", id);
    return await apiFetch(`/quotations/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error al eliminar la cotización:", error);
    throw error;
  }
};

/**
 * Actualiza una cotización por su ID
 * @param {string} id - El ID de la cotización
 * @param {QuotationPayload} quotation - La cotización a actualizar
 * @returns {Promise<any>} - La cotización actualizada
 */
export const patchQuotation = async (id: string, quotation: QuotationPayload) => {
  try {
    return await apiFetch(`/quotations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(quotation),
    });
  } catch (error) {
    console.error("Error al actualizar la cotización:", error);
    throw error;
  }
}

/**
* Envia un borrador de cotización
* @param {string} id - El ID de la cotización
* @param {QuotationPayload} data - La cotización a enviar
* @returns {Promise<any>} - La cotización enviada
*/
export const submitDraft = async(id:string,data:QuotationPayload )=>{
  try {
    return await apiFetch(`/quotations/${id}/submit-draft`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error al enviar el borrador:", error);
    throw error;
  }
}
