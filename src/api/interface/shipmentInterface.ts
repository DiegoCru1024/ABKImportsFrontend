export type ShippingType = 'aerial' | 'maritime';

export type ContainerType = 
  | '20ft Standard'
  | '40ft Standard'
  | '40ft High Cube'
  | '20ft Refrigerated'
  | '40ft Refrigerated'
  | '20ft Open Top'
  | '40ft Open Top'
  | '20ft Flat Rack'
  | '40ft Flat Rack';

export type ShipmentStatus = 
  // Estados aéreos
  | 'pending_product_arrival'
  | 'in_inspection'
  | 'awaiting_pickup'
  | 'dispatched'
  | 'airport'
  | 'in_transit'
  | 'arrived_destination'
  | 'customs'
  | 'delivered'
  // Estados marítimos adicionales
  | 'chinese_customs_inspection'
  | 'chinese_customs_release'
  | 'on_vessel'
  | 'in_port'
  | 'pending_container_unloading'
  | 'container_unloaded_customs'
  | 'peruvian_customs_release'
  | 'local_warehouse_transit';

export type CurrentLocation = 
  // Ubicaciones aéreas
  | 'Nanning'
  | 'Despachado'
  | 'Shenzhen'
  | 'Hong Kong'
  | 'Korea Seul'
  | 'Osaka Japon'
  | 'Alaska'
  | 'Los Angeles'
  | 'Chicago'
  | 'Miami'
  | 'Bogota'
  | 'Lima'
  | 'Entregado'
  // Ubicaciones marítimas adicionales
  | 'Guangzhou'
  | 'Ningbo'
  | 'Shanghai'
  | 'Qiangdao'
  | 'Dalian'
  | 'Tianjin'
  | 'Manzanillo, México'
  | 'Balboa, Panamá'
  | 'Rodman (PSA Panama)'
  | 'Buenaventura, Colombia'
  | 'Guayaquil Ecuador';

export interface StatusHistoryEntry {
  status: ShipmentStatus;
  location: CurrentLocation;
  progress: number;
  timestamp: string;
  notes?: string;
}

export interface Shipment {
  id: string;
  correlative: string; // SHP-001, SHP-002, etc.
  origin: string;
  destination: string;
  weight: number;
  container_type?: ContainerType;
  status: ShipmentStatus;
  current_location: CurrentLocation;
  progress: number; // 0-100
  status_history: StatusHistoryEntry[];
  shipping_type: ShippingType;
  estimated_date?: string;
  inspection_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateShipmentRequest {
  inspection_id: string;
  origin: string;
  destination: string;
  weight: number;
  container_type?: ContainerType;
  estimated_date?: string;
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  current_location: CurrentLocation;
  notes?: string;
}

export interface ShipmentInfo {
  aerial_locations: Record<string, number>;
  maritime_locations: Record<string, number>;
  aerial_statuses: string[];
  maritime_statuses: string[];
}

export interface ShipmentsResponse {
  content: Shipment[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
} 