import type { ResponseInformationDTO } from "@/api/interface/quotationResponseInterfaces";
import type { ResponseDataPending } from "@/api/interface/quotation-response/dto/pending/response-data-pending";
import type { PendingProductInterface } from "@/api/interface/quotation-response/dto/pending/products/pending-products";

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
        };
      }) || [],
      attachments: quotProduct?.attachments || [],
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
    <div className="w-full space-y-8 pt-4">
      {mappedProducts && mappedProducts.length > 0 && (
        <div className="space-y-4 grid grid-cols-1">
          <h3 className="text-xl font-bold text-gray-800">
            Productos Cotizados ({mappedProducts.length})
          </h3>
          {mappedProducts.map((product, index) => (
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
