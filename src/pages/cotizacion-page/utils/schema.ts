import { z } from "zod";

// Schema para variantes de productos
export const variantSchema = z.object({
  id: z.string(),
  size: z.string().optional(),
  presentation: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().min(0, { message: "La cantidad debe ser mayor o igual a 0" }),
});

// Schema principal del producto con variantes
export const productoSchema = z.object({
    name: z.string().min(1, { message: "El nombre es requerido" }),
    url: z.string().optional(),
    comment: z.string().optional(),
    quantityTotal: z.number().min(0, { message: "La cantidad debe ser mayor o igual a 0" }),
    weight: z.number().optional(),
    volume: z.number().optional(),
    number_of_boxes: z.number().optional(),
    variants: z.array(variantSchema).min(1, { message: "Debe tener al menos una variante" }),
    attachments: z.array(z.string()).optional(),
  });

// Tipos TypeScript derivados
export type ProductVariant = z.infer<typeof variantSchema>;
export type ProductWithVariants = z.infer<typeof productoSchema>;
  