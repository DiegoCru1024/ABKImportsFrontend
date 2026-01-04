// hooks/use-orden-compra.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateOrdenCompraDto,
    ActualizarVariantesDto,
} from "@/api/interface/orden-compra-interface.ts";
import {
    createOrdenCompra,
    getAllOrdenesCompra,
    getSubQuotationsDeOrden,
    getProductosConVariantes,
    actualizarVariantes, eliminarSubQuotationDeOrden, agregarSubQuotationAOrden,
} from "@/api/orden-compra.ts";
import { toast } from "sonner";

// ============================================
// HOOK: CREAR ORDEN DE COMPRA
// ============================================

/**
 * Hook para crear una orden de compra
 * @returns {useMutation} - Mutación para crear orden de compra
 */
export function useCreateOrdenCompra() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (createDto: CreateOrdenCompraDto) =>
            createOrdenCompra(createDto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordenesCompra"] });
            queryClient.invalidateQueries({ queryKey: ["availableSubQuotations"] });

            toast.success("Orden de compra creada exitosamente");
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Error al crear orden de compra";
            toast.error(errorMessage);
            console.error("Error al crear orden de compra:", error);
        },
    });
}

// ============================================
// HOOK: LISTAR ÓRDENES DE COMPRA
// ============================================

/**
 * Hook para obtener todas las órdenes de compra
 * @returns {useQuery} - Lista de órdenes de compra
 */
export function useGetAllOrdenesCompra() {
    return useQuery({
        queryKey: ["ordenesCompra"],
        queryFn: () => getAllOrdenesCompra(),
    });
}

// ============================================
// HOOK: LISTAR SUB-QUOTATIONS DE UNA ORDEN
// ============================================

/**
 * Hook para obtener las sub-quotations de una orden
 * @param {string} ordenId - ID de la orden de compra
 * @returns {useQuery} - Lista de sub-quotations
 */
export function useGetSubQuotationsDeOrden(ordenId: string) {
    return useQuery({
        queryKey: ["subQuotationsOrden", ordenId],
        queryFn: () => getSubQuotationsDeOrden(ordenId),
        enabled: Boolean(ordenId), // Solo ejecutar si hay ordenId
    });
}

// ============================================
// HOOK: LISTAR PRODUCTOS CON VARIANTES
// ============================================

/**
 * Hook para obtener productos con variantes de una sub-quotation
 * @param {string} subQuotationId - ID de la sub-quotation
 * @returns {useQuery} - Lista de productos con variantes
 */
export function useGetProductosConVariantes(subQuotationId: string) {
    return useQuery({
        queryKey: ["productosVariantes", subQuotationId],
        queryFn: () => getProductosConVariantes(subQuotationId),
        enabled: Boolean(subQuotationId), // Solo ejecutar si hay subQuotationId
    });
}

// ============================================
// HOOK: ACTUALIZAR CANTIDADES COMPRADAS
// ============================================

/**
 * Hook para actualizar cantidades compradas de variantes
 * @returns {useMutation} - Mutación para actualizar variantes
 */
export function useActualizarVariantes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         ordenId,
                         subQuotationId,
                         updateDto,
                     }: {
            ordenId: string;
            subQuotationId: string;
            updateDto: ActualizarVariantesDto;
        }) => actualizarVariantes(ordenId, subQuotationId, updateDto),
        onSuccess: (_, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: ["ordenesCompra"] });
            queryClient.invalidateQueries({
                queryKey: ["subQuotationsOrden", variables.ordenId],
            });
            queryClient.invalidateQueries({
                queryKey: ["productosVariantes", variables.subQuotationId],
            });

            toast.success("Cantidades actualizadas exitosamente");
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Error al actualizar cantidades";
            toast.error(errorMessage);
            console.error("Error al actualizar variantes:", error);
        },
    });
}

/**
 * Hook para agregar una sub-quotation a una orden existente
 * @returns {useMutation} - Mutación para agregar sub-quotation
 */
export function useAgregarSubQuotationAOrden() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         ordenId,
                         subQuotationId,
                     }: {
            ordenId: string;
            subQuotationId: string;
        }) => agregarSubQuotationAOrden(ordenId, subQuotationId),
        onSuccess: (_, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: ["ordenesCompra"] });
            queryClient.invalidateQueries({
                queryKey: ["subQuotationsOrden", variables.ordenId],
            });
            queryClient.invalidateQueries({ queryKey: ["availableSubQuotations"] });

            toast.success("Sub-quotation agregada exitosamente");
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Error al agregar sub-quotation";
            toast.error(errorMessage);
            console.error("Error al agregar sub-quotation:", error);
        },
    });
}

// ============================================
// HOOK: ELIMINAR SUB-QUOTATION DE ORDEN
// ============================================

/**
 * Hook para eliminar una sub-quotation de una orden
 * @returns {useMutation} - Mutación para eliminar sub-quotation
 */
export function useEliminarSubQuotationDeOrden() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         ordenId,
                         subQuotationId,
                     }: {
            ordenId: string;
            subQuotationId: string;
        }) => eliminarSubQuotationDeOrden(ordenId, subQuotationId),
        onSuccess: (_, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: ["ordenesCompra"] });
            queryClient.invalidateQueries({
                queryKey: ["subQuotationsOrden", variables.ordenId],
            });
            queryClient.invalidateQueries({ queryKey: ["availableSubQuotations"] });

            toast.success("Sub-quotation eliminada exitosamente");
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Error al eliminar sub-quotation";
            toast.error(errorMessage);
            console.error("Error al eliminar sub-quotation:", error);
        },
    });
}