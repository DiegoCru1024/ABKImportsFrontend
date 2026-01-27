import type { ResponseInformationDTO } from "@/api/interface/quotationResponseInterfaces";
import type { ResponseDataPending } from "@/api/interface/quotation-response/dto/pending/response-data-pending";
import type { PendingProductInterface } from "@/api/interface/quotation-response/dto/pending/products/pending-products";

import QuotationSummaryCardView from "./view-cards/QuotationSummaryCardView";
import QuotationProductRowView from "./view-cards/QuotationProductRowView";

interface PendingServiceViewProps {
  serviceResponse: ResponseInformationDTO;
  quotationDetail?: any;
}

export function PendingServiceView({
  serviceResponse,
  quotationDetail,
}: PendingServiceViewProps) {
  const responseData = serviceResponse.responseData as ResponseDataPending;
  const products = serviceResponse.products as PendingProductInterface[];

  // Mapear productos de la API al formato esperado por la vista
  const mappedProducts = products.map((product) => {
    const quotProduct = quotationDetail?.products?.find(
      (p: any) => p.productId === product.productId,
    );

    return {
      productId: product.productId,
      name: quotProduct?.name || "",
      url: quotProduct?.url || "",
      comment: quotProduct?.comment || "",
      quantityTotal: quotProduct?.quantityTotal || 0,
      weight: quotProduct?.weight || "0",
      volume: quotProduct?.volume || "0",
      number_of_boxes: product.packingList?.nroBoxes || 0,
      variants:
        product.variants?.map((variant) => {
          const quotVariant = quotProduct?.variants?.find(
            (v: any) => v.variantId === variant.variantId,
          );
          return {
            variantId: variant.variantId,
            size: quotVariant?.size || "",
            presentation: quotVariant?.presentation || "",
            model: quotVariant?.model || "",
            color: quotVariant?.color || "",
            quantity: variant.quantity || 0,
            price: Number(variant.pendingPricing?.unitPrice) || 0,
            priceExpress: Number(variant.pendingPricing?.expressPrice) || 0,
            images: (quotVariant?.attachments || []).map(
              (url: string, index: number) => ({
                id: `img-${variant.variantId}-${index}`,
                url: url,
                name: `attachment-${index}`,
              }),
            ),
          };
        }) || [],
      adminComment: product.adminComment || "",
      packingList: product.packingList
        ? {
            boxes: product.packingList.nroBoxes || 0,
            cbm: product.packingList.cbm || 0,
            weightKg: product.packingList.pesoKg || 0,
            weightTon: product.packingList.pesoTn || 0,
          }
        : undefined,
      cargoHandling: product.cargoHandling,
      ghostUrl: product.ghostUrl || "",
    };
  });

  return (
    <div className="w-full space-y-6 pt-2">
      {/* Todo el resumen en una sola fila - 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Columna 1: Configuración de Servicio */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-xs font-semibold text-gray-800">
              Configuración
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-50/80 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-4 w-4 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p className="text-[10px] text-gray-500 mb-0.5">Servicio</p>
              </div>

              <p className="text-xs font-semibold text-gray-900 truncate">
                {responseData.generalInformation?.serviceLogistic || "—"}
              </p>
            </div>
            <div className="p-2 bg-slate-50/80 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[10px] text-gray-500 mb-0.5">Incoterm</p>
              </div>

              <p className="text-xs font-semibold text-gray-900 truncate">
                {responseData.generalInformation?.incoterm || "—"}
              </p>
            </div>
            <div className="p-2 bg-slate-50/80 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-4 w-4 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="text-[10px] text-gray-500 mb-0.5">Tipo Carga</p>
              </div>

              <p className="text-xs font-semibold text-gray-900 truncate">
                {responseData.generalInformation?.cargoType || "—"}
              </p>
            </div>
            <div className="p-2 bg-slate-50/80 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-4 w-4 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[10px] text-gray-500 mb-0.5">Courier</p>
              </div>

              <p className="text-xs font-semibold text-gray-900 truncate">
                {responseData.generalInformation?.courier || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Columna 2: Métricas */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-4 bg-indigo-500 rounded-full" />
            <h3 className="text-xs font-semibold text-gray-800">Métricas</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-slate-50/80 rounded-lg">
              <p className="text-[10px] text-gray-500 mb-0.5">Cantidad</p>
              <p className="text-base font-bold text-gray-900">
                {responseData.resumenInfo?.totalQuantity ?? 0}
              </p>
              <p className="text-[9px] text-gray-400">uds</p>
            </div>
            <div className="text-center p-2 bg-slate-50/80 rounded-lg">
              <p className="text-[10px] text-gray-500 mb-0.5">Peso</p>
              <p className="text-base font-bold text-gray-900">
                {(responseData.resumenInfo?.totalWeight ?? 0).toFixed(1)}
              </p>
              <p className="text-[9px] text-gray-400">kg</p>
            </div>
            <div className="text-center p-2 bg-slate-50/80 rounded-lg">
              <p className="text-[10px] text-gray-500 mb-0.5">Volumen</p>
              <p className="text-base font-bold text-gray-900">
                {(responseData.resumenInfo?.totalCBM ?? 0).toFixed(2)}
              </p>
              <p className="text-[9px] text-gray-400">m³</p>
            </div>
          </div>
        </div>

        {/* Columna 3: Costos */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            <h3 className="text-xs font-semibold text-gray-800">Costos</h3>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-slate-50/80 rounded-lg">
              <span className="text-[10px] text-gray-600">Productos</span>
              <span className="text-xs font-semibold text-gray-900">
                USD {(responseData.resumenInfo?.totalPrice ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-blue-50/80 rounded-lg">
              <span className="text-[10px] text-gray-600">Express</span>
              <span className="text-xs font-semibold text-blue-700">
                USD {(responseData.resumenInfo?.totalExpress ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/50">
              <span className="text-[10px] font-medium text-gray-700">
                Total
              </span>
              <span className="text-sm font-bold text-emerald-700">
                USD{" "}
                {(
                  (responseData.resumenInfo?.totalPrice ?? 0) +
                  (responseData.resumenInfo?.totalExpress ?? 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      {mappedProducts && mappedProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
            <h3 className="text-sm font-semibold text-gray-800">
              Productos Cotizados
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {mappedProducts.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {mappedProducts.map((product, index) => (
              <QuotationProductRowView
                key={product.productId}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
