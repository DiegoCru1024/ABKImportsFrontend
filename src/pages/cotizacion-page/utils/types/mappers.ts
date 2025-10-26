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
  variant: (variant: ProductVariant): VariantDTO => {
    // Crear objeto base sin los campos temporales
    const { id, files, ...baseVariant } = variant;

    return {
      ...baseVariant,
      variantId: variant.variantId ?? null, // Convertir undefined a null para el backend
    };
  },

  /**
   * Convierte un producto del estado local a DTO para API
   * Filtra variantes sin cantidad y elimina campos locales
   * Las imágenes están ahora en cada variante
   *
   * @param product - Producto del estado local
   * @returns DTO de producto listo para enviar al backend
   */
  product: (product: ProductWithVariants): ProductDTO => {
    // Crear objeto base sin los campos temporales
    const { quantityTotal, variants, ...baseProduct } = product;

    return {
      ...baseProduct,
      variants: variants
        .filter((v) => v.quantity > 0) // Solo incluir variantes con cantidad > 0
        .map(toAPI.variant),
    };
  },

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
