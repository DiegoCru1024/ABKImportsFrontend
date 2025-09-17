import { useState, useEffect, useMemo, useRef } from "react";
import {
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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

interface Product {
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
}

interface QuotationProductRowProps {
  product: Product;
  index: number;
  quotationDetail?: unknown;
  onProductChange?: (
    productId: string,
    field: string,
    value: number | string
  ) => void;
  editableProducts?: Product[];
  productQuotationState?: Record<string, boolean>;
  variantQuotationState?: Record<string, Record<string, boolean>>;
  onProductQuotationToggle?: (productId: string, checked: boolean) => void;
  onVariantQuotationToggle?: (
    productId: string,
    variantId: string,
    checked: boolean
  ) => void;
  onProductUpdate?: (productId: string, updates: Partial<Product>) => void;
  onVariantUpdate?: (
    productId: string,
    variantId: string,
    updates: Partial<ProductVariant>
  ) => void;
  onAggregatedDataChange?: (
    productId: string,
    aggregatedData: {
      totalPrice: number;
      totalWeight: number;
      totalCBM: number;
      totalQuantity: number;
      totalExpress: number;
    }
  ) => void;
}

export default function QuotationProductRow({
  product,
  index,
  productQuotationState = {},
  variantQuotationState = {},
  onProductQuotationToggle,
  onVariantQuotationToggle,
  onProductUpdate,
  onVariantUpdate,
  onAggregatedDataChange,
}: QuotationProductRowProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<
    Array<{ id: string; url: string; name?: string }>
  >([]);
  const [adminComment, setAdminComment] = useState<string>(
    product.adminComment || ""
  );

  // Estado local para los valores del producto con valores extendidos para vista pendiente
  const [localProduct, setLocalProduct] = useState<Product & {
    packingList?: PackingList;
    cargoHandling?: CargoHandling;
    ghostUrl?: string;
  }>({
    ...product,
    packingList: {
      boxes: product.number_of_boxes || 0,
      cbm: parseFloat(product.volume) || 0,
      weightKg: parseFloat(product.weight) || 0,
      weightTon: (parseFloat(product.weight) || 0) / 1000,
    },
    cargoHandling: {
      fragileProduct: false,
      stackProduct: false,
    },
    ghostUrl: product.url || '',
  });

  // Solo actualizar el estado local si hay cambios significativos desde el padre
  useEffect(() => {
    const hasSignificantChange =
      product.productId !== localProduct.productId ||
      product.name !== localProduct.name ||
      product.attachments !== localProduct.attachments ||
      (product.variants &&
        localProduct.variants &&
        product.variants.length !== localProduct.variants.length);

    if (hasSignificantChange) {
      setLocalProduct(prev => ({
        ...product,
        packingList: {
          boxes: product.number_of_boxes || prev.packingList?.boxes || 0,
          cbm: parseFloat(product.volume) || prev.packingList?.cbm || 0,
          weightKg: parseFloat(product.weight) || prev.packingList?.weightKg || 0,
          weightTon: (parseFloat(product.weight) || prev.packingList?.weightKg || 0) / 1000,
        },
        cargoHandling: prev.cargoHandling || {
          fragileProduct: false,
          stackProduct: false,
        },
        ghostUrl: product.url || prev.ghostUrl || '',
      }));
    }
  }, [
    product.productId,
    product.name,
    product.attachments,
    product.variants,
    product.number_of_boxes,
    product.volume,
    product.weight,
    product.url,
    localProduct.productId,
    localProduct.name,
    localProduct.attachments,
    localProduct.variants,
  ]);

  // Definir productVariants antes de usarlo en useMemo
  const isProductSelected =
    productQuotationState[product.productId] !== undefined
      ? productQuotationState[product.productId]
      : true;
  const productVariants = variantQuotationState[product.productId] || {};

  // Cálculos dinámicos agregados de las variantes
  const aggregatedData = useMemo(() => {
    if (!localProduct.variants || localProduct.variants.length === 0) {
      return {
        totalPrice: 0,
        totalWeight: localProduct.packingList?.weightKg || 0,
        totalCBM: localProduct.packingList?.cbm || 0,
        totalQuantity: localProduct.quantityTotal || 0,
        totalExpress: 0,
      };
    }

    const selectedVariants = localProduct.variants.filter((variant) => {
      const isSelected =
        productVariants[variant.variantId] !== undefined
          ? productVariants[variant.variantId]
          : true;
      return isSelected;
    });

    return selectedVariants.reduce(
      (acc, variant) => {
        // Calcular CBM del tamaño si existe (asumiendo formato "LxWxH")
        let variantCBM = 0;
        if (variant.size) {
          const dimensions = variant.size.split('*').map((d: string) => parseFloat(d.trim()));
          if (dimensions.length === 3 && dimensions.every((d: number) => !isNaN(d))) {
            variantCBM = dimensions[0] * dimensions[1] * dimensions[2] / 1000000; // convertir a m3
          }
        }

        return {
          totalPrice:
            acc.totalPrice + (variant.price || 0) * (variant.quantity || 0),
          totalWeight: acc.totalWeight + (variant.weight || localProduct.packingList?.weightKg || 0),
          totalCBM: acc.totalCBM + (variantCBM > 0 ? variantCBM : (localProduct.packingList?.cbm || 0) / (localProduct.variants?.length || 1)) * (variant.quantity || 1),
          totalQuantity: acc.totalQuantity + (variant.quantity || 0),
          totalExpress:
            acc.totalExpress +
            (variant.priceExpress || 0) * (variant.quantity || 0),
        };
      },
      {
        totalPrice: 0,
        totalWeight: 0,
        totalCBM: 0,
        totalQuantity: 0,
        totalExpress: 0,
      }
    );
  }, [
    localProduct.variants,
    productVariants,
    localProduct.packingList?.weightKg,
    localProduct.packingList?.cbm,
    localProduct.quantityTotal,
  ]);

  // Usar ref para evitar llamadas innecesarias
  const previousAggregatedDataRef = useRef<{
    totalPrice: number;
    totalWeight: number;
    totalCBM: number;
    totalQuantity: number;
    totalExpress: number;
  } | null>(null);

  // Notificar al padre cuando cambien los datos agregados
  useEffect(() => {
    if (onAggregatedDataChange) {
      const current = JSON.stringify(aggregatedData);
      const previous = JSON.stringify(previousAggregatedDataRef.current);

      if (current !== previous) {
        onAggregatedDataChange(product.productId, aggregatedData);
        previousAggregatedDataRef.current = aggregatedData;
      }
    }
  }, [aggregatedData, product.productId, onAggregatedDataChange]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleProductQuotationToggle = (checked: boolean) => {
    if (onProductQuotationToggle) {
      onProductQuotationToggle(product.productId, checked);
    }
  };

  const handleVariantQuotationToggle = (
    variantId: string,
    checked: boolean
  ) => {
    if (onVariantQuotationToggle) {
      onVariantQuotationToggle(product.productId, variantId, checked);
    }
  };

  const handleOpenImages = (
    images: Array<{ id: string; url: string; name?: string }>,
    startIndex: number = 0
  ) => {
    setSelectedImages(images);
    setIsImageModalOpen(true);
  };

  const handleSaveComment = () => {
    if (onProductUpdate) {
      onProductUpdate(product.productId, { adminComment });
    }
    setIsCommentModalOpen(false);
  };

  // Función para manejar cambios en campos básicos del producto
  // const handleProductFieldChange = (field: string, value: number | string) => {
  //   setLocalProduct((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  //   if (onProductUpdate) {
  //     onProductUpdate(product.productId, { [field]: value });
  //   }
  // };

  // Función específica para manejar cambios en packing list
  const handlePackingListChange = (field: keyof PackingList, value: number) => {
    setLocalProduct((prev) => ({
      ...prev,
      packingList: {
        ...prev.packingList!,
        [field]: value,
        // Auto-calcular peso en toneladas cuando cambie el peso en kg
        ...(field === 'weightKg' ? { weightTon: value / 1000 } : {}),
      },
    }));

    // Notificar al padre
    if (onProductUpdate) {
      onProductUpdate(product.productId, {
        packingList: {
          ...localProduct.packingList!,
          [field]: value,
          ...(field === 'weightKg' ? { weightTon: value / 1000 } : {}),
        },
      });
    }
  };

  // Función para manejar cambios en manipulación de carga
  const handleCargoHandlingChange = (field: keyof CargoHandling, value: boolean) => {
    setLocalProduct((prev) => ({
      ...prev,
      cargoHandling: {
        ...prev.cargoHandling!,
        [field]: value,
      },
    }));

    // Notificar al padre
    if (onProductUpdate) {
      onProductUpdate(product.productId, {
        cargoHandling: {
          ...localProduct.cargoHandling!,
          [field]: value,
        },
      });
    }
  };

  // Función para manejar cambios en URL fantasma
  const handleGhostUrlChange = (value: string) => {
    setLocalProduct((prev) => ({
      ...prev,
      ghostUrl: value,
    }));

    // Notificar al padre
    if (onProductUpdate) {
      onProductUpdate(product.productId, { ghostUrl: value });
    }
  };

  const handleVariantFieldChange = (
    variantId: string,
    field: string,
    value: number | string
  ) => {
    // Actualizar estado local inmediatamente
    setLocalProduct((prev) => ({
      ...prev,
      variants: prev.variants?.map((variant) =>
        variant.variantId === variantId ? { ...variant, [field]: value } : variant
      ),
    }));

    // Notificar al padre
    if (onVariantUpdate) {
      onVariantUpdate(product.productId, variantId, { [field]: value });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header de la tabla */}
      <div className="grid grid-cols-9 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
        <div className="text-center">NRO.</div>
        <div>IMAGEN</div>
        <div>PRODUCTO & VARIANTES</div>
        <div>PACKING LIST</div>
        <div>MANIPULACIÓN DE CARGA</div>
        <div>URL</div>
        <div>PRECIO</div>
        <div>EXPRESS</div>
        <div>P. TOTAL</div>
      </div>

      {/* Fila del producto */}
      <div className="grid grid-cols-9 gap-4 p-4 items-start">
        {/* Columna 1: NRO. */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-lg font-bold text-gray-800">{index + 1}</div>
          <Checkbox
            checked={isProductSelected}
            onCheckedChange={handleProductQuotationToggle}
          />
        </div>

        {/* Columna 2: IMAGEN */}
        <div className="flex justify-center">
          {localProduct.attachments && localProduct.attachments.length > 0 ? (
            <div className="relative">
              <img
                src={localProduct.attachments[0] || "/placeholder.svg"}
                alt={localProduct.name}
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
                    localProduct.attachments?.map((url, index) => ({
                      id: index.toString(),
                      url,
                      name: `Imagen ${index + 1}`
                    })) || [],
                    0
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

        {/* Columna 3: PRODUCTO & VARIANTES */}
        <div className="min-w-0 space-y-2">
          <div>
            <h3 className="font-semibold text-gray-800 truncate">
              {localProduct.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {localProduct.quantityTotal} items
            </Badge>
          </div>
          
          {/* Botón para ver comentarios y URL */}
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
                  <p className="text-sm text-blue-600 break-all">{localProduct.url || 'No disponible'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Comentario:</label>
                  <p className="text-sm text-gray-600">{localProduct.comment || 'Sin comentarios'}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Botón para expandir variantes */}
          {localProduct.variants && localProduct.variants.length > 0 && (
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
              Variantes ({localProduct.variants.length})
            </Button>
          )}
        </div>

        {/* Columna 4: PACKING LIST */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">Nro. Cajas</label>
            <Input
              type="number"
              value={localProduct.packingList?.boxes || 0}
              onChange={(e) => handlePackingListChange('boxes', parseInt(e.target.value) || 0)}
              className="h-8 text-xs"
              min={0}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">CBM</label>
            <Input
              type="number"
              step="0.01"
              value={localProduct.packingList?.cbm || 0}
              onChange={(e) => handlePackingListChange('cbm', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs"
              min={0}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">PESO KG</label>
            <Input
              type="number"
              step="0.1"
              value={localProduct.packingList?.weightKg || 0}
              onChange={(e) => handlePackingListChange('weightKg', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs"
              min={0}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">PESO TON</label>
            <Input
              value={(localProduct.packingList?.weightTon || 0).toFixed(3)}
              readOnly
              className="h-8 text-xs bg-gray-50"
            />
          </div>
        </div>

        {/* Columna 5: MANIPULACIÓN DE CARGA */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`fragile-${product.productId}`}
              checked={localProduct.cargoHandling?.fragileProduct || false}
              onCheckedChange={(checked) => handleCargoHandlingChange('fragileProduct', checked as boolean)}
            />
            <label htmlFor={`fragile-${product.productId}`} className="text-xs text-gray-600">
              Producto Frágil
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`stackable-${product.productId}`}
              checked={localProduct.cargoHandling?.stackProduct || false}
              onCheckedChange={(checked) => handleCargoHandlingChange('stackProduct', checked as boolean)}
            />
            <label htmlFor={`stackable-${product.productId}`} className="text-xs text-gray-600">
              Producto Apilable
            </label>
          </div>
        </div>

        {/* Columna 6: URL */}
        <div className="space-y-2">
          <Input
            placeholder="URL fantasma..."
            value={localProduct.ghostUrl || ''}
            onChange={(e) => handleGhostUrlChange(e.target.value)}
            className="h-8 text-xs"
          />
          <Dialog
            open={isCommentModalOpen}
            onOpenChange={setIsCommentModalOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs w-full">
                <MessageSquare className="h-3 w-3 mr-1" />
                Comentario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Comentario del Administrador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Agregar comentario para: {localProduct.name}
                </p>
                <Textarea
                  placeholder="Escriba un comentario sobre este producto..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCommentModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveComment}>
                    Guardar Comentario
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Columna 7: PRECIO */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-green-600 border border-green-200 rounded px-2 py-1 bg-green-50">
            ${aggregatedData.totalPrice.toFixed(2)}
          </div>
        </div>

        {/* Columna 8: EXPRESS */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-blue-600 border border-blue-200 rounded px-2 py-1 bg-blue-50">
            ${aggregatedData.totalExpress.toFixed(2)}
          </div>
        </div>

        {/* Columna 9: P. TOTAL */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">USD</div>
          <div className="text-lg font-semibold text-emerald-600 border border-emerald-200 rounded px-2 py-1 bg-emerald-50">
            ${(aggregatedData.totalPrice + aggregatedData.totalExpress).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Expanded Variants */}
      {isExpanded &&
        localProduct.variants &&
        localProduct.variants.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="p-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3">
                Variantes del Producto
              </h4>

              {/* Tabla de variantes */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header de la tabla */}
                <div className="grid grid-cols-8 gap-4 p-3 bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-700">
                  <div className="text-center">Cotizar</div>
                  <div>Presentación</div>
                  <div>Modelo</div>
                  <div>Color</div>
                  <div>Tamaño</div>
                  <div className="text-orange-600">Cantidad</div>
                  <div className="text-green-600">Precio unitario</div>
                  <div className="text-blue-600">Express</div>
                </div>

                {/* Filas de variantes */}
                <div className="divide-y divide-gray-200">
                  {localProduct.variants.map((variant) => {
                    const isVariantSelected =
                      productVariants[variant.variantId] !== undefined
                        ? productVariants[variant.variantId]
                        : true;

                    return (
                      <div
                        key={variant.variantId}
                        className="grid grid-cols-8 gap-4 p-3 items-center text-sm"
                      >
                        {/* Checkbox para seleccionar */}
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isVariantSelected}
                            onCheckedChange={(checked) =>
                              handleVariantQuotationToggle(
                                variant.variantId,
                                checked as boolean
                              )
                            }
                          />
                        </div>

                        {/* Presentación */}
                        <div>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            {variant.presentation || 'N/A'}
                          </Badge>
                        </div>

                        {/* Modelo */}
                        <div>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 border-blue-200"
                          >
                            {variant.model || 'N/A'}
                          </Badge>
                        </div>

                        {/* Color */}
                        <div>
                          <Badge
                            variant="secondary"
                            className="bg-pink-100 text-pink-800 border-pink-200"
                          >
                            {variant.color || 'N/A'}
                          </Badge>
                        </div>

                        {/* Tamaño */}
                        <div>
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 border-purple-200"
                          >
                            {variant.size || 'N/A'}
                          </Badge>
                        </div>

                        {/* Cantidad */}
                        <div>
                          {isVariantSelected ? (
                            <EditableNumericField
                              value={variant.quantity || 0}
                              onChange={(value) =>
                                handleVariantFieldChange(
                                  variant.variantId,
                                  "quantity",
                                  value
                                )
                              }
                              decimalPlaces={0}
                              min={0}
                            />
                          ) : (
                            <span className="text-gray-500">
                              {variant.quantity || 0}
                            </span>
                          )}
                        </div>

                        {/* Precio unitario */}
                        <div>
                          {isVariantSelected ? (
                            <EditableNumericField
                              value={variant.price || 0}
                              onChange={(value) =>
                                handleVariantFieldChange(
                                  variant.variantId,
                                  "price",
                                  value
                                )
                              }
                              prefix="$"
                              decimalPlaces={2}
                            />
                          ) : (
                            <span className="text-gray-500">
                              ${(variant.price || 0).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Express */}
                        <div>
                          {isVariantSelected ? (
                            <EditableNumericField
                              value={variant.priceExpress || 0}
                              onChange={(value) =>
                                handleVariantFieldChange(
                                  variant.variantId,
                                  "priceExpress",
                                  value
                                )
                              }
                              prefix="$"
                              decimalPlaces={2}
                            />
                          ) : (
                            <span className="text-gray-500">
                              ${(variant.priceExpress || 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
        productName={localProduct.name}
      />
    </div>
  );
}
