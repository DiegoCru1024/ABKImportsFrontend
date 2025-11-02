import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Package,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import ImageCarouselModal from "@/components/ImageCarouselModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductVariant {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
  price?: number;
  priceExpress?: number;
  weight?: number;
  cbm?: number;
  images?: Array<{
    id: string;
    url: string;
    name?: string;
  }>;
}

interface PackingList {
  boxes: number;
  cbm: number;
  weightKg: number;
  weightTon: number;
}

interface CargoHandling {
  fragileProduct: boolean;
  stackProduct: boolean;
  bulkyProduct:boolean;
}

interface PendingProduct {
  productId: string;
  name: string;
  url?: string;
  comment?: string;
  quantityTotal: number;
  weight: string;
  volume: string;
  number_of_boxes: number;
  variants?: ProductVariant[];
  attachments?: string[];
  adminComment?: string;
  packingList?: PackingList;
  cargoHandling?: CargoHandling;
  ghostUrl?: string;
  pendingPricing?: {
    unitPrice: number;
    expressPrice: number;
  };
}

interface QuotationProductRowViewProps {
  product: PendingProduct;
  index: number;
}

export default function QuotationProductRowView({
  product,
  index,
}: QuotationProductRowViewProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<
    Array<{ id: string; url: string; name?: string }>
  >([]);
  const [variantImageIndices, setVariantImageIndices] = useState<
    Record<string, number>
  >({});
  const [startImageIndex, setStartImageIndex] = useState<number>(0);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenImages = (
    images: Array<{ id: string; url: string; name?: string }>,
    startIndex: number = 0
  ) => {
    setSelectedImages(images);
    setStartImageIndex(startIndex);
    setIsImageModalOpen(true);
  };

  const handlePrevImage = (
    variantId: string,
    totalImages: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setVariantImageIndices((prev) => ({
      ...prev,
      [variantId]: ((prev[variantId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  const handleNextImage = (
    variantId: string,
    totalImages: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setVariantImageIndices((prev) => ({
      ...prev,
      [variantId]: ((prev[variantId] || 0) + 1) % totalImages,
    }));
  };

  // Cálculos agregados de las variantes
  const aggregatedData = {
    totalPrice:
      product.variants?.reduce(
        (acc, variant) => acc + (variant.price || 0) * (variant.quantity || 0),
        0
      ) || 0,
    totalExpress:
      product.variants?.reduce(
        (acc, variant) =>
          acc + (variant.priceExpress || 0) * (variant.quantity || 0),
        0
      ) || 0,
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 border border-slate-200/60 rounded-lg overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-blue-100/60 to-indigo-100/50 border-b-2 border-blue-200/50">
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 min-w-[4rem]">
              NRO
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 min-w-[14rem]">
              PRODUCTO & VARIANTES
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 min-w-[11rem]">
              PACKING LIST
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 min-w-[11rem]">
              MANIPULACIÓN DE CARGA
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 min-w-[10rem]">
              COMENTARIOS
            </th>
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 min-w-[7rem]">
              PRECIO
            </th>
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 min-w-[7rem]">
              EXPRESS
            </th>
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 min-w-[7rem]">
              P. TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-blue-200/30">
            {/* Columna 1: NRO. */}
            <td className="p-3 text-center align-top border-r border-blue-200/30">
              <div className="text-lg font-bold text-gray-800">{index + 1}</div>
            </td>

            {/* Columna 2: PRODUCTO & VARIANTES */}
            <td className="p-3 align-top border-r border-blue-200/30">
              <div className="space-y-2 w-56 max-w-[14rem]">
                <div>
                  <h3 className="font-semibold text-gray-800 truncate uppercase">
                    {product.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {product.quantityTotal} items
                  </Badge>
                </div>

                {/* Botón para expandir variantes */}
                {product.variants && product.variants.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleExpanded}
                    className="text-xs bg-green-100 hover:bg-green-200 "
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mr-1" />
                    )}
                    Variantes ({product.variants.length})
                  </Button>
                )}
              </div>
            </td>

            {/* Columna 3: PACKING LIST */}
            <td className="p-3 align-top border-r border-blue-200/30">
              <div className="grid grid-cols-2 text-xs gap-4">
                <div>
                  <Badge className="bg-red-100 text-red-600 border-1 border-red-200 mb-2">
                    Nro. Cajas
                  </Badge>
                  <div className="text-sm font-medium text-gray-700">
                    {product.packingList?.boxes || product.number_of_boxes || 0}
                  </div>
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-600 border-1 border-blue-200 mb-2">
                    CBM
                  </Badge>
                  <div className="text-sm font-medium text-gray-700">
                    {product.packingList?.cbm ||
                      parseFloat(product.volume) ||
                      0}
                  </div>
                </div>
                <div>
                  <Badge className="bg-green-100 text-green-600 border-1 border-green-200 mb-2">
                    PESO KG
                  </Badge>
                  <div className="text-sm font-medium text-gray-700">
                    {product.packingList?.weightKg ||
                      parseFloat(product.weight) ||
                      0}
                  </div>
                </div>
                <div>
                  <Badge className="bg-purple-100 text-purple-600 border-1 border-purple-200 mb-2">
                    PESO TON
                  </Badge>
                  <div className="text-sm font-medium text-gray-700">
                    {(
                      product.packingList?.weightTon ||
                      (parseFloat(product.weight) || 0) / 1000
                    ).toFixed(3)}
                  </div>
                </div>
              </div>
            </td>

            {/* Columna 4: MANIPULACIÓN DE CARGA */}
            <td className="p-3 align-top border-r border-blue-200/30">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-4 w-4 rounded border ${
                      product.cargoHandling?.fragileProduct
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <label className="text-sm text-gray-600">
                    Producto Frágil
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-4 w-4 rounded border ${
                      product.cargoHandling?.stackProduct
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <label className="text-sm text-gray-600">
                    Producto Apilable
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-4 w-4 rounded border ${
                      product.cargoHandling?.bulkyProduct
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <label className="text-sm text-gray-600">
                    Producto Voluminoso
                  </label>
                </div>
              </div>
            </td>

            {/* Columna 5: Comentarios */}
            <td className="p-3 align-top border-r border-blue-200/30">
              <div className="space-y-2 flex flex-col items-center gap-4">
              <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50"
                    >
                      <MessageSquare className="h-3 w-3 " /> Comentario cliente
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm ">
                      {product.comment || "Sin comentarios"}
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50"
                    >
                      <MessageSquare className="h-3 w-3 " /> Comentario administrador
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm ">
                      {product.adminComment || "Sin comentarios"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </td>

            {/* Columna 6: PRECIO */}
            <td className="p-3 text-center align-top border-r border-blue-200/30">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-emerald-700 border border-emerald-300/50 rounded-lg px-2 py-1 bg-emerald-100/50">
                $
                {product.variants && product.variants.length > 0
                  ? aggregatedData.totalPrice.toFixed(2)
                  : (product.pendingPricing?.unitPrice || 0).toFixed(2)}
              </div>
            </td>

            {/* Columna 7: EXPRESS */}
            <td className="p-3 text-center align-top border-r border-blue-200/30">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-blue-700 border border-blue-300/50 rounded-lg px-2 py-1 bg-blue-100/50">
                $
                {product.variants && product.variants.length > 0
                  ? aggregatedData.totalExpress.toFixed(2)
                  : (product.pendingPricing?.expressPrice || 0).toFixed(2)}
              </div>
            </td>

            {/* Columna 8: P. TOTAL */}
            <td className="p-3 text-center align-top">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-indigo-700 border border-indigo-300/50 rounded-lg px-2 py-1 bg-indigo-100/50">
                $
                {(product.variants && product.variants.length > 0
                  ? aggregatedData.totalPrice + aggregatedData.totalExpress
                  : (product.pendingPricing?.unitPrice || 0) +
                    (product.pendingPricing?.expressPrice || 0)
                ).toFixed(2)}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      {/* Expanded Variants */}
      {isExpanded && product.variants && product.variants.length > 0 && (
        <div className="bg-gradient-to-r from-slate-50/50 to-blue-50/40 border-t-2 border-blue-200/50">
          <div className="p-4">
            <h4 className="text-sm font-bold text-slate-800 mb-3">
              Variantes del Producto
            </h4>

            {/* Tabla de variantes con HTML nativo */}
            <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden">
              <div className="w-full overflow-x-auto">
              <table className="w-full min-w-max border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100/60 to-pink-100/50 border-b-2 border-purple-200/50">
                    <th className="p-3 text-center text-xs font-semibold text-purple-800 border-r border-purple-200/30 min-w-[6rem]">
                      Imagen
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-purple-800 border-r border-purple-200/30 min-w-[8rem]">
                      Presentación
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-purple-800 border-r border-purple-200/30 min-w-[8rem]">
                      Modelo
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-purple-800 border-r border-purple-200/30 min-w-[8rem]">
                      Color
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-purple-800 border-r border-purple-200/30 min-w-[8rem]">
                      Tamaño
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-orange-700 border-r border-purple-200/30 min-w-[6rem]">
                      Cantidad
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-emerald-700 border-r border-purple-200/30 min-w-[8rem]">
                      Precio unitario
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-blue-700 min-w-[8rem]">
                      Express
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {product.variants.map((variant) => (
                    <tr key={variant.variantId} className="text-sm">
                      {/* Imagen con mini carrusel */}
                      <td className="p-3 border-r border-purple-200/30">
                        {variant.images && variant.images.length > 0 ? (
                          <div className="relative w-20 h-20">
                            {/* Imagen principal */}
                            <div
                              className="relative cursor-pointer w-full h-full"
                              onClick={() =>
                                handleOpenImages(
                                  variant.images || [],
                                  variantImageIndices[variant.variantId] || 0
                                )
                              }
                            >
                              <img
                                src={
                                  variant.images[
                                    variantImageIndices[variant.variantId] || 0
                                  ]?.url || "/placeholder.svg"
                                }
                                alt={`${product.name} - ${variant.color}`}
                                className="w-full h-full object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full p-0 opacity-0 hover:opacity-100 transition-opacity bg-white/90"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>

                              {/* Indicador de cantidad de imágenes */}
                              {variant.images.length > 1 && (
                                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-gray-900 bg-opacity-80 rounded-full text-white text-xs font-medium">
                                  {(variantImageIndices[variant.variantId] || 0) + 1}
                                  /{variant.images.length}
                                </div>
                              )}
                            </div>

                            {/* Controles de navegación del mini carrusel */}
                            {variant.images.length > 1 && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full p-0 bg-white/90 hover:bg-white shadow-md z-10"
                                  onClick={(e) =>
                                    handlePrevImage(
                                      variant.variantId,
                                      variant.images!.length,
                                      e
                                    )
                                  }
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full p-0 bg-white/90 hover:bg-white shadow-md z-10"
                                  onClick={(e) =>
                                    handleNextImage(
                                      variant.variantId,
                                      variant.images!.length,
                                      e
                                    )
                                  }
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </td>

                      {/* Presentación */}
                      <td className="p-3 border-r border-purple-200/30">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50"
                        >
                          {variant.presentation || "N/A"}
                        </Badge>
                      </td>

                      {/* Modelo */}
                      <td className="p-3 border-r border-purple-200/30">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100/60 text-blue-800 border-blue-300/50"
                        >
                          {variant.model || "N/A"}
                        </Badge>
                      </td>

                      {/* Color */}
                      <td className="p-3 border-r border-purple-200/30">
                        <Badge
                          variant="secondary"
                          className="bg-pink-100/60 text-pink-800 border-pink-300/50"
                        >
                          {variant.color || "N/A"}
                        </Badge>
                      </td>

                      {/* Tamaño */}
                      <td className="p-3 border-r border-purple-200/30">
                        <Badge
                          variant="secondary"
                          className="bg-purple-100/60 text-purple-800 border-purple-300/50"
                        >
                          {variant.size || "N/A"}
                        </Badge>
                      </td>

                      {/* Cantidad */}
                      <td className="p-3 text-center border-r border-purple-200/30">
                        <span className="text-sm font-medium text-gray-700">
                          {variant.quantity || 0}
                        </span>
                      </td>

                      {/* Precio unitario */}
                      <td className="p-3 text-center border-r border-purple-200/30">
                        <span className="text-sm font-semibold text-emerald-700">
                          ${(variant.price || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Express */}
                      <td className="p-3 text-center">
                        <span className="text-sm font-semibold text-blue-700">
                          ${(variant.priceExpress || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imágenes */}
      <ImageCarouselModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        files={[]}
        attachments={selectedImages.map((img) => img.url)}
        productName={product.name}
        initialIndex={startImageIndex}
      />
    </div>
  );
}
