# Inspeccion de Mercancias - Vista Usuario Final

## Contexto

Vista de solo lectura para usuarios con rol `final` que muestra el estado de su pedido/inspeccion con informacion financiera, mapa de tracking, canal aduanero y historial de estados.

## Layout

```
+-------------------------------------------------------+-------------------+
| HEADER: <- Volver | Inspeccion de Mercancias   ID:xxx  |                   |
+-------------------------------------------------------+-------------------+
|                                                        | CANAL ADUANERO    |
|                                                        |   R  A  V         |
|                    MAPA                                +-------------------+
|         (ShipmentRouteTrackingMap)                     |                   |
|  currentPointNumber = max(tracking_point de shipments) | HISTORIAL DE      |
|  serviceType = inspection.shipping_service_type        | TRACKING          |
|  cargoType = inspection.cargo_type                     | (status_history)  |
|                                                        |                   |
+-------------------------------------------------------+-------------------+
| TIPO MERCANCIA | COSTO TOTAL  | IMPUESTOS  | SERV.LOGISTICOS | PAGO PEND.|
| CARGA GENERAL  | $125.000     | $15.000    | $25.000         |  $40.000  |
+-------------------------------------------------------+-------------------+
```

## Estructura de Archivos

```
src/pages/inspeccion-de-mercancias/
  inspeccion-de-mercancias-list.tsx      # Lista (reutiliza logica existente, navega a ruta de usuario)
  inspeccion-de-mercancias-detail.tsx    # Vista detalle (NUEVA)
  components/
    order-info-cards.tsx                 # Cards financieras (bottom row)
    customs-channel-badge.tsx            # Semaforo canal aduanero
    tracking-history-panel.tsx           # Panel historial de tracking
```

## Fuentes de Datos

| Dato | Fuente | Estado |
|------|--------|--------|
| Datos basicos inspeccion | GET /inspections/:id | Existente |
| Shipments vinculados | GET /inspections/:id/shipments | NUEVO |
| Resumen financiero + Canal | GET /inspections/:id/order-summary | NUEVO |
| Max tracking point (mapa) | max(shipments[].tracking_point) | Calculado frontend |
| Historial de tracking | shipments[].status_history agregado | Calculado frontend |

## Componentes

### 1. Semaforo Canal Aduanero
- 3 circulos: Rojo, Amarillo, Verde
- Solo se ilumina la luz correspondiente al valor `customs_channel`
- Las demas quedan opacas (gris claro)

### 2. Tracking Point del Mapa
- Max tracking_point entre todos los shipments vinculados
- Si no hay shipments, usa tracking_point de la inspeccion (1-13)
- Reutiliza ShipmentRouteTrackingMap con serviceType, cargoType, currentPointNumber

### 3. Historial de Tracking
- Timeline vertical con status_history agregado de todos los shipments
- Ordenado por timestamp descendente
- Muestra: estado, ubicacion, fecha, notas

### 4. Cards Financieras (bottom row)
- Tipo de Mercancia (cargo_type_label)
- Costo Total Producto
- Impuestos Aduaneros
- Servicios Logisticos
- Pago Pendiente

## Rutas

| Ruta | Componente | Rol |
|------|-----------|-----|
| /dashboard/inspeccion-de-mercancias | Lista inspecciones | final |
| /dashboard/inspeccion-de-mercancias/:id | Detail view (NUEVA) | final |

## Endpoints Backend Nuevos

Documentados en BACKEND_INSPECCION_MERCANCIAS_SPEC.md
