// api/interface/orden-compra-interface.ts

export enum PurchaseOrderType {
    CONSOLIDADO_EXPRESS = 'Consolidado Express',
    CONSOLIDADO_GRUPAL_EXPRESS = 'Consolidado Grupal Express',
    CONSOLIDADO_MARITIMO = 'Consolidado Maritimo',
    CONSOLIDADO_GRUPAL_MARITIMO = 'Consolidado Grupal Maritimo',
    ALMACENAJE_DE_MERCANCIAS ='Almacenaje de mercancias'
}

export enum PurchaseOrderStatus {
    PENDIENTE_DE_COMPRA = 'Pendiente de Compra',
    EN_PROGRESO = 'En Progreso',
    COMPLETADO_PARCIALMENTE = 'Completado Parcialmente',
    COMPLETADO = 'Completado',
}

/**
 * DTO para crear una orden de compra
 */
export interface CreateOrdenCompraDto {
    type: PurchaseOrderType;
    subQuotationIds: string[];
    createdAtClient?: string;
    notes?: string;
}

/**
 * Respuesta de listado de órdenes de compra
 */
export interface OrdenCompraListResponseDto {
    id_orden_compra: string;
    correlative: string;
    type: PurchaseOrderType;
    status: PurchaseOrderStatus;
    created_at: Date;
    numero_participantes: number;
    numero_items: number;
    notes?: string;
}

export interface OrdenDeCompra {
    id_orden_compra: string;
    correlative: string;
    type: PurchaseOrderType;
    status: PurchaseOrderStatus;
    created_at_client: Date;
    notes?: string;
    total_amount: number;
    sub_quotations: any[];
}

// ============================================
// INTERFACES PARA SUB-QUOTATIONS
// ============================================

/**
 * Resumen de sub-quotation de una orden
 */
export interface SubQuotationResumenDto {
    id_sub_quotation: string;
    type: string;
    version: number;
    quotation_correlative: string;
    client_name: string;
    total_items_solicitados: number;
    total_items_comprados: number;
}

// ============================================
// INTERFACES PARA PRODUCTOS Y VARIANTES
// ============================================


export enum OrdenCompraProductoStatus {
    PENDIENTE = 'Pendiente',
    COMPLETADO_PARCIAL = 'Completado Parcial',
    COMPLETADO = 'Completado',
}

/**
 * Detalle de una variante específica
 */
export interface VarianteDetalleDto {
    id_orden_compra_producto: string;
    id_variant: string;
    variant_description: string;
    variant_images: string[];
    color: string;
    size: string;
    model: string;
    presentation: string;
    cantidad_solicitada: number;
    cantidad_comprada: number;
    saldo: number;
    precio_unitario: number;
    status:OrdenCompraProductoStatus;
    monto_agente: number;
}

/**
 * Producto con sus variantes
 */
export interface ProductoConVariantesDto {
    id_product: string;
    product_name: string;
    product_image: string | null;
    total_solicitado: number;
    total_comprado: number;
    saldo_total: number;
    variantes: VarianteDetalleDto[];
}

// ============================================
// INTERFACES PARA ACTUALIZAR COMPRAS
// ============================================

/**
 * DTO para actualizar una variante
 */
export interface ActualizarVarianteDto {
    id_orden_compra_producto: string;
    cantidad_comprada: number;
    notas?: string;
}

/**
 * DTO para actualizar múltiples variantes
 */
export interface ActualizarVariantesDto {
    variantes: ActualizarVarianteDto[];
}

/**
 * Respuesta de actualización
 */
export interface ActualizarVariantesResponse {
    message: string;
}