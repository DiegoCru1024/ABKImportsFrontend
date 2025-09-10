import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Eye,
  Link as LinkIcon,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImageCarouselModal from "@/components/ImageCarouselModal";

interface ProductVariant {
  id: string;
  name: string;
  quantity: number;
  price: number;
  priceExpress?: number;
  weight?: number;
  cbm?: number;
  images?: Array<{
    id: string;
    url: string;
    name?: string;
  }>;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  weight?: number;
  cbm?: number;
  images?: Array<{
    id: string;
    url: string;
    name?: string;
  }>;
  variants?: ProductVariant[];
  adminComment?: string;
}

interface QuotationProductRowProps {
  product: Product;
  index: number;
  quotationDetail?: any;
  onProductChange?: (productId: string, field: string, value: number | string) => void;
  editableProducts?: Product[];
  productQuotationState?: Record<string, boolean>;
  variantQuotationState?: Record<string, Record<string, boolean>>;
  onProductQuotationToggle?: (productId: string, checked: boolean) => void;
  onVariantQuotationToggle?: (productId: string, variantId: string, checked: boolean) => void;
  onProductUpdate?: (productId: string, updates: Partial<Product>) => void;
  onVariantUpdate?: (productId: string, variantId: string, updates: Partial<ProductVariant>) => void;
  onAggregatedDataChange?: (productId: string, aggregatedData: {
    totalPrice: number;
    totalWeight: number;
    totalCBM: number;
    totalQuantity: number;
    totalExpress: number;
  }) => void;
}

export default function QuotationProductRow({
  product,
  index,
  quotationDetail,
  onProductChange,
  editableProducts = [],
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
  const [selectedImages, setSelectedImages] = useState<Array<{id: string, url: string, name?: string}>>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [adminComment, setAdminComment] = useState<string>(product.adminComment || "");
  
  // Estado local para los valores del producto
  const [localProduct, setLocalProduct] = useState<Product>(product);
  
  // Solo actualizar el estado local si hay cambios significativos desde el padre
  // y no estamos en medio de una edición
  useEffect(() => {
    // Comparar solo propiedades clave para evitar actualizaciones innecesarias
    const hasSignificantChange = (
      product.id !== localProduct.id ||
      product.name !== localProduct.name ||
      (product.variants && localProduct.variants && product.variants.length !== localProduct.variants.length)
    );
    
    if (hasSignificantChange) {
      setLocalProduct(product);
    }
  }, [product.id, product.name, product.variants?.length]);

  // Definir productVariants antes de usarlo en useMemo
  const isProductSelected = productQuotationState[product.id] !== undefined ? productQuotationState[product.id] : true;
  const productVariants = variantQuotationState[product.id] || {};

  // Cálculos dinámicos agregados de las variantes
  const aggregatedData = useMemo(() => {
    if (!localProduct.variants) {
      return {
        totalPrice: localProduct.price || 0,
        totalWeight: localProduct.weight || 0,
        totalCBM: localProduct.cbm || 0,
        totalQuantity: localProduct.quantity || 0,
        totalExpress: 0
      };
    }

    const selectedVariants = localProduct.variants.filter(variant => {
      const isSelected = productVariants[variant.id] !== undefined ? productVariants[variant.id] : true;
      return isSelected;
    });

    return selectedVariants.reduce(
      (acc, variant) => ({
        totalPrice: acc.totalPrice + ((variant.price || 0) * (variant.quantity || 0)),
        totalWeight: acc.totalWeight + (variant.weight || 0),
        totalCBM: acc.totalCBM + (variant.cbm || 0),
        totalQuantity: acc.totalQuantity + (variant.quantity || 0),
        totalExpress: acc.totalExpress + ((variant.priceExpress || 0) * (variant.quantity || 0))
      }),
      { totalPrice: 0, totalWeight: 0, totalCBM: 0, totalQuantity: 0, totalExpress: 0 }
    );
  }, [localProduct.variants, productVariants, localProduct.price, localProduct.weight, localProduct.cbm, localProduct.quantity]);

  // Usar ref para evitar llamadas innecesarias
  const previousAggregatedDataRef = useRef<any>(null);
  
  // Notificar al padre cuando cambien los datos agregados
  useEffect(() => {
    if (onAggregatedDataChange) {
      const current = JSON.stringify(aggregatedData);
      const previous = JSON.stringify(previousAggregatedDataRef.current);
      
      if (current !== previous) {
        onAggregatedDataChange(product.id, aggregatedData);
        previousAggregatedDataRef.current = aggregatedData;
      }
    }
  }, [aggregatedData, product.id]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleProductQuotationToggle = (checked: boolean) => {
    if (onProductQuotationToggle) {
      onProductQuotationToggle(product.id, checked);
    }
  };

  const handleVariantQuotationToggle = (variantId: string, checked: boolean) => {
    if (onVariantQuotationToggle) {
      onVariantQuotationToggle(product.id, variantId, checked);
    }
  };

  const handleOpenImages = (images: Array<{id: string, url: string, name?: string}>, startIndex: number = 0) => {
    setSelectedImages(images);
    setCurrentImageIndex(startIndex);
    setIsImageModalOpen(true);
  };

  const handleSaveComment = () => {
    if (onProductUpdate) {
      onProductUpdate(product.id, { adminComment });
    }
    setIsCommentModalOpen(false);
  };

  const handleProductFieldChange = (field: string, value: number | string) => {
    // Actualizar estado local inmediatamente
    setLocalProduct(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Notificar al padre
    if (onProductChange) {
      onProductChange(product.id, field, value);
    }
    if (onProductUpdate) {
      onProductUpdate(product.id, { [field]: value });
    }
  };

  const handleVariantFieldChange = (variantId: string, field: string, value: number | string) => {
    // Actualizar estado local inmediatamente
    setLocalProduct(prev => ({
      ...prev,
      variants: prev.variants?.map(variant =>
        variant.id === variantId
          ? { ...variant, [field]: value }
          : variant
      )
    }));
    
    // Notificar al padre
    if (onVariantUpdate) {
      onVariantUpdate(product.id, variantId, { [field]: value });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isProductSelected}
            onCheckedChange={handleProductQuotationToggle}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {localProduct.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span>Cantidad: {aggregatedData.totalQuantity}</span>
              <span>Precio: ${aggregatedData.totalPrice.toFixed(2)}</span>
              <span>Peso: {aggregatedData.totalWeight.toFixed(2)}kg</span>
              <span>CBM: {aggregatedData.totalCBM.toFixed(3)}</span>
              {aggregatedData.totalExpress > 0 && <span>Express: ${aggregatedData.totalExpress.toFixed(2)}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {localProduct.images && localProduct.images.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenImages(localProduct.images || [], 0)}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Ver Imágenes ({localProduct.images.length})
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCommentModalOpen(true)}
            className="flex items-center gap-1"
          >
            <MessageSquare className="w-4 h-4" />
            Comentario
          </Button>

          {localProduct.variants && localProduct.variants.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleExpanded}
              className="flex items-center gap-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Variantes ({localProduct.variants.length})
            </Button>
          )}
        </div>
      </div>

      {/* Campo de precio editable */}
      {isProductSelected && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Precio Total</Label>
            <div className="p-3 bg-gray-50 border rounded-lg">
              <span className="text-lg font-semibold text-gray-900">
                ${aggregatedData.totalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                (Suma de variantes)
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Peso Total (kg)</Label>
            <div className="p-3 bg-gray-50 border rounded-lg">
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.totalWeight.toFixed(2)} kg
              </span>
              <span className="text-sm text-gray-500 ml-2">
                (Suma de variantes)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">CBM Total</Label>
            <div className="p-3 bg-gray-50 border rounded-lg">
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.totalCBM.toFixed(3)} m³
              </span>
              <span className="text-sm text-gray-500 ml-2">
                (Suma de variantes)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Cantidad Total</Label>
            <div className="p-3 bg-gray-50 border rounded-lg">
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.totalQuantity}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                (Suma de variantes)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Variantes expandidas */}
      {isExpanded && localProduct.variants && localProduct.variants.length > 0 && (
        <div className="mt-6 pl-6 border-l-2 border-gray-200 space-y-4">
          <h4 className="font-medium text-gray-700">Variantes del Producto</h4>
          {localProduct.variants.map((variant, variantIndex) => {
            const isVariantSelected = productVariants[variant.id] !== undefined ? productVariants[variant.id] : true;
            return (
            <div
              key={variant.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isVariantSelected}
                    onCheckedChange={(checked) => 
                      handleVariantQuotationToggle(variant.id, checked as boolean)
                    }
                  />
                  <div>
                    <h5 className="font-medium text-gray-800">
                      {variant.name}
                    </h5>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>Cantidad: {variant.quantity}</span>
                      <span>Precio: ${variant.price?.toFixed(2) || '0.00'}</span>
                      <span>Express: ${variant.priceExpress?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {variant.images && variant.images.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenImages(variant.images || [], 0)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Ver ({variant.images.length})
                  </Button>
                )}
              </div>

              {/* Campos editables para variantes seleccionadas */}
              {isVariantSelected && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Precio Unitario</Label>
                    <EditableNumericField
                      value={variant.price || 0}
                      onChange={(value) => handleVariantFieldChange(variant.id, 'price', value)}
                      prefix="$"
                      decimalPlaces={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Precio Express</Label>
                    <EditableNumericField
                      value={variant.priceExpress || 0}
                      onChange={(value) => handleVariantFieldChange(variant.id, 'priceExpress', value)}
                      prefix="$"
                      decimalPlaces={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cantidad</Label>
                    <EditableNumericField
                      value={variant.quantity || 0}
                      onChange={(value) => 
                        handleVariantFieldChange(variant.id, 'quantity', value)
                      }
                      decimalPlaces={0}
                      min={0}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Peso (kg)</Label>
                    <EditableNumericField
                      value={variant.weight || 0}
                      onChange={(value) => handleVariantFieldChange(variant.id, 'weight', value)}
                      suffix="kg"
                      decimalPlaces={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CBM</Label>
                    <EditableNumericField
                      value={variant.cbm || 0}
                      onChange={(value) => handleVariantFieldChange(variant.id, 'cbm', value)}
                      suffix="m³"
                      decimalPlaces={3}
                    />
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Modal de comentario */}
      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Comentario del Administrador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Agregar comentario para: {product.name}</Label>
              <Textarea
                id="comment"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Escriba un comentario sobre este producto..."
                rows={4}
              />
            </div>
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

      {/* Modal de imágenes */}
      <ImageCarouselModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        files={[]}
        attachments={selectedImages.map(img => img.url)}
        productName={product.name}
      />
    </div>
  );
}