import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";
import { columnsEditableUnitcost } from "../table/columnseditableunitcost";
import { DataTable } from "@/components/table/data-table";

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
}

interface EditableUnitCostTableProps {
  products?: ProductoResponseIdInterface[];
  totalImportCosts?: number;
  onCommercialValueChange?: (value: number) => void;
  isFirstPurchase?: boolean;
  onFirstPurchaseChange?: (value: boolean) => void;
  initialProducts?: ProductRow[];
  onProductsChange?: (products: ProductRow[]) => void;
}

const EditableUnitCostTable: React.FC<EditableUnitCostTableProps> = ({
  products = [],
  totalImportCosts = 0,
  onCommercialValueChange,
  isFirstPurchase = false,
  onFirstPurchaseChange,
  initialProducts = [],
  onProductsChange,
}) => {
  // Estado para primera compra
  const [firstPurchase, setFirstPurchase] = useState(isFirstPurchase);

  const [productsList, setProductsList] = useState<ProductRow[]>(
    initialProducts.length > 0 ? initialProducts : []
  );

  useEffect(() => {
    const recalculated = recalculateProducts(initialProducts);
    setProductsList(recalculated);
  }, [initialProducts, totalImportCosts]); // Depende de los datos del padre y los costos

  // Función para calcular el factor M
  const calculateFactorM = (products: ProductRow[]): number => {
    if (
      products.length === 0 ||
      products[0].price === 0 ||
      products[0].unitCost === 0
    ) {
      return 0;
    }
    return products[0].price / products[0].unitCost;
  };

  // Recalcular todos los valores cuando cambien los productos
  const recalculateProducts = (updatedProducts: ProductRow[]) => {
    // Calcular valor comercial total (sumatoria de todos los totales)
    const totalCommercialValue = updatedProducts.reduce(
      (sum, product) => sum + product.total,
      0
    );

    const recalculatedProducts = updatedProducts.map((product) => {
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
      const unitCost = product.quantity > 0 ? totalCost / product.quantity : 0;

      return {
        ...product,
        equivalence: Math.round(equivalence * 100) / 100, // Redondear a 2 decimales
        importCosts: Math.round(importCosts * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        unitCost: Math.round(unitCost * 100) / 100,
      };
    });

    // Notificar cambio del valor comercial total al componente padre
    if (onCommercialValueChange) {
      onCommercialValueChange(totalCommercialValue);
    }

    return recalculatedProducts;
  };

  // Actualizar producto y recalcular
  const updateProduct = (
    id: string,
    field: keyof ProductRow,
    value: number
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

  // Manejar cambio de primera compra
  const handleFirstPurchaseChange = (checked: boolean) => {
    setFirstPurchase(checked);
    if (onFirstPurchaseChange) {
      onFirstPurchaseChange(checked);
    }
  };

  // Generar columnas con la lógica de actualización
  const columns = columnsEditableUnitcost(updateProduct);

  // Actualizar estado de primera compra cuando cambie el prop
  useEffect(() => {
    setFirstPurchase(isFirstPurchase);
  }, [isFirstPurchase]);

  // Calcular totales
  const totalQuantity = productsList.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const totalAmount = productsList.reduce(
    (sum, product) => sum + product.total,
    0
  );
  const totalImportCostsSum = productsList.reduce(
    (sum, product) => sum + product.importCosts,
    0
  );
  const grandTotal = productsList.reduce(
    (sum, product) => sum + product.totalCost,
    0
  );

  // Calcular factor M
  const factorM = calculateFactorM(productsList);

  return (
    <div className="p-6 bg-gray-50">
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white flex justify-between items-center px-4 py-3">
          <h2 className="text-lg font-bold text-center flex-1">
            COSTEO UNITARIO DE IMPORTACIÓN
          </h2>
          <div className="bg-white text-black px-3 py-1 text-sm font-bold">
            <div className="text-xs">FACTOR M.</div>
            <div>{factorM.toFixed(2)}</div>
          </div>
        </div>



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

        {/* Totals Row */}
        <div className="bg-orange-500 text-white grid grid-cols-8 text-center text-sm font-bold">
          <div className="p-3 border-r border-orange-400">TOTALES</div>
          <div className="p-3 border-r border-orange-400"></div>
          <div className="p-3 border-r border-orange-400">{totalQuantity}</div>
          <div className="p-3 border-r border-orange-400">
            <span className="text-xs mr-1">USD</span>
            {totalAmount.toFixed(2)}
          </div>
          <div className="p-3 border-r border-orange-400">100%</div>
          <div className="p-3 border-r border-orange-400">
            <span className="text-xs mr-1">USD</span>
            {totalImportCostsSum.toFixed(2)}
          </div>
          <div className="p-3 border-r border-orange-400">
            <span className="text-xs mr-1">USD</span>
            {grandTotal.toFixed(2)}
          </div>
          <div className="p-3"></div>
        </div>
      </Card>
    </div>
  );
};

export default EditableUnitCostTable;
