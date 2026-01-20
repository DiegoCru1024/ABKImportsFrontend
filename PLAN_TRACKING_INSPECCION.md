# Requerimiento Backend: Endpoint de Tracking para Inspecciones

## Contexto

El sistema tiene dos flujos de tracking separados:

1. **Inspección (puntos 1-13)**: Fase de inspección en China - Gestión de Mercancía
2. **Shipment (puntos 13-45)**: Fase de envío internacional - Gestión de Tracking

Actualmente el backend tiene implementado `GET /shipments/:id/tracking/route` para shipments.
Se necesita un endpoint similar para inspecciones.

---

## Endpoint Requerido

```
GET /inspections/:id/tracking/route
```

### Request

- **Método:** GET
- **URL:** `/inspections/:id/tracking/route`
- **Parámetros:**
  - `id` (path): ID de la inspección

### Response

```typescript
interface InspectionTrackingRouteResponse {
  route: {
    id: string;                    // 'inspection_shenzhen', 'inspection_hongkong'
    shippingType: 'aerial' | 'maritime';
    origin: string;                // 'Shenzhen', 'Hong Kong'
    destination: string;           // 'Aeropuerto SZX' o 'Aeropuerto HKG'
    totalPoints: number;           // 13 puntos para inspección
  };
  currentPosition: number;         // Orden del punto actual (1-13)
  progress: number;                // Porcentaje de progreso (0-100)
  completedPoints: RoutePoint[];   // Puntos ya completados
  currentPoint: RoutePoint | null; // Punto actual
  pendingPoints: RoutePoint[];     // Puntos pendientes
}

interface RoutePoint {
  order: number;                   // 1-13
  place: string;                   // Nombre del lugar
  status: string;                  // Descripción del estado
  coords: {
    lat: number;
    lng: number;
  };
  phase: 'first_mile' | 'customs'; // Fase del tracking
  isOptional?: boolean;            // Para estados opcionales
}
```

### Ejemplo de Response

```json
{
  "route": {
    "id": "inspection_shenzhen",
    "shippingType": "aerial",
    "origin": "Nanning",
    "destination": "Aeropuerto SZX",
    "totalPoints": 13
  },
  "currentPosition": 7,
  "progress": 54,
  "completedPoints": [
    { "order": 1, "place": "ALMACEN", "status": "PENDIENTE LLEGADA DE PRODUCTO", "coords": { "lat": 22.825, "lng": 108.293 }, "phase": "first_mile" },
    { "order": 2, "place": "ALMACEN", "status": "PROCESO DE INSPECCION", "coords": { "lat": 22.825, "lng": 108.293 }, "phase": "first_mile" },
    { "order": 3, "place": "ALMACEN", "status": "PENDIENTE DE RECOJO", "coords": { "lat": 22.825, "lng": 108.293 }, "phase": "first_mile" },
    { "order": 4, "place": "VEHICULO 0%", "status": "EN CAMINO AL SHENZHEN", "coords": { "lat": 22.823, "lng": 108.688 }, "phase": "first_mile" },
    { "order": 5, "place": "VEHICULO 50%", "status": "EN CAMINO AL SHENZHEN", "coords": { "lat": 22.636, "lng": 110.163 }, "phase": "first_mile" },
    { "order": 6, "place": "VEHICULO 75%", "status": "EN CAMINO AL SHENZHEN", "coords": { "lat": 23.109, "lng": 113.249 }, "phase": "first_mile" }
  ],
  "currentPoint": {
    "order": 7,
    "place": "VEHICULO 100%",
    "status": "LLEGO AEROPUERTO SZX",
    "coords": { "lat": 22.651, "lng": 113.812 },
    "phase": "first_mile"
  },
  "pendingPoints": [
    { "order": 8, "place": "AEROPUERTO", "status": "ENTRO INSPECCION ADUANA", "coords": { "lat": 22.651, "lng": 113.812 }, "phase": "customs" },
    { "order": 9, "place": "AEROPUERTO", "status": "ESPERA LIBERACION ADUANAL", "coords": { "lat": 22.651, "lng": 113.812 }, "phase": "customs" },
    { "order": 10, "place": "AEROPUERTO", "status": "RETRASO EN LA LIBERACION", "coords": { "lat": 22.651, "lng": 113.812 }, "phase": "customs", "isOptional": true },
    { "order": 11, "place": "AEROPUERTO", "status": "LIBERACION APROBADA", "coords": { "lat": 22.651, "lng": 113.812 }, "phase": "customs" },
    { "order": 12, "place": "AEROPUERTO", "status": "ESPERA DE EMBARQUE", "coords": { "lat": 22.651, "lng": 113.812 }, "phase": "customs" },
    { "order": 13, "place": "AEROPUERTO", "status": "EMBARQUE CONFIRMADO", "coords": { "lat": 22.651, "lng": 113.812 }, "phase": "customs" }
  ]
}
```

---

## Puntos de Tracking para Inspección (1-13)

### Ruta Shenzhen (Carga General)

| Orden | Lugar | Estado | Lat | Lng | Fase |
|-------|-------|--------|-----|-----|------|
| 1 | ALMACEN | PENDIENTE LLEGADA DE PRODUCTO | 22.825 | 108.293 | first_mile |
| 2 | ALMACEN | PROCESO DE INSPECCION | 22.825 | 108.293 | first_mile |
| 3 | ALMACEN | PENDIENTE DE RECOJO | 22.825 | 108.293 | first_mile |
| 4 | VEHICULO 0% | EN CAMINO AL SHENZHEN | 22.823 | 108.688 | first_mile |
| 5 | VEHICULO 50% | EN CAMINO AL SHENZHEN | 22.636 | 110.163 | first_mile |
| 6 | VEHICULO 75% | EN CAMINO AL SHENZHEN | 23.109 | 113.249 | first_mile |
| 7 | VEHICULO 100% | LLEGO AEROPUERTO SZX | 22.651 | 113.812 | first_mile |
| 8 | AEROPUERTO | ENTRO INSPECCION ADUANA | 22.651 | 113.812 | customs |
| 9 | AEROPUERTO | ESPERA LIBERACION ADUANAL | 22.651 | 113.812 | customs |
| 10 | AEROPUERTO | RETRASO EN LA LIBERACION | 22.651 | 113.812 | customs (opcional) |
| 11 | AEROPUERTO | LIBERACION APROBADA | 22.651 | 113.812 | customs |
| 12 | AEROPUERTO | ESPERA DE EMBARQUE | 22.651 | 113.812 | customs |
| 13 | AEROPUERTO | EMBARQUE CONFIRMADO | 22.651 | 113.812 | customs |

### Ruta Hong Kong (Carga IMO-Mixta)

| Orden | Lugar | Estado | Lat | Lng | Fase |
|-------|-------|--------|-----|-----|------|
| 1 | ALMACEN | PENDIENTE LLEGADA DE PRODUCTO | 22.825 | 108.293 | first_mile |
| 2 | ALMACEN | PROCESO DE INSPECCION | 22.825 | 108.293 | first_mile |
| 3 | ALMACEN | PENDIENTE DE RECOJO | 22.825 | 108.293 | first_mile |
| 4 | VEHICULO 0% | EN CAMINO A HONG KONG | 22.823 | 108.688 | first_mile |
| 5 | VEHICULO 50% | EN CAMINO A HONG KONG | 22.636 | 110.163 | first_mile |
| 6 | VEHICULO 75% | EN CAMINO A HONG KONG | 22.600 | 113.100 | first_mile |
| 7 | VEHICULO 100% | LLEGO AEROPUERTO HKG | 22.299 | 113.931 | first_mile |
| 8 | AEROPUERTO | ENTRO INSPECCION ADUANA | 22.299 | 113.931 | customs |
| 9 | AEROPUERTO | ESPERA LIBERACION ADUANAL | 22.299 | 113.931 | customs |
| 10 | AEROPUERTO | RETRASO EN LA LIBERACION | 22.299 | 113.931 | customs (opcional) |
| 11 | AEROPUERTO | LIBERACION APROBADA | 22.299 | 113.931 | customs |
| 12 | AEROPUERTO | ESPERA DE EMBARQUE | 22.299 | 113.931 | customs |
| 13 | AEROPUERTO | EMBARQUE CONFIRMADO | 22.299 | 113.931 | customs |

---

## Lógica del Servicio

```typescript
// inspections.service.ts

async getTrackingRoute(inspectionId: string): Promise<InspectionTrackingRouteResponse> {
  const inspection = await this.findById(inspectionId);

  // Determinar ruta basada en logistics_service o tipo de carga
  // 'general' -> Shenzhen, 'imo_mixta' -> Hong Kong
  const routeId = this.determineRouteId(inspection.logistics_service);
  const routeDefinition = INSPECTION_ROUTES[routeId];

  // Calcular posición actual basada en el estado más avanzado de los productos
  const currentPosition = this.calculateCurrentPosition(inspection.content);

  // Calcular progreso
  const progress = Math.round((currentPosition / routeDefinition.totalPoints) * 100);

  return {
    route: {
      id: routeDefinition.id,
      shippingType: routeDefinition.shippingType,
      origin: routeDefinition.origin,
      destination: routeDefinition.destination,
      totalPoints: routeDefinition.totalPoints
    },
    currentPosition,
    progress,
    completedPoints: routeDefinition.points.filter(p => p.order < currentPosition),
    currentPoint: routeDefinition.points.find(p => p.order === currentPosition) || null,
    pendingPoints: routeDefinition.points.filter(p => p.order > currentPosition),
  };
}

private calculateCurrentPosition(products: Product[]): number {
  // Mapear estado de producto a orden de tracking
  const statusOrderMap: Record<string, number> = {
    'pending': 1,
    'in_inspection': 2,
    'awaiting_pickup': 3,
    'in_transit': 7,      // Vehículo llegó
    'dispatched': 13,     // Embarque confirmado
  };

  // Encontrar el estado más avanzado entre todos los productos
  const maxOrder = products.reduce((max, product) => {
    const order = statusOrderMap[product.status] || 1;
    return Math.max(max, order);
  }, 1);

  return maxOrder;
}
```

---

## Mapeo de Estados de Producto a Puntos de Tracking

| Estado Producto | Punto Tracking | Descripción |
|-----------------|----------------|-------------|
| `pending` | 1 | Pendiente llegada de producto |
| `in_inspection` | 2 | Proceso de inspección |
| `awaiting_pickup` | 3 | Pendiente de recojo |
| `in_transit` | 4-7 | En camino / Llegó aeropuerto |
| `dispatched` | 8-13 | En aduana / Embarque confirmado |

---

## Notas Importantes

1. **El punto 10 es opcional**: Solo se muestra si hay retraso en la liberación
2. **La inspección termina en el punto 13**: El shipment comienza desde el punto 13
3. **Las coordenadas ya están en formato decimal**: No se necesita conversión DMS
4. **La ruta se determina por `logistics_service`**:
   - `general` o similar → Ruta Shenzhen
   - `imo_mixta` o similar → Ruta Hong Kong

---

## Controller

```typescript
// inspections.controller.ts

@Get(':id/tracking/route')
async getTrackingRoute(@Param('id') id: string): Promise<InspectionTrackingRouteResponse> {
  return this.inspectionsService.getTrackingRoute(id);
}
```
