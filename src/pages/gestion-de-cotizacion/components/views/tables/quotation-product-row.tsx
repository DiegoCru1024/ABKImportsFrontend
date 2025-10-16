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

  // Sincronizar adminComment cuando cambie desde el padre
  useEffect(() => {
    if (product.adminComment !== undefined && product.adminComment !== adminComment) {
      setAdminComment(product.adminComment);
    }
  }, [product.adminComment]);

  // Estado local para los valores del producto con valores extendidos para vista pendiente
  const [localProduct, setLocalProduct] = useState<
    Product & {
      packingList?: PackingList;
      cargoHandling?: CargoHandling;
      ghostUrl?: string;
    }
  >({
    ...product,
    packingList: product.packingList || {
      boxes: product.number_of_boxes || 0,
      cbm: parseFloat(product.volume) || 0,
      weightKg: parseFloat(product.weight) || 0,
      weightTon: (parseFloat(product.weight) || 0) / 1000,
    },
    cargoHandling: product.cargoHandling || {
      fragileProduct: false,
      stackProduct: false,
    },
    ghostUrl: product.ghostUrl || product.url || "",
  });

  // Solo actualizar el estado local si hay cambios significativos desde el padre
  // Removemos las dependencias de valores que pueden cambiar sin ser "significativos"
  useEffect(() => {
    const hasSignificantChange =
      product.productId !== localProduct.productId ||
      product.name !== localProduct.name ||
      product.attachments !== localProduct.attachments ||
      (product.variants &&
        localProduct.variants &&
        product.variants.length !== localProduct.variants.length);

    if (hasSignificantChange) {
      setLocalProduct((prev) => ({
        ...product,
        // SIEMPRE preservar packingList existente si ya fue editado
        packingList: prev.packingList?.boxes !== product.number_of_boxes ||
                     prev.packingList?.cbm !== parseFloat(product.volume) ||
                     prev.packingList?.weightKg !== parseFloat(product.weight)
          ? prev.packingList // Si ya fue editado, mantener los valores editados
          : product.packingList || {
              boxes: product.number_of_boxes || 0,
              cbm: parseFloat(product.volume) || 0,
              weightKg: parseFloat(product.weight) || 0,
              weightTon: (parseFloat(product.weight) || 0) / 1000,
            },
        // Preservar cargoHandling - priorizar el del producto si existe
        cargoHandling: product.cargoHandling || prev.cargoHandling || {
          fragileProduct: false,
          stackProduct: false,
        },
        // Preservar ghostUrl existente si ya fue editado
        ghostUrl: product.ghostUrl || prev.ghostUrl || product.url || "",
      }));
    }
  }, [
    product.productId,
    product.name,
    product.attachments,
    product.variants,
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

    // IMPORTANTE: En la vista Pendiente, los totales de CBM y Peso vienen del packingList del producto
    // Solo los precios (price y priceExpress) deben sumarse desde las variantes
    const priceData = selectedVariants.reduce(
      (acc, variant) => ({
        totalPrice:
          acc.totalPrice + (variant.price || 0) * (variant.quantity || 0),
        totalQuantity: acc.totalQuantity + (variant.quantity || 0),
        totalExpress: acc.totalExpress + (variant.priceExpress || 0) * (variant.quantity || 0),
      }),
      {
        totalPrice: 0,
        totalQuantity: 0,
        totalExpress: 0,
      }
    );

    // Retornar con los valores del packingList para CBM y Weight (no se calculan desde variantes)
    return {
      totalPrice: priceData.totalPrice,
      totalWeight: localProduct.packingList?.weightKg || 0,
      totalCBM: localProduct.packingList?.cbm || 0,
      totalQuantity: priceData.totalQuantity,
      totalExpress: priceData.totalExpress,
    };
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
      // Enviar todos los datos actuales del producto local para evitar que se pierdan
      onProductUpdate(product.productId, {
        adminComment,
        packingList: localProduct.packingList,
        cargoHandling: localProduct.cargoHandling,
        ghostUrl: localProduct.ghostUrl,
      });
    }
    setIsCommentModalOpen(false);
  };

  // Función específica para manejar cambios en packing list
  const handlePackingListChange = (field: keyof PackingList, value: number) => {
    setLocalProduct((prev) => ({
      ...prev,
      packingList: {
        ...prev.packingList!,
        [field]: value,
        // Auto-calcular peso en toneladas cuando cambie el peso en kg
        ...(field === "weightKg" ? { weightTon: value / 1000 } : {}),
      },
    }));

    // Notificar al padre
    if (onProductUpdate) {
      onProductUpdate(product.productId, {
        packingList: {
          ...localProduct.packingList!,
          [field]: value,
          ...(field === "weightKg" ? { weightTon: value / 1000 } : {}),
        },
      });
    }
  };

  // Función para manejar cambios en manipulación de carga
  const handleCargoHandlingChange = (
    field: keyof CargoHandling,
    value: boolean
  ) => {
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
        variant.variantId === variantId
          ? { ...variant, [field]: value }
          : variant
      ),
    }));

    // Notificar al padre
    if (onVariantUpdate) {
      onVariantUpdate(product.productId, variantId, { [field]: value });
    }
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
              URL FANSTAMA
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
              <div className="flex flex-col items-center space-y-2">
                <div className="text-lg font-bold text-gray-800">
                  {index + 1}
                </div>
                <Checkbox
                  checked={isProductSelected}
                  onCheckedChange={handleProductQuotationToggle}
                />
              </div>
            </td>

            {/* Columna 2: IMAGEN */}
            <td className="p-3 text-center align-top border-r border-blue-200/30 w-24">
              {localProduct.attachments &&
              localProduct.attachments.length > 0 ? (
                <div className="flex flex-col">
                  <div
                    className="relative"
                    onClick={() =>
                      handleOpenImages(
                        localProduct.attachments?.map((url, index) => ({
                          id: index.toString(),
                          url,
                          name: `Imagen ${index + 1}`,
                        })) || [],
                        0
                      )
                    }
                  >
                    <img
                      src={localProduct.attachments[0] || "/placeholder.svg"}
                      alt={localProduct.name}
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
                      href={localProduct.url}
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
                    {localProduct.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {localProduct.quantityTotal} items
                  </Badge>
                </div>

                {/* Botón para expandir variantes */}
                {localProduct.variants && localProduct.variants.length > 0 && (
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
                    Variantes ({localProduct.variants.length})
                  </Button>
                )}
              </div>
            </td>

            {/* Columna 4: PACKING LIST */}
            <td className="p-3 align-top border-r border-blue-200/30 w-40">
              <div className="grid grid-cols-2  text-xs gap-4">
                <div>
                  <Badge className="bg-red-100 text-red-600 border-1 border-red-200 mb-2">
                    Nro. Cajas
                  </Badge>

                  <Input
                    type="number"
                    value={localProduct.packingList?.boxes || 0}
                    onChange={(e) =>
                      handlePackingListChange(
                        "boxes",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="h-7 text-xs"
                    min={0}
                  />
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-600 border-1 border-blue-200 mb-2">
                    CBM
                  </Badge>

                  <Input
                    type="number"
                    step="0.01"
                    value={localProduct.packingList?.cbm || 0}
                    onChange={(e) =>
                      handlePackingListChange(
                        "cbm",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="h-7 text-xs"
                    min={0}
                  />
                </div>
                <div>
                  <Badge className="bg-green-100 text-green-600 border-1 border-green-200 mb-2">
                    PESO KG
                  </Badge>

                  <Input
                    type="number"
                    step="0.1"
                    value={localProduct.packingList?.weightKg || 0}
                    onChange={(e) =>
                      handlePackingListChange(
                        "weightKg",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="h-7 text-xs"
                    min={0}
                  />
                </div>
                <div>
                  <Badge className="bg-purple-100 text-purple-600 border-1 border-purple-200 mb-2">
                    PESO TON
                  </Badge>

                  <Input
                    value={(localProduct.packingList?.weightTon || 0).toFixed(
                      3
                    )}
                    readOnly
                    className="h-7 text-xs bg-gray-50"
                  />
                </div>
              </div>
            </td>

            {/* Columna 5: MANIPULACIÓN DE CARGA */}
            <td className="p-3 align-top border-r border-blue-200/30 w-44">
              <div className="space-y-4 ">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`fragile-${product.productId}`}
                    checked={
                      localProduct.cargoHandling?.fragileProduct || false
                    }
                    onCheckedChange={(checked) =>
                      handleCargoHandlingChange(
                        "fragileProduct",
                        checked as boolean
                      )
                    }
                  />
                  <label
                    htmlFor={`fragile-${product.productId}`}
                    className="text-sm  text-gray-600"
                  >
                    Producto Frágil
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`stackable-${product.productId}`}
                    checked={localProduct.cargoHandling?.stackProduct || false}
                    onCheckedChange={(checked) =>
                      handleCargoHandlingChange(
                        "stackProduct",
                        checked as boolean
                      )
                    }
                  />
                  <label
                    htmlFor={`stackable-${product.productId}`}
                    className="text-sm text-gray-600"
                  >
                    Producto Apilable
                  </label>
                </div>
              </div>
            </td>

            {/* Columna 6: URL */}
            <td className="p-3 align-top border-r border-blue-200/30 w-40">
              <div className="space-y-2">
                <Input
                  placeholder="URL fantasma..."
                  onChange={(e) => handleGhostUrlChange(e.target.value)}
                  className="h-8 text-xs"
                />
                   {/* Botón para ver comentarios y URL */}
                   <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <MessageSquare className="h-3 w-3 " /> Comentario  cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Comentario del cliente: </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-lg text-gray-600">
                          {localProduct.comment || "Sin comentarios"}
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                 {/* Comentario del administrador */}
                <Dialog
                  open={isCommentModalOpen}
                  onOpenChange={setIsCommentModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Comentario Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Comentario  Administrador</DialogTitle>
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
            </td>

            {/* Columna 7: PRECIO */}
            <td className="p-3 text-center align-top border-r border-blue-200/30 w-28">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-emerald-700 border border-emerald-300/50 rounded-lg px-2 py-1 bg-emerald-100/50">
                ${aggregatedData.totalPrice.toFixed(2)}
              </div>
            </td>

            {/* Columna 8: EXPRESS */}
            <td className="p-3 text-center align-top border-r border-blue-200/30 w-28">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-blue-700 border border-blue-300/50 rounded-lg px-2 py-1 bg-blue-100/50">
                ${aggregatedData.totalExpress.toFixed(2)}
              </div>
            </td>

            {/* Columna 9: P. TOTAL */}
            <td className="p-3 text-center align-top w-28">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-indigo-700 border border-indigo-300/50 rounded-lg px-2 py-1 bg-indigo-100/50">
                $
                {(
                  aggregatedData.totalPrice + aggregatedData.totalExpress
                ).toFixed(2)}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Expanded Variants */}
      {isExpanded &&
        localProduct.variants &&
        localProduct.variants.length > 0 && (
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
                      <th className="p-3 text-center text-xs font-semibold text-purple-800 border-r border-purple-200/30 w-16">
                        Cotizar
                      </th>
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
                    {localProduct.variants.map((variant) => {
                      const isVariantSelected =
                        productVariants[variant.variantId] !== undefined
                          ? productVariants[variant.variantId]
                          : true;

                      return (
                        <tr key={variant.variantId} className="text-sm">
                          {/* Checkbox para seleccionar */}
                          <td className="p-3 text-center border-r border-purple-200/30 w-16">
                            <Checkbox
                              checked={isVariantSelected}
                              onCheckedChange={(checked) =>
                                handleVariantQuotationToggle(
                                  variant.variantId,
                                  checked as boolean
                                )
                              }
                            />
                          </td>

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
                            {isVariantSelected ? (
                              <EditableNumericField
                                value={Number(variant.quantity) || 0}
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
                          </td>

                          {/* Precio unitario */}
                          <td className="p-3 text-center border-r border-purple-200/30 w-32">
                            {isVariantSelected ? (
                              <EditableNumericField
                                value={Number(variant.price) || 0}
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
                                ${Number(variant.price || 0).toFixed(2)}
                              </span>
                            )}
                          </td>

                          {/* Express */}
                          <td className="p-3 text-center w-32">
                            {isVariantSelected ? (
                              <EditableNumericField
                                value={Number(variant.priceExpress) || 0}
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
                                ${Number(variant.priceExpress || 0).toFixed(2)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
        productName={localProduct.name}
      />
    </div>
  );
}
