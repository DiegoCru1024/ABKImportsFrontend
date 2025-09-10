import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Eye,
  Link as LinkIcon,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  X,
  Package,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Main Product Row */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            {/* Product Checkbox */}
            <div className="flex-shrink-0">
              <Checkbox
                checked={isProductSelected}
                onCheckedChange={handleProductQuotationToggle}
              />
            </div>

            {/* Product Image */}
            <div className="flex-shrink-0">
              {localProduct.images && localProduct.images.length > 0 ? (
                <div className="relative">
                  <img
                    src={localProduct.images[0]?.url || "/placeholder.svg"}
                    alt={localProduct.name}
                    className="w-20 h-20 object-cover rounded-lg border border-border"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => handleOpenImages(localProduct.images || [], 0)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-heading text-lg font-bold text-foreground truncate">
                  {localProduct.name}
                </h3>
                {localProduct.variants && localProduct.variants.length > 0 && (
                  <Badge variant="secondary" className="font-body">
                    {localProduct.variants.length} variante{localProduct.variants.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-body">
                <div>
                  <span className="text-muted-foreground">Cantidad:</span>
                  <span className="ml-1 font-semibold">{aggregatedData.totalQuantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Precio:</span>
                  <span className="ml-1 font-semibold">${aggregatedData.totalPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="ml-1 font-semibold">{aggregatedData.totalWeight.toFixed(2)}kg</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CBM:</span>
                  <span className="ml-1 font-semibold">{aggregatedData.totalCBM.toFixed(3)}</span>
                </div>
              </div>
              {aggregatedData.totalExpress > 0 && (
                <div className="mt-2 text-sm font-body">
                  <span className="text-muted-foreground">Express:</span>
                  <span className="ml-1 font-semibold">${aggregatedData.totalExpress.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="font-body bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comentario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">Comentario del Administrador</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="font-body text-sm text-muted-foreground">
                      Agregar comentario para: {localProduct.name}
                    </p>
                    <Textarea
                      placeholder="Escriba un comentario sobre este producto..."
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      className="font-body"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        className="font-body bg-transparent"
                        onClick={() => setIsCommentModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="font-body"
                        onClick={handleSaveComment}
                      >
                        Guardar Comentario
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {localProduct.variants && localProduct.variants.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpanded}
                  className="font-body"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Variantes ({localProduct.variants.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Variants */}
        {isExpanded && localProduct.variants && localProduct.variants.length > 0 && (
          <div className="bg-muted/30">
            <div className="p-4">
              <h4 className="font-heading text-sm font-bold text-foreground mb-3">Variantes del Producto</h4>
              <div className="space-y-3">
                {localProduct.variants.map((variant) => {
                  const isVariantSelected = productVariants[variant.id] !== undefined ? productVariants[variant.id] : true;
                  return (
                    <div key={variant.id} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isVariantSelected}
                            onCheckedChange={(checked) => 
                              handleVariantQuotationToggle(variant.id, checked as boolean)
                            }
                          />
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="font-body font-semibold text-sm">
                            {variant.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-body text-xs">
                            Cantidad: {variant.quantity}
                          </Badge>
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
                      </div>

                      {/* Campos editables para variantes seleccionadas */}
                      {isVariantSelected && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-body">
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-muted-foreground mb-1">Precio Unitario</div>
                            <EditableNumericField
                              value={variant.price || 0}
                              onChange={(value) => handleVariantFieldChange(variant.id, 'price', value)}
                              prefix="$"
                              decimalPlaces={2}
                            />
                          </div>
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-muted-foreground mb-1">Precio Express</div>
                            <EditableNumericField
                              value={variant.priceExpress || 0}
                              onChange={(value) => handleVariantFieldChange(variant.id, 'priceExpress', value)}
                              prefix="$"
                              decimalPlaces={2}
                            />
                          </div>
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-muted-foreground mb-1">Cantidad</div>
                            <EditableNumericField
                              value={variant.quantity || 0}
                              onChange={(value) => 
                                handleVariantFieldChange(variant.id, 'quantity', value)
                              }
                              decimalPlaces={0}
                              min={0}
                            />
                          </div>
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-muted-foreground mb-1">Peso (kg)</div>
                            <EditableNumericField
                              value={variant.weight || 0}
                              onChange={(value) => handleVariantFieldChange(variant.id, 'weight', value)}
                              suffix="kg"
                              decimalPlaces={2}
                            />
                          </div>
                          <div className="bg-background rounded p-2 text-center">
                            <div className="text-muted-foreground mb-1">CBM</div>
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
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de imágenes */}
      <ImageCarouselModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        files={[]}
        attachments={selectedImages.map(img => img.url)}
        productName={localProduct.name}
      />
    </Card>
  );
}