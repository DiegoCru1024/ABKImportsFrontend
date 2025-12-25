import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {CreateOrdenCompraDto} from "@/api/interface/orden-compra-interface.ts";
import {createOrdenCompra, getAllOrdenesCompra} from "@/api/orden-compra.ts";
import {toast} from "sonner";

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
            // Invalidar queries relacionadas
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
