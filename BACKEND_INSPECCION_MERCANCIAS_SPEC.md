# Solicitud al Backend (NestJS): Endpoints para Vista "Inspeccion de Mercancias"

## Urgente - El frontend ya esta listo esperando estos endpoints

El frontend tiene una nueva vista para usuarios finales en `/dashboard/inspeccion-de-mercancias/:id` que necesita **2 endpoints nuevos** y **1 verificacion** de endpoint existente.

---

## ENDPOINT 1 (NUEVO): Resumen Financiero del Pedido

```
GET /inspections/:id/order-summary
```

**Estado:** NO EXISTE - NECESITA CREARSE

### Que debe devolver

El frontend espera EXACTAMENTE esta estructura JSON:

```json
{
  "cargo_type": "general",
  "cargo_type_label": "Carga General",
  "total_product_cost": 125000,
  "customs_taxes": 15000,
  "logistics_services": 25000,
  "pending_payment": 40000,
  "customs_channel": "green"
}
```

### Campos requeridos

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `cargo_type` | `string` | SI | `"general"` o `"imo_mixta"` (el CargoType que ya existe en la entidad Inspection) |
| `cargo_type_label` | `string` | SI | Texto legible: `"Carga General"` o `"IMO / Mixta"` |
| `total_product_cost` | `number` | SI | Costo total de todos los productos. Numero, NO string. Ejemplo: `125000` |
| `customs_taxes` | `number` | SI | Impuestos aduaneros. Numero. Ejemplo: `15000` |
| `logistics_services` | `number` | SI | Costo de servicios logisticos. Numero. Ejemplo: `25000` |
| `pending_payment` | `number` | SI | Monto pendiente de pago. Numero. Ejemplo: `40000` |
| `customs_channel` | `string` | SI | Canal aduanero: solo `"red"`, `"yellow"` o `"green"`. Este valor lo asigna el admin manualmente |

### Que necesita la entidad Inspection

Para que este endpoint funcione, la entidad `Inspection` necesita estos campos (si no existen, agregarlos):

```typescript
// inspection.entity.ts
@Entity()
export class Inspection {
  // ... campos existentes ...

  @Column({ type: 'decimal', default: 0 })
  total_product_cost: number;

  @Column({ type: 'decimal', default: 0 })
  customs_taxes: number;

  @Column({ type: 'decimal', default: 0 })
  logistics_services: number;

  @Column({ type: 'decimal', default: 0 })
  pending_payment: number;

  @Column({ type: 'varchar', nullable: true })
  customs_channel: string; // 'red' | 'yellow' | 'green'
}
```

### Ejemplo de implementacion NestJS

```typescript
// inspections.controller.ts
@Get(':id/order-summary')
@UseGuards(JwtAuthGuard)
async getOrderSummary(@Param('id') id: string) {
  return this.inspectionsService.getOrderSummary(id);
}

// inspections.service.ts
async getOrderSummary(id: string) {
  const inspection = await this.inspectionRepository.findOne({ where: { id } });
  if (!inspection) throw new NotFoundException('Inspeccion no encontrada');

  const cargoTypeLabels: Record<string, string> = {
    general: 'Carga General',
    imo_mixta: 'IMO / Mixta',
  };

  return {
    cargo_type: inspection.cargo_type || 'general',
    cargo_type_label: cargoTypeLabels[inspection.cargo_type] || 'Carga General',
    total_product_cost: Number(inspection.total_product_cost) || 0,
    customs_taxes: Number(inspection.customs_taxes) || 0,
    logistics_services: Number(inspection.logistics_services) || 0,
    pending_payment: Number(inspection.pending_payment) || 0,
    customs_channel: inspection.customs_channel || null,
  };
}
```

---

## ENDPOINT 2 (NUEVO o VERIFICAR): Shipments vinculados a una Inspeccion

```
GET /inspections/:id/shipments
```

**Estado:** VERIFICAR - El frontend necesita que devuelva esta estructura exacta

### Que debe devolver

```json
{
  "shipments": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "correlative": "SHP-001",
      "origin": "Shenzhen",
      "destination": "Lima",
      "weight": 150,
      "status": "in_transit",
      "current_location": "Los Angeles",
      "tracking_point": 21,
      "progress": 47,
      "shipping_type": "aerial",
      "status_history": [
        {
          "status": "dispatched",
          "location": "Shenzhen",
          "progress": 31,
          "timestamp": "2026-02-01T08:00:00Z",
          "notes": "Despacho inicial"
        },
        {
          "status": "in_transit",
          "location": "Los Angeles",
          "progress": 47,
          "timestamp": "2026-02-10T14:30:00Z",
          "notes": "Llego a Los Angeles"
        }
      ],
      "inspection_id": "uuid-de-la-inspeccion",
      "estimated_date": "2026-03-01",
      "created_at": "2026-02-01T08:00:00Z",
      "updated_at": "2026-02-12T10:30:00Z"
    }
  ]
}
```

### IMPORTANTE - Estructura de respuesta

El frontend espera el wrapper `{ "shipments": [...] }`, NO un array directo.

**CORRECTO:**
```json
{ "shipments": [ { ... }, { ... } ] }
```

**INCORRECTO (el frontend NO parsea esto):**
```json
[ { ... }, { ... } ]
```

### Cada shipment DEBE incluir

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | `string` | UUID del shipment |
| `correlative` | `string` | Ej: `"SHP-001"` |
| `tracking_point` | `number` | **CRITICO** - Punto actual 14-45. El frontend usa esto para el mapa |
| `status` | `string` | Estado general del shipment |
| `current_location` | `string` | Ubicacion actual |
| `progress` | `number` | 0-100 |
| `shipping_type` | `string` | `"aerial"` o `"maritime"` |
| `status_history` | `array` | Array de objetos StatusHistoryEntry (ver arriba) |
| `inspection_id` | `string` | UUID de la inspeccion padre |

### Ejemplo de implementacion NestJS

```typescript
// inspections.controller.ts
@Get(':id/shipments')
@UseGuards(JwtAuthGuard)
async getInspectionShipments(@Param('id') id: string) {
  return this.inspectionsService.getInspectionShipments(id);
}

// inspections.service.ts
async getInspectionShipments(id: string) {
  const inspection = await this.inspectionRepository.findOne({ where: { id } });
  if (!inspection) throw new NotFoundException('Inspeccion no encontrada');

  const shipments = await this.shipmentRepository.find({
    where: { inspection_id: id },
    order: { created_at: 'DESC' },
  });

  return { shipments };
}
```

---

## ENDPOINT 3 (VERIFICAR): Estados de Tracking de Shipments

```
GET /shipments/tracking/statuses
```

**Estado:** SEGUN INDICADO YA EXISTE - VERIFICAR FORMATO

### Que espera el frontend

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
      "phase": "transit",
      "isOptional": false,
      "isActive": true,
      "tracking_point": 15
    }
  ]
}
```

### Campos requeridos por cada status

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | `string` | Identificador unico (puede ser el numero como string) |
| `order` | `number` | Numero de orden (14-45) |
| `value` | `string` | Identificador programatico (ej: `"transit_point_1"`) |
| `label` | `string` | Texto legible (ej: `"Punto 1 / En el Mar"`) |
| `description` | `string?` | Descripcion opcional |
| `phase` | `string` | `"transit"` \| `"customs_destination"` \| `"last_mile"` |
| `isOptional` | `boolean` | Solo `true` para punto 37 (retraso aduana) |
| `isActive` | `boolean` | Si el estado esta activo |
| `tracking_point` | `number` | Numero del punto en la ruta (14-45) |

### IMPORTANTE - Wrapper

El frontend espera `{ "statuses": [...] }` como wrapper (igual que el endpoint de inspecciones `GET /inspections/tracking/statuses`).

### Los 32 estados completos (puntos 14-45)

Referencia completa en el archivo `BACKEND_SHIPMENT_TRACKING_SPEC.md` seccion 3.

---

## ENDPOINT 4 (VERIFICAR): Actualizacion de Estado de Shipment

```
PUT /shipments/:id/status
```

**Estado:** YA EXISTE - VERIFICAR QUE ACEPTE tracking_point

### Request Body que envia el frontend

```json
{
  "status": "in_transit",
  "current_location": "Los Angeles",
  "tracking_point": 21,
  "notes": "Llego a Los Angeles"
}
```

El campo `tracking_point` es nuevo. Si el endpoint actual no lo acepta, agregarlo al DTO:

```typescript
// update-shipment-status.dto.ts
export class UpdateShipmentStatusDto {
  @IsString()
  status: string;

  @IsString()
  current_location: string;

  @IsOptional()
  @IsNumber()
  @Min(14)
  @Max(45)
  tracking_point?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

## Resumen de Prioridades

| # | Endpoint | Accion | Prioridad |
|---|----------|--------|-----------|
| 1 | `GET /inspections/:id/order-summary` | **CREAR** - No existe | **CRITICA** |
| 2 | `GET /inspections/:id/shipments` | **CREAR o VERIFICAR** formato `{ shipments: [...] }` | **CRITICA** |
| 3 | `GET /shipments/tracking/statuses` | **VERIFICAR** formato `{ statuses: [...] }` con todos los campos | **ALTA** |
| 4 | `PUT /shipments/:id/status` | **VERIFICAR** que acepte `tracking_point` en el body | **ALTA** |
| 5 | Entidad `Inspection` | **AGREGAR** campos financieros + `customs_channel` si no existen | **CRITICA** |

---

## Campos nuevos en Entidad Inspection (si no existen)

```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
total_product_cost: number;

@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
customs_taxes: number;

@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
logistics_services: number;

@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
pending_payment: number;

@Column({ type: 'varchar', length: 10, nullable: true })
customs_channel: string; // 'red' | 'yellow' | 'green' - asignado manualmente por admin
```

Migracion necesaria:
```sql
ALTER TABLE inspection ADD COLUMN total_product_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE inspection ADD COLUMN customs_taxes DECIMAL(10,2) DEFAULT 0;
ALTER TABLE inspection ADD COLUMN logistics_services DECIMAL(10,2) DEFAULT 0;
ALTER TABLE inspection ADD COLUMN pending_payment DECIMAL(10,2) DEFAULT 0;
ALTER TABLE inspection ADD COLUMN customs_channel VARCHAR(10) NULL;
```

---

## Archivos Frontend que Consumen Estos Endpoints

| Archivo Frontend | Endpoint que usa |
|-----------------|-----------------|
| `src/api/inspection.ts` → `getInspectionOrderSummary()` | `GET /inspections/:id/order-summary` |
| `src/api/inspection.ts` → `getInspectionShipments()` | `GET /inspections/:id/shipments` |
| `src/api/shipments.ts` → `getShipmentTrackingStatuses()` | `GET /shipments/tracking/statuses` |
| `src/api/shipments.ts` → `updateShipmentStatus()` | `PUT /shipments/:id/status` |
