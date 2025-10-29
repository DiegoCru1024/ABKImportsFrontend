import { useState, useEffect, useMemo, useRef } from "react";
import {
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  Link,
  Link2Icon,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  attachments?: string[];
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
  const [variantImageIndices, setVariantImageIndices] = useState<
    Record<string, number>
  >({});

  // Sincronizar adminComment cuando cambie desde el padre
  useEffect(() => {
    if (
      product.adminComment !== undefined &&
      product.adminComment !== adminComment
    ) {
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
      (product.variants &&
        localProduct.variants &&
        product.variants.length !== localProduct.variants.length);

    if (hasSignificantChange) {
      setLocalProduct((prev) => ({
        ...product,
        // SIEMPRE preservar packingList existente si ya fue editado
        packingList:
          prev.packingList?.boxes !== product.number_of_boxes ||
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
        cargoHandling: product.cargoHandling ||
          prev.cargoHandling || {
            fragileProduct: false,
            stackProduct: false,
          },
        // Preservar ghostUrl existente si ya fue editado
        ghostUrl: product.ghostUrl || prev.ghostUrl || product.url || "",
      }));
    }
    //console.log("Este es el valor de localProduct", localProduct);
  }, [
    product.productId,
    product.name,
    product.variants,
    localProduct.productId,
    localProduct.name,
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
    // NOTA: priceExpress es un valor total por variante, NO se multiplica por cantidad
    const priceData = selectedVariants.reduce(
      (acc, variant) => ({
        totalPrice:
          acc.totalPrice + (variant.price || 0) * (variant.quantity || 0),
        totalQuantity: acc.totalQuantity + (variant.quantity || 0),
        totalExpress:
          acc.totalExpress + (variant.priceExpress || 0),
      }),
      {
        totalPrice: 0,
        totalQuantity: 0,
        totalExpress: 0,
      }
    );

    // Retornar con los valores del packingList para CBM y Weight (no se calculan desde variantes)
    return {
      totalPrice: Number(priceData.totalPrice),
      totalWeight: localProduct.packingList?.weightKg || 0,
      totalCBM: localProduct.packingList?.cbm || 0,
      totalQuantity: Number(priceData.totalQuantity),
      totalExpress: Number(priceData.totalExpress),
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

  // Funciones para navegar en el mini carrusel de variantes
  const handlePrevImage = (
    variantId: string,
    totalImages: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setVariantImageIndices((prev) => ({
      ...prev,
      [variantId]: ((prev[variantId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  const handleNextImage = (
    variantId: string,
    totalImages: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setVariantImageIndices((prev) => ({
      ...prev,
      [variantId]: ((prev[variantId] || 0) + 1) % totalImages,
    }));
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 border border-slate-200/60 rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-blue-100/60 to-indigo-100/50 border-b-2 border-blue-200/50">
            <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-16">
              NRO
            </th>
            <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-56 max-w-[14rem]">
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

            {/* Columna 3: PRODUCTO & VARIANTES */}
            <td className="p-3 align-top border-r border-blue-200/30 w-56 max-w-[14rem]">
              <div className="space-y-2">
                <div>
                  <h3
                    className="font-semibold text-gray-800 uppercase text-xs break-words line-clamp-3"
                    title={localProduct.name}
                  >
                    {localProduct.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {localProduct.variants?.length} variantes
                  </Badge>
                </div>

                {/* Botón para expandir variantes */}
                {localProduct.variants && localProduct.variants.length > 0 && (
                  <div className="flex gap-4 align-middle items-center">
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

                    <a
                      href={localProduct.url}
                      className="text-blue-600 text-sm flex gap-2 items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="URL del producto"
                    >
                      <Link2Icon className="w-4 h-4" />{" "}
                      {/* Corregí el 'w- h-4' */}
                      URL
                    </a>
                  </div>
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
            <td className="space-y-4 align-top border-r border-blue-200/30 w-40">
              <div className=" flex flex-col justify-center items-center gap-3 p-2">

                {/* Botón para ver comentarios y URL */}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50"
                    >
                      <MessageSquare className="h-3 w-3 " /> Comentario cliente
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm ">
                      {localProduct.comment || "Sin comentarios"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                {/* Comentario del administrador */}

                <Dialog
                  open={isCommentModalOpen}
                  onOpenChange={setIsCommentModalOpen}
                >
                  <DialogTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50"
                    >
                      <MessageSquare className="h-3 w-3 " /> Comentario Admi
                    </Badge>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Comentario Administrador</DialogTitle>
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

                <Input
                  placeholder="URL fantasma..."
                  onChange={(e) => handleGhostUrlChange(e.target.value)}
                  className="h-8 text-xs"
                />
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
                ${(aggregatedData.totalExpress || 0).toFixed(2)}
              </div>
            </td>

            {/* Columna 9: P. TOTAL */}
            <td className="p-3 text-center align-top w-28">
              <div className="text-xs text-slate-600 mb-1">USD</div>
              <div className="text-lg font-semibold text-indigo-700 border border-indigo-300/50 rounded-lg px-2 py-1 bg-indigo-100/50">
                $
                {(
                  (aggregatedData.totalPrice || 0) +
                  (aggregatedData.totalExpress || 0)
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
                      <th className="p-3 text-center text-xs font-semibold text-purple-800 border-r border-purple-200/30 w-16">
                        Imagen
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
                          {/* Imagen con mini carrusel */}
                          <td className="p-3 border-r border-purple-200/30 w-32">
                            {variant.attachments &&
                            variant.attachments.length > 0 ? (
                              <div className="relative w-20 h-20">
                                {/* Imagen principal */}
                                <div
                                  className="relative cursor-pointer w-full h-full"
                                  onClick={() =>
                                    handleOpenImages(
                                      variant.attachments?.map(
                                        (url, index) => ({
                                          id: index.toString(),
                                          url,
                                          name: `${localProduct.name} - ${
                                            variant.color
                                          } - Imagen ${index + 1}`,
                                        })
                                      ) || [],
                                      variantImageIndices[variant.variantId] ||
                                        0
                                    )
                                  }
                                >
                                  <img
                                    src={
                                      variant.attachments[
                                        variantImageIndices[
                                          variant.variantId
                                        ] || 0
                                      ] || "/placeholder.svg"
                                    }
                                    alt={`${localProduct.name} - ${variant.color}`}
                                    className="w-full h-full object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg";
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full p-0 opacity-0 hover:opacity-100 transition-opacity bg-white/90"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>

                                  {/* Indicador de cantidad de imágenes */}
                                  {variant.attachments.length > 1 && (
                                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-gray-900 bg-opacity-80 rounded-full text-white text-xs font-medium">
                                      {(variantImageIndices[
                                        variant.variantId
                                      ] || 0) + 1}
                                      /{variant.attachments.length}
                                    </div>
                                  )}
                                </div>

                                {/* Controles de navegación del mini carrusel */}
                                {variant.attachments.length > 1 && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full p-0 bg-white/90 hover:bg-white shadow-md z-10"
                                      onClick={(e) =>
                                        handlePrevImage(
                                          variant.variantId,
                                          variant.attachments!.length,
                                          e
                                        )
                                      }
                                    >
                                      <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full p-0 bg-white/90 hover:bg-white shadow-md z-10"
                                      onClick={(e) =>
                                        handleNextImage(
                                          variant.variantId,
                                          variant.attachments!.length,
                                          e
                                        )
                                      }
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </td>

                          {/* Presentación */}
                          <td className="p-3 border-r border-purple-200/30 w-32">
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50"
                            >
                              {variant.presentation || "Sin datos"}
                            </Badge>
                          </td>

                          {/* Modelo */}
                          <td className="p-3 border-r border-purple-200/30 w-32">
                            <Badge
                              variant="secondary"
                              className="bg-blue-100/60 text-blue-800 border-blue-300/50"
                            >
                              {variant.model || "Sin datos"}
                            </Badge>
                          </td>

                          {/* Color */}
                          <td className="p-3 border-r border-purple-200/30 w-32">
                            <Badge
                              variant="secondary"
                              className="bg-pink-100/60 text-pink-800 border-pink-300/50"
                            >
                              {variant.color || "Sin Datos"}
                            </Badge>
                          </td>

                          {/* Tamaño */}
                          <td className="p-3 border-r border-purple-200/30 w-32">
                            <Badge
                              variant="secondary"
                              className="bg-purple-100/60 text-purple-800 border-purple-300/50"
                            >
                              {variant.size || "Sin Datos"}
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
