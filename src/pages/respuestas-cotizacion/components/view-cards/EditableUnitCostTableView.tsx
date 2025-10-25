import React, { useState } from "react";
import { Package, ChevronDown, ChevronRight, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}

interface CompleteProduct {
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
  attachments: any;
  variants?: ProductVariant[];
}

interface EditableUnitCostTableViewProps {
  products: CompleteProduct[];
}

export default function EditableUnitCostTableView({
  products,
}: EditableUnitCostTableViewProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const calculateProductTotal = (product: CompleteProduct) => {
    if (!product.variants || product.variants.length === 0) {
      return product.total || 0;
    }
    return product.variants.reduce(
      (total, variant) => total + (variant.total || 0),
      0
    );
  };

  const calculateProductQuantity = (product: CompleteProduct) => {
    if (!product.variants || product.variants.length === 0) {
      return product.quantity || 0;
    }
    return product.variants.reduce(
      (total, variant) => total + (variant.quantity || 0),
      0
    );
  };

  const totals = React.useMemo(() => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalEquivalence = 0;
    let totalImportCosts = 0;
    let totalCost = 0;

    products.forEach((product) => {
      const hasVariants = product.variants && product.variants.length > 0;

      if (hasVariants && product.variants) {
        product.variants.forEach((variant) => {
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
  }, [products]);

  const factorM = React.useMemo(() => {
    for (const product of products) {
      const hasVariants = product.variants && product.variants.length > 0;

      if (hasVariants && product.variants) {
        for (const variant of product.variants) {
          if ((variant.price || 0) > 0 && (variant.unitCost || 0) > 0) {
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
  }, [products]);

  return (
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
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200/60 bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-100/60 to-purple-100/50 border-b-2 border-indigo-200/50">
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-16">
                    NRO.
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-24">
                    IMAGEN
                  </th>

                  <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-56">
                    PRODUCTO & VARIANTES
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-32">
                    PRECIO
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-24">
                    CANTIDAD
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-32">
                    TOTAL
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-32">
                    EQUIVALENCIA
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-40">
                    GASTOS DE IMPORTACIÓN
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-32">
                    COSTO TOTAL
                  </th>
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 w-32">
                    COSTO UNITARIO
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const productTotal = calculateProductTotal(product);
                  const productQuantity = calculateProductQuantity(product);
                  const hasVariants =
                    product.variants && product.variants.length > 0;

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="border-b border-slate-200/40 hover:bg-blue-50/30 transition-colors">
                        <td className="p-3 text-center border-r border-slate-200/30">
                          <div className="text-lg font-bold text-gray-800">
                            {index + 1}
                          </div>
                        </td>
                        {/* Columna 2: IMAGEN */}
                        <td className="p-3 text-center align-top border-r border-blue-200/30 w-24">
                          {product.attachments &&
                          product.attachments.length > 0 ? (
                            <div className="flex flex-col">
                              <div className="relative">
                                <img
                                  src={
                                    product.attachments[0] || "/placeholder.svg"
                                  }
                                  alt={product.name}
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
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        {/* Columna 3: PRODUCTO & VARIANTES */}
                        <td className="p-3 border-r border-slate-200/30 w-56 max-w-[14rem]">
                          <div className="space-y-2 ">
                            <div>
                              <h3 className="font-semibold text-gray-800 truncate uppercase">
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

                        <td className="p-3 text-center border-r border-slate-200/30">
                          {hasVariants ? (
                            <span className="text-sm font-semibold text-indigo-700">
                              USD{" "}
                              {(
                                product.variants?.reduce(
                                  (sum, variant) =>
                                    sum +
                                    (variant.price || 0) *
                                      (variant.quantity || 0),
                                  0
                                ) || 0
                              ).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-indigo-700">
                              USD {(product.price || 0).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center border-r border-slate-200/30">
                          <span className="text-sm font-medium text-slate-700">
                            {productQuantity}
                          </span>
                        </td>
                        <td className="p-3 text-center border-r border-slate-200/30">
                          <span className="text-sm font-semibold text-indigo-700">
                            USD {productTotal.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center border-r border-slate-200/30">
                          <span className="text-sm font-medium text-blue-700">
                            {(product.equivalence || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="p-3 text-center border-r border-slate-200/30">
                          <span className="text-sm font-medium text-orange-700">
                            USD {(product.importCosts || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center border-r border-slate-200/30">
                          <span className="text-sm font-semibold text-emerald-700">
                            USD {(product.totalCost || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-sm font-semibold text-purple-700">
                            USD {(product.unitCost || 0).toFixed(2)}
                          </span>
                        </td>
                      </tr>

                      {hasVariants && expandedProducts.has(product.id) && (
                        <>
                          {product?.variants?.map((variant, variantIndex) => {
                            return (
                              <tr
                                key={variant.id}
                                className="bg-gradient-to-br from-purple-50/40 to-pink-50/30 border-b border-purple-200/30 hover:bg-purple-50/50 transition-colors"
                              >
                                {/* Columna 1: NRO */}
                                <td className="p-3 text-center border-r border-purple-200/30 w-16"></td>

                                {/* Columna 2: Imagen con detalles */}
                                <td className="p-3 border-r border-purple-200/30 w-30 ">
                                  <div className="space-y-1 ">
                                    <div className="text-xs text-slate-600 space-y-1">
                                      <div className="flex flex-col gap-1 text-sm">
                                        <Badge
                                          variant="secondary"
                                          className="bg-emerald-100/60 text-emerald-800 border-emerald-300/50 text-[10px]"
                                        >
                                          Presentación:
                                        </Badge>
                                        <span>
                                          {variant.presentation || "Sin datos"}
                                        </span>
                                      </div>
                                      <div className="flex flex-col gap-1 text-sm">
                                        <Badge
                                          variant="secondary"
                                          className="bg-blue-100/60 text-blue-800 border-blue-300/50 text-[10px]"
                                        >
                                          Modelo:
                                        </Badge>
                                        <span>
                                          {variant.model || "Sin datos"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Columna 3: Detalles de variante */}
                                <td className="p-3 border-r border-purple-200/30 w-56">
                                  <div className="space-y-1 ">
                                    <div className="text-xs text-slate-600 space-y-1">
                                      <div className="flex flex-col gap-1 text-sm">
                                        <Badge
                                          variant="secondary"
                                          className="bg-pink-100/60 text-pink-800 border-pink-300/50 text-[10px]"
                                        >
                                          Color:
                                        </Badge>
                                        <span>
                                          {variant.color || "Sin datos"}
                                        </span>
                                      </div>
                                      <div className="flex flex-col gap-1 text-xs">
                                        <Badge
                                          variant="secondary"
                                          className="bg-purple-100/60 text-purple-800 border-purple-300/50 text-[10px]"
                                        >
                                          Tamaño:
                                        </Badge>
                                        <span>
                                          {variant.size || "Sin datos"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Columna 4: Precio */}
                                <td className="p-3 text-center border-r border-purple-200/30 w-32">
                                  <span className="text-sm font-semibold text-indigo-700">
                                    USD {(variant.price || 0).toFixed(2)}
                                  </span>
                                </td>

                                {/* Columna 5: Cantidad */}
                                <td className="p-3 text-center border-r border-purple-200/30 w-24">
                                  <span className="text-sm font-medium text-slate-700">
                                    {variant.quantity || 0}
                                  </span>
                                </td>

                                {/* Columna 6: Total */}
                                <td className="p-3 text-center border-r border-purple-200/30 w-32">
                                  <span className="text-sm font-semibold text-indigo-700">
                                    USD{" "}
                                    {(
                                      (variant.price || 0) *
                                      (variant.quantity || 0)
                                    ).toFixed(2)}
                                  </span>
                                </td>

                                {/* Columna 7: Equivalencia */}
                                <td className="p-3 text-center border-r border-purple-200/30 w-32">
                                  <span className="text-sm font-medium text-blue-700">
                                    {(variant.equivalence || 0).toFixed(2)}%
                                  </span>
                                </td>

                                {/* Columna 8: Gastos de Importación */}
                                <td className="p-3 text-center border-r border-purple-200/30 w-40">
                                  <span className="text-sm font-medium text-orange-700">
                                    USD {(variant.importCosts || 0).toFixed(2)}
                                  </span>
                                </td>

                                {/* Columna 9: Costo Total */}
                                <td className="p-3 text-center border-r border-purple-200/30 w-32">
                                  <span className="text-sm font-semibold text-emerald-700">
                                    USD {(variant.totalCost || 0).toFixed(2)}
                                  </span>
                                </td>

                                {/* Columna 10: Costo Unitario */}
                                <td className="p-3 text-center w-32">
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
  );
}
