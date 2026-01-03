import type { CompleteProductInterface } from "./dto/complete/products/complete-products";
import type { ResponseDataComplete } from "./dto/complete/response-data-complete";
import type { PendingProductInterface } from "./dto/pending/products/pending-products";
import type { ResponseDataPending } from "./dto/pending/response-data-pending";
import type { ServiceType } from "./enums/enum";
import type {PurchaseOrderType} from "@/api/interface/orden-compra-interface.ts";

// DTO para crear/actualizar respuestas (sin quotationId en el body)
export interface CreateUpdateQuotationResponseDTO {
  response_date: string; // ISO 8601 format
  advisorId: string;
  serviceType: ServiceType;
  responseData: ResponseDataPending | ResponseDataComplete;
  products: PendingProductInterface[] | CompleteProductInterface[];
}

// DTO para respuestas GET (con quotationId)
export interface QuotationResponseBase {
  quotationId: string; // Ahora viene en las respuestas GET
  response_date: string; // ISO 8601 format
  advisorId: string;
  serviceType: ServiceType;
  responseData: ResponseDataPending | ResponseDataComplete;
  products: PendingProductInterface[] | CompleteProductInterface[];
}


export interface SubQuotationSelect {
    id_subQuotation: string;
    servicio: string;
    precioTotal: number;
    version:number;
}

/**
 * Respuesta de la verificación de cotización de origen
 */
export interface CheckOriginQuotationResponse {
    hayCotizacionDeOrigen: boolean;
    id: string | null;
}

export interface GetAvailableSubQuotationsDto {
    type: PurchaseOrderType;
}

/**
 * Respuesta de sub-quotations disponibles para orden de compra
 */
export interface AvailableSubQuotationResponseDto {
    id_sub_quotation: string;
    version: number;
    type: string;
    quotation_correlative: string;
}

export interface IProfitPercentage {
    id_profit_percentage: string;

    percentage: number;
}