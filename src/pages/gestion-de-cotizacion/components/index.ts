// Shared components
export { QuotationCard } from "./shared/quotation-card";
export { ProductGrid } from "./shared/product-grid";

// Form components
export { QuotationSummaryCard } from "./forms/quotation-summary-card";
export { QuotationConfigurationForm } from "./forms/quotation-configuration-form";
export { MaritimeServiceForm } from "./forms/maritime-service-form";
export { DynamicValuesForm } from "./forms/dynamic-values-form";
export { ExemptionControls } from "./forms/exemption-controls";

// Main Views
export { default as QuotationResponseView } from "./views/quotation-response-view";
export { default as QuotationResponsesList } from "./views/quotation-responses-list";

// Table Components  
export { default as EditableUnitCostTable } from "./views/tables/editable-unit-cost-table";
export { default as QuotationProductRow } from "./views/tables/quotation-product-row";

// Managers
export { default as ProductManager } from "./views/managers/product-manager";

// Legacy Components (DEPRECATED - Use new components above)
export { default as DetailsResponse } from "./views/detailsreponse";
export { default as ListResponses } from "./views/listreponses";
export { default as ProductRow } from "./views/ProductRow";

// Hooks
export { useQuotationList } from "../hooks/use-quotation-list";
export { useImageModal } from "../hooks/use-image-modal";
export { useQuotationResponse } from "../hooks/use-quotation-response";
export { useQuotationResponseForm } from "../hooks/use-quotation-response-form";
export { useQuotationCalculations } from "../hooks/use-quotation-calculations";

// Types
export type * from "../types/quotation-types";