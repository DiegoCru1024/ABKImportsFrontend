import { z } from "zod";

/**
 * Schema Zod para validación de variantes de productos
 * Incluye campo 'id' para React keys y gestión local
 * Ahora cada variante tiene sus propias imágenes
 */
export const variantSchema = z.object({
  id: z.string(), // ID temporal SOLO para React (gestión de keys, no se envía al backend)
  variantId: z.string().optional(), // ID del backend: si existe = actualizar, si no = crear
  size: z.string().optional(),
  presentation: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  quantity: z
    .number()
    .min(0, { message: "La cantidad debe ser mayor o igual a 0" }),
  attachments: z.array(z.string()), // URLs de imágenes ya subidas de esta variante
  files: z.array(z.instanceof(File)).optional(), // Archivos locales pendientes de subir de esta variante
});

/**
 * Schema Zod para validación de productos con variantes
 * Incluye campos adicionales para gestión local del formulario
 * Las imágenes ahora están asociadas a cada variante individual
 */
export const productSchema = z.object({
  productId: z.string().optional(), // ID del backend: si existe = actualizar, si no = crear
  name: z.string().min(1, { message: "El nombre es requerido" }),
  url: z.string().optional(),
  comment: z.string().optional(),
  weight: z.number().optional(),
  volume: z.number().optional(),
  number_of_boxes: z.number().optional(),
  quantityTotal: z
    .number()
    .min(0, { message: "La cantidad debe ser mayor o igual a 0" }),
  variants: z
    .array(variantSchema)
    .min(1, { message: "Debe tener al menos una variante" }),
});
