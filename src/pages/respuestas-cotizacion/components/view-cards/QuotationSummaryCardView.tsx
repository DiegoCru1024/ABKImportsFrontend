import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChartBar, DollarSign, Package, TrendingUp, Weight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardTitle } from "@/components/ui/card";

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
  // Asegurar que los valores existan con valores por defecto
  const totalWeight = resumenInfo?.totalWeight ?? 0;
  const totalCBM = resumenInfo?.totalCBM ?? 0;
  const totalQuantity = resumenInfo?.totalQuantity ?? 0;
  const totalPrice = resumenInfo?.totalPrice ?? 0;
  const totalExpress = resumenInfo?.totalExpress ?? 0;
  const grandTotal = totalPrice + totalExpress;

  const summaryItems = [
    {
      key: "totalQuantity",
      label: "CANTIDAD TOTAL",
      value: `${totalQuantity} unidades`,
      icon: <Package className="h-4 w-4 text-blue-500" />,
      color: "blue",
      category: "Productos",
    },
    {
      key: "totalWeight",
      label: "PESO TOTAL",
      value: `${totalWeight.toFixed(2)} kg`,
      icon: <Weight className="h-4 w-4 text-green-500" />,
      color: "green",
      category: "Medidas",
    },
    {
      key: "totalCBM",
      label: "VOLUMEN TOTAL",
      value: `${totalCBM.toFixed(2)} m³`,
      icon: <ChartBar className="h-4 w-4 text-purple-500" />,
      color: "purple",
      category: "Medidas",
    },
  ];

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="quotation-summary" className="border-0">
        <div className="shadow-lg border-1 border-indigo-200 bg-white rounded-lg">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg rounded-b-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-indigo-200 rounded-lg">
                  <ChartBar className="h-6 w-6 text-indigo-700" />
                </div>
                <div>
                  <div>Resumen de Cotización</div>
                  <div className="text-sm font-normal text-indigo-700">
                    Información consolidada
                  </div>
                </div>
              </CardTitle>
            </AccordionTrigger>
          </div>

          <AccordionContent>
            <div className="space-y-4 p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-800 border-indigo-200"
                  >
                    RESUMEN
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Totales de la cotización
                  </span>
                </div>

                {/* Grid de 3 columnas responsive */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {summaryItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex flex-col p-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 bg-${item.color}-50 rounded-lg`}>
                          {item.icon}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.category}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900 text-xs mb-1">
                        {item.label}
                      </div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sección de precios - Grid de 3 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                  {/* Precio Total */}
                  <div className="flex flex-col justify-between p-4 bg-gradient-to-br from-emerald-200 to-green-200 text-emerald-900 rounded-lg shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-emerald-300 rounded-lg">
                        <DollarSign className="h-4 w-4 text-emerald-800" />
                      </div>
                      <div className="font-bold text-sm">Precio Total</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl sm:text-2xl">
                        USD {totalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs opacity-90">Costo de productos</div>
                    </div>
                  </div>

                  {/* Total Express */}
                  <div className="flex flex-col justify-between p-4 bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-900 rounded-lg shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-blue-300 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-800" />
                      </div>
                      <div className="font-bold text-sm">Total Express</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl sm:text-2xl">
                        USD {totalExpress.toFixed(2)}
                      </div>
                      <div className="text-xs opacity-90">Servicio express</div>
                    </div>
                  </div>

                  {/* P. Total - Destacado */}
                  <div className="flex flex-col justify-between p-4 bg-gradient-to-br from-orange-200 to-amber-200 text-orange-900 rounded-lg shadow-lg border-2 border-orange-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-orange-300 rounded-lg">
                        <DollarSign className="h-5 w-5 text-orange-800" />
                      </div>
                      <div className="font-bold text-base">P. TOTAL</div>
                    </div>
                    <div>
                      <div className="font-bold text-2xl sm:text-3xl">
                        USD {grandTotal.toFixed(2)}
                      </div>
                      <div className="text-xs opacity-90">
                        Productos + Express
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
