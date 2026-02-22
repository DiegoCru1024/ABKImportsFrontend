# Requerimientos de Backend - Dashboard del Cliente

## Endpoint Nuevo Requerido

### `GET /inspections/active`

**Descripcion:** Obtiene la inspeccion activa mas antigua del usuario autenticado que aun no ha sido completada (es decir, que no ha llegado al ultimo punto de tracking).

**Autenticacion:** Bearer Token (JWT) - se identifica al usuario por el token.

**Logica del Backend:**
1. Filtrar las inspecciones del usuario autenticado.
2. Excluir las inspecciones que ya estan en el ultimo punto de tracking (punto 13 para inspecciones sin shipment, o el punto final del shipment vinculado).
3. Ordenar por fecha de creacion ascendente (la mas antigua primero).
4. Retornar la primera inspeccion que cumpla con los criterios.

**Response (200 OK):**
```json
{
  "id": "string",
  "shipping_service_type": "aerial" | "maritime",
  "logistics_service": "string",
  "updated_at": "string (ISO 8601)",
  "content": [
    {
      "product_id": "string",
      "name": "string",
      "quantity": number,
      "express_price": "string",
      "status": "string",
      "files": ["string"]
    }
  ],
  "total_price": "string",
  "origin": "string | null",
  "tracking_status": "string | null",
  "tracking_point": number,
  "cargo_type": "general" | "imo_mixta"
}
```

**Response (204 No Content):**
Cuando el usuario no tiene inspecciones activas (todas completadas o no tiene ninguna).

---

## Endpoints Existentes Reutilizados

Los siguientes endpoints ya existen y se reutilizan en el dashboard:

### 1. `GET /inspections?page=1&size=10`
- Lista paginada de inspecciones del usuario.
- Se usa en el cuadrante inferior izquierdo del dashboard para el listado de pedidos.

### 2. `GET /inspections/:id/order-summary`
- Resumen financiero y canal aduanero de una inspeccion.
- Se usa para mostrar las tarjetas de informacion del pedido activo.

### 3. `GET /inspections/:id/tracking-history`
- Historial de tracking del producto con mayor estado.
- Se usa para mostrar la linea de tiempo en el preview de inspeccion.

### 4. `GET /inspections/:id/shipments`
- Shipments vinculados a una inspeccion.
- Se usa para determinar el tracking point del shipment vinculado.

---

## Consideraciones

- Un cliente puede tener uno o varios envios (inspecciones).
- El dashboard debe mostrar por defecto la inspeccion que aun no se ha completado, priorizando la mas antigua.
- Una inspeccion se considera completada cuando su `tracking_point` ha llegado al ultimo punto (13 para inspecciones, o el punto final del shipment si tiene uno vinculado).
- Si el usuario no tiene inspecciones activas, el cuadrante superior izquierdo debe mostrar un estado vacio invitando a cotizar.

---

## Alternativa Sin Endpoint Nuevo

Si no se desea crear un nuevo endpoint, se puede usar el endpoint existente `GET /inspections?page=1&size=100` y filtrar en el frontend la inspeccion activa mas antigua. Sin embargo, esta alternativa tiene la desventaja de traer todas las inspecciones solo para buscar una, lo cual es ineficiente con muchos registros.

**Recomendacion:** Crear el endpoint `GET /inspections/active` para optimizar la carga del dashboard.
