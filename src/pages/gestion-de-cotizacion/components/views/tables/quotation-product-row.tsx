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
import type { IProfitPercentage } from "@/api/interface/quotation-response/quotation-response-base";
import { SupplierProfitSelector } from "@/pages/gestion-de-cotizacion/create-cotizacion-origen/components/ui/SupplierProfitSelector";

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
  id_profit_percentage?: string | null;
  value_profit_porcentage?: number | null;
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
  bulkyProduct: boolean;
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
  profitPercentages?: IProfitPercentage[];
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
  profitPercentages = [],
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
  const [variantProfits, setVariantProfits] = useState<Record<string, { id: string; percentage: number }>>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Inicializar los profits de las variantes cuando los profitPercentages estén disponibles
  useEffect(() => {
    if (profitPercentages.length === 0 || isInitialized) return;

    const defaultProfit = profitPercentages.find(p => Number(p.percentage) === 10) || profitPercentages[0];

    if (defaultProfit && product.variants) {
      const initialProfits: Record<string, { id: string; percentage: number }> = {};

      product.variants.forEach(variant => {
        let profitToUse: { id: string; percentage: number };
        let calculatedValue: number;

        if (variant.id_profit_percentage && variant.value_profit_porcentage !== null && variant.value_profit_porcentage !== undefined) {
          // Encontrar el porcentaje real basado en el id_profit_percentage
          const existingProfit = profitPercentages.find(p => p.id_profit_percentage === variant.id_profit_percentage);

          profitToUse = {
            id: variant.id_profit_percentage,
            percentage: Number(existingProfit?.percentage) || 10
          };
          calculatedValue = variant.value_profit_porcentage;
        } else {
          profitToUse = {
            id: defaultProfit.id_profit_percentage,
            percentage: Number(defaultProfit.percentage)
          };

          const currentPrice = variant.price || 0;
          const currentQuantity = variant.quantity || 0;
          calculatedValue = (currentPrice * currentQuantity * Number(defaultProfit.percentage)) / 100;

          onVariantUpdate(product.productId, variant.variantId, {
            id_profit_percentage: defaultProfit.id_profit_percentage,
            value_profit_porcentage: calculatedValue
          });
        }

        initialProfits[variant.variantId] = profitToUse;
      });

      setVariantProfits(initialProfits);
      setIsInitialized(true);
    }
  }, [profitPercentages, isInitialized]);

  useEffect(() => {
    if (
      product.adminComment !== undefined &&
      product.adminComment !== adminComment
    ) {
      setAdminComment(product.adminComment);
    }
  }, [product.adminComment]);

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
      bulkyProduct: false,
    },
    ghostUrl: product.ghostUrl || product.url || "",
  });

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
        packingList:
          prev.packingList?.boxes !== product.number_of_boxes ||
            prev.packingList?.cbm !== parseFloat(product.volume) ||
            prev.packingList?.weightKg !== parseFloat(product.weight)
            ? prev.packingList
            : product.packingList || {
              boxes: product.number_of_boxes || 0,
              cbm: parseFloat(product.volume) || 0,
              weightKg: parseFloat(product.weight) || 0,
              weightTon: (parseFloat(product.weight) || 0) / 1000,
            },
        cargoHandling: product.cargoHandling ||
          prev.cargoHandling || {
          fragileProduct: false,
          stackProduct: false,
          bulkyProduct: false,
        },
        ghostUrl: product.ghostUrl || prev.ghostUrl || product.url || "",
      }));
    }
  }, [
    product.productId,
    product.name,
    product.variants,
    localProduct.productId,
    localProduct.name,
    localProduct.variants,
  ]);

  const isProductSelected =
    productQuotationState[product.productId] !== undefined
      ? productQuotationState[product.productId]
      : true;
  const productVariants = variantQuotationState[product.productId] || {};

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

  const previousAggregatedDataRef = useRef<{
    totalPrice: number;
    totalWeight: number;
    totalCBM: number;
    totalQuantity: number;
    totalExpress: number;
  } | null>(null);

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
      onProductUpdate(product.productId, {
        adminComment,
        packingList: localProduct.packingList,
        cargoHandling: localProduct.cargoHandling,
        ghostUrl: localProduct.ghostUrl,
      });
    }
    setIsCommentModalOpen(false);
  };

  const handlePackingListChange = (field: keyof PackingList, value: number) => {
    setLocalProduct((prev) => ({
      ...prev,
      packingList: {
        ...prev.packingList!,
        [field]: value,
        ...(field === "weightKg" ? { weightTon: value / 1000 } : {}),
      },
    }));

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

    if (onProductUpdate) {
      onProductUpdate(product.productId, {
        cargoHandling: {
          ...localProduct.cargoHandling!,
          [field]: value,
        },
      });
    }
  };

  const handleGhostUrlChange = (value: string) => {
    setLocalProduct((prev) => ({
      ...prev,
      ghostUrl: value,
    }));

    if (onProductUpdate) {
      onProductUpdate(product.productId, { ghostUrl: value });
    }
  };

  const handleVariantFieldChange = (
    variantId: string,
    field: string,
    value: number | string
  ) => {
    setLocalProduct((prev) => ({
      ...prev,
      variants: prev.variants?.map((variant) =>
        variant.variantId === variantId
          ? { ...variant, [field]: value }
          : variant
      ),
    }));

    if (onVariantUpdate) {
      onVariantUpdate(product.productId, variantId, { [field]: value });
    }

    if (field === 'price' && variantProfits[variantId]) {
      const currentVariant = localProduct.variants?.find(v => v.variantId === variantId);
      const quantity = currentVariant?.quantity || 0;
      const newPrice = typeof value === 'number' ? value : parseFloat(value as string);
      const profitPercentage = variantProfits[variantId].percentage;
      const profitId = variantProfits[variantId].id;
      const calculatedProfit = (newPrice * quantity * profitPercentage) / 100;

      if (onVariantUpdate) {
        onVariantUpdate(product.productId, variantId, {
          id_profit_percentage: profitId,
          value_profit_porcentage: calculatedProfit
        });
      }
    }

    if (field === 'quantity' && variantProfits[variantId]) {
      const currentVariant = localProduct.variants?.find(v => v.variantId === variantId);
      const price = currentVariant?.price || 0;
      const newQuantity = typeof value === 'number' ? value : parseFloat(value as string);
      const profitPercentage = variantProfits[variantId].percentage;
      const profitId = variantProfits[variantId].id;
      const calculatedProfit = (price * newQuantity * profitPercentage) / 100;

      if (onVariantUpdate) {
        onVariantUpdate(product.productId, variantId, {
          id_profit_percentage: profitId,
          value_profit_porcentage: calculatedProfit
        });
      }
    }
  };

  const handleProfitChange = (variantId: string, percentage: number) => {
    const selectedProfit = profitPercentages.find(p => Number(p.percentage) === percentage);

    if (selectedProfit) {
      const currentVariant = localProduct.variants?.find(v => v.variantId === variantId);
      const currentPrice = currentVariant?.price || 0;
      const currentQuantity = currentVariant?.quantity || 0;
      const calculatedProfit = (currentPrice * currentQuantity * Number(selectedProfit.percentage)) / 100;

      setVariantProfits(prev => ({
        ...prev,
        [variantId]: {
          id: selectedProfit.id_profit_percentage,
          percentage: Number(selectedProfit.percentage)
        }
      }));

      setLocalProduct((prev) => ({
        ...prev,
        variants: prev.variants?.map((variant) =>
          variant.variantId === variantId
            ? {
              ...variant,
              id_profit_percentage: selectedProfit.id_profit_percentage,
              value_profit_porcentage: calculatedProfit
            }
            : variant
        ),
      }));

      if (onVariantUpdate) {
        onVariantUpdate(product.productId, variantId, {
          id_profit_percentage: selectedProfit.id_profit_percentage,
          value_profit_porcentage: calculatedProfit
        });
      }
    }
  };

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
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-3 shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <th className="p-2 text-center text-xs font-semibold text-indigo-900 border-r border-indigo-100 min-w-[3.5rem]">
                NRO
              </th>
              <th className="p-2 text-left text-xs font-semibold text-indigo-900 border-r border-indigo-100 min-w-[12rem]">
                PRODUCTO & VARIANTES
              </th>
              <th className="p-2 text-left text-xs font-semibold text-indigo-900 border-r border-indigo-100 min-w-[9rem]">
                PACKING LIST
              </th>
              <th className="p-2 text-left text-xs font-semibold text-indigo-900 border-r border-indigo-100 min-w-[9rem]">
                MANIPULACIÓN DE CARGA
              </th>
              <th className="p-2 text-left text-xs font-semibold text-indigo-900 border-r border-indigo-100 min-w-[8rem]">
                URL FANTASMA
              </th>
              <th className="p-2 text-center text-xs font-semibold text-indigo-900 border-r border-indigo-100 min-w-[6rem]">
                PRECIO
              </th>
              <th className="p-2 text-center text-xs font-semibold text-indigo-900 border-r border-indigo-100 min-w-[6rem]">
                EXPRESS
              </th>
              <th className="p-2 text-center text-xs font-semibold text-indigo-900 min-w-[6rem]">
                P. TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              {/* NRO */}
              <td className="p-2 text-center align-top border-r border-slate-100">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="text-base font-bold text-gray-800">
                    {index + 1}
                  </div>
                 { /*<Checkbox
                    checked={isProductSelected}
                    onCheckedChange={handleProductQuotationToggle}
                  />*/}
                </div>
              </td>

              {/* PRODUCTO & VARIANTES */}
              <td className="p-2 align-top border-r border-slate-100">
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-gray-800 uppercase text-xs break-words line-clamp-2">
                    {localProduct.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {localProduct.variants?.length} variantes
                  </Badge>

                  {localProduct.variants && localProduct.variants.length > 0 && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleExpanded}
                        className="text-xs h-7 bg-green-50 hover:bg-green-100"
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
                        className="text-blue-600 text-xs flex gap-1 items-center hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Link2Icon className="w-3 h-3" />
                        URL
                      </a>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs cursor-pointer">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Cliente
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{localProduct.comment || "Sin comentarios"}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
                        <DialogTrigger asChild>
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-xs cursor-pointer">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Admin
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
                    </div>
                  )}
                </div>
              </td>

              {/* PACKING LIST */}
              <td className="p-2 align-top border-r border-slate-100">
                <div className="grid grid-cols-2 text-xs gap-2">
                  <div>
                    <Badge className="bg-red-50 text-red-600 border border-red-200 mb-1 text-xs">
                      Cajas
                    </Badge>
                    <Input
                      type="number"
                      value={localProduct.packingList?.boxes || 0}
                      onChange={(e) =>
                        handlePackingListChange("boxes", parseInt(e.target.value) || 0)
                      }
                      className="h-7 text-xs"
                      min={0}
                    />
                  </div>
                  <div>
                    <Badge className="bg-blue-50 text-blue-600 border border-blue-200 mb-1 text-xs">
                      CBM
                    </Badge>
                    <Input
                      type="number"
                      step="0.01"
                      value={localProduct.packingList?.cbm || 0}
                      onChange={(e) =>
                        handlePackingListChange("cbm", parseFloat(e.target.value) || 0)
                      }
                      className="h-7 text-xs"
                      min={0}
                    />
                  </div>
                  <div>
                    <Badge className="bg-green-50 text-green-600 border border-green-200 mb-1 text-xs">
                      Peso KG
                    </Badge>
                    <Input
                      type="number"
                      step="0.1"
                      value={localProduct.packingList?.weightKg || 0}
                      onChange={(e) =>
                        handlePackingListChange("weightKg", parseFloat(e.target.value) || 0)
                      }
                      className="h-7 text-xs"
                      min={0}
                    />
                  </div>
                  <div>
                    <Badge className="bg-purple-50 text-purple-600 border border-purple-200 mb-1 text-xs">
                      Peso TON
                    </Badge>
                    <Input
                      value={(localProduct.packingList?.weightTon || 0).toFixed(3)}
                      readOnly
                      className="h-7 text-xs bg-gray-50"
                    />
                  </div>
                </div>
              </td>

              {/* MANIPULACIÓN DE CARGA */}
              <td className="p-2 align-top border-r border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`fragile-${product.productId}`}
                      checked={localProduct.cargoHandling?.fragileProduct || false}
                      onCheckedChange={(checked) =>
                        handleCargoHandlingChange("fragileProduct", checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`fragile-${product.productId}`}
                      className="text-xs text-gray-600"
                    >
                      Producto Frágil
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`stackable-${product.productId}`}
                      checked={localProduct.cargoHandling?.stackProduct || false}
                      onCheckedChange={(checked) =>
                        handleCargoHandlingChange("stackProduct", checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`stackable-${product.productId}`}
                      className="text-xs text-gray-600"
                    >
                      Producto Apilable
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`bulky-${product.productId}`}
                      checked={localProduct.cargoHandling?.bulkyProduct || false}
                      onCheckedChange={(checked) =>
                        handleCargoHandlingChange("bulkyProduct", checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`bulky-${product.productId}`}
                      className="text-xs text-gray-600"
                    >
                      Producto Voluminoso
                    </label>
                  </div>
                </div>
              </td>

              {/* URL FANTASMA */}
              <td className="p-2 align-top border-r border-slate-100">
                <Input
                  placeholder="URL fantasma..."
                  value={localProduct.ghostUrl || ""}
                  onChange={(e) => handleGhostUrlChange(e.target.value)}
                  className="h-7 text-xs"
                />
              </td>

              {/* PRECIO */}
              <td className="p-2 text-center align-top border-r border-slate-100">
                <div className="text-xs text-slate-600 mb-1">USD</div>
                <div className="text-base font-semibold text-emerald-700 border border-emerald-200 rounded px-2 py-1 bg-emerald-50">
                  ${aggregatedData.totalPrice.toFixed(2)}
                </div>
              </td>

              {/* EXPRESS */}
              <td className="p-2 text-center align-top border-r border-slate-100">
                <div className="text-xs text-slate-600 mb-1">USD</div>
                <div className="text-base font-semibold text-blue-700 border border-blue-200 rounded px-2 py-1 bg-blue-50">
                  ${(aggregatedData.totalExpress || 0).toFixed(2)}
                </div>
              </td>

              {/* P. TOTAL */}
              <td className="p-2 text-center align-top">
                <div className="text-xs text-slate-600 mb-1">USD</div>
                <div className="text-base font-semibold text-indigo-700 border border-indigo-200 rounded px-2 py-1 bg-indigo-50">
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
      </div>

      {/* Expanded Variants */}
      {isExpanded &&
        localProduct.variants &&
        localProduct.variants.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200">
            <div className="p-3">
              <h4 className="text-sm font-bold text-slate-800 mb-2">
                Variantes del Producto
              </h4>

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-max border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
                        {/*{<th className="p-2 text-center text-xs font-semibold text-purple-900 border-r border-purple-100 min-w-[3rem]">
                          Cotizar
                        </th>/*/}
                        <th className="p-2 text-center text-xs font-semibold text-purple-900 border-r border-purple-100 min-w-[5rem]">
                          Imagen
                        </th>
                        <th className="p-2 text-left text-xs font-semibold text-purple-900 border-r border-purple-100 min-w-[7rem]">
                          Presentación
                        </th>
                        <th className="p-2 text-left text-xs font-semibold text-purple-900 border-r border-purple-100 min-w-[7rem]">
                          Modelo
                        </th>
                        <th className="p-2 text-left text-xs font-semibold text-purple-900 border-r border-purple-100 min-w-[7rem]">
                          Color
                        </th>
                        <th className="p-2 text-left text-xs font-semibold text-purple-900 border-r border-purple-100 min-w-[7rem]">
                          Tamaño
                        </th>
                        <th className="p-2 text-center text-xs font-semibold text-orange-700 border-r border-purple-100 min-w-[6rem]">
                          Cantidad
                        </th>
                        <th className="p-2 text-center text-xs font-semibold text-emerald-700 border-r border-purple-100 min-w-[7rem]">
                          Precio unitario
                        </th>
                        <th className="p-2 text-center text-xs font-semibold text-amber-700 min-w-[8rem]">
                          Ganancia Proveedor
                        </th>
                        <th className="p-2 text-center text-xs font-semibold text-blue-700 border-r border-purple-100 min-w-[7rem]">
                          Express
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {localProduct.variants.map((variant) => {
                        const isVariantSelected =
                          productVariants[variant.variantId] !== undefined
                            ? productVariants[variant.variantId]
                            : true;

                        return (
                          <tr key={variant.variantId} className="text-sm hover:bg-slate-50">
                           {/* <td className="p-2 text-center border-r border-slate-100">
                              <Checkbox
                                checked={isVariantSelected}
                                onCheckedChange={(checked) =>
                                  handleVariantQuotationToggle(
                                    variant.variantId,
                                    checked as boolean
                                  )
                                }
                              />
                            </td>*/}
                            <td className="p-2 border-r border-slate-100">
                              {variant.attachments &&
                                variant.attachments.length > 0 ? (
                                <div className="relative w-16 h-16">
                                  <div
                                    className="relative cursor-pointer w-full h-full"
                                    onClick={() =>
                                      handleOpenImages(
                                        variant.attachments?.map(
                                          (url, index) => ({
                                            id: index.toString(),
                                            url,
                                            name: `${localProduct.name} - ${variant.color
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
                                      className="w-full h-full object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity"
                                      onError={(e) => {
                                        e.currentTarget.src = "/placeholder.svg";
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full p-0 opacity-0 hover:opacity-100 transition-opacity bg-white/90"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>

                                    {variant.attachments.length > 1 && (
                                      <div className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-gray-900 bg-opacity-80 rounded-full text-white text-xs font-medium">
                                        {(variantImageIndices[
                                          variant.variantId
                                        ] || 0) + 1}
                                        /{variant.attachments.length}
                                      </div>
                                    )}
                                  </div>

                                  {variant.attachments.length > 1 && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full p-0 bg-white/90 hover:bg-white shadow-md z-10"
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
                                        className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full p-0 bg-white/90 hover:bg-white shadow-md z-10"
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
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </td>

                            <td className="p-2 border-r border-slate-100">
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                                {variant.presentation || "Sin datos"}
                              </Badge>
                            </td>

                            <td className="p-2 border-r border-slate-100">
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                {variant.model || "Sin datos"}
                              </Badge>
                            </td>

                            <td className="p-2 border-r border-slate-100">
                              <Badge variant="secondary" className="bg-pink-50 text-pink-700">
                                {variant.color || "Sin Datos"}
                              </Badge>
                            </td>

                            <td className="p-2 border-r border-slate-100">
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                                {variant.size || "Sin Datos"}
                              </Badge>
                            </td>

                            <td className="p-2 text-center border-r border-slate-100">
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

                            <td className="p-2 text-center border-r border-slate-100">
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

                            <td className="p-2 text-center">
                              {isVariantSelected ? (
                                <SupplierProfitSelector
                                  selectedPercentage={variantProfits[variant.variantId]?.percentage}
                                  onSelect={(percentage) => handleProfitChange(variant.variantId, percentage)}
                                  price={variant.price || 0}
                                  quantity={variant.quantity || 0}
                                  variantName={`${variant.color} - ${variant.size}`}
                                  compact={true}
                                  profitPercentages={profitPercentages}
                                />
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>

                            <td className="p-2 text-center border-r border-slate-100">
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
          </div>
        )}

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
