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
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Error de conexión. Por favor, verifica tu conexión a internet";
    }

    return error.message;
  }

  return "Error inesperado al actualizar la cotización. Por favor, intenta nuevamente";
}

