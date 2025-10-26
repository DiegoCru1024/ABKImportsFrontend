import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ProductVariant } from "../../utils/types/local.types";


interface ProductSummaryProps {
  variants: ProductVariant[];
  productCount: number;
}

export const ProductSummary = ({ variants, productCount }: ProductSummaryProps) => {
  const totalQuantity = variants.reduce((sum, variant) => sum + variant.quantity, 0);

  return (
    <Card className="rounded-lg border border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 ">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-orange-500">
          <Package className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">Resumen</h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Productos:
          </span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {productCount}
          </span>
        </div>

        <div className="h-px bg-orange-200 dark:bg-orange-800" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cantidad Total:
          </span>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {totalQuantity}
          </span>
        </div>
      </div>
    </Card>
  );
};
