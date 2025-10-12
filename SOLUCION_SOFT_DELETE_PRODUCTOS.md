# Solución: Soft Delete para Productos con Respuestas del Administrador

## Problema Original

Al intentar eliminar un producto que tenía respuestas del administrador asociadas mediante el endpoint `PATCH /quotations/:id`, el sistema arrojaba el siguiente error:

```json
{
  "message": "No se puede eliminar el producto \"axzczx\" porque tiene respuestas del administrador asociadas. Solo puedes editar sus datos.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Caso de Uso

El usuario necesita **eliminar productos de una cotización** que ya no requiere, incluso si esos productos tienen respuestas del administrador asociadas. El sistema anterior lanzaba un error y bloqueaba la operación.

---

## Solución Implementada: Soft Delete Híbrido

Se implementó un sistema de **soft delete híbrido** que distingue entre dos escenarios:

### 1. Productos/Variantes CON Respuestas (Soft Delete)
- Se marcan como **inactivos** (`is_active = false`)
- Se mantienen en la base de datos
- Las relaciones con respuestas permanecen intactas
- **NO se eliminan físicamente**

### 2. Productos/Variantes SIN Respuestas (Hard Delete)
- Se eliminan físicamente de la base de datos
- No hay riesgo de perder datos importantes
- Libera espacio en la BD

---

## Cambios Realizados

### 1. Entidades Actualizadas

#### ProductsQuotation Entity
**Archivo**: [products-quotation.entity.ts](src/entities/products-quotation.entity.ts)

```typescript
@Column({ default: true })
is_active: boolean;
```

- **Campo agregado**: `is_active` (boolean, default: `true`)
- **Propósito**: Marcar productos desactivados sin eliminarlos

#### ProductVariant Entity
**Archivo**: [product-variant.entity.ts](src/entities/product-variant.entity.ts)

```typescript
@Column({ default: true })
is_active: boolean;
```

- **Campo agregado**: `is_active` (boolean, default: `true`)
- **Propósito**: Marcar variantes desactivadas sin eliminarlas

---

### 2. Lógica de Eliminación Mejorada

#### Método `update()` - Productos
**Archivo**: [quotations.service.ts:605-640](src/quotations/quotations.service.ts#L605-L640)

**Antes (Lanzaba Error):**
```typescript
if (hasResponses > 0) {
  throw new BadRequestException(
    `No se puede eliminar el producto...`
  );
}

await transactionalEntityManager.delete('ProductsQuotation', {...});
```

**Después (Soft Delete):**
```typescript
if (hasResponses > 0) {
  // SOFT DELETE: Marcar como inactivo
  await transactionalEntityManager.update(
    'ProductsQuotation',
    { id_product_quotation: product.id_product_quotation },
    { is_active: false },
  );

  // Desactivar todas las variantes del producto
  await transactionalEntityManager.update(
    'ProductVariant',
    { product: { id_product_quotation: product.id_product_quotation } },
    { is_active: false },
  );
} else {
  // HARD DELETE: Eliminar físicamente si NO tiene respuestas
  await transactionalEntityManager.delete('ProductVariant', {...});
  await transactionalEntityManager.delete('ProductsQuotation', {...});
}
```

#### Método `update()` - Variantes
**Archivo**: [quotations.service.ts:675-701](src/quotations/quotations.service.ts#L675-L701)

**Antes (Lanzaba Error):**
```typescript
if (hasVariantResponses > 0) {
  throw new BadRequestException(
    `No se puede eliminar la variante...`
  );
}

await transactionalEntityManager.delete('ProductVariant', {...});
```

**Después (Soft Delete):**
```typescript
if (hasVariantResponses > 0) {
  // SOFT DELETE: Marcar variante como inactiva
  await transactionalEntityManager.update(
    'ProductVariant',
    { id_product_variant: variant.id_product_variant },
    { is_active: false },
  );
} else {
  // HARD DELETE: Eliminar físicamente si NO tiene respuestas
  await transactionalEntityManager.delete('ProductVariant', {...});
}
```

---

### 3. Filtrado de Productos Inactivos en Consultas

Todos los métodos de lectura fueron actualizados para **excluir productos y variantes inactivos**:

#### `findAllByUser()`
**Archivo**: [quotations.service.ts:270-294](src/quotations/quotations.service.ts#L270-L294)

```typescript
products: quotation.products
  .filter((product) => product.is_active !== false)
  .map((product) => ({
    ...product,
    variants: product.variants
      ? product.variants
          .filter((variant) => variant.is_active !== false)
          .map((variant) => ({...}))
      : [],
  }))
```

#### `findAllPaginated()`
**Archivo**: [quotations.service.ts:388-412](src/quotations/quotations.service.ts#L388-L412)

```typescript
products: quotation.products
  .filter((product) => product.is_active !== false)
  .map((product) => ({
    ...product,
    variants: product.variants
      ? product.variants
          .filter((variant) => variant.is_active !== false)
          .map((variant) => ({...}))
      : [],
  }))
```

#### `findOne()`
**Archivo**: [quotations.service.ts:463-487](src/quotations/quotations.service.ts#L463-L487)

```typescript
products: quotation.products
  .filter((product) => product.is_active !== false)
  .map((product) => ({
    ...product,
    variants: product.variants
      ? product.variants
          .filter((variant) => variant.is_active !== false)
          .map((variant) => ({...}))
      : [],
  }))
```

---

## Flujo de Operación

### Escenario 1: Eliminar Producto CON Respuestas

```
┌─────────────────────────────────────────┐
│ Usuario omite producto del payload     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Sistema detecta producto faltante       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Verificar: ¿Tiene respuestas?          │
└──────────┬───────────────┬──────────────┘
           │ SÍ            │ NO
           ▼               ▼
┌────────────────────┐  ┌──────────────────┐
│ SOFT DELETE        │  │ HARD DELETE      │
│ is_active = false  │  │ DELETE FROM...   │
│ Mantener en BD     │  │ Eliminar físico  │
└────────────────────┘  └──────────────────┘
           │                     │
           └──────────┬──────────┘
                      ▼
      ┌───────────────────────────────┐
      │ Producto NO aparece en API    │
      │ (filtrado en consultas)       │
      └───────────────────────────────┘
```

### Escenario 2: Eliminar Variante CON Respuestas

```
┌─────────────────────────────────────────┐
│ Usuario omite variante del payload     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Sistema detecta variante faltante       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Verificar: ¿Tiene respuestas?          │
└──────────┬───────────────┬──────────────┘
           │ SÍ            │ NO
           ▼               ▼
┌────────────────────┐  ┌──────────────────┐
│ SOFT DELETE        │  │ HARD DELETE      │
│ is_active = false  │  │ DELETE FROM...   │
│ Mantener en BD     │  │ Eliminar físico  │
└────────────────────┘  └──────────────────┘
           │                     │
           └──────────┬──────────┘
                      ▼
      ┌───────────────────────────────┐
      │ Variante NO aparece en API    │
      │ (filtrada en consultas)       │
      └───────────────────────────────┘
```

---

## Ejemplo de Uso

### Payload Original (Con 2 Productos)
```json
{
  "service_type": "PENDING",
  "products": [
    {
      "productId": "ef527a21-27a5-479a-960b-df5292a988c1",
      "name": "Producto 1",
      ...
    },
    {
      "productId": "abc-123-def-456",
      "name": "Producto 2",  // ← Tiene respuestas del administrador
      ...
    }
  ]
}
```

### Payload Actualizado (Eliminando Producto 2)
```json
{
  "service_type": "PENDING",
  "products": [
    {
      "productId": "ef527a21-27a5-479a-960b-df5292a988c1",
      "name": "Producto 1",
      ...
    }
    // ← Producto 2 omitido del payload
  ]
}
```

### Resultado en Base de Datos

**Tabla ProductsQuotation:**
```sql
| id_product_quotation              | name        | is_active |
|-----------------------------------|-------------|-----------|
| ef527a21-27a5-479a-960b-df5292a988c1 | Producto 1  | true      |
| abc-123-def-456                   | Producto 2  | false     | ← Soft deleted
```

### Resultado en API (GET /quotations/:id)

```json
{
  "quotationId": "...",
  "correlative": "COT-00001-2025",
  "products": [
    {
      "productId": "ef527a21-27a5-479a-960b-df5292a988c1",
      "name": "Producto 1",
      ...
    }
    // ← Producto 2 NO aparece (is_active = false)
  ]
}
```

---

## Ventajas de esta Solución

### 1. **Preservación de Datos** ✅
- Las respuestas del administrador siguen vinculadas a productos originales
- No se pierden datos históricos importantes
- Integridad referencial mantenida

### 2. **Experiencia de Usuario Mejorada** ✅
- Usuario puede "eliminar" productos sin restricciones
- No recibe errores bloqueantes
- Operación exitosa y transparente

### 3. **Auditoría y Trazabilidad** ✅
- Los productos desactivados siguen en la BD
- Se puede rastrear qué productos fueron removidos
- Posibilidad de reactivación futura (si se implementa)

### 4. **Eficiencia en BD** ✅
- Productos SIN respuestas se eliminan físicamente
- No acumula basura innecesaria
- Balance entre preservación y limpieza

### 5. **Retrocompatibilidad** ✅
- No rompe funcionalidad existente
- Las respuestas del administrador siguen funcionando
- El frontend no requiere cambios obligatorios

---

## Limitaciones y Consideraciones

### 1. **Productos Inactivos en Reportes**
Los productos marcados como `is_active = false` aún existen en la BD. Si se generan reportes directamente desde la base de datos, deben filtrar por `is_active = true`.

### 2. **Migración de Datos Existentes**
Los productos existentes en la BD necesitan tener `is_active = true` por defecto. TypeORM debería agregar este campo automáticamente con el valor por defecto.

### 3. **Cálculo de quantityTotal**
El `quantityTotal` ahora debe calcularse **solo** con variantes activas:

```typescript
const totalQuantity =
  product.variants
    ?.filter((v) => v.is_active !== false)
    .reduce((sum, v) => sum + v.quantity, 0) || 0;
```

### 4. **Reactivación de Productos**
Actualmente no hay endpoint para reactivar productos desactivados. Si se requiere en el futuro, se puede implementar:

```typescript
async reactivateProduct(productId: string) {
  await this.productsRepository.update(
    { id_product_quotation: productId },
    { is_active: true }
  );
}
```

---

## Migración de Base de Datos

### Script SQL para Agregar Campos

```sql
-- Agregar campo is_active a ProductsQuotation
ALTER TABLE "ProductsQuotation"
ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;

-- Agregar campo is_active a ProductVariant
ALTER TABLE "ProductVariant"
ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;

-- Establecer todos los registros existentes como activos
UPDATE "ProductsQuotation" SET "is_active" = true WHERE "is_active" IS NULL;
UPDATE "ProductVariant" SET "is_active" = true WHERE "is_active" IS NULL;
```

### Verificación Post-Migración

```sql
-- Verificar que todos los productos tienen is_active
SELECT COUNT(*) FROM "ProductsQuotation" WHERE "is_active" IS NULL;
-- Debe retornar: 0

-- Verificar que todas las variantes tienen is_active
SELECT COUNT(*) FROM "ProductVariant" WHERE "is_active" IS NULL;
-- Debe retornar: 0
```

---

## Testing

### Casos de Prueba

#### ✅ Test 1: Eliminar Producto CON Respuestas
```
Dado: Un producto con respuestas del administrador
Cuando: El usuario omite el producto del payload
Entonces:
  - El producto se marca como is_active = false
  - Todas sus variantes se marcan como is_active = false
  - El producto NO aparece en las consultas GET
  - La operación se completa sin errores
```

#### ✅ Test 2: Eliminar Producto SIN Respuestas
```
Dado: Un producto sin respuestas del administrador
Cuando: El usuario omite el producto del payload
Entonces:
  - El producto se elimina físicamente de la BD
  - Sus variantes se eliminan físicamente
  - El producto NO aparece en las consultas GET
  - La operación se completa sin errores
```

#### ✅ Test 3: Eliminar Variante CON Respuestas
```
Dado: Una variante con respuestas del administrador
Cuando: El usuario omite la variante del payload
Entonces:
  - La variante se marca como is_active = false
  - La variante NO aparece en las consultas GET
  - El producto padre sigue activo
  - La operación se completa sin errores
```

#### ✅ Test 4: Eliminar Variante SIN Respuestas
```
Dado: Una variante sin respuestas del administrador
Cuando: El usuario omite la variante del payload
Entonces:
  - La variante se elimina físicamente de la BD
  - La variante NO aparece en las consultas GET
  - El producto padre sigue activo
  - La operación se completa sin errores
```

#### ✅ Test 5: Filtrado en Consultas
```
Dado: Productos activos e inactivos en la BD
Cuando: Se consulta GET /quotations/:id
Entonces:
  - Solo productos con is_active = true aparecen
  - Solo variantes con is_active = true aparecen
  - El count de productos refleja solo los activos
```

---

## Guía de Implementación para el Frontend (Vite + TypeScript)

### 📦 Contexto General

El backend ahora permite **eliminar productos y variantes** que tienen respuestas del administrador mediante **soft delete**. Para el frontend, esto significa:

1. ✅ **No más errores al eliminar productos**: El error `"No se puede eliminar el producto..."` ya no ocurrirá
2. ✅ **Comportamiento transparente**: Omitir productos del payload los "elimina" exitosamente
3. ✅ **Filtrado automático**: Los productos eliminados no aparecen en las consultas GET

---

### 🔧 Cambios Requeridos en el Frontend

#### ✅ NO SE REQUIEREN CAMBIOS OBLIGATORIOS

Esta implementación es **retrocompatible**. El código actual del frontend seguirá funcionando sin modificaciones.

#### 📝 Cambios Opcionales Recomendados

Para mejorar la experiencia de usuario, se recomienda implementar las siguientes mejoras:

---

### 1. Actualizar Interfaces TypeScript

**Archivo**: `src/types/quotation.types.ts`

```typescript
// types/quotation.types.ts

export interface ProductVariant {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
}

export interface Product {
  productId: string;
  name: string;
  url: string;
  comment?: string;
  quantityTotal: number;
  weight: number;
  volume: number;
  number_of_boxes: number;
  variants: ProductVariant[];
  attachments?: string[];
}

export interface Quotation {
  quotationId: string;
  correlative: string;
  status: string;
  service_type: string;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}
```

**✅ Sin cambios necesarios**: Las interfaces actuales funcionan correctamente.

---

### 2. Servicio de API - Eliminar Productos

**Archivo**: `src/services/quotation.service.ts`

#### Antes (Manejo de Error)

```typescript
async updateQuotation(
  quotationId: string,
  payload: UpdateQuotationPayload
): Promise<Quotation> {
  try {
    const response = await fetch(`${API_URL}/quotations/${quotationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();

      // ❌ Antes: Manejar error de restricción
      if (errorData.message.includes('No se puede eliminar')) {
        throw new Error('No puedes eliminar este producto porque tiene respuestas del administrador');
      }

      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
}
```

#### Después (Sin Manejo Especial)

```typescript
async updateQuotation(
  quotationId: string,
  payload: UpdateQuotationPayload
): Promise<Quotation> {
  try {
    const response = await fetch(`${API_URL}/quotations/${quotationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar cotización');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
}

// ✅ Ahora: No hay errores de restricción, la eliminación siempre funciona
```

**Acción requerida**:
- ✅ Eliminar código de manejo especial para errores de restricción
- ✅ Simplificar la lógica de actualización

---

### 3. Componente de Edición - Eliminar Productos

**Archivo**: `src/components/QuotationEditForm.tsx` (React) o `src/components/QuotationEditForm.vue` (Vue)

#### Ejemplo con React + Vite + TypeScript

```typescript
// src/components/QuotationEditForm.tsx

import { useState, useEffect } from 'react';
import { Product, Quotation } from '../types/quotation.types';
import { quotationService } from '../services/quotation.service';
import { useToast } from '../hooks/useToast';

interface QuotationEditFormProps {
  quotationId: string;
  onSuccess: () => void;
}

export function QuotationEditForm({ quotationId, onSuccess }: QuotationEditFormProps) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadQuotation();
  }, [quotationId]);

  async function loadQuotation() {
    try {
      setLoading(true);
      const data = await quotationService.getQuotationById(quotationId);
      setQuotation(data);
      setProducts(data.products);
    } catch (error) {
      showToast('error', 'Error al cargar la cotización');
    } finally {
      setLoading(false);
    }
  }

  // ✅ ELIMINAR PRODUCTO: Simplemente removerlo del estado
  function handleRemoveProduct(productIndex: number) {
    const updatedProducts = products.filter((_, index) => index !== productIndex);
    setProducts(updatedProducts);
  }

  // ✅ ELIMINAR VARIANTE: Simplemente removerla del estado
  function handleRemoveVariant(productIndex: number, variantIndex: number) {
    const updatedProducts = [...products];
    updatedProducts[productIndex].variants = updatedProducts[productIndex].variants.filter(
      (_, index) => index !== variantIndex
    );
    setProducts(updatedProducts);
  }

  // ✅ GUARDAR CAMBIOS: Enviar solo los productos que quedan
  async function handleSave() {
    try {
      setLoading(true);

      await quotationService.updateQuotation(quotationId, {
        service_type: quotation?.service_type,
        products: products, // ← Productos sin los eliminados
      });

      showToast('success', 'Cotización actualizada exitosamente');
      onSuccess();
    } catch (error: any) {
      // ✅ Ya no hay errores de restricción
      showToast('error', error.message || 'Error al actualizar la cotización');
    } finally {
      setLoading(false);
    }
  }

  if (loading && !quotation) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="quotation-edit-form">
      <h2>Editar Cotización {quotation?.correlative}</h2>

      {products.map((product, pIndex) => (
        <div key={product.productId} className="product-card">
          <h3>{product.name}</h3>

          {/* Variantes */}
          {product.variants.map((variant, vIndex) => (
            <div key={variant.variantId} className="variant-row">
              <span>{variant.size} - {variant.color}</span>
              <button
                onClick={() => handleRemoveVariant(pIndex, vIndex)}
                className="btn-danger"
              >
                Eliminar Variante
              </button>
            </div>
          ))}

          {/* ✅ Botón para eliminar producto - Ahora siempre funciona */}
          <button
            onClick={() => handleRemoveProduct(pIndex)}
            className="btn-danger"
          >
            Eliminar Producto
          </button>
        </div>
      ))}

      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}
```

**Cambios clave**:
1. ✅ `handleRemoveProduct()` ahora funciona sin validaciones especiales
2. ✅ `handleRemoveVariant()` ahora funciona sin validaciones especiales
3. ✅ No hay mensajes de error de restricción
4. ✅ La operación siempre es exitosa

---

### 4. Mejora Opcional: Indicador Visual (UX Mejorada)

Opcionalmente, puedes agregar un indicador visual para informar al usuario sobre qué pasará con el producto:

```typescript
// src/components/ProductCard.tsx

interface ProductCardProps {
  product: Product;
  onRemove: () => void;
}

export function ProductCard({ product, onRemove }: ProductCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  function handleRemoveClick() {
    setShowConfirmation(true);
  }

  function confirmRemove() {
    onRemove();
    setShowConfirmation(false);
  }

  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      {/* Información del producto */}
      <div className="product-details">
        {/* ... campos del producto ... */}
      </div>

      {/* Botón de eliminar */}
      <button onClick={handleRemoveClick} className="btn-danger">
        Eliminar Producto
      </button>

      {/* Modal de confirmación (opcional) */}
      {showConfirmation && (
        <div className="modal">
          <div className="modal-content">
            <h4>¿Eliminar producto?</h4>
            <p>
              Este producto será removido de la cotización.
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmation(false)}>
                Cancelar
              </button>
              <button onClick={confirmRemove} className="btn-danger">
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Ventajas**:
- ✅ Confirma la intención del usuario
- ✅ Proporciona feedback claro
- ✅ Evita eliminaciones accidentales

---

### 5. Hook Personalizado para Gestión de Productos (Recomendado)

**Archivo**: `src/hooks/useQuotationProducts.ts`

```typescript
// src/hooks/useQuotationProducts.ts

import { useState } from 'react';
import { Product, ProductVariant } from '../types/quotation.types';

export function useQuotationProducts(initialProducts: Product[] = []) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Actualizar producto existente
  function updateProduct(productIndex: number, updates: Partial<Product>) {
    setProducts((prev) =>
      prev.map((product, index) =>
        index === productIndex ? { ...product, ...updates } : product
      )
    );
  }

  // Agregar nuevo producto
  function addProduct(newProduct: Omit<Product, 'productId'>) {
    const product: Product = {
      ...newProduct,
      productId: `temp-${Date.now()}`, // ID temporal para UI
    };
    setProducts((prev) => [...prev, product]);
  }

  // ✅ Eliminar producto (sin validaciones)
  function removeProduct(productIndex: number) {
    setProducts((prev) => prev.filter((_, index) => index !== productIndex));
  }

  // Actualizar variante existente
  function updateVariant(
    productIndex: number,
    variantIndex: number,
    updates: Partial<ProductVariant>
  ) {
    setProducts((prev) =>
      prev.map((product, pIndex) => {
        if (pIndex !== productIndex) return product;

        return {
          ...product,
          variants: product.variants.map((variant, vIndex) =>
            vIndex === variantIndex ? { ...variant, ...updates } : variant
          ),
        };
      })
    );
  }

  // Agregar nueva variante
  function addVariant(productIndex: number, newVariant: Omit<ProductVariant, 'variantId'>) {
    setProducts((prev) =>
      prev.map((product, pIndex) => {
        if (pIndex !== productIndex) return product;

        const variant: ProductVariant = {
          ...newVariant,
          variantId: `temp-${Date.now()}`, // ID temporal para UI
        };

        return {
          ...product,
          variants: [...product.variants, variant],
        };
      })
    );
  }

  // ✅ Eliminar variante (sin validaciones)
  function removeVariant(productIndex: number, variantIndex: number) {
    setProducts((prev) =>
      prev.map((product, pIndex) => {
        if (pIndex !== productIndex) return product;

        return {
          ...product,
          variants: product.variants.filter((_, vIndex) => vIndex !== variantIndex),
        };
      })
    );
  }

  // Limpiar IDs temporales antes de enviar al backend
  function getCleanProducts(): Product[] {
    return products.map((product) => {
      const cleanProduct: any = { ...product };

      // Eliminar productId temporal
      if (cleanProduct.productId?.startsWith('temp-')) {
        delete cleanProduct.productId;
      }

      // Limpiar variantIds temporales
      cleanProduct.variants = product.variants.map((variant) => {
        const cleanVariant: any = { ...variant };
        if (cleanVariant.variantId?.startsWith('temp-')) {
          delete cleanVariant.variantId;
        }
        return cleanVariant;
      });

      return cleanProduct;
    });
  }

  return {
    products,
    setProducts,
    updateProduct,
    addProduct,
    removeProduct,
    updateVariant,
    addVariant,
    removeVariant,
    getCleanProducts,
  };
}
```

**Uso en el componente**:

```typescript
// src/components/QuotationEditForm.tsx

import { useQuotationProducts } from '../hooks/useQuotationProducts';

export function QuotationEditForm({ quotationId, onSuccess }: QuotationEditFormProps) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const {
    products,
    setProducts,
    removeProduct,
    removeVariant,
    getCleanProducts,
  } = useQuotationProducts();

  async function loadQuotation() {
    const data = await quotationService.getQuotationById(quotationId);
    setQuotation(data);
    setProducts(data.products); // ← Inicializar productos
  }

  async function handleSave() {
    const cleanProducts = getCleanProducts(); // ← Limpiar IDs temporales

    await quotationService.updateQuotation(quotationId, {
      service_type: quotation?.service_type,
      products: cleanProducts,
    });

    onSuccess();
  }

  return (
    <div className="quotation-edit-form">
      {products.map((product, pIndex) => (
        <div key={product.productId}>
          {/* ✅ Eliminar producto - Ahora sin validaciones */}
          <button onClick={() => removeProduct(pIndex)}>
            Eliminar
          </button>

          {product.variants.map((variant, vIndex) => (
            <div key={variant.variantId}>
              {/* ✅ Eliminar variante - Ahora sin validaciones */}
              <button onClick={() => removeVariant(pIndex, vIndex)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

### 6. Testing en el Frontend

#### Test de Eliminación de Productos

```typescript
// src/components/QuotationEditForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuotationEditForm } from './QuotationEditForm';
import { quotationService } from '../services/quotation.service';

jest.mock('../services/quotation.service');

describe('QuotationEditForm - Eliminar Productos', () => {
  const mockQuotation = {
    quotationId: 'uuid-1',
    correlative: 'COT-00001-2025',
    products: [
      {
        productId: 'product-1',
        name: 'Producto 1',
        variants: [
          { variantId: 'variant-1', size: 'M', quantity: 10 },
        ],
      },
      {
        productId: 'product-2',
        name: 'Producto 2',
        variants: [
          { variantId: 'variant-2', size: 'L', quantity: 5 },
        ],
      },
    ],
  };

  beforeEach(() => {
    (quotationService.getQuotationById as jest.Mock).mockResolvedValue(mockQuotation);
    (quotationService.updateQuotation as jest.Mock).mockResolvedValue({});
  });

  test('✅ Debería eliminar un producto sin errores', async () => {
    render(<QuotationEditForm quotationId="uuid-1" onSuccess={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
    });

    // Eliminar Producto 2
    const deleteButtons = screen.getAllByText('Eliminar Producto');
    fireEvent.click(deleteButtons[1]);

    // Guardar cambios
    const saveButton = screen.getByText('Guardar Cambios');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(quotationService.updateQuotation).toHaveBeenCalledWith(
        'uuid-1',
        expect.objectContaining({
          products: expect.arrayContaining([
            expect.objectContaining({ productId: 'product-1' }),
          ]),
        })
      );

      // ✅ Verificar que Producto 2 NO está en el payload
      expect(quotationService.updateQuotation).toHaveBeenCalledWith(
        'uuid-1',
        expect.objectContaining({
          products: expect.not.arrayContaining([
            expect.objectContaining({ productId: 'product-2' }),
          ]),
        })
      );
    });
  });

  test('✅ Debería eliminar una variante sin errores', async () => {
    render(<QuotationEditForm quotationId="uuid-1" onSuccess={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    // Eliminar variante
    const deleteVariantButtons = screen.getAllByText('Eliminar Variante');
    fireEvent.click(deleteVariantButtons[0]);

    // Guardar cambios
    const saveButton = screen.getByText('Guardar Cambios');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(quotationService.updateQuotation).toHaveBeenCalled();
    });
  });
});
```

---

### 7. Ejemplos de Flujos Completos

#### Flujo 1: Eliminar Producto Completo

```typescript
// Estado inicial
const initialProducts = [
  { productId: 'product-1', name: 'Camiseta', variants: [...] },
  { productId: 'product-2', name: 'Pantalón', variants: [...] },
  { productId: 'product-3', name: 'Zapatos', variants: [...] },
];

// Usuario elimina "Pantalón"
const updatedProducts = initialProducts.filter(
  (p) => p.productId !== 'product-2'
);

// Payload enviado al backend
const payload = {
  service_type: 'PENDING',
  products: updatedProducts, // ← Solo product-1 y product-3
};

// ✅ Backend responde exitosamente (sin errores)
// ✅ Producto 2 se marca como is_active = false en BD
// ✅ Producto 2 NO aparece en futuras consultas GET
```

#### Flujo 2: Eliminar Variante Específica

```typescript
// Estado inicial
const product = {
  productId: 'product-1',
  name: 'Camiseta',
  variants: [
    { variantId: 'variant-1', size: 'S', quantity: 10 },
    { variantId: 'variant-2', size: 'M', quantity: 15 },
    { variantId: 'variant-3', size: 'L', quantity: 20 },
  ],
};

// Usuario elimina talla "M"
const updatedProduct = {
  ...product,
  variants: product.variants.filter((v) => v.variantId !== 'variant-2'),
};

// Payload enviado al backend
const payload = {
  service_type: 'PENDING',
  products: [updatedProduct], // ← Solo variantes S y L
};

// ✅ Backend responde exitosamente (sin errores)
// ✅ Variante "M" se marca como is_active = false en BD
// ✅ Variante "M" NO aparece en futuras consultas GET
```

---

### 8. Checklist de Implementación para Frontend

#### ✅ Cambios Obligatorios
- [ ] **Ninguno** - El código actual seguirá funcionando

#### 📝 Cambios Opcionales Recomendados
- [ ] Eliminar código de manejo especial para errores de restricción
- [ ] Simplificar lógica de eliminación de productos/variantes
- [ ] Actualizar tests para reflejar el nuevo comportamiento
- [ ] Agregar confirmación visual al eliminar (modal/toast)
- [ ] Implementar hook `useQuotationProducts` para mejor gestión de estado

#### 🧪 Testing Recomendado
- [ ] Probar eliminación de producto sin respuestas
- [ ] Probar eliminación de producto con respuestas
- [ ] Probar eliminación de variante sin respuestas
- [ ] Probar eliminación de variante con respuestas
- [ ] Verificar que GET no devuelve productos eliminados
- [ ] Verificar que el payload se construye correctamente

---

### 9. Comunicación con el Equipo

#### Mensaje para el Equipo de Frontend

```markdown
## 📢 Actualización: Eliminación de Productos en Cotizaciones

### ¿Qué cambió?

El backend ahora permite **eliminar productos y variantes** que tienen respuestas del administrador, sin generar errores.

### ¿Afecta al frontend?

**NO** - El código actual seguirá funcionando sin cambios. Sin embargo, recomendamos:

1. Eliminar validaciones especiales para errores de restricción
2. Simplificar la lógica de eliminación
3. Mejorar la UX con confirmaciones visuales

### ¿Qué debo hacer?

1. Revisar este documento: [SOLUCION_SOFT_DELETE_PRODUCTOS.md](./SOLUCION_SOFT_DELETE_PRODUCTOS.md)
2. Revisar la sección "Guía de Implementación para el Frontend"
3. Implementar cambios opcionales si es necesario
4. Probar los flujos de eliminación

### ¿Dónde encuentro más información?

- Documento completo: `SOLUCION_SOFT_DELETE_PRODUCTOS.md`
- Sección específica: "Guía de Implementación para el Frontend (Vite + TypeScript)"
- Ejemplos de código incluidos

### Soporte

Si tienes dudas, contacta al equipo de backend.
```

---

## Resumen de Cambios para el Frontend

### ✅ Lo que FUNCIONA AHORA

1. **Eliminar productos con respuestas**: Ya no genera error
2. **Eliminar variantes con respuestas**: Ya no genera error
3. **Operación transparente**: El usuario no nota diferencia
4. **Filtrado automático**: Productos eliminados no aparecen en GET

### 📝 Lo que PUEDES MEJORAR (Opcional)

1. **Eliminar código de manejo de errores**: Ya no es necesario
2. **Simplificar lógica**: Menos validaciones, más directo
3. **Mejorar UX**: Agregar confirmaciones y feedback visual
4. **Refactorizar estado**: Usar hook personalizado para gestión

### 🚀 Beneficios para el Usuario Final

1. **Sin errores bloqueantes**: Puede eliminar cualquier producto
2. **Experiencia fluida**: Operación siempre exitosa
3. **Interfaz más simple**: Menos mensajes de error

---

## Archivos Modificados

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| [products-quotation.entity.ts](src/entities/products-quotation.entity.ts) | 94-99 | Agregado campo `is_active` |
| [product-variant.entity.ts](src/entities/product-variant.entity.ts) | 65-70 | Agregado campo `is_active` |
| [quotations.service.ts](src/quotations/quotations.service.ts) | 605-640 | Soft delete para productos con respuestas |
| [quotations.service.ts](src/quotations/quotations.service.ts) | 675-701 | Soft delete para variantes con respuestas |
| [quotations.service.ts](src/quotations/quotations.service.ts) | 270-294 | Filtrado en `findAllByUser()` |
| [quotations.service.ts](src/quotations/quotations.service.ts) | 388-414 | Filtrado en `findAllPaginated()` |
| [quotations.service.ts](src/quotations/quotations.service.ts) | 463-487 | Filtrado en `findOne()` |

---

## Referencias

- **Issue original**: Error al intentar eliminar producto con respuestas
- **Solución anterior**: [SOLUCION_ERROR_EDITAR_COTIZACION.md](SOLUCION_ERROR_EDITAR_COTIZACION.md)
- **Correcciones previas**:
  - [CORRECCION_BUG_NUEVA_VARIANTE.md](CORRECCION_BUG_NUEVA_VARIANTE.md)
  - [CORRECCION_BUG_CREAR_PRODUCTO.md](CORRECCION_BUG_CREAR_PRODUCTO.md)

---

## Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-10-12 | 1.0.0 | Implementación inicial de soft delete híbrido |

---

**Última actualización**: 12 de octubre de 2025
**Autor**: Equipo Backend ABK Imports
**Estado**: ✅ Implementado y verificado
**Prioridad**: ALTA (Mejora experiencia de usuario crítica)
