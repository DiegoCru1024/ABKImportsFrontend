import React from "react";

// Import the main manager component from gestion-de-cotizacion
import QuotationResponseManager from "@/pages/gestion-de-cotizacion/components/quotation-response/QuotationResponseManager";

// Utils and Interfaces
import type { QuotationResponseManagerProps } from "@/pages/gestion-de-cotizacion/components/quotation-response/utils/interfaces";

/**
 * User-facing quotation response viewer
 * Wraps the main QuotationResponseManager with user-specific configuration
 */
const QuotationResponseViewer: React.FC<Omit<QuotationResponseManagerProps, 'mode'>> = ({
  quotationId,
  onResponseUpdate,
  onError,
  readonly = true, // Users typically have read-only access
}) => {
  return (
    <QuotationResponseManager
      quotationId={quotationId}
      mode="user"
      onResponseUpdate={onResponseUpdate}
      onError={onError}
      readonly={readonly}
    />
  );
};

export default QuotationResponseViewer;