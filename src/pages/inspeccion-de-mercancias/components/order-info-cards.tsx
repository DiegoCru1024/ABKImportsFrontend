import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, FileText, Truck, CreditCard } from "lucide-react";
import type { InspectionOrderSummary } from "@/api/interface/inspectionInterface";

interface OrderInfoCardsProps {
  summary: InspectionOrderSummary | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return "$ --";
  return `$ ${value.toLocaleString("es-PE")}`;
}

export function OrderInfoCards({ summary, isLoading }: OrderInfoCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-24" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* Tipo de Mercancia */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="h-3 w-3 text-blue-500" />
            <p className="text-[10px] font-medium text-gray-500">Tipo de Mercancia</p>
          </div>
          <p className="text-sm font-bold text-blue-600">
            {summary?.cargo_type_label || "Sin dato"}
          </p>
        </CardContent>
      </Card>

      {/* Costo Total Producto */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="h-3 w-3 text-emerald-500" />
            <p className="text-[10px] font-medium text-gray-500">Costo Total Producto</p>
          </div>
          <p className="text-lg font-bold text-emerald-600">
            {formatCurrency(summary?.total_product_cost)}
          </p>
        </CardContent>
      </Card>

      {/* Impuestos Aduaneros */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="h-3 w-3 text-amber-500" />
            <p className="text-[10px] font-medium text-gray-500">Impuestos Aduaneros</p>
          </div>
          <p className="text-lg font-bold text-amber-600">
            {formatCurrency(summary?.customs_taxes)}
          </p>
        </CardContent>
      </Card>

      {/* Servicios Logisticos */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Truck className="h-3 w-3 text-purple-500" />
            <p className="text-[10px] font-medium text-gray-500">Servicios Logisticos</p>
          </div>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(summary?.logistics_services)}
          </p>
        </CardContent>
      </Card>

      {/* Pago Pendiente */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard className="h-3 w-3 text-red-500" />
            <p className="text-[10px] font-medium text-gray-500">Pago Pendiente</p>
          </div>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(summary?.pending_payment)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
