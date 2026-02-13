# Especificacion Backend: Vista de Inspeccion de Mercancias (Usuario)

## Contexto

La vista "Inspeccion de Mercancias" es una pagina orientada al usuario final (no admin) donde puede ver el resumen financiero de su inspeccion, el canal aduanero asignado, y el estado de los shipments vinculados a esa inspeccion.

Se necesitan 2 nuevos endpoints que devuelven informacion agregada para esta vista.

---

## 1. Endpoint: Resumen del Pedido

```
GET /inspections/:id/order-summary
```

Devuelve el resumen financiero y el canal aduanero de una inspeccion. Este endpoint es consumido por la vista de usuario para mostrar costos y el semaforo aduanero.

### Response

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

### Descripcion de Campos

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `cargo_type` | `string` | Tipo de carga: `"general"` o `"imo_mixta"` (coincide con `CargoType` existente) |
| `cargo_type_label` | `string` | Etiqueta legible del tipo de carga (e.g., `"Carga General"`, `"IMO / Mixta"`) |
| `total_product_cost` | `number` | Costo total de los productos en la inspeccion |
| `customs_taxes` | `number` | Impuestos aduaneros aplicados |
| `logistics_services` | `number` | Costo de servicios logisticos |
| `pending_payment` | `number` | Monto pendiente de pago |
| `customs_channel` | `string` | Canal aduanero asignado: `"red"` \| `"yellow"` \| `"green"` |

### Interface TypeScript

```typescript
export type CustomsChannel = 'red' | 'yellow' | 'green';

export interface InspectionOrderSummary {
  cargo_type: string;
  cargo_type_label: string;
  total_product_cost: number;
  customs_taxes: number;
  logistics_services: number;
  pending_payment: number;
  customs_channel: CustomsChannel;
}
```

### Notas de Implementacion

- El campo `customs_channel` es establecido manualmente por el administrador desde el panel de gestion.
- Los valores monetarios son numeros (no strings). El frontend se encarga del formateo.
- El `cargo_type` debe coincidir con el tipo `CargoType` ya definido en la entidad de inspeccion: `'general' | 'imo_mixta'`.
- Si la inspeccion no tiene canal aduanero asignado aun, se puede devolver `null` o un valor por defecto.

---

## 2. Endpoint: Shipments de una Inspeccion

```
GET /inspections/:id/shipments
```

Devuelve todos los shipments vinculados a una inspeccion especifica. El frontend usa esta informacion para mostrar el estado de los envios y la posicion en el mapa.

### Response

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
      "inspection_id": "uuid-inspection",
      "estimated_date": "2026-03-01",
      "created_at": "2026-02-01T08:00:00Z",
      "updated_at": "2026-02-12T10:30:00Z"
    }
  ]
}
```

### Descripcion de Campos

Cada shipment en el array sigue la interface `Shipment` existente:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | `string` | UUID del shipment |
| `correlative` | `string` | Correlativo legible (e.g., `SHP-001`) |
| `origin` | `string` | Ciudad de origen |
| `destination` | `string` | Ciudad de destino |
| `weight` | `number` | Peso del envio |
| `container_type` | `string?` | Tipo de contenedor (opcional, solo maritimo) |
| `status` | `ShipmentStatus` | Estado general del shipment |
| `current_location` | `string` | Ubicacion actual |
| `tracking_point` | `number` | Punto actual en la ruta (14-45, segun BACKEND_SHIPMENT_TRACKING_SPEC.md) |
| `progress` | `number` | Progreso 0-100 |
| `shipping_type` | `string` | Tipo de envio: `"aerial"` o `"maritime"` |
| `status_history` | `array` | Historial de estados |
| `inspection_id` | `string` | UUID de la inspeccion vinculada |
| `estimated_date` | `string?` | Fecha estimada de llegada |
| `created_at` | `string` | Fecha de creacion |
| `updated_at` | `string` | Fecha de ultima actualizacion |

### Interface TypeScript

```typescript
import { Shipment } from './shipmentInterface';

export interface InspectionShipmentsResponse {
  shipments: Shipment[];
}
```

### Notas de Implementacion

- El endpoint filtra shipments por `inspection_id` que coincida con el `:id` del path.
- El `tracking_point` de cada shipment esta en el rango 14-45 (ver BACKEND_SHIPMENT_TRACKING_SPEC.md).
- El frontend usa el **maximo `tracking_point`** entre todos los shipments para determinar la posicion a mostrar en el mapa.
- Si la inspeccion no tiene shipments vinculados, devolver un array vacio: `{ "shipments": [] }`.
- Los shipments deben venir ordenados por `created_at` (mas reciente primero) o por `correlative`.

---

## 3. Autenticacion y Autorizacion

- Ambos endpoints requieren autenticacion via Bearer token (JWT).
- El usuario solo puede acceder a inspecciones que le pertenecen.
- Los administradores pueden acceder a cualquier inspeccion.

---

## 4. Codigos de Error

| Codigo | Descripcion |
|--------|-------------|
| `401` | Token no proporcionado o invalido |
| `403` | El usuario no tiene permiso para ver esta inspeccion |
| `404` | Inspeccion no encontrada |

---

## 5. Resumen de Cambios Requeridos

| Componente | Accion | Prioridad |
|------------|--------|-----------|
| `GET /inspections/:id/order-summary` | CREAR - Devuelve resumen financiero y canal aduanero | ALTA |
| `GET /inspections/:id/shipments` | CREAR - Devuelve shipments vinculados a la inspeccion | ALTA |
| Entidad `Inspection` | VERIFICAR - Que tenga campo `customs_channel` (si no existe, agregar) | ALTA |
| Entidad `Inspection` | VERIFICAR - Que tenga campos de costos o relacion con tabla de costos | MEDIA |

---

## 6. Flujo de Uso en el Frontend

```
+---------------------------------------------------------------+
|  1. Usuario navega a /inspeccion-de-mercancias/:id             |
+---------------------------------------------------------------+
                          |
                          v
+---------------------------------------------------------------+
|  2. Frontend hace 2 requests en paralelo:                      |
|     - GET /inspections/:id/order-summary                       |
|     - GET /inspections/:id/shipments                           |
+---------------------------------------------------------------+
                          |
                          v
+---------------------------------------------------------------+
|  3. Se muestra:                                                |
|     - Semaforo aduanero (rojo/amarillo/verde)                  |
|     - Tarjetas con costos y pagos pendientes                   |
|     - Mapa con tracking del shipment mas avanzado              |
|     - Historial de estados de cada shipment                    |
+---------------------------------------------------------------+
```

---

## Archivos Frontend Relevantes

- `src/api/interface/inspectionInterface.ts` - Interfaces del order summary
- `src/api/interface/shipmentInterface.ts` - Interface Shipment existente
- `src/api/inspection.ts` - Funciones API
- `src/hooks/use-inspections.ts` - Hooks de React Query
