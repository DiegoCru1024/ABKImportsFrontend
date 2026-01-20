import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGetShipmentTrackingRoute } from '@/hooks/use-shipments';
import type { RoutePoint } from '@/api/interface/shipmentInterface';

/**
 * Crea un icono personalizado para los marcadores del mapa
 */
const createCustomIcon = (color: string, order: number) => {
  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
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
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

/**
 * Determina el color del icono según el estado del punto
 */
const getIconColor = (point: RoutePoint, currentPosition: number): string => {
  if (point.order < currentPosition) return '#22c55e'; // Verde - completado
  if (point.order === currentPosition) return '#f59e0b'; // Naranja - actual
  return '#6b7280'; // Gris - pendiente
};

/**
 * Obtiene el texto del estado del punto
 */
const getPointStatus = (point: RoutePoint, currentPosition: number): string => {
  if (point.order < currentPosition) return 'Completado';
  if (point.order === currentPosition) return 'En progreso';
  return 'Pendiente';
};

/**
 * Traduce la fase a español
 */
const getPhaseText = (phase: string): string => {
  const phaseMap: Record<string, string> = {
    'first_mile': 'Primera Milla',
    'transit': 'Tránsito Internacional',
    'customs': 'Aduana',
    'last_mile': 'Última Milla'
  };
  return phaseMap[phase] || phase;
};

/**
 * Optimiza la ruta para evitar cruces incorrectos en el anti-meridiano
 * Ajusta las longitudes para que la línea tome el camino más corto
 */
const optimizeRouteForAntiMeridian = (points: RoutePoint[]): [number, number][] => {
  if (points.length < 2) return points.map(p => [p.coords.lat, p.coords.lng]);

  const optimizedPoints: [number, number][] = [];

  for (let i = 0; i < points.length; i++) {
    const { lat, lng } = points[i].coords;

    if (i === 0) {
      optimizedPoints.push([lat, lng]);
    } else {
      const prevLng = optimizedPoints[i - 1][1];

      // Elegir la variante más cercana al punto anterior
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

      optimizedPoints.push([lat, bestLng]);
    }
  }

  return optimizedPoints;
};

/**
 * Componente para ajustar los bounds del mapa automáticamente
 */
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  React.useEffect(() => {
    if (positions.length > 1) {
      const bounds = positions.reduce(
        (acc, pos) => acc.extend(pos),
        map.getBounds()
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 12);
    }
  }, [map, positions]);

  return null;
}

interface ShipmentTrackingMapProps {
  shipmentId: string;
  className?: string;
}

export default function ShipmentTrackingMap({
  shipmentId,
  className
}: ShipmentTrackingMapProps) {
  const { data: trackingRoute, isLoading, error } = useGetShipmentTrackingRoute(shipmentId);

  // Procesar datos para el mapa
  const processedData = useMemo(() => {
    if (!trackingRoute) return null;

    const allPoints = [
      ...trackingRoute.completedPoints,
      ...(trackingRoute.currentPoint ? [trackingRoute.currentPoint] : []),
      ...trackingRoute.pendingPoints
    ];

    const optimizedPositions = optimizeRouteForAntiMeridian(allPoints);

    // Calcular índices para separar las polylines
    const completedIndex = trackingRoute.completedPoints.length;
    const currentIndex = trackingRoute.currentPoint ? completedIndex + 1 : completedIndex;

    return {
      allPoints,
      optimizedPositions,
      completedPositions: optimizedPositions.slice(0, currentIndex),
      pendingPositions: optimizedPositions.slice(Math.max(0, currentIndex - 1)),
      currentPosition: trackingRoute.currentPosition,
      route: trackingRoute.route,
      progress: trackingRoute.progress,
      currentPoint: trackingRoute.currentPoint
    };
  }, [trackingRoute]);

  const defaultCenter: [number, number] = [22.825, 108.293]; // Nanning
  const center = processedData?.optimizedPositions[0] || defaultCenter;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Tracking de Envío</h4>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Cargando tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !processedData) {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Tracking de Envío</h4>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>Error al cargar el tracking</p>
            <p className="text-sm text-gray-500 mt-2">
              Verifica que el endpoint del backend esté disponible
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-900">Tracking de Envío</h4>
        <p className="text-sm text-gray-600">
          Ruta {processedData.route.shippingType === 'aerial' ? 'Aérea' : 'Marítima'}:{' '}
          {processedData.route.origin} → {processedData.route.destination}
        </p>
      </div>

      {/* Panel de información del estado */}
      <div className="p-4 bg-green-50 border-b">
        <h5 className="text-sm font-semibold mb-2">Estado del Envío</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-medium">Posición Actual:</span>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">
              {processedData.currentPoint?.place || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium">Estado:</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {processedData.currentPoint?.status || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium">Progreso:</span> {processedData.progress}%
            <div className="text-xs text-gray-600 mt-1">
              Punto {processedData.currentPosition} de {processedData.route.totalPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="h-96 relative z-0">
        <MapContainer
          center={center}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Línea de ruta completada (verde sólida) */}
          {processedData.completedPositions.length > 1 && (
            <Polyline
              positions={processedData.completedPositions}
              color="#22c55e"
              weight={4}
              opacity={0.9}
            />
          )}

          {/* Línea de ruta pendiente (azul punteada) */}
          {processedData.pendingPositions.length > 1 && (
            <Polyline
              positions={processedData.pendingPositions}
              color="#3b82f6"
              weight={3}
              opacity={0.6}
              dashArray="10, 5"
            />
          )}

          {/* Marcadores para cada punto de tracking */}
          {processedData.allPoints.map((point, index) => {
            const pointStatus = getPointStatus(point, processedData.currentPosition);
            const position = processedData.optimizedPositions[index];

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
                  <div className="text-sm">
                    <div className="font-semibold text-green-600">{point.place}</div>
                    <div className="text-gray-600 mt-1">
                      <div className="font-medium">{point.status}</div>
                      <div className="mt-1">
                        Estado:
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          pointStatus === 'Completado'
                            ? 'bg-green-100 text-green-800'
                            : pointStatus === 'En progreso'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pointStatus}
                        </span>
                      </div>
                      <div className="mt-1">Orden: {point.order}</div>
                      <div className="mt-1">Fase: {getPhaseText(point.phase)}</div>
                      <div className="text-xs mt-1">
                        Coords: {point.coords.lat.toFixed(4)}, {point.coords.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <MapBounds positions={processedData.optimizedPositions} />
        </MapContainer>
      </div>

      {/* Leyenda */}
      <div className="p-4 border-t bg-gray-50">
        <h5 className="font-semibold mb-2 text-sm">Leyenda:</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Completado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>Actual</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
            <span>Pendiente</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-1 bg-green-500 mr-2"></div>
            <span>Recorrido</span>
          </div>
        </div>
      </div>
    </div>
  );
}
