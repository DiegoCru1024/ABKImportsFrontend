# Especificacion Backend: Estados de Tracking para Shipments (Puntos 14-45)

## Contexto

El sistema de tracking tiene 45 puntos en total divididos en dos entidades:

| Entidad | Puntos | Estado |
|---------|--------|--------|
| **Inspection** | 1-13 | IMPLEMENTADO - El backend ya tiene `tracking_point`, `cargo_type`, endpoint de estados y actualizacion |
| **Shipment** | 14-45 | PENDIENTE - Es lo que se necesita implementar |

Actualmente los shipments manejan estados genericos (`in_transit`, `customs`, `delivered`), pero se necesita un sistema granular de 32 puntos (14-45) equivalente al que ya funciona para inspecciones.

---

## Referencia: Como funciona en Inspecciones (ya implementado)

Para que sirva de guia, asi funciona el tracking en inspecciones:

```
GET /inspections/tracking/statuses        -> Devuelve los 13 estados ordenados
PUT /inspections/:id/tracking/status      -> Actualiza con { status, tracking_point }
GET /inspections/:id/tracking/route       -> Devuelve ruta segmentada (completed/current/pending)
GET /inspections/:id                      -> Devuelve tracking_point y cargo_type
```

**Se necesita replicar exactamente este patron para Shipments con los puntos 14-45.**

---

## 1. Modificar Entidad Shipment

Agregar el campo `tracking_point` a la entidad:

```typescript
// shipment.entity.ts
@Entity()
export class Shipment {
  // ... campos existentes ...

  @Column({ default: 14 })
  tracking_point: number;  // 14-45 para shipments
}
```

**Nota:** El valor por defecto es `14` porque cuando se crea un shipment, la inspeccion ya completo los puntos 1-13 y el paquete inicia en transito.

---

## 2. Nuevo Endpoint: Lista de Estados de Tracking para Shipments

```
GET /shipments/tracking/statuses
```

Este endpoint debe devolver los 32 estados disponibles para shipments (puntos 14-45), con la misma estructura que usa inspecciones.

### Response

```json
{
  "statuses": [
    {
      "id": "14",
      "order": 14,
      "value": "transit_point_1",
      "label": "Punto 1 / En el Mar",
      "description": "En transito - Mar de China Meridional",
      "phase": "transit",
      "isOptional": false,
      "isActive": true,
      "tracking_point": 14
    },
    {
      "id": "15",
      "order": 15,
      "value": "transit_point_2_taiwan",
      "label": "Punto 2 / Taiwan Port",
      "description": "En transito - Puerto de Taiwan",
      "phase": "transit",
      "isOptional": false,
      "isActive": true,
      "tracking_point": 15
    }
  ]
}
```

### Interface de cada estado

```typescript
interface ShipmentTrackingStatus {
  id: string;
  order: number;              // 14-45
  value: string;              // Identificador unico del estado
  label: string;              // Etiqueta legible
  description?: string;       // Descripcion opcional
  phase: ShipmentPhase;       // 'transit' | 'customs_destination' | 'last_mile'
  isOptional: boolean;        // true solo para punto 37 (retraso aduana)
  isActive: boolean;          // Si el estado esta activo en el sistema
  tracking_point: number;     // Punto en la ruta (14-45)
}

type ShipmentPhase = 'transit' | 'customs_destination' | 'last_mile';
```

---

## 3. Tabla Completa de los 32 Estados (Puntos 14-45)

### Fase: TRANSIT (Transito Internacional) - Puntos 14 a 34

| tracking_point | value | label | phase | isOptional |
|----------------|-------|-------|-------|------------|
| 14 | `transit_point_1` | Punto 1 / En el Mar | transit | false |
| 15 | `transit_point_2_taiwan` | Punto 2 / Taiwan Port | transit | false |
| 16 | `transit_point_3` | Punto 3 / En el Mar | transit | false |
| 17 | `transit_point_4_osaka` | Punto 4 / Osaka | transit | false |
| 18 | `transit_point_5` | Punto 5 / En el Mar | transit | false |
| 19 | `transit_point_6_alaska` | Punto 6 / Alaska Anchorage | transit | false |
| 20 | `transit_point_7` | Punto 7 / En Continente | transit | false |
| 21 | `transit_point_8_los_angeles` | Punto 8 / Los Angeles | transit | false |
| 22 | `transit_point_9` | Punto 9 / En Continente | transit | false |
| 23 | `transit_point_10` | Punto 10 / En Continente | transit | false |
| 24 | `transit_point_11_chicago` | Punto 11 / Chicago Port | transit | false |
| 25 | `transit_point_12` | Punto 12 / En Continente | transit | false |
| 26 | `transit_point_13_memphis` | Punto 13 / Memphis Port | transit | false |
| 27 | `transit_point_14` | Punto 14 / En Continente | transit | false |
| 28 | `transit_point_15_miami` | Punto 15 / Miami Port | transit | false |
| 29 | `transit_point_16` | Punto 16 / En el Mar | transit | false |
| 30 | `transit_point_17` | Punto 17 / En Continente | transit | false |
| 31 | `transit_point_18_bogota` | Punto 18 / Bogota Colombia | transit | false |
| 32 | `transit_point_19` | Punto 19 / En Continente | transit | false |
| 33 | `transit_point_20` | Punto 20 / En Continente | transit | false |
| 34 | `transit_point_21_lima` | Punto 21 / Lima Aeropuerto Jorge Chavez | transit | false |

### Fase: CUSTOMS_DESTINATION (Aduana Peru) - Puntos 35 a 38

| tracking_point | value | label | phase | isOptional |
|----------------|-------|-------|-------|------------|
| 35 | `customs_dest_inspection` | Entro Inspeccion Aduana | customs_destination | false |
| 36 | `customs_dest_waiting` | Espera Liberacion Aduanal | customs_destination | false |
| 37 | `customs_dest_delay` | Retraso en la Liberacion | customs_destination | **true** |
| 38 | `customs_dest_approved` | Liberacion Aprobada | customs_destination | false |

### Fase: LAST_MILE (Ultima Milla) - Puntos 39 a 45

| tracking_point | value | label | phase | isOptional |
|----------------|-------|-------|-------|------------|
| 39 | `airline_warehouse_pickup` | Almacen Aerolinea - Pendiente de Recojo | last_mile | false |
| 40 | `abk_vehicle_0` | Vehiculo ABK 0% | last_mile | false |
| 41 | `abk_vehicle_50` | Vehiculo ABK 50% | last_mile | false |
| 42 | `abk_vehicle_100` | Vehiculo ABK 100% | last_mile | false |
| 43 | `abk_warehouse_inspection` | Almacen ABK - Proceso de Inspeccion | last_mile | false |
| 44 | `ready_for_delivery` | Almacen ABK - Listo para la Entrega | last_mile | false |
| 45 | `delivered` | Almacen ABK - Entregado | last_mile | false |

---

## 4. Modificar Endpoint de Actualizacion de Estado

Actualmente existe:

```
PUT /shipments/:id/status
Body: { status, current_location, notes? }
```

**Modificar para que tambien acepte `tracking_point`:**

```
PUT /shipments/:id/status
```

### Request Body (actualizado)

```json
{
  "status": "in_transit",
  "current_location": "Los Angeles",
  "tracking_point": 21,
  "notes": "Llego a Los Angeles sin novedad"
}
```

### Response

```json
{
  "id": "uuid-shipment",
  "correlative": "SHP-001",
  "status": "in_transit",
  "current_location": "Los Angeles",
  "tracking_point": 21,
  "progress": 47,
  "shipping_type": "aerial",
  "updated_at": "2026-02-12T10:30:00Z"
}
```

---

## 5. Endpoint GET Shipment (ya existente)

Asegurar que `GET /shipments/:id` devuelva el nuevo campo:

```json
{
  "id": "uuid",
  "correlative": "SHP-001",
  "origin": "Shenzhen",
  "destination": "Lima",
  "weight": 150,
  "status": "in_transit",
  "current_location": "Los Angeles",
  "tracking_point": 21,
  "progress": 47,
  "shipping_type": "aerial",
  "inspection_id": "uuid-inspection",
  "status_history": [...],
  "estimated_date": "2026-03-01",
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 6. Endpoint de Ruta de Tracking (ya existente)

El endpoint `GET /shipments/:id/tracking/route` ya existe. Verificar que utilice `tracking_point` para calcular la posicion actual:

```typescript
// shipments.service.ts
async getTrackingRoute(shipmentId: string): Promise<TrackingRouteResponse> {
  const shipment = await this.findById(shipmentId);

  // USAR tracking_point directamente (no calcular por current_location)
  const currentPosition = shipment.tracking_point; // <-- Esto es lo importante

  const routeDefinition = this.getRouteForShipment(shipment);
  const { points, ...routeInfo } = routeDefinition;

  return {
    route: routeInfo,
    currentPosition,
    progress: Math.round((currentPosition / routeDefinition.totalPoints) * 100),
    completedPoints: points.filter(p => p.order < currentPosition),
    currentPoint: points.find(p => p.order === currentPosition) || null,
    pendingPoints: points.filter(p => p.order > currentPosition),
  };
}
```

**Nota:** Las rutas (45 puntos con coordenadas) ya estan definidas en el frontend en `routes-data.ts`. Si el backend necesita replicarlas, usar las mismas coordenadas. Sin embargo, dado que el frontend ya tiene los datos de la ruta localmente, el endpoint puede simplificarse a solo devolver el `tracking_point` actual y el frontend calcula el resto.

---

## 7. Mapeo de Compatibilidad: Estados Actuales vs Nuevos

Los estados actuales del shipment (`ShipmentStatus`) se mapean a los nuevos `tracking_point` asi:

| Estado actual (ShipmentStatus) | tracking_point equivalente | Descripcion |
|-------------------------------|---------------------------|-------------|
| `dispatched` | 14 | Inicio del transito |
| `airport` | 14-15 | En aeropuerto / inicio vuelo |
| `in_transit` | 14-34 | Cualquier punto de transito |
| `arrived_destination` | 34 | Llego a Lima |
| `customs` | 35-38 | En aduana destino |
| `delivered` | 45 | Entregado |

**Recomendacion:** Mantener el campo `status` existente como estado general y agregar `tracking_point` como el indicador preciso. Asi no se rompe nada existente.

---

## 8. Validaciones Requeridas

```typescript
// Validaciones para tracking_point en shipments
{
  // Rango valido: 14-45
  @Min(14)
  @Max(45)
  tracking_point: number;

  // No permitir retroceder (solo avanzar o mantener)
  if (dto.tracking_point < shipment.tracking_point) {
    throw new BadRequestException('No se puede retroceder el tracking_point');
  }

  // El punto 37 es opcional (retraso aduana)
  // Se puede saltar del 36 al 38 directamente
}
```

---

## 9. Valores por Defecto al Crear un Shipment

Cuando se crea un shipment (desde una inspeccion que completo punto 13):

```typescript
{
  tracking_point: 14,       // Inicia en transito
  status: 'in_transit',     // Estado general
  progress: 31              // (14/45) * 100
}
```

---

## 10. Flujo Completo de Actualizacion

```
+---------------------------------------------------------------+
|  1. Admin selecciona nuevo estado en el frontend               |
|     - Selecciona: "Punto 8 / Los Angeles" (tracking_point: 21)|
+---------------------------------------------------------------+
                          |
                          v
+---------------------------------------------------------------+
|  2. Frontend envia PUT /shipments/:id/status                   |
|     Body: {                                                    |
|       status: "in_transit",                                    |
|       current_location: "Los Angeles",                         |
|       tracking_point: 21                                       |
|     }                                                          |
+---------------------------------------------------------------+
                          |
                          v
+---------------------------------------------------------------+
|  3. Backend valida y actualiza                                 |
|     - Verifica tracking_point >= actual (no retroceder)        |
|     - Actualiza: tracking_point = 21                           |
|     - Calcula: progress = round((21/45) * 100) = 47            |
|     - Registra en status_history                               |
+---------------------------------------------------------------+
                          |
                          v
+---------------------------------------------------------------+
|  4. Frontend recibe respuesta y refresca                       |
|     - El mapa muestra trazabilidad puntos 14-21 (verde)        |
|     - Punto 21 en naranja (actual)                             |
|     - Puntos 22-45 en gris punteado (pendiente)                |
+---------------------------------------------------------------+
```

---

## 11. Resumen de Cambios Requeridos

| Componente | Accion | Prioridad |
|------------|--------|-----------|
| Entidad `Shipment` | Agregar campo `tracking_point` (default: 14) | ALTA |
| `GET /shipments/tracking/statuses` | CREAR - Devolver los 32 estados (puntos 14-45) | ALTA |
| `PUT /shipments/:id/status` | MODIFICAR - Aceptar `tracking_point` en body | ALTA |
| `GET /shipments/:id` | VERIFICAR - Que devuelva `tracking_point` | ALTA |
| `GET /shipments/:id/tracking/route` | VERIFICAR - Que use `tracking_point` para posicion | MEDIA |
| Validaciones | No retroceder, rango 14-45, punto 37 opcional | MEDIA |
| Valores por defecto | tracking_point=14 al crear shipment | MEDIA |

---

## 12. Ejemplo de Implementacion Backend (NestJS)

### DTO de actualizacion

```typescript
// update-shipment-status.dto.ts
export class UpdateShipmentStatusDto {
  @IsString()
  status: string;

  @IsString()
  current_location: string;

  @IsNumber()
  @Min(14)
  @Max(45)
  tracking_point: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### Servicio

```typescript
// shipments.service.ts

async updateStatus(id: string, dto: UpdateShipmentStatusDto): Promise<Shipment> {
  const shipment = await this.findById(id);

  // Validar que no retroceda
  if (dto.tracking_point < shipment.tracking_point) {
    throw new BadRequestException('No se puede retroceder el tracking_point');
  }

  shipment.status = dto.status;
  shipment.current_location = dto.current_location;
  shipment.tracking_point = dto.tracking_point;
  shipment.progress = Math.round((dto.tracking_point / 45) * 100);
  shipment.updated_at = new Date();

  // Agregar al historial
  shipment.status_history.push({
    status: dto.status,
    location: dto.current_location,
    progress: shipment.progress,
    timestamp: new Date().toISOString(),
    notes: dto.notes,
  });

  return this.shipmentRepository.save(shipment);
}
```

### Controller para estados

```typescript
// shipments.controller.ts

@Get('tracking/statuses')
getTrackingStatuses(): ShipmentTrackingStatusesResponse {
  return this.shipmentsService.getTrackingStatuses();
}
```

### Datos de estados (constante)

```typescript
// data/shipment-tracking-statuses.ts

export const SHIPMENT_TRACKING_STATUSES: ShipmentTrackingStatus[] = [
  // TRANSIT (14-34)
  { id: '14', order: 14, value: 'transit_point_1', label: 'Punto 1 / En el Mar', phase: 'transit', isOptional: false, isActive: true, tracking_point: 14 },
  { id: '15', order: 15, value: 'transit_point_2_taiwan', label: 'Punto 2 / Taiwan Port', phase: 'transit', isOptional: false, isActive: true, tracking_point: 15 },
  { id: '16', order: 16, value: 'transit_point_3', label: 'Punto 3 / En el Mar', phase: 'transit', isOptional: false, isActive: true, tracking_point: 16 },
  { id: '17', order: 17, value: 'transit_point_4_osaka', label: 'Punto 4 / Osaka', phase: 'transit', isOptional: false, isActive: true, tracking_point: 17 },
  { id: '18', order: 18, value: 'transit_point_5', label: 'Punto 5 / En el Mar', phase: 'transit', isOptional: false, isActive: true, tracking_point: 18 },
  { id: '19', order: 19, value: 'transit_point_6_alaska', label: 'Punto 6 / Alaska Anchorage', phase: 'transit', isOptional: false, isActive: true, tracking_point: 19 },
  { id: '20', order: 20, value: 'transit_point_7', label: 'Punto 7 / En Continente', phase: 'transit', isOptional: false, isActive: true, tracking_point: 20 },
  { id: '21', order: 21, value: 'transit_point_8_los_angeles', label: 'Punto 8 / Los Angeles', phase: 'transit', isOptional: false, isActive: true, tracking_point: 21 },
  { id: '22', order: 22, value: 'transit_point_9', label: 'Punto 9 / En Continente', phase: 'transit', isOptional: false, isActive: true, tracking_point: 22 },
  { id: '23', order: 23, value: 'transit_point_10', label: 'Punto 10 / En Continente', phase: 'transit', isOptional: false, isActive: true, tracking_point: 23 },
  { id: '24', order: 24, value: 'transit_point_11_chicago', label: 'Punto 11 / Chicago Port', phase: 'transit', isOptional: false, isActive: true, tracking_point: 24 },
  { id: '25', order: 25, value: 'transit_point_12', label: 'Punto 12 / En Continente', phase: 'transit', isOptional: false, isActive: true, tracking_point: 25 },
  { id: '26', order: 26, value: 'transit_point_13_memphis', label: 'Punto 13 / Memphis Port', phase: 'transit', isOptional: false, isActive: true, tracking_point: 26 },
  { id: '27', order: 27, value: 'transit_point_14', label: 'Punto 14 / En Continente', phase: 'transit', isOptional: false, isActive: true, tracking_point: 27 },
  { id: '28', order: 28, value: 'transit_point_15_miami', label: 'Punto 15 / Miami Port', phase: 'transit', isOptional: false, isActive: true, tracking_point: 28 },
  { id: '29', order: 29, value: 'transit_point_16', label: 'Punto 16 / En el Mar', phase: 'transit', isOptional: false, isActive: true, tracking_point: 29 },
  { id: '30', order: 30, value: 'transit_point_17', label: 'Punto 17 / En Continente', phase: 'transit', isOptional: false, isActive: true, tracking_point: 30 },
  { id: '31', order: 31, value: 'transit_point_18_bogota', label: 'Punto 18 / Bogota Colombia', phase: 'transit', isOptional: false, isActive: true, tracking_point: 31 },
  { id: '32', order: 32, value: 'transit_point_19', label: 'Punto 19 / En Continente', phase: 'transit', isOptional: false, isActive: true, tracking_point: 32 },
  { id: '33', order: 33, value: 'transit_point_20', label: 'Punto 20 / En Continente', phase: 'transit', isOptional: false, isActive: true, tracking_point: 33 },
  { id: '34', order: 34, value: 'transit_point_21_lima', label: 'Punto 21 / Lima Aeropuerto', phase: 'transit', isOptional: false, isActive: true, tracking_point: 34 },

  // CUSTOMS DESTINATION (35-38)
  { id: '35', order: 35, value: 'customs_dest_inspection', label: 'Entro Inspeccion Aduana', phase: 'customs_destination', isOptional: false, isActive: true, tracking_point: 35 },
  { id: '36', order: 36, value: 'customs_dest_waiting', label: 'Espera Liberacion Aduanal', phase: 'customs_destination', isOptional: false, isActive: true, tracking_point: 36 },
  { id: '37', order: 37, value: 'customs_dest_delay', label: 'Retraso en la Liberacion', phase: 'customs_destination', isOptional: true, isActive: true, tracking_point: 37 },
  { id: '38', order: 38, value: 'customs_dest_approved', label: 'Liberacion Aprobada', phase: 'customs_destination', isOptional: false, isActive: true, tracking_point: 38 },

  // LAST MILE (39-45)
  { id: '39', order: 39, value: 'airline_warehouse_pickup', label: 'Almacen Aerolinea - Pendiente de Recojo', phase: 'last_mile', isOptional: false, isActive: true, tracking_point: 39 },
  { id: '40', order: 40, value: 'abk_vehicle_0', label: 'Vehiculo ABK 0%', phase: 'last_mile', isOptional: false, isActive: true, tracking_point: 40 },
  { id: '41', order: 41, value: 'abk_vehicle_50', label: 'Vehiculo ABK 50%', phase: 'last_mile', isOptional: false, isActive: true, tracking_point: 41 },
  { id: '42', order: 42, value: 'abk_vehicle_100', label: 'Vehiculo ABK 100%', phase: 'last_mile', isOptional: false, isActive: true, tracking_point: 42 },
  { id: '43', order: 43, value: 'abk_warehouse_inspection', label: 'Almacen ABK - Inspeccion', phase: 'last_mile', isOptional: false, isActive: true, tracking_point: 43 },
  { id: '44', order: 44, value: 'ready_for_delivery', label: 'Almacen ABK - Listo para Entrega', phase: 'last_mile', isOptional: false, isActive: true, tracking_point: 44 },
  { id: '45', order: 45, value: 'delivered', label: 'Almacen ABK - Entregado', phase: 'last_mile', isOptional: false, isActive: true, tracking_point: 45 },
];
```

---

## 13. Archivo de Referencia en Frontend

El frontend ya tiene las rutas completas con las 45 coordenadas definidas en:
- `src/components/shipment-route-tracking/routes-data.ts`
- `src/components/shipment-route-tracking/types.ts`

Estos archivos contienen las coordenadas exactas para cada punto. Si el backend necesita replicarlas para el endpoint `GET /shipments/:id/tracking/route`, usar esos mismos datos.

---

## Contacto

Archivos frontend relevantes para referencia:
- `src/components/shipment-route-tracking/routes-data.ts` - Definicion de rutas con coordenadas
- `src/components/shipment-route-tracking/types.ts` - Tipos de datos
- `src/api/interface/shipmentInterface.ts` - Interfaces del shipment
- `src/api/shipments.ts` - Funciones API de shipments
