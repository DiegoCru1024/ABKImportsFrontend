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

export function CompleteServiceView({ serviceResponse, quotationDetail }: CompleteServiceViewProps) {
  const responseData = serviceResponse.responseData as ResponseDataComplete;
  const products = serviceResponse.products as CompleteProductInterface[];
  const isMaritime = serviceResponse.serviceType === "MARITIME";

  return (
    <div className="w-full space-y-6">
      <QuotationConfigurationFormView
        generalInformation={responseData.generalInformation}
      />

      <QuotationSummaryCardView resumenInfo={responseData.resumenInfo} />

      {isMaritime && responseData.maritimeConfig && (
        <MaritimeServiceFormView maritimeConfig={responseData.maritimeConfig} />
      )}

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

      {responseData.importCosts && (
        <ImportExpensesCardView importCosts={responseData.importCosts} />
      )}

      {responseData.quoteSummary && (
        <ImportSummaryCardView quoteSummary={responseData.quoteSummary} />
      )}

      {products && products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            Productos con Costos Calculados ({products.length})
          </h3>
          <EditableUnitCostTableView products={products} />
        </div>
      )}
    </div>
  );
}