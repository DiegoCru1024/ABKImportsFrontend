import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Package,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";

interface ProductVariant {
  originalVariantId: string | null;
  id: string;
  name: string;
  price: number;
  size: string;
  presentation: string;
  quantity: number;
  total: number;
  equivalence: number;
  importCosts: number;
  totalCost: number;
  unitCost: number;
  seCotiza: boolean;
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
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const isInternalUpdate = useRef(false);
  const prevProductsRef = useRef<ProductRow[]>([]);

  useEffect(() => {
    if (products && products.length > 0 && !isInternalUpdate.current) {
      if (JSON.stringify(products) !== JSON.stringify(prevProductsRef.current)) {
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
    totalInvestmentImport: 0
  });

  const calculateDynamicValues = useCallback((products: ProductRow[], prodState: Record<string, boolean>, varState: Record<string, Record<string, boolean>>, investment: number) => {
    const totalAmount = products.reduce((total, product) => {
      const isSelected = prodState[product.id] !== undefined ? prodState[product.id] : true;
      if (!isSelected) return total;

      const hasVariants = product.variants && product.variants.length > 0;
      if (hasVariants && product.variants) {
        return total + product.variants.reduce((variantTotal, variant) => {
          const isVariantSelected = varState[product.id]?.[variant.id] !== undefined
            ? varState[product.id][variant.id]
            : true;
          return isVariantSelected ? variantTotal + (variant.total || 0) : variantTotal;
        }, 0);
      } else {
        return total + (product.total || 0);
      }
    }, 0);

    return products.map(product => {
      const isSelected = prodState[product.id] !== undefined ? prodState[product.id] : true;
      if (!isSelected) return product;

      const hasVariants = product.variants && product.variants.length > 0;

      if (hasVariants && product.variants) {
        const updatedVariants = product.variants.map(variant => {
          const isVariantSelected = varState[product.id]?.[variant.id] !== undefined
            ? varState[product.id][variant.id]
            : true;
          if (!isVariantSelected) return variant;

          const equivalence = totalAmount > 0 ? (variant.total / totalAmount) * 100 : 0;
          const importCosts = (equivalence / 100) * investment;
          const totalCost = variant.total + importCosts;
          const unitCost = variant.quantity > 0 ? totalCost / variant.quantity : 0;

          return {
            ...variant,
            equivalence,
            importCosts,
            totalCost,
            unitCost
          };
        });

        return {
          ...product,
          variants: updatedVariants,
          equivalence: updatedVariants.reduce((sum, v) => sum + (v.equivalence || 0), 0),
          importCosts: updatedVariants.reduce((sum, v) => sum + (v.importCosts || 0), 0),
          totalCost: updatedVariants.reduce((sum, v) => sum + (v.totalCost || 0), 0),
          unitCost: updatedVariants.length > 0 ? updatedVariants.reduce((sum, v) => sum + (v.unitCost || 0), 0) / updatedVariants.length : 0
        };
      } else {
        const equivalence = totalAmount > 0 ? (product.total / totalAmount) * 100 : 0;
        const importCosts = (equivalence / 100) * investment;
        const totalCost = product.total + importCosts;
        const unitCost = product.quantity > 0 ? totalCost / product.quantity : 0;

        return {
          ...product,
          equivalence,
          importCosts,
          totalCost,
          unitCost
        };
      }
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (data.length > 0 && !isInternalUpdate.current) {
        const updatedData = calculateDynamicValues(data, productQuotationState, variantQuotationState, totalInvestmentImport);
        const hasChanges = JSON.stringify(updatedData) !== JSON.stringify(data);
        if (hasChanges) {
          isInternalUpdate.current = true;
          setData(updatedData);
        }
      }
      isInternalUpdate.current = false;
    }, 50);

    return () => clearTimeout(timeout);
  }, [productQuotationState, variantQuotationState, totalInvestmentImport, calculateDynamicValues]);

  const updateProduct = useCallback((id: string, field: keyof ProductRow, value: number | boolean) => {
    isInternalUpdate.current = true;
    setData(prevData => {
      const newData = prevData.map(product => {
        if (product.id === id) {
          const updatedProduct = { ...product, [field]: value };

          if (field === 'price' || field === 'quantity') {
            updatedProduct.total = (updatedProduct.price || 0) * (updatedProduct.quantity || 0);
          }

          return updatedProduct;
        }
        return product;
      });

      return newData;
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onProductsChange && !isInternalUpdate.current) {
        onProductsChange(data);
      }
      isInternalUpdate.current = false;
    }, 100);

    return () => clearTimeout(timeout);
  }, [data, onProductsChange]);

  const updateVariant = useCallback((productId: string, variantId: string, field: keyof ProductVariant, value: number | boolean) => {
    isInternalUpdate.current = true;
    setData(prevData => {
      const newData = prevData.map(product => {
        if (product.id === productId && product.variants) {
          return {
            ...product,
            variants: product.variants.map(variant => {
              if (variant.id === variantId) {
                const updatedVariant = { ...variant, [field]: value };

                if (field === 'price' || field === 'quantity') {
                  updatedVariant.total = (updatedVariant.price || 0) * (updatedVariant.quantity || 0);
                }

                return updatedVariant;
              }
              return variant;
            })
          };
        }
        return product;
      });

      return newData;
    });
  }, []);

  const calculateProductTotal = (product: ProductRow) => {
    if (!product.variants || product.variants.length === 0) {
      return product.total || 0;
    }
    return product.variants.reduce((total, variant) => {
      const isSelected = variantQuotationState[product.id]?.[variant.id] !== undefined
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
      const isSelected = variantQuotationState[product.id]?.[variant.id] !== undefined
        ? variantQuotationState[product.id][variant.id]
        : true;
      return isSelected ? total + (variant.quantity || 0) : total;
    }, 0);
  };

  const calculateCommercialValue = useCallback(() => {
    return data.reduce((total, product) => {
      const isSelected = productQuotationState[product.id] !== undefined ? productQuotationState[product.id] : true;
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
  }, [data, productQuotationState, onCommercialValueChange, calculateCommercialValue]);

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
          totalAmount += variant.total || (variant.price || 0) * (variant.quantity || 0);
          totalEquivalence += variant.equivalence || 0;
          totalImportCosts += variant.importCosts || 0;
          totalCost += variant.totalCost || 0;
        });
      } else {
        totalQuantity += product.quantity || 0;
        totalAmount += product.total || (product.price || 0) * (product.quantity || 0);
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
      const isSelected = productQuotationState[product.id] !== undefined
        ? productQuotationState[product.id]
        : true;

      if (!isSelected) continue;

      const hasVariants = product.variants && product.variants.length > 0;

      if (hasVariants && product.variants) {
        for (const variant of product.variants) {
          const isVariantSelected = variantQuotationState[product.id]?.[variant.id] !== undefined
            ? variantQuotationState[product.id][variant.id]
            : true;

          if (isVariantSelected && (variant.price || 0) > 0 && (variant.unitCost || 0) > 0) {
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
    <Card className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 shadow-lg border border-slate-200/60 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50/60 to-indigo-50/50 border-b border-slate-200/60">
        <div className="flex items-center justify-between gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-lg shadow-sm">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Tabla de Costeo Unitario
            </CardTitle>
            <p className="text-slate-600 text-sm mt-1">
              Gestiona los costos unitarios de los productos seleccionados
            </p>
          </div>
          <div className="ml-auto">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-600 leading-none">FACTOR M.</div>
              <div className="text-lg font-extrabold text-indigo-700">{factorM.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {isFirstPurchase && (
            <div className="bg-blue-100/50 border border-blue-300/50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Primera Compra:</strong> Los costos de importación se distribuyen
                entre todos los productos para calcular el costo unitario real.
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/50 rounded-lg p-4 border border-slate-200/60">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Valor Comercial Total:</span>
              <span className="font-bold text-blue-700 text-lg">
                ${calculateCommercialValue().toFixed(2)}
              </span>
            </div>
            {totalInvestmentImport > 0 && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="font-medium text-slate-700">Inversión Total de Importación:</span>
                <span className="font-semibold text-orange-700">
                  ${totalInvestmentImport.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto rounded-lg border border-slate-200/60 bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-100/60 to-purple-100/50 border-b-2 border-indigo-200/50">
                  <th className="p-3 text-center text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 w-16">
                    COTIZAR
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-indigo-800 border-r border-indigo-200/30 min-w-[250px]">
                    NOMBRE DEL PRODUCTO
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
                {data.map((product) => {
                  const isSelected = productQuotationState[product.id] !== undefined ? productQuotationState[product.id] : true;
                  const productTotal = calculateProductTotal(product);
                  const productQuantity = calculateProductQuantity(product);
                  const hasVariants = product.variants && product.variants.length > 0;

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="border-b border-slate-200/40 hover:bg-blue-50/30 transition-colors">
                        <td className="p-3 text-center border-r border-slate-200/30">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => onProductQuotationChange?.(product.id, checked as boolean)}
                            />
                          </div>
                        </td>
                        <td className="p-3 border-r border-slate-200/30">
                          <div className="flex items-center gap-2">
                            {hasVariants && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 flex-shrink-0"
                                onClick={() => toggleProductExpansion(product.id)}
                              >
                                {expandedProducts.has(product.id) ? (
                                  <ChevronDown className="h-4 w-4 text-slate-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-slate-600" />
                                )}
                              </Button>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-800 truncate">{product.name}</div>
                              {hasVariants && (
                                <div className="text-xs text-slate-500">
                                  {product?.variants?.length} variante{product?.variants?.length !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center border-r border-slate-200/30">
                          {hasVariants ? (
                            <span className="text-sm font-semibold text-indigo-600">Variantes</span>
                          ) : (
                            <EditableNumericField
                              value={product.price || 0}
                              onChange={(value) => updateProduct(product.id, 'price', value)}
                              prefix="$"
                              decimalPlaces={2}
                            />
                          )}
                        </td>
                        <td className="p-3 text-center border-r border-slate-200/30">
                          {hasVariants ? (
                            <span className="text-sm font-medium text-slate-700">{productQuantity}</span>
                          ) : (
                            <EditableNumericField
                              value={product.quantity || 0}
                              onChange={(value) => updateProduct(product.id, 'quantity', value)}
                              decimalPlaces={0}
                              min={0}
                            />
                          )}
                        </td>
                        <td className="p-3 text-center border-r border-slate-200/30">
                          <span className="text-sm font-semibold text-indigo-700">USD {productTotal.toFixed(2)}</span>
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
                        <tr>
                          <td colSpan={9} className="p-0 bg-slate-50/50">
                            <div className="p-4 space-y-3">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Variantes del Producto</h4>
                              {product?.variants?.map((variant) => {
                                const isVariantSelected = variantQuotationState[product.id]?.[variant.id] !== undefined
                                  ? variantQuotationState[product.id][variant.id]
                                  : true;

                                return (
                                  <div
                                    key={variant.id}
                                    className="grid grid-cols-16 gap-2 p-3 bg-white rounded-lg border border-slate-200/60 items-center"
                                  >
                                    <div className="col-span-1">
                                      <Checkbox
                                        checked={isVariantSelected}
                                        onCheckedChange={(checked) =>
                                          onVariantQuotationChange?.(product.id, variant.id, checked as boolean)
                                        }
                                      />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                      <div className="text-sm font-medium text-slate-800">
                                        Variante #{variant.id.slice(-4)}
                                      </div>
                                      <div className="text-xs text-slate-600 space-y-0.5">
                                        <div>
                                          <span className="font-medium">Tamaño:</span> {variant.size}
                                        </div>
                                        <div>
                                          <span className="font-medium">Presentación:</span> {variant.presentation}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-xs font-medium text-slate-600 block mb-1">Precio Unitario</label>
                                      <EditableNumericField
                                        value={variant.price || 0}
                                        onChange={(value) => updateVariant(product.id, variant.id, 'price', value)}
                                        prefix="$"
                                        decimalPlaces={2}
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-xs font-medium text-slate-600 block mb-1">Cantidad</label>
                                      <EditableNumericField
                                        value={variant.quantity || 0}
                                        onChange={(value) => updateVariant(product.id, variant.id, 'quantity', value)}
                                        decimalPlaces={0}
                                        min={0}
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-xs font-medium text-slate-600 block mb-1">Total</label>
                                      <div className="h-8 flex items-center">
                                        <span className="text-sm font-semibold text-indigo-700">
                                          USD {((variant.price || 0) * (variant.quantity || 0)).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-xs font-medium text-slate-600 block mb-1">Equivalencia %</label>
                                      <div className="h-8 flex items-center">
                                        <span className="text-sm font-medium text-blue-700">
                                          {(variant.equivalence || 0).toFixed(2)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-xs font-medium text-slate-600 block mb-1">Gastos Importación</label>
                                      <div className="h-8 flex items-center">
                                        <span className="text-sm font-medium text-orange-700">
                                          USD {(variant.importCosts || 0).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-xs font-medium text-slate-600 block mb-1">Costo Total</label>
                                      <div className="h-8 flex items-center">
                                        <span className="text-sm font-semibold text-emerald-700">
                                          USD {(variant.totalCost || 0).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
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
                  <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                    {totals.totalQuantity}
                  </td>
                  <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                    USD {totals.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                    {totals.totalEquivalence.toFixed(2)}%
                  </td>
                  <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                    USD {totals.totalImportCosts.toFixed(2)}
                  </td>
                  <td className="p-3 text-center font-bold text-amber-900 border-r border-amber-200/40">
                    USD {totals.totalCost.toFixed(2)}
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { ProductRow, ProductVariant };
