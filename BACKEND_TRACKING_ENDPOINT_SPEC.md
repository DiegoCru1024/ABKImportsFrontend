# Especificación de Endpoint: Tracking Dinámico de Inspecciones

## Resumen

El frontend necesita que el backend gestione y devuelva información sobre el punto actual de tracking en la ruta de envío. Esta información permite mostrar la trazabilidad visual en el mapa.

---

## Cambios Requeridos

### 1. Modificar Entidad `Inspection`

Agregar los siguientes campos a la entidad de inspección:

```typescript
// Campos nuevos en la entidad Inspection
{
  // Punto actual en la ruta de tracking (1-45)
  tracking_point: number; // default: 1

  // Tipo de carga (determina la ruta)
  cargo_type: 'general' | 'imo_mixta'; // default: 'general'
}
```

**Nota:** El campo `shipping_service_type` ya existe y se usará para determinar si es `aerial` o `maritime`.

---

### 2. Endpoint Existente: Actualizar Estado de Tracking

**Modificar el endpoint existente de actualización de estado para que también actualice el `tracking_point`.**

```
PATCH /inspections/:id/tracking-status
```

**Request Body (actualizado):**
```json
{
  "status": "vehicle_50_percent",
  "tracking_point": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-inspection",
    "tracking_status": "vehicle_50_percent",
    "tracking_point": 5,
    "cargo_type": "general",
    "shipping_service_type": "aerial",
    "updated_at": "2026-01-24T10:30:00Z"
  }
}
```

---

### 3. Mapeo de Estados a Puntos de Ruta

El frontend tiene 45 puntos en la ruta. Los primeros 13 puntos corresponden a la fase de inspección en China. Aquí está el mapeo sugerido:

| tracking_point | status (value) | Descripción |
|----------------|----------------|-------------|
| 1 | `pending_arrival` | Pendiente llegada de producto |
| 2 | `inspection_process` | Proceso de inspección |
| 3 | `awaiting_pickup` | Pendiente de recojo |
| 4 | `vehicle_0_percent` | Vehículo 0% - En camino |
| 5 | `vehicle_50_percent` | Vehículo 50% - En camino |
| 6 | `vehicle_75_percent` | Vehículo 75% - En camino |
| 7 | `arrived_airport` | Llegó al aeropuerto |
| 8 | `customs_inspection` | Entró inspección aduana |
| 9 | `customs_waiting` | Espera liberación aduanal |
| 10 | `customs_delay` | Retraso en liberación (opcional) |
| 11 | `customs_approved` | Liberación aprobada |
| 12 | `boarding_waiting` | Espera de embarque |
| 13 | `boarding_confirmed` | Embarque confirmado |

**Nota:** A partir del punto 14, el paquete entra en tránsito internacional y se gestiona como `Shipment`, no como `Inspection`.

---

### 4. Endpoint GET Inspection (ya existente)

Asegurar que el endpoint `GET /inspections/:id` devuelva los nuevos campos:

```json
{
  "id": "uuid",
  "shipping_service_type": "aerial",
  "cargo_type": "general",
  "tracking_status": "vehicle_50_percent",
  "tracking_point": 5,
  "logistics_service": "Express",
  "total_price": 1500,
  "content": [...],
  "created_at": "...",
  "updated_at": "..."
}
```

---

### 5. Endpoint de Estados de Tracking (ya existente)

El endpoint `GET /inspections/tracking-statuses` ya devuelve la lista de estados. **Agregar el campo `tracking_point`** a cada estado:

```json
{
  "statuses": [
    {
      "id": "1",
      "value": "pending_arrival",
      "label": "Pendiente llegada de producto",
      "order": 1,
      "tracking_point": 1,
      "phase": "first_mile",
      "isOptional": false
    },
    {
      "id": "2",
      "value": "inspection_process",
      "label": "Proceso de inspección",
      "order": 2,
      "tracking_point": 2,
      "phase": "first_mile",
      "isOptional": false
    },
    // ... más estados
  ]
}
```

---

## Flujo de Actualización

```
┌─────────────────────────────────────────────────────────────┐
│  1. Admin selecciona nuevo estado en el modal               │
│     - Estado: "vehicle_50_percent"                          │
│     - tracking_point: 5 (calculado automáticamente)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend envía PATCH /inspections/:id/tracking-status   │
│     Body: { status: "vehicle_50_percent", tracking_point: 5 }│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Backend actualiza inspection                             │
│     - tracking_status = "vehicle_50_percent"                │
│     - tracking_point = 5                                    │
│     - updated_at = now()                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Frontend recibe respuesta y refresca query              │
│     - El mapa se actualiza automáticamente                  │
│     - Muestra trazabilidad puntos 1-5                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Consideraciones Adicionales

### Tipo de Carga (cargo_type)

- **`general`**: Carga estándar → Ruta Shenzhen (SZX)
- **`imo_mixta`**: Carga peligrosa/mixta → Ruta Hong Kong (HKG)

Este campo determina qué ruta se muestra en el mapa:
- Las rutas difieren en los puntos 4-13 (transporte terrestre y aeropuerto de origen)
- A partir del punto 14, ambas rutas son idénticas

### Valores por Defecto para Nuevas Inspecciones

```typescript
{
  tracking_point: 1,
  cargo_type: 'general',
  tracking_status: 'pending_arrival'
}
```

### Validaciones

- `tracking_point` debe estar entre 1 y 13 para inspecciones
- `tracking_point` > 13 significa que el paquete ya está en tránsito (debería ser un Shipment)
- No permitir retroceder `tracking_point` (solo avanzar o mantener)

---

## Ejemplo de Implementación Backend (NestJS)

```typescript
// inspection.entity.ts
@Entity()
export class Inspection {
  // ... campos existentes

  @Column({ default: 1 })
  tracking_point: number;

  @Column({ default: 'general' })
  cargo_type: 'general' | 'imo_mixta';
}

// inspections.service.ts
async updateTrackingStatus(
  id: string,
  dto: UpdateTrackingStatusDto
): Promise<Inspection> {
  const inspection = await this.findById(id);

  inspection.tracking_status = dto.status;
  inspection.tracking_point = dto.tracking_point;
  inspection.updated_at = new Date();

  return this.inspectionRepository.save(inspection);
}

// update-tracking-status.dto.ts
export class UpdateTrackingStatusDto {
  @IsString()
  status: string;

  @IsNumber()
  @Min(1)
  @Max(13)
  tracking_point: number;
}
```

---

## Resumen de Cambios

| Componente | Cambio |
|------------|--------|
| Entidad Inspection | Agregar `tracking_point` y `cargo_type` |
| PATCH /inspections/:id/tracking-status | Aceptar `tracking_point` en body |
| GET /inspections/:id | Devolver `tracking_point` y `cargo_type` |
| GET /inspections/tracking-statuses | Agregar `tracking_point` y `phase` a cada estado |

---

## Contacto

Si tienen preguntas sobre esta especificación, revisar el componente:
- `src/components/shipment-route-tracking/ShipmentRouteTrackingMap.tsx`
- `src/components/shipment-route-tracking/routes-data.ts`
