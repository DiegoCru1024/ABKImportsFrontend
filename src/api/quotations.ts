import { apiFetch } from "./apiFetch";
import type { Quotation } from "@/pages/Cotizacion/utils/interface";
import type { QuotationResponseIdInterface, QuotationsByUserResponseInterface } from "./interface/quotationInterface";

/**
 * Crea una nueva cotización
 * @param {Quotation} quotation - La cotización a crear
 * @returns {Promise<any>} - La cotización creada
 */
export const createQuotation = async (quotation: Quotation) => {
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
export const getQuotationsByUser = async () => {
  try {
    return await apiFetch<QuotationsByUserResponseInterface>("/quotations", {
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
 * @param {Quotation} quotation - La cotización a actualizar
 * @returns {Promise<any>} - La cotización actualizada
 */
export const updateQuotation = async (id: string, quotation: Quotation) => {
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
    return await apiFetch(`/quotations/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error al eliminar la cotización:", error);
    throw error;
  }
};
