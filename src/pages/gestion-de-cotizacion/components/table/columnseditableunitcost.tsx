import type { ColumnDef } from "@tanstack/react-table";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProductRow, ProductVariant } from "../views/tables/editable-unit-cost-table";

// Definición de columnas dentro del componente para usar callbacks
export function columnsEditableUnitcost(
  updateProduct: (
    id: string,
    field: keyof ProductRow,
    value: number | boolean
  ) => void,
  updateVariant?: (
    productId: string,
    variantId: string,
    field: keyof ProductVariant,
    value: number | boolean
  ) => void,
  productQuotationState?: Record<string, boolean>,
  variantQuotationState?: Record<string, Record<string, boolean>>,
  onProductQuotationChange?: (productId: string, checked: boolean) => void,
  onVariantQuotationChange?: (productId: string, variantId: string, checked: boolean) => void
): ColumnDef<ProductRow, any>[] {
  return [
    {
      id: "seCotiza",
      accessorKey: "seCotiza",
      header: () => <div className="text-center">COTIZAR</div>,
      cell: ({ row }) => {
        const product = row.original;
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Verificar si el producto se cotiza usando el estado externo o interno
        const productShouldQuote = productQuotationState?.[product.id] !== undefined 
          ? productQuotationState[product.id] 
          : product.seCotiza;

        return (
          <div className="flex flex-col gap-2">
            {/* Checkbox del producto principal */}
            <div className="flex justify-center">
              <Checkbox
                checked={productShouldQuote}
                onCheckedChange={(checked) => {
                  if (onProductQuotationChange) {
                    onProductQuotationChange(product.id, checked as boolean);
                  } else {
                    updateProduct(product.id, "seCotiza", checked as boolean);
                  }
                }}
              />
            </div>
            
            {/* Checkboxes de variantes si existen */}
            {hasVariants && productShouldQuote && product.variants && (
              <div className="flex flex-col gap-1 ml-4">
                {product.variants.map((variant) => {
                  const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                    ? variantQuotationState[product.id][variant.id]
                    : variant.seCotiza;
                  
                  return (
                    <div key={variant.id} className="flex justify-center">
                      <Checkbox
                        checked={variantShouldQuote}
                        onCheckedChange={(checked) => {
                          if (onVariantQuotationChange) {
                            onVariantQuotationChange(product.id, variant.id, checked as boolean);
                          } else if (updateVariant) {
                            updateVariant(product.id, variant.id, "seCotiza", checked as boolean);
                          }
                        }}
                        className="scale-75"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      minSize: 80,
      size: 100,
      maxSize: 120,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "NOMBRE DEL PRODUCTO",
      cell: ({ row }) => {
        const product = row.original;
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Verificar si el producto se cotiza usando el estado externo o interno
        const productShouldQuote = productQuotationState?.[product.id] !== undefined 
          ? productQuotationState[product.id] 
          : product.seCotiza;

        return (
          <div className="flex flex-col">
            {/* Nombre del producto principal */}
            <div className={`font-medium ${!productShouldQuote ? "text-gray-400" : ""}`}>
              {product.name}
            </div>
            
            {/* Nombres de variantes si existen */}
            {hasVariants && productShouldQuote && product.variants && (
              <div className="ml-4 mt-1 space-y-1">
                {product.variants.map((variant) => {
                  const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                    ? variantQuotationState[product.id][variant.id]
                    : variant.seCotiza;
                  
                  return (
                    <div 
                      key={variant.id} 
                      className={`text-sm ${!variantShouldQuote ? "text-gray-400" : "text-gray-600"}`}
                    >
                      • {variant.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "price",
      accessorKey: "price",
      header: () => <div className="text-center">PRECIO</div>,
      cell: ({ row }) => {
        const product = row.original;
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Verificar si el producto se cotiza usando el estado externo o interno
        const productShouldQuote = productQuotationState?.[product.id] !== undefined 
          ? productQuotationState[product.id] 
          : product.seCotiza;

        return (
          <div className="flex flex-col gap-2">
            {/* Precio del producto principal (solo si no tiene variantes) */}
            {!hasVariants && (
              <EditableNumericField
                value={product.price}
                onChange={(value) => {
                  updateProduct(product.id, "price", value);
                }}
                disabled={!productShouldQuote}
              />
            )}
            
            {/* Precios de variantes si existen */}
            {hasVariants && productShouldQuote && product.variants && (
              <div className="space-y-1">
                {product.variants.map((variant) => {
                  const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                    ? variantQuotationState[product.id][variant.id]
                    : variant.seCotiza;
                  
                  return (
                    <EditableNumericField
                      key={variant.id}
                      value={variant.price}
                      onChange={(value) => {
                        if (updateVariant) {
                          updateVariant(product.id, variant.id, "price", value);
                        }
                      }}
                      disabled={!variantShouldQuote}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: () => <div className="text-center">CANTIDAD</div>,
      cell: ({ row }) => {
        const product = row.original;
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Verificar si el producto se cotiza usando el estado externo o interno
        const productShouldQuote = productQuotationState?.[product.id] !== undefined 
          ? productQuotationState[product.id] 
          : product.seCotiza;

        return (
          <div className="flex flex-col gap-2">
            {/* Cantidad del producto principal (solo si no tiene variantes) */}
            {!hasVariants && (
              <EditableNumericField
                value={product.quantity}
                onChange={(value) => {
                  updateProduct(product.id, "quantity", value);
                }}
                disabled={!productShouldQuote}
              />
            )}
            
            {/* Cantidades de variantes si existen */}
            {hasVariants && productShouldQuote && product.variants && (
              <div className="space-y-1">
                {product.variants.map((variant) => {
                  const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                    ? variantQuotationState[product.id][variant.id]
                    : variant.seCotiza;
                  
                  return (
                    <EditableNumericField
                      key={variant.id}
                      value={variant.quantity}
                      onChange={(value) => {
                        if (updateVariant) {
                          updateVariant(product.id, variant.id, "quantity", value);
                        }
                      }}
                      disabled={!variantShouldQuote}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "total",
      accessorKey: "total",
      header: () => <div className="text-center">TOTAL</div>,
       cell: ({ row }) => {
         const product = row.original;
         const hasVariants = product.variants && product.variants.length > 0;
         
         // Verificar si el producto se cotiza usando el estado externo o interno
         const productShouldQuote = productQuotationState?.[product.id] !== undefined 
           ? productQuotationState[product.id] 
           : product.seCotiza;

         return (
           <div className="flex flex-col">
             {/* Total del producto principal */}
             <div className={`text-center font-semibold ${!productShouldQuote ? "text-gray-400" : ""}`}>
               USD {(Number(product.total) || 0).toFixed(2)}
             </div>
             
             {/* Totales de variantes si existen */}
             {hasVariants && productShouldQuote && product.variants && (
               <div className="space-y-1">
                 {product.variants.map((variant) => {
                   const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                     ? variantQuotationState[product.id][variant.id]
                     : variant.seCotiza;
                   
                   return (
                     <div 
                       key={variant.id} 
                       className={`text-center text-sm ${!variantShouldQuote ? "text-gray-400" : "text-gray-600"}`}
                     >
                       USD {(Number(variant.total) || 0).toFixed(2)}
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
         );
       },
       minSize: 150,
       size: 200,
       maxSize: 250,
     },
    {
      id: "equivalence",
      accessorKey: "equivalence",
      header: () => <div className="text-center">EQUIVALENCIA</div>,
      cell: ({ row }) => {
        const product = row.original;
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Verificar si el producto se cotiza usando el estado externo o interno
        const productShouldQuote = productQuotationState?.[product.id] !== undefined 
          ? productQuotationState[product.id] 
          : product.seCotiza;

        return (
          <div className="flex flex-col">
            {/* Equivalencia del producto principal */}
            <div className={`text-center font-semibold ${!productShouldQuote ? "text-gray-400" : ""}`}>
              {(Number(product.equivalence) || 0).toFixed(2)}%
            </div>
            
            {/* Equivalencias de variantes si existen */}
            {hasVariants && productShouldQuote && product.variants && (
              <div className="space-y-1">
                {product.variants.map((variant) => {
                  const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                    ? variantQuotationState[product.id][variant.id]
                    : variant.seCotiza;
                  
                  return (
                    <div 
                      key={variant.id} 
                      className={`text-center text-sm ${!variantShouldQuote ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {(Number(variant.equivalence) || 0).toFixed(2)}%
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "importCosts",
      accessorKey: "importCosts",
      header: () => <div className="text-center">GASTOS DE IMPORTACIÓN</div>,
      cell: ({ row }) => {
        const product = row.original;
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Verificar si el producto se cotiza usando el estado externo o interno
        const productShouldQuote = productQuotationState?.[product.id] !== undefined 
          ? productQuotationState[product.id] 
          : product.seCotiza;

        return (
          <div className="flex flex-col">
            {/* Gastos de importación del producto principal */}
            <div className={`text-center font-semibold ${!productShouldQuote ? "text-gray-400" : ""}`}>
              USD {(Number(product.importCosts) || 0).toFixed(2)}
            </div>
            
            {/* Gastos de importación de variantes si existen */}
            {hasVariants && productShouldQuote && product.variants && (
              <div className="space-y-1">
                {product.variants.map((variant) => {
                  const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                    ? variantQuotationState[product.id][variant.id]
                    : variant.seCotiza;
                  
                  return (
                    <div 
                      key={variant.id} 
                      className={`text-center text-sm ${!variantShouldQuote ? "text-gray-400" : "text-gray-600"}`}
                    >
                      USD {(Number(variant.importCosts) || 0).toFixed(2)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "totalCost",
      accessorKey: "totalCost",
      header: () => <div className="text-center">COSTO TOTAL</div>,
      cell: ({ row }) => {
        const product = row.original;
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Verificar si el producto se cotiza usando el estado externo o interno
        const productShouldQuote = productQuotationState?.[product.id] !== undefined 
          ? productQuotationState[product.id] 
          : product.seCotiza;

        return (
          <div className="flex flex-col">
            {/* Costo total del producto principal */}
            <div className={`text-center font-semibold ${!productShouldQuote ? "text-gray-400" : ""}`}>
              USD {(Number(product.totalCost) || 0).toFixed(2)}
            </div>
            
            {/* Costos totales de variantes si existen */}
            {hasVariants && productShouldQuote && product.variants && (
              <div className="space-y-1">
                {product.variants.map((variant) => {
                  const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                    ? variantQuotationState[product.id][variant.id]
                    : variant.seCotiza;
                  
                  return (
                    <div 
                      key={variant.id} 
                      className={`text-center text-sm ${!variantShouldQuote ? "text-gray-400" : "text-gray-600"}`}
                    >
                      USD {(Number(variant.totalCost) || 0).toFixed(2)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "unitCost",
      accessorKey: "unitCost",
      header: () => <div className="text-center">COSTO UNITARIO</div>,
      cell: ({ row }) => {
        const product = row.original;
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Verificar si el producto se cotiza usando el estado externo o interno
        const productShouldQuote = productQuotationState?.[product.id] !== undefined 
          ? productQuotationState[product.id] 
          : product.seCotiza;

        return (
          <div className="flex flex-col">
            {/* Costo unitario del producto principal */}
            <div className={`text-center font-semibold ${!productShouldQuote ? "text-gray-400" : ""}`}>
              USD {(Number(product.unitCost) || 0).toFixed(2)}
            </div>
            
            {/* Costos unitarios de variantes si existen */}
            {hasVariants && productShouldQuote && product.variants && (
              <div className="space-y-1">
                {product.variants.map((variant) => {
                  const variantShouldQuote = variantQuotationState?.[product.id]?.[variant.id] !== undefined
                    ? variantQuotationState[product.id][variant.id]
                    : variant.seCotiza;
                  
                  return (
                    <div 
                      key={variant.id} 
                      className={`text-center text-sm ${!variantShouldQuote ? "text-gray-400" : "text-gray-600"}`}
                    >
                      USD {(Number(variant.unitCost) || 0).toFixed(2)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
  ];
}
