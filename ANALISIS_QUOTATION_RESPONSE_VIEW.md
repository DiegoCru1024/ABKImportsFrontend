# Análisis Técnico: QuotationResponseView

## 📋 Resumen Ejecutivo

`QuotationResponseView` es el componente principal para crear respuestas de cotización en ABKImports. Implementa un **formulario complejo multi-modal** que maneja dos flujos distintos: **Vista Pendiente** (administrativa simplificada) y **Vista Completa** (servicios Express/Marítimo con cálculos detallados). El componente integra múltiples hooks personalizados, cálculos en tiempo real y el patrón Director para construir DTOs complejos.

## 🏗️ Arquitectura del Componente

### Ubicación del Archivo
```
src/pages/gestion-de-cotizacion/components/views/quotation-response-view.tsx
```

### Dependencias Principales
```typescript
// React Core
import { useState, useEffect, useMemo, useCallback } from "react";

// Hooks Personalizados
import { useGetQuotationById } from "@/hooks/use-quation";
import { useCreateQuatitationResponse } from "@/hooks/use-quatitation-response";
import { useQuotationResponseForm } from "../../hooks/use-quotation-response-form";
import { useQuotationCalculations } from "../../hooks/use-quotation-calculations";

// Patrón Director
import { QuotationResponseDirector } from "../../utils/quotation-response-director";
```

## 🎯 Flujos de Negocio Principales

### 1. Vista Pendiente (isPendingView = true)
```typescript
const isPendingView = quotationForm.selectedServiceLogistic === "Pendiente";
```

**Características:**
- Interfaz administrativa simplificada
- Gestión de precios básicos por producto/variante
- Cálculos agregados simples
- Componente `QuotationProductRow` para entrada de datos

### 2. Vista Completa (isPendingView = false)
```typescript
// Servicios Express o Marítimo
const isMaritimeService = quotationForm.isMaritimeService();
```

**Características:**
- Configuración detallada de logística
- Cálculos fiscales y tributarios complejos
- Componente `EditableUnitCostTable` para gestión avanzada
- Formularios específicos (Maritime, Unified Configuration)

## 🔧 Estados y Gestión de Datos

### Estados Principales
```typescript
const [pendingProducts, setPendingProducts] = useState<any[]>([]);
const [isSubmitting, setIsSubmitting] = useState(false);
const [productsAggregatedData, setProductsAggregatedData] = useState<Record<string, AggregatedData>>({});
```

| Estado | Propósito | Scope |
|--------|-----------|--------|
| `pendingProducts` | Productos con precios editables para vista pendiente | Vista Pendiente |
| `isSubmitting` | Control de envío de formulario | Global |
| `productsAggregatedData` | Datos agregados calculados por producto | Vista Pendiente |

### Custom Hooks Utilizados
```typescript
const quotationForm = useQuotationResponseForm();
const calculations = useQuotationCalculations({
  products: mappedProducts,
  dynamicValues: quotationForm.dynamicValues,
  cif: quotationForm.cif,
  exemptionState: quotationForm.exemptionState,
  productQuotationState: quotationForm.productQuotationState,
  variantQuotationState: quotationForm.variantQuotationState,
});
```

## 📊 Sistema de Mapeo de Datos

### Mapeo de Productos API → Componente
```typescript
// Vista Pendiente
const mappedProducts = isPendingView
  ? pendingProducts
  : (quotationDetail?.products || []).map((product) => ({
      id: product.productId,
      name: product.name,
      boxes: product.number_of_boxes,
      cbmTotal: parseFloat(product.volume) || 0,
      variants: product.variants?.map((variant) => ({
        id: variant.variantId,
        size: variant.size,
        quantity: variant.quantity || 1,
        price: 0, // Usuario ingresa
      })) || [],
    }));
```

### Mapeo para EditableUnitCostTable (Vista Completa)
```typescript
const editableUnitCostTableProducts = useMemo(() => {
  return (quotationDetail?.products || []).map((product) => ({
    id: product.productId,
    name: product.name,
    price: 0,
    quantity: product.variants?.reduce((sum, variant) => sum + (variant.quantity || 0), 0) || 1,
    seCotiza: true,
    variants: product.variants?.map((variant) => ({
      originalVariantId: variant.variantId,
      id: variant.variantId,
      name: `${variant.size} - ${variant.presentation}`,
      quantity: variant.quantity || 1,
      seCotiza: true,
    })) || [],
  }));
}, [quotationDetail?.products]);
```

## ⚙️ Sistema de Cálculos en Tiempo Real

### Cálculos para Vista Pendiente
```typescript
const calculateProductAggregatedData = useCallback((product: any) => {
  const selectedVariants = product.variants.filter((variant: any) => {
    const variantStates = quotationForm.variantQuotationState[product.id] || {};
    return variantStates[variant.id] !== false;
  });

  return selectedVariants.reduce((acc: any, variant: any) => ({
    totalPrice: acc.totalPrice + (variant.price || 0) * (variant.quantity || 0),
    totalWeight: acc.totalWeight + (variant.weight || 0),
    totalCBM: acc.totalCBM + (variant.cbm || 0),
    totalQuantity: acc.totalQuantity + (variant.quantity || 0),
    totalExpress: acc.totalExpress + (variant.priceExpress || 0) * (variant.quantity || 0),
  }), { /* initial values */ });
}, [quotationForm.variantQuotationState]);
```

### Totales Generales Vista Pendiente
```typescript
const pendingViewTotals = useMemo(() => {
  const selectedProducts = Object.entries(productsAggregatedData).filter(
    ([productId]) => quotationForm.productQuotationState[productId] !== false
  );

  return selectedProducts.reduce((totals, [, data]) => ({
    totalItems: totals.totalItems + data.totalQuantity,
    totalProducts: totals.totalProducts + 1,
    totalCBM: totals.totalCBM + data.totalCBM,
    totalWeight: totals.totalWeight + data.totalWeight,
    totalPrice: totals.totalPrice + data.totalPrice,
    totalExpress: totals.totalExpress + data.totalExpress,
    grandTotal: totals.grandTotal + data.totalPrice + data.totalExpress,
  }), initialTotals);
}, [productsAggregatedData, quotationForm.productQuotationState]);
```

## 🏭 Patrón Director para Construcción de DTOs

### Vista Pendiente - Director Pattern
```typescript
const buildPendingPayload = useCallback(() => {
  const directorProducts = pendingProducts.map((product) => ({
    productId: product.id,
    isQuoted: quotationForm.productQuotationState[product.id] !== false,
    adminComment: product.adminComment || "",
    ghostUrl: product.ghostUrl || product.url || "",
    packingList: product.packingList || {
      boxes: product.number_of_boxes || 0,
      cbm: parseFloat(product.volume) || 0,
      weightKg: parseFloat(product.weight) || 0,
      weightTon: (parseFloat(product.weight) || 0) / 1000,
    },
    variants: (product.variants || []).map((variant: any) => ({
      variantId: variant.id,
      quantity: variant.quantity || 1,
      isQuoted: quotationForm.variantQuotationState[product.id]?.[variant.id] !== false,
      unitPrice: variant.price || 0,
      expressPrice: variant.priceExpress || variant.express || 0,
    })),
  }));

  return QuotationResponseDirector.buildPendingService({
    quotationId: selectedQuotationId,
    advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb",
    logisticConfig: {
      serviceLogistic: quotationForm.selectedServiceLogistic,
      incoterm: quotationForm.selectedIncoterm,
      cargoType: quotationForm.selectedTypeLoad,
      courier: quotationForm.selectedCourier,
    },
    products: directorProducts,
    aggregatedTotals: pendingViewTotals,
    quotationStates: {
      products: quotationForm.productQuotationState,
      variants: quotationForm.variantQuotationState,
    },
  });
}, [dependencies]);
```

### Vista Completa - Director Pattern
```typescript
// Servicios Marítimos
dto = QuotationResponseDirector.buildCompleteMaritimeService({
  quotationId: selectedQuotationId,
  advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb",
  logisticConfig,
  maritimeConfig: QuotationResponseDirector.createDefaultMaritimeConfig({
    regime: quotationForm.selectedRegimen || "Importación Definitiva",
    originCountry: quotationForm.selectedPaisOrigen || "China",
    destinationCountry: quotationForm.selectedPaisDestino || "Perú",
    // ... más configuraciones
  }),
  products: directorProducts,
  calculations: calculationsData,
  serviceCalculations: serviceCalculationsData,
  importCosts: importCostsData,
  quoteSummary: quoteSummaryData,
  cifValue: quotationForm.cif || 0,
  taxRates,
});

// Servicios Express
dto = QuotationResponseDirector.buildCompleteExpressService({
  // Configuración similar sin maritimeConfig
});
```

## 🎨 Renderizado Condicional por Vista

### Vista Pendiente
```typescript
{isPendingView ? (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Productos de la Cotización - Vista Administrativa
        </h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        {quotationDetail?.products.map((product, index) => (
          <QuotationProductRow
            key={product.productId}
            product={mappedProduct}
            index={index}
            quotationDetail={quotationDetail}
            productQuotationState={quotationForm.productQuotationState}
            variantQuotationState={quotationForm.variantQuotationState}
            onProductUpdate={handlePendingProductUpdate}
            onVariantUpdate={handlePendingVariantUpdate}
            onAggregatedDataChange={handleAggregatedDataChange}
          />
        ))}
      </div>
    </div>
  </div>
) : (
  // Vista Completa
)}
```

### Vista Completa
```typescript
<div className="space-y-6">
  <UnifiedConfigurationForm
    dynamicValues={quotationForm.dynamicValues}
    onUpdateValue={quotationForm.updateDynamicValue}
    exemptionState={quotationForm.exemptionState}
    isMaritimeService={quotationForm.isMaritimeService()}
  />

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
    <ServiceConsolidationCard />
    <TaxObligationsCard />
  </div>

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
    <ImportExpensesCard />
    <ImportSummaryCard />
  </div>

  <EditableUnitCostTable
    products={quotationForm.editableUnitCostProducts}
    onProductsChange={quotationForm.setEditableUnitCostProducts}
    totalImportCosts={calculations.finalTotal || 0}
    productQuotationState={quotationForm.productQuotationState}
    variantQuotationState={quotationForm.variantQuotationState}
  />
</div>
```

## 📝 Componentes Hijos y Responsabilidades

### Componentes Compartidos
| Componente | Propósito | Props Clave |
|------------|-----------|-------------|
| `QuotationSummaryCard` | Resumen de totales | `productCount`, `totalCBM`, `totalPrice` |
| `QuotationConfigurationForm` | Configuración logística básica | `selectedServiceLogistic`, `onServiceLogisticChange` |
| `MaritimeServiceForm` | Configuración específica marítima | Visible solo si `isMaritimeService()` |

### Vista Pendiente
| Componente | Propósito | Props Clave |
|------------|-----------|-------------|
| `QuotationProductRow` | Edición de productos/variantes | `onProductUpdate`, `onVariantUpdate`, `onAggregatedDataChange` |

### Vista Completa
| Componente | Propósito | Props Clave |
|------------|-----------|-------------|
| `UnifiedConfigurationForm` | Configuración de valores dinámicos | `dynamicValues`, `onUpdateValue`, `exemptionState` |
| `ServiceConsolidationCard` | Cálculos de servicios consolidados | `serviceFields`, `updateDynamicValue` |
| `TaxObligationsCard` | Obligaciones fiscales y tributarias | `adValoremRate`, `igvRate`, `values` |
| `ImportExpensesCard` | Gastos de importación | `exemptionState`, `handleExemptionChange` |
| `ImportSummaryCard` | Resumen final de importación | `comercialValue`, `totalImportCosts` |
| `EditableUnitCostTable` | Tabla editable de costos unitarios | `products`, `onProductsChange`, `productQuotationState` |

## 🔄 Hooks de Performance y Optimización

### useCallback para Funciones Complejas
```typescript
const handleAggregatedDataChange = useCallback((productId: string, aggregatedData: AggregatedData) => {
  setProductsAggregatedData((prev) => ({
    ...prev,
    [productId]: aggregatedData,
  }));
}, []);

const handlePendingProductUpdate = useCallback((productId: string, updates: any) => {
  setPendingProducts((prev) => {
    const updatedProducts = prev.map((product) =>
      product.id === productId ? { ...product, ...updates } : product
    );
    // Recalcular agregados en tiempo real
    const updatedProduct = updatedProducts.find((p) => p.id === productId);
    if (updatedProduct) {
      const aggregatedData = calculateProductAggregatedData(updatedProduct);
      handleAggregatedDataChange(productId, aggregatedData);
    }
    return updatedProducts;
  });
}, [calculateProductAggregatedData, handleAggregatedDataChange]);
```

### useMemo para Cálculos Costosos
```typescript
const editableUnitCostTableProducts = useMemo(() => {
  // Transformación compleja de productos API → tabla editable
}, [quotationDetail?.products]);

const pendingViewTotals = useMemo(() => {
  // Cálculo de totales basado en productos seleccionados
}, [productsAggregatedData, quotationForm.productQuotationState]);
```

## 🔐 Manejo de Estados de Cotización

### Inicialización de Estados por Defecto
```typescript
useEffect(() => {
  if (mappedProducts && mappedProducts.length > 0) {
    const initialProductStates: Record<string, boolean> = {};
    const initialVariantStates: Record<string, Record<string, boolean>> = {};

    mappedProducts.forEach((product) => {
      // Producto por defecto en true
      if (quotationForm.productQuotationState[product.id] === undefined) {
        initialProductStates[product.id] = true;
      }

      // Variantes por defecto en true
      if (product.variants && product.variants.length > 0) {
        const variantStates: Record<string, boolean> = {};
        product.variants.forEach((variant: any) => {
          if (!quotationForm.variantQuotationState[product.id]?.[variant.id]) {
            variantStates[variant.id] = true;
          }
        });
        if (Object.keys(variantStates).length > 0) {
          initialVariantStates[product.id] = variantStates;
        }
      }
    });

    // Aplicar estados iniciales
    Object.entries(initialProductStates).forEach(([productId, value]) => {
      quotationForm.updateProductQuotationState(productId, value);
    });
  }
}, [mappedProducts]);
```

## 🚀 Flujo de Envío y Validación

### Función de Envío Principal
```typescript
const handleSubmitQuotation = async () => {
  setIsSubmitting(true);
  try {
    let dto;

    if (isPendingView) {
      dto = buildPendingPayload();
    } else {
      const isMaritimeService = quotationForm.isMaritimeService();
      if (isMaritimeService) {
        dto = QuotationResponseDirector.buildCompleteMaritimeService({
          // Configuración marítima completa
        });
      } else {
        dto = QuotationResponseDirector.buildCompleteExpressService({
          // Configuración express
        });
      }
    }

    console.log(`DTO ${isPendingView ? "Pendiente" : "Completo"} construido:`, dto);

    // await createQuotationResponseMutation.mutateAsync({ data: dto, quotationId });
    quotationForm.setIsSendingModalOpen(true);

  } catch (error) {
    console.error(`Error al enviar cotización:`, error);
  } finally {
    setIsSubmitting(false);
  }
};
```

## 📊 Métricas de Complejidad

### Líneas de Código: ~1,098
### Componentes Hijos: 12+
### Custom Hooks: 4
### Estados Locales: 3
### useEffect: 3
### useMemo: 2
### useCallback: 4

## ✅ Fortalezas de la Implementación

1. **Arquitectura Modular**: Separación clara entre vistas pendiente y completa
2. **Performance Optimizada**: Uso extensivo de `useMemo` y `useCallback`
3. **Patrón Director**: Construcción limpia y mantenible de DTOs complejos
4. **Cálculos en Tiempo Real**: Actualización inmediata de totales y agregados
5. **Estado Encapsulado**: Custom hooks mantienen lógica organizizada
6. **Type Safety**: TypeScript con interfaces bien definidas
7. **UX Responsive**: Diseño adaptativo con Tailwind CSS
8. **Error Handling**: Estados de carga y error bien manejados

## ⚠️ Áreas de Mejora

1. **Complejidad Ciclogmática**: El componente es muy extenso (1,098 líneas)
2. **Tipos Any**: Uso de `any` en algunas transformaciones de datos
3. **Hardcoded Values**: IDs de advisor y algunos valores por defecto
4. **Separación de Responsabilidades**: Podría dividirse en sub-componentes
5. **Testing**: Necesita tests unitarios para lógica compleja
6. **Error Boundaries**: Manejo más robusto de errores

## 🔧 Tecnologías y Patrones

### Core
- **React 19** - Hooks, estado local, efectos
- **TypeScript** - Type safety y interfaces
- **Custom Hooks** - Encapsulación de lógica

### Patrones
- **Director Pattern** - Construcción de DTOs complejos
- **Observer Pattern** - Cálculos reactivos en tiempo real
- **Strategy Pattern** - Diferentes flujos según tipo de vista
- **Factory Pattern** - Creación de configuraciones por defecto

### UI/UX
- **Conditional Rendering** - Diferentes interfaces por contexto
- **Responsive Design** - Grid systems adaptativos
- **Real-time Feedback** - Cálculos inmediatos
- **Progressive Disclosure** - Formularios condicionales

## 📝 Conclusión

`QuotationResponseView` representa una **implementación compleja pero bien estructurada** de un formulario multi-modal con dos flujos de negocio distintos. La integración del patrón Director para construcción de DTOs, junto con el sistema de cálculos en tiempo real y la optimización de performance mediante hooks especializados, crea una experiencia de usuario fluida y robusta.

El componente demuestra **arquitectura avanzada de React** con TypeScript, manejando estado complejo, transformaciones de datos sofisticadas y múltiples flujos de negocio de manera cohesiva. Sin embargo, su tamaño sugiere la necesidad de refactorización en componentes más pequeños para mejorar la mantenibilidad a largo plazo.

**Casos de uso principales:**
- ✅ Respuestas de cotización administrativas (Vista Pendiente)
- ✅ Cotizaciones completas Express con cálculos detallados
- ✅ Cotizaciones marítimas con configuración logística avanzada
- ✅ Cálculos fiscales y tributarios en tiempo real

---

**Generado:** Como parte del análisis técnico del frontend ABKImports
**Tecnologías:** React 19, TypeScript, Custom Hooks, Director Pattern
**Complejidad:** Alta - Componente de negocio crítico con múltiples responsabilidades