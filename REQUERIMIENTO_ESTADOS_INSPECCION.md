# Requerimiento Backend: Endpoint de Estados de Inspección

## Contexto

El frontend necesita obtener la lista de estados disponibles para el tracking de inspección (puntos 1-13) desde el backend. Actualmente los estados están hardcodeados en el frontend, pero deben ser dinámicos y venir desde la base de datos.

---

## 1. Endpoint Requerido

### GET /inspections/tracking/statuses

Retorna todos los estados disponibles para el tracking de inspección.

#### Request

- **Método:** GET
- **URL:** `/inspections/tracking/statuses`
- **Autenticación:** Bearer Token (JWT)

#### Response

```typescript
interface InspectionTrackingStatus {
  id: string;                    // UUID del estado
  order: number;                 // Orden del punto (1-13)
  value: string;                 // Valor técnico (ej: "pending", "in_inspection")
  label: string;                 // Etiqueta para mostrar al usuario
  description?: string;          // Descripción opcional
  phase: 'first_mile' | 'customs'; // Fase del tracking
  isOptional: boolean;           // Si el estado es opcional (ej: retraso)
  isActive: boolean;             // Si el estado está activo
}

// Response
{
  statuses: InspectionTrackingStatus[];
}
```

#### Ejemplo de Response

```json
{
  "statuses": [
    {
      "id": "uuid-1",
      "order": 1,
      "value": "pending_arrival",
      "label": "Pendiente llegada de producto",
      "description": "El producto aún no ha llegado al almacén",
      "phase": "first_mile",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-2",
      "order": 2,
      "value": "in_inspection",
      "label": "Proceso de inspección",
      "description": "El producto está siendo inspeccionado",
      "phase": "first_mile",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-3",
      "order": 3,
      "value": "awaiting_pickup",
      "label": "Pendiente de recojo",
      "description": "El producto está listo para ser recogido",
      "phase": "first_mile",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-4",
      "order": 4,
      "value": "in_transit_0",
      "label": "En camino (0%)",
      "description": "Vehículo salió del almacén",
      "phase": "first_mile",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-5",
      "order": 5,
      "value": "in_transit_50",
      "label": "En camino (50%)",
      "description": "Vehículo a mitad de camino",
      "phase": "first_mile",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-6",
      "order": 6,
      "value": "in_transit_75",
      "label": "En camino (75%)",
      "description": "Vehículo próximo a llegar",
      "phase": "first_mile",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-7",
      "order": 7,
      "value": "arrived_airport",
      "label": "Llegó al aeropuerto",
      "description": "Vehículo llegó al aeropuerto",
      "phase": "first_mile",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-8",
      "order": 8,
      "value": "customs_inspection",
      "label": "Entró inspección aduana",
      "description": "Producto en inspección aduanal",
      "phase": "customs",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-9",
      "order": 9,
      "value": "customs_waiting",
      "label": "Espera liberación aduanal",
      "description": "Esperando liberación de aduana",
      "phase": "customs",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-10",
      "order": 10,
      "value": "customs_delay",
      "label": "Retraso en la liberación",
      "description": "Hay un retraso en el proceso aduanal",
      "phase": "customs",
      "isOptional": true,
      "isActive": true
    },
    {
      "id": "uuid-11",
      "order": 11,
      "value": "customs_approved",
      "label": "Liberación aprobada",
      "description": "Aduana aprobó la liberación",
      "phase": "customs",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-12",
      "order": 12,
      "value": "waiting_boarding",
      "label": "Espera de embarque",
      "description": "Producto esperando embarque",
      "phase": "customs",
      "isOptional": false,
      "isActive": true
    },
    {
      "id": "uuid-13",
      "order": 13,
      "value": "boarding_confirmed",
      "label": "Embarque confirmado",
      "description": "Producto embarcado exitosamente",
      "phase": "customs",
      "isOptional": false,
      "isActive": true
    }
  ]
}
```

---

## 2. Script SQL para la Tabla de Estados

### Archivo: `inspection_tracking_statuses.sql`

```sql
-- =====================================================
-- TABLA: inspection_tracking_statuses
-- Descripción: Estados disponibles para el tracking de inspección (puntos 1-13)
-- =====================================================

CREATE TABLE IF NOT EXISTS inspection_tracking_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order" INTEGER NOT NULL UNIQUE,
    value VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    phase VARCHAR(20) NOT NULL CHECK (phase IN ('first_mile', 'customs')),
    is_optional BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_inspection_tracking_statuses_order ON inspection_tracking_statuses("order");
CREATE INDEX idx_inspection_tracking_statuses_phase ON inspection_tracking_statuses(phase);
CREATE INDEX idx_inspection_tracking_statuses_active ON inspection_tracking_statuses(is_active);

-- =====================================================
-- DATOS INICIALES: 13 estados de inspección
-- =====================================================

INSERT INTO inspection_tracking_statuses ("order", value, label, description, phase, is_optional, is_active)
VALUES
    -- Primera Milla (first_mile) - Puntos 1-7
    (1, 'pending_arrival', 'Pendiente llegada de producto', 'El producto aún no ha llegado al almacén', 'first_mile', FALSE, TRUE),
    (2, 'in_inspection', 'Proceso de inspección', 'El producto está siendo inspeccionado', 'first_mile', FALSE, TRUE),
    (3, 'awaiting_pickup', 'Pendiente de recojo', 'El producto está listo para ser recogido', 'first_mile', FALSE, TRUE),
    (4, 'in_transit_0', 'En camino (0%)', 'Vehículo salió del almacén', 'first_mile', FALSE, TRUE),
    (5, 'in_transit_50', 'En camino (50%)', 'Vehículo a mitad de camino', 'first_mile', FALSE, TRUE),
    (6, 'in_transit_75', 'En camino (75%)', 'Vehículo próximo a llegar', 'first_mile', FALSE, TRUE),
    (7, 'arrived_airport', 'Llegó al aeropuerto', 'Vehículo llegó al aeropuerto', 'first_mile', FALSE, TRUE),

    -- Aduana (customs) - Puntos 8-13
    (8, 'customs_inspection', 'Entró inspección aduana', 'Producto en inspección aduanal', 'customs', FALSE, TRUE),
    (9, 'customs_waiting', 'Espera liberación aduanal', 'Esperando liberación de aduana', 'customs', FALSE, TRUE),
    (10, 'customs_delay', 'Retraso en la liberación', 'Hay un retraso en el proceso aduanal', 'customs', TRUE, TRUE),
    (11, 'customs_approved', 'Liberación aprobada', 'Aduana aprobó la liberación', 'customs', FALSE, TRUE),
    (12, 'waiting_boarding', 'Espera de embarque', 'Producto esperando embarque', 'customs', FALSE, TRUE),
    (13, 'boarding_confirmed', 'Embarque confirmado', 'Producto embarcado exitosamente', 'customs', FALSE, TRUE)
ON CONFLICT (value) DO NOTHING;

-- =====================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_inspection_tracking_statuses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inspection_tracking_statuses_updated_at
    BEFORE UPDATE ON inspection_tracking_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_inspection_tracking_statuses_updated_at();
```

---

## 3. Servicio NestJS (Ejemplo)

```typescript
// inspection-tracking-statuses.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InspectionTrackingStatus } from './entities/inspection-tracking-status.entity';

@Injectable()
export class InspectionTrackingStatusesService {
  constructor(
    @InjectRepository(InspectionTrackingStatus)
    private readonly statusRepository: Repository<InspectionTrackingStatus>,
  ) {}

  async findAll(): Promise<{ statuses: InspectionTrackingStatus[] }> {
    const statuses = await this.statusRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    return { statuses };
  }

  async findByOrder(order: number): Promise<InspectionTrackingStatus | null> {
    return this.statusRepository.findOne({
      where: { order, isActive: true },
    });
  }

  async findByValue(value: string): Promise<InspectionTrackingStatus | null> {
    return this.statusRepository.findOne({
      where: { value, isActive: true },
    });
  }
}
```

---

## 4. Controller NestJS (Ejemplo)

```typescript
// inspection-tracking-statuses.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InspectionTrackingStatusesService } from './inspection-tracking-statuses.service';

@Controller('inspections/tracking')
@UseGuards(JwtAuthGuard)
export class InspectionTrackingStatusesController {
  constructor(
    private readonly statusesService: InspectionTrackingStatusesService,
  ) {}

  @Get('statuses')
  async getStatuses() {
    return this.statusesService.findAll();
  }
}
```

---

## 5. Entity TypeORM (Ejemplo)

```typescript
// inspection-tracking-status.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('inspection_tracking_statuses')
export class InspectionTrackingStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  order: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  value: string;

  @Column({ type: 'varchar', length: 100 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  phase: 'first_mile' | 'customs';

  @Column({ name: 'is_optional', type: 'boolean', default: false })
  isOptional: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

## 6. Resumen de Endpoints Requeridos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/inspections/tracking/statuses` | Obtener todos los estados activos |
| PUT | `/inspections/:id/tracking/status` | Actualizar estado de una inspección (ya existente) |

---

## 7. Notas Importantes

1. **Los 13 estados son fijos** pero vienen de la base de datos para facilitar:
   - Cambios en etiquetas sin deploy de frontend
   - Internacionalización futura
   - Auditoría de cambios

2. **El estado 10 (customs_delay) es opcional** - No siempre ocurre un retraso

3. **La fase determina el color/icono en el mapa**:
   - `first_mile`: Puntos 1-7 (verde en completados)
   - `customs`: Puntos 8-13 (azul en completados)

4. **El campo `is_active`** permite desactivar estados sin eliminarlos

5. **El frontend consumirá este endpoint** para poblar el selector de estados dinámicamente
