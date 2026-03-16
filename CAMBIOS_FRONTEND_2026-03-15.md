# Cambios Backend - 2026-03-15

## Resumen

Se realizaron dos tipos de cambios:
1. **Mejoras internas** (refactoring, performance) — no afectan el frontend
2. **Nueva funcionalidad: sincronización de productos** — **sí requiere atención del frontend**

---

## 1. Mejoras internas (sin impacto en frontend)

### Correcciones de calidad
- Se reemplazaron strings mágicos (`'COTIZACION DE ORIGEN'`, `'MARITIME'`) por constantes del enum `ServiceType`. Sin cambio en los valores enviados/recibidos.
- Se corrigió un bug menor donde la versión de una sub-cotización se calculaba con una condición redundante (sin efecto observable desde frontend).

### Mejora de performance
- Las consultas de porcentajes de ganancia al guardar una respuesta ahora se hacen en **un solo query batch** en vez de una query por variante. Esto reduce el tiempo de respuesta del endpoint `POST /quotation/:quotationId/complete-service` notablemente cuando hay muchos productos.

---

## 2. Nueva funcionalidad: Productos sincronizados entre cotización y respuestas

### El problema que resuelve

Cuando un **cliente modifica su cotización** después de que el admin ya la respondió (agrega o quita productos), esos cambios ahora se reflejan automáticamente en **todas las respuestas existentes** (COTIZACION DE ORIGEN, EXPRESS y MARITIME).

### Comportamiento por caso

#### Caso A — Cliente **agrega** un producto a la cotización

- **Backend write**: se crean automáticamente registros vacíos (`isQuoted: false`, precios en `0`) para ese producto en todas las sub-cotizaciones activas.
- **Backend read**: si por alguna razón el registro no existe aún, el endpoint `GET /quotation-responses/get-responses/:quotationId` **lo incluye igualmente** con valores por defecto.
- **Frontend**: el producto nuevo aparecerá en la lista de productos de cada sub-cotización con `isQuoted: false` y precios en cero. El admin deberá completar esa información al editar la respuesta.

#### Caso B — Cliente **elimina** un producto de la cotización

- El producto se marca como `is_active: false` en base de datos (si ya tenía respuestas asociadas).
- **El endpoint ya filtraba por `is_active`**, así que el producto simplemente dejará de aparecer en las respuestas. No hay cambio en la lógica del frontend.

---

## 3. Cambio en estructura de respuesta

### Endpoint afectado

```
GET /quotation-responses/get-responses/:quotationId
```

### ¿Qué cambió?

El array `products` dentro de cada elemento de `responses` **puede ahora incluir productos con precios en cero** si el cliente añadió productos después de que el admin respondió.

### Estructura de un producto **sin respuesta aún** (COTIZACION DE ORIGEN)

```json
{
  "productId": "uuid-del-producto",
  "isQuoted": false,
  "adminComment": null,
  "ghostUrl": null,
  "packingList": null,
  "cargoHandling": null,
  "variants": [
    {
      "variantId": "uuid-de-variante",
      "quantity": 5,
      "isQuoted": false,
      "pendingPricing": {
        "unitPrice": 0,
        "expressPrice": 0
      }
    }
  ]
}
```

### Estructura de un producto **sin respuesta aún** (EXPRESS o MARITIME)

```json
{
  "productId": "uuid-del-producto",
  "isQuoted": false,
  "pricing": null,
  "variants": [
    {
      "variantId": "uuid-de-variante",
      "quantity": 5,
      "isQuoted": false,
      "completePricing": {
        "unitCost": 0
      }
    }
  ]
}
```

> **Nota**: La estructura es idéntica a la de siempre. Solo puede haber más productos de lo esperado, con `isQuoted: false` y precios en `0`. El frontend ya debería manejar este caso, pero verificar que no haya lógica que asuma que todos los productos tienen precio > 0.

---

## 4. Checklist para el equipo frontend

- [ ] Verificar que la vista de detalle de respuesta (`get-responses`) maneja correctamente productos con `isQuoted: false` y precios en `0` (no dividir entre cero, no asumir precio obligatorio).
- [ ] En la vista de edición de respuesta, mostrar los productos nuevos como "sin cotizar" para que el admin los complete.
- [ ] No hay cambios en los endpoints de creación/actualización de respuestas (`POST`, `PATCH`). El flujo del admin para responder sigue igual.
- [ ] No hay cambios en DTOs de entrada (request body). Solo cambia el response del GET.

---

## Endpoints sin cambios

Todos los demás endpoints del módulo `quotation-responses` no tuvieron cambios:

| Método | Ruta | Estado |
|--------|------|--------|
| `POST` | `/quotation/:quotationId/complete-service` | Sin cambios (más rápido) |
| `GET` | `/details/:subquotationResponseId/:serviceType` | Sin cambios |
| `GET` | `/get-responses/:quotationId` | **Puede incluir más productos** |
| `GET` | `/list-responses/:quotationId` | Sin cambios |
| `PATCH` | `/update-responses/:subQuotationId/:quotationId` | Sin cambios |
| `GET` | `/list-subquotations/:quotationId` | Sin cambios |
| `GET` | `/checkRespuestas/:quotationId` | Sin cambios |
| `DELETE` | `/:id` | Sin cambios |
| `PATCH` | `/:id/status` | Sin cambios |
| `GET` | `/available-for-purchase-order` | Sin cambios |
| `GET` | `/list-profit-percentages` | Sin cambios |
