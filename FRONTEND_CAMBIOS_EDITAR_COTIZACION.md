# Guía de Implementación: Edición de Cotizaciones - Frontend

## Contexto del Cambio

Se ha modificado la lógica del backend para permitir la edición de cotizaciones **incluso después de que el administrador haya respondido**. Anteriormente, el sistema eliminaba y recreaba todos los productos/variantes, lo que causaba errores de llave foránea. Ahora se implementa una estrategia de **actualización selectiva** que mantiene la integridad referencial.

---

## Cambios en la API

### Endpoint Afectado
```
PATCH /quotations/:id
```

### Cambios en el Request Body

#### ❌ Formato Anterior (Deprecated)
```typescript
interface ProductoAntiguo {
  name: string;
  url: string;
  comment?: string;
  weight: number;
  volume: number;
  number_of_boxes: number;
  variants: VarianteAntigua[];
  attachments?: string[];
}

interface VarianteAntigua {
  id?: string | null; // ❌ Campo deprecado
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
}
```

#### ✅ Formato Nuevo (Requerido)
```typescript
interface ProductoNuevo {
  productId?: string; // ✅ Opcional: si existe, se actualiza; si no, se crea
  name: string;
  url: string;
  comment?: string;
  weight: number;
  volume: number;
  number_of_boxes: number;
  variants: VarianteNueva[];
  attachments?: string[];
}

interface VarianteNueva {
  variantId?: string; // ✅ Opcional: si existe, se actualiza; si no, se crea
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
}
```

---

## Cambios en las Respuestas de la API

### GET /quotations/:id - Respuesta Actualizada

La API ahora **siempre devuelve** los campos `productId` y `variantId`:

```typescript
interface RespuestaCotizacion {
  quotationId: string;
  correlative: string;
  status: string;
  service_type: string;
  products: Producto[];
  createdAt: string;
  updatedAt: string;
}

interface Producto {
  productId: string; // ✅ Siempre presente
  name: string;
  url: string;
  comment?: string;
  quantityTotal: number;
  weight: number;
  volume: number;
  number_of_boxes: number;
  variants: Variante[];
  attachments?: string[];
}

interface Variante {
  variantId: string; // ✅ Siempre presente
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
}
```

---

## Implementación en el Frontend

### 1. Actualizar Interfaces/Types

**Archivo**: `types/quotation.types.ts` (o equivalente)

```typescript
// types/quotation.types.ts

export interface ProductVariant {
  variantId?: string; // Opcional para creación, requerido para edición
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
}

export interface Product {
  productId?: string; // Opcional para creación, requerido para edición
  name: string;
  url: string;
  comment?: string;
  weight: number;
  volume: number;
  number_of_boxes: number;
  variants: ProductVariant[];
  attachments?: string[];
}

export interface UpdateQuotationPayload {
  service_type?: string;
  products?: Product[];
}

export interface QuotationResponse {
  quotationId: string;
  correlative: string;
  status: string;
  service_type: string;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}
```

---

### 2. Servicio de Cotizaciones

**Archivo**: `services/quotation.service.ts` (o equivalente)

```typescript
// services/quotation.service.ts

import { Product, QuotationResponse, UpdateQuotationPayload } from '../types/quotation.types';

export class QuotationService {
  private readonly baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  /**
   * Obtener una cotización por ID
   */
  async getQuotationById(quotationId: string, token: string): Promise<QuotationResponse> {
    const response = await fetch(`${this.baseUrl}/quotations/${quotationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener cotización: ${response.statusText}`);
    }

    const data = await response.json();

    // ✅ La respuesta ya incluye productId y variantId
    return data;
  }

  /**
   * Actualizar una cotización existente
   */
  async updateQuotation(
    quotationId: string,
    payload: UpdateQuotationPayload,
    token: string
  ): Promise<QuotationResponse> {
    const response = await fetch(`${this.baseUrl}/quotations/${quotationId}`, {
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
  }
}
```

---

### 3. Componente de Edición de Cotización

**Archivo**: `components/QuotationEditForm.tsx` (React/Next.js) o equivalente

```typescript
// components/QuotationEditForm.tsx

import { useState, useEffect } from 'react';
import { Product, ProductVariant, QuotationResponse } from '../types/quotation.types';
import { QuotationService } from '../services/quotation.service';

interface QuotationEditFormProps {
  quotationId: string;
  token: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function QuotationEditForm({
  quotationId,
  token,
  onSuccess,
  onError
}: QuotationEditFormProps) {
  const [quotation, setQuotation] = useState<QuotationResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const quotationService = new QuotationService();

  useEffect(() => {
    loadQuotation();
  }, [quotationId]);

  async function loadQuotation() {
    try {
      const data = await quotationService.getQuotationById(quotationId, token);
      setQuotation(data);

      // ✅ Los IDs ya vienen en la respuesta, simplemente los usamos
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      onError('Error al cargar la cotización');
      setLoading(false);
    }
  }

  // ✅ ACTUALIZAR producto existente
  function handleUpdateProduct(index: number, field: keyof Product, value: any) {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };
    setProducts(updatedProducts);
  }

  // ✅ AGREGAR nuevo producto
  function handleAddProduct() {
    const newProduct: Product = {
      // ❌ NO incluir productId = se creará uno nuevo
      name: '',
      url: '',
      weight: 0,
      volume: 0,
      number_of_boxes: 0,
      variants: [],
      attachments: [],
    };
    setProducts([...products, newProduct]);
  }

  // ✅ ELIMINAR producto
  function handleRemoveProduct(index: number) {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  }

  // ✅ ACTUALIZAR variante existente
  function handleUpdateVariant(
    productIndex: number,
    variantIndex: number,
    field: keyof ProductVariant,
    value: any
  ) {
    const updatedProducts = [...products];
    const updatedVariants = [...updatedProducts[productIndex].variants];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      [field]: value,
    };
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      variants: updatedVariants,
    };
    setProducts(updatedProducts);
  }

  // ✅ AGREGAR nueva variante
  function handleAddVariant(productIndex: number) {
    const updatedProducts = [...products];
    const newVariant: ProductVariant = {
      // ❌ NO incluir variantId = se creará una nueva
      size: '',
      presentation: '',
      model: '',
      color: '',
      quantity: 0,
    };
    updatedProducts[productIndex].variants.push(newVariant);
    setProducts(updatedProducts);
  }

  // ✅ ELIMINAR variante
  function handleRemoveVariant(productIndex: number, variantIndex: number) {
    const updatedProducts = [...products];
    updatedProducts[productIndex].variants = updatedProducts[productIndex].variants.filter(
      (_, i) => i !== variantIndex
    );
    setProducts(updatedProducts);
  }

  // ✅ GUARDAR cambios
  async function handleSave() {
    try {
      setLoading(true);

      await quotationService.updateQuotation(
        quotationId,
        { products }, // ✅ Enviar solo los productos modificados con sus IDs
        token
      );

      onSuccess();
    } catch (error: any) {
      // ⚠️ Manejar errores específicos de validación
      if (error.message.includes('No se puede eliminar')) {
        onError(error.message);
      } else {
        onError('Error al actualizar la cotización');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="quotation-edit-form">
      <h2>Editar Cotización {quotation?.correlative}</h2>

      {/* Renderizar productos y variantes aquí */}
      {products.map((product, pIndex) => (
        <div key={product.productId || `new-${pIndex}`} className="product-card">
          <h3>Producto {pIndex + 1}</h3>

          {/* Campos del producto */}
          <input
            type="text"
            value={product.name}
            onChange={(e) => handleUpdateProduct(pIndex, 'name', e.target.value)}
            placeholder="Nombre del producto"
          />

          {/* Variantes */}
          {product.variants.map((variant, vIndex) => (
            <div key={variant.variantId || `new-variant-${vIndex}`} className="variant-row">
              <input
                type="text"
                value={variant.size}
                onChange={(e) => handleUpdateVariant(pIndex, vIndex, 'size', e.target.value)}
                placeholder="Talla"
              />
              <button onClick={() => handleRemoveVariant(pIndex, vIndex)}>
                Eliminar Variante
              </button>
            </div>
          ))}

          <button onClick={() => handleAddVariant(pIndex)}>
            Agregar Variante
          </button>

          <button onClick={() => handleRemoveProduct(pIndex)}>
            Eliminar Producto
          </button>
        </div>
      ))}

      <button onClick={handleAddProduct}>Agregar Producto</button>

      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}
```

---

## Casos de Uso y Comportamiento

### ✅ Caso 1: Editar Producto Existente

```typescript
// Al cargar la cotización, ya tienes el productId
const productoCargado = {
  productId: "123e4567-e89b-12d3-a456-426614174000", // ✅ Presente
  name: "Camiseta",
  // ... otros campos
};

// Al editar, MANTENER el productId
const productoEditado = {
  productId: "123e4567-e89b-12d3-a456-426614174000", // ✅ Mantener
  name: "Camiseta Actualizada", // ✅ Cambiar solo los datos
  // ... otros campos
};
```

**Payload enviado al backend:**
```json
{
  "products": [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Camiseta Actualizada",
      "url": "https://example.com",
      "weight": 0.5,
      "volume": 0.001,
      "number_of_boxes": 1,
      "variants": [...]
    }
  ]
}
```

**Resultado**: El producto se actualiza sin cambiar su ID.

---

### ✅ Caso 2: Agregar Nuevo Producto

```typescript
// Al agregar un nuevo producto, NO incluir productId
const nuevoProducto: Product = {
  // ❌ NO incluir productId
  name: "Producto Nuevo",
  url: "https://example.com",
  weight: 1.0,
  volume: 0.002,
  number_of_boxes: 2,
  variants: [
    {
      // ❌ NO incluir variantId
      size: "M",
      presentation: "Básica",
      model: "Modelo 1",
      color: "Azul",
      quantity: 10,
    }
  ],
};
```

**Payload enviado al backend:**
```json
{
  "products": [
    {
      "name": "Producto Nuevo",
      "url": "https://example.com",
      "weight": 1.0,
      "volume": 0.002,
      "number_of_boxes": 2,
      "variants": [
        {
          "size": "M",
          "presentation": "Básica",
          "model": "Modelo 1",
          "color": "Azul",
          "quantity": 10
        }
      ]
    }
  ]
}
```

**Resultado**: Se crea un nuevo producto con ID autogenerado.

---

### ✅ Caso 3: Eliminar Producto (SIN Respuestas)

```typescript
// Simplemente omitir el producto del array
const productosOriginales = [producto1, producto2, producto3];
const productosActualizados = [producto1, producto3]; // producto2 eliminado
```

**Payload enviado al backend:**
```json
{
  "products": [
    {
      "productId": "uuid-producto-1",
      "name": "Producto 1",
      ...
    },
    {
      "productId": "uuid-producto-3",
      "name": "Producto 3",
      ...
    }
  ]
}
```

**Resultado**: El producto 2 se elimina de la base de datos.

---

### ❌ Caso 4: Intentar Eliminar Producto (CON Respuestas)

Si intentas eliminar un producto que tiene respuestas del administrador, recibirás un error:

**Respuesta del backend:**
```json
{
  "statusCode": 400,
  "message": "No se puede eliminar el producto \"Camiseta\" porque tiene respuestas del administrador asociadas. Solo puedes editar sus datos.",
  "error": "Bad Request"
}
```

**Manejo en el frontend:**
```typescript
try {
  await quotationService.updateQuotation(quotationId, { products }, token);
} catch (error: any) {
  if (error.message.includes('No se puede eliminar')) {
    // Mostrar alerta al usuario
    alert(error.message);
    // O usar un toast/notification
    showNotification('error', error.message);
  }
}
```

---

### ✅ Caso 5: Editar Variante Existente

```typescript
// Al cargar, ya tienes el variantId
const varianteCargada = {
  variantId: "abc-123", // ✅ Presente
  size: "M",
  color: "Azul",
  quantity: 10,
};

// Al editar, MANTENER el variantId
const varianteEditada = {
  variantId: "abc-123", // ✅ Mantener
  size: "L", // ✅ Cambiar solo los datos
  color: "Rojo",
  quantity: 20,
};
```

---

### ✅ Caso 6: Agregar Nueva Variante a Producto Existente

```typescript
const productoExistente = {
  productId: "uuid-producto", // ✅ Mantener el ID del producto
  name: "Camiseta",
  variants: [
    {
      variantId: "uuid-variante-1", // ✅ Variante existente
      size: "M",
      quantity: 10,
    },
    {
      // ❌ Nueva variante, sin variantId
      size: "XL",
      quantity: 5,
    }
  ],
};
```

---

## Manejo de Errores

### Errores Esperados

| Código | Mensaje | Causa | Solución |
|--------|---------|-------|----------|
| `400` | "No se puede eliminar el producto..." | Intentar eliminar producto con respuestas | Informar al usuario que solo puede editar |
| `400` | "No se puede eliminar la variante..." | Intentar eliminar variante con respuestas | Informar al usuario que solo puede editar |
| `404` | "Quotation with ID ... not found" | ID de cotización inválido | Verificar que el ID es correcto |
| `401` | "Unauthorized" | Token inválido o expirado | Redirigir a login |

### Ejemplo de Manejo de Errores

```typescript
// utils/error-handler.ts

export function handleQuotationUpdateError(error: any): string {
  if (error.response?.status === 400) {
    const message = error.response.data.message;

    if (message.includes('No se puede eliminar el producto')) {
      return message;
    }

    if (message.includes('No se puede eliminar la variante')) {
      return message;
    }
  }

  if (error.response?.status === 404) {
    return 'La cotización no fue encontrada';
  }

  if (error.response?.status === 401) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente';
  }

  return 'Error al actualizar la cotización. Por favor, intenta nuevamente';
}
```

---

## Ejemplos de Payloads Completos

### Ejemplo 1: Actualizar Producto Existente y Agregar Uno Nuevo

```json
{
  "products": [
    {
      "productId": "existing-product-uuid-1",
      "name": "Camiseta Actualizada",
      "url": "https://example.com/shirt",
      "comment": "Material premium",
      "weight": 0.3,
      "volume": 0.001,
      "number_of_boxes": 1,
      "variants": [
        {
          "variantId": "existing-variant-uuid-1",
          "size": "M",
          "presentation": "Básica",
          "model": "Classic",
          "color": "Azul",
          "quantity": 50
        },
        {
          "size": "XL",
          "presentation": "Premium",
          "model": "Classic",
          "color": "Negro",
          "quantity": 30
        }
      ],
      "attachments": ["https://cloudinary.com/image1.jpg"]
    },
    {
      "name": "Pantalón Nuevo",
      "url": "https://example.com/pants",
      "weight": 0.5,
      "volume": 0.002,
      "number_of_boxes": 1,
      "variants": [
        {
          "size": "32",
          "presentation": "Slim Fit",
          "model": "Jeans",
          "color": "Azul Oscuro",
          "quantity": 20
        }
      ],
      "attachments": []
    }
  ]
}
```

### Ejemplo 2: Eliminar Variante y Actualizar Otras

```json
{
  "products": [
    {
      "productId": "existing-product-uuid-1",
      "name": "Camiseta",
      "url": "https://example.com/shirt",
      "weight": 0.3,
      "volume": 0.001,
      "number_of_boxes": 1,
      "variants": [
        {
          "variantId": "existing-variant-uuid-1",
          "size": "M",
          "presentation": "Básica",
          "model": "Classic",
          "color": "Azul",
          "quantity": 50
        }
      ],
      "attachments": []
    }
  ]
}
```

En este caso, si había una variante con ID `existing-variant-uuid-2` y no se incluye en el payload, se intentará eliminar (solo si no tiene respuestas).

---

## Checklist de Implementación

### Backend (Ya Implementado) ✅
- [x] DTOs actualizados con `productId` y `variantId`
- [x] Método `update()` con lógica de actualización selectiva
- [x] Validaciones para prevenir eliminación de elementos con respuestas
- [x] Mensajes de error descriptivos en español
- [x] Respuestas de API incluyen siempre `productId` y `variantId`

### Frontend (Por Implementar) 📋
- [ ] Actualizar interfaces/types con `productId` y `variantId` opcionales
- [ ] Modificar servicio de API para usar nuevos campos
- [ ] Actualizar componente de edición para:
  - [ ] Mantener IDs al editar productos/variantes existentes
  - [ ] Omitir IDs al crear nuevos productos/variantes
  - [ ] Permitir eliminar productos/variantes de la lista
- [ ] Implementar manejo de errores específicos
- [ ] Agregar mensajes de alerta/notificación para errores de validación
- [ ] Probar todos los casos de uso:
  - [ ] Editar producto existente
  - [ ] Agregar nuevo producto
  - [ ] Editar variante existente
  - [ ] Agregar nueva variante
  - [ ] Eliminar producto sin respuestas
  - [ ] Intentar eliminar producto con respuestas (error esperado)
  - [ ] Eliminar variante sin respuestas
  - [ ] Intentar eliminar variante con respuestas (error esperado)

---

## Notas Importantes

### 🔴 CRÍTICO: Mantener IDs

Al editar una cotización, **siempre** debes incluir el `productId` y `variantId` de los elementos existentes. Si no lo haces, se crearán duplicados:

```typescript
// ❌ INCORRECTO: No incluir IDs
const productoEditado = {
  name: "Producto Actualizado",
  // ... sin productId
};
// Resultado: Se crea un NUEVO producto en lugar de actualizar

// ✅ CORRECTO: Incluir IDs
const productoEditado = {
  productId: "uuid-existente",
  name: "Producto Actualizado",
  // ...
};
// Resultado: Se ACTUALIZA el producto existente
```

### 🟡 IMPORTANTE: Orden de los Productos

El orden de los productos en el array no importa. El backend identifica productos y variantes por sus IDs, no por su posición en el array.

### 🟢 TIP: Estado Local

Recomendamos mantener el estado de la cotización cargada en el componente y solo modificar los campos necesarios, preservando siempre los IDs:

```typescript
const [products, setProducts] = useState<Product[]>([]);

// Al cargar
useEffect(() => {
  loadQuotation().then(data => {
    setProducts(data.products); // Ya incluyen productId y variantId
  });
}, []);

// Al editar, mantener la estructura
const handleUpdateProduct = (index: number, updates: Partial<Product>) => {
  setProducts(prev => prev.map((p, i) =>
    i === index ? { ...p, ...updates } : p
  ));
};
```

---

## Preguntas Frecuentes

### ¿Qué pasa si envío un `productId` que no existe?

El backend lo tratará como un nuevo producto (ignorará el ID inválido) y creará uno nuevo.

### ¿Puedo cambiar el orden de los productos?

Sí, el orden del array no afecta la lógica de actualización. Los productos se identifican por su `productId`.

### ¿Qué pasa si no envío el campo `products` en el payload?

No se realizarán cambios en los productos de la cotización.

### ¿Cómo sé si un producto tiene respuestas del administrador?

El backend lo validará automáticamente. Si intentas eliminar un producto con respuestas, recibirás un error `400` con un mensaje descriptivo.

### ¿Puedo editar productos de una cotización en estado DRAFT?

Sí, pero es mejor usar el endpoint `/quotations/:id/submit-draft` para cotizaciones en borrador.

---

## Soporte y Dudas

Si tienes preguntas sobre esta implementación, contacta al equipo de backend:

- 📧 Email: backend-team@company.com
- 💬 Slack: #backend-support
- 📖 Documentación API: [Swagger UI](http://localhost:3000/api)

---

## Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-10-12 | 1.0.0 | Implementación inicial de actualización selectiva de cotizaciones |

---

**Última actualización**: 12 de octubre de 2025
**Autor**: Equipo Backend ABK Imports
