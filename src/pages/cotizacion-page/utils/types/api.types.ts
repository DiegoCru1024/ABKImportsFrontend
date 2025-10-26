import type { ProductVariant, ProductWithVariants } from "./local.types";

/**
 * DTO de variante para enviar al backend
 * Omite 'id' y 'files' (temporal de React)
 * Cada variante ahora tiene sus propias imágenes en 'attachments'
 *
 * @property variantId - null = crear nueva, string = actualizar existente
 * @property attachments - URLs de imágenes de esta variante
 */
export type VariantDTO = Omit<ProductVariant, "id" | "files"> & {
  variantId?: string | null;
};

/**
 * DTO de producto para enviar al backend
 * Omite campos locales ('quantityTotal')
 * Las imágenes ahora están en cada variante, no en el producto
 *
 * @property productId - undefined = crear nuevo, string = actualizar existente
 * @property variants - Lista de variantes con sus propias imágenes
 */
export type ProductDTO = Omit<ProductWithVariants, "quantityTotal"> & {
  variants: VariantDTO[];
};

/**
 * Payload completo para crear/actualizar cotización
 * Este es el objeto que se envía al endpoint de la API
 *
 * @property service_type - Tipo de servicio seleccionado
 * @property products - Lista de productos con sus variantes
 * @property saveAsDraft - Indica si se guarda como borrador o se envía
 */
export interface QuotationPayload {
  service_type: string;
  products: ProductDTO[];
  saveAsDraft?: boolean;
}
