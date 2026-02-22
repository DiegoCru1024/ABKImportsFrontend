
export interface Inspection {
  id: string;
  correlative: string;
  quotation_id: string;
  name: string;
  shipping_service_type: string;
  logistics_service: string;
  status: string;
  total_price: string;
}

export interface InspectionResponse {
  content: Inspection[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface InspectionProduct {
  product_id: string;
  name: string;
  quantity: number;
  express_price: string;
  status: string;
  files: string[];
}

/** Tipos de carga para el tracking */
export type CargoType = 'general' | 'imo_mixta';

export interface InspectionDetail {
  id: string;
  shipping_service_type: string;
  logistics_service: string;
  updated_at: string;
  content: InspectionProduct[];
  total_price: string;
  origin?: string;
  /** Estado actual del tracking */
  tracking_status?: string;
  /** Punto actual en la ruta de tracking (1-13 para inspecciones) */
  tracking_point?: number;
  /** Tipo de carga: general (Shenzhen) o imo_mixta (Hong Kong) */
  cargo_type?: CargoType;
}

// ============================================
// INTERFACES PARA ESTADOS DE TRACKING DE INSPECCIÓN
// ============================================

export type InspectionTrackingPhase = 'first_mile' | 'customs';

export interface InspectionTrackingStatus {
  id: string;
  order: number;
  value: string;
  label: string;
  description?: string;
  phase: InspectionTrackingPhase;
  isOptional: boolean;
  isActive: boolean;
  /** Punto correspondiente en la ruta de tracking (1-13) */
  tracking_point?: number;
}

export interface InspectionTrackingStatusesResponse {
  statuses: InspectionTrackingStatus[];
}

// ============================================
// INTERFACES PARA VISTA DE INSPECCION DE MERCANCIAS (USUARIO)
// ============================================

export type CustomsChannel = 'red' | 'yellow' | 'green';

export interface InspectionOrderSummary {
  cargo_type: string;
  cargo_type_label: string;
  total_product_cost: number;
  total_import_expenses: number;
  total_import_investment: number;
  customs_channel: CustomsChannel;
}

export { type Shipment } from './shipmentInterface';

export interface InspectionShipmentsResponse {
  shipments: Shipment[];
}

// ============================================
// INTERFACES PARA HISTORIAL DE TRACKING DE PRODUCTO
// ============================================

export interface TrackingHistoryEntry {
  status: string;
  label: string;
  tracking_point: number;
  timestamp: string;
  notes: string | null;
}

export interface InspectionTrackingHistoryResponse {
  product_id: string | null;
  product_name: string | null;
  current_status: string;
  current_tracking_point: number;
  history: TrackingHistoryEntry[];
}

