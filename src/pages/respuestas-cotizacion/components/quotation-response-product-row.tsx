import { useState } from "react";
import {
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Package,
  ExternalLink,
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

interface QuotationResponseProductRowProps {
  product: any;
  index: number;
  type: "PENDING" | "EXPRESS" | "MARITIME";
}

export function QuotationResponseProductRow({
  product,
  index,
  type,
}: QuotationResponseProductRowProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<Array<{ id: string; url: string; name?: string }>>([]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenImages = (images: Array<{ id: string; url: string; name?: string }>) => {
    setSelectedImages(images);
    setIsImageModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getProductImages = () => {
    if (type === "PENDING") {
      const attachments = product.attachments || product.variants?.[0]?.attachments || [];
      return attachments.map((url: string, index: number) => ({
        id: index.toString(),
        url,
        name: `Imagen ${index + 1}`,
      }));
    } else {
      const attachments = product.attachments || [];
      return attachments.map((url: string, index: number) => ({
        id: index.toString(),
        url,
        name: `Imagen ${index + 1}`,
      }));
    }
  };

  const productImages = getProductImages();

  const renderPendingProductInfo = () => {
    return (
      <>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">Nro. Cajas</label>
            <div className="h-8 px-2 py-1 border rounded text-center bg-gray-50">
              {product.packingList?.nroBoxes || 0}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">CBM</label>
            <div className="h-8 px-2 py-1 border rounded text-center bg-gray-50">
              {product.packingList?.cbm?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">PESO KG</label>
            <div className="h-8 px-2 py-1 border rounded text-center bg-gray-50">
              {product.packingList?.pesoKg?.toFixed(1) || '0.0'}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">PESO TON</label>
            <div className="h-8 px-2 py-1 border rounded text-center bg-gray-50">
              {product.packingList?.pesoTn?.toFixed(3) || '0.000'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`h-4 w-4 rounded ${product.cargoHandling?.fragileProduct ? 'bg-red-500' : 'bg-gray-300'}`}></div>
            <label className="text-xs text-gray-600">Producto Frágil</label>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-4 w-4 rounded ${product.cargoHandling?.stackProduct ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <label className="text-xs text-gray-600">Producto Apilable</label>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-green-600 border border-green-200 rounded px-2 py-1 bg-green-50">
            {formatCurrency(product.pricing?.totalPrice || 0)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-blue-600 border border-blue-200 rounded px-2 py-1 bg-blue-50">
            {formatCurrency(product.pricing?.totalExpress || 0)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-emerald-600 border border-emerald-200 rounded px-2 py-1 bg-emerald-50">
            {formatCurrency((product.pricing?.totalPrice || 0) + (product.pricing?.totalExpress || 0))}
          </div>
        </div>
      </>
    );
  };

  const renderCompleteProductInfo = () => {
    return (
      <>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-gray-600 mb-1">Costo Unit.</label>
              <div className="h-8 px-2 py-1 border rounded text-center bg-blue-50">
                {formatCurrency(product.pricing?.unitCost || 0)}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Imp. Costs</label>
              <div className="h-8 px-2 py-1 border rounded text-center bg-orange-50">
                {formatCurrency(product.pricing?.importCosts || 0)}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Costo Total</label>
            <div className="h-8 px-2 py-1 border rounded text-center bg-emerald-50 font-semibold">
              {formatCurrency(product.pricing?.totalCost || 0)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-gray-600 mb-1">Equivalencia</label>
            <div className="h-8 px-2 py-1 border rounded text-center bg-gray-50">
              {(product.pricing?.equivalence || 0).toFixed(2)}x
            </div>
          </div>
        </div>

        <div className="text-center col-span-3">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-emerald-600 border border-emerald-200 rounded px-2 py-1 bg-emerald-50">
            {formatCurrency(product.pricing?.totalCost || 0)}
          </div>
        </div>
      </>
    );
  };

  const renderVariants = () => {
    if (type === "PENDING") {
      return (product.variants || []).map((variant: any) => (
        <div key={variant.variantId} className="grid grid-cols-7 gap-4 p-3 items-center text-sm">
          <div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              {variant.presentation || 'N/A'}
            </Badge>
          </div>
          <div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {variant.model || 'N/A'}
            </Badge>
          </div>
          <div>
            <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
              {variant.color || 'N/A'}
            </Badge>
          </div>
          <div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              {variant.size || 'N/A'}
            </Badge>
          </div>
          <div className="text-center font-medium">
            {variant.quantity}
          </div>
          <div className="text-center font-medium text-green-600">
            {formatCurrency(variant.pendingPricing?.unitPrice || 0)}
          </div>
          <div className="text-center font-medium text-blue-600">
            {formatCurrency(variant.pendingPricing?.expressPrice || 0)}
          </div>
        </div>
      ));
    } else {
      return (product.variants || []).map((variant: any) => (
        <div key={variant.variantId} className="grid grid-cols-6 gap-4 p-3 items-center text-sm">
          <div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              {variant.presentation || 'N/A'}
            </Badge>
          </div>
          <div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {variant.model || 'N/A'}
            </Badge>
          </div>
          <div>
            <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
              {variant.color || 'N/A'}
            </Badge>
          </div>
          <div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              {variant.size || 'N/A'}
            </Badge>
          </div>
          <div className="text-center font-medium">
            {variant.quantity}
          </div>
          <div className="text-center font-medium text-emerald-600">
            {formatCurrency(variant.completePricing?.unitCost || 0)}
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className={`grid ${type === "PENDING" ? "grid-cols-9" : "grid-cols-7"} gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700`}>
        <div className="text-center">NRO.</div>
        <div>IMAGEN</div>
        <div>PRODUCTO & VARIANTES</div>
        {type === "PENDING" ? (
          <>
            <div>PACKING LIST</div>
            <div>MANIPULACIÓN</div>
            <div>PRECIO</div>
            <div>EXPRESS</div>
            <div>P. TOTAL</div>
          </>
        ) : (
          <>
            <div>COSTOS</div>
            <div>EQUIVALENCIA</div>
            <div>TOTAL</div>
          </>
        )}
      </div>

      <div className={`grid ${type === "PENDING" ? "grid-cols-9" : "grid-cols-7"} gap-4 p-4 items-start`}>
        <div className="flex flex-col items-center space-y-2">
          <div className="text-lg font-bold text-gray-800">{index + 1}</div>
          {product.isQuoted && (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              Cotizado
            </Badge>
          )}
        </div>

        <div className="flex justify-center">
          {productImages.length > 0 ? (
            <div className="relative">
              <img
                src={productImages[0].url || "/placeholder.svg"}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
                onClick={() => handleOpenImages(productImages)}
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
            <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
            <div className="flex gap-2 mt-1">
              {product.url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(product.url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  URL
                </Button>
              )}
              {type === "PENDING" && product.ghostUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(product.ghostUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Guía
                </Button>
              )}
            </div>
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
                  <label className="text-sm font-medium">URL Original:</label>
                  <p className="text-sm text-blue-600 break-all">{product.url || 'No disponible'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Comentario del Cliente:</label>
                  <p className="text-sm text-gray-600">{product.comment || 'Sin comentarios'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Comentario del Administrador:</label>
                  <p className="text-sm text-orange-600">{product.adminComment || 'Sin comentarios administrativos'}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {product.variants && product.variants.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpanded}
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

        {type === "PENDING" ? renderPendingProductInfo() : renderCompleteProductInfo()}
      </div>

      {isExpanded && product.variants && product.variants.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Variantes del Producto</h4>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className={`grid ${type === "PENDING" ? "grid-cols-7" : "grid-cols-6"} gap-4 p-3 bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-700`}>
                <div>Presentación</div>
                <div>Modelo</div>
                <div>Color</div>
                <div>Tamaño</div>
                <div className="text-orange-600">Cantidad</div>
                {type === "PENDING" ? (
                  <>
                    <div className="text-green-600">Precio Unit.</div>
                    <div className="text-blue-600">Express</div>
                  </>
                ) : (
                  <div className="text-emerald-600">Costo Unit.</div>
                )}
              </div>
              <div className="divide-y divide-gray-200">
                {renderVariants()}
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
        productName={product.name}
      />
    </div>
  );
}