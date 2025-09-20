import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Marker as LeafletMarker, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TrackingStatus } from '@/api/shipments';
import { useQuery } from '@tanstack/react-query';
import { getTrackingStatuses } from '@/api/shipments';

// Función para convertir coordenadas DMS a decimal
const parseCoordinates = (coordString: string): [number, number] | null => {
  try {
    // Ejemplo: "22°49'30.2\"N 108°17'36.4\"E"
    const parts = coordString.trim().split(' ');
    if (parts.length !== 2) return null;

    const parseDMS = (dmsStr: string): number => {
      const matches = dmsStr.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/);
      if (!matches) return 0;

      const [, degrees, minutes, seconds, direction] = matches;
      let decimal = parseInt(degrees) + parseInt(minutes) / 60 + parseFloat(seconds) / 3600;

      if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
      }

      return decimal;
    };

    const lat = parseDMS(parts[0]);
    const lng = parseDMS(parts[1]);

    return [lat, lng];
  } catch (error) {
    console.error('Error parsing coordinates:', coordString, error);
    return null;
  }
};

// Crear iconos personalizados basados en el dashboard
const createCustomIcon = (type: string, color: string, order: number) => {
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

// Función para mapear estado de producto a orden de tracking
const getTrackingOrderFromProductStatus = (productStatus: string): number => {
  switch (productStatus.toLowerCase()) {
    case 'pending': return 1;
    case 'in_inspection': return 2;
    case 'awaiting_pickup': return 3;
    case 'in_transit': return 4; // Los estados 4, 5, 6 son todos in_transit
    case 'dispatched': return 7;
    default: return 1;
  }
};

// Función para obtener el color del icono según el progreso actual
const getIconColor = (trackingOrder: number, currentProgress: number) => {
  if (trackingOrder <= currentProgress) return '#22c55e'; // Verde - completado
  if (trackingOrder === currentProgress + 1) return '#f59e0b'; // Naranja - actual/siguiente
  return '#6b7280'; // Gris - pendiente
};

// Función para obtener el estado del punto basado en el progreso actual
const getPointStatus = (trackingOrder: number, currentProgress: number) => {
  if (trackingOrder <= currentProgress) return 'Completado';
  if (trackingOrder === currentProgress + 1) return 'En progreso';
  return 'Pendiente';
};

// Componente para ajustar la vista del mapa
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  React.useEffect(() => {
    if (positions.length > 0) {
      // Si todas las coordenadas son las mismas (Shenzhen), hacer zoom a esa ubicación
      const allSame = positions.every(pos =>
        pos[0] === positions[0][0] && pos[1] === positions[0][1]
      );

      if (allSame) {
        map.setView(positions[0], 12);
      } else {
        const bounds = positions.reduce((acc, pos) => acc.extend(pos), map.getBounds());
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, positions]);

  return null;
}

interface InspectionTrackingMapProps {
  className?: string;
  inspectionData?: any; // Los datos de la inspección con productos
}

export default function InspectionTrackingMap({ className, inspectionData }: InspectionTrackingMapProps) {
  const { data: trackingStatuses, isLoading, error } = useQuery({
    queryKey: ['trackingStatuses'],
    queryFn: getTrackingStatuses,
  });

  // Calcular el progreso actual basado en el producto más avanzado
  const currentProgress = useMemo(() => {
    if (!inspectionData?.content || !Array.isArray(inspectionData.content)) {
      return 1; // Default a pending si no hay datos
    }

    // Encontrar el producto con el estado más avanzado
    const maxTrackingOrder = inspectionData.content.reduce((max: number, product: any) => {
      const trackingOrder = getTrackingOrderFromProductStatus(product.status);
      return Math.max(max, trackingOrder);
    }, 1);

    return maxTrackingOrder;
  }, [inspectionData]);

  // Obtener información del estado actual
  const currentStatusInfo = useMemo(() => {
    if (!inspectionData?.content || !Array.isArray(inspectionData.content)) {
      return { status: 'Pendiente', count: 0, total: 0 };
    }

    const products = inspectionData.content;
    const total = products.length;

    // Contar productos por estado
    const statusCounts = products.reduce((acc: any, product: any) => {
      const status = product.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Encontrar el estado más avanzado y su información
    const statusPriority = ['dispatched', 'in_transit', 'awaiting_pickup', 'in_inspection', 'pending'];
    const currentStatus = statusPriority.find(status => statusCounts[status] > 0) || 'pending';

    return {
      status: currentStatus,
      count: statusCounts[currentStatus] || 0,
      total,
      statusCounts
    };
  }, [inspectionData]);

  // Procesar solo los primeros 7 estados como se solicita
  const processedData = useMemo(() => {
    if (!trackingStatuses) return { positions: [], trackingPoints: [] };

    const first7Statuses = trackingStatuses.slice(0, 7);
    const trackingPoints = first7Statuses.map(status => {
      const coordinates = parseCoordinates(status.coords);
      return {
        ...status,
        coordinates,
        lat: coordinates?.[0] || 0,
        lng: coordinates?.[1] || 0,
      };
    }).filter(point => point.coordinates !== null);

    const positions = trackingPoints.map(point => point.coordinates!) as [number, number][];

    return { positions, trackingPoints };
  }, [trackingStatuses]);

  // Centro del mapa predeterminado (Shenzhen)
  const defaultCenter: [number, number] = [22.8231, 108.2956];
  const center = processedData.positions.length > 0 ? processedData.positions[0] : defaultCenter;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
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
      <div className={`bg-white rounded-lg border ${className}`}>
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Tracking de Inspección</h4>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>Error al cargar el tracking</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-900">Tracking de Inspección</h4>
        <p className="text-sm text-gray-600">
          Estados del proceso de inspección en Shenzhen
        </p>
      </div>

      {/* Información del tracking */}
      <div className="p-4 bg-blue-50 border-b">
        <h5 className="text-sm font-semibold mb-2">Información del Estado</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-medium">Estado Actual:</span>
            <span className={`ml-2 px-2 py-1 rounded ${
              currentStatusInfo.status === 'dispatched' ? 'bg-green-100 text-green-800' :
              currentStatusInfo.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
              currentStatusInfo.status === 'awaiting_pickup' ? 'bg-orange-100 text-orange-800' :
              currentStatusInfo.status === 'in_inspection' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentStatusInfo.status === 'pending' ? 'Pendiente' :
               currentStatusInfo.status === 'in_inspection' ? 'En Inspección' :
               currentStatusInfo.status === 'awaiting_pickup' ? 'Esperando Recogida' :
               currentStatusInfo.status === 'in_transit' ? 'En Tránsito' :
               currentStatusInfo.status === 'dispatched' ? 'Despachado' :
               currentStatusInfo.status}
            </span>
          </div>
          <div>
            <span className="font-medium">Ubicación:</span> Shenzhen, China
          </div>
          <div>
            <span className="font-medium">Progreso:</span> {currentProgress}/7 estados completados
            {inspectionData?.content && (
              <div className="text-xs text-gray-600 mt-1">
                {currentStatusInfo.count}/{currentStatusInfo.total} productos en estado actual
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-96 relative">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
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

          {/* Línea azul que conecta todos los puntos (si hay múltiples ubicaciones) */}
          {processedData.positions.length > 1 && (
            <Polyline
              positions={processedData.positions}
              color="#3b82f6"
              weight={4}
              opacity={0.8}
              dashArray="10, 5"
            />
          )}

          {/* Marcadores para cada estado de tracking */}
          {processedData.trackingPoints.map((point, index) => {
            const pointStatus = getPointStatus(point.order, currentProgress);
            return (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={createCustomIcon(
                  point.shipmentStatus,
                  getIconColor(point.order, currentProgress),
                  point.order
                )}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold text-blue-600">{point.place}</div>
                    <div className="text-gray-600 mt-1">
                      <div className="font-medium">{point.status}</div>
                      <div className="mt-1">Estado:
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          pointStatus === 'Completado' ? 'bg-green-100 text-green-800' :
                          pointStatus === 'En progreso' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pointStatus}
                        </span>
                      </div>
                      <div className="mt-1">Orden: {point.order}</div>
                      <div>Ubicación: {point.currentLocation}</div>
                      <div className="text-xs">Coordenadas: {point.lat.toFixed(4)}, {point.lng.toFixed(4)}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <MapBounds positions={processedData.positions} />
        </MapContainer>
      </div>

      {/* Leyenda */}
      <div className="p-4 border-t bg-gray-50">
        <h5 className="font-semibold mb-2 text-sm">Leyenda:</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Estado Completado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>Estado Actual</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
            <span>Estado Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
}