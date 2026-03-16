# Diseño: Manejo de productos sin cotizar en vistas de respuesta

**Fecha:** 2026-03-15
**Contexto:** Cambios backend documentados en `CAMBIOS_FRONTEND_2026-03-15.md`

## Problema

El endpoint `GET /quotation-responses/get-responses/:quotationId` ahora puede incluir productos con `isQuoted: false` y precios en `0` cuando el cliente agrega productos después de que el admin ya respondió. El frontend debe mostrar estos productos diferenciados visualmente para que tanto el cliente como el admin sepan que están pendientes de cotizar.

## Alcance

Tres archivos afectados, sin cambios en lógica de negocio ni DTOs:

### 1. `pending-service-view.tsx`
- Pasar `isQuoted: product.isQuoted` en el objeto mapeado hacia `QuotationProductRowView`

### 2. `QuotationProductRowView.tsx`
- Agregar `isQuoted?: boolean` a la interfaz `PendingProduct`
- Cuando `isQuoted === false`: mostrar badge "Sin cotizar" en ámbar sobre el número del producto
- Columnas PRECIO / EXPRESS / P. TOTAL: mantener `$0.00` pero con colores neutros (gris)

### 3. `EditableUnitCostTableView.tsx`
- Cuando `seCotiza === false`: mostrar badge "Pendiente" en ámbar sobre el nombre del producto
- Fila con fondo ámbar suave para distinguirla visualmente

## Decisiones de diseño

- No filtrar productos con `isQuoted: false` — mostrarlos siempre para que el admin sepa que deben completarse
- No cambiar lógica de totales — los `$0.00` se suman correctamente (no afectan)
- Sin cambios en DTOs ni en la capa API
- Solo cambios visuales (badges + color de fila)

## Archivos NO modificados

- `complete-service-view.tsx` — ya mapea `seCotiza` correctamente
- `quotation-responses.ts` — sin cambios en API
- `use-quatitation-response.tsx` — sin cambios en hooks
