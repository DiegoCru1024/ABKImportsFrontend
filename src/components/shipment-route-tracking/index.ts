/**
 * Módulo de tracking de rutas de envío
 *
 * Exporta el componente principal y tipos relacionados
 */

export { default as ShipmentRouteTrackingMap } from './ShipmentRouteTrackingMap';

export type {
  ShipmentRouteTrackingMapProps,
  ServiceType,
  CargoType,
  ShipmentPhase,
  RoutePoint,
  RouteCoords,
  RouteDefinition,
  ProcessedRouteData,
} from './types';

export { getRouteDefinition, getPhaseLabel, ROUTES } from './routes-data';
