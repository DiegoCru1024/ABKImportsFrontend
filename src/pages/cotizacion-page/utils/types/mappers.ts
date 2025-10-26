import type { ProductVariant, ProductWithVariants } from "./local.types";
import type { VariantDTO, ProductDTO, QuotationPayload } from "./api.types";

/**
 * Utilidades de mapeo para convertir tipos locales a DTOs de API
 * Estos mappers transforman los datos del estado local al formato esperado por el backend
 */
export const toAPI = {
  /**
   * Convierte una variante del estado local a DTO para API
   * Elimina los campos 'id' y 'files' temporales
   * Incluye 'attachments' con las URLs de imágenes
   *
   * @param variant - Variante del estado local
   * @returns DTO de variante listo para enviar al backend
   */
  variant: (variant: ProductVariant): VariantDTO => ({
    variantId: variant.variantId ?? null, // Convertir undefined a null para el backend
    size: variant.size,
    presentation: variant.presentation,
    model: variant.model,
    color: variant.color,
    quantity: variant.quantity,
    attachments: variant.attachments, // URLs de imágenes de esta variante
  }),

  /**
   * Convierte un producto del estado local a DTO para API
   * Filtra variantes sin cantidad y elimina campos locales
   * Las imágenes están ahora en cada variante
   *
   * @param product - Producto del estado local
   * @returns DTO de producto listo para enviar al backend
   */
  product: (product: ProductWithVariants): ProductDTO => ({
    productId: product.productId,
    name: product.name,
    url: product.url,
    comment: product.comment,
    weight: product.weight,
    volume: product.volume,
    number_of_boxes: product.number_of_boxes,
    variants: product.variants
      .filter((v) => v.quantity > 0) // Solo incluir variantes con cantidad > 0
      .map(toAPI.variant),
  }),

  /**
   * Convierte array de productos y metadata a payload completo de cotización
   * Este es el método principal para preparar datos antes de enviar al backend
   *
   * @param products - Lista de productos con archivos ya subidos en cada variante
   * @param serviceType - Tipo de servicio seleccionado
   * @param saveAsDraft - Si se guarda como borrador o se envía
   * @returns Payload completo listo para enviar al endpoint
   */
  quotation: (
    products: ProductWithVariants[],
    serviceType: string,
    saveAsDraft = false
  ): QuotationPayload => ({
    service_type: serviceType,
    products: products.map(toAPI.product),
    saveAsDraft,
  }),
};
