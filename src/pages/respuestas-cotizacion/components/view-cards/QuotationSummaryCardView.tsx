import React from "react";
import { ChartBar, DollarSign, Package, TrendingUp, Weight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export interface QuotationSummaryCardViewProps {
  resumenInfo: {
    totalCBM: number;
    totalPrice: number;
    totalWeight: number;
    totalExpress: number;
    totalQuantity: number;
  };
}

export default function QuotationSummaryCardView({
  resumenInfo,
}: QuotationSummaryCardViewProps) {
  const totalWeight = resumenInfo?.totalWeight ?? 0;
  const totalCBM = resumenInfo?.totalCBM ?? 0;
  const totalQuantity = resumenInfo?.totalQuantity ?? 0;
  const totalPrice = resumenInfo?.totalPrice ?? 0;
  const totalExpress = resumenInfo?.totalExpress ?? 0;
  const grandTotal = totalPrice + totalExpress;

  const summaryItems = [
    {
      key: "totalQuantity",
      label: "Cantidad Total",
      value: `${totalQuantity} unidades`,
      icon: <Package className="h-4 w-4 text-blue-500" />,
    },
    {
      key: "totalWeight",
      label: "Peso Total",
      value: `${totalWeight.toFixed(2)} kg`,
      icon: <Weight className="h-4 w-4 text-green-500" />,
    },
    {
      key: "totalCBM",
      label: "Volumen Total",
      value: `${totalCBM.toFixed(2)} m³`,
      icon: <ChartBar className="h-4 w-4 text-purple-500" />,
    },
  ];

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ChartBar className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Resumen de Cotización</h3>
              <p className="text-xs text-gray-500">Información consolidada</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-32 gap-y-4">
            {summaryItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Precio Total</span>
                  <p className="text-xs text-gray-500">Costo de productos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-700">
                  USD {totalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Total Express</span>
                  <p className="text-xs text-gray-500">Servicio express</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-700">
                  USD {totalExpress.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <div>
                  <span className="text-sm font-bold text-gray-900">Costo Total</span>
                  <p className="text-xs text-gray-500">Productos + Express</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-orange-700">
                  USD {grandTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
