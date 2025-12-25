export enum PurchaseOrderType {
    CONSOLIDADO_EXPRESS = 'Consolidado Express',
    CONSOLIDADO_GRUPAL_EXPRESS = 'Consolidado Grupal Express',
    CONSOLIDADO_MARITIMO = 'Consolidado Maritimo',
    CONSOLIDADO_GRUPAL_MARITIMO = 'Consolidado Grupal Maritimo',
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
    sub_quotations: any[]; // Puedes tipar esto mejor si lo necesitas
}