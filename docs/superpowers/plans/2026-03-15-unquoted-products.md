# Unquoted Products Visual Indicator — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar un indicador visual "Sin cotizar / Pendiente" en las vistas de respuesta cuando un producto tiene `isQuoted: false` y precios en `0`.

**Architecture:** Cambios puramente visuales en tres archivos de presentación. No hay cambios en lógica, DTOs ni capa API. Se propaga el campo `isQuoted` ya disponible en la API al componente de renderizado.

**Tech Stack:** React 19, TypeScript, TailwindCSS 4, shadcn/ui (Badge component)

---

## Chunk 1: Propagar `isQuoted` en pending-service-view y mostrar badge en QuotationProductRowView

### Task 1: Agregar `isQuoted` al mapeo en `pending-service-view.tsx`

**Files:**
- Modify: `src/pages/respuestas-cotizacion/components/pending-service-view.tsx` (líneas 26-69)

- [ ] **Step 1: Agregar `isQuoted` al objeto retornado en el `.map()`**

En el archivo `src/pages/respuestas-cotizacion/components/pending-service-view.tsx`, dentro del bloque `return { ... }` del `mappedProducts.map()`, agregar la propiedad después de `ghostUrl`:

```typescript
// Antes (línea 68-69):
      cargoHandling: product.cargoHandling,
      ghostUrl: product.ghostUrl || "",

// Después:
      cargoHandling: product.cargoHandling,
      ghostUrl: product.ghostUrl || "",
      isQuoted: product.isQuoted,
```

- [ ] **Step 2: Verificar que TypeScript compila sin errores**

```bash
npm run type-check
```

Expected: sin errores de compilación.

- [ ] **Step 3: Commit**

```bash
git add src/pages/respuestas-cotizacion/components/pending-service-view.tsx
git commit -m "feat: propagar isQuoted al mapeo de productos en pending-service-view"
```

---

### Task 2: Agregar badge "Sin cotizar" en `QuotationProductRowView.tsx`

**Files:**
- Modify: `src/pages/respuestas-cotizacion/components/view-cards/QuotationProductRowView.tsx`

- [ ] **Step 1: Agregar `isQuoted` a la interfaz `PendingProduct`**

Localizar la interfaz `PendingProduct` (línea ~48) y agregar el campo:

```typescript
interface PendingProduct {
  productId: string;
  name: string;
  url?: string;
  comment?: string;
  quantityTotal: number;
  weight: string;
  volume: string;
  number_of_boxes: number;
  variants?: ProductVariant[];
  attachments?: string[];
  adminComment?: string;
  packingList?: PackingList;
  cargoHandling?: CargoHandling;
  ghostUrl?: string;
  pendingPricing?: {
    unitPrice: number;
    expressPrice: number;
  };
  isQuoted?: boolean;   // <-- agregar esta línea
}
```

- [ ] **Step 2: Mostrar badge "Sin cotizar" en la columna NRO cuando `isQuoted === false`**

Localizar la celda `/* Columna 1: NRO. */` (línea ~174) y modificarla:

```tsx
{/* Columna 1: NRO. */}
<td className="p-3 text-center align-top border-r border-blue-200/30">
  <div className="text-lg font-bold text-gray-800">{index + 1}</div>
  {product.isQuoted === false && (
    <Badge className="mt-1 text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
      Sin cotizar
    </Badge>
  )}
</td>
```

- [ ] **Step 3: Aplicar colores neutros en PRECIO/EXPRESS/P.TOTAL cuando `isQuoted === false`**

Localizar la celda `/* Columna 6: PRECIO */` (línea ~334) y modificar el color del contenedor:

```tsx
{/* Columna 6: PRECIO */}
<td className="p-3 text-center align-top border-r border-blue-200/30">
  <div className="text-xs text-slate-600 mb-1">USD</div>
  <div className={`text-lg font-semibold border rounded-lg px-2 py-1 ${
    product.isQuoted === false
      ? "text-gray-400 border-gray-200 bg-gray-50"
      : "text-emerald-700 border-emerald-300/50 bg-emerald-100/50"
  }`}>
    $
    {product.variants && product.variants.length > 0
      ? aggregatedData.totalPrice.toFixed(2)
      : (product.pendingPricing?.unitPrice || 0).toFixed(2)}
  </div>
</td>
```

Localizar `/* Columna 7: EXPRESS */` (línea ~345) y aplicar el mismo patrón:

```tsx
{/* Columna 7: EXPRESS */}
<td className="p-3 text-center align-top border-r border-blue-200/30">
  <div className="text-xs text-slate-600 mb-1">USD</div>
  <div className={`text-lg font-semibold border rounded-lg px-2 py-1 ${
    product.isQuoted === false
      ? "text-gray-400 border-gray-200 bg-gray-50"
      : "text-blue-700 border-blue-300/50 bg-blue-100/50"
  }`}>
    $
    {product.variants && product.variants.length > 0
      ? aggregatedData.totalExpress.toFixed(2)
      : (product.pendingPricing?.expressPrice || 0).toFixed(2)}
  </div>
</td>
```

Localizar `/* Columna 8: P. TOTAL */` (línea ~356) y aplicar el mismo patrón:

```tsx
{/* Columna 8: P. TOTAL */}
<td className="p-3 text-center align-top">
  <div className="text-xs text-slate-600 mb-1">USD</div>
  <div className={`text-lg font-semibold border rounded-lg px-2 py-1 ${
    product.isQuoted === false
      ? "text-gray-400 border-gray-200 bg-gray-50"
      : "text-indigo-700 border-indigo-300/50 bg-indigo-100/50"
  }`}>
    $
    {(product.variants && product.variants.length > 0
      ? aggregatedData.totalPrice + aggregatedData.totalExpress
      : (product.pendingPricing?.unitPrice || 0) +
        (product.pendingPricing?.expressPrice || 0)
    ).toFixed(2)}
  </div>
</td>
```

- [ ] **Step 4: Verificar que TypeScript compila sin errores**

```bash
npm run type-check
```

Expected: sin errores de compilación.

- [ ] **Step 5: Commit**

```bash
git add src/pages/respuestas-cotizacion/components/view-cards/QuotationProductRowView.tsx
git commit -m "feat: mostrar badge 'Sin cotizar' en QuotationProductRowView cuando isQuoted es false"
```

---

## Chunk 2: Badge "Pendiente" en EditableUnitCostTableView

### Task 3: Agregar badge "Pendiente" en `EditableUnitCostTableView.tsx`

**Files:**
- Modify: `src/pages/respuestas-cotizacion/components/view-cards/EditableUnitCostTableView.tsx`

- [ ] **Step 1: Agregar badge "Pendiente" en la columna PRODUCTO & VARIANTES cuando `seCotiza === false`**

Localizar la celda `/* Columna 2: PRODUCTO & VARIANTES */` (línea ~261). Modificar el bloque interno para agregar el badge:

```tsx
{/* Columna 2: PRODUCTO & VARIANTES */}
<td className="p-3 border-r border-slate-200/30">
  <div className="space-y-2 ">
    <div>
      <h3 className="font-semibold text-gray-800 truncate uppercase">
        {product.name}
      </h3>
      {product.seCotiza === false && (
        <Badge className="mt-1 text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
          Pendiente de cotizar
        </Badge>
      )}
    </div>

    {hasVariants && (
      <Button
        variant="ghost"
        size="sm"
        className="text-xs bg-green-100 hover:bg-green-200 "
        onClick={() =>
          toggleProductExpansion(product.id)
        }
      >
        {expandedProducts.has(product.id) ? (
          <ChevronDown className="h-4 w-4 text-slate-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-600" />
        )}
        {product?.variants?.length} variante
        {product?.variants?.length !== 1 ? "s" : ""}
      </Button>
    )}
  </div>
</td>
```

- [ ] **Step 2: Aplicar fondo ámbar en la fila completa cuando `seCotiza === false`**

Localizar la `<tr>` del producto (línea ~254) y agregar clase condicional:

```tsx
<tr className={`border-b border-slate-200/40 transition-colors ${
  product.seCotiza === false
    ? "bg-amber-50/40 hover:bg-amber-50/60"
    : "hover:bg-blue-50/30"
}`}>
```

- [ ] **Step 3: Verificar que TypeScript compila sin errores**

```bash
npm run type-check
```

Expected: sin errores de compilación.

- [ ] **Step 4: Verificar build de producción**

```bash
npm run build
```

Expected: build exitoso sin errores.

- [ ] **Step 5: Commit final**

```bash
git add src/pages/respuestas-cotizacion/components/view-cards/EditableUnitCostTableView.tsx
git commit -m "feat: mostrar badge 'Pendiente de cotizar' en EditableUnitCostTableView cuando seCotiza es false"
```
