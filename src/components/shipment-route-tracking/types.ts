/**
 * Tipos e interfaces para el sistema de tracking de rutas de envío
 */

/** Fases del proceso de envío */
export type ShipmentPhase =
  | 'first_mile'
  | 'customs_origin'
  | 'transit'
  | 'customs_destination'
  | 'last_mile';

/** Tipos de servicio disponibles */
export type ServiceType = 'aerial' | 'maritime';

/** Tipos de carga disponibles */
export type CargoType = 'general' | 'imo_mixta';

/** Coordenadas geográficas */
export interface RouteCoords {
  lat: number;
  lng: number;
}

/** Punto individual de la ruta */
export interface RoutePoint {
  order: number;
  place: string;
  status: string;
  coords: RouteCoords;
  phase: ShipmentPhase;
  isOptional?: boolean;
}

/** Definición completa de una ruta */
export interface RouteDefinition {
  id: string;
  serviceType: ServiceType;
  cargoType: CargoType;
  origin: string;
  destination: string;
  totalPoints: number;
  points: RoutePoint[];
}

/** Información procesada de la ruta para el mapa */
export interface ProcessedRouteData {
  route: Omit<RouteDefinition, 'points'>;
  currentPosition: number;
  progress: number;
  completedPoints: RoutePoint[];
  currentPoint: RoutePoint | null;
  pendingPoints: RoutePoint[];
}

/** Props del componente principal */
export interface ShipmentRouteTrackingMapProps {
  /** Tipo de servicio: aéreo o marítimo */
  serviceType: ServiceType;
  /** Tipo de carga: general o IMO mixta */
  cargoType: CargoType;
  /** Número del punto actual (1-45) */
  currentPointNumber: number;
  /** Clase CSS adicional */
  className?: string;
  /** Mostrar puntos pendientes en el mapa */
  showPendingPoints?: boolean;
}
