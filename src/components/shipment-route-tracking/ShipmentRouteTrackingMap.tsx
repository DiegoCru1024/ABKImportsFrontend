import React, { useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import type {
  ShipmentRouteTrackingMapProps,
  RoutePoint,
  ProcessedRouteData,
} from './types';
import { getRouteDefinition, getPhaseLabel } from './routes-data';

/**
 * Crea un icono personalizado para los marcadores del mapa
 */
const createCustomIcon = (color: string, order: number): DivIcon => {
  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 10px;
      ">
        ${order}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

/**
 * Determina el color del icono según el estado del punto
 */
const getIconColor = (point: RoutePoint, currentPosition: number): string => {
  if (point.order < currentPosition) return '#22c55e'; // Verde - completado
  if (point.order === currentPosition) return '#f59e0b'; // Naranja - actual
  return '#94a3b8'; // Gris claro - pendiente
};

/**
 * Obtiene el texto del estado del punto
 */
const getPointStatusText = (
  point: RoutePoint,
  currentPosition: number
): string => {
  if (point.order < currentPosition) return 'Completado';
  if (point.order === currentPosition) return 'En progreso';
  return 'Pendiente';
};

/**
 * Optimiza las posiciones para manejar el cruce del anti-meridiano
 * Esto evita que la línea cruce todo el mapa cuando va de Asia a América
 */
const optimizeForAntiMeridian = (
  points: RoutePoint[]
): [number, number][] => {
  if (points.length < 2) {
    return points.map((p) => [p.coords.lat, p.coords.lng]);
  }

  const optimizedPositions: [number, number][] = [];

  for (let i = 0; i < points.length; i++) {
    const { lat, lng } = points[i].coords;

    if (i === 0) {
      optimizedPositions.push([lat, lng]);
    } else {
      const prevLng = optimizedPositions[i - 1][1];
      const variants = [lng, lng + 360, lng - 360];
      let bestLng = variants[0];
      let minDistance = Math.abs(variants[0] - prevLng);

      for (const variant of variants) {
        const distance = Math.abs(variant - prevLng);
        if (distance < minDistance) {
          minDistance = distance;
          bestLng = variant;
        }
      }

      optimizedPositions.push([lat, bestLng]);
    }
  }

  return optimizedPositions;
};

/**
 * Componente para ajustar los límites del mapa automáticamente
 */
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  React.useEffect(() => {
    if (positions.length === 0) return;

    const uniquePositions = positions.filter(
      (pos, index, self) =>
        index === self.findIndex((p) => p[0] === pos[0] && p[1] === pos[1])
    );

    if (uniquePositions.length === 1) {
      map.setView(uniquePositions[0], 10);
    } else if (uniquePositions.length > 1) {
      const latLngs = uniquePositions.map((pos) => ({
        lat: pos[0],
        lng: pos[1],
      }));
      const bounds = latLngs.reduce(
        (acc, pos) => ({
          minLat: Math.min(acc.minLat, pos.lat),
          maxLat: Math.max(acc.maxLat, pos.lat),
          minLng: Math.min(acc.minLng, pos.lng),
          maxLng: Math.max(acc.maxLng, pos.lng),
        }),
        {
          minLat: Infinity,
          maxLat: -Infinity,
          minLng: Infinity,
          maxLng: -Infinity,
        }
      );
      map.fitBounds(
        [
          [bounds.minLat, bounds.minLng],
          [bounds.maxLat, bounds.maxLng],
        ],
        { padding: [50, 50] }
      );
    }
  }, [map, positions]);

  return null;
}

/**
 * Componente principal de mapa de tracking de rutas de envío
 *
 * Muestra la trazabilidad del envío desde el punto inicial hasta el punto actual,
 * determinando automáticamente la ruta según el tipo de servicio y carga.
 *
 * @example
 * ```tsx
 * <ShipmentRouteTrackingMap
 *   serviceType="aerial"
 *   cargoType="general"
 *   currentPointNumber={21}
 * />
 * ```
 */
export default function ShipmentRouteTrackingMap({
  serviceType,
  cargoType,
  currentPointNumber,
  className = '',
  showPendingPoints = false,
}: ShipmentRouteTrackingMapProps) {
  // Obtener la definición de ruta según tipo de servicio y carga
  const routeDefinition = useMemo(
    () => getRouteDefinition(serviceType, cargoType),
    [serviceType, cargoType]
  );

  // Procesar datos para el mapa
  const processedData = useMemo((): ProcessedRouteData | null => {
    if (!routeDefinition) return null;

    const { points, ...routeInfo } = routeDefinition;
    const validCurrentPoint = Math.max(
      1,
      Math.min(currentPointNumber, routeDefinition.totalPoints)
    );

    const completedPoints = points.filter((p) => p.order < validCurrentPoint);
    const currentPoint =
      points.find((p) => p.order === validCurrentPoint) || null;
    const pendingPoints = points.filter((p) => p.order > validCurrentPoint);

    const progress = Math.round(
      (validCurrentPoint / routeDefinition.totalPoints) * 100
    );

    return {
      route: routeInfo,
      currentPosition: validCurrentPoint,
      progress,
      completedPoints,
      currentPoint,
      pendingPoints,
    };
  }, [routeDefinition, currentPointNumber]);

  // Puntos visibles en el mapa (completados + actual + opcionalmente pendientes)
  const visiblePoints = useMemo(() => {
    if (!processedData) return [];

    const points = [
      ...processedData.completedPoints,
      ...(processedData.currentPoint ? [processedData.currentPoint] : []),
      ...(showPendingPoints ? processedData.pendingPoints : []),
    ];

    return points.sort((a, b) => a.order - b.order);
  }, [processedData, showPendingPoints]);

  // Posiciones optimizadas para la polyline
  const tracePositions = useMemo((): [number, number][] => {
    const pointsForTrace = [
      ...(processedData?.completedPoints || []),
      ...(processedData?.currentPoint ? [processedData.currentPoint] : []),
    ];
    return optimizeForAntiMeridian(pointsForTrace);
  }, [processedData]);

  // Posiciones para la línea pendiente (si se muestran)
  const pendingPositions = useMemo((): [number, number][] => {
    if (!showPendingPoints || !processedData) return [];

    const pendingWithCurrent = [
      ...(processedData.currentPoint ? [processedData.currentPoint] : []),
      ...processedData.pendingPoints,
    ];
    return optimizeForAntiMeridian(pendingWithCurrent);
  }, [processedData, showPendingPoints]);

  // Centro por defecto (Nanning, China)
  const defaultCenter: [number, number] = [22.825, 108.293];
  const center = tracePositions.length > 0 ? tracePositions[0] : defaultCenter;

  // Estado de error si no se encuentra la ruta
  if (!routeDefinition) {
    return (
      <div className={`bg-white h-full ${className}`}>
        <div className="px-5 py-4 border-b">
          <h4 className="font-semibold text-gray-900 text-sm">Tracking de Envío</h4>
        </div>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Ruta no encontrada</p>
            <p className="mt-1 text-xs text-gray-500">
              {serviceType} / {cargoType}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className={`bg-white h-full ${className}`}>
        <div className="px-5 py-4 border-b">
          <h4 className="font-semibold text-gray-900 text-sm">Tracking de Envío</h4>
        </div>
        <div className="flex h-96 items-center justify-center">
          <p className="text-sm text-gray-500">
            No hay datos de tracking disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white h-full ${className}`}
      style={{ position: 'relative', zIndex: 0 }}
    >
      {/* Header minimalista */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-blue-50/30 to-purple-50/30">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Tracking de Envío</h4>
            <p className="text-xs text-gray-600 mt-0.5">
              {processedData.route.origin} → {processedData.route.destination}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Progreso</p>
              <p className="text-lg font-bold text-blue-600">{processedData.progress}%</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Tipo</p>
              <p className="text-xs font-semibold text-gray-900">
                {serviceType === 'aerial' ? 'Aérea' : 'Marítima'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de información minimalista */}
      <div className="border-b bg-gradient-to-r from-amber-50/30 to-orange-50/30 px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Estado:</span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700 font-medium">
              {processedData.currentPoint?.status || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Ubicación:</span>
            <span className="font-medium text-gray-900">
              {processedData.currentPoint?.place || processedData.route.origin}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Puntos:</span>
            <span className="font-semibold text-gray-900">
              {processedData.currentPosition}/{processedData.route.totalPoints}
            </span>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="relative h-80" style={{ zIndex: 0 }}>
        <MapContainer
          center={center}
          zoom={3}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Polyline de trazabilidad (verde sólida) */}
          {tracePositions.length > 1 && (
            <Polyline
              positions={tracePositions}
              color="#22c55e"
              weight={4}
              opacity={0.9}
            />
          )}

          {/* Polyline pendiente (azul punteada) - opcional */}
          {showPendingPoints && pendingPositions.length > 1 && (
            <Polyline
              positions={pendingPositions}
              color="#3b82f6"
              weight={3}
              opacity={0.6}
              dashArray="10, 5"
            />
          )}

          {/* Marcadores */}
          {visiblePoints.map((point) => {
            const optimizedIndex = visiblePoints.findIndex(
              (p) => p.order === point.order
            );
            const allPositions = showPendingPoints
              ? [
                  ...optimizeForAntiMeridian([
                    ...(processedData.completedPoints || []),
                    ...(processedData.currentPoint
                      ? [processedData.currentPoint]
                      : []),
                    ...processedData.pendingPoints,
                  ]),
                ]
              : tracePositions;

            const position: [number, number] =
              allPositions[optimizedIndex] || [
                point.coords.lat,
                point.coords.lng,
              ];

            return (
              <Marker
                key={point.order}
                position={position}
                icon={createCustomIcon(
                  getIconColor(point, processedData.currentPosition),
                  point.order
                )}
              >
                <Popup>
                  <div className="min-w-[200px] text-sm">
                    <div className="font-semibold text-green-600">
                      {point.place}
                    </div>
                    <div className="mt-1 text-gray-600">
                      <div className="font-medium">{point.status}</div>
                      <div className="mt-1">
                        Estado:
                        <span
                          className={`ml-1 rounded px-2 py-1 text-xs ${
                            point.order < processedData.currentPosition
                              ? 'bg-green-100 text-green-800'
                              : point.order === processedData.currentPosition
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getPointStatusText(
                            point,
                            processedData.currentPosition
                          )}
                        </span>
                      </div>
                      <div className="mt-1">Fase: {getPhaseLabel(point.phase)}</div>
                      <div>
                        Punto: {point.order} de {processedData.route.totalPoints}
                      </div>
                      {point.isOptional && (
                        <div className="mt-1 text-xs text-orange-600">
                          (Estado Opcional)
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <MapBounds positions={tracePositions} />
        </MapContainer>
      </div>

      {/* Leyenda minimalista */}
      <div className="border-t bg-gradient-to-r from-gray-50/50 to-slate-50/50 px-5 py-3">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Completado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-500"></div>
            <span className="text-gray-700">En Progreso</span>
          </div>
          {showPendingPoints && (
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-400"></div>
              <span className="text-gray-700">Pendiente</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-6 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Ruta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
