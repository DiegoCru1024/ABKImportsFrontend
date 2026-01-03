import type {
    CreateOrdenCompraDto,
    OrdenCompraListResponseDto,
    OrdenDeCompra,
    SubQuotationResumenDto,
    ProductoConVariantesDto,
    ActualizarVariantesDto,
    ActualizarVariantesResponse,
} from "@/api/interface/orden-compra-interface.ts";
import { apiFetch } from "@/api/apiFetch.ts";

// ============================================
// CREAR ORDEN DE COMPRA
// ============================================

/**
 * Crea una nueva orden de compra
 * @param {CreateOrdenCompraDto} createDto - Datos para crear la orden
 * @returns {Promise<OrdenDeCompra>} - Orden de compra creada
 */
export const createOrdenCompra = async (
    createDto: CreateOrdenCompraDto
): Promise<OrdenDeCompra> => {
    try {
        const response: OrdenDeCompra = await apiFetch("/orden-compra", {
            method: "POST",
            body: JSON.stringify(createDto),
        });
        return response;
    } catch (error) {
        console.error("Error al crear orden de compra:", error);
        throw error;
    }
};

// ============================================
// LISTAR ÓRDENES DE COMPRA
// ============================================

/**
 * Obtiene la lista de todas las órdenes de compra
 * @returns {Promise<OrdenCompraListResponseDto[]>} - Lista de órdenes de compra
 */
export const getAllOrdenesCompra = async (): Promise<OrdenCompraListResponseDto[]> => {
    try {
        const response: OrdenCompraListResponseDto[] = await apiFetch(
            "/orden-compra/lista",
            {
                method: "GET",
            }
        );
        return response;
    } catch (error) {
        console.error("Error al obtener órdenes de compra:", error);
        throw error;
    }
};

// ============================================
// LISTAR SUB-QUOTATIONS DE UNA ORDEN
// ============================================

/**
 * Obtiene las sub-quotations de una orden de compra
 * @param {string} ordenId - ID de la orden de compra
 * @returns {Promise<SubQuotationResumenDto[]>} - Lista de sub-quotations
 */
export const getSubQuotationsDeOrden = async (
    ordenId: string
): Promise<SubQuotationResumenDto[]> => {
    try {
        const response: SubQuotationResumenDto[] = await apiFetch(
            `/orden-compra/${ordenId}/sub-quotations`,
            {
                method: "GET",
            }
        );
        return response;
    } catch (error) {
        console.error("Error al obtener sub-quotations de la orden:", error);
        throw error;
    }
};

// ============================================
// LISTAR PRODUCTOS CON VARIANTES
// ============================================

/**
 * Obtiene los productos con sus variantes de una sub-quotation
 * @param {string} subQuotationId - ID de la sub-quotation
 * @returns {Promise<ProductoConVariantesDto[]>} - Lista de productos con variantes
 */
export const getProductosConVariantes = async (
    subQuotationId: string
): Promise<ProductoConVariantesDto[]> => {
    try {
        const response: ProductoConVariantesDto[] = await apiFetch(
            `/orden-compra/sub-quotation/${subQuotationId}/productos`,
            {
                method: "GET",
            }
        );
        return response;
    } catch (error) {
        console.error("Error al obtener productos con variantes:", error);
        throw error;
    }
};

// ============================================
// ACTUALIZAR CANTIDADES COMPRADAS
// ============================================

/**
 * Actualiza las cantidades compradas de variantes
 * @param {string} ordenId - ID de la orden de compra
 * @param {string} subQuotationId - ID de la sub-quotation
 * @param {ActualizarVariantesDto} updateDto - Datos de actualización
 * @returns {Promise<ActualizarVariantesResponse>} - Respuesta de actualización
 */
export const actualizarVariantes = async (
    ordenId: string,
    subQuotationId: string,
    updateDto: ActualizarVariantesDto
): Promise<ActualizarVariantesResponse> => {
    try {
        const response: ActualizarVariantesResponse = await apiFetch(
            `/orden-compra/${ordenId}/sub-quotation/${subQuotationId}/actualizar-variantes`,
            {
                method: "PATCH",
                body: JSON.stringify(updateDto),
            }
        );
        return response;
    } catch (error) {
        console.error("Error al actualizar variantes:", error);
        throw error;
    }
};