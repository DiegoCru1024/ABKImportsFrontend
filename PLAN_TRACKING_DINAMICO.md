# Plan: Sistema de Tracking Dinámico para Shipments

## Resumen

Implementar un sistema de tracking que muestre en el mapa la trazabilidad completa del paquete, donde el administrador actualiza manualmente el estado y el mapa refleja: punto de inicio, punto actual, y camino recorrido. Soportar rutas aéreas (definidas) y marítimas (futuro).

---

## Decisión de Arquitectura

**Respuesta a tu pregunta: ¿Frontend o Backend?**

**Recomendación: BACKEND** envía la ruta completa con el estado actual marcado.

| Aspecto | Backend envía todo | Frontend tiene rutas |
|---------|-------------------|---------------------|
| Mantenibilidad | Cambios centralizados | Requiere sync FE/BE |
| Escalabilidad | Fácil agregar rutas | Requiere deploy FE |
| Consistencia | Garantizada | Riesgo de desync |
| Una sola fuente de verdad | ✅ | ❌ |

---

## Arquitectura Propuesta

### 1. Backend (NestJS)

#### 1.1 Estructura de Almacenamiento

Almacenar rutas como **constantes TypeScript** en el backend (no BD):

```
backend/src/shipments/
├── data/
│   └── routes/
│       ├── aerial-routes.ts      # Rutas aéreas (Shenzhen, Hong Kong)
│       ├── maritime-routes.ts    # Rutas marítimas (futuro)
│       └── index.ts
```

#### 1.2 Nuevo Endpoint

```
GET /shipments/:id/tracking/route
```

**Response:**
```json
{
  "route": {
    "id": "aerial_shenzhen",
    "shippingType": "aerial",
    "origin": "Shenzhen",
    "destination": "Lima",
    "totalPoints": 45
  },
  "currentPosition": 21,
  "progress": 55,
  "completedPoints": [...],
  "currentPoint": {...},
  "pendingPoints": [...]
}
```

#### 1.3 Interfaces Backend

```typescript
// route-points.interface.ts
export interface RoutePoint {
  order: number;
  place: string;
  status: string;
  coords: {
    lat: number;
    lng: number;
  };
  phase: 'first_mile' | 'transit' | 'customs' | 'last_mile';
  isOptional?: boolean;
}

export interface RouteDefinition {
  id: string;
  shippingType: 'aerial' | 'maritime';
  origin: string;
  destination: string;
  totalPoints: number;
  points: RoutePoint[];
}

export interface TrackingRouteResponse {
  route: Omit<RouteDefinition, 'points'>;
  currentPosition: number;
  progress: number;
  completedPoints: RoutePoint[];
  currentPoint: RoutePoint | null;
  pendingPoints: RoutePoint[];
}
```

#### 1.4 Servicio Backend

```typescript
// shipments.service.ts
import { AERIAL_ROUTES } from './data/routes/aerial-routes';
import { MARITIME_ROUTES } from './data/routes/maritime-routes';

const ALL_ROUTES = { ...AERIAL_ROUTES, ...MARITIME_ROUTES };

async getTrackingRoute(shipmentId: string): Promise<TrackingRouteResponse> {
  const shipment = await this.findById(shipmentId);

  // Determinar ruta basada en shipping_type y origin
  const routeId = this.determineRouteId(shipment.shipping_type, shipment.origin);
  const routeDefinition = ALL_ROUTES[routeId];

  if (!routeDefinition) {
    throw new NotFoundException(`Ruta no encontrada para ${shipment.shipping_type}/${shipment.origin}`);
  }

  // Encontrar posición actual basada en current_location
  const currentPosition = this.findPositionByLocation(
    routeDefinition.points,
    shipment.current_location
  );

  const { points, ...routeInfo } = routeDefinition;

  return {
    route: routeInfo,
    currentPosition,
    progress: shipment.progress,
    completedPoints: points.filter(p => p.order < currentPosition),
    currentPoint: points.find(p => p.order === currentPosition) || null,
    pendingPoints: points.filter(p => p.order > currentPosition),
  };
}

private determineRouteId(shippingType: string, origin: string): string {
  // Normalizar origen a ID de ruta
  const originMap: Record<string, string> = {
    'Nanning': 'shenzhen',
    'Shenzhen': 'shenzhen',
    'Hong Kong': 'hongkong',
    'Tianjin': 'tianjin',
    'Shanghai': 'shanghai',
  };

  const normalizedOrigin = originMap[origin] || 'shenzhen';
  return `${shippingType}_${normalizedOrigin}`;
}

private findPositionByLocation(points: RoutePoint[], currentLocation: string): number {
  // Mapeo de ubicaciones a órdenes aproximados
  const locationOrderMap: Record<string, number> = {
    'Nanning': 3,
    'Despachado': 7,
    'Shenzhen': 13,
    'Hong Kong': 14,
    'Korea Seul': 15,
    'Osaka Japon': 17,
    'Alaska': 19,
    'Los Angeles': 21,
    'Chicago': 24,
    'Miami': 28,
    'Bogota': 31,
    'Lima': 34,
    'Entregado': 45,
  };

  return locationOrderMap[currentLocation] || 1;
}
```

#### 1.5 Controller Backend

```typescript
// shipments.controller.ts
@Get(':id/tracking/route')
async getTrackingRoute(@Param('id') id: string): Promise<TrackingRouteResponse> {
  return this.shipmentsService.getTrackingRoute(id);
}
```

#### 1.6 Definición de Ruta Aérea Shenzhen

```typescript
// data/routes/aerial-routes.ts
import { RouteDefinition } from '../interfaces/route-points.interface';

export const AERIAL_ROUTES: Record<string, RouteDefinition> = {
  'aerial_shenzhen': {
    id: 'aerial_shenzhen',
    shippingType: 'aerial',
    origin: 'Shenzhen',
    destination: 'Lima',
    totalPoints: 45,
    points: [
      // FASE 1: FIRST MILE (Almacén → Aeropuerto)
      { order: 1, place: 'ALMACEN', status: 'PENDIENTE LLEGADA DE PRODUCTO', coords: { lat: 22.825, lng: 108.293 }, phase: 'first_mile' },
      { order: 2, place: 'ALMACEN', status: 'PROCESO DE INSPECCION', coords: { lat: 22.825, lng: 108.293 }, phase: 'first_mile' },
      { order: 3, place: 'ALMACEN', status: 'PENDIENTE DE RECOJO', coords: { lat: 22.825, lng: 108.293 }, phase: 'first_mile' },
      { order: 4, place: 'VEHICULO 0%', status: 'EN CAMINO AL SHENZHEN', coords: { lat: 22.823, lng: 108.688 }, phase: 'first_mile' },
      { order: 5, place: 'VEHICULO 50%', status: 'EN CAMINO AL SHENZHEN', coords: { lat: 22.636, lng: 110.163 }, phase: 'first_mile' },
      { order: 6, place: 'VEHICULO 75%', status: 'EN CAMINO AL SHENZHEN', coords: { lat: 23.109, lng: 113.249 }, phase: 'first_mile' },
      { order: 7, place: 'VEHICULO 100%', status: 'LLEGO AEROPUERTO SZX', coords: { lat: 22.651, lng: 113.812 }, phase: 'first_mile' },

      // FASE 2: CUSTOMS ORIGEN (Aduana China)
      { order: 8, place: 'AEROPUERTO', status: 'ENTRO INSPECCION ADUANA', coords: { lat: 22.651, lng: 113.812 }, phase: 'customs' },
      { order: 9, place: 'AEROPUERTO', status: 'ESPERA LIBERACION ADUANAL', coords: { lat: 22.651, lng: 113.812 }, phase: 'customs' },
      { order: 10, place: 'AEROPUERTO', status: 'RETRASO EN LA LIBERACION', coords: { lat: 22.651, lng: 113.812 }, phase: 'customs', isOptional: true },
      { order: 11, place: 'AEROPUERTO', status: 'LIBERACION APROBADA', coords: { lat: 22.651, lng: 113.812 }, phase: 'customs' },
      { order: 12, place: 'AEROPUERTO', status: 'ESPERA DE EMBARQUE', coords: { lat: 22.651, lng: 113.812 }, phase: 'customs' },
      { order: 13, place: 'AEROPUERTO', status: 'EMBARQUE CONFIRMADO', coords: { lat: 22.651, lng: 113.812 }, phase: 'customs' },

      // FASE 3: TRANSIT (Tránsito Internacional)
      { order: 14, place: 'PUNTO 1 / EN EL MAR', status: 'EN TRANSITO', coords: { lat: 22.494, lng: 117.181 }, phase: 'transit' },
      { order: 15, place: 'PUNTO 2 / TAIWAN PORT', status: 'EN TRANSITO', coords: { lat: 25.076, lng: 121.229 }, phase: 'transit' },
      { order: 16, place: 'PUNTO 3 / EN EL MAR', status: 'EN TRANSITO', coords: { lat: 30.714, lng: 133.362 }, phase: 'transit' },
      { order: 17, place: 'PUNTO 4 / OSAKA', status: 'EN TRANSITO', coords: { lat: 34.792, lng: 135.439 }, phase: 'transit' },
      { order: 18, place: 'PUNTO 5 / EN EL MAR', status: 'EN TRANSITO', coords: { lat: 49.877, lng: 174.005 }, phase: 'transit' },
      { order: 19, place: 'PUNTO 6 / ALASKA ANCHOR', status: 'EN TRANSITO', coords: { lat: 61.179, lng: -150.041 }, phase: 'transit' },
      { order: 20, place: 'PUNTO 7 / EN CONTI', status: 'EN TRANSITO', coords: { lat: 50.402, lng: -127.870 }, phase: 'transit' },
      { order: 21, place: 'PUNTO 8 / LOS ANGELES', status: 'EN TRANSITO', coords: { lat: 33.943, lng: -118.411 }, phase: 'transit' },
      { order: 22, place: 'PUNTO 9 / EN EL CONTI', status: 'EN TRANSITO', coords: { lat: 37.209, lng: -108.045 }, phase: 'transit' },
      { order: 23, place: 'PUNTO 10 / EN EL CONTI', status: 'EN TRANSITO', coords: { lat: 40.566, lng: -92.886 }, phase: 'transit' },
      { order: 24, place: 'PUNTO 11 / CHICAGO PORT', status: 'EN TRANSITO', coords: { lat: 41.984, lng: -87.917 }, phase: 'transit' },
      { order: 25, place: 'PUNTO 12 / EN EL CONTI', status: 'EN TRANSITO', coords: { lat: 38.854, lng: -88.524 }, phase: 'transit' },
      { order: 26, place: 'PUNTO 13 / MEMPHIS PORT', status: 'EN TRANSITO', coords: { lat: 35.046, lng: -89.976 }, phase: 'transit' },
      { order: 27, place: 'PUNTO 14 / EN EL CONTI', status: 'EN TRANSITO', coords: { lat: 31.723, lng: -85.050 }, phase: 'transit' },
      { order: 28, place: 'PUNTO 15 / MIAMI PORT', status: 'EN TRANSITO', coords: { lat: 25.793, lng: -80.279 }, phase: 'transit' },
      { order: 29, place: 'PUNTO 16 / EN EL MAR', status: 'EN TRANSITO', coords: { lat: 15.649, lng: -77.666 }, phase: 'transit' },
      { order: 30, place: 'PUNTO 17 / EN EL CONTI', status: 'EN TRANSITO', coords: { lat: 6.816, lng: -69.994 }, phase: 'transit' },
      { order: 31, place: 'PUNTO 18 / BOGOTA COL', status: 'EN TRANSITO', coords: { lat: 4.700, lng: -74.138 }, phase: 'transit' },
      { order: 32, place: 'PUNTO 19 / EN EL CONTI', status: 'EN TRANSITO', coords: { lat: -1.941, lng: -76.480 }, phase: 'transit' },
      { order: 33, place: 'PUNTO 20 / EN EL CONTI', status: 'EN TRANSITO', coords: { lat: -10.143, lng: -77.703 }, phase: 'transit' },
      { order: 34, place: 'PUNTO 21 / LIMA AEROPUERTO', status: 'EN TRANSITO', coords: { lat: -12.025, lng: -77.124 }, phase: 'transit' },

      // FASE 4: CUSTOMS DESTINO (Aduana Perú)
      { order: 35, place: 'AEROPUERTO', status: 'ENTRO INSPECCION ADUANA', coords: { lat: -12.028, lng: -77.104 }, phase: 'customs' },
      { order: 36, place: 'AEROPUERTO', status: 'ESPERA LIBERACION ADUANAL', coords: { lat: -12.028, lng: -77.104 }, phase: 'customs' },
      { order: 37, place: 'AEROPUERTO', status: 'RETRASO EN LA LIBERACION', coords: { lat: -12.028, lng: -77.104 }, phase: 'customs', isOptional: true },
      { order: 38, place: 'AEROPUERTO', status: 'LIBERACION APROBADA', coords: { lat: -12.028, lng: -77.104 }, phase: 'customs' },

      // FASE 5: LAST MILE (Aeropuerto → Almacén ABK)
      { order: 39, place: 'ALMACEN AEREOLINEA', status: 'PENDIENTE DE RECOJO', coords: { lat: -12.028, lng: -77.104 }, phase: 'last_mile' },
      { order: 40, place: 'VEHICULO 0%', status: 'VEHICULO DE ABK', coords: { lat: -12.028, lng: -77.104 }, phase: 'last_mile' },
      { order: 41, place: 'VEHICULO 50%', status: 'VEHICULO DE ABK', coords: { lat: -12.041, lng: -77.035 }, phase: 'last_mile' },
      { order: 42, place: 'VEHICULO 100%', status: 'VEHICULO DE ABK', coords: { lat: -12.065, lng: -76.999 }, phase: 'last_mile' },
      { order: 43, place: 'ALMACEN ABK', status: 'PROCESO DE INSPECCION', coords: { lat: -12.065, lng: -76.999 }, phase: 'last_mile' },
      { order: 44, place: 'ALMACEN ABK', status: 'LISTO PARA LA ENTREGA', coords: { lat: -12.065, lng: -76.999 }, phase: 'last_mile' },
      { order: 45, place: 'ALMACEN ABK', status: 'ENTREGADO', coords: { lat: -12.065, lng: -76.999 }, phase: 'last_mile' },
    ]
  },

  'aerial_hongkong': {
    id: 'aerial_hongkong',
    shippingType: 'aerial',
    origin: 'Hong Kong',
    destination: 'Lima',
    totalPoints: 45,
    points: [
      // Similar a Shenzhen pero con salida desde HKG
      // Puntos 1-3: Almacén Nanning (mismo)
      // Puntos 4-7: Vehículo hacia Hong Kong (coords diferentes)
      // Puntos 8-13: Aeropuerto HKG (lat: 22.299, lng: 113.931)
      // Puntos 14-45: Igual que Shenzhen (ruta internacional es la misma)
      // ... (completar con coordenadas de tracking.md Dataset 2)
    ]
  }
};
```

---

### 2. Frontend (React/Vite)

#### 2.1 Nuevas Interfaces

```typescript
// src/api/interface/shipmentInterface.ts (AGREGAR)

export interface RouteCoords {
  lat: number;
  lng: number;
}

export interface RoutePoint {
  order: number;
  place: string;
  status: string;
  coords: RouteCoords;
  phase: 'first_mile' | 'transit' | 'customs' | 'last_mile';
  isOptional?: boolean;
}

export interface RouteInfo {
  id: string;
  shippingType: ShippingType;
  origin: string;
  destination: string;
  totalPoints: number;
}

export interface TrackingRouteResponse {
  route: RouteInfo;
  currentPosition: number;
  progress: number;
  completedPoints: RoutePoint[];
  currentPoint: RoutePoint | null;
  pendingPoints: RoutePoint[];
}
```

#### 2.2 Nueva Función API

```typescript
// src/api/shipments.ts (AGREGAR)

/**
 * Obtiene la ruta de tracking dinámica para un shipment específico
 */
export const getShipmentTrackingRoute = async (
  shipmentId: string
): Promise<TrackingRouteResponse> => {
  return await apiFetch<TrackingRouteResponse>(
    `/shipments/${shipmentId}/tracking/route`,
    { method: "GET" }
  );
};
```

#### 2.3 Nuevo Hook

```typescript
// src/hooks/use-shipments.ts (AGREGAR)

/**
 * Hook para obtener la ruta de tracking dinámica
 */
export function useGetShipmentTrackingRoute(shipmentId: string) {
  return useQuery({
    queryKey: ["ShipmentTrackingRoute", shipmentId],
    queryFn: () => getShipmentTrackingRoute(shipmentId),
    enabled: !!shipmentId,
    staleTime: 30000, // 30 segundos
  });
}
```

#### 2.4 Componente ShipmentTrackingMap Refactorizado

```typescript
// src/components/ShipmentTrackingMap.tsx (REFACTORIZAR)

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGetShipmentTrackingRoute } from '@/hooks/use-shipments';
import { RoutePoint, TrackingRouteResponse } from '@/api/interface/shipmentInterface';

// Crear iconos personalizados
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

// Colores por estado
const getIconColor = (point: RoutePoint, currentPosition: number): string => {
  if (point.order < currentPosition) return '#22c55e'; // Verde - completado
  if (point.order === currentPosition) return '#f59e0b'; // Naranja - actual
  return '#6b7280'; // Gris - pendiente
};

// Obtener estado del punto
const getPointStatus = (point: RoutePoint, currentPosition: number): string => {
  if (point.order < currentPosition) return 'Completado';
  if (point.order === currentPosition) return 'En progreso';
  return 'Pendiente';
};

// Optimizar ruta para anti-meridiano
const optimizeRouteForAntiMeridian = (points: RoutePoint[]): [number, number][] => {
  if (points.length < 2) return points.map(p => [p.coords.lat, p.coords.lng]);

  const optimizedPoints: [number, number][] = [];

  for (let i = 0; i < points.length; i++) {
    const { lat, lng } = points[i].coords;

    if (i === 0) {
      optimizedPoints.push([lat, lng]);
    } else {
      const prevLng = optimizedPoints[i - 1][1];

      // Elegir la variante más cercana
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

// Componente para ajustar bounds
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

    // Separar posiciones completadas y pendientes para polylines de colores diferentes
    const completedIndex = trackingRoute.completedPoints.length;
    const currentIndex = trackingRoute.currentPoint ? completedIndex + 1 : completedIndex;

    return {
      allPoints,
      optimizedPositions,
      completedPositions: optimizedPositions.slice(0, currentIndex),
      pendingPositions: optimizedPositions.slice(Math.max(0, currentIndex - 1)),
      currentPosition: trackingRoute.currentPosition,
      route: trackingRoute.route,
      progress: trackingRoute.progress
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
          Ruta {processedData.route.shippingType === 'aerial' ? 'Aérea' : 'Marítima'}: {processedData.route.origin} → {processedData.route.destination}
        </p>
      </div>

      {/* Info panel */}
      <div className="p-4 bg-green-50 border-b">
        <h5 className="text-sm font-semibold mb-2">Estado del Envío</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-medium">Posición Actual:</span>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">
              {trackingRoute?.currentPoint?.place || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium">Estado:</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {trackingRoute?.currentPoint?.status || 'N/A'}
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
          scrollWheelZoom={true}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Línea completada (verde sólida) */}
          {processedData.completedPositions.length > 1 && (
            <Polyline
              positions={processedData.completedPositions}
              color="#22c55e"
              weight={4}
              opacity={0.9}
            />
          )}

          {/* Línea pendiente (azul punteada) */}
          {processedData.pendingPositions.length > 1 && (
            <Polyline
              positions={processedData.pendingPositions}
              color="#3b82f6"
              weight={3}
              opacity={0.6}
              dashArray="10, 5"
            />
          )}

          {/* Marcadores */}
          {processedData.allPoints.map((point, index) => (
            <Marker
              key={point.order}
              position={processedData.optimizedPositions[index]}
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
                        getPointStatus(point, processedData.currentPosition) === 'Completado'
                          ? 'bg-green-100 text-green-800'
                          : getPointStatus(point, processedData.currentPosition) === 'En progreso'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getPointStatus(point, processedData.currentPosition)}
                      </span>
                    </div>
                    <div className="mt-1">Orden: {point.order}</div>
                    <div className="mt-1">Fase: {point.phase}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

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
```

#### 2.5 Actualizar Vista de Detalle

```typescript
// src/pages/shipment-detail-view.tsx (MODIFICAR)

// Cambiar de:
<ShipmentTrackingMap shipmentData={shipment} className="..." />

// A:
<ShipmentTrackingMap shipmentId={id!} className="..." />
```

---

## Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. Admin actualiza estado                                  │
│     PUT /shipments/:id/status                               │
│     { current_location: "Los Angeles", progress: 55 }       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Usuario abre detalle de shipment                        │
│     Frontend: GET /shipments/:id/tracking/route             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Backend procesa                                         │
│     a. Obtiene shipment de BD                               │
│     b. Determina ruta (aerial_shenzhen)                     │
│     c. Carga 45 puntos de la ruta                           │
│     d. Calcula posición actual (orden 21)                   │
│     e. Segmenta: completados (1-20), actual (21), pend (22-45) │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Frontend renderiza                                      │
│     a. Polyline verde: puntos 1-21                          │
│     b. Polyline azul punteada: puntos 21-45                 │
│     c. Marcadores: verde (1-20), naranja (21), gris (22-45) │
└─────────────────────────────────────────────────────────────┘
```

---

## Archivos a Crear/Modificar

### Backend (NestJS)
| Archivo | Acción |
|---------|--------|
| `src/shipments/interfaces/route-points.interface.ts` | CREAR |
| `src/shipments/data/routes/aerial-routes.ts` | CREAR |
| `src/shipments/data/routes/maritime-routes.ts` | CREAR (vacío por ahora) |
| `src/shipments/data/routes/index.ts` | CREAR |
| `src/shipments/shipments.service.ts` | MODIFICAR |
| `src/shipments/shipments.controller.ts` | MODIFICAR |

### Frontend (Vite/React)
| Archivo | Acción |
|---------|--------|
| `src/api/interface/shipmentInterface.ts` | MODIFICAR |
| `src/api/shipments.ts` | MODIFICAR |
| `src/hooks/use-shipments.ts` | MODIFICAR |
| `src/components/ShipmentTrackingMap.tsx` | REESCRIBIR |
| `src/pages/shipment-detail-view.tsx` | MODIFICAR |

---

## Verificación

1. **Backend:**
   - `curl GET /shipments/{id}/tracking/route`
   - Verificar respuesta con puntos segmentados

2. **Frontend:**
   - Abrir detalle de shipment
   - Verificar mapa con ruta correcta
   - Verificar colores según estado

3. **Integración:**
   - Cambiar estado de shipment
   - Refrescar página
   - Verificar que el mapa refleja el nuevo estado

---

## Notas Adicionales

- Las coordenadas del `tracking.md` ya están convertidas a decimal en este plan
- El estado `RETRASO EN LA LIBERACION` está marcado como `isOptional: true`
- La ruta marítima se puede agregar después siguiendo el mismo patrón
- El frontend no necesita conocer las rutas, solo consume del backend
