import { useState, useEffect } from "react";
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

import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import ImageCarouselModal from "@/components/ImageCarouselModal";

interface ProductVariant {
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
}: QuotationProductRowProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<Array<{id: string, url: string, name?: string}>>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [adminComment, setAdminComment] = useState<string>(product.adminComment || "");

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
    if (onProductChange) {
      onProductChange(product.id, field, value);
    }
    if (onProductUpdate) {
      onProductUpdate(product.id, { [field]: value });
    }
  };

  const handleVariantFieldChange = (variantId: string, field: string, value: number | string) => {
    if (onVariantUpdate) {
      onVariantUpdate(product.id, variantId, { [field]: value });
    }
  };

  const isProductSelected = productQuotationState[product.id] || false;
  const productVariants = variantQuotationState[product.id] || {};

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
              {product.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span>Cantidad: {product.quantity}</span>
              <span>Precio: ${product.price?.toFixed(2) || '0.00'}</span>
              {product.weight && <span>Peso: {product.weight}kg</span>}
              {product.cbm && <span>CBM: {product.cbm}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {product.images && product.images.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenImages(product.images || [], 0)}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Ver Imágenes ({product.images.length})
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

          {product.variants && product.variants.length > 0 && (
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
              Variantes ({product.variants.length})
            </Button>
          )}
        </div>
      </div>

      {/* Campo de precio editable */}
      {isProductSelected && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Precio</Label>
            <EditableNumericField
              value={product.price || 0}
              onChange={(value) => handleProductFieldChange('price', value)}
              prefix="$"
              decimalPlaces={2}
            />
          </div>
          
          {product.weight !== undefined && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Peso (kg)</Label>
              <EditableNumericField
                value={product.weight}
                onChange={(value) => handleProductFieldChange('weight', value)}
                suffix="kg"
                decimalPlaces={2}
              />
            </div>
          )}

          {product.cbm !== undefined && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">CBM</Label>
              <EditableNumericField
                value={product.cbm}
                onChange={(value) => handleProductFieldChange('cbm', value)}
                suffix="m³"
                decimalPlaces={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Cantidad</Label>
            <Input
              type="number"
              value={product.quantity}
              onChange={(e) => handleProductFieldChange('quantity', Number(e.target.value))}
              min="0"
            />
          </div>
        </div>
      )}

      {/* Variantes expandidas */}
      {isExpanded && product.variants && product.variants.length > 0 && (
        <div className="mt-6 pl-6 border-l-2 border-gray-200 space-y-4">
          <h4 className="font-medium text-gray-700">Variantes del Producto</h4>
          {product.variants.map((variant, variantIndex) => (
            <div
              key={variant.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={productVariants[variant.id] || false}
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
              {productVariants[variant.id] && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Precio</Label>
                    <EditableNumericField
                      value={variant.price || 0}
                      onChange={(value) => handleVariantFieldChange(variant.id, 'price', value)}
                      prefix="$"
                      decimalPlaces={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cantidad</Label>
                    <Input
                      type="number"
                      value={variant.quantity}
                      onChange={(e) => 
                        handleVariantFieldChange(variant.id, 'quantity', Number(e.target.value))
                      }
                      min="0"
                    />
                  </div>

                  {variant.weight !== undefined && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Peso (kg)</Label>
                      <EditableNumericField
                        value={variant.weight}
                        onChange={(value) => handleVariantFieldChange(variant.id, 'weight', value)}
                        suffix="kg"
                        decimalPlaces={2}
                      />
                    </div>
                  )}

                  {variant.cbm !== undefined && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">CBM</Label>
                      <EditableNumericField
                        value={variant.cbm}
                        onChange={(value) => handleVariantFieldChange(variant.id, 'cbm', value)}
                        suffix="m³"
                        decimalPlaces={3}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
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