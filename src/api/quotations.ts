import { apiFetch } from "./apiFetch";
import type { Quotation } from "@/pages/Cotizacion/utils/interface";



/**
 * Crea una nueva cotización
 * @param {Quotation} quotation - La cotización a crear
 * @returns {Promise<any>} - La cotización creada
 */
export const createQuotation = async (quotation: Quotation) => {
  try {
    const response = await apiFetch("/quotations", {
      method: "POST",
      body: JSON.stringify(quotation),
    });
    if (!response.ok) {
      throw new Error("Error al crear la cotización");
    }
    return response.json();
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
    const response = await apiFetch(`/quotations/${id}`);
    if (!response.ok) {
      throw new Error("Error al obtener la cotización");
    }
    return response.json();
  } catch (error) {
    console.error("Error al obtener la cotización:", error);
    throw error;
  }
};

/**
 * Obtiene todas las cotizaciones que ha realizado el usuario
 * @returns {Promise<any>} - Las cotizaciones
 */
export const getQuotationsByUser = async () => {
  try {
    const response = await apiFetch("/quotations");
    if (!response.ok) {
      throw new Error("Error al obtener las cotizaciones");
    }
    return response.json();
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
    const response = await apiFetch(`/quotations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(quotation),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar la cotización");
    }
    return response.json();
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
    const response = await apiFetch(`/quotations/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar la cotización");
    }
    return response.json();
  } catch (error) {
    console.error("Error al eliminar la cotización:", error);
    throw error;
  }
};