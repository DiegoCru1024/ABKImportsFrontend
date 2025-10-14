# Cambios en el DTO de Respuesta de Cotización

## Fecha de Actualización
**Fecha:** 12 de Octubre, 2025

## Resumen
Este documento detalla los cambios implementados en la estructura del DTO (Data Transfer Object) para las respuestas de cotización en el sistema ABKImports. Los cambios se enfocan en tres áreas principales: cálculos de servicio, obligaciones fiscales y estructura de productos.

---

## 1. Cálculos de Servicio (serviceCalculations)

### Estructura Anterior
```json
{
  "serviceCalculations": {
    "serviceFields": {
      "servicioConsolidado": 100,
      "separacionCarga": 0,
      "seguroProductos": 0,
      "inspeccionProductos": 0,
      "gestionCertificado": 20,
      "inspeccionProducto": 30,
      "transporteLocal": 0
    },
    "subtotalServices": 150,
    "igvServices": 27,
    "totalServices": 177
  }
}
```

### Estructura Nueva
```json
{
  "serviceCalculations": {
    "serviceFields": {
      "servicioConsolidado": 100.00,
      "separacionCarga": 0.00,
      "seguroProductos": 0.00,
      "inspeccionProductos": 0.00,
      "gestionCertificado": 20.00,
      "inspeccionProducto": 30.00,
      "transporteLocal": 0.00,
      "transporteLocalChina": 50.00,
      "transporteLocalDestino": 30.00,
      "otrosServicios": 15.00
    },
    "subtotalServices": 245.00,
    "igvServices": 44.10,
    "totalServices": 289.10
  }
}
```

### Campos Modificados

#### `transporteLocalChina` (NUEVO)
- **Tipo:** `number`
- **Descripción:** Valor del transporte local en China desde el componente de Carga Consolidada (CARGA - ADUANA).
- **Origen:** Campo "TRANSPORTE LOCAL (CHINA)" del formulario `UnifiedConfigurationForm`.
- **Cálculo:** Valor directo ingresado por el usuario o calculado según la logística del servicio.
- **Formato:** Redondeado a 2 decimales.
- **Aplica a servicios:**
  - Consolidado Maritimo
  - Consolidado Grupal Maritimo
  - Consolidado Express
  - Consolidado Grupal Express

#### `transporteLocalDestino` (NUEVO)
- **Tipo:** `number`
- **Descripción:** Valor del transporte local en el país de destino desde el componente de Carga Consolidada (CARGA - ADUANA).
- **Origen:** Campo "TRANSPORTE LOCAL (DESTINO)" del formulario `UnifiedConfigurationForm`.
- **Cálculo:** Valor directo ingresado por el usuario según el destino final de la mercancía.
- **Formato:** Redondeado a 2 decimales.
- **Aplica a servicios:**
  - Consolidado Maritimo
  - Consolidado Grupal Maritimo
  - Consolidado Express
  - Consolidado Grupal Express

#### `otrosServicios` (NUEVO)
- **Tipo:** `number`
- **Descripción:** Valor de servicios adicionales no contemplados en las categorías principales (servicios especiales, manejo especial de carga, etc.).
- **Origen:** Campo "OTROS SERVICIOS" del componente `ServiceConsolidationCard`.
- **Cálculo:** Suma de servicios adicionales requeridos por el cliente.
- **Formato:** Redondeado a 2 decimales.
- **Aplica a servicios:**
  - Consolidado Maritimo
  - Consolidado Grupal Maritimo

### Cambios en el Formato
- **Todos los valores numéricos ahora están redondeados a 2 decimales** para evitar problemas de precisión en cálculos financieros.

---

## 2. Obligaciones Fiscales (fiscalObligations)

### Estructura Anterior
```json
{
  "fiscalObligations": {
    "adValorem": 6.640000000000001,
    "igv": 26.560000000000002,
    "ipm": 3.3200000000000003,
    "antidumping": 10,
    "totalTaxes": 46.52
  }
}
```

### Estructura Nueva
```json
{
  "fiscalObligations": {
    "adValorem": 6.64,
    "isc": 0.00,
    "igv": 26.56,
    "ipm": 3.32,
    "antidumping": {
      "antidumpingGobierno": 2.00,
      "antidumpingCantidad": 10.00,
      "antidumpingValor": 20.00
    },
    "percepcion": 5.25,
    "totalTaxes": 61.77
  }
}
```

### Campos Modificados

#### `adValorem`
- **Tipo:** `number`
- **Descripción:** Impuesto Ad Valorem aplicado sobre el valor CIF (Cost, Insurance and Freight) de la mercancía.
- **Origen:** Componente `FiscalObligationsCard` - Campo "AD/VALOREM".
- **Cálculo:** `CIF × (Tasa Ad Valorem / 100)`
- **Formato:** Redondeado a 2 decimales.
- **Ejemplo:** Si CIF = $1000 y tasa = 4%, entonces adValorem = $40.00

#### `isc` (NUEVO)
- **Tipo:** `number`
- **Descripción:** Impuesto Selectivo al Consumo. Aplica a productos específicos como bebidas alcohólicas, tabaco, combustibles, etc.
- **Origen:** Componente `FiscalObligationsCard` - Campo "ISC".
- **Cálculo:** Depende del tipo de producto y la legislación tributaria vigente.
- **Formato:** Redondeado a 2 decimales.
- **Valor por defecto:** 0.00 (la mayoría de productos no tienen ISC)

#### `igv`
- **Tipo:** `number`
- **Descripción:** Impuesto General a las Ventas (IGV). Impuesto al valor agregado peruano.
- **Origen:** Componente `FiscalObligationsCard` - Campo "IGV".
- **Cálculo:** `(CIF + Ad Valorem + ISC) × (Tasa IGV / 100)`
- **Formato:** Redondeado a 2 decimales.
- **Tasa estándar:** 18%

#### `ipm`
- **Tipo:** `number`
- **Descripción:** Impuesto de Promoción Municipal. Impuesto que se aplica junto con el IGV.
- **Origen:** Componente `FiscalObligationsCard` - Campo "IPM".
- **Cálculo:** `(CIF + Ad Valorem + ISC) × (Tasa IPM / 100)`
- **Formato:** Redondeado a 2 decimales.
- **Tasa estándar:** 2%

#### `antidumping` (REESTRUCTURADO)
- **Tipo:** `object`
- **Descripción:** Objeto completo que contiene información sobre el derecho antidumping aplicable a la mercancía.

##### `antidumping.antidumpingGobierno`
- **Tipo:** `number`
- **Descripción:** Tasa o porcentaje de antidumping establecido por el gobierno.
- **Origen:** Campo "Antidumping (%)" en `UnifiedConfigurationForm` (`dynamicValues.antidumpingGobierno`).
- **Formato:** Redondeado a 2 decimales.
- **Ejemplo:** 2.00 representa un 2% de antidumping
- **Nota:** Este valor puede variar según el país de origen y el tipo de producto.

##### `antidumping.antidumpingCantidad`
- **Tipo:** `number`
- **Descripción:** Cantidad o valor base sobre el cual se calcula el antidumping.
- **Origen:** Campo "Cantidad Antidumping" en `UnifiedConfigurationForm` (`dynamicValues.antidumpingCantidad`).
- **Formato:** Redondeado a 2 decimales.
- **Ejemplo:** 10.00 puede representar 10 unidades o $10 según el contexto

##### `antidumping.antidumpingValor`
- **Tipo:** `number`
- **Descripción:** Valor calculado final del derecho antidumping que se aplica a la importación.
- **Origen:** Componente `FiscalObligationsCard` - Campo "ANTIDUMPING".
- **Cálculo:** `antidumpingGobierno × antidumpingCantidad`
- **Formato:** Redondeado a 2 decimales.
- **Ejemplo:** Si antidumpingGobierno = 2% y antidumpingCantidad = 10, entonces antidumpingValor = 20.00

#### `percepcion` (NUEVO)
- **Tipo:** `number`
- **Descripción:** Percepción del IGV. Es un sistema de cobro anticipado del IGV que aplica a ciertas importaciones.
- **Origen:** Componente `FiscalObligationsCard` - Campo "PERCEPCIÓN".
- **Cálculo:** `IGV × (Tasa de Percepción / 100)`
- **Formato:** Redondeado a 2 decimales.
- **Tasa estándar:** 5% sobre el IGV
- **Nota:** No es un impuesto adicional, sino un adelanto del IGV que se puede usar como crédito fiscal.

#### `totalTaxes`
- **Tipo:** `number`
- **Descripción:** Suma total de todas las obligaciones fiscales.
- **Cálculo:** `adValorem + isc + igv + ipm + antidumping.antidumpingValor + percepcion`
- **Formato:** Redondeado a 2 decimales.
- **Nota:** Anteriormente se llamaba "Total de Derechos", ahora incluye todos los conceptos tributarios.

---

## 3. Estructura de Productos (products)

### Estructura Anterior
```json
{
  "products": [
    {
      "productId": "ef527a21-27a5-479a-960b-df5292a988c1",
      "isQuoted": true,
      "pricing": {
        "unitCost": 33.5328,
        "importCosts": 49.4208,
        "totalCost": 89.4208,
        "equivalence": 100
      },
      "variants": [
        {
          "variantId": "d42e9b23-8935-42f3-ac7e-c68ad12df5a8",
          "quantity": 1,
          "isQuoted": true,
          "completePricing": {
            "unitCost": 44.7104
          }
        }
      ]
    }
  ]
}
```

### Estructura Nueva
```json
{
  "products": [
    {
      "productId": "ef527a21-27a5-479a-960b-df5292a988c1",
      "isQuoted": true,
      "pricing": {
        "unitCost": 33.53,
        "importCosts": 49.42,
        "totalCost": 82.95,
        "equivalence": 100
      },
      "variants": [
        {
          "variantId": "d42e9b23-8935-42f3-ac7e-c68ad12df5a8",
          "quantity": 1,
          "isQuoted": true,
          "completePricing": {
            "unitCost": 25.00
          }
        }
      ]
    }
  ]
}
```

### Campos Modificados

#### `variants[].completePricing.unitCost`
- **Tipo:** `number`
- **Descripción:** Costo unitario de la variante del producto.
- **Origen:** **CORREGIDO** - Ahora toma el valor del campo `variant.price` de la tabla `EditableUnitCostTableView` en lugar de `variant.unitCost`.
- **Formato:** Redondeado a 2 decimales.
- **Cambio importante:** Anteriormente se usaba un valor calculado incorrecto. Ahora refleja el precio real ingresado/editado por el usuario en la tabla de costos unitarios.

#### Todos los valores numéricos
- **Formato:** Redondeados a 2 decimales para consistencia financiera.

---

## 4. Componentes Afectados

### Frontend Components

#### `UnifiedConfigurationForm`
- **Ubicación:** `src/pages/gestion-de-cotizacion/components/forms/unified-configuration-form.tsx`
- **Cambios:**
  - Ahora oculta el campo "Desaduanaje" para servicios "Consolidado Maritimo" y "Consolidado Grupal Maritimo"
  - Recibe prop `serviceType` para determinar qué campos mostrar

#### `ServiceConsolidationCard`
- **Ubicación:** `src/pages/gestion-de-cotizacion/components/views/partials/ServiceConsolidationCard.tsx`
- **Cambios:**
  - Cálculo corregido de "Total del Servicio" para servicios consolidados marítimos
  - Fórmula: `(Suma de servicios + Transporte China + Transporte Destino) × 1.18`

#### `ImportExpensesCard`
- **Ubicación:** `src/pages/gestion-de-cotizacion/components/views/partials/ImportExpensesCard.tsx`
- **Cambios:**
  - Cálculos corregidos para servicios consolidados marítimos
  - Unificación de campos de transporte en "Servicio de Transporte"
  - Agregado campo "Otros Servicios"
  - Todos los valores ahora se multiplican por 1.18 (incluye IGV)

#### `EditableUnitCostTableView`
- **Ubicación:** `src/pages/respuestas-cotizacion/components/view-cards/EditableUnitCostTableView.tsx`
- **Cambios:**
  - Ahora es la fuente de verdad para `variant.price`
  - El valor ingresado aquí se refleja correctamente en el DTO final

### Backend Interfaces

#### `ServiceFiledsInterface`
- **Ubicación:** `src/api/interface/quotation-response/dto/complete/service-field.ts`
- **Campos nuevos:** `transporteLocalChina`, `transporteLocalDestino`, `otrosServicios`

#### `FiscalObligationsInterface`
- **Ubicación:** `src/api/interface/quotation-response/dto/complete/objects/fiscal-obligations.ts`
- **Campos nuevos:** `isc`, `percepcion`
- **Campos reestructurados:** `antidumping` ahora es un objeto

### Builder & Director

#### `QuotationResponseBuilder`
- **Ubicación:** `src/pages/gestion-de-cotizacion/utils/quotation-response-builder.ts`
- **Métodos modificados:**
  - `extractServiceCalculations`: Agrega nuevos campos y redondea valores
  - `extractFiscalObligations`: Reestructura antidumping y agrega ISC y percepción

#### `QuotationResponseDirector`
- **Ubicación:** `src/pages/gestion-de-cotizacion/utils/quotation-response-director.ts`
- **Sin cambios:** Mantiene la misma API pública

---

## 5. Tipos de Servicio Afectados

### Servicios con Cambios Completos
Los siguientes tipos de servicio tienen todos los cambios implementados:

1. **Consolidado Maritimo**
   - Oculta campo "Desaduanaje"
   - Nuevos cálculos de servicio
   - Campo "Otros Servicios" visible
   - Unificación de transportes

2. **Consolidado Grupal Maritimo**
   - Oculta campo "Desaduanaje"
   - Nuevos cálculos de servicio
   - Campo "Otros Servicios" visible
   - Unificación de transportes

3. **Consolidado Express**
   - Unificación de campos de transporte en "Servicio de Transporte"

4. **Consolidado Grupal Express**
   - Unificación de campos de transporte en "Servicio de Transporte"

---

## 6. Ejemplos de Cálculo

### Ejemplo 1: Servicio Consolidado Marítimo

#### Datos de Entrada
```typescript
{
  servicioConsolidado: 100,
  gestionCertificado: 20,
  inspeccionProducto: 30,
  inspeccionFabrica: 15,
  otrosServicios: 10,
  transporteLocalChina: 50,
  transporteLocalDestino: 30
}
```

#### Cálculo de serviceCalculations
```typescript
// Subtotal
subtotal = 100 + 20 + 30 + 15 + 10 + 50 + 30 = 255

// IGV (18%)
igvServices = 255 × 0.18 = 45.90

// Total
totalServices = 255 + 45.90 = 300.90
```

#### Cálculo de importCosts (Gastos de Importación)
```typescript
{
  servicioConsolidadoMaritimo: 100 × 1.18 = 118.00,
  gestionCertificado: 20 × 1.18 = 23.60,
  servicioInspeccion: (30 + 15) × 1.18 = 53.10,
  servicioTransporte: (50 + 30) × 1.18 = 94.40,
  otrosServicios: 10 × 1.18 = 11.80
}

// Total Gastos de Importación
totalExpenses = 118.00 + 23.60 + 53.10 + 94.40 + 11.80 = 300.90
```

### Ejemplo 2: Obligaciones Fiscales

#### Datos de Entrada
```typescript
{
  cif: 1000,
  adValoremRate: 4,
  iscRate: 0,
  igvRate: 18,
  ipmRate: 2,
  percepcionRate: 5,
  antidumpingGobierno: 2,
  antidumpingCantidad: 10
}
```

#### Cálculos
```typescript
// Ad Valorem
adValorem = 1000 × (4 / 100) = 40.00

// ISC (en este ejemplo es 0)
isc = 0.00

// Base para IGV e IPM
base = 1000 + 40.00 + 0.00 = 1040.00

// IGV
igv = 1040.00 × (18 / 100) = 187.20

// IPM
ipm = 1040.00 × (2 / 100) = 20.80

// Antidumping
antidumping.antidumpingGobierno = 2.00
antidumping.antidumpingCantidad = 10.00
antidumping.antidumpingValor = 2.00 × 10.00 = 20.00

// Percepción (5% del IGV)
percepcion = 187.20 × (5 / 100) = 9.36

// Total de Impuestos
totalTaxes = 40.00 + 0.00 + 187.20 + 20.80 + 20.00 + 9.36 = 277.36
```

---

## 7. Notas de Migración

### Para Desarrolladores

1. **Validación de TypeScript**: Todos los cambios están validados con `npm run type-check`
2. **Retrocompatibilidad**: Los campos nuevos tienen valores por defecto de 0 para evitar errores
3. **Formato de Números**: Usar `parseFloat(value.toFixed(2))` para redondear correctamente

### Para el Backend

Si el backend consume este DTO, debe:
1. Actualizar las interfaces para incluir los nuevos campos
2. Validar que `antidumping` ahora es un objeto, no un número
3. Actualizar los cálculos de `totalTaxes` para incluir ISC y percepción
4. Asegurar que todos los valores numéricos tengan máximo 2 decimales

### Para QA/Testing

Casos de prueba recomendados:
1. Verificar cálculo correcto de `totalServices` en servicios marítimos
2. Validar estructura de `antidumping` como objeto
3. Confirmar que `variant.unitCost` toma el valor de `variant.price`
4. Verificar redondeo a 2 decimales en todos los campos numéricos
5. Probar ocultamiento del campo "Desaduanaje" en servicios consolidados marítimos

---

## 8. Referencias

### Archivos Modificados

1. `src/api/interface/quotation-response/dto/complete/service-field.ts`
2. `src/api/interface/quotation-response/dto/complete/objects/fiscal-obligations.ts`
3. `src/pages/gestion-de-cotizacion/utils/quotation-response-builder.ts`
4. `src/pages/gestion-de-cotizacion/components/views/quotation-response-view.tsx`
5. `src/pages/gestion-de-cotizacion/components/forms/unified-configuration-form.tsx`
6. `src/pages/gestion-de-cotizacion/components/views/partials/ServiceConsolidationCard.tsx`
7. `src/pages/gestion-de-cotizacion/components/views/partials/ImportExpensesCard.tsx`

### Guías de Estilo Aplicadas

- `GUIA_ESTILOS.md` - Guía de estilo y convenciones UI
- `INSTRUCCIONES_FORMATEO_CODIGO.md` - Instrucciones de formateo de código

---

## 9. Historial de Cambios

| Fecha | Versión | Descripción |
|-------|---------|-------------|
| 2025-10-12 | 2.0.0 | Actualización mayor del DTO con nuevos campos y reestructuración de obligaciones fiscales |
| 2025-10-12 | 1.0.0 | Versión inicial del sistema de cotizaciones |

---

## 10. Contacto y Soporte

Para preguntas o aclaraciones sobre estos cambios:
- **Documentación del Proyecto:** Ver `CLAUDE.md` en la raíz del proyecto
- **Issues:** Reportar en el repositorio del proyecto

---

**Documento generado automáticamente por Claude Code**
