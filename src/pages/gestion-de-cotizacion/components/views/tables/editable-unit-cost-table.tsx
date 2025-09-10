import { useState, useEffect, useCallback, useRef } from "react";
import {
  Package,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { columnsEditableUnitcost } from "../../table/columnseditableunitcost";
import { SimpleDataTable } from "@/components/table/simple-data-table";

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
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (products && products.length > 0 && !isInternalUpdate.current) {
      setData(products);
    }
    isInternalUpdate.current = false;
  }, [products]);

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

  const calculateCommercialValue = useCallback(() => {
    return data.reduce((total, product) => {
      // Por defecto es true si no está definido
      const isSelected = productQuotationState[product.id] !== undefined ? productQuotationState[product.id] : true;
      if (isSelected) {
        return total + (product.total || 0);
      }
      return total;
    }, 0);
  }, [data, productQuotationState]);

  useEffect(() => {
    const commercialValue = calculateCommercialValue();
    if (onCommercialValueChange) {
      onCommercialValueChange(commercialValue);
    }
  }, [data, productQuotationState, onCommercialValueChange, calculateCommercialValue]);

  return (
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
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

          <SimpleDataTable
            columns={columnsEditableUnitcost(
              updateProduct,
              updateVariant,
              productQuotationState,
              variantQuotationState,
              onProductQuotationChange,
              onVariantQuotationChange
            )}
            data={data}
            onDataChange={handleDataChange}
            productQuotationState={productQuotationState}
            variantQuotationState={variantQuotationState}
            onProductQuotationChange={onProductQuotationChange}
            onVariantQuotationChange={onVariantQuotationChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export type { ProductRow, ProductVariant };