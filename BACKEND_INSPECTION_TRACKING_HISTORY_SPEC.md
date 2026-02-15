# Solicitud al Backend (NestJS): Historial de Tracking del Producto con Mayor Estado

## Contexto

La vista de usuario final en `/dashboard/inspeccion-de-mercancias/:id` necesita mostrar el historial de tracking del producto que tiene el estado mas avanzado dentro de una inspeccion. Actualmente el mapa ya se posiciona segun el estado mayor de los productos en `content`, pero el panel lateral "Historial de Tracking" esta vacio porque no existe un endpoint que devuelva este historial.

---

## ENDPOINT NUEVO: Historial de Tracking por Inspeccion

```
GET /inspections/:id/tracking-history
```

**Estado:** NO EXISTE - NECESITA CREARSE

### Logica del Endpoint

1. Recibir el `id` de la inspeccion
2. Obtener la inspeccion con su array `content` (productos)
3. Determinar cual es el producto con el **estado mas avanzado** usando el orden de los estados (1-13)
4. Retornar el historial de cambios de estado de ese producto, ordenado del mas reciente al mas antiguo

### Mapeo de estados a orden (para determinar el mayor)

| Orden | Status Value | Label |
|-------|-------------|-------|
| 1 | `pending_arrival` | Pendiente llegada de producto |
| 2 | `in_inspection` | Proceso de inspeccion |
| 3 | `awaiting_pickup` | Pendiente de recojo |
| 4 | `in_transit_0` | En camino (0%) |
| 5 | `in_transit_50` | En camino (50%) |
| 6 | `in_transit_75` | En camino (75%) |
| 7 | `arrived_airport` | Llego al aeropuerto |
| 8 | `customs_inspection` | Entro inspeccion aduana |
| 9 | `customs_waiting` | Espera liberacion aduanal |
| 10 | `customs_delay` | Retraso en la liberacion |
| 11 | `customs_approved` | Liberacion aprobada |
| 12 | `waiting_boarding` | Espera de embarque |
| 13 | `boarding_confirmed` | Embarque confirmado |

**Ejemplo:** Si una inspeccion tiene 3 productos con estados `pending_arrival` (1), `in_transit_75` (6) y `in_inspection` (2), el endpoint debe retornar el historial del producto con status `in_transit_75` porque tiene el orden mas alto (6).

---

### Request

- **Metodo:** GET
- **URL:** `/inspections/:id/tracking-history`
- **Autenticacion:** Bearer Token (JWT)
- **Parametros URL:**
  - `id` (string, UUID) - ID de la inspeccion

### Response Esperada

El frontend espera EXACTAMENTE esta estructura JSON:

```json
{
  "product_id": "f5d4185f-3a09-4d45-8028-e61c15c41777",
  "product_name": "Producto ejemplo",
  "current_status": "in_transit_75",
  "current_tracking_point": 6,
  "history": [
    {
      "status": "in_transit_75",
      "label": "En camino (75%)",
      "tracking_point": 6,
      "timestamp": "2026-02-15T14:30:00Z",
      "notes": "Vehiculo proximo a llegar al aeropuerto"
    },
    {
      "status": "in_transit_50",
      "label": "En camino (50%)",
      "tracking_point": 5,
      "timestamp": "2026-02-14T10:00:00Z",
      "notes": "Vehiculo a mitad de camino"
    },
    {
      "status": "in_transit_0",
      "label": "En camino (0%)",
      "tracking_point": 4,
      "timestamp": "2026-02-13T08:00:00Z",
      "notes": "Vehiculo salio del almacen"
    },
    {
      "status": "awaiting_pickup",
      "label": "Pendiente de recojo",
      "tracking_point": 3,
      "timestamp": "2026-02-12T16:00:00Z",
      "notes": null
    },
    {
      "status": "in_inspection",
      "label": "Proceso de inspeccion",
      "tracking_point": 2,
      "timestamp": "2026-02-11T09:00:00Z",
      "notes": "Inspeccion de calidad iniciada"
    },
    {
      "status": "pending_arrival",
      "label": "Pendiente llegada de producto",
      "tracking_point": 1,
      "timestamp": "2026-02-10T08:00:00Z",
      "notes": "Producto registrado en el sistema"
    }
  ]
}
```

### Campos de la Response

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `product_id` | `string` | SI | UUID del producto con el estado mas avanzado |
| `product_name` | `string` | SI | Nombre del producto |
| `current_status` | `string` | SI | Status actual del producto (el mas avanzado) |
| `current_tracking_point` | `number` | SI | Numero del tracking point actual (1-13) |
| `history` | `array` | SI | Array de entradas del historial, ordenado del mas reciente al mas antiguo |

### Campos de cada entrada en `history`

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `status` | `string` | SI | Valor del estado (ej: `"in_transit_75"`) |
| `label` | `string` | SI | Etiqueta legible del estado (ej: `"En camino (75%)"`) |
| `tracking_point` | `number` | SI | Numero del punto en la ruta (1-13) |
| `timestamp` | `string` | SI | Fecha y hora del cambio en formato ISO 8601 |
| `notes` | `string \| null` | SI | Notas opcionales del cambio (puede ser `null`) |

---

## Requerimiento en Base de Datos

### Nueva tabla: `inspection_product_status_history`

Para poder retornar el historial, el backend necesita registrar cada cambio de estado de los productos. Crear la siguiente tabla:

```sql
-- =====================================================
-- TABLA: inspection_product_status_history
-- Descripcion: Historial de cambios de estado de productos de inspeccion
-- =====================================================

CREATE TABLE IF NOT EXISTS inspection_product_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL,
    product_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    tracking_point INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inspection
        FOREIGN KEY (inspection_id)
        REFERENCES inspection(id)
        ON DELETE CASCADE
);

-- Indices
CREATE INDEX idx_product_status_history_inspection
    ON inspection_product_status_history(inspection_id);
CREATE INDEX idx_product_status_history_product
    ON inspection_product_status_history(product_id);
CREATE INDEX idx_product_status_history_created
    ON inspection_product_status_history(created_at DESC);
```

### Registro automatico del historial

Cada vez que se actualiza el status de un producto (via `PUT /inspections/:inspectionId/products/:productId`), el backend debe insertar un registro en `inspection_product_status_history`:

```typescript
// Al actualizar un producto, ANTES de guardar el nuevo status:
await this.statusHistoryRepository.save({
  inspection_id: inspectionId,
  product_id: productId,
  status: newStatus,
  tracking_point: STATUS_ORDER_MAP[newStatus], // mapear status a tracking_point
  notes: dto.notes || null,
});
```

---

## Implementacion NestJS

### Entity

```typescript
// inspection-product-status-history.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('inspection_product_status_history')
export class InspectionProductStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inspection_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'int' })
  tracking_point: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
```

### Mapeo de status a tracking_point (constante del backend)

```typescript
// constants/inspection-status-order.ts

export const STATUS_ORDER_MAP: Record<string, number> = {
  pending_arrival: 1,
  in_inspection: 2,
  awaiting_pickup: 3,
  in_transit_0: 4,
  in_transit_50: 5,
  in_transit_75: 6,
  arrived_airport: 7,
  customs_inspection: 8,
  customs_waiting: 9,
  customs_delay: 10,
  customs_approved: 11,
  waiting_boarding: 12,
  boarding_confirmed: 13,
};

export const STATUS_LABEL_MAP: Record<string, string> = {
  pending_arrival: 'Pendiente llegada de producto',
  in_inspection: 'Proceso de inspeccion',
  awaiting_pickup: 'Pendiente de recojo',
  in_transit_0: 'En camino (0%)',
  in_transit_50: 'En camino (50%)',
  in_transit_75: 'En camino (75%)',
  arrived_airport: 'Llego al aeropuerto',
  customs_inspection: 'Entro inspeccion aduana',
  customs_waiting: 'Espera liberacion aduanal',
  customs_delay: 'Retraso en la liberacion',
  customs_approved: 'Liberacion aprobada',
  waiting_boarding: 'Espera de embarque',
  boarding_confirmed: 'Embarque confirmado',
};
```

### Service

```typescript
// inspections.service.ts (agregar este metodo)

async getTrackingHistory(inspectionId: string) {
  // 1. Obtener la inspeccion con sus productos
  const inspection = await this.inspectionRepository.findOne({
    where: { id: inspectionId },
  });

  if (!inspection) {
    throw new NotFoundException('Inspeccion no encontrada');
  }

  const products = inspection.content || [];

  if (!products.length) {
    return {
      product_id: null,
      product_name: null,
      current_status: inspection.tracking_status || 'pending_arrival',
      current_tracking_point: inspection.tracking_point || 1,
      history: [],
    };
  }

  // 2. Encontrar el producto con el estado mas avanzado
  let maxProduct = products[0];
  let maxOrder = STATUS_ORDER_MAP[products[0].status] || 1;

  for (const product of products) {
    const order = STATUS_ORDER_MAP[product.status] || 1;
    if (order > maxOrder) {
      maxOrder = order;
      maxProduct = product;
    }
  }

  // 3. Obtener el historial de ese producto
  const history = await this.statusHistoryRepository.find({
    where: {
      inspection_id: inspectionId,
      product_id: maxProduct.product_id,
    },
    order: { created_at: 'DESC' },
  });

  // 4. Retornar con labels
  return {
    product_id: maxProduct.product_id,
    product_name: maxProduct.name,
    current_status: maxProduct.status,
    current_tracking_point: STATUS_ORDER_MAP[maxProduct.status] || 1,
    history: history.map((entry) => ({
      status: entry.status,
      label: STATUS_LABEL_MAP[entry.status] || entry.status,
      tracking_point: entry.tracking_point,
      timestamp: entry.created_at.toISOString(),
      notes: entry.notes || null,
    })),
  };
}
```

### Controller

```typescript
// inspections.controller.ts (agregar este endpoint)

@Get(':id/tracking-history')
@UseGuards(JwtAuthGuard)
async getTrackingHistory(@Param('id') id: string) {
  return this.inspectionsService.getTrackingHistory(id);
}
```

---

## Modificacion al Endpoint Existente de Actualizar Producto

El endpoint `PUT /inspections/:inspectionId/products/:productId` debe registrar el historial automaticamente:

```typescript
// inspections.service.ts - metodo updateProduct (MODIFICAR)

async updateProduct(
  inspectionId: string,
  productId: string,
  dto: UpdateProductDto,
) {
  const inspection = await this.findById(inspectionId);
  const product = inspection.content.find(p => p.product_id === productId);

  if (!product) {
    throw new NotFoundException('Producto no encontrado');
  }

  // Registrar en el historial ANTES de actualizar
  if (dto.status && dto.status !== product.status) {
    await this.statusHistoryRepository.save({
      inspection_id: inspectionId,
      product_id: productId,
      status: dto.status,
      tracking_point: STATUS_ORDER_MAP[dto.status] || 1,
      notes: dto.notes || null,
    });
  }

  // Actualizar el producto (logica existente)
  product.status = dto.status;
  product.files = dto.files;

  return this.inspectionRepository.save(inspection);
}
```

---

## Flujo Completo

```
Admin actualiza status de producto
         |
         v
PUT /inspections/:id/products/:productId
  body: { status: "in_transit_75", files: [...] }
         |
         v
Backend:
  1. Inserta registro en inspection_product_status_history
  2. Actualiza product.status en el JSON content
  3. Guarda la inspeccion
         |
         v
Usuario final entra a la vista de detalle
         |
         v
GET /inspections/:id/tracking-history
         |
         v
Backend:
  1. Obtiene la inspeccion con content[]
  2. Busca el producto con status de mayor orden
  3. Consulta inspection_product_status_history para ese product_id
  4. Retorna el historial con labels
         |
         v
Frontend muestra el historial en el panel lateral
```

---

## Caso Especial: Empate de Estados

Si dos o mas productos tienen el mismo estado (mayor), retornar el historial del primero encontrado. No es necesario mezclar historiales de multiples productos.

---

## Caso Especial: Inspeccion Sin Productos

Si la inspeccion no tiene productos en `content`, retornar:

```json
{
  "product_id": null,
  "product_name": null,
  "current_status": "pending_arrival",
  "current_tracking_point": 1,
  "history": []
}
```

---

## Resumen

| Componente | Accion | Prioridad |
|------------|--------|-----------|
| Tabla `inspection_product_status_history` | **CREAR** - No existe | **CRITICA** |
| `GET /inspections/:id/tracking-history` | **CREAR** - Endpoint nuevo | **CRITICA** |
| `PUT /inspections/:id/products/:productId` | **MODIFICAR** - Agregar registro de historial automatico | **CRITICA** |

---

## Archivo Frontend que Consumira Este Endpoint

| Archivo Frontend | Endpoint que usa |
|-----------------|-----------------|
| `src/api/inspection.ts` → `getInspectionTrackingHistory()` | `GET /inspections/:id/tracking-history` |
| `src/hooks/use-inspections.ts` → `useGetInspectionTrackingHistory()` | Hook de TanStack Query |
| `src/pages/inspeccion-de-mercancias/inspeccion-de-mercancias-detail.tsx` | Componente que consume el hook |
