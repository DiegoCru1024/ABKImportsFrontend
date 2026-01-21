import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGetInspectionTrackingRoute } from '@/hooks/use-shipments';
import type { InspectionRoutePoint } from '@/api/interface/shipmentInterface';

const createCustomIcon = (color: string, order: number) => {
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
    popupAnchor: [0, -12]
  });
};

const getIconColor = (
  point: InspectionRoutePoint,
  currentPosition: number
): string => {
  if (point.order < currentPosition) return '#22c55e';
  if (point.order === currentPosition) return '#f59e0b';
  return '#6b7280';
};

const getPointStatusText = (
  point: InspectionRoutePoint,
  currentPosition: number
): string => {
  if (point.order < currentPosition) return 'Completado';
  if (point.order === currentPosition) return 'En progreso';
  return 'Pendiente';
};

const getPhaseLabel = (phase: string): string => {
  switch (phase) {
    case 'first_mile':
      return 'Primera Milla';
    case 'customs':
      return 'Aduana';
    default:
      return phase;
  }
};

function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  React.useEffect(() => {
    if (positions.length === 0) return;

    const uniquePositions = positions.filter(
      (pos, index, self) =>
        index === self.findIndex(p => p[0] === pos[0] && p[1] === pos[1])
    );

    if (uniquePositions.length === 1) {
      map.setView(uniquePositions[0], 10);
    } else if (uniquePositions.length > 1) {
      const latLngs = uniquePositions.map(pos => ({ lat: pos[0], lng: pos[1] }));
      const bounds = latLngs.reduce(
        (acc, pos) => ({
          minLat: Math.min(acc.minLat, pos.lat),
          maxLat: Math.max(acc.maxLat, pos.lat),
          minLng: Math.min(acc.minLng, pos.lng),
          maxLng: Math.max(acc.maxLng, pos.lng),
        }),
        { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
      );
      map.fitBounds([
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng],
      ], { padding: [50, 50] });
    }
  }, [map, positions]);

  return null;
}

interface InspectionTrackingMapProps {
  className?: string;
  inspectionId: string;
}

export default function InspectionTrackingMap({
  className,
  inspectionId,
}: InspectionTrackingMapProps) {
  const {
    data: trackingData,
    isLoading,
    error,
  } = useGetInspectionTrackingRoute(inspectionId);

  // Solo mostrar puntos completados + punto actual (sin pendientes)
  const visiblePoints = useMemo(() => {
    if (!trackingData) return [];
    const points = [
      ...trackingData.completedPoints,
      ...(trackingData.currentPoint ? [trackingData.currentPoint] : []),
    ];
    return points.sort((a, b) => a.order - b.order);
  }, [trackingData]);

  // Posiciones para la polyline de trazabilidad (solo puntos visitados)
  const tracePositions = useMemo((): [number, number][] => {
    return visiblePoints.map(p => [p.coords.lat, p.coords.lng]);
  }, [visiblePoints]);

  const defaultCenter: [number, number] = [22.825, 108.293];
  const center = tracePositions.length > 0 ? tracePositions[0] : defaultCenter;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border h-full ${className}`}>
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Tracking de Inspección</h4>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Cargando tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border h-full ${className}`}>
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Tracking de Inspección</h4>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>Error al cargar el tracking</p>
            <p className="text-sm text-gray-500 mt-1">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className={`bg-white rounded-lg border h-full ${className}`}>
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Tracking de Inspección</h4>
        </div>
        <div className="h-96 flex items-center justify-center">
          <p className="text-sm text-gray-500">No hay datos de tracking disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border h-full ${className}`}
      style={{ position: 'relative', zIndex: 0 }}
    >
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-900">Tracking de Inspección</h4>
        <p className="text-sm text-gray-600">
          {trackingData.route.origin} → {trackingData.route.destination}
        </p>
      </div>

      <div className="p-4 bg-blue-50 border-b">
        <h5 className="text-sm font-semibold mb-2">Información del Estado</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-medium">Estado Actual:</span>
            <span className="ml-2 px-2 py-1 rounded bg-orange-100 text-orange-800">
              {trackingData.currentPoint?.status || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium">Ubicación:</span>{' '}
            {trackingData.currentPoint?.place || trackingData.route.origin}
          </div>
          <div>
            <span className="font-medium">Progreso:</span>{' '}
            {trackingData.currentPosition}/{trackingData.route.totalPoints} puntos
            <span className="ml-2 text-blue-600">({trackingData.progress}%)</span>
          </div>
        </div>
      </div>

      <div className="h-80 relative" style={{ zIndex: 0 }}>
        <MapContainer
          center={center}
          zoom={8}
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

          {/* Polyline de trazabilidad - solo puntos visitados */}
          {tracePositions.length > 1 && (
            <Polyline
              positions={tracePositions}
              color="#22c55e"
              weight={4}
              opacity={0.9}
            />
          )}

          {/* Marcadores solo para puntos completados y actual */}
          {visiblePoints.map((point) => (
            <Marker
              key={point.order}
              position={[point.coords.lat, point.coords.lng]}
              icon={createCustomIcon(
                getIconColor(point, trackingData.currentPosition),
                point.order
              )}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <div className="font-semibold text-blue-600">{point.place}</div>
                  <div className="text-gray-600 mt-1">
                    <div className="font-medium">{point.status}</div>
                    <div className="mt-1">
                      Estado:
                      <span
                        className={`ml-1 px-2 py-1 rounded text-xs ${
                          point.order < trackingData.currentPosition
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {getPointStatusText(point, trackingData.currentPosition)}
                      </span>
                    </div>
                    <div className="mt-1">Fase: {getPhaseLabel(point.phase)}</div>
                    <div>Punto: {point.order} de {trackingData.route.totalPoints}</div>
                    {point.isOptional && (
                      <div className="text-orange-600 text-xs mt-1">(Opcional)</div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          <MapBounds positions={tracePositions} />
        </MapContainer>
      </div>

      <div className="p-4 border-t bg-gray-50">
        <h5 className="font-semibold mb-2 text-sm">Leyenda:</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Completado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>En Progreso</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-green-500 mr-2"></div>
            <span>Trazabilidad</span>
          </div>
        </div>
      </div>
    </div>
  );
}
