import { z } from "zod";
import { variantSchema, productSchema } from "./schemas";

/**
 * Tipo para variante en el estado local del componente
 * Incluye 'id' para React keys y 'variantId' para el backend
 *
 * @property id - ID temporal para React (no se envía al backend)
 * @property variantId - ID del backend (undefined = crear, string = actualizar)
 */
export type ProductVariant = z.infer<typeof variantSchema>;

/**
 * Tipo para producto en el estado local del componente
 * Incluye campos adicionales como 'files' y 'quantityTotal'
 *
 * @property files - Archivos locales pendientes de subir al servidor
 * @property attachments - URLs de archivos ya subidos
 * @property productId - ID del backend (undefined = crear, string = actualizar)
 */
export type ProductWithVariants = z.infer<typeof productSchema>;
