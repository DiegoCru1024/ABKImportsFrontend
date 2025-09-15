# Propuesta de Mejora: DTO Unificado para Respuestas de Cotizaciones

## Análisis del Problema Actual

### Situación Actual

El componente `quotation-response-view.tsx` maneja **dos tipos de vistas diferentes**:

1. **Vista Pendiente** (`isPendingView = true`)

   - Servicio logístico: "Pendiente"
   - Vista administrativa simplificada
   - Usa `QuotationProductRow` para productos
   - Lógica basada en datos agregados por producto
   - No incluye cálculos fiscales complejos

2. **Vista Completa** (`isPendingView = false`)
   - Servicios: Express/Marítimo
   - Vista completa con todos los componentes
   - Usa `EditableUnitCostTable`
   - Incluye formularios dinámicos, cálculos fiscales, exempciones

### Problemas Identificados

1. **DTO Sobrecargado**: El DTO actual contiene **todos los campos posibles** sin considerar el tipo de servicio
2. **Datos Redundantes**: Muchos campos se envían con valores por defecto (0) cuando no aplican
3. **Complejidad Innecesaria**: El backend recibe datos no relevantes para ciertos tipos de servicio
4. **Mantenimiento Difícil**: Cambios en un tipo de servicio afectan toda la estructura

## Propuesta de Mejora: DTO Unificado Inteligente

### 1. Estructura Base Común

```typescript
interface QuotationResponseBaseDto {
  quotationId: string;
  quotationInfo: QuotationInfoDto;
  serviceType: "PENDING" | "EXPRESS" | "MARITIME";
  responseData: PendingServiceData | CompleteServiceData;
  products: ProductResponseDto[];
}
```

### 2. Datos Específicos por Tipo de Servicio

#### Para Servicios Pendientes

```typescript
interface PendingServiceData {
  type: "PENDING";
  basicInfo: {
    totalCBM: number;
    totalWeight: number;
    totalPrice: number;
    totalExpress: number;
    totalQuantity: number;
  };
  // Solo campos esenciales para vista administrativa
}
```

#### Para Servicios Completos (Express/Marítimo)

```typescript
interface CompleteServiceData {
  type: "EXPRESS" | "MARITIME";
  basicInfo: {
    totalCBM: number;
    totalWeight: number;
    totalPrice: number;
    totalExpress: number;
    totalQuantity: number;
  };
  calculations: {
    dynamicValues: DynamicValuesDto;
    fiscalObligations: FiscalObligationsDto;
    serviceCalculations: ServiceCalculationsDto;
    exemptions: ExemptionsDto;
  };
  commercialDetails: {
    cif: number;
    totalImportCosts: number;
    totalInvestment: number;
  };
}
```

### 3. Productos Simplificados

```typescript
interface ProductResponseDto {
  productId: string;
  name: string;
  isQuoted: boolean;
  adminComment?: string; // Solo para vista pendiente
  pricing: PendingProductPricing | CompleteProductPricing;
  variants: ProductVariantResponseDto[];
}

interface PendingProductPricing {
  totalPrice: number;
  totalWeight: number;
  totalCBM: number;
  totalQuantity: number;
  totalExpress: number;
}

interface CompleteProductPricing {
  unitCost: number;
  importCosts: number;
  totalCost: number;
  equivalence: number;
}
```

### 4. Información de Cotización Optimizada

```typescript
interface QuotationInfoDto {
  // Campos comunes a todos los tipos
  quotationId: string;
  correlative: string;
  date: string;
  advisorId: string;

  // Configuración base
  serviceLogistic: string;
  incoterm: string;
  cargoType: string;
  courier: string;

  // Campos condicionales (solo si aplican)
  maritimeConfig?: {
    regime: string;
    originCountry: string;
    destinationCountry: string;
    customs: string;
    originPort: string;
    destinationPort: string;
    serviceTypeDetail: string;
    transitTime: number;
    naviera: string;
    proformaValidity: string;
  };
}
```

## Ventajas de la Nueva Propuesta

### 1. **Reducción de Tamaño del DTO**

- **Vista Pendiente**: ~70% menos datos
- **Vista Completa**: ~30% menos datos redundantes
- Eliminación de campos con valores por defecto

### 2. **Claridad en el Backend**

```typescript
// El backend puede procesar de manera específica
if (response.serviceType === "PENDING") {
  processPendingQuotation(response.responseData as PendingServiceData);
} else {
  processCompleteQuotation(response.responseData as CompleteServiceData);
}
```

### 3. **Mantenibilidad Mejorada**

- Cambios en vista pendiente no afectan vista completa
- Tipos específicos previenen errores
- Fácil extensión para nuevos tipos de servicio

### 4. **Validación Específica**

```typescript
// Validaciones por tipo de servicio
const pendingValidation = z.object({
  type: z.literal("PENDING"),
  basicInfo: z.object({
    totalCBM: z.number().min(0),
    totalWeight: z.number().min(0),
    // etc...
  }),
});
```

## Implementación Sugerida

### 1. Builder Pattern para Construcción del DTO

```typescript
export class QuotationResponseBuilder {
  private baseDto: QuotationResponseBaseDto;

  constructor(quotationId: string, serviceType: ServiceType) {
    this.baseDto = {
      quotationId,
      serviceType,
      quotationInfo: this.buildQuotationInfo(),
      responseData: null as any,
      products: [],
    };
  }

  buildForPendingService(data: PendingBuildData): QuotationResponseBaseDto {
    this.baseDto.responseData = {
      type: "PENDING",
      basicInfo: this.extractPendingBasicInfo(data),
    };
    this.baseDto.products = this.buildPendingProducts(data.products);
    return this.baseDto;
  }

  buildForCompleteService(data: CompleteBuildData): QuotationResponseBaseDto {
    this.baseDto.responseData = {
      type: this.determineServiceType(data.serviceLogistic),
      calculations: this.extractCalculations(data),
      commercialDetails: this.extractCommercialDetails(data),
    };
    this.baseDto.products = this.buildCompleteProducts(data.products);
    return this.baseDto;
  }
}
```

### 2. Uso en el Componente

```typescript
const handleSubmitQuotation = async () => {
  const builder = new QuotationResponseBuilder(
    selectedQuotationId,
    quotationForm.selectedServiceLogistic
  );

  const dto = isPendingView
    ? builder.buildForPendingService({
        products: mappedProducts,
        aggregatedTotals: pendingViewTotals,
        quotationStates: {
          products: quotationForm.productQuotationState,
          variants: quotationForm.variantQuotationState,
        },
      })
    : builder.buildForCompleteService({
        quotationForm,
        calculations,
        products: quotationForm.editableUnitCostProducts,
        quotationDetail,
      });

  await createQuotationResponseMutation.mutateAsync(dto);
};
```

## Migración Gradual

### Fase 1: Implementar Nuevos Tipos

- Crear interfaces de la nueva estructura
- Mantener compatibilidad con DTO actual

### Fase 2: Actualizar Builder

- Implementar `QuotationResponseBuilder`
- Pruebas unitarias para cada tipo de servicio

### Fase 3: Migrar Backend

- Actualizar endpoints para soportar ambas estructuras
- Validación específica por tipo de servicio

### Fase 4: Limpieza

- Eliminar DTO antiguo
- Optimizar consultas y procesamiento

## Ejemplos de JSON del Nuevo DTO

### 1. Ejemplo para Servicio Pendiente

```json
{
  // Información básica de la cotización y configuración del servicio
  "quotationInfo": {
    "quotationId": "4a77-8074-94a77-8074-94a77-8074-94a77-8074-9",
    "correlative": "COT-001-2024", // Correlativo interno del sistema
    "date": "12/09/2024 14:30:00", // Fecha y hora de respuesta
    "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb", // ID del asesor que responde
    "serviceLogistic": "Pendiente", // Tipo de servicio logístico seleccionado
    "incoterm": "DDP", // Término de comercio internacional
    "cargoType": "mixto", // Tipo de carga (general, mixto, contenedor)
    "courier": "ups" // Empresa courier seleccionada
  },

  // Tipo de servicio para determinar el procesamiento en el backend
  "serviceType": "PENDING",

  // Datos específicos para servicios pendientes (vista administrativa)
  "responseData": {
    "type": "PENDING",
    // Información agregada básica para vista administrativa
    "basicInfo": {
      "totalCBM": 2.5, // Volumen total en metros cúbicos
      "totalWeight": 150.0, // Peso total en kilogramos
      "totalPrice": 1200.0, // Precio total de productos
      "totalExpress": 180.0, // Costo total de servicio express
      "totalQuantity": 25 // Cantidad total de items
    }
  },

  // Lista de productos con información simplificada para vista pendiente
  "products": [
    {
      "productId": "PROD-001", // ID único del producto
      "name": "Producto Ejemplo A", // Nombre del producto
      "isQuoted": true, // Indica si el producto será cotizado
      "adminComment": "Verificar disponibilidad en almacén", // Comentario administrativo
      "ghostUrl":"https://mercadolibre.com" //URL de guia ,

      // Precios y medidas agregadas del producto
      "pricing": {
        "totalPrice": 800.0, // Precio total del producto
        "totalWeight": 100.0, // Peso total del producto
        "totalCBM": 1.5, // Volumen total del producto
        "totalQuantity": 15, // Cantidad total del producto
        "totalExpress": 120.0 // Costo express total del producto
      },

      //Información sobre el packing
      "packingList": {
        "nroBoxes": 10, //Cantidad de cajas
        "cbm": 20.0,  //CBM
        "pesoKg": 1000,  //Peso en Kilogramos
        "pesoTn": 1   //Peso en toneladas
      },

      //Información sobre la manipulación de carga
      "cargoHandling":{
        "fragileProduct":true,  //Producto fragil
        "stackProduct":false,  //Producto manipulable

      },

      // Variantes del producto con información básica
      "variants": [
        {
          "variantId": "VAR-001-A", // ID único de la variante
          "quantity": 10, // Cantidad de esta variante
          "isQuoted": true, // Indica si la variante será cotizada

          // Precios específicos para vista pendiente
          "pendingPricing": {
            "unitPrice": 50.0, // Precio unitario de la variante
            "expressPrice": 8.0 // Precio express unitario
          }
        },
        {
          "variantId": "VAR-001-B",
          "quantity": 5,
          "isQuoted": true,
          "pendingPricing": {
            "unitPrice": 60.0,
            "expressPrice": 8.0
          }
        }
      ]
    }
  ]
}
```

### 2. Ejemplo para Servicio Express

```json
{
  // ID único de la cotización a responder
  "quotationId": "5c-4a77-80745c-4a77-80745c-4a77-80745c-4a77-8074",

  // Información básica de la cotización y configuración del servicio
  "quotationInfo": {
    "quotationId": "COT-2024-002", // ID de la cotización
    "correlative": "COT-002-2024", // Correlativo interno del sistema
    "date": "12-09-2024 15:45:00", // Fecha y hora de respuesta
    "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb", // ID del asesor que responde
    "serviceLogistic": "Consolidado Express", // Tipo de servicio logístico seleccionado
    "incoterm": "DDP", // Término de comercio internacional
    "cargoType": "general", // Tipo de carga (general, mixto, contenedor)
    "courier": "fedex" // Empresa courier seleccionada
  },

  // Tipo de servicio para determinar el procesamiento en el backend
  "serviceType": "EXPRESS",

  // Datos específicos para servicios completos (Express/Marítimo)
  "responseData": {
    "type": "EXPRESS",

    "basicInfo": {
      "totalCBM": 2.5, // Volumen total en metros cúbicos
      "totalWeight": 150.0, // Peso total en kilogramos
      "totalPrice": 1200.0, // Precio total de productos
      "totalExpress": 180.0, // Costo total de servicio express
      "totalQuantity": 25 // Cantidad total de items
    },

    // Cálculos detallados para servicio express
    "calculations": {
      // Valores dinámicos ingresados por el usuario
      "dynamicValues": {
        "comercialValue": 2500.0, // Valor comercial de la mercancía
        "flete": 450.0, // Costo del flete
        "cajas": 20, // Número de cajas/bultos
        "kg": 180.0, // Peso total en kilogramos
        "fob": 2500.0, // Valor FOB (Free On Board)
        "seguro": 75.0, // Costo del seguro
        "tipoCambio": 3.7, // Tipo de cambio USD/PEN
        "servicioConsolidado": 200.0, // Costo del servicio de consolidación
        "separacionCarga": 50.0, // Costo de separación de carga
        "inspeccionProductos": 80.0, // Costo de inspección de productos
        "adValoremRate": 4.0, // Tasa de derecho ad-valorem (%)
        "igvRate": 18.0, // Tasa de IGV (%)
        "ipmRate": 2.0, // Tasa de IPM (%)
        "cif": 3025.0 // Valor CIF (Cost, Insurance, Freight)
      },

      // Obligaciones fiscales calculadas
      "fiscalObligations": {
        "adValorem": 121.0, // Derecho ad-valorem calculado
        "igv": 544.5, // IGV calculado
        "ipm": 60.5, // IPM calculado
        "totalTaxes": 726.0 // Total de impuestos
      },

      // Cálculos de servicios logísticos
      "serviceCalculations": {
        // Servicios específicos para transporte aéreo
        "serviceFields": {
          "servicioConsolidado": 200.0, // Servicio de consolidación
          "separacionCarga": 50.0, // Separación de carga
          "inspeccionProductos": 80.0 // Inspección de productos
        },
        "subtotalServices": 330.0, // Subtotal de servicios sin IGV
        "igvServices": 59.4, // IGV de servicios (18%)
        "totalServices": 389.4 // Total de servicios con IGV
      },

      // Estado de exoneraciones aplicadas
      "exemptions": {
        "servicioConsolidadoAereo": false, // Exoneración de servicio aéreo
        "separacionCarga": false, // Exoneración de separación
        "inspeccionProductos": false, // Exoneración de inspección
        "obligacionesFiscales": false // Exoneración de impuestos
      }
    },

    // Detalles comerciales finales de la importación
    "commercialDetails": {
      "cif": 3025.0, // Valor CIF total
      "totalImportCosts": 1115.4, // Costos totales de importación
      "totalInvestment": 4140.4 // Inversión total (CIF + costos + impuestos)
    }
  },

  // Lista de productos con cálculos detallados para vista completa
  "products": [
    {
      "productId": "PROD-002", // ID único del producto
      "name": "Producto Express A", // Nombre del producto
      "isQuoted": true, // Indica si el producto será cotizado

      // Precios y costos calculados para vista completa
      "pricing": {
        "unitCost": 165.62, // Costo unitario final (incluye importación)
        "importCosts": 557.7, // Costos de importación asignados al producto
        "totalCost": 2087.7, // Costo total del producto
        "equivalence": 1.5 // Factor de equivalencia para cálculos
      },

      // Variantes del producto con cálculos detallados
      "variants": [
        {
          "variantId": "VAR-002-A", // ID único de la variante
          "quantity": 10, // Cantidad de esta variante
          "isQuoted": true, // Indica si la variante será cotizada

          // Precios detallados para vista completa
          "completePricing": {
            "unitPrice": 120.0, // Precio unitario de compra
            "unitCost": 165.62, // Costo unitario final
            "importCosts": 557.7 // Costos de importación por variante
          }
        }
      ]
    }
  ]
}
```

### 3. Ejemplo para Servicio Marítimo

```json
{
  // ID único de la cotización a responder
  "quotationId": "COT-2024-003",

  // Información básica de la cotización y configuración del servicio marítimo
  "quotationInfo": {
    "quotationId": "COT-2024-003", // ID de la cotización
    "correlative": "COT-003-2024", // Correlativo interno del sistema
    "date": "12-09-2024 16:20:00", // Fecha y hora de respuesta
    "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb", // ID del asesor que responde
    "serviceLogistic": "Consolidado Maritimo", // Tipo de servicio logístico seleccionado
    "incoterm": "FOB", // Término de comercio internacional
    "cargoType": "contenedor", // Tipo de carga (general, mixto, contenedor)
    "courier": "naviera", // Empresa naviera seleccionada

    // Configuración específica para servicios marítimos
    "maritimeConfig": {
      "regime": "importacion", // Régimen aduanero
      "originCountry": "China", // País de origen
      "destinationCountry": "Peru", // País de destino
      "customs": "Callao", // Aduana de ingreso
      "originPort": "Shanghai", // Puerto de salida
      "destinationPort": "Callao", // Puerto de destino
      "serviceTypeDetail": "FCL", // Tipo de servicio (FCL/LCL)
      "transitTime": 25, // Tiempo de tránsito en días
      "naviera": "COSCO", // Empresa naviera
      "proformaValidity": "30" // Vigencia de la proforma en días
    }
  },

  // Tipo de servicio para determinar el procesamiento en el backend
  "serviceType": "MARITIME",

  // Datos específicos para servicios marítimos
  "responseData": {
    "type": "MARITIME",

    "basicInfo": {
      "totalCBM": 2.5, // Volumen total en metros cúbicos
      "totalWeight": 150.0, // Peso total en kilogramos
      "totalPrice": 1200.0, // Precio total de productos
      "totalExpress": 180.0, // Costo total de servicio express
      "totalQuantity": 25 // Cantidad total de items
    }

    // Cálculos detallados para servicio marítimo
    "calculations": {
      // Valores dinámicos específicos para transporte marítimo
      "dynamicValues": {
        "comercialValue": 15000.0, // Valor comercial de la mercancía
        "fob": 15000.0, // Valor FOB (Free On Board)
        "flete": 2800.0, // Costo del flete marítimo
        "seguro": 350.0, // Costo del seguro marítimo
        "volumenCBM": 28.5, // Volumen en metros cúbicos
        "ton": 3.2, // Peso en toneladas
        "calculoFlete": 90.0, // Factor de cálculo de flete por CBM/TON
        "servicioConsolidado": 800.0, // Costo del servicio de consolidación
        "gestionCertificado": 150.0, // Gestión de certificados y documentos
        "inspeccionProducto": 200.0, // Inspección de productos
        "transporteLocal": 180.0, // Transporte local en destino
        "desaduanaje": 450.0, // Gestión aduanera y desaduanaje
        "adValoremRate": 6.0, // Tasa de derecho ad-valorem (%)
        "igvRate": 18.0, // Tasa de IGV (%)
        "ipmRate": 2.0, // Tasa de IPM (%)
        "tipoCambio": 3.7, // Tipo de cambio USD/PEN
        "cif": 18150.0 // Valor CIF (Cost, Insurance, Freight)
      },

      // Obligaciones fiscales calculadas para importación marítima
      "fiscalObligations": {
        "adValorem": 1089.0, // Derecho ad-valorem calculado
        "igv": 3267.0, // IGV calculado
        "ipm": 363.0, // IPM calculado
        "antidumping": 0.0, // Derechos antidumping (si aplican)
        "totalTaxes": 4719.0 // Total de impuestos y derechos
      },

      // Cálculos de servicios logísticos marítimos
      "serviceCalculations": {
        // Servicios específicos para transporte marítimo
        "serviceFields": {
          "servicioConsolidado": 800.0, // Servicio de consolidación marítima
          "gestionCertificado": 150.0, // Gestión de certificados
          "inspeccionProducto": 200.0, // Inspección de productos
          "transporteLocal": 180.0 // Transporte local
        },
        "subtotalServices": 1330.0, // Subtotal de servicios sin IGV
        "igvServices": 239.4, // IGV de servicios (18%)
        "totalServices": 1569.4 // Total de servicios con IGV
      },

      // Estado de exoneraciones aplicadas para servicios marítimos
      "exemptions": {
        "servicioConsolidadoMaritimo": false, // Exoneración de servicio marítimo
        "gestionCertificado": false, // Exoneración de gestión de certificados
        "servicioInspeccion": false, // Exoneración de inspección
        "transporteLocal": false, // Exoneración de transporte local
        "obligacionesFiscales": false, // Exoneración de impuestos
        "totalDerechos": false // Exoneración de derechos aduaneros
      }
    },

    // Detalles comerciales finales de la importación marítima
    "commercialDetails": {
      "cif": 18150.0, // Valor CIF total
      "totalImportCosts": 6738.4, // Costos totales de importación (servicios + impuestos)
      "totalInvestment": 24888.4 // Inversión total (CIF + costos + impuestos)
    }
  },

  // Lista de productos con cálculos detallados para vista marítima
  "products": [
    {
      "productId": "PROD-003", // ID único del producto
      "name": "Producto Marítimo A", // Nombre del producto
      "isQuoted": true, // Indica si el producto será cotizado

      // Precios y costos calculados para vista marítima
      "pricing": {
        "unitCost": 414.74, // Costo unitario final (incluye todos los costos)
        "importCosts": 2246.13, // Costos de importación asignados al producto
        "totalCost": 8296.13, // Costo total del producto (unitario × cantidad + costos)
        "equivalence": 2.0 // Factor de equivalencia para distribución de costos
      },

      // Variantes del producto con cálculos marítimos detallados
      "variants": [
        {
          "variantId": "VAR-003-A", // ID único de la variante
          "quantity": 20, // Cantidad de esta variante
          "isQuoted": true, // Indica si la variante será cotizada

          // Precios detallados para vista marítima
          "completePricing": {
            "unitPrice": 300.0, // Precio unitario de compra FOB
            "unitCost": 414.74, // Costo unitario final CIF + costos
            "importCosts": 2246.13 // Costos de importación distribuidos por variante
          }
        }
      ]
    }
  ]
}
```

## Comparación de Tamaños

### DTO Actual vs Nuevo DTO

| Tipo de Servicio | DTO Actual (aprox.) | Nuevo DTO | Reducción |
| ---------------- | ------------------- | --------- | --------- |
| Pendiente        | ~3.2 KB             | ~0.9 KB   | **72%**   |
| Express          | ~4.8 KB             | ~3.1 KB   | **35%**   |
| Marítimo         | ~5.2 KB             | ~3.8 KB   | **27%**   |

## Conclusión

Esta propuesta de DTO unificado **reduce la complejidad**, **mejora el rendimiento** y **facilita el mantenimiento** al enviar solo los datos relevantes para cada tipo de servicio, manteniendo una estructura coherente y tipada que refleja la lógica de negocio real de la aplicación.

Los ejemplos JSON muestran claramente cómo cada tipo de servicio tiene su estructura específica, eliminando campos innecesarios y mejorando la legibilidad y eficiencia del intercambio de datos.
