/**
 * Maneja los errores específicos de actualización de cotizaciones
 * @param error - El error capturado
 * @returns Mensaje de error descriptivo en español
 */
export function handleQuotationUpdateError(error: any): string {
  // Si el error tiene una respuesta HTTP
  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;

    if (status === 400) {
      // Errores de validación específicos
      if (message.includes("No se puede eliminar el producto")) {
        return message;
      }

      if (message.includes("No se puede eliminar la variante")) {
        return message;
      }

      return message || "Error de validación al actualizar la cotización";
    }

    if (status === 404) {
      return "La cotización no fue encontrada";
    }

    if (status === 401) {
      return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente";
    }

    if (status === 403) {
      return "No tienes permisos para actualizar esta cotización";
    }

    return message || "Error al actualizar la cotización";
  }

  // Si el error tiene un mensaje directo
  if (error?.message) {
    // Detectar errores específicos en el mensaje
    if (error.message.includes("No se puede eliminar el producto")) {
      return error.message;
    }

    if (error.message.includes("No se puede eliminar la variante")) {
      return error.message;
    }

    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Error de conexión. Por favor, verifica tu conexión a internet";
    }

    return error.message;
  }

  return "Error inesperado al actualizar la cotización. Por favor, intenta nuevamente";
}

/**
 * Verifica si un error es de tipo "no se puede eliminar"
 * @param error - El error capturado
 * @returns true si es un error de eliminación bloqueada
 */
export function isDeletionBlockedError(error: any): boolean {
  const message = error?.response?.data?.message || error?.message || "";
  return (
    message.includes("No se puede eliminar el producto") ||
    message.includes("No se puede eliminar la variante")
  );
}
