import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Package,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Eye,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import ImageCarouselModal from "@/components/ImageCarouselModal";

interface ProductVariant {
  originalVariantId: string | null;
  id: string;
  name: string;
  price: number;
  size: string;
  model: string;
  color: string;
  presentation: string;
  quantity: number;
  total: number;
  equivalence: number;
  importCosts: number;
  totalCost: number;
  unitCost: number;
  seCotiza: boolean;
  attachments?: string[];
}

interface ProductRow {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  equivalence: number;
  importCosts: number;
  totalCost: number;
  unitCost: number;
  seCotiza: boolean;
  variants?: ProductVariant[];
}

interface EditableUnitCostTableProps {
  totalImportCosts?: number;
  onCommercialValueChange?: (value: number) => void;
  isFirstPurchase?: boolean;
  initialProducts?: ProductRow[];
  onProductsChange?: (products: ProductRow[]) => void;
  productQuotationState?: Record<string, boolean>;
  variantQuotationState?: Record<string, Record<string, boolean>>;
  onProductQuotationChange?: (productId: string, checked: boolean) => void;
  onVariantQuotationChange?: (
    productId: string,
    variantId: string,
    checked: boolean
  ) => void;
  products: ProductRow[];
  totalInvestmentImport?: number;
}

export default function EditableUnitCostTable({
  totalImportCosts = 0,
  onCommercialValueChange,
  isFirstPurchase = false,
  initialProducts = [],
  onProductsChange,
  productQuotationState = {},
  variantQuotationState = {},
  onProductQuotationChange,
  onVariantQuotationChange,
  products,
  totalInvestmentImport = 0,
}: EditableUnitCostTableProps) {
  const [data, setData] = useState<ProductRow[]>(products || initialProducts);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const isInternalUpdate = useRef(false);
  const prevProductsRef = useRef<ProductRow[]>([]);

  useEffect(() => {
    if (products && products.length > 0 && !isInternalUpdate.current) {
      if (
        JSON.stringify(products) !== JSON.stringify(prevProductsRef.current)
      ) {
        setData(products);
        prevProductsRef.current = products;
      }
    }
    isInternalUpdate.current = false;
  }, [products]);

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const prevStateRef = useRef({
    productQuotationState: {},
    variantQuotationState: {},
    totalInvestmentImport: 0,
  });

  const calculateDynamicValues = useCallback(
    (
      products: ProductRow[],
      prodState: Record<string, boolean>,
      varState: Record<string, Record<string, boolean>>,
      investment: number
    ) => {
      const totalAmount = products.reduce((total, product) => {
        const isSelected =
          prodState[product.id] !== undefined ? prodState[product.id] : true;
        if (!isSelected) return total;

        const hasVariants = product.variants && product.variants.length > 0;
        if (hasVariants && product.variants) {
          return (
            total +
            product.variants.reduce((variantTotal, variant) => {
              const isVariantSelected =
                varState[product.id]?.[variant.id] !== undefined
                  ? varState[product.id][variant.id]
                  : true;
              return isVariantSelected
                ? variantTotal + (variant.total || 0)
                : variantTotal;
            }, 0)
          );
        } else {
          return total + (product.total || 0);
        }
      }, 0);

      return products.map((product) => {
        const isSelected =
          prodState[product.id] !== undefined ? prodState[product.id] : true;
        if (!isSelected) return product;

        const hasVariants = product.variants && product.variants.length > 0;

        if (hasVariants && product.variants) {
          const updatedVariants = product.variants.map((variant) => {
            const isVariantSelected =
              varState[product.id]?.[variant.id] !== undefined
                ? varState[product.id][variant.id]
                : true;
            if (!isVariantSelected) return variant;

            const equivalence =
              totalAmount > 0 ? (variant.total / totalAmount) * 100 : 0;
            const importCosts = (equivalence / 100) * investment;
            const totalCost = variant.total + importCosts;
            const unitCost =
              variant.quantity > 0 ? totalCost / variant.quantity : 0;

            return {
              ...variant,
              equivalence,
              importCosts,
              totalCost,
              unitCost,
            };
          });

          return {
            ...product,
            variants: updatedVariants,
            equivalence: updatedVariants.reduce(
              (sum, v) => sum + (v.equivalence || 0),
              0
            ),
            importCosts: updatedVariants.reduce(
              (sum, v) => sum + (v.importCosts || 0),
              0
            ),
            totalCost: updatedVariants.reduce(
              (sum, v) => sum + (v.totalCost || 0),
              0
            ),
            unitCost:
              updatedVariants.length > 0
                ? updatedVariants.reduce(
                    (sum, v) => sum + (v.unitCost || 0),
                    0
                  ) / updatedVariants.length
                : 0,
          };
        } else {
          const equivalence =
            totalAmount > 0 ? (product.total / totalAmount) * 100 : 0;
          const importCosts = (equivalence / 100) * investment;
          const totalCost = product.total + importCosts;
          const unitCost =
            product.quantity > 0 ? totalCost / product.quantity : 0;

          return {
            ...product,
            equivalence,
            importCosts,
            totalCost,
            unitCost,
          };
        }
      });
    },
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (data.length > 0 && !isInternalUpdate.current) {
        const updatedData = calculateDynamicValues(
          data,
          productQuotationState,
          variantQuotationState,
          totalInvestmentImport
        );
        const hasChanges = JSON.stringify(updatedData) !== JSON.stringify(data);
        if (hasChanges) {
          isInternalUpdate.current = true;
          setData(updatedData);
        }
      }
      isInternalUpdate.current = false;
    }, 50);

    return () => clearTimeout(timeout);
  }, [
    productQuotationState,
    variantQuotationState,
    totalInvestmentImport,
    calculateDynamicValues,
  ]);

  const updateProduct = useCallback(
    (id: string, field: keyof ProductRow, value: number | boolean) => {
      isInternalUpdate.current = true;
      setData((prevData) => {
        const newData = prevData.map((product) => {
          if (product.id === id) {
            const updatedProduct = { ...product, [field]: value };

            if (field === "price" || field === "quantity") {
              updatedProduct.total =
                (updatedProduct.price || 0) * (updatedProduct.quantity || 0);
            }

            return updatedProduct;
          }
          return product;
        });

        return newData;
      });
    },
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onProductsChange && !isInternalUpdate.current) {
        onProductsChange(data);
      }
      isInternalUpdate.current = false;
    }, 100);

    return () => clearTimeout(timeout);
  }, [data, onProductsChange]);

  const updateVariant = useCallback(
    (
      productId: string,
      variantId: string,
      field: keyof ProductVariant,
      value: number | boolean
    ) => {
      isInternalUpdate.current = true;
      setData((prevData) => {
        const newData = prevData.map((product) => {
          if (product.id === productId && product.variants) {
            return {
              ...product,
              variants: product.variants.map((variant) => {
                if (variant.id === variantId) {
                  const updatedVariant = { ...variant, [field]: value };

                  if (field === "price" || field === "quantity") {
                    updatedVariant.total =
                      (updatedVariant.price || 0) *
                      (updatedVariant.quantity || 0);
                  }

                  return updatedVariant;
                }
                return variant;
              }),
            };
          }
          return product;
        });

        return newData;
      });
    },
    []
  );

  const calculateProductTotal = (product: ProductRow) => {
    if (!product.variants || product.variants.length === 0) {
      return product.total || 0;
    }
    return product.variants.reduce((total, variant) => {
      const isSelected =
        variantQuotationState[product.id]?.[variant.id] !== undefined
          ? variantQuotationState[product.id][variant.id]
          : true;
      return isSelected ? total + (variant.total || 0) : total;
    }, 0);
  };

  const calculateProductQuantity = (product: ProductRow) => {
    if (!product.variants || product.variants.length === 0) {
      return product.quantity || 0;
    }
    return product.variants.reduce((total, variant) => {
      const isSelected =
        variantQuotationState[product.id]?.[variant.id] !== undefined
          ? variantQuotationState[product.id][variant.id]
          : true;
      return isSelected ? total + (variant.quantity || 0) : total;
    }, 0);
  };

  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<
    Array<{ id: string; url: string; name?: string }>
  >([]);
  const [variantImageIndices, setVariantImageIndices] = useState<
    Record<string, number>
  >({});

  const [startImageIndex, setStartImageIndex] = useState<number>(0);

  const handleOpenImages = (
    images: Array<{ id: string; url: string; name?: string }>,
    startIndex: number = 0
  ) => {
    setSelectedImages(images);
    setStartImageIndex(startIndex);
    setIsImageModalOpen(true);
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

  const calculateCommercialValue = useCallback(() => {
    return data.reduce((total, product) => {
      const isSelected =
        productQuotationState[product.id] !== undefined
          ? productQuotationState[product.id]
          : true;
      if (isSelected) {
        return total + calculateProductTotal(product);
      }
      return total;
    }, 0);
  }, [data, productQuotationState, variantQuotationState]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const commercialValue = calculateCommercialValue();
      if (onCommercialValueChange) {
        onCommercialValueChange(commercialValue);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [
    data,
    productQuotationState,
    onCommercialValueChange,
    calculateCommercialValue,
  ]);

  const totals = React.useMemo(() => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalEquivalence = 0;
    let totalImportCosts = 0;
    let totalCost = 0;

    data.forEach((product) => {
      const isProductSelected =
        productQuotationState[product.id] !== undefined
          ? productQuotationState[product.id]
          : true;

      if (!isProductSelected) return;

      const hasVariants = product.variants && product.variants.length > 0;

      if (hasVariants && product.variants) {
        product.variants.forEach((variant) => {
          const isVariantSelected =
            variantQuotationState[product.id]?.[variant.id] !== undefined
              ? variantQuotationState[product.id][variant.id]
              : true;
          if (!isVariantSelected) return;

          totalQuantity += variant.quantity || 0;
          totalAmount +=
            variant.total || (variant.price || 0) * (variant.quantity || 0);
          totalEquivalence += variant.equivalence || 0;
          totalImportCosts += variant.importCosts || 0;
          totalCost += variant.totalCost || 0;
        });
      } else {
        totalQuantity += product.quantity || 0;
        totalAmount +=
          product.total || (product.price || 0) * (product.quantity || 0);
        totalEquivalence += product.equivalence || 0;
        totalImportCosts += product.importCosts || 0;
        totalCost += product.totalCost || 0;
      }
    });

    return {
      totalQuantity,
      totalAmount,
      totalEquivalence,
      totalImportCosts,
      totalCost,
    };
  }, [data, productQuotationState, variantQuotationState]);

  const factorM = React.useMemo(() => {
    for (const product of data) {
      const isSelected =
        productQuotationState[product.id] !== undefined
          ? productQuotationState[product.id]
          : true;

      if (!isSelected) continue;

      const hasVariants = product.variants && product.variants.length > 0;

      if (hasVariants && product.variants) {
        for (const variant of product.variants) {
          const isVariantSelected =
            variantQuotationState[product.id]?.[variant.id] !== undefined
              ? variantQuotationState[product.id][variant.id]
              : true;

          if (
            isVariantSelected &&
            (variant.price || 0) > 0 &&
            (variant.unitCost || 0) > 0
          ) {
            return (variant.unitCost || 0) / (variant.price || 1);
          }
        }
      } else {
        if ((product.price || 0) > 0 && (product.unitCost || 0) > 0) {
          return (product.unitCost || 0) / (product.price || 1);
        }
      }
    }

    return 0;
  }, [data, productQuotationState, variantQuotationState]);

  return (
    <>
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 shadow-lg border border-slate-200/60 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/50 border-b border-slate-200/60">
          <div className="ml-auto p-4">
            <div className="text-right ">
              <div className="text-[10px] font-bold text-slate-600 leading-none">
                FACTOR M.
              </div>
              <div className="text-lg font-extrabold text-indigo-700">
                {factorM.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {isFirstPurchase && (
              <div className="bg-blue-100/50 border border-blue-300/50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Primera Compra:</strong> Los costos de importación se
                  distribuyen entre todos los productos para calcular el costo
                  unitario real.
                </p>
              </div>
            )}

            <div className="w-full overflow-x-auto rounded-lg border border-slate-200/60 bg-white">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-100/60 to-purple-100/50 border-b-2 border-indigo-200/50">
                    <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30">
                      NRO.
                    </th>

                    <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30">
                      PRODUCTO & VARIANTES
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30">
                      PRECIO
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30">
                      CANTIDAD
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30">
                      TOTAL
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30">
                      EQUIVALENCIA
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30">
                      GASTOS DE IMPORTACIÓN
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30">
                      COSTO TOTAL
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-indigo-800">
                      COSTO UNITARIO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((product, index) => {
                    const isSelected =
                      productQuotationState[product.id] !== undefined
                        ? productQuotationState[product.id]
                        : true;
                    const productTotal = calculateProductTotal(product);
                    const productQuantity = calculateProductQuantity(product);
                    const hasVariants =
                      product.variants && product.variants.length > 0;

                    return (
                      <React.Fragment key={product.id}>
                        <tr className="border-b border-slate-200/40 hover:bg-blue-50/30 transition-colors">
                          {/* Columna 1: NUMERACION */}
                          <td className="p-3 text-center border-r border-slate-200/30">
                            <div className="flex items-center justify-center flex-col">
                              <div className="text-lg font-bold text-gray-800">
                                {index + 1}
                              </div>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  onProductQuotationChange?.(
                                    product.id,
                                    checked as boolean
                                  )
                                }
                              />
                            </div>
                          </td>

                          {/* Columna 2: PRODUCTO & VARIANTES */}
                          <td className="p-3 border-r border-slate-200/30">
                            <div className="space-y-2">
                              <div>
                                <h3
                                  className="font-semibold text-gray-800 uppercase text-xs break-words line-clamp-3"
                                  title={product.name}
                                >
                                  {product.name}
                                </h3>
                              </div>

                              {hasVariants && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs bg-green-100 hover:bg-green-200 "
                                  onClick={() =>
                                    toggleProductExpansion(product.id)
                                  }
                                >
                                  {expandedProducts.has(product.id) ? (
                                    <ChevronDown className="h-4 w-4 text-slate-600" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-600" />
                                  )}
                                  {product?.variants?.length} variante
                                  {product?.variants?.length !== 1 ? "s" : ""}
                                </Button>
                              )}
                            </div>
                          </td>
                          {/* Columna 3: PRECIO*/}
                          <td className="p-3 text-center border-r border-slate-200/30">
                            {hasVariants ? (
                              <span className="text-sm font-semibold text-indigo-700">
                                USD{" "}
                                {(
                                  product.variants?.reduce((sum, variant) => {
                                    const isVariantSelected =
                                      variantQuotationState[product.id]?.[
                                        variant.id
                                      ] !== undefined
                                        ? variantQuotationState[product.id][
                                            variant.id
                                          ]
                                        : true;
                                    return isVariantSelected
                                      ? sum +
                                          (variant.price || 0) *
                                            (variant.quantity || 0)
                                      : sum;
                                  }, 0) || 0
                                ).toFixed(2)}
                              </span>
                            ) : (
                              <EditableNumericField
                                value={product.price || 0}
                                onChange={(value) =>
                                  updateProduct(product.id, "price", value)
                                }
                                prefix="$"
                                decimalPlaces={2}
                              />
                            )}
                          </td>
                          {/* Columna 4: CANTIDAD*/}
                          <td className="p-3 text-center border-r border-slate-200/30">
                            {hasVariants ? (
                              <span className="text-sm font-medium text-slate-700">
                                {productQuantity}
                              </span>
                            ) : (
                              <EditableNumericField
                                value={product.quantity || 0}
                                onChange={(value) =>
                                  updateProduct(product.id, "quantity", value)
                                }
                                decimalPlaces={0}
                                min={0}
                              />
                            )}
                          </td>
                          {/* Columna 5: TOTAL*/}
                          <td className="p-3 text-center border-r border-slate-200/30">
                            <span className="text-sm font-semibold text-indigo-700">
                              USD {productTotal.toFixed(2)}
                            </span>
                          </td>
                          {/* Columna 6: EQUIVALENCIA*/}
                          <td className="p-3 text-center border-r border-slate-200/30">
                            <span className="text-sm font-medium text-blue-700">
                              {(product.equivalence || 0).toFixed(2)}%
                            </span>
                          </td>
                          {/* Columna 7: GASTOS DE IMPORTACION*/}
                          <td className="p-3 text-center border-r border-slate-200/30">
                            <span className="text-sm font-medium text-orange-700">
                              USD {(product.importCosts || 0).toFixed(2)}
                            </span>
                          </td>
                          {/* Columna 8: COSTO TOTAL*/}
                          <td className="p-3 text-center border-r border-slate-200/30">
                            <span className="text-sm font-semibold text-emerald-700">
                              USD {(product.totalCost || 0).toFixed(2)}
                            </span>
                          </td>
                          {/* Columna 9: COSTO UNITARIO*/}
                          <td className="p-3 text-center">
                            <span className="text-sm font-semibold text-purple-700">
                              USD {(product.unitCost || 0).toFixed(2)}
                            </span>
                          </td>
                        </tr>

                        {hasVariants && expandedProducts.has(product.id) && (
                          <>
                            {product?.variants?.map((variant, variantIndex) => {
                              const isVariantSelected =
                                variantQuotationState[product.id]?.[
                                  variant.id
                                ] !== undefined
                                  ? variantQuotationState[product.id][
                                      variant.id
                                    ]
                                  : true;

                              return (
                                <tr
                                  key={variant.id}
                                  className="bg-gradient-to-br from-purple-50/40 to-pink-50/30 border-b border-purple-200/30 hover:bg-purple-50/50 transition-colors"
                                >
                                  {/* Columna 1: Checkbox */}
                                  <td className="p-3 text-center border-r border-purple-200/30">
                                    <Checkbox
                                      checked={isVariantSelected}
                                      onCheckedChange={(checked) =>
                                        onVariantQuotationChange?.(
                                          product.id,
                                          variant.id,
                                          checked as boolean
                                        )
                                      }
                                    />
                                  </td>

                                  {/* Columna 2: Detalles de variante con imagen */}
                                  <td className="p-3 border-r border-purple-200/30">
                                    <div className="flex gap-3">
                                      {/* Mini carrusel de imágenes */}
                                      <div className="flex-shrink-0">
                                        {variant.attachments &&
                                        variant.attachments.length > 0 ? (
                                          <div className="relative w-16 h-16">
                                            {/* Imagen principal */}
                                            <div
                                              className="relative cursor-pointer w-full h-full"
                                              onClick={() =>
                                                handleOpenImages(
                                                  variant.attachments?.map(
                                                    (url, index) => ({
                                                      id: index.toString(),
                                                      url,
                                                      name: `${product.name} - ${
                                                        variant.color
                                                      } - Imagen ${index + 1}`,
                                                    })
                                                  ) || [],
                                                  variantImageIndices[variant.id] ||
                                                    0
                                                )
                                              }
                                            >
                                              <img
                                                src={
                                                  variant.attachments[
                                                    variantImageIndices[
                                                      variant.id
                                                    ] || 0
                                                  ] || "/placeholder.svg"
                                                }
                                                alt={`${product.name} - ${variant.color}`}
                                                className="w-full h-full object-cover rounded-lg border border-purple-300 hover:opacity-80 transition-opacity"
                                                onError={(e) => {
                                                  e.currentTarget.src =
                                                    "/placeholder.svg";
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
                                                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-purple-900 bg-opacity-80 rounded-full text-white text-xs font-medium">
                                                  {(variantImageIndices[
                                                    variant.id
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
                                                      variant.id,
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
                                                      variant.id,
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
                                          <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-200">
                                            <Package className="h-4 w-4 text-purple-300" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Detalles de variante */}
                                      <div className="flex-1 min-w-0">
                                        <div className="space-y-1">
                                          <div className="text-xs text-slate-600 space-y-1 grid grid-cols-2 gap-2">
                                            {/* Presentacion */}
                                            <div className="flex flex-col gap-1 text-xs">
                                              <Badge
                                                variant="secondary"
                                                className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50 text-[10px]"
                                              >
                                                Presentación:
                                              </Badge>
                                              <span
                                                className="break-words line-clamp-2 text-xs"
                                                title={
                                                  variant.presentation ||
                                                  "Sin datos"
                                                }
                                              >
                                                {variant.presentation ||
                                                  "Sin datos"}
                                              </span>
                                            </div>
                                            {/* Modelo */}
                                            <div className="flex flex-col gap-1 text-xs">
                                              <Badge
                                                variant="secondary"
                                                className="bg-blue-100/60 text-blue-800 border-blue-300/50 text-[10px]"
                                              >
                                                Modelo:
                                              </Badge>
                                              <span
                                                className="break-words line-clamp-2 text-xs"
                                                title={variant.model || "Sin datos"}
                                              >
                                                {variant.model || "Sin datos"}
                                              </span>
                                            </div>
                                            {/* Color */}
                                            <div className="flex flex-col gap-1 text-xs">
                                              <Badge
                                                variant="secondary"
                                                className="bg-pink-100/60 text-pink-800 border-pink-300/50 text-[10px]"
                                              >
                                                Color:
                                              </Badge>
                                              <span
                                                className="break-words line-clamp-2 text-xs"
                                                title={variant.color || "Sin datos"}
                                              >
                                                {variant.color || "Sin datos"}
                                              </span>
                                            </div>
                                            {/* Tamaño */}
                                            <div className="flex flex-col gap-1 text-xs">
                                              <Badge
                                                variant="secondary"
                                                className="bg-purple-100/60 text-purple-800 border-purple-300/50 text-[10px]"
                                              >
                                                Tamaño:
                                              </Badge>
                                              <span
                                                className="break-words line-clamp-2 text-xs"
                                                title={variant.size || "Sin datos"}
                                              >
                                                {variant.size || "Sin datos"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Columna 3: Precio */}
                                  <td className="p-3 text-center border-r border-purple-200/30">
                                    <EditableNumericField
                                      value={variant.price || 0}
                                      onChange={(value) =>
                                        updateVariant(
                                          product.id,
                                          variant.id,
                                          "price",
                                          value
                                        )
                                      }
                                      prefix="$"
                                      decimalPlaces={2}
                                    />
                                  </td>

                                  {/* Columna 4: Cantidad */}
                                  <td className="p-3 text-center border-r border-purple-200/30">
                                    <EditableNumericField
                                      value={variant.quantity || 0}
                                      onChange={(value) =>
                                        updateVariant(
                                          product.id,
                                          variant.id,
                                          "quantity",
                                          value
                                        )
                                      }
                                      decimalPlaces={0}
                                      min={0}
                                    />
                                  </td>

                                  {/* Columna 5: Total */}
                                  <td className="p-3 text-center border-r border-purple-200/30">
                                    <span className="text-sm font-semibold text-indigo-700">
                                      USD{" "}
                                      {(
                                        (variant.price || 0) *
                                        (variant.quantity || 0)
                                      ).toFixed(2)}
                                    </span>
                                  </td>

                                  {/* Columna 6: Equivalencia */}
                                  <td className="p-3 text-center border-r border-purple-200/30">
                                    <span className="text-sm font-medium text-blue-700">
                                      {(variant.equivalence || 0).toFixed(2)}%
                                    </span>
                                  </td>

                                  {/* Columna 7: Gastos de Importación */}
                                  <td className="p-3 text-center border-r border-purple-200/30">
                                    <span className="text-sm font-medium text-orange-700">
                                      USD{" "}
                                      {(variant.importCosts || 0).toFixed(2)}
                                    </span>
                                  </td>

                                  {/* Columna 8: Costo Total */}
                                  <td className="p-3 text-center border-r border-purple-200/30">
                                    <span className="text-sm font-semibold text-emerald-700">
                                      USD {(variant.totalCost || 0).toFixed(2)}
                                    </span>
                                  </td>

                                  {/* Columna 9: Costo Unitario */}
                                  <td className="p-3 text-center">
                                    <span className="text-sm font-semibold text-purple-700">
                                      USD {(variant.unitCost || 0).toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-amber-100/70 to-orange-100/60 border-t-2 border-amber-300/50">
                    <td className="p-3 border-r border-amber-200/40"></td>
                    <td className="p-3 text-left font-bold text-amber-900 border-r border-amber-200/40">
                      Totales
                    </td>
                    <td className="p-3 border-r border-amber-200/40"></td>
                    <td className="p-3 border-r border-amber-200/40"></td>
                    <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                      {totals.totalQuantity}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                      {totals.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                      {totals.totalEquivalence.toFixed(2)}%
                    </td>
                    <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                      {totals.totalImportCosts.toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                      {totals.totalCost.toFixed(2)}
                    </td>
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imágenes */}
      <ImageCarouselModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        files={[]}
        attachments={selectedImages.map((img) => img.url)}
        productName="Producto"
        initialIndex={startImageIndex}
      />
    </>
  );
}

export type { ProductRow, ProductVariant };
