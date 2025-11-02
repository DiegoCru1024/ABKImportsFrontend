import type { ResponseInformationDTO } from "@/api/interface/quotationResponseInterfaces";
import type { ResponseDataComplete } from "@/api/interface/quotation-response/dto/complete/response-data-complete";
import type { CompleteProductInterface } from "@/api/interface/quotation-response/dto/complete/products/complete-products";

import QuotationSummaryCardView from "./view-cards/QuotationSummaryCardView";
import QuotationConfigurationFormView from "./view-cards/QuotationConfigurationFormView";
import MaritimeServiceFormView from "./view-cards/MaritimeServiceFormView";
import ServiceConsolidationCardView from "./view-cards/ServiceConsolidationCardView";
import TaxObligationsCardView from "./view-cards/TaxObligationsCardView";
import ImportExpensesCardView from "./view-cards/ImportExpensesCardView";
import ImportSummaryCardView from "./view-cards/ImportSummaryCardView";
import EditableUnitCostTableView from "./view-cards/EditableUnitCostTableView";

interface CompleteServiceViewProps {
  serviceResponse: ResponseInformationDTO;
  quotationDetail?: any;
}

export function CompleteServiceView({
  serviceResponse,
  quotationDetail,
}: CompleteServiceViewProps) {
  const responseData = serviceResponse.responseData as ResponseDataComplete;
  const products = serviceResponse.products as CompleteProductInterface[];
  const isMaritime = serviceResponse.serviceType === "MARITIME";

  // Mapear productos de la API al formato esperado por la vista
  const mappedProducts = products.map((product) => {
    const quotProduct = quotationDetail?.products?.find(
      (p: any) => p.productId === product.productId
    );

    // Calcular totales del producto
    const totalQuantity = product.variants?.reduce(
      (sum, v) => sum + (v.quantity || 0),
      0
    ) || 0;

    const totalPrice = product.variants?.reduce(
      (sum, v) => sum + (v.completePricing?.unitCost || 0) * (v.quantity || 0),
      0
    ) || 0;

    return {
      id: product.productId,
      name: quotProduct?.name || "",
      price: totalPrice,
      quantity: totalQuantity,
      total: totalPrice,
      equivalence: product.pricing?.equivalence || 0,
      importCosts: product.pricing?.importCosts || 0,
      totalCost: product.pricing?.totalCost || 0,
      unitCost: product.pricing?.unitCost || 0,
      seCotiza: product.isQuoted,
      attachments: quotProduct?.attachments || [],
      variants: product.variants?.map((variant) => {
        const quotVariant = quotProduct?.variants?.find(
          (v: any) => v.variantId === variant.variantId
        );
        return {
          originalVariantId: variant.variantId,
          id: variant.variantId,
          name: quotVariant
            ? `${quotVariant.size} - ${quotVariant.presentation} - ${quotVariant.model} - ${quotVariant.color}`
            : "",
          price: Number(variant.completePricing?.unitCost) || 0,
          size: quotVariant?.size || "",
          model: quotVariant?.model || "",
          color: quotVariant?.color || "",
          presentation: quotVariant?.presentation || "",
          quantity: Number(variant.quantity) || 0,
          total: (variant.completePricing?.unitCost || 0) * (variant.quantity || 0),
          equivalence: 0,
          importCosts: 0,
          totalCost: 0,
          unitCost: Number(variant.completePricing?.unitCost) || 0,
          seCotiza: variant.isQuoted,
        };
      }) || [],
    };
  });

  return (
    <div className="w-full space-y-8 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuotationConfigurationFormView
          generalInformation={responseData.generalInformation}
        />

        <QuotationSummaryCardView resumenInfo={responseData.resumenInfo} />
      </div>

      {isMaritime && responseData.maritimeConfig && (
        <MaritimeServiceFormView maritimeConfig={responseData.maritimeConfig} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {responseData.serviceCalculations && (
          <ServiceConsolidationCardView
            serviceCalculations={responseData.serviceCalculations}
            title={responseData.type || "Servicios de Consolidación"}
          />
        )}

        {responseData.fiscalObligations && (
          <TaxObligationsCardView
            fiscalObligations={responseData.fiscalObligations}
            isMaritime={isMaritime}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {responseData.importCosts && (
          <ImportExpensesCardView importCosts={responseData.importCosts} />
        )}

        {responseData.quoteSummary && (
          <ImportSummaryCardView quoteSummary={responseData.quoteSummary} />
        )}
      </div>

      {mappedProducts && mappedProducts.length > 0 && (
        <div className="grid grid-cols-1 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            Productos con Costos Calculados ({mappedProducts.length})
          </h3>
          <EditableUnitCostTableView products={mappedProducts} />
        </div>
      )}
    </div>
  );
}
