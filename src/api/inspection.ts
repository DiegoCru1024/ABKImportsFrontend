    import { apiFetch } from "./apiFetch";
import type { InspectionResponse, InspectionDetail } from "./interface/inspectionInterface";

/**
 * Obtiene todas las inspecciones que ha realizado el usuario
 * @returns {Promise<>} - Las inspecciones
 */
export const getInspectionsByUser = async (searchTerm:string,page:number,size:number) => {

    const url = new URL(
        "/inspections",
        "https://abkimportsbackend-production.up.railway.app"
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
  export const generateInspectionId = async (quotation_id :string, shipping_service_type:string) => {
    console.log("Esto se está enviando",JSON.stringify({
        quotation_id,
        shipping_service_type
    }) )
    try {
        return await apiFetch(`/inspections`, {
            method: "POST",
            body: JSON.stringify({
                quotation_id,
                shipping_service_type
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




