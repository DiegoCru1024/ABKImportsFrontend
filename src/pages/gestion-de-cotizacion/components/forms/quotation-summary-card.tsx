import {
  Package,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatCurrency } from "@/lib/functions";

interface QuotationSummaryCardProps {
  productCount: number;
  totalCBM: number;
  totalWeight: number;
  totalPrice: number;
  totalExpress: number;
  totalGeneral: number;
  itemCount?: number; // Opcional para vista pendiente
}

export function QuotationSummaryCard({
  productCount,
  totalCBM,
  totalWeight,
  totalPrice,
  totalExpress,
  totalGeneral,
  itemCount,
}: QuotationSummaryCardProps) {
  return (
    <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Gestión de Productos
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Administre los productos de la cotización con sus variantes y configuraciones
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {productCount} productos
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200/60 rounded-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Resumen de Cotización
            </h2>
            <p className="text-slate-600 text-sm">
              Información general de la cotización actual
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-center justify-center max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {itemCount !== undefined ? itemCount : productCount}
              </div>
              <div className="text-xs font-medium text-slate-600">
                N° de Items
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {productCount}
              </div>
              <div className="text-xs font-medium text-slate-600">
                N° PRODUCTOS
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {totalCBM.toFixed(2)}
              </div>
              <div className="text-xs font-medium text-slate-600">
                CBM TOTAL
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {totalWeight.toFixed(1)}
              </div>
              <div className="text-xs font-medium text-slate-600">
                PESO (KG)
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-emerald-600 mb-1">
                {formatCurrency(totalPrice)}
              </div>
              <div className="text-xs font-medium text-slate-600">P. TOTAL</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-emerald-600 mb-1">
                {formatCurrency(totalExpress)}
              </div>
              <div className="text-xs font-medium text-slate-600">EXPRESS</div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-white mb-1">
                {formatCurrency(totalGeneral)}
              </div>
              <div className="text-xs font-medium text-emerald-100">TOTAL</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}