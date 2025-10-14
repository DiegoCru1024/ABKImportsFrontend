import type { CompleteProductInterface } from "./dto/complete/products/complete-products";
import type { ResponseDataComplete } from "./dto/complete/response-data-complete";
import type { PendingProductInterface } from "./dto/pending/products/pending-products";
import type { ResponseDataPending } from "./dto/pending/response-data-pending";
import type { ServiceType } from "./enums/enum";

export interface QuotationResponseBase {
  quotationId: string;
  response_date: Date;
  advisorId: string;
  serviceType: ServiceType;
  responseData: ResponseDataPending | ResponseDataComplete;
  products: PendingProductInterface[]|CompleteProductInterface[];
}
