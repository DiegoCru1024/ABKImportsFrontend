import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  MessageSquare,
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

import type { PendingProductInterface } from "@/api/interface/quotation-response/dto/pending/products/pending-products";

interface PendingProductTableProps {
  product: PendingProductInterface;
  index: number;
  quotationDetail?: any;
}

export function PendingProductTable({ product, index, quotationDetail }: PendingProductTableProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<Array<{ id: string; url: string; name?: string }>>([]);

  const quotationProduct = quotationDetail?.products?.find(
    (p: any) => p.productId === product.productId
  );

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const handleOpenImages = (images: Array<{ id: string; url: string; name?: string }>) => {
    setSelectedImages(images);
    setIsImageModalOpen(true);
  };

  const totalQuantity = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-9 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
        <div className="text-center">NRO.</div>
        <div>IMAGEN</div>
        <div>PRODUCTO & VARIANTES</div>
        <div>PACKING LIST</div>
        <div>MANIPULACIÓN DE CARGA</div>
        <div>COMENTARIO ADMIN</div>
        <div>PRECIO UNIT.</div>
        <div>EXPRESS UNIT.</div>
        <div>TOTAL</div>
      </div>

      <div className="grid grid-cols-9 gap-4 p-4 items-start">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-lg font-bold text-gray-800">{index + 1}</div>
          {product.isQuoted && (
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
              Cotizado
            </Badge>
          )}
        </div>

        <div className="flex justify-center">
          {quotationProduct?.attachments && quotationProduct.attachments.length > 0 ? (
            <div className="relative">
              <img
                src={quotationProduct.attachments[0] || "/placeholder.svg"}
                alt={quotationProduct.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
                onClick={() =>
                  handleOpenImages(
                    quotationProduct.attachments?.map((url: string, idx: number) => ({
                      id: idx.toString(),
                      url,
                      name: `Imagen ${idx + 1}`
                    })) || []
                  )
                }
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <div>
            <h3 className="font-semibold text-gray-800 truncate">
              {quotationProduct?.name || 'Producto'}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {totalQuantity} items
            </Badge>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                Ver Info
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Información del Producto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">URL:</label>
                  <p className="text-sm text-blue-600 break-all">{quotationProduct?.url || 'No disponible'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Comentario Cliente:</label>
                  <p className="text-sm text-gray-600">{quotationProduct?.comment || 'Sin comentarios'}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {product.variants && product.variants.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
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

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">Nro. Cajas</label>
            <p className="font-medium text-gray-800">{product.packingList?.nroBoxes || 0}</p>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">CBM</label>
            <p className="font-medium text-gray-800">{product.packingList?.cbm || 0}</p>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">PESO KG</label>
            <p className="font-medium text-gray-800">{product.packingList?.pesoKg || 0}</p>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">PESO TON</label>
            <p className="font-medium text-gray-800">{product.packingList?.pesoTn?.toFixed(3) || '0.000'}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded ${product.cargoHandling?.fragileProduct ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            <label className="text-gray-600">Producto Frágil</label>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded ${product.cargoHandling?.stackProduct ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <label className="text-gray-600">Producto Apilable</label>
          </div>
        </div>

        <div className="space-y-2">
          {product.ghostUrl && (
            <div className="text-xs text-blue-600 truncate">
              {product.ghostUrl}
            </div>
          )}
          {product.adminComment && (
            <div className="text-xs text-gray-600 p-2 bg-yellow-50 rounded border border-yellow-200">
              {product.adminComment}
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-green-600 border border-green-200 rounded px-2 py-1 bg-green-50">
            -
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-blue-600 border border-blue-200 rounded px-2 py-1 bg-blue-50">
            -
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Cantidad</div>
          <div className="text-lg font-semibold text-emerald-600 border border-emerald-200 rounded px-2 py-1 bg-emerald-50">
            {totalQuantity}
          </div>
        </div>
      </div>

      {isExpanded && product.variants && product.variants.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">
              Variantes del Producto
            </h4>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-8 gap-4 p-3 bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-700">
                <div className="text-center">Cotizado</div>
                <div>Presentación</div>
                <div>Modelo</div>
                <div>Color</div>
                <div>Tamaño</div>
                <div className="text-orange-600">Cantidad</div>
                <div className="text-green-600">Precio unitario</div>
                <div className="text-blue-600">Express</div>
              </div>

              <div className="divide-y divide-gray-200">
                {product.variants.map((variant) => {
                  const quotationVariant = quotationProduct?.variants?.find(
                    (v: any) => v.variantId === variant.variantId
                  );

                  return (
                    <div
                      key={variant.variantId}
                      className="grid grid-cols-8 gap-4 p-3 items-center text-sm"
                    >
                      <div className="flex justify-center">
                        {variant.isQuoted ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            Sí
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-red-100 text-red-800 text-xs">
                            No
                          </Badge>
                        )}
                      </div>

                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          {quotationVariant?.presentation || 'N/A'}
                        </Badge>
                      </div>

                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 border-blue-200"
                        >
                          {quotationVariant?.model || 'N/A'}
                        </Badge>
                      </div>

                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-pink-100 text-pink-800 border-pink-200"
                        >
                          {quotationVariant?.color || 'N/A'}
                        </Badge>
                      </div>

                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 border-purple-200"
                        >
                          {quotationVariant?.size || 'N/A'}
                        </Badge>
                      </div>

                      <div>
                        <span className="font-medium text-gray-800">
                          {variant.quantity || 0}
                        </span>
                      </div>

                      <div>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(variant.pendingPricing?.unitPrice || 0)}
                        </span>
                      </div>

                      <div>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(variant.pendingPricing?.expressPrice || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <ImageCarouselModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        files={[]}
        attachments={selectedImages.map((img) => img.url)}
        productName={quotationProduct?.name || 'Producto'}
      />
    </div>
  );
}
