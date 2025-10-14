import { useState } from "react";
import {
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import ImageCarouselModal from "@/components/ImageCarouselModal";

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

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenImages = (
    images: Array<{ id: string; url: string; name?: string }>,
    startIndex: number = 0
  ) => {
    setSelectedImages(images);
    setIsImageModalOpen(true);
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
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-blue-100/60 to-indigo-100/50 border-b-2 border-blue-200/50">
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-16">
              NRO
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-24">
              IMAGEN
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-56">
              PRODUCTO & VARIANTES
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-44">
              PACKING LIST
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-44">
              MANIPULACIÓN DE CARGA
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-40">
              COMENTARIOS
            </th>
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-28">
              PRECIO
            </th>
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-28">
              EXPRESS
            </th>
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 w-28">
              P. TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-blue-200/30">
            {/* Columna 1: NRO. */}
            <td className="p-3 text-center align-top border-r border-blue-200/30 w-16">
              <div className="text-lg font-bold text-gray-800">{index + 1}</div>
            </td>

            {/* Columna 2: IMAGEN */}
            <td className="p-3 text-center align-top border-r border-blue-200/30 w-24">
              {product.attachments && product.attachments.length > 0 ? (
                <div className="flex flex-col">
                  <div
                    className="relative cursor-pointer"
                    onClick={() =>
                      handleOpenImages(
                        product.attachments?.map((url, index) => ({
                          id: index.toString(),
                          url,
                          name: `Imagen ${index + 1}`,
                        })) || [],
                        0
                      )
                    }
                  >
                    <img
                      src={product.attachments[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-6 right-6 h-5 w-5 rounded-full p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-col">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline"
                    >
                      <span className="text-xs text-blue-600 break-all">
                        Ver link
                      </span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </td>

            {/* Columna 3: PRODUCTO & VARIANTES */}
            <td className="p-3 align-top border-r border-blue-200/30 w-56">
              <div className="space-y-2">
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

            {/* Columna 4: PACKING LIST */}
            <td className="p-3 align-top border-r border-blue-200/30 w-40">
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

            {/* Columna 5: MANIPULACIÓN DE CARGA */}
            <td className="p-3 align-top border-r border-blue-200/30 w-44">
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
              </div>
            </td>

            {/* Columna 6: COMENTARIOS*/}
            <td className="p-3 align-top border-r border-blue-200/30 w-40">
              <div className="space-y-2">
                {/* Botón para ver comentarios */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs w-full">
                      <MessageSquare className="h-3 w-3 " /> Comentario Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Comentario del cliente:</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-lg text-gray-600">
                          {product.comment || "Sin comentarios"}
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {product.adminComment && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs w-full"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Comentario Admi
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Comentario del Administrador</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Comentario para: {product.name}
                        </p>
                        <p className="text-base text-gray-800">
                          {product.adminComment}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </td>

            {/* Columna 7: PRECIO */}
            <td className="p-3 text-center align-top border-r border-blue-200/30 w-28">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-emerald-700 border border-emerald-300/50 rounded-lg px-2 py-1 bg-emerald-100/50">
                $
                {product.variants && product.variants.length > 0
                  ? aggregatedData.totalPrice.toFixed(2)
                  : (product.pendingPricing?.unitPrice || 0).toFixed(2)}
              </div>
            </td>

            {/* Columna 8: EXPRESS */}
            <td className="p-3 text-center align-top border-r border-blue-200/30 w-28">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-blue-700 border border-blue-300/50 rounded-lg px-2 py-1 bg-blue-100/50">
                $
                {product.variants && product.variants.length > 0
                  ? aggregatedData.totalExpress.toFixed(2)
                  : (product.pendingPricing?.expressPrice || 0).toFixed(2)}
              </div>
            </td>

            {/* Columna 9: P. TOTAL */}
            <td className="p-3 text-center align-top w-28">
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

      {/* Expanded Variants */}
      {isExpanded && product.variants && product.variants.length > 0 && (
        <div className="bg-gradient-to-r from-slate-50/50 to-blue-50/40 border-t-2 border-blue-200/50">
          <div className="p-4">
            <h4 className="text-sm font-bold text-slate-800 mb-3">
              Variantes del Producto
            </h4>

            {/* Tabla de variantes con HTML nativo */}
            <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100/60 to-pink-100/50 border-b-2 border-purple-200/50">
                    <th className="p-3 text-left text-xs font-semibold text-purple-800 border-r border-purple-200/30 w-32">
                      Presentación
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-purple-800 border-r border-purple-200/30 w-32">
                      Modelo
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-purple-800 border-r border-purple-200/30 w-32">
                      Color
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-purple-800 border-r border-purple-200/30 w-32">
                      Tamaño
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-orange-700 border-r border-purple-200/30 w-24">
                      Cantidad
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-emerald-700 border-r border-purple-200/30 w-32">
                      Precio unitario
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-blue-700 w-32">
                      Express
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {product.variants.map((variant) => (
                    <tr key={variant.variantId} className="text-sm">
                      {/* Presentación */}
                      <td className="p-3 border-r border-purple-200/30 w-32">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50"
                        >
                          {variant.presentation || "N/A"}
                        </Badge>
                      </td>

                      {/* Modelo */}
                      <td className="p-3 border-r border-purple-200/30 w-32">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100/60 text-blue-800 border-blue-300/50"
                        >
                          {variant.model || "N/A"}
                        </Badge>
                      </td>

                      {/* Color */}
                      <td className="p-3 border-r border-purple-200/30 w-32">
                        <Badge
                          variant="secondary"
                          className="bg-pink-100/60 text-pink-800 border-pink-300/50"
                        >
                          {variant.color || "N/A"}
                        </Badge>
                      </td>

                      {/* Tamaño */}
                      <td className="p-3 border-r border-purple-200/30 w-32">
                        <Badge
                          variant="secondary"
                          className="bg-purple-100/60 text-purple-800 border-purple-300/50"
                        >
                          {variant.size || "N/A"}
                        </Badge>
                      </td>

                      {/* Cantidad */}
                      <td className="p-3 text-center border-r border-purple-200/30 w-24">
                        <span className="text-sm font-medium text-gray-700">
                          {variant.quantity || 0}
                        </span>
                      </td>

                      {/* Precio unitario */}
                      <td className="p-3 text-center border-r border-purple-200/30 w-32">
                        <span className="text-sm font-semibold text-emerald-700">
                          ${(variant.price || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Express */}
                      <td className="p-3 text-center w-32">
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
      )}

      {/* Modal de imágenes */}
      <ImageCarouselModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        files={[]}
        attachments={selectedImages.map((img) => img.url)}
        productName={product.name}
      />
    </div>
  );
}
