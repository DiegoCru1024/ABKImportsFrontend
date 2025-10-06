import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChartBar, DollarSign, FileText, TrendingUp } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface ImportSummaryCardViewProps {
  quoteSummary: {
    totalExpenses: number;
    comercialValue: number;
    totalInvestment: number;
  };
}

export default function ImportSummaryCardView({
  quoteSummary,
}: ImportSummaryCardViewProps) {
  const summaryItems = [
    {
      key: "comercialValue",
      label: "VALOR DE COMPRA FACTURA COMERCIAL",
      value: `USD ${quoteSummary.comercialValue.toFixed(2)}`,
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      color: "blue",
      category: "Compra",
    },
    {
      key: "totalExpenses",
      label: "TOTAL GASTOS DE IMPORTACIÓN",
      value: `USD ${quoteSummary.totalExpenses.toFixed(2)}`,
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
      color: "green",
      category: "Gastos",
    },
    {
      key: "totalInvestment",
      label: "INVERSIÓN TOTAL DE IMPORTACIÓN",
      value: `USD ${quoteSummary.totalInvestment.toFixed(2)}`,
      icon: <TrendingUp className="h-4 w-4 text-orange-500" />,
      color: "orange",
      category: "Inversión",
    },
  ];

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="import-summary" className="border-0">
        <div className="shadow-lg border-1 border-purple-200 bg-white rounded-lg">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg rounded-b-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <ChartBar className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <div>Resumen de Gastos de Importación</div>
                  <div className="text-sm font-normal text-purple-700">
                    Resumen consolidado
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
                    className="bg-purple-100 text-purple-800 border-purple-200"
                  >
                    RESUMEN
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Detalles de la importación
                  </span>
                </div>

                <div className="space-y-3">
                  {summaryItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-200 hover:shadow-sm"
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

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-900 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-300 rounded-lg">
                        <DollarSign className="h-5 w-5 text-purple-800" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          INVERSIÓN TOTAL DE IMPORTACIÓN
                        </div>
                        <div className="text-sm opacity-90">
                          Valor comercial + Gastos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl">
                        USD {quoteSummary.totalInvestment.toFixed(2)}
                      </div>
                      <div className="text-sm opacity-90">Compra + Gastos</div>
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
