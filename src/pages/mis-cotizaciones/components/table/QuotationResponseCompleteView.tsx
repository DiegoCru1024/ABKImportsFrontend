import React from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductVariant {
  variantId: string;
  quantity: number;
  precioUnitario: string;
  precioExpressUnitario: string;
  seCotizaVariante: boolean;
  price?: number;
  total?: number;
  equivalence?: number;
  importCosts?: number;
  totalCost?: number;
  unitCost?: number;
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
  seCotizaProducto: boolean;
  variants: ProductVariant[];
  attachments?: string[];
  price?: number;
  total?: number;
  equivalence?: number;
  importCosts?: number;
  totalCost?: number;
  unitCost?: number;
}

interface QuotationResponseCompleteViewProps {
  products: Product[];
  calculations?: {
    totalInvestmentImport?: number;
    commercialValue?: number;
    factorM?: number;
  };
}

export default function QuotationResponseCompleteView({ 
  products, 
  calculations = {} 
}: QuotationResponseCompleteViewProps) {
  const [expandedProducts, setExpandedProducts] = React.useState<Set<string>>(new Set());

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const selectedProducts = products.filter(product => product.seCotizaProducto);

  const totals = React.useMemo(() => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalEquivalence = 0;
    let totalImportCosts = 0;
    let totalCost = 0;

    selectedProducts.forEach((product) => {
      const hasVariants = product.variants && product.variants.length > 0;

      if (hasVariants) {
        product.variants.forEach((variant) => {
          if (variant.seCotizaVariante) {
            const price = parseFloat(variant.precioUnitario) || 0;
            const quantity = variant.quantity || 0;
            const total = price * quantity;
            
            totalQuantity += quantity;
            totalAmount += total;
            totalEquivalence += variant.equivalence || 0;
            totalImportCosts += variant.importCosts || 0;
            totalCost += variant.totalCost || 0;
          }
        });
      } else {
        const price = parseFloat(product.price?.toString() || "0") || 0;
        const quantity = product.quantityTotal || 0;
        const total = price * quantity;
        
        totalQuantity += quantity;
        totalAmount += total;
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
  }, [selectedProducts]);

  const factorM = calculations.factorM || 0;

  return (
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-sm">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Respuesta de Cotización - Vista Completa
            </CardTitle>
            <p className="text-slate-600 text-sm mt-1">
              Análisis detallado de costos y precios unitarios
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-600 leading-none">FACTOR M.</div>
            <div className="text-lg font-extrabold text-slate-900">{factorM.toFixed(2)}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Valor Comercial Total:</span>
              <span className="font-bold text-blue-600 text-lg">
                ${calculations.commercialValue?.toFixed(2) || totals.totalAmount.toFixed(2)}
              </span>
            </div>
            {calculations.totalInvestmentImport && calculations.totalInvestmentImport > 0 && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="font-medium text-slate-700">Inversión Total de Importación:</span>
                <span className="font-semibold text-orange-600">
                  ${calculations.totalInvestmentImport.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="w-full rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-16">
                    <span className="font-semibold text-foreground">ESTADO</span>
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
                    <span className="font-semibold text-foreground">GASTOS IMPORTACIÓN</span>
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
                {selectedProducts.map((product) => {
                  const hasVariants = product.variants && product.variants.length > 0;
                  const selectedVariants = hasVariants 
                    ? product.variants.filter(v => v.seCotizaVariante) 
                    : [];
                  
                  const productQuantity = hasVariants 
                    ? selectedVariants.reduce((sum, v) => sum + v.quantity, 0)
                    : product.quantityTotal;
                  
                  const productPrice = hasVariants 
                    ? selectedVariants.length > 0 
                      ? selectedVariants.reduce((sum, v) => sum + parseFloat(v.precioUnitario), 0) / selectedVariants.length
                      : 0
                    : parseFloat(product.price?.toString() || "0");
                  
                  const productTotal = hasVariants 
                    ? selectedVariants.reduce((sum, v) => sum + (parseFloat(v.precioUnitario) * v.quantity), 0)
                    : productPrice * productQuantity;

                  return (
                    <React.Fragment key={product.productId}>
                      <TableRow className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Cotizado
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {hasVariants && selectedVariants.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleProductExpansion(product.productId)}
                              >
                                {expandedProducts.has(product.productId) ? (
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
                                  {selectedVariants.length} variante{selectedVariants.length !== 1 ? "s" : ""} cotizada{selectedVariants.length !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasVariants ? (
                            <span className="font-semibold text-primary">Ver variantes</span>
                          ) : (
                            <span className="font-semibold text-green-600">
                              ${productPrice.toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{productQuantity}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">USD {productTotal.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-blue-600">
                            {(product.equivalence || 0).toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-orange-600">
                            USD {(product.importCosts || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-green-600">
                            USD {(product.totalCost || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-purple-600">
                            USD {(product.unitCost || 0).toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>

                      {hasVariants && expandedProducts.has(product.productId) && selectedVariants.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="p-0">
                            <div className="bg-card border-t">
                              <div className="p-4 space-y-3">
                                <h4 className="font-semibold text-card-foreground mb-3">Variantes Cotizadas</h4>
                                {selectedVariants.map((variant) => {
                                  const variantPrice = parseFloat(variant.precioUnitario);
                                  const variantTotal = variantPrice * variant.quantity;
                                  
                                  return (
                                    <div
                                      key={variant.variantId}
                                      className="grid grid-cols-16 gap-2 p-3 bg-background rounded-md border items-center"
                                    >
                                      <div className="col-span-1">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                          ✓
                                        </Badge>
                                      </div>
                                      <div className="col-span-3 space-y-1">
                                        <div className="text-sm font-medium text-foreground">
                                          Variante #{variant.variantId.slice(-4)}
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Precio Unitario</label>
                                        <div className="h-8 flex items-center">
                                          <span className="text-sm font-semibold text-green-600">
                                            ${variantPrice.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Cantidad</label>
                                        <div className="h-8 flex items-center">
                                          <span className="text-sm font-medium">
                                            {variant.quantity}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Total</label>
                                        <div className="h-8 flex items-center">
                                          <span className="text-sm font-semibold text-primary">
                                            USD {variantTotal.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Equivalencia %</label>
                                        <div className="h-8 flex items-center">
                                          <span className="text-sm font-medium text-blue-600">
                                            {(variant.equivalence || 0).toFixed(2)}%
                                          </span>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Gastos Importación</label>
                                        <div className="h-8 flex items-center">
                                          <span className="text-sm font-medium text-orange-600">
                                            USD {(variant.importCosts || 0).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Costo Total</label>
                                        <div className="h-8 flex items-center">
                                          <span className="text-sm font-semibold text-green-600">
                                            USD {(variant.totalCost || 0).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Costo Unitario</label>
                                        <div className="h-8 flex items-center">
                                          <span className="text-sm font-semibold text-purple-600">
                                            USD {(variant.unitCost || 0).toFixed(2)}
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