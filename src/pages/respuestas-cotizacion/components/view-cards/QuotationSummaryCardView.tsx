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
  const summaryItems = [
    {
      key: "totalQuantity",
      label: "CANTIDAD TOTAL",
      value: `${resumenInfo.totalQuantity} unidades`,
      icon: <Package className="h-4 w-4 text-blue-500" />,
      color: "blue",
      category: "Productos",
    },
    {
      key: "totalWeight",
      label: "PESO TOTAL",
      value: `${resumenInfo.totalWeight.toFixed(2)} kg`,
      icon: <Weight className="h-4 w-4 text-green-500" />,
      color: "green",
      category: "Medidas",
    },
    {
      key: "totalCBM",
      label: "VOLUMEN TOTAL",
      value: `${resumenInfo.totalCBM.toFixed(2)} m³`,
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
            <div className="space-y-4 p-6">
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

                <div className="space-y-3">
                  {summaryItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${item.color}-50 rounded-lg`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-200 to-green-200 text-emerald-900 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-300 rounded-lg">
                        <DollarSign className="h-5 w-5 text-emerald-800" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Precio Total</div>
                        <div className="text-sm opacity-90">
                          Costo de productos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl">
                        USD {resumenInfo.totalPrice.toFixed(2)}
                      </div>
                      <div className="text-sm opacity-90">Total productos</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-900 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-300 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-800" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Total Express</div>
                        <div className="text-sm opacity-90">
                          Servicio express
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl">
                        USD {resumenInfo.totalExpress.toFixed(2)}
                      </div>
                      <div className="text-sm opacity-90">Costo express</div>
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
