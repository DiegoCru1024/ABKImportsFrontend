import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  ChartBar,
  DollarSign,
  FileText,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

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
  serviceType?: string;
  hasManualExemption?: boolean;
}

export default function ImportSummaryCardView({
  quoteSummary,
  serviceType = "",
  hasManualExemption = false,
}: ImportSummaryCardViewProps) {
  // Consolidado Express con valor comercial < $200 (Exoneración Tributaria)
  const isExpressConsolidatedPersonal =
    serviceType === "Consolidado Express" && quoteSummary.comercialValue < 200;

  // Consolidado Grupal Express (Descuento del 50% en impuestos)
  const isExpressConsolidatedGrupal =
    serviceType === "Consolidado Grupal Express";
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

                {isExpressConsolidatedPersonal && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-green-800 mb-2">
                          ✓ EXONERACIÓN TRIBUTARIA ACTIVA
                        </h4>
                        <p className="text-sm text-green-700 mb-2">
                          ¡Ahorro en impuestos de importación! El valor
                          comercial es menor a USD $200.00, lo que significa
                          que esta importación está exonerada de impuestos
                          aduaneros (Ad Valorem, IGV, IPM). Solo se aplican los
                          costos de desaduanaje y flete internacional.
                        </p>
                        <div className="text-xs text-green-600 space-y-1">
                          <p>
                            <strong>Beneficio Principal:</strong> Sin Ad
                            Valorem, IGV ni IPM
                          </p>
                          <p>
                            <strong>Gastos Aplicables:</strong> Solo flete y
                            desaduanaje
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isExpressConsolidatedGrupal && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-800 mb-2">
                          ✓ DESCUENTO GRUPAL EXPRESS ACTIVO
                        </h4>
                        <p className="text-sm text-amber-700 mb-2">
                          ¡Beneficios del Consolidado Grupal Express! Esta
                          modalidad incluye:
                        </p>
                        <div className="text-xs text-amber-600 space-y-1">
                          <p>
                            <strong>Exoneración Aplicada:</strong> Inspección de
                            productos EXONERADA
                          </p>
                          <p>
                            <strong>Descuento en Impuestos:</strong> 50% de
                            descuento en AD/VALOREM + IGV + IPM
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hasManualExemption &&
                  !isExpressConsolidatedPersonal &&
                  !isExpressConsolidatedGrupal && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-green-800 mb-2">
                            ✓ EXONERACIÓN AUTOMÁTICA
                          </h4>
                          <p className="text-sm text-green-700 mb-2">
                            Los impuestos están exonerados automáticamente
                            porque el valor comercial es menor a USD $200.00.
                            Esta exoneración aplica a todos los impuestos y
                            aranceles correspondientes.
                          </p>
                          <div className="text-xs text-green-600 space-y-1">
                            <p>
                              <strong>Beneficio Principal:</strong> Ahorro en
                              costos de importación
                            </p>
                            <p>
                              <strong>Gastos Aplicables:</strong> Servicios
                              logísticos básicos
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
