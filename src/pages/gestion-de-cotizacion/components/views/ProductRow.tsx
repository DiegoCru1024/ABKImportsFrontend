import React, { useState } from "react";
import { 
  Eye, 
  Link as LinkIcon, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import ImageCarouselModal from "@/components/ImageCarouselModal";
import { Label } from "@/components/ui/label";

interface ProductRowProps {
  product: any;
  index: number;
  quotationDetail: any;
  onProductChange: (productId: string, field: string, value: number) => void;
  editableProducts: any[];
}

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  index,
  quotationDetail,
  onProductChange,
  editableProducts
}) => {
  const [showVariants, setShowVariants] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showAdminCommentModal, setShowAdminCommentModal] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [ghostUrl, setGhostUrl] = useState("");
  const [isFragile, setIsFragile] = useState(false);
  const [isStackable, setIsStackable] = useState(false);
  const [loadType, setLoadType] = useState("GENERAL");
  
  // Estado local para manejar las variantes
  const [variantsData, setVariantsData] = useState(() => {
    const initialVariants = (product.variants || []).map((variant: any, idx: number) => ({
      ...variant,
      price: variant.price || 0,
      express: variant.express || 0
    }));
    return initialVariants;
  });

  const editableProduct = editableProducts.find(p => p.id === product.id);
  const variants = variantsData;
  const hasMultipleVariants = variants.length > 1;

  // Debug: Ver qué datos tiene el producto
  console.log("ProductRow - Product data:", {
    id: product.id,
    name: product.name,
    attachments: product.attachments,
    hasAttachments: product.attachments && product.attachments.length > 0
  });

  // Calcular totales
  const totalQuantity = variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0);
  const totalExpress = variants.reduce((sum: number, v: any) => sum + (v.express || 0), 0);
  const totalPrice = variants.reduce((sum: number, v: any) => sum + (v.price || 0), 0);

  // Función para manejar cambios en las variantes
  const handleVariantChange = (variantIndex: number, field: string, value: number) => {
    setVariantsData((prev: any[]) => 
      prev.map((variant: any, idx: number) => 
        idx === variantIndex ? { ...variant, [field]: value } : variant
      )
    );
    
    // También notificar al componente padre
    onProductChange(product.id, `variant_${variantIndex}_${field}`, value);
  };

  return (
    <>
      {/* Fila principal del producto */}
      <tr className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
        <td className="p-4 py-6">
          <div className="w-8 h-8 flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </div>
        </td>

        {/* Columna Imagen */}
        <td className="p-4 py-6">
          <div className="space-y-2">
            <div className="relative w-16 h-16 bg-gray-100 border-2 border-gray-200 rounded-xl overflow-hidden group">
              {product.attachments && product.attachments.length > 0 ? (
                <>
                  <img
                    src={product.attachments[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                      onClick={() => setShowImageModal(true)}
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-xs">Sin imagen</span>
                </div>
              )}
            </div>

            {/* URL del producto */}
            {product.url && (
              <div className="flex items-center gap-2">
                <Badge className="text-xs font-medium text-green-800 bg-green-50 border border-green-200">
                  URL
                </Badge>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate"
                >
                  Ver link
                </a>
              </div>
            )}

            {/* Comentario del Cliente */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
              onClick={() => setShowCommentModal(true)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </td>

        {/* Columna Producto */}
        <td className="p-4 py-6">
          <div className="space-y-3">
            <div className="font-semibold text-gray-900">{product.name}</div>
            
            {/* Si tiene múltiples variantes, mostrar resumen */}
            {hasMultipleVariants ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                    Total: {totalQuantity} unidades
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVariants(!showVariants)}
                    className="h-6 w-6 p-0"
                  >
                    {showVariants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              /* Si tiene una sola variante, mostrar detalles directamente */
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                    Cantidad
                  </Badge>
                  <span className="font-medium">{totalQuantity}</span>
                </div>
                {variants[0]?.model && (
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200">
                      Modelo
                    </Badge>
                    <span className="font-medium">{variants[0].model}</span>
                  </div>
                )}
                {variants[0]?.color && (
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                      Color
                    </Badge>
                    <Badge variant="secondary" className="uppercase text-xs">
                      {variants[0].color}
                    </Badge>
                  </div>
                )}
                {variants[0]?.size && (
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200">
                      Tamaño
                    </Badge>
                    <span className="font-medium">{variants[0].size}</span>
                  </div>
                )}
                {variants[0]?.presentation && (
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200">
                      Presentación
                    </Badge>
                    <span className="font-medium">{variants[0].presentation}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </td>

        {/* Columna Packing List */}
        <td className="p-4">
          <div className="space-y-2 grid grid-cols-2 gap-2">

            <div className="flex flex-col items-center gap-2">
              <Badge className="text-xs font-medium text-red-800 bg-red-50 border border-red-200">
                Nro. Cajas
              </Badge>
              <div className="w-16">
                <Input
                  type="number"
                  value={editableProduct?.boxes || 0}
                  onChange={(e) => onProductChange(product.id, "boxes", Number(e.target.value))}
                  className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Badge className="text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200">
                CBM
              </Badge>
              <div className="w-16">
                <Input
                  type="number"
                  value={editableProduct?.cbm || 0}
                  onChange={(e) => onProductChange(product.id, "cbm", Number(e.target.value))}
                  className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Badge className="text-xs font-medium text-green-800 bg-green-50 border border-green-200">
                PESO KG
              </Badge>
              <div className="w-16">
                <Input
                  type="number"
                  value={editableProduct?.weight || 0}
                  onChange={(e) => onProductChange(product.id, "weight", Number(e.target.value))}
                  className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Badge className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200">
                PESO TON
              </Badge>
              <div className="w-16">
                <Input
                  type="number"
                  value={(editableProduct?.weight || 0) / 1000}
                  onChange={(e) => onProductChange(product.id, "weight", Number(e.target.value) * 1000)}
                  className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </td>

        {/* Columna Manipulación de Carga */}
        <td className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`fragile-${product.id}`}
                checked={isFragile}
                onCheckedChange={(checked) => setIsFragile(checked as boolean)}
              />
              <Label htmlFor={`fragile-${product.id}`} className="text-sm font-medium text-gray-700">
                Producto Frágil
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`stackable-${product.id}`}
                checked={isStackable}
                onCheckedChange={(checked) => setIsStackable(checked as boolean)}
              />
              <Label htmlFor={`stackable-${product.id}`} className="text-sm font-medium text-gray-700">
                Producto Apilable
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tipo de Carga</Label>
              <Select value={loadType} onValueChange={setLoadType}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">GENERAL</SelectItem>
                  <SelectItem value="IMO">IMO</SelectItem>
                  <SelectItem value="MIXTA">MIXTA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </td>

        {/* Columna URL Fantasma */}
        <td className="p-4">
          <div className="space-y-2">
            <Input
              placeholder="URL fantasma..."
              value={ghostUrl}
              onChange={(e) => setGhostUrl(e.target.value)}
              className="h-8 text-xs"
            />
            {ghostUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => window.open(ghostUrl, '_blank')}
              >
                <LinkIcon className="h-3 w-3 mr-1" />
                Ver link
              </Button>
            )}
          </div>
        </td>

        {/* Columna Precio */}
        <td className="p-4">
          <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-200/50 flex items-center flex-col justify-center">
            <div className="text-xs font-medium text-blue-600 mb-1">USD</div>
            <Input
              type="number"
              value={editableProduct?.price || 0}
              onChange={(e) => onProductChange(product.id, "price", Number(e.target.value))}
              className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
              placeholder="0"
            />
          </div>
        </td>

        {/* Columna Express */}
        <td className="p-4">
          <div className="bg-orange-50/80 rounded-lg p-3 border border-orange-200/50 flex items-center flex-col justify-center">
            <div className="text-xs font-medium text-orange-600 mb-1">USD</div>
            <Input
              type="number"
              value={editableProduct?.express || 0}
              onChange={(e) => onProductChange(product.id, "express", Number(e.target.value))}
              className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
              placeholder="0"
            />
          </div>
        </td>

        {/* Columna Total */}
        <td className="p-4">
          <div className="bg-green-50/80 rounded-lg p-3 border border-green-200/50 flex items-center flex-col justify-center">
            <div className="text-xs font-medium text-green-600 mb-1">USD</div>
            <div className="text-xl font-bold text-green-800">
              {((editableProduct?.price || 0) + (editableProduct?.express || 0)).toFixed(2)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mt-1 text-gray-600 hover:text-gray-800"
              onClick={() => setShowAdminCommentModal(true)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>

      {/* Filas de variantes (si hay múltiples variantes y están expandidas) */}
      {hasMultipleVariants && showVariants && (
        <tr>
          <td colSpan={9} className="p-0">
            <div className="bg-gray-50 border-t">
              {/* Variants Header */}
              <div className="grid grid-cols-8 gap-2 p-3 bg-gray-100 text-xs font-semibold text-gray-600">
                <div className="text-center">Presentación</div>
                <div className="text-center">Modelo</div>
                <div className="text-center">Color</div>
                <div className="text-center">Tamaño</div>
                <div className="text-center text-orange-500">Cantidad</div>
                <div className="text-center">Express</div>
                <div className="text-center text-green-600">$Precio Unitario</div>
                <div></div>
              </div>

              {/* Variants Rows */}
              {variants.map((variant: any, variantIndex: number) => (
                <div
                  key={variant.id}
                  className="grid grid-cols-8 gap-2 p-3 items-center border-b border-gray-200 last:border-b-0"
                >
                  <div className="text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                      {variant.presentation || "PACK"}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                      {variant.model || "UNICO"}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-red-100 text-red-800 text-xs">
                      {variant.color || "ROJO"}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                      {variant.size || "7*7CM"}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-8 bg-white border rounded flex items-center justify-center mx-auto">
                      <span className="text-sm font-medium">{variantIndex + 1}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-8 bg-white border rounded flex items-center justify-center mx-auto">
                      <Input
                        type="number"
                        value={variant.express || 0}
                        onChange={(e) => handleVariantChange(variantIndex, "express", Number(e.target.value))}
                        className="text-center font-semibold px-3 py-1 w-full h-9 text-sm border-0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-8 bg-white border rounded flex items-center justify-center mx-auto">
                      <Input
                        type="number"
                        value={variant.price || 0}
                        onChange={(e) => handleVariantChange(variantIndex, "price", Number(e.target.value))}
                        className="text-center font-semibold px-3 py-1 w-full h-9 text-sm border-0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div></div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}

      {/* Modales */}
      <ImageCarouselModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        files={[]}
        attachments={product.attachments || []}
        productName={product.name}
      />

      {/* Dialog para mostrar comentario del cliente */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Comentario del Cliente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {product.comment ? (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 leading-relaxed">
                  {product.comment}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  No hay comentario del cliente para este producto.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para comentario del administrador */}
      <Dialog open={showAdminCommentModal} onOpenChange={setShowAdminCommentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Comentario del Administrador
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Agregar comentario del administrador:
              </label>
              <Textarea
                placeholder="Escriba aquí el comentario del administrador..."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="w-full h-24 resize-none"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdminCommentModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  // Aquí puedes agregar la lógica para guardar el comentario
                  console.log("Comentario del administrador guardado:", adminComment);
                  setShowAdminCommentModal(false);
                }}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductRow;
