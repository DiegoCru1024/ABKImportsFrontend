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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
}: EditableUnitCostTableProps) {
  const [data, setData] = useState<ProductRow[]>(products || initialProducts);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (products && products.length > 0 && !isInternalUpdate.current) {
      setData(products);
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

  const handleDataChange = (newData: ProductRow[]) => {
    setData(newData);
    if (onProductsChange) {
      onProductsChange(newData);
    }
  };

  const updateProduct = useCallback((id: string, field: keyof ProductRow, value: number | boolean) => {
    isInternalUpdate.current = true;
    setData(prevData => {
      const newData = prevData.map(product => {
        if (product.id === id) {
          const updatedProduct = { ...product, [field]: value };
          
          // Recalcular total si cambia precio o cantidad
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

  // Efecto separado para notificar cambios al padre
  useEffect(() => {
    if (onProductsChange) {
      onProductsChange(data);
    }
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
                
                // Recalcular total si cambia precio o cantidad
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
    const commercialValue = calculateCommercialValue();
    if (onCommercialValueChange) {
      onCommercialValueChange(commercialValue);
    }
  }, [data, productQuotationState, onCommercialValueChange, calculateCommercialValue]);

  // Totales de footer (considerando productos/variantes seleccionados)
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

  // Factor M: basado en el primer producto seleccionado con precio y costo unitario válidos
  const factorM = React.useMemo(() => {
    const selectedProduct = data.find((p) => {
      const isSelected =
        productQuotationState[p.id] !== undefined
          ? productQuotationState[p.id]
          : true;
      return isSelected && (p.price || 0) > 0 && (p.unitCost || 0) > 0;
    });

    if (!selectedProduct) return 0;
    return (selectedProduct.unitCost || 0) / (selectedProduct.price || 1);
  }, [data, productQuotationState]);

  return (
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-sm">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
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
              <div className="text-lg font-extrabold text-slate-900">{factorM.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {isFirstPurchase && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Primera Compra:</strong> Los costos de importación se distribuyen 
                entre todos los productos para calcular el costo unitario real.
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Valor Comercial Total:</span>
              <span className="font-bold text-blue-600 text-lg">
                ${calculateCommercialValue().toFixed(2)}
              </span>
            </div>
            {totalImportCosts > 0 && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="font-medium text-slate-700">Costos de Importación:</span>
                <span className="font-semibold text-orange-600">
                  ${totalImportCosts.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="w-full rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-16">
                    <span className="font-semibold text-foreground">COTIZAR</span>
                  </TableHead>
                  <TableHead className="min-w-[300px]">
                    <span className="font-semibold text-foreground">NOMBRE DEL PRODUCTO</span>
                  </TableHead>
                  <TableHead className="w-32">
                    <span className="font-semibold text-foreground">PRECIO</span>
                  </TableHead>
                  <TableHead className="w-24">
                    <span className="font-semibold text-foreground">CANTIDAD</span>
                  </TableHead>
                  <TableHead className="w-32">
                    <span className="font-semibold text-foreground">TOTAL</span>
                  </TableHead>
                  <TableHead className="w-32">
                    <span className="font-semibold text-foreground">EQUIVALENCIA</span>
                  </TableHead>
                  <TableHead className="w-40">
                    <span className="font-semibold text-foreground">GASTOS DE IMPORTACIÓN</span>
                  </TableHead>
                  <TableHead className="w-32">
                    <span className="font-semibold text-foreground">COSTO TOTAL</span>
                  </TableHead>
                  <TableHead className="w-32">
                    <span className="font-semibold text-foreground">COSTO UNITARIO</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((product) => {
                  const isSelected = productQuotationState[product.id] !== undefined ? productQuotationState[product.id] : true;
                  const productTotal = calculateProductTotal(product);
                  const productQuantity = calculateProductQuantity(product);
                  const hasVariants = product.variants && product.variants.length > 0;

                  return (
                    <React.Fragment key={product.id}>
                      {/* Main Product Row */}
                      <TableRow className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => onProductQuotationChange?.(product.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {hasVariants && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleProductExpansion(product.id)}
                              >
                                {expandedProducts.has(product.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <div>
                              <div className="font-medium text-foreground">{product.name}</div>
                              {hasVariants && (
                                <div className="text-sm text-muted-foreground">
                                  {product?.variants?.length} variante{product?.variants?.length !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasVariants ? (
                            <span className="font-semibold text-primary">USD {productTotal.toFixed(2)}</span>
                          ) : (
                            <EditableNumericField
                              value={product.price || 0}
                              onChange={(value) => updateProduct(product.id, 'price', value)}
                              prefix="$"
                              decimalPlaces={2}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {hasVariants ? (
                            <span className="font-medium">{productQuantity}</span>
                          ) : (
                            <EditableNumericField
                              value={product.quantity || 0}
                              onChange={(value) => updateProduct(product.id, 'quantity', value)}
                              decimalPlaces={0}
                              min={0}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">USD {productTotal.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <EditableNumericField
                            value={product.equivalence || 0}
                            onChange={(value) => updateProduct(product.id, 'equivalence', value)}
                            suffix="%"
                            decimalPlaces={2}
                          />
                        </TableCell>
                        <TableCell>
                          <EditableNumericField
                            value={product.importCosts || 0}
                            onChange={(value) => updateProduct(product.id, 'importCosts', value)}
                            prefix="$"
                            decimalPlaces={2}
                          />
                        </TableCell>
                        <TableCell>
                          <EditableNumericField
                            value={product.totalCost || 0}
                            onChange={(value) => updateProduct(product.id, 'totalCost', value)}
                            prefix="$"
                            decimalPlaces={2}
                          />
                        </TableCell>
                        <TableCell>
                          <EditableNumericField
                            value={product.unitCost || 0}
                            onChange={(value) => updateProduct(product.id, 'unitCost', value)}
                            prefix="$"
                            decimalPlaces={2}
                          />
                        </TableCell>
                      </TableRow>

                      {/* Expanded Variants Section */}
                      {hasVariants && expandedProducts.has(product.id) && (
                        <TableRow>
                          <TableCell colSpan={9} className="p-0">
                            <div className="bg-card border-t">
                              <div className="p-4 space-y-3">
                                <h4 className="font-semibold text-card-foreground mb-3">Variantes del Producto</h4>
                                {product?.variants?.map((variant) => {
                                  const isVariantSelected = variantQuotationState[product.id]?.[variant.id] !== undefined 
                                    ? variantQuotationState[product.id][variant.id] 
                                    : true;
                                  
                                  return (
                                    <div
                                      key={variant.id}
                                      className="grid grid-cols-12 gap-4 p-3 bg-background rounded-md border items-center"
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
                                        <div className="text-sm font-medium text-foreground">
                                          Variante #{variant.id.slice(-4)}
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                          <div>
                                            <span className="font-medium">Tamaño:</span> {variant.size}
                                          </div>
                                          <div>
                                            <span className="font-medium">Presentación:</span> {variant.presentation}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Precio Unitario</label>
                                        <EditableNumericField
                                          value={variant.price || 0}
                                          onChange={(value) => updateVariant(product.id, variant.id, 'price', value)}
                                          prefix="$"
                                          decimalPlaces={2}
                                        />
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Cantidad</label>
                                        <EditableNumericField
                                          value={variant.quantity || 0}
                                          onChange={(value) => updateVariant(product.id, variant.id, 'quantity', value)}
                                          decimalPlaces={0}
                                          min={0}
                                        />
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Total</label>
                                        <div className="h-8 flex items-center">
                                          <span className="text-sm font-semibold text-primary">
                                            USD {((variant.price || 0) * (variant.quantity || 0)).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
              {/* Footer con totales */}
              <tfoot>
                <tr className="bg-orange-100 border-t-2 border-orange-200">
                  <td className="p-2"></td>
                  <td className="p-2 font-bold text-orange-800">Totales</td>
                  <td className="p-2"></td>
                  <td className="p-2 text-center font-bold text-orange-800">{totals.totalQuantity}</td>
                  <td className="p-2 text-center font-bold text-orange-800">USD {totals.totalAmount.toFixed(2)}</td>
                  <td className="p-2 text-center font-bold text-orange-800">{totals.totalEquivalence.toFixed(2)}%</td>
                  <td className="p-2 text-center font-bold text-orange-800">USD {totals.totalImportCosts.toFixed(2)}</td>
                  <td className="p-2 text-center font-bold text-orange-800">USD {totals.totalCost.toFixed(2)}</td>
                  <td className="p-2"></td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { ProductRow, ProductVariant };