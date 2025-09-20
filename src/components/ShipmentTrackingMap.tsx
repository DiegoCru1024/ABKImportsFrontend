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

// Función para mapear current_location a progreso basado en aerial_locations
const getProgressFromLocation = (currentLocation: string): number => {
  // Mapeo basado en aerial_locations del endpoint /info
  const locationProgressMap: Record<string, number> = {
    'Nanning': 5,
    'Despachado': 10,
    'Shenzhen': 15,
    'Hong Kong': 20,
    'Korea Seul': 25,
    'Osaka Japon': 30,
    'Alaska': 45,
    'Los Angeles': 55,
    'Chicago': 65,
    'Miami': 70,
    'Bogota': 80,
    'Lima': 90,
    'Entregado': 100
  };

  return locationProgressMap[currentLocation] || 0; // Default a 0 si no se encuentra
};

// Función para mapear progreso a orden de tracking aproximado
const getTrackingOrderFromProgress = (progress: number): number => {
  // Mapear el progreso a órdenes de tracking aproximados para determinar estado actual
  if (progress >= 100) return 46; // Entregado
  if (progress >= 90) return 44; // Lima (órdenes 32-45)
  if (progress >= 80) return 31; // Bogota (órdenes 29-31)
  if (progress >= 70) return 28; // Miami (órdenes 25-28)
  if (progress >= 65) return 24; // Chicago (órdenes 22-24)
  if (progress >= 55) return 21; // Los Angeles (órdenes 20-21)
  if (progress >= 45) return 19; // Alaska (órdenes 18-19)
  if (progress >= 30) return 17; // Osaka Japon (órdenes 16-17)
  if (progress >= 25) return 15; // Korea Seul (orden 15)
  if (progress >= 20) return 14; // Hong Kong (orden 14)
  if (progress >= 15) return 13; // Shenzhen (órdenes 8-13)
  if (progress >= 10) return 7;  // Despachado (órdenes 4-7)
  if (progress >= 5) return 3;   // Nanning (órdenes 1-3)
  return 1; // Default
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

interface ShipmentTrackingMapProps {
  className?: string;
  shipmentData?: any; // Los datos del envío con current_location
}

export default function ShipmentTrackingMap({ className, shipmentData }: ShipmentTrackingMapProps) {
  const { data: trackingStatuses, isLoading, error } = useQuery({
    queryKey: ['trackingStatuses'],
    queryFn: getTrackingStatuses,
  });

  // Calcular el progreso actual basado en current_location del shipment
  const { currentProgressPercentage, currentTrackingOrder } = useMemo(() => {
    if (!shipmentData?.current_location) {
      return { currentProgressPercentage: 0, currentTrackingOrder: 8 };
    }

    const progressPercentage = getProgressFromLocation(shipmentData.current_location);
    const trackingOrder = getTrackingOrderFromProgress(progressPercentage);

    return {
      currentProgressPercentage: progressPercentage,
      currentTrackingOrder: trackingOrder
    };
  }, [shipmentData]);

  // Obtener información del estado actual del shipment
  const currentStatusInfo = useMemo(() => {
    if (!shipmentData) {
      return { location: 'Desconocida', status: 'Pendiente', progress: 0 };
    }

    return {
      location: shipmentData.current_location || 'Desconocida',
      status: shipmentData.status || 'Pendiente',
      progress: currentProgressPercentage
    };
  }, [shipmentData, currentProgressPercentage]);

  // Procesar los estados desde el orden 8 en adelante
  const processedData = useMemo(() => {
    if (!trackingStatuses) return { positions: [], trackingPoints: [] };

    // Filtrar desde orden 8 en adelante
    const shipmentStatuses = trackingStatuses.filter(status => status.order >= 8);
    const trackingPoints = shipmentStatuses.map(status => {
      const coordinates = parseCoordinates(status.coords);
      return {
        ...status,
        coordinates,
        lat: coordinates?.[0] || 0,
        lng: coordinates?.[1] || 0,
      };
    }).filter(point => point.coordinates !== null);

    // Crear ruta con puntos intermedios para rutas transpacíficas
    const createPacificRoute = (points: [number, number][]): [number, number][] => {
      const routePoints: [number, number][] = [];

      for (let i = 0; i < points.length; i++) {
        routePoints.push(points[i]);

        // Si hay un siguiente punto, verificar si necesitamos puntos intermedios
        if (i < points.length - 1) {
          const current = points[i];
          const next = points[i + 1];

          const lngDiff = Math.abs(next[1] - current[1]);

          // Si la diferencia de longitud es mayor a 180°, agregar puntos intermedios por el Pacífico
          if (lngDiff > 180) {
            // Determinar si vamos de Asia a América (Este a Oeste por el Pacífico)
            if (current[1] > 0 && next[1] < 0) {
              // Asia (positivo) a América (negativo) - ruta por el Pacífico Este
              routePoints.push(
                [current[0], 180],  // Línea de fecha internacional (este)
                [next[0], -180]     // Línea de fecha internacional (oeste)
              );
            }
            // América a Asia (Oeste a Este por el Pacífico)
            else if (current[1] < 0 && next[1] > 0) {
              routePoints.push(
                [current[0], -180], // Línea de fecha internacional (oeste)
                [next[0], 180]      // Línea de fecha internacional (este)
              );
            }
          }
        }
      }

      return routePoints;
    };

    const positions = createPacificRoute(trackingPoints.map(point => point.coordinates!) as [number, number][]);

    return { positions, trackingPoints };
  }, [trackingStatuses]);

  // Centro del mapa predeterminado (Shenzhen)
  const defaultCenter: [number, number] = [22.8231, 108.2956];
  const center = processedData.positions.length > 0 ? processedData.positions[0] : defaultCenter;

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

  if (error) {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Tracking de Envío</h4>
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
        <h4 className="font-medium text-gray-900">Tracking de Envío</h4>
        <p className="text-sm text-gray-600">
          Estados del proceso de envío desde Shenzhen
        </p>
      </div>

      {/* Información del tracking */}
      <div className="p-4 bg-green-50 border-b">
        <h5 className="text-sm font-semibold mb-2">Información del Estado</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-medium">Ubicación Actual:</span>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">
              {currentStatusInfo.location}
            </span>
          </div>
          <div>
            <span className="font-medium">Estado:</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {currentStatusInfo.status}
            </span>
          </div>
          <div>
            <span className="font-medium">Progreso:</span> {currentStatusInfo.progress}%
            <div className="text-xs text-gray-600 mt-1">
              Orden actual: {currentTrackingOrder}
            </div>
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
            const pointStatus = getPointStatus(point.order, currentTrackingOrder);
            return (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={createCustomIcon(
                  point.shipmentStatus,
                  getIconColor(point.order, currentTrackingOrder),
                  point.order
                )}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold text-green-600">{point.place}</div>
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