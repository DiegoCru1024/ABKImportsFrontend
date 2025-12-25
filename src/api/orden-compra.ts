import type {
    CreateOrdenCompraDto,
    OrdenCompraListResponseDto,
    OrdenDeCompra
} from "@/api/interface/orden-compra-interface.ts";
import {apiFetch} from "@/api/apiFetch.ts";

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
// ORDEN DE COMPRA - LISTAR
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