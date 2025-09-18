import { useState } from "react";
import {
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Package,
  ExternalLink,
  Image,
  Hash,
  Box,
  Weight,
  DollarSign,
  Zap,
  Calculator,
  TrendingUp,
  Layers,
  Truck,
  Check,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [selectedImages, setSelectedImages] = useState<
    Array<{ id: string; url: string; name?: string }>
  >([]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenImages = (
    images: Array<{ id: string; url: string; name?: string }>
  ) => {
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
      const attachments =
        product.attachments || product.variants?.[0]?.attachments || [];
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
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-gray-600 mb-2 font-medium">
              Nro. Cajas
            </label>
            <div className="h-10 px-3 py-2 border rounded text-center bg-gray-50 font-semibold">
              {product.packingList?.nroBoxes || 0}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">CBM</label>
            <div className="h-10 px-3 py-2 border rounded text-center bg-gray-50 font-semibold">
              {product.packingList?.cbm?.toFixed(2) || "0.00"}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">
              PESO KG
            </label>
            <div className="h-10 px-3 py-2 border rounded text-center bg-gray-50 font-semibold">
              {product.packingList?.pesoKg?.toFixed(1) || "0.0"}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-2 font-medium">
              PESO TON
            </label>
            <div className="h-10 px-3 py-2 border rounded text-center bg-gray-50 font-semibold">
              {product.packingList?.pesoTn?.toFixed(3) || "0.000"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div
              className={`h-5 w-5 rounded-full border-2 ${
                product.cargoHandling?.fragileProduct
                  ? "bg-red-500 border-red-500"
                  : "bg-gray-100 border-gray-300"
              }`}
            ></div>
            <label className="text-sm text-gray-700 font-medium">
              Producto Frágil
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`h-5 w-5 rounded-full border-2 ${
                product.cargoHandling?.stackProduct
                  ? "bg-green-500 border-green-500"
                  : "bg-gray-100 border-gray-300"
              }`}
            ></div>
            <label className="text-sm text-gray-700 font-medium">
              Producto Apilable
            </label>
          </div>
          <div className="mt-3">
            <label className="block text-sm text-gray-600 mb-2 font-medium">
              Tipo de Carga
            </label>
            <div className="h-10 px-3 py-2 border rounded text-center bg-blue-50 font-semibold text-blue-800">
              GENERAL
            </div>
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
            {formatCurrency(
              (product.pricing?.totalPrice || 0) +
                (product.pricing?.totalExpress || 0)
            )}
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
        <TableRow key={variant.variantId} className="hover:bg-gray-50">
          <TableCell>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              {(variant.presentation).toString() || "N/A"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              {variant.model || "N/A"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant="secondary"
              className="bg-pink-100 text-pink-800 border-pink-200"
            >
              {variant.color || "N/A"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 border-purple-200"
            >
              {variant.size || "N/A"}
            </Badge>
          </TableCell>
          <TableCell className="text-center font-medium">
            {variant.quantity}
          </TableCell>
          <TableCell className="text-center font-medium text-green-600">
            {formatCurrency(variant.pendingPricing?.unitPrice || 0)}
          </TableCell>
          <TableCell className="text-center font-medium text-blue-600">
            {formatCurrency(variant.pendingPricing?.expressPrice || 0)}
          </TableCell>
        </TableRow>
      ));
    } else {
      return (product.variants || []).map((variant: any) => (
        <TableRow key={variant.variantId} className="hover:bg-gray-50">
          <TableCell>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              {variant.presentation || "N/A"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              {variant.model || "N/A"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant="secondary"
              className="bg-pink-100 text-pink-800 border-pink-200"
            >
              {variant.color || "N/A"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 border-purple-200"
            >
              {variant.size || "N/A"}
            </Badge>
          </TableCell>
          <TableCell className="text-center font-medium">
            {variant.quantity}
          </TableCell>
          <TableCell className="text-center font-medium text-emerald-600">
            {formatCurrency(variant.completePricing?.unitCost || 0)}
          </TableCell>
        </TableRow>
      ));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-16 text-center">
              <div className="flex items-center justify-center gap-2">ITEM</div>
            </TableHead>
            <TableHead className="w-40">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                IMAGEN & URL
              </div>
            </TableHead>
            <TableHead className="min-w-80">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                PRODUCTO & VARIANTES
              </div>
            </TableHead>
            {type === "PENDING" ? (
              <>
                <TableHead className="w-56">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4" />
                    PACKING LIST
                  </div>
                </TableHead>
                <TableHead className="w-56">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    MANIPULACIÓN DE CARGA
                  </div>
                </TableHead>
                <TableHead className="w-40 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4" /> PRECIO
                  </div>
                </TableHead>
                <TableHead className="w-40 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" />
                    EXPRESS
                  </div>
                </TableHead>
                <TableHead className="w-40 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calculator className="h-4 w-4" />
                    P. TOTAL
                  </div>
                </TableHead>
              </>
            ) : (
              <>
                <TableHead className="w-56">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    COSTOS
                  </div>
                </TableHead>
                <TableHead className="w-40 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    EQUIVALENCIA
                  </div>
                </TableHead>
                <TableHead className="w-40 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calculator className="h-4 w-4" />
                    TOTAL
                  </div>
                </TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="text-sm font-bold text-gray-800">
                  {index + 1}
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex justify-center">
                {productImages.length > 0 ? (
                  <div className="relative">
                    <img
                      src={productImages[0].url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
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
            </TableCell>

            <TableCell>
              <div className="min-w-0 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-3 truncate">
                    {product.name}
                  </h3>
                  <div className="flex gap-2 mt-4">
                    {product.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => window.open(product.url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        URL Producto
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Comentarios
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Información del Producto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              URL Producto:
                            </label>
                            <p className="text-sm text-blue-600 break-all">
                              {product.url || "No disponible"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Comentario del Cliente:
                            </label>
                            <p className="text-sm text-gray-600">
                              {product.comment || "Sin comentarios"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Comentario del Administrador:
                            </label>
                            <p className="text-sm text-orange-600">
                              {product.adminComment ||
                                "Sin comentarios administrativos"}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

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
            </TableCell>

            {type === "PENDING" ? (
              <>
                <TableCell>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-600 mb-2 font-medium">
                        Nro. Cajas
                      </label>
                      <div className="h-10 px-3 py-2 border rounded text-center bg-gray-50 font-semibold">
                        {product.packingList?.nroBoxes || 0}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-2 font-medium">
                        CBM
                      </label>
                      <div className="h-10 px-3 py-2 border rounded text-center bg-gray-50 font-semibold">
                        {product.packingList?.cbm?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-2 font-medium">
                        PESO KG
                      </label>
                      <div className="h-10 px-3 py-2 border rounded text-center bg-gray-50 font-semibold">
                        {product.packingList?.pesoKg?.toFixed(1) || "0.0"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-2 font-medium">
                        PESO TON
                      </label>
                      <div className="h-10 px-3 py-2 border rounded text-center bg-gray-50 font-semibold">
                        {product.packingList?.pesoTn?.toFixed(3) || "0.000"}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          product.cargoHandling?.fragileProduct
                            ? "bg-red-500 border-red-500"
                            : "bg-gray-100 border-gray-300"
                        }`}
                      ></div>
                      <label className="text-sm text-gray-700 font-medium">
                        Producto Frágil
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          product.cargoHandling?.stackProduct
                            ? "bg-green-500 border-green-500"
                            : "bg-gray-100 border-gray-300"
                        }`}
                      ></div>
                      <label className="text-sm text-gray-700 font-medium">
                        Producto Apilable
                      </label>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-medium">USD</div>
                    <div className="text-lg font-bold text-orange-600 border-2 px-4 py-3 bg-orange-50 shadow-sm">
                      {formatCurrency(product.pricing?.totalPrice || 0)}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-medium">USD</div>
                    <div className="text-lg font-bold text-blue-600 border-2 px-4 py-3 bg-blue-50 shadow-sm">
                      {formatCurrency(product.pricing?.totalExpress || 0)}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-medium">USD</div>
                    <div className="text-lg font-bold text-green-600 border-2 px-4 py-3 bg-green-50 shadow-sm">
                      {formatCurrency(
                        (product.pricing?.totalPrice || 0) +
                          (product.pricing?.totalExpress || 0)
                      )}
                    </div>
                  </div>
                </TableCell>
              </>
            ) : (
              <>
                <TableCell>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-gray-600 mb-1">
                          Costo Unit.
                        </label>
                        <div className="h-8 px-2 py-1 border rounded text-center bg-blue-50">
                          {formatCurrency(product.pricing?.unitCost || 0)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">
                          Imp. Costs
                        </label>
                        <div className="h-8 px-2 py-1 border rounded text-center bg-orange-50">
                          {formatCurrency(product.pricing?.importCosts || 0)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">
                        Costo Total
                      </label>
                      <div className="h-8 px-2 py-1 border rounded text-center bg-emerald-50 font-semibold">
                        {formatCurrency(product.pricing?.totalCost || 0)}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-gray-600 mb-1">
                        Equivalencia
                      </label>
                      <div className="h-8 px-2 py-1 border rounded text-center bg-gray-50">
                        {(product.pricing?.equivalence || 0).toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="text-center col-span-3">
                    <div className="text-xs text-gray-600 mb-1">USD</div>
                    <div className="text-lg font-semibold text-emerald-600 border border-emerald-200 rounded px-2 py-1 bg-emerald-50">
                      {formatCurrency(product.pricing?.totalCost || 0)}
                    </div>
                  </div>
                </TableCell>
              </>
            )}
          </TableRow>
        </TableBody>
      </Table>

      {isExpanded && product.variants && product.variants.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              Variantes del Producto
            </h4>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="w-40">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Presentación
                      </div>
                    </TableHead>
                    <TableHead className="w-40">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Modelo
                      </div>
                    </TableHead>
                    <TableHead className="w-40">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-pink-400 to-purple-500"></div>
                        Color
                      </div>
                    </TableHead>
                    <TableHead className="w-40">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        Tamaño
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-orange-600">
                        <Hash className="h-4 w-4" />
                        Cantidad
                      </div>
                    </TableHead>
                    {type === "PENDING" ? (
                      <>
                        <TableHead className="w-40 text-center">
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <DollarSign className="h-4 w-4" />
                            Precio Unit.
                          </div>
                        </TableHead>
                        <TableHead className="w-40 text-center">
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <Zap className="h-4 w-4" />
                            Express
                          </div>
                        </TableHead>
                      </>
                    ) : (
                      <TableHead className="w-40 text-center">
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <DollarSign className="h-4 w-4" />
                          Costo Unit.
                        </div>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>{renderVariants()}</TableBody>
              </Table>
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
