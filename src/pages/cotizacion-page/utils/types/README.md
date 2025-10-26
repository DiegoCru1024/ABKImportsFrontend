# Sistema de Tipos para Cotizaciones

## 📋 Descripción

Este directorio contiene la arquitectura unificada de tipos y validaciones para el sistema de cotizaciones. Todos los tipos están organizados en módulos separados para facilitar el mantenimiento y la escalabilidad.

---

## 🏗️ Estructura de Archivos

```
types/
├── schemas.ts          # Schemas Zod para validación
├── local.types.ts      # Tipos para el estado local (UI/React)
├── api.types.ts        # Tipos para comunicación con el backend (API/DTO)
├── mappers.ts          # Funciones de transformación
├── index.ts            # Punto de entrada centralizado
└── README.md           # Esta documentación
```

---

## 📁 Descripción de Archivos

### **1. schemas.ts** - Validación con Zod

Define los schemas de validación para formularios usando Zod.

```typescript
import { variantSchema, productSchema } from './types';

// Usar en formularios con react-hook-form
const form = useForm({
  resolver: zodResolver(productSchema),
});
```

**Contiene:**
- `variantSchema` - Validación de variantes
- `productSchema` - Validación de productos con variantes

---

### **2. local.types.ts** - Tipos Locales (UI)

Define los tipos para el estado local de React, inferidos desde los schemas Zod.

```typescript
import type { ProductVariant, ProductWithVariants } from './types';

// Usar en estado de componentes
const [productos, setProductos] = useState<ProductWithVariants[]>([]);
const [variants, setVariants] = useState<ProductVariant[]>([]);
```

**Contiene:**
- `ProductVariant` - Variante con campo `id` temporal para React
- `ProductWithVariants` - Producto con campos locales (`files`, `quantityTotal`)

---

### **3. api.types.ts** - Tipos de API (DTOs)

Define los tipos para comunicación con el backend (sin campos temporales de React).

```typescript
import type { QuotationPayload } from './types';

// Usar en llamadas a la API
await createQuotation({ data: payload });
```

**Contiene:**
- `VariantDTO` - Variante sin campo `id` temporal
- `ProductDTO` - Producto sin campos locales
- `QuotationPayload` - Payload completo para la API

---

### **4. mappers.ts** - Transformaciones

Funciones para convertir tipos locales a DTOs de API.

```typescript
import { toAPI } from './types';

// Convertir productos a payload de API
const payload = toAPI.quotation(productos, service, saveAsDraft);
```

**Contiene:**
- `toAPI.variant()` - Convierte `ProductVariant` → `VariantDTO`
- `toAPI.product()` - Convierte `ProductWithVariants` → `ProductDTO`
- `toAPI.quotation()` - Crea `QuotationPayload` completo

---

### **5. index.ts** - Punto de Entrada

Re-exporta todos los tipos y utilidades desde un solo lugar.

```typescript
// ✅ RECOMENDADO: Importar desde el index
import {
  productSchema,
  type ProductWithVariants,
  toAPI
} from '@/pages/cotizacion-page/utils/types';

// ❌ EVITAR: Importar directamente de archivos internos
import { productSchema } from '@/pages/cotizacion-page/utils/types/schemas';
```

---

## 📖 Guía de Uso

### **Caso 1: Crear Formulario con Validación**

```typescript
import { productSchema, type ProductWithVariants } from '@/pages/cotizacion-page/utils/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type FormValues = z.infer<typeof productSchema>;

const form = useForm<FormValues>({
  resolver: zodResolver(productSchema),
  defaultValues: {
    name: "",
    variants: [{
      id: Date.now().toString(),
      quantity: 0,
    }],
  },
});
```

---

### **Caso 2: Gestionar Estado Local**

```typescript
import type { ProductWithVariants, ProductVariant } from '@/pages/cotizacion-page/utils/types';

// Estado de productos
const [productos, setProductos] = useState<ProductWithVariants[]>([]);

// Estado de variantes
const [variants, setVariants] = useState<ProductVariant[]>([
  {
    id: Date.now().toString(),
    quantity: 0,
  },
]);
```

---

### **Caso 3: Enviar Datos al Backend**

```typescript
import { toAPI } from '@/pages/cotizacion-page/utils/types';

const handleSubmit = async () => {
  // 1. Subir archivos
  const productosConUrls = await Promise.all(
    productos.map(async (producto) => {
      const attachments = await uploadFiles(producto.files);
      return { ...producto, attachments };
    })
  );

  // 2. Convertir a formato de API
  const payload = toAPI.quotation(productosConUrls, service, saveAsDraft);

  // 3. Enviar al backend
  await createQuotation({ data: payload });
};
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FORMULARIO (UI)                                          │
│    schemas.ts → productSchema                               │
│    Validación con Zod                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ESTADO LOCAL (React)                                     │
│    local.types.ts → ProductWithVariants                     │
│    Incluye: id, files, quantityTotal                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TRANSFORMACIÓN (Mappers)                                 │
│    mappers.ts → toAPI.quotation()                           │
│    Elimina campos locales, normaliza valores                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. API (Backend)                                            │
│    api.types.ts → QuotationPayload                          │
│    Solo campos que espera el backend                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Diferencias Entre Tipos

### **ProductVariant (Local) vs VariantDTO (API)**

| Campo | ProductVariant | VariantDTO |
|-------|---------------|------------|
| `id` | ✅ (para React keys) | ❌ (no se envía) |
| `variantId` | `string \| undefined` | `string \| null` |
| Otros campos | Igual | Igual |

### **ProductWithVariants (Local) vs ProductDTO (API)**

| Campo | ProductWithVariants | ProductDTO |
|-------|---------------------|------------|
| `files` | ✅ (archivos locales) | ❌ (no se envía) |
| `quantityTotal` | ✅ (para UI) | ❌ (calculado) |
| `attachments` | URLs | URLs |
| `variants` | `ProductVariant[]` | `VariantDTO[]` |

---

## 🚨 Errores Comunes

### ❌ Error 1: Importar desde archivos internos

```typescript
// ❌ MAL
import { ProductVariant } from '@/pages/cotizacion-page/utils/types/local.types';

// ✅ BIEN
import type { ProductVariant } from '@/pages/cotizacion-page/utils/types';
```

### ❌ Error 2: No usar mappers

```typescript
// ❌ MAL - Mapeo manual
const payload = {
  products: productos.map(p => ({
    name: p.name,
    // ... olvidas campos
  })),
};

// ✅ BIEN - Usar mapper
const payload = toAPI.quotation(productos, service, draft);
```

### ❌ Error 3: Enviar campos locales al backend

```typescript
// ❌ MAL - Envía campos que el backend no espera
await createQuotation({
  data: productos, // ❌ Incluye 'id', 'files', etc.
});

// ✅ BIEN - Usar mapper que limpia los datos
const payload = toAPI.quotation(productos, service, draft);
await createQuotation({ data: payload });
```

---

## 🔧 Agregar un Nuevo Campo

### Paso 1: Actualizar el schema

```typescript
// schemas.ts
export const variantSchema = z.object({
  // ... campos existentes
  newField: z.string().optional(),
});
```

### Paso 2: Actualizar el mapper (si es necesario)

```typescript
// mappers.ts
variant: (variant: ProductVariant): VariantDTO => ({
  // ... campos existentes
  newField: variant.newField,
}),
```

Los tipos TypeScript (`ProductVariant`) se actualizan automáticamente al estar inferidos desde el schema.

---

## ✅ Checklist para Desarrolladores

- [ ] Importar tipos desde `@/pages/cotizacion-page/utils/types`
- [ ] Usar `productSchema` para validación de formularios
- [ ] Usar `ProductWithVariants` para estado local
- [ ] Usar `toAPI.quotation()` antes de enviar al backend
- [ ] NO enviar campos locales (`id`, `files`) al backend
- [ ] Verificar TypeScript con `npm run type-check`

---

## 📚 Archivos de Compatibilidad

Los siguientes archivos en `utils/` están **deprecados** pero se mantienen por compatibilidad:

- `quotation.types.ts` - Re-exporta desde `types/`
- `schema.ts` - Re-exporta desde `types/`
- `interface.ts` - Re-exporta desde `types/`

**Para nuevos desarrollos, importar directamente desde `types/`:**

```typescript
// ✅ RECOMENDADO
import { ProductVariant } from '@/pages/cotizacion-page/utils/types';

// ⚠️ DEPRECADO (pero funciona)
import { ProductVariant } from '@/pages/cotizacion-page/utils/quotation.types';
```

---

## 🎯 Beneficios de Esta Arquitectura

✅ **Separación de responsabilidades:** Cada archivo tiene un propósito claro
✅ **Type-safety completo:** TypeScript detecta errores en desarrollo
✅ **Validación automática:** Schemas Zod en formularios
✅ **Mappers reutilizables:** Lógica centralizada de transformación
✅ **Fácil mantenimiento:** Cambios en archivos específicos
✅ **Escalabilidad:** Agregar campos es simple y seguro

---

**Última actualización:** 2025-10-25
**Autor:** ABKImports Development Team
