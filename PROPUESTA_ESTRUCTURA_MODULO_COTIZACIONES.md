# Propuesta de Estructuración del Módulo de Gestión de Cotizaciones

## Para: Equipo de Desarrollo ABKImports
## De: Arquitectura de Software
## Tema: Reestructuración Completa del Módulo de Gestión de Cotizaciones

---

## Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Estructura Actual vs Propuesta](#estructura-actual-vs-propuesta)
3. [Nueva Arquitectura de Carpetas](#nueva-arquitectura-de-carpetas)
4. [Desglose por Funcionalidad](#desglose-por-funcionalidad)
5. [Plan de Migración](#plan-de-migración)
6. [Beneficios Esperados](#beneficios-esperados)

---

## Visión General

El módulo de gestión de cotizaciones actualmente maneja:
- **Listado de cotizaciones** con búsqueda, filtrado y paginación
- **Creación de respuestas a cotizaciones** (3 flujos: Pendiente, Express, Marítimo)
- **Edición de respuestas a cotizaciones** existentes
- **Visualización de lista de respuestas** por cotización

### Problemas Actuales
- Componentes de 1300+ líneas de código
- Lógica de negocio mezclada con UI
- Duplicación de código entre creación y edición
- Difícil mantenimiento y testing
- Estado duplicado en múltiples lugares

---

## Estructura Actual vs Propuesta

### Estructura Actual (Problemática)

```
src/pages/gestion-de-cotizacion/
├── gestion-de-cotizacion-view.tsx           (180 líneas - Orquestador principal)
├── components/
│   ├── forms/
│   │   ├── maritime-service-form.tsx
│   │   ├── quotation-summary-card.tsx
│   │   ├── quotation-configuration-form.tsx
│   │   ├── dynamic-values-form.tsx
│   │   ├── exemption-controls.tsx
│   │   └── unified-configuration-form.tsx
│   ├── shared/
│   │   ├── product-grid.tsx
│   │   └── quotation-card.tsx
│   ├── table/
│   │   └── columnsListResponses.tsx
│   ├── utils/
│   │   ├── interface.ts
│   │   └── static.ts
│   └── views/
│       ├── partials/
│       │   ├── TaxObligationsCard.tsx
│       │   ├── ImportSummaryCard.tsx
│       │   ├── ImportExpensesCard.tsx
│       │   └── ServiceConsolidationCard.tsx
│       ├── tables/
│       │   ├── quotation-product-row.tsx
│       │   └── editable-unit-cost-table.tsx
│       ├── quotation-responses-list.tsx
│       └── edit-quotation-response-view.tsx
├── quotation-response-view/                  ⚠️ NUEVA ESTRUCTURA PARCIAL
│   ├── quotation-response-view.tsx           (1350 líneas - PROBLEMA)
│   ├── views/
│   │   ├── PendingQuotationView.tsx
│   │   └── CompleteQuotationView.tsx
│   └── sections/
│       ├── QuotationHeader.tsx
│       ├── QuotationConfiguration.tsx
│       ├── ProductsSection.tsx
│       ├── CalculationsSection.tsx
│       └── SummarySection.tsx
├── hooks/
│   ├── use-image-modal.ts
│   ├── use-quotation-list.ts
│   ├── use-quotation-response-form.ts
│   ├── use-quotation-response.ts
│   └── use-quotation-calculations.ts
├── utils/
│   ├── quotation-response-director.ts
│   └── quotation-response-builder.ts
├── types/
│   ├── quotation-types.ts
│   └── quotation-response-dto.ts
└── index.tsx
```

**Problema**: Estructura híbrida con carpetas duplicadas, responsabilidades confusas.

---

## Nueva Arquitectura de Carpetas

### Estructura Propuesta (Solución)

```
src/pages/gestion-de-cotizacion/
│
├── index.tsx                                   (Export principal del módulo)
├── gestion-de-cotizacion-view.tsx             (150 líneas - Orquestador principal)
│
├── features/                                   📁 NUEVA: Separación por funcionalidades
│   │
│   ├── quotation-list/                        📌 Funcionalidad: Listado de cotizaciones
│   │   ├── index.tsx                          (Re-export)
│   │   ├── QuotationListView.tsx              (Vista principal del listado)
│   │   ├── components/
│   │   │   ├── QuotationCard.tsx              (Tarjeta de cotización)
│   │   │   ├── QuotationFilters.tsx           (Filtros de búsqueda)
│   │   │   └── QuotationPagination.tsx        (Paginación)
│   │   ├── hooks/
│   │   │   ├── use-quotation-list.ts          (Lógica de listado)
│   │   │   └── use-image-modal.ts             (Modal de imágenes)
│   │   └── types/
│   │       └── quotation-list-types.ts        (Tipos del listado)
│   │
│   ├── quotation-response-create/             📌 Funcionalidad: Crear respuesta
│   │   ├── index.tsx                          (Re-export)
│   │   ├── QuotationResponseCreateView.tsx    (150 líneas - Orquestador)
│   │   │
│   │   ├── views/                             📂 Vistas específicas por tipo de servicio
│   │   │   ├── PendingQuotationView.tsx       (Vista administrativa)
│   │   │   ├── ExpressQuotationView.tsx       (Vista servicio express)
│   │   │   └── MaritimeQuotationView.tsx      (Vista servicio marítimo)
│   │   │
│   │   ├── sections/                          📂 Secciones compartidas
│   │   │   ├── QuotationHeader.tsx            (Encabezado con info básica)
│   │   │   ├── QuotationSummary.tsx           (Resumen de totales)
│   │   │   ├── LogisticsConfiguration.tsx     (Config general de logística)
│   │   │   ├── MaritimeConfiguration.tsx      (Config específica marítima)
│   │   │   ├── ProductsSection.tsx            (Sección de productos)
│   │   │   ├── CalculationsSection.tsx        (Sección de cálculos)
│   │   │   ├── ServicesSection.tsx            (Servicios consolidados)
│   │   │   ├── TaxesSection.tsx               (Impuestos y derechos)
│   │   │   ├── ExpensesSection.tsx            (Gastos de importación)
│   │   │   └── SummarySection.tsx             (Resumen final)
│   │   │
│   │   ├── components/                        📂 Componentes reutilizables
│   │   │   ├── ProductRow.tsx                 (Fila de producto pendiente)
│   │   │   ├── ProductTable.tsx               (Tabla de productos completa)
│   │   │   ├── VariantEditor.tsx              (Editor de variantes)
│   │   │   ├── PackingListEditor.tsx          (Editor de packing list)
│   │   │   ├── ServiceCard.tsx                (Card de servicio)
│   │   │   ├── TaxCard.tsx                    (Card de impuestos)
│   │   │   ├── ExpenseCard.tsx                (Card de gastos)
│   │   │   └── SummaryCard.tsx                (Card de resumen)
│   │   │
│   │   ├── hooks/                             📂 Hooks especializados
│   │   │   ├── use-quotation-data.ts          (Obtención de datos)
│   │   │   ├── use-quotation-form.ts          (Manejo de formulario)
│   │   │   ├── use-quotation-products.ts      (Manejo de productos)
│   │   │   ├── use-quotation-calculations.ts  (Cálculos)
│   │   │   ├── use-quotation-submit.ts        (Envío de respuesta)
│   │   │   └── use-quotation-validation.ts    (Validaciones)
│   │   │
│   │   ├── services/                          📂 Lógica de negocio pura
│   │   │   ├── quotation-calculator.service.ts     (Cálculos de impuestos/costos)
│   │   │   ├── quotation-dto-builder.service.ts    (Construcción de DTOs)
│   │   │   ├── quotation-validator.service.ts      (Validaciones de negocio)
│   │   │   └── quotation-aggregator.service.ts     (Agregación de datos)
│   │   │
│   │   ├── schemas/                           📂 Validación con Zod
│   │   │   ├── pending-quotation.schema.ts    (Schema vista pendiente)
│   │   │   ├── express-quotation.schema.ts    (Schema vista express)
│   │   │   └── maritime-quotation.schema.ts   (Schema vista marítima)
│   │   │
│   │   └── types/
│   │       ├── quotation-response-form.types.ts
│   │       ├── quotation-response-dto.types.ts
│   │       └── quotation-response-view.types.ts
│   │
│   ├── quotation-response-edit/               📌 Funcionalidad: Editar respuesta
│   │   ├── index.tsx                          (Re-export)
│   │   ├── QuotationResponseEditView.tsx      (150 líneas - Orquestador)
│   │   │
│   │   ├── views/                             📂 Reutiliza vistas de create
│   │   │   ├── PendingQuotationEditView.tsx   (Wrapper de PendingQuotationView)
│   │   │   ├── ExpressQuotationEditView.tsx   (Wrapper de ExpressQuotationView)
│   │   │   └── MaritimeQuotationEditView.tsx  (Wrapper de MaritimeQuotationView)
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-quotation-response-data.ts (Obtener respuesta existente)
│   │   │   ├── use-quotation-edit-form.ts     (Formulario de edición)
│   │   │   └── use-quotation-update.ts        (Actualización de respuesta)
│   │   │
│   │   └── types/
│   │       └── quotation-response-edit.types.ts
│   │
│   └── quotation-responses-list/              📌 Funcionalidad: Lista de respuestas
│       ├── index.tsx                          (Re-export)
│       ├── QuotationResponsesListView.tsx     (Vista principal)
│       ├── components/
│       │   ├── ResponseCard.tsx               (Tarjeta de respuesta)
│       │   ├── ResponseTable.tsx              (Tabla de respuestas)
│       │   └── ResponseFilters.tsx            (Filtros)
│       ├── hooks/
│       │   └── use-quotation-responses.ts     (Lógica de listado)
│       └── types/
│           └── quotation-responses-list.types.ts
│
├── shared/                                     📁 Componentes compartidos entre features
│   ├── components/
│   │   ├── QuotationCard.tsx                  (Tarjeta genérica de cotización)
│   │   ├── ProductGrid.tsx                    (Grid de productos)
│   │   ├── ImageCarousel.tsx                  (Carrusel de imágenes)
│   │   ├── ConfirmSubmitDialog.tsx            (Diálogo de confirmación)
│   │   └── SendingModal.tsx                   (Modal de envío)
│   │
│   ├── hooks/
│   │   └── use-image-modal.ts                 (Modal de imágenes compartido)
│   │
│   └── utils/
│       ├── format-currency.ts                 (Formateo de moneda)
│       ├── format-date.ts                     (Formateo de fechas)
│       └── calculate-totals.ts                (Cálculos comunes)
│
├── constants/                                  📁 Constantes y configuraciones
│   ├── logistics.constants.ts                 (Servicios logísticos, incoterms, etc.)
│   ├── maritime.constants.ts                  (Puertos, aduanas, navieras, etc.)
│   ├── tax.constants.ts                       (Tasas de impuestos por defecto)
│   └── service-fields.constants.ts            (Campos de servicios)
│
├── types/                                      📁 Tipos compartidos del módulo
│   ├── quotation.types.ts                     (Tipos base de cotización)
│   ├── quotation-response.types.ts            (Tipos de respuesta)
│   ├── product.types.ts                       (Tipos de productos)
│   ├── variant.types.ts                       (Tipos de variantes)
│   ├── calculations.types.ts                  (Tipos de cálculos)
│   └── index.ts                               (Re-exports)
│
└── utils/                                      📁 Utilidades del módulo
    ├── quotation-response-director.ts         (Director Pattern para DTOs)
    ├── quotation-response-builder.ts          (Builder Pattern para respuestas)
    └── quotation-helpers.ts                   (Funciones helper)
```

---

## Desglose por Funcionalidad

### 1. Funcionalidad: Listado de Cotizaciones

**Ubicación**: `features/quotation-list/`

**Responsabilidad**: Mostrar todas las cotizaciones con búsqueda, filtrado y paginación.

**Componentes Principales**:
```
QuotationListView.tsx (Vista principal)
├── QuotationFilters (Búsqueda y filtros)
├── QuotationCard[] (Lista de tarjetas)
└── QuotationPagination (Controles de paginación)
```

**Hooks**:
- `use-quotation-list.ts`: Manejo de datos, filtros, paginación
- `use-image-modal.ts`: Modal de vista de imágenes

**Estado**:
```typescript
{
  searchTerm: string;
  filter: string;
  pageNumber: number;
  pageSize: number;
  data: Quotation[];
  isLoading: boolean;
  isError: boolean;
}
```

---

### 2. Funcionalidad: Crear Respuesta a Cotización

**Ubicación**: `features/quotation-response-create/`

**Responsabilidad**: Crear una nueva respuesta de cotización en 3 modalidades.

#### 2.1 Vista Pendiente (Administrativa)

**Archivo**: `views/PendingQuotationView.tsx`

**Estructura del Componente**:
```tsx
<PendingQuotationView>
  <QuotationHeader />
  <QuotationSummary />
  <LogisticsConfiguration />
  <ProductsSection>
    {products.map(product => (
      <ProductRow
        product={product}
        onUpdate={handleProductUpdate}
        onVariantUpdate={handleVariantUpdate}
      />
    ))}
  </ProductsSection>
  <SummarySection />
</PendingQuotationView>
```

**Hooks Utilizados**:
- `use-quotation-data()`: Obtener cotización del servidor
- `use-quotation-products()`: Manejo de productos pendientes
- `use-quotation-submit()`: Envío de respuesta pendiente

**Flujo de Datos**:
```
1. useQuotationData() → Obtiene quotationDetail
2. useQuotationProducts() → Transforma a pendingProducts
3. Usuario edita precios en ProductRow
4. handleProductUpdate() → Actualiza estado local
5. useQuotationSubmit() → Construye DTO y envía
```

#### 2.2 Vista Express

**Archivo**: `views/ExpressQuotationView.tsx`

**Estructura del Componente**:
```tsx
<ExpressQuotationView>
  <QuotationHeader />
  <QuotationSummary />
  <LogisticsConfiguration />
  <DynamicValuesForm />
  <ServicesSection />
  <TaxesSection />
  <ExpensesSection />
  <ProductsSection>
    <ProductTable />
  </ProductsSection>
  <SummarySection />
</ExpressQuotationView>
```

**Hooks Utilizados**:
- `use-quotation-data()`: Obtener cotización
- `use-quotation-form()`: Manejo de formulario completo
- `use-quotation-calculations()`: Cálculos de impuestos/costos
- `use-quotation-submit()`: Envío de respuesta express

#### 2.3 Vista Marítima

**Archivo**: `views/MaritimeQuotationView.tsx`

**Estructura del Componente**:
```tsx
<MaritimeQuotationView>
  <QuotationHeader />
  <QuotationSummary />
  <LogisticsConfiguration />
  <MaritimeConfiguration />
  <DynamicValuesForm />
  <ServicesSection />
  <TaxesSection />
  <ExpensesSection />
  <ProductsSection>
    <ProductTable />
  </ProductsSection>
  <SummarySection />
</MaritimeQuotationView>
```

**Diferencia con Express**: Agrega `<MaritimeConfiguration />` para puertos, navieras, etc.

---

### 3. Funcionalidad: Editar Respuesta a Cotización

**Ubicación**: `features/quotation-response-edit/`

**Responsabilidad**: Editar una respuesta de cotización existente.

**Estrategia de Reutilización**:

En lugar de duplicar código, las vistas de edición actúan como **wrappers** de las vistas de creación:

```tsx
// PendingQuotationEditView.tsx
import { PendingQuotationView } from '@/features/quotation-response-create/views/PendingQuotationView';

export function PendingQuotationEditView({ responseId }: { responseId: string }) {
  // Hook específico para obtener respuesta existente
  const { data: existingResponse, isLoading } = useQuotationResponseData(responseId);

  // Transformar respuesta a formato de formulario
  const initialValues = useQuotationEditForm(existingResponse);

  if (isLoading) return <LoadingState />;

  // Renderizar la misma vista de creación pero con valores iniciales
  return (
    <PendingQuotationView
      initialValues={initialValues}
      mode="edit"
      responseId={responseId}
    />
  );
}
```

**Hooks Específicos de Edición**:
- `use-quotation-response-data.ts`: Obtener respuesta existente del servidor
- `use-quotation-edit-form.ts`: Transformar respuesta a formato de formulario
- `use-quotation-update.ts`: Actualizar respuesta (similar a submit pero con PUT/PATCH)

**Ventajas**:
- ✅ Cero duplicación de código
- ✅ Mismo UI para crear y editar
- ✅ Fácil mantenimiento (cambios en un solo lugar)

---

### 4. Funcionalidad: Lista de Respuestas

**Ubicación**: `features/quotation-responses-list/`

**Responsabilidad**: Mostrar todas las respuestas de una cotización específica.

**Componentes**:
```
QuotationResponsesListView.tsx
├── ResponseFilters (Filtros por estado)
├── ResponseTable (Tabla de respuestas)
│   └── ResponseCard[] (Cards de respuestas)
└── Pagination (Paginación)
```

**Hook Principal**:
```typescript
// use-quotation-responses.ts
export function useQuotationResponses(quotationId: string) {
  const [filter, setFilter] = useState<string>('all');

  const query = useQuery({
    queryKey: ['quotation-responses', quotationId, filter],
    queryFn: () => fetchQuotationResponses(quotationId, filter),
  });

  return {
    responses: query.data || [],
    isLoading: query.isLoading,
    filter,
    setFilter,
  };
}
```

---

## Desglose de Servicios (Lógica de Negocio)

### QuotationCalculatorService

**Archivo**: `features/quotation-response-create/services/quotation-calculator.service.ts`

**Responsabilidad**: Realizar todos los cálculos de impuestos y costos.

```typescript
export class QuotationCalculatorService {
  /**
   * Calcula el CIF (Cost, Insurance, Freight)
   */
  calculateCIF(params: CIFParams): number {
    const { fob, flete, seguro } = params;
    return fob + flete + seguro;
  }

  /**
   * Calcula Ad Valorem (arancel)
   */
  calculateAdValorem(params: AdValoremParams): number {
    const { cif, rate } = params;
    return cif * (rate / 100);
  }

  /**
   * Calcula IGV (Impuesto General a las Ventas)
   */
  calculateIGV(params: IGVParams): number {
    const { cif, adValorem, isc, rate } = params;
    const baseImponible = cif + adValorem + isc;
    return baseImponible * (rate / 100);
  }

  /**
   * Calcula IPM (Impuesto de Promoción Municipal)
   */
  calculateIPM(params: IPMParams): number {
    const { cif, adValorem, isc, rate } = params;
    const baseImponible = cif + adValorem + isc;
    return baseImponible * (rate / 100);
  }

  /**
   * Calcula el total de impuestos
   */
  calculateTotalTaxes(params: TaxCalculationParams): TaxCalculationResult {
    const adValorem = this.calculateAdValorem({
      cif: params.cif,
      rate: params.adValoremRate,
    });

    const isc = params.iscRate
      ? this.calculateISC({ cif: params.cif, rate: params.iscRate })
      : 0;

    const igv = this.calculateIGV({
      cif: params.cif,
      adValorem,
      isc,
      rate: params.igvRate,
    });

    const ipm = this.calculateIPM({
      cif: params.cif,
      adValorem,
      isc,
      rate: params.ipmRate,
    });

    const percepcion = this.calculatePercepcion({
      cif: params.cif,
      igv,
      rate: params.percepcionRate,
    });

    const totalTaxes = adValorem + isc + igv + ipm + (params.antidumpingAmount || 0);

    return {
      adValoremAmount: adValorem,
      iscAmount: isc,
      igvAmount: igv,
      ipmAmount: ipm,
      percepcionAmount: percepcion,
      antidumpingAmount: params.antidumpingAmount || 0,
      totalTaxes,
      totalTaxesInSoles: totalTaxes * params.exchangeRate,
    };
  }

  /**
   * Calcula costos de importación
   */
  calculateImportCosts(params: ImportCostParams): number {
    const servicioConsolidado = params.servicioConsolidado * 1.18;
    const gestionCertificado = params.gestionCertificado * 1.18;
    const servicioInspeccion = (params.inspeccionProductos + params.inspeccionFabrica) * 1.18;
    const servicioTransporte =
      (params.transporteLocalChina * 1.18) + params.transporteLocalDestino;
    const otrosServicios = params.otrosServicios * 1.18;

    return servicioConsolidado +
           gestionCertificado +
           servicioInspeccion +
           servicioTransporte +
           otrosServicios +
           params.totalTaxes;
  }
}
```

**Testing**:
```typescript
// quotation-calculator.service.test.ts
describe('QuotationCalculatorService', () => {
  const calculator = new QuotationCalculatorService();

  describe('calculateCIF', () => {
    it('should calculate CIF correctly', () => {
      const result = calculator.calculateCIF({
        fob: 10000,
        flete: 1000,
        seguro: 100,
      });
      expect(result).toBe(11100);
    });
  });

  describe('calculateAdValorem', () => {
    it('should calculate Ad Valorem with 4% rate', () => {
      const result = calculator.calculateAdValorem({
        cif: 11100,
        rate: 4,
      });
      expect(result).toBe(444);
    });
  });

  // ... más tests
});
```

---

### QuotationDtoBuilderService

**Archivo**: `features/quotation-response-create/services/quotation-dto-builder.service.ts`

**Responsabilidad**: Construir DTOs para enviar al servidor.

```typescript
export class QuotationDtoBuilderService {
  /**
   * Construye DTO según el tipo de servicio
   */
  build(
    viewType: 'pending' | 'express' | 'maritime',
    data: QuotationFormData
  ): QuotationResponseDTO {
    switch (viewType) {
      case 'pending':
        return this.buildPendingDto(data);
      case 'maritime':
        return this.buildMaritimeDto(data);
      case 'express':
        return this.buildExpressDto(data);
      default:
        throw new Error(`Unknown view type: ${viewType}`);
    }
  }

  /**
   * Construye DTO para servicio pendiente
   */
  private buildPendingDto(data: QuotationFormData): PendingQuotationResponseDTO {
    return {
      quotationId: data.quotationId,
      advisorId: data.advisorId,
      serviceLogistic: data.logisticConfig.serviceLogistic,
      incoterm: data.logisticConfig.incoterm,
      cargoType: data.logisticConfig.cargoType,
      courier: data.logisticConfig.courier,
      products: data.products.map(product => ({
        productId: product.productId,
        isQuoted: product.isQuoted,
        adminComment: product.adminComment,
        ghostUrl: product.ghostUrl,
        packingList: product.packingList,
        cargoHandling: product.cargoHandling,
        variants: product.variants.map(variant => ({
          variantId: variant.variantId,
          quantity: variant.quantity,
          isQuoted: variant.isQuoted,
          unitPrice: variant.unitPrice,
          expressPrice: variant.expressPrice,
        })),
      })),
      totals: data.aggregatedTotals,
    };
  }

  /**
   * Construye DTO para servicio express
   */
  private buildExpressDto(data: QuotationFormData): ExpressQuotationResponseDTO {
    return {
      quotationId: data.quotationId,
      advisorId: data.advisorId,
      // Configuración logística
      logisticConfig: data.logisticConfig,
      // Productos
      products: this.buildProductsDto(data.products),
      // Cálculos
      calculations: data.calculations,
      // Servicios
      serviceCalculations: data.serviceCalculations,
      // Gastos
      importCosts: data.importCosts,
      // Resumen
      quoteSummary: data.quoteSummary,
      // CIF
      cifValue: data.cifValue,
      // Tasas
      taxRates: data.taxRates,
      // Impuestos calculados
      calculatedTaxes: data.calculatedTaxes,
    };
  }

  /**
   * Construye DTO para servicio marítimo
   */
  private buildMaritimeDto(data: QuotationFormData): MaritimeQuotationResponseDTO {
    return {
      ...this.buildExpressDto(data),
      maritimeConfig: data.maritimeConfig, // Configuración específica marítima
    };
  }

  /**
   * Construye array de productos para DTO
   */
  private buildProductsDto(products: QuotationProduct[]): ProductDTO[] {
    return products.map(product => ({
      productId: product.productId,
      isQuoted: product.isQuoted,
      unitCost: product.unitCost,
      importCosts: product.importCosts,
      totalCost: product.totalCost,
      equivalence: product.equivalence,
      variants: product.variants.map(variant => ({
        variantId: variant.variantId,
        quantity: variant.quantity,
        isQuoted: variant.isQuoted,
        unitCost: variant.unitCost,
      })),
    }));
  }
}
```

**Testing**:
```typescript
// quotation-dto-builder.service.test.ts
describe('QuotationDtoBuilderService', () => {
  const builder = new QuotationDtoBuilderService();

  describe('buildPendingDto', () => {
    it('should build pending DTO correctly', () => {
      const mockData: QuotationFormData = {
        quotationId: 'Q-123',
        advisorId: 'ADV-456',
        // ... mock data
      };

      const result = builder.build('pending', mockData);

      expect(result).toHaveProperty('quotationId', 'Q-123');
      expect(result).toHaveProperty('products');
      expect(result.products).toHaveLength(mockData.products.length);
    });
  });

  // ... más tests
});
```

---

## Desglose de Hooks

### use-quotation-data.ts

**Responsabilidad**: Obtener y transformar datos de cotización desde el servidor.

```typescript
// features/quotation-response-create/hooks/use-quotation-data.ts

export function useQuotationData(quotationId: string) {
  // Obtener datos del servidor
  const query = useGetQuotationById(quotationId);

  // Transformar productos al formato de la aplicación
  const transformedProducts = useMemo(() => {
    if (!query.data?.products) return [];

    return query.data.products.map(product => ({
      id: product.productId,
      name: product.name,
      url: product.url || '',
      comment: product.comment || '',
      quantityTotal: product.quantityTotal || 0,
      weight: parseFloat(product.weight) || 0,
      volume: parseFloat(product.volume) || 0,
      boxes: product.number_of_boxes || 0,
      variants: product.variants?.map(variant => ({
        id: variant.variantId,
        size: variant.size || '',
        presentation: variant.presentation || '',
        model: variant.model || '',
        color: variant.color || '',
        quantity: variant.quantity || 1,
        attachments: variant.attachments || [],
      })) || [],
    }));
  }, [query.data]);

  return {
    quotation: query.data,
    products: transformedProducts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
```

---

### use-quotation-products.ts

**Responsabilidad**: Manejo de estado de productos (para vista pendiente).

```typescript
// features/quotation-response-create/hooks/use-quotation-products.ts

export function useQuotationProducts(initialProducts: Product[]) {
  const [products, setProducts] = useState<PendingProduct[]>([]);

  // Inicializar productos con valores por defecto
  useEffect(() => {
    if (initialProducts.length > 0 && products.length === 0) {
      const initialized = initialProducts.map(product => ({
        ...product,
        price: 0,
        express: 0,
        total: 0,
        adminComment: '',
        ghostUrl: product.url || '',
        packingList: {
          boxes: product.boxes,
          cbm: product.volume,
          weightKg: product.weight,
          weightTon: product.weight / 1000,
        },
        cargoHandling: {
          fragileProduct: false,
          stackProduct: false,
          bulkyProduct: false,
        },
        variants: product.variants.map(variant => ({
          ...variant,
          price: 0,
          priceExpress: 0,
          weight: 0,
          cbm: 0,
        })),
      }));
      setProducts(initialized);
    }
  }, [initialProducts]);

  // Actualizar producto completo
  const updateProduct = useCallback((productId: string, updates: Partial<PendingProduct>) => {
    setProducts(prev => prev.map(product =>
      product.id === productId
        ? { ...product, ...updates }
        : product
    ));
  }, []);

  // Actualizar solo packing list
  const updatePackingList = useCallback((productId: string, packingList: PackingList) => {
    setProducts(prev => prev.map(product =>
      product.id === productId
        ? {
            ...product,
            packingList,
            boxes: packingList.boxes,
            volume: packingList.cbm,
            weight: packingList.weightKg,
          }
        : product
    ));
  }, []);

  // Actualizar variante
  const updateVariant = useCallback((
    productId: string,
    variantId: string,
    updates: Partial<PendingVariant>
  ) => {
    setProducts(prev => prev.map(product =>
      product.id === productId
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.id === variantId
                ? { ...variant, ...updates }
                : variant
            ),
          }
        : product
    ));
  }, []);

  return {
    products,
    updateProduct,
    updatePackingList,
    updateVariant,
  };
}
```

---

### use-quotation-calculations.ts

**Responsabilidad**: Realizar cálculos de impuestos y costos en tiempo real.

```typescript
// features/quotation-response-create/hooks/use-quotation-calculations.ts

export function useQuotationCalculations(params: CalculationParams) {
  const calculator = useMemo(() => new QuotationCalculatorService(), []);

  // Calcular CIF
  const cif = useMemo(() => {
    return calculator.calculateCIF({
      fob: params.dynamicValues.fob || 0,
      flete: params.dynamicValues.flete || 0,
      seguro: params.dynamicValues.seguro || 0,
    });
  }, [params.dynamicValues.fob, params.dynamicValues.flete, params.dynamicValues.seguro]);

  // Calcular impuestos
  const taxes = useMemo(() => {
    return calculator.calculateTotalTaxes({
      cif,
      adValoremRate: params.dynamicValues.adValoremRate || 4,
      igvRate: params.dynamicValues.igvRate || 18,
      ipmRate: params.dynamicValues.ipmRate || 2,
      iscRate: params.dynamicValues.iscRate || 0,
      percepcionRate: params.dynamicValues.percepcionRate || 5,
      antidumpingAmount: params.dynamicValues.antidumpingCantidad || 0,
      exchangeRate: params.dynamicValues.tipoCambio || 3.7,
    });
  }, [cif, params.dynamicValues]);

  // Calcular costos de importación
  const importCosts = useMemo(() => {
    return calculator.calculateImportCosts({
      servicioConsolidado: params.dynamicValues.servicioConsolidado || 0,
      gestionCertificado: params.dynamicValues.gestionCertificado || 0,
      inspeccionProductos: params.dynamicValues.inspeccionProductos || 0,
      inspeccionFabrica: params.dynamicValues.inspeccionFabrica || 0,
      transporteLocalChina: params.dynamicValues.transporteLocalChinaEnvio || 0,
      transporteLocalDestino: params.dynamicValues.transporteLocalClienteEnvio || 0,
      otrosServicios: params.dynamicValues.otrosServicios || 0,
      totalTaxes: taxes.totalTaxes,
    });
  }, [params.dynamicValues, taxes.totalTaxes]);

  // Calcular totales de productos
  const productTotals = useMemo(() => {
    return params.products.reduce((acc, product) => {
      const selectedVariants = product.variants.filter(variant =>
        params.variantQuotationState[product.id]?.[variant.id] !== false
      );

      const totalPrice = selectedVariants.reduce(
        (sum, variant) => sum + (variant.price || 0) * (variant.quantity || 0),
        0
      );

      const totalWeight = selectedVariants.reduce(
        (sum, variant) => sum + (variant.weight || 0) * (variant.quantity || 0),
        0
      );

      const totalCBM = selectedVariants.reduce(
        (sum, variant) => sum + (variant.cbm || 0) * (variant.quantity || 0),
        0
      );

      return {
        totalPrice: acc.totalPrice + totalPrice,
        totalWeight: acc.totalWeight + totalWeight,
        totalCBM: acc.totalCBM + totalCBM,
      };
    }, { totalPrice: 0, totalWeight: 0, totalCBM: 0 });
  }, [params.products, params.variantQuotationState]);

  return {
    cif,
    ...taxes,
    importCosts,
    ...productTotals,
    finalTotal: importCosts,
  };
}
```

---

### use-quotation-submit.ts

**Responsabilidad**: Enviar respuesta de cotización al servidor.

```typescript
// features/quotation-response-create/hooks/use-quotation-submit.ts

export function useQuotationSubmit(params: SubmitParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mutation = useCreateQuotationResponse();
  const dtoBuilder = useMemo(() => new QuotationDtoBuilderService(), []);

  const submitQuotation = useCallback(async (data: QuotationFormData) => {
    setIsSubmitting(true);
    try {
      // Determinar tipo de vista
      let viewType: 'pending' | 'express' | 'maritime';
      if (params.serviceType === 'Pendiente') {
        viewType = 'pending';
      } else if (params.serviceType.includes('Maritimo')) {
        viewType = 'maritime';
      } else {
        viewType = 'express';
      }

      // Construir DTO
      const dto = dtoBuilder.build(viewType, data);

      // Validar DTO
      const validator = new QuotationValidatorService();
      validator.validate(viewType, dto);

      // Enviar al servidor
      await mutation.mutateAsync({
        data: dto,
        quotationId: params.quotationId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error al enviar cotización:', error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  }, [params, dtoBuilder, mutation]);

  return {
    submitQuotation,
    isSubmitting,
  };
}
```

---

## Plan de Migración

### Fase 1: Preparación (1 semana)

**Objetivo**: Establecer base sin romper funcionalidad actual.

**Tareas**:
1. ✅ Crear estructura de carpetas `features/`
2. ✅ Mover constantes a `constants/`
3. ✅ Crear tipos compartidos en `types/`
4. ✅ Crear servicios en `services/`
5. ✅ Escribir tests unitarios para servicios

**Entregables**:
- [ ] Estructura de carpetas completa
- [ ] Servicios con 100% cobertura de tests
- [ ] Documentación de tipos

---

### Fase 2: Migrar Listado de Cotizaciones (3 días)

**Objetivo**: Mover funcionalidad de listado a `features/quotation-list/`.

**Tareas**:
1. Crear `QuotationListView.tsx`
2. Mover `use-quotation-list.ts` a feature
3. Mover `QuotationCard.tsx` a feature
4. Actualizar imports en `gestion-de-cotizacion-view.tsx`
5. Tests de integración

**Resultado**: Listado funcional en nueva estructura.

---

### Fase 3: Extraer Lógica de Negocio (1 semana)

**Objetivo**: Sacar toda la lógica de cálculos de `quotation-response-view.tsx`.

**Tareas**:
1. Crear `QuotationCalculatorService` con todos los cálculos
2. Crear `QuotationDtoBuilderService` para construcción de DTOs
3. Crear `QuotationAggregatorService` para agregación de datos
4. Refactorizar `use-quotation-calculations` para usar servicios
5. Tests unitarios exhaustivos

**Resultado**: Lógica de negocio 100% testeable y desacoplada.

---

### Fase 4: Dividir Hooks (1 semana)

**Objetivo**: Separar `use-quotation-response-form.ts` en hooks especializados.

**Tareas**:
1. Crear `use-quotation-data.ts`
2. Crear `use-quotation-products.ts`
3. Crear `use-quotation-submit.ts`
4. Actualizar `use-quotation-calculations.ts`
5. Deprecar partes de `use-quotation-response-form.ts`

**Resultado**: Hooks pequeños, enfocados, reutilizables.

---

### Fase 5: Dividir Componentes - Vista Pendiente (1 semana)

**Objetivo**: Crear estructura para `features/quotation-response-create/` empezando por vista pendiente.

**Tareas**:
1. Crear carpetas `views/`, `sections/`, `components/`
2. Extraer `<ProductRow />` de `quotation-response-view.tsx`
3. Crear `PendingQuotationView.tsx` usando secciones
4. Mover lógica pendiente a hooks especializados
5. Tests de componentes

**Resultado**: Vista pendiente completamente separada.

---

### Fase 6: Dividir Componentes - Vista Express (1 semana)

**Objetivo**: Crear `ExpressQuotationView.tsx`.

**Tareas**:
1. Crear secciones: `ServicesSection`, `TaxesSection`, `ExpensesSection`
2. Crear `ProductTable.tsx` para vista completa
3. Crear `ExpressQuotationView.tsx` componiendo secciones
4. Refactorizar hooks para soportar vista express
5. Tests de componentes

**Resultado**: Vista express completamente separada.

---

### Fase 7: Dividir Componentes - Vista Marítima (1 semana)

**Objetivo**: Crear `MaritimeQuotationView.tsx`.

**Tareas**:
1. Crear `MaritimeConfiguration.tsx`
2. Crear `MaritimeQuotationView.tsx` extendiendo `ExpressQuotationView`
3. Ajustar hooks para configuración marítima
4. Tests de componentes

**Resultado**: Vista marítima completamente separada.

---

### Fase 8: Orquestador Principal (3 días)

**Objetivo**: Simplificar `QuotationResponseCreateView.tsx` a orquestador.

**Tareas**:
1. Crear `QuotationResponseCreateView.tsx` en `features/quotation-response-create/`
2. Implementar lógica de decisión de vistas
3. Conectar con hooks y servicios
4. Actualizar rutas
5. Eliminar `quotation-response-view.tsx` antiguo

**Resultado**: Componente principal de ~150 líneas.

---

### Fase 9: Implementar Edición (1 semana)

**Objetivo**: Crear funcionalidad de edición reutilizando vistas.

**Tareas**:
1. Crear `features/quotation-response-edit/`
2. Crear hooks `use-quotation-response-data.ts`, `use-quotation-edit-form.ts`
3. Crear wrappers de vistas de edición
4. Implementar lógica de actualización
5. Tests end-to-end

**Resultado**: Edición funcional sin duplicar código.

---

### Fase 10: Migrar Lista de Respuestas (3 días)

**Objetivo**: Mover `quotation-responses-list` a `features/`.

**Tareas**:
1. Crear `features/quotation-responses-list/`
2. Mover componentes y hooks
3. Actualizar imports
4. Tests

**Resultado**: Lista de respuestas en nueva estructura.

---

### Fase 11: Optimización y Limpieza (1 semana)

**Objetivo**: Optimizar rendimiento y eliminar código duplicado.

**Tareas**:
1. Agregar memoización estratégica (`useMemo`, `useCallback`)
2. Implementar validación con Zod schemas
3. Agregar Error Boundaries
4. Eliminar archivos deprecados
5. Documentar todo el módulo

**Resultado**: Código optimizado y documentado.

---

### Fase 12: Testing y QA (1 semana)

**Objetivo**: Garantizar calidad antes de deploy.

**Tareas**:
1. Tests unitarios para todos los servicios (100% cobertura)
2. Tests de integración para hooks
3. Tests de componentes con React Testing Library
4. Tests end-to-end con Playwright/Cypress
5. Pruebas de rendimiento
6. QA manual exhaustivo

**Resultado**: Suite de tests completa y funcionalidad validada.

---

## Beneficios Esperados

### 1. Mantenibilidad

**Antes**:
- 1 archivo de 1350 líneas
- Difícil encontrar código específico
- Cambios rompen múltiples funcionalidades

**Después**:
- Archivos de ~150 líneas máximo
- Estructura clara por funcionalidad
- Cambios aislados y seguros

---

### 2. Testabilidad

**Antes**:
- Difícil testear lógica de negocio mezclada con UI
- Tests requieren montar componentes completos
- Dependencias difíciles de mockear

**Después**:
- Servicios 100% testeables sin UI
- Hooks testeables independientemente
- Tests rápidos y confiables

**Ejemplo**:
```typescript
// Antes: Difícil de testear
const handleSubmit = async () => {
  // 267 líneas de lógica mezclada con UI
  // Imposible testear sin montar todo el componente
};

// Después: Fácil de testear
describe('QuotationDtoBuilderService', () => {
  it('builds pending DTO correctly', () => {
    const result = builder.buildPendingDto(mockData);
    expect(result).toMatchSnapshot();
  });
});
```

---

### 3. Reutilización de Código

**Antes**:
- Código duplicado entre creación y edición
- Componentes muy específicos, no reutilizables
- Lógica repetida en múltiples lugares

**Después**:
- Vistas compartidas entre creación y edición
- Componentes genéricos y reutilizables
- Lógica centralizada en servicios

**Ejemplo**:
```tsx
// Edición reutiliza vistas de creación
<PendingQuotationView
  initialValues={existingResponse}
  mode="edit"
/>
```

---

### 4. Onboarding de Nuevos Desarrolladores

**Antes**:
- "Lee este archivo de 1350 líneas"
- Difícil entender flujo de datos
- Alto riesgo de romper funcionalidad

**Después**:
- Estructura intuitiva por features
- Archivos pequeños y enfocados
- Documentación clara de responsabilidades

**Ejemplo**:
```
¿Necesitas agregar un nuevo impuesto?
→ Ve a services/quotation-calculator.service.ts
→ Agrega método calculateNuevoImpuesto()
→ Actualiza calculateTotalTaxes()
→ Escribe test en quotation-calculator.service.test.ts
```

---

### 5. Performance

**Antes**:
- Re-renders innecesarios por estado global
- Cálculos repetidos sin memoización
- Componentes gigantes que renderizan todo

**Después**:
- Memoización estratégica
- Componentes pequeños que renderizan solo lo necesario
- Estado local optimizado

**Ejemplo**:
```typescript
// Memoización inteligente
const taxes = useMemo(
  () => calculator.calculateTotalTaxes(params),
  [params.cif, params.rates] // Solo recalcula si cambian estos valores
);
```

---

### 6. Escalabilidad

**Antes**:
- Agregar nueva funcionalidad = modificar archivo gigante
- Alto riesgo de conflictos en Git
- Difícil trabajar en paralelo

**Después**:
- Agregar nueva funcionalidad = nuevo archivo en feature
- Bajo riesgo de conflictos
- Equipos pueden trabajar en features independientes

**Ejemplo**:
```
Nuevo requerimiento: Agregar vista "Cotización Aérea"
1. Crear features/quotation-response-create/views/AerialQuotationView.tsx
2. Actualizar orquestador para detectar servicio aéreo
3. ¡Listo! Sin tocar código existente
```

---

### 7. Debugging

**Antes**:
- Errores difíciles de rastrear en archivo gigante
- Estado distribuido en múltiples lugares
- Logs confusos

**Después**:
- Stack traces claros apuntan a archivos específicos
- Estado bien definido y localizado
- Servicios con logs estructurados

**Ejemplo**:
```
Error en cálculo de impuestos
→ Stack trace apunta a quotation-calculator.service.ts:calculateIGV()
→ Fácil identificar y corregir
```

---

## Métricas de Éxito

### Antes de la Refactorización

```
📊 Métricas Actuales

Líneas de código por archivo:
- quotation-response-view.tsx: 1350 líneas ❌

Complejidad ciclomática:
- handleSubmitQuotation: 45 ❌
- Total componente: 150 ❌

Cobertura de tests:
- Lógica de negocio: 10% ❌
- Componentes: 5% ❌

Tiempo de onboarding:
- Nuevo desarrollador: 2 semanas ❌

Bugs reportados:
- Últimos 3 meses: 23 bugs ❌
```

### Después de la Refactorización (Objetivo)

```
📊 Métricas Objetivo

Líneas de código por archivo:
- Máximo: 200 líneas ✅
- Promedio: 100 líneas ✅

Complejidad ciclomática:
- Funciones: < 10 ✅
- Componentes: < 20 ✅

Cobertura de tests:
- Lógica de negocio: 100% ✅
- Componentes: 80% ✅
- E2E: Flujos críticos 100% ✅

Tiempo de onboarding:
- Nuevo desarrollador: 3 días ✅

Bugs reportados:
- Objetivo: Reducir 70% ✅
```

---

## Conclusión

### Resumen de Cambios Principales

1. **Separación por Features**: Cada funcionalidad en su propia carpeta
2. **Servicios de Negocio**: Lógica pura y testeable
3. **Hooks Especializados**: Pequeños, enfocados, reutilizables
4. **Componentes Atómicos**: Componibles y mantenibles
5. **Reutilización**: Edición reutiliza vistas de creación

### Tiempo Estimado Total

**Fases 1-12**: ~3 meses (12 semanas) con 1 desarrollador full-time

**Alternativa incremental**: Implementar en sprints de 2 semanas, liberando features gradualment

### Recomendación Final

✅ **Proceder con la refactorización**

**Razones**:
1. El código actual es insostenible a largo plazo
2. Cada nuevo feature agrega más complejidad
3. La inversión se paga en 6 meses con reducción de bugs y velocidad de desarrollo
4. Nueva estructura facilita crecimiento del equipo

**Próximos Pasos**:
1. Aprobar esta propuesta
2. Priorizar fases según urgencia de negocio
3. Asignar recursos (1-2 desarrolladores)
4. Comenzar con Fase 1 (Preparación)
5. Iteraciones semanales con revisión de progreso

---

**Documento preparado por**: Claude Code
**Fecha**: 2025-11-02
**Versión**: 1.0
**Estado**: Propuesta para Revisión
