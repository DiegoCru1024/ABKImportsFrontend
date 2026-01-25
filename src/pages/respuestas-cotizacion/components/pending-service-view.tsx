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
      (p: any) => p.productId === product.productId
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
      variants: product.variants?.map((variant) => {
        const quotVariant = quotProduct?.variants?.find(
          (v: any) => v.variantId === variant.variantId
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
          images: (quotVariant?.attachments || []).map((url: string, index: number) => ({
            id: `img-${variant.variantId}-${index}`,
            url: url,
            name: `attachment-${index}`
          })),
        };
      }) || [],
      adminComment: product.adminComment || "",
      packingList: product.packingList ? {
        boxes: product.packingList.nroBoxes || 0,
        cbm: product.packingList.cbm || 0,
        weightKg: product.packingList.pesoKg || 0,
        weightTon: product.packingList.pesoTn || 0,
      } : undefined,
      cargoHandling: product.cargoHandling,
      ghostUrl: product.ghostUrl || "",
    };
  });

  return (
    <div className="w-full space-y-6 pt-2">
      {/* Resumen en una sola fila - diseño compacto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna izquierda: Métricas principales */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-indigo-500 rounded-full" />
            <h3 className="text-sm font-semibold text-gray-800">Métricas de Cotización</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-slate-50/80 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Cantidad</p>
              <p className="text-lg font-bold text-gray-900">
                {responseData.resumenInfo?.totalQuantity ?? 0}
              </p>
              <p className="text-[10px] text-gray-400">unidades</p>
            </div>
            <div className="text-center p-3 bg-slate-50/80 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Peso</p>
              <p className="text-lg font-bold text-gray-900">
                {(responseData.resumenInfo?.totalWeight ?? 0).toFixed(1)}
              </p>
              <p className="text-[10px] text-gray-400">kg</p>
            </div>
            <div className="text-center p-3 bg-slate-50/80 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Volumen</p>
              <p className="text-lg font-bold text-gray-900">
                {(responseData.resumenInfo?.totalCBM ?? 0).toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-400">m³</p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Costos */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
            <h3 className="text-sm font-semibold text-gray-800">Resumen de Costos</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 bg-slate-50/80 rounded-lg">
              <span className="text-xs text-gray-600">Precio Productos</span>
              <span className="text-sm font-semibold text-gray-900">
                USD {(responseData.resumenInfo?.totalPrice ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-blue-50/80 rounded-lg">
              <span className="text-xs text-gray-600">Servicio Express</span>
              <span className="text-sm font-semibold text-blue-700">
                USD {(responseData.resumenInfo?.totalExpress ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 px-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/50">
              <span className="text-xs font-medium text-gray-700">Total</span>
              <span className="text-base font-bold text-emerald-700">
                USD {((responseData.resumenInfo?.totalPrice ?? 0) + (responseData.resumenInfo?.totalExpress ?? 0)).toFixed(2)}
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
