import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { columnsEditableUnitcost } from "../table/columnseditableunitcost";
import { DataTable } from "@/components/table/data-table";

export interface ProductVariant {
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
}

export interface ProductRow {
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
  // Nuevas props para manejar cotización de variantes
  productQuotationState?: Record<string, boolean>;
  variantQuotationState?: Record<string, Record<string, boolean>>;
  onProductQuotationChange?: (productId: string, checked: boolean) => void;
  onVariantQuotationChange?: (
    productId: string,
    variantId: string,
    checked: boolean
  ) => void;
}

const EditableUnitCostTable: React.FC<EditableUnitCostTableProps> = ({
  totalImportCosts = 0,
  onCommercialValueChange,
  isFirstPurchase = false,
  initialProducts = [],
  onProductsChange,
  productQuotationState = {},
  variantQuotationState = {},
  onProductQuotationChange,
  onVariantQuotationChange,
}) => {
  // Estado para primera compra
  const [firstPurchase, setFirstPurchase] = useState(isFirstPurchase);

  const [productsList, setProductsList] = useState<ProductRow[]>(
    initialProducts.length > 0 ? initialProducts : []
  );

  useEffect(() => {
    const recalculated = recalculateProducts(initialProducts);
    setProductsList(recalculated);
  }, [
    initialProducts,
    totalImportCosts,
    productQuotationState,
    variantQuotationState,
  ]); // Depende de los datos del padre, costos y estados de cotización

  // Función para calcular el factor M
  const calculateFactorM = (products: ProductRow[]): number => {
    if (
      products.length === 0 ||
      products[0].price === 0 ||
      products[0].unitCost === 0
    ) {
      return 0;
    }
    return products[0].unitCost / products[0].price;
  };

  // Recalcular todos los valores cuando cambien los productos
  const recalculateProducts = (updatedProducts: ProductRow[]) => {
    // Crear una lista plana de todos los productos y variantes que se cotizan
    const allItems: Array<{
      id: string;
      total: number;
      isVariant: boolean;
      productId?: string;
    }> = [];

    updatedProducts.forEach((product) => {
      // Verificar si el producto se cotiza
      const productShouldQuote =
        productQuotationState[product.id] !== undefined
          ? productQuotationState[product.id]
          : product.seCotiza;

      if (productShouldQuote) {
        // Si el producto tiene variantes, agregar las variantes que se cotizan
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((variant) => {
            const variantShouldQuote =
              variantQuotationState[product.id]?.[variant.id] !== undefined
                ? variantQuotationState[product.id][variant.id]
                : variant.seCotiza;

            if (variantShouldQuote) {
              allItems.push({
                id: variant.id,
                total: variant.total || 0,
                isVariant: true,
                productId: product.id,
              });
            }
          });
        } else {
          // Si no tiene variantes, agregar el producto principal
          allItems.push({
            id: product.id,
            total: product.total || 0,
            isVariant: false,
          });
        }
      }
    });

    // Calcular valor comercial total (sumatoria de todos los totales de productos/variantes que se cotizan)
    const totalCommercialValue =
      allItems.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

    const recalculatedProducts = updatedProducts.map((product) => {
      // Verificar si el producto se cotiza
      const productShouldQuote =
        productQuotationState[product.id] !== undefined
          ? productQuotationState[product.id]
          : product.seCotiza;

      if (product.variants && product.variants.length > 0) {
        // Producto con variantes
        const recalculatedVariants = product.variants.map((variant) => {
          const variantShouldQuote =
            variantQuotationState[product.id]?.[variant.id] !== undefined
              ? variantQuotationState[product.id][variant.id]
              : variant.seCotiza;

          if (variantShouldQuote) {
            // Calcular equivalencia: (total de la variante / valor comercial) * 100
            const equivalence =
              totalCommercialValue > 0
                ? (variant.total / totalCommercialValue) * 100
                : 0;

            // Calcular gastos de importación: totalGastosImportacion * (equivalencia / 100)
            const importCosts = (equivalence / 100) * totalImportCosts;

            // Calcular costo total: total + gastos de importación
            const totalCost = variant.total + importCosts;

            // Calcular costo unitario: costo total / cantidad
            const unitCost =
              variant.quantity > 0 ? totalCost / variant.quantity : 0;

            return {
              ...variant,
              equivalence: Math.round(equivalence * 100) / 100,
              importCosts: Math.round(importCosts * 100) / 100,
              totalCost: Math.round(totalCost * 100) / 100,
              unitCost: Math.round(unitCost * 100) / 100,
              seCotiza: variantShouldQuote,
            };
          } else {
            return {
              ...variant,
              equivalence: 0,
              importCosts: 0,
              totalCost: 0,
              unitCost: 0,
              seCotiza: false,
            };
          }
        });

        // Calcular totales del producto basado en sus variantes
        const productTotal = recalculatedVariants
          .filter((v) => v.seCotiza)
          .reduce((sum, variant) => sum + variant.total, 0);

        const productEquivalence = recalculatedVariants
          .filter((v) => v.seCotiza)
          .reduce((sum, variant) => sum + variant.equivalence, 0);

        const productImportCosts = recalculatedVariants
          .filter((v) => v.seCotiza)
          .reduce((sum, variant) => sum + variant.importCosts, 0);

        const productTotalCost = recalculatedVariants
          .filter((v) => v.seCotiza)
          .reduce((sum, variant) => sum + variant.totalCost, 0);

        const productQuantity = recalculatedVariants
          .filter((v) => v.seCotiza)
          .reduce((sum, variant) => sum + variant.quantity, 0);

        const productUnitCost =
          productQuantity > 0 ? productTotalCost / productQuantity : 0;

        return {
          ...product,
          variants: recalculatedVariants,
          total: Math.round(productTotal * 100) / 100,
          equivalence: Math.round(productEquivalence * 100) / 100,
          importCosts: Math.round(productImportCosts * 100) / 100,
          totalCost: Math.round(productTotalCost * 100) / 100,
          unitCost: Math.round(productUnitCost * 100) / 100,
          seCotiza: productShouldQuote,
        };
      } else {
        // Producto sin variantes
        if (productShouldQuote) {
          // Calcular equivalencia: (total de la fila / valor comercial) * 100
          const equivalence =
            totalCommercialValue > 0
              ? (product.total / totalCommercialValue) * 100
              : 0;

          // Calcular gastos de importación: totalGastosImportacion * (equivalencia / 100)
          const importCosts = (equivalence / 100) * totalImportCosts;

          // Calcular costo total: total + gastos de importación
          const totalCost = product.total + importCosts;

          // Calcular costo unitario: costo total / cantidad
          const unitCost =
            product.quantity > 0 ? totalCost / product.quantity : 0;

          return {
            ...product,
            equivalence: Math.round(equivalence * 100) / 100,
            importCosts: Math.round(importCosts * 100) / 100,
            totalCost: Math.round(totalCost * 100) / 100,
            unitCost: Math.round(unitCost * 100) / 100,
            seCotiza: productShouldQuote,
          };
        } else {
          return {
            ...product,
            equivalence: 0,
            importCosts: 0,
            totalCost: 0,
            unitCost: 0,
            seCotiza: false,
          };
        }
      }
    });

    // Notificar cambio del valor comercial total al componente padre
    if (onCommercialValueChange) {
      const validCommercialValue = Number.isFinite(totalCommercialValue)
        ? totalCommercialValue
        : 0;
      onCommercialValueChange(validCommercialValue);
    }

    return recalculatedProducts;
  };

  // Actualizar producto y recalcular
  const updateProduct = (
    id: string,
    field: keyof ProductRow,
    value: number | boolean
  ) => {
    setProductsList((prev) => {
      const updated = prev.map((product) => {
        if (product.id === id) {
          const updatedProduct = { ...product, [field]: value };

          // Recalcular total cuando cambie precio o cantidad
          if (field === "price" || field === "quantity") {
            updatedProduct.total =
              updatedProduct.price * updatedProduct.quantity;
          }

          return updatedProduct;
        }
        return product;
      });

      const recalculated = recalculateProducts(updated);

      // Notificar cambios al componente padre
      if (onProductsChange) {
        onProductsChange(recalculated);
      }

      return recalculated;
    });
  };

  // Actualizar variante y recalcular
  const updateVariant = (
    productId: string,
    variantId: string,
    field: keyof ProductVariant,
    value: number | boolean
  ) => {
    setProductsList((prev) => {
      const updated = prev.map((product) => {
        if (product.id === productId && product.variants) {
          const updatedVariants = product.variants.map((variant) => {
            if (variant.id === variantId) {
              const updatedVariant = { ...variant, [field]: value };

              // Recalcular total cuando cambie precio o cantidad
              if (field === "price" || field === "quantity") {
                updatedVariant.total =
                  updatedVariant.price * updatedVariant.quantity;
              }

              return updatedVariant;
            }
            return variant;
          });

          return {
            ...product,
            variants: updatedVariants,
          };
        }
        return product;
      });

      const recalculated = recalculateProducts(updated);

      // Notificar cambios al componente padre
      if (onProductsChange) {
        onProductsChange(recalculated);
      }

      return recalculated;
    });
  };

  // Generar columnas con la lógica de actualización
  const columns = columnsEditableUnitcost(
    updateProduct,
    updateVariant,
    productQuotationState,
    variantQuotationState,
    onProductQuotationChange,
    onVariantQuotationChange
  );

  // Actualizar estado de primera compra cuando cambie el prop
  useEffect(() => {
    setFirstPurchase(isFirstPurchase);
  }, [isFirstPurchase]);

  // Calcular totales (solo productos que se cotizan)
  const totalQuantity = productsList
    .filter((product) => product.seCotiza)
    .reduce((sum, product) => sum + product.quantity, 0);
  const totalAmount = productsList
    .filter((product) => product.seCotiza)
    .reduce((sum, product) => sum + product.total, 0);
  const totalImportCostsSum = productsList
    .filter((product) => product.seCotiza)
    .reduce((sum, product) => sum + product.importCosts, 0);
  const grandTotal = productsList
    .filter((product) => product.seCotiza)
    .reduce((sum, product) => sum + product.totalCost, 0);

  // Calcular factor M
  const factorM = calculateFactorM(productsList);

  return (
    <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-center flex-1">
          <div className="relative">
            COSTEO UNITARIO DE IMPORTACIÓN
            <div className="absolute top-0 right-0  text-black px-3 py-1 text-sm font-bold">
              <div className="text-xs">FACTOR M.</div>
              <div>{factorM.toFixed(2)}</div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header con indicadores mejorado */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200/60 rounded-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Resumen de Cotización
            </h2>
            <p className="text-slate-600 text-sm">
              Información general de la cotización actual
            </p>
          </div>

          {/* Indicadores principales con mejor diseño */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-center justify-center max-w-4xl mx-auto">
            {/* Primer indicador  - N° de Items*/}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {productsList.reduce(
                  (sum, product) => sum + (product.variants?.length || 0),
                  0
                ) || 0}
              </div>
              <div className="text-xs font-medium text-slate-600">
                N° ITEMS
              </div>
            </div>
            {/* Segundo indicador - N° de Productos */}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {productsList.length || 0}
              </div>
              <div className="text-xs font-medium text-slate-600">
                N° PRODUCTOS
              </div>
            </div>
            {/* Tercer indicador - CBM Total*/}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">0.00</div>
              <div className="text-xs font-medium text-slate-600">
                CBM TOTAL
              </div>
            </div>
            {/* Cuarto indicador - Peso Total */}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">0.00</div>
              <div className="text-xs font-medium text-slate-600">
                PESO  (KG)
              </div>
            </div>
            {/* Quinto indicador - Precio total */}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-emerald-600 mb-1">
                ${totalAmount.toFixed(2)}
              </div>
              <div className="text-xs font-medium text-slate-600">P. TOTAL</div>
            </div>

            {/* Sexto indicador - Express total */}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-emerald-600 mb-1">
                0.00
              </div>
              <div className="text-xs font-medium text-slate-600">EXPRESS</div>
            </div>
            {/* Septimo indicador - Total */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-white mb-1">
                {grandTotal.toFixed(2)}
              </div>
              <div className="text-xs font-medium text-emerald-100">TOTAL</div>
            </div>
          </div>
        </div>
      </CardContent>
      <DataTable
        columns={columns}
        data={productsList}
        pageInfo={{
          pageNumber: 1,
          pageSize: 10,
          totalElements: productsList.length,
          totalPages: 1,
        }}
        onPageChange={() => {}}
        onSearch={() => {}}
        searchTerm={""}
        isLoading={false}
        paginationOptions={{
          showSelectedCount: false,
          showPagination: false,
          showNavigation: false,
        }}
        toolbarOptions={{
          showSearch: false,
          showViewOptions: false,
        }}
      />
    </Card>
  );
};

export default EditableUnitCostTable;
