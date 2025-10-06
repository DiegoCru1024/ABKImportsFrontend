import type { ResponseInformationDTO } from "@/api/interface/quotationResponseInterfaces";
import type { ResponseDataPending } from "@/api/interface/quotation-response/dto/pending/response-data-pending";
import type { PendingProductInterface } from "@/api/interface/quotation-response/dto/pending/products/pending-products";

import QuotationSummaryCardView from "./view-cards/QuotationSummaryCardView";
import QuotationConfigurationFormView from "./view-cards/QuotationConfigurationFormView";
import QuotationProductRowView from "./view-cards/QuotationProductRowView";

interface PendingServiceViewProps {
  serviceResponse: ResponseInformationDTO;
  quotationDetail?: any;
}

export function PendingServiceView({ serviceResponse, quotationDetail }: PendingServiceViewProps) {
  const responseData = serviceResponse.responseData as ResponseDataPending;
  const products = serviceResponse.products as PendingProductInterface[];

  return (
    <div className="w-full space-y-6">
      <QuotationConfigurationFormView
        generalInformation={responseData.generalInformation}
      />

      <QuotationSummaryCardView resumenInfo={responseData.resumenInfo} />

      {products && products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            Productos Cotizados ({products.length})
          </h3>
          {products.map((product, index) => (
            <QuotationProductRowView
              key={product.productId}
              product={product}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}