import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Shipment } from '@/api/interface/shipmentInterface';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Coordenadas de las ubicaciones
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  // Aéreas
  'Nanning': [22.8170, 108.3665],
  'Despachado': [22.8170, 108.3665], // Mismo que Nanning
  'Shenzhen': [22.5431, 114.0579],
  'Hong Kong': [22.3193, 114.1694],
  'Korea Seul': [37.5665, 126.9780],
  'Osaka Japon': [34.6937, 135.5023],
  'Alaska': [64.2008, -149.4937],
  'Los Angeles': [34.0522, -118.2437],
  'Chicago': [41.8781, -87.6298],
  'Miami': [25.7617, -80.1918],
  'Bogota': [4.7110, -74.0721],
  'Lima': [-12.0464, -77.0428],
  'Entregado': [-12.0464, -77.0428], // Mismo que Lima
  
  // Marítimas adicionales
  'Guangzhou': [23.1291, 113.2644],
  'Ningbo': [29.8683, 121.5440],
  'Shanghai': [31.2304, 121.4737],
  'Qiangdao': [36.0671, 120.3826],
  'Dalian': [38.9140, 121.6147],
  'Tianjin': [39.0842, 117.2009],
  'Manzanillo, México': [19.0500, -104.3167],
  'Balboa, Panamá': [8.9833, -79.5167],
  'Rodman (PSA Panama)': [8.9833, -79.5167], // Cerca de Balboa
  'Buenaventura, Colombia': [3.8801, -77.0313],
  'Guayaquil Ecuador': [-2.1894, -79.8891],
};

// Puntos intermedios para rutas marítimas (pasando por el Pacífico)
const MARITIME_ROUTE_POINTS: Record<string, [number, number][]> = {
  'Tianjin-Manzanillo': [
    [39.0842, 117.2009], // Tianjin
    [39.0842, 140.0000], // Punto intermedio en el Pacífico (este de Japón)
    [35.0000, 160.0000], // Punto intermedio en el Pacífico central
    [25.0000, 180.0000], // Punto intermedio en el Pacífico (cerca de la línea de fecha)
    [20.0000, -160.0000], // Punto intermedio en el Pacífico (cerca de Hawái)
    [19.0500, -104.3167], // Manzanillo, México
  ],
  'Manzanillo-Balboa': [
    [19.0500, -104.3167], // Manzanillo, México
    [15.0000, -95.0000], // Punto intermedio en el Pacífico
    [10.0000, -85.0000], // Punto intermedio en el Pacífico
    [8.9833, -79.5167], // Balboa, Panamá
  ],
  'Balboa-Buenaventura': [
    [8.9833, -79.5167], // Balboa, Panamá
    [6.0000, -78.0000], // Punto intermedio en el Pacífico
    [3.8801, -77.0313], // Buenaventura, Colombia
  ],
  'Buenaventura-Guayaquil': [
    [3.8801, -77.0313], // Buenaventura, Colombia
    [0.0000, -78.0000], // Punto intermedio en el Pacífico
    [-2.1894, -79.8891], // Guayaquil Ecuador
  ],
  'Guayaquil-Lima': [
    [-2.1894, -79.8891], // Guayaquil Ecuador
    [-7.0000, -78.0000], // Punto intermedio en el Pacífico
    [-12.0464, -77.0428], // Lima
  ]
};

// Iconos personalizados
const createCustomIcon = (color: string, isCurrent: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${isCurrent ? '20px' : '16px'}; 
        height: ${isCurrent ? '20px' : '16px'}; 
        background-color: ${color}; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isCurrent ? '12px' : '10px'};
        color: white;
        font-weight: bold;
      ">
        ${isCurrent ? '📍' : ''}
      </div>
    `,
    iconSize: [isCurrent ? 20 : 16, isCurrent ? 20 : 16],
    iconAnchor: [isCurrent ? 10 : 8, isCurrent ? 10 : 8],
  });
};

interface ShipmentRouteMapProps {
  shipment: Shipment;
  shipmentInfo: any;
}

// Componente para ajustar la vista del mapa
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, positions]);

  return null;
}

// Función para generar puntos de ruta marítima
const generateMaritimeRoute = (locations: Record<string, number>, progress: number) => {
  const locationEntries = Object.entries(locations);
  const routePoints: [number, number][] = [];
  const completedPoints: [number, number][] = [];
  
  for (let i = 0; i < locationEntries.length - 1; i++) {
    const [currentLocation, currentProgress] = locationEntries[i];
    const [nextLocation, nextProgress] = locationEntries[i + 1];
    
    const currentCoords = LOCATION_COORDINATES[currentLocation];
    const nextCoords = LOCATION_COORDINATES[nextLocation];
    
    if (currentCoords && nextCoords) {
      // Agregar punto actual
      routePoints.push(currentCoords);
      if (currentProgress <= progress) {
        completedPoints.push(currentCoords);
      }
      
      // Agregar puntos intermedios para rutas marítimas específicas
      const routeKey = `${currentLocation}-${nextLocation}`;
      if (MARITIME_ROUTE_POINTS[routeKey as keyof typeof MARITIME_ROUTE_POINTS]) {
        const intermediatePoints = MARITIME_ROUTE_POINTS[routeKey as keyof typeof MARITIME_ROUTE_POINTS];
        routePoints.push(...intermediatePoints.slice(1, -1)); // Excluir puntos de inicio y fin
        
        // Determinar cuántos puntos intermedios están completados
        if (currentProgress <= progress && nextProgress > progress) {
          // Ruta parcialmente completada
          const progressRatio = (progress - currentProgress) / (nextProgress - currentProgress);
          const intermediateCount = Math.floor(progressRatio * (intermediatePoints.length - 2));
          completedPoints.push(...intermediatePoints.slice(1, 1 + intermediateCount));
        } else if (nextProgress <= progress) {
          // Ruta completamente completada
          completedPoints.push(...intermediatePoints.slice(1, -1));
        }
      }
    }
  }
  
  // Agregar el último punto
  const lastLocation = locationEntries[locationEntries.length - 1];
  if (lastLocation) {
    const lastCoords = LOCATION_COORDINATES[lastLocation[0]];
    if (lastCoords) {
      routePoints.push(lastCoords);
      if (lastLocation[1] <= progress) {
        completedPoints.push(lastCoords);
      }
    }
  }
  
  return { routePoints, completedPoints };
};

export default function ShipmentRouteMap({ shipment, shipmentInfo }: ShipmentRouteMapProps) {
  const routeData = useMemo(() => {
    const type = shipment.shipping_type;
    const locations = type === 'aerial' ? shipmentInfo?.aerial_locations : shipmentInfo?.maritime_locations;
    
    if (!locations) return { positions: [], completedPositions: [], currentIndex: -1, markers: [] };

    const locationEntries = Object.entries(locations);
    let positions: [number, number][] = [];
    let completedPositions: [number, number][] = [];
    let currentIndex = -1;
    const markers: Array<{ position: [number, number]; name: string; progress: number }> = [];

    if (type === 'maritime') {
      // Usar función especial para rutas marítimas
      const { routePoints, completedPoints } = generateMaritimeRoute(locations, shipment.progress);
      positions = routePoints;
      completedPositions = completedPoints;
      
             // Agregar marcadores solo para las ubicaciones principales
       locationEntries.forEach(([location, progress], index) => {
         const coords = LOCATION_COORDINATES[location];
         if (coords) {
           markers.push({ position: coords, name: location, progress: Number(progress) });
           if (location === shipment.current_location) {
             currentIndex = index;
           }
         }
       });
    } else {
             // Ruta aérea simple
       locationEntries.forEach(([location, progress], index) => {
         const coords = LOCATION_COORDINATES[location];
         if (coords) {
           positions.push(coords);
           const progressNum = Number(progress);
           markers.push({ position: coords, name: location, progress: progressNum });
           
           if (progressNum <= shipment.progress) {
             completedPositions.push(coords);
           }
           
           if (location === shipment.current_location) {
             currentIndex = index;
           }
         }
       });
    }

    return { positions, completedPositions, currentIndex, markers };
  }, [shipment, shipmentInfo]);

  const { positions, completedPositions, currentIndex, markers } = routeData;

  if (positions.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">No se pudo cargar la ruta del envío</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-900">Ruta del Envío</h4>
        <p className="text-sm text-gray-600">
          Progreso: {shipment.progress}% - Ubicación actual: {shipment.current_location}
        </p>
      </div>
      
      <div className="h-96 relative">
        <MapContainer
          center={positions[0] || [0, 0]}
          zoom={3}
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
          
          {/* Línea de ruta completa */}
          <Polyline
            positions={positions}
            color="#e5e7eb"
            weight={3}
            opacity={0.5}
          />
          
          {/* Línea de ruta completada */}
          {completedPositions.length > 1 && (
            <Polyline
              positions={completedPositions}
              color="#3b82f6"
              weight={4}
              opacity={0.8}
            />
          )}
          
          {/* Marcadores de ubicaciones principales */}
          {markers.map((marker, index) => {
            const isCompleted = marker.progress <= shipment.progress;
            const isCurrent = marker.name === shipment.current_location;
            
            let color = '#9ca3af'; // Gris para no completadas
            if (isCurrent) {
              color = '#ef4444'; // Rojo para ubicación actual
            } else if (isCompleted) {
              color = '#10b981'; // Verde para completadas
            }
            
            return (
              <Marker
                key={`${marker.name}-${index}`}
                position={marker.position}
                icon={createCustomIcon(color, isCurrent)}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{marker.name}</div>
                    <div className="text-sm text-gray-600">
                      {isCurrent ? 'Ubicación actual' : isCompleted ? 'Completada' : 'Pendiente'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Progreso: {marker.progress}%
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          <MapBounds positions={positions} />
        </MapContainer>
      </div>
      
      {/* Leyenda */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Completada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Ubicación actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
} 