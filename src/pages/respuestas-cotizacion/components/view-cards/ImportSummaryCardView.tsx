import {
  ChartBar,
  DollarSign,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

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
  const isExpressConsolidatedPersonal =
    serviceType === "Consolidado Express" && quoteSummary.comercialValue < 200;

  const isExpressConsolidatedGrupal =
    serviceType === "Consolidado Grupal Express";

  const summaryItems = [
    {
      key: "comercialValue",
      label: "Valor de Compra Factura Comercial",
      value: quoteSummary.comercialValue,
      icon: <FileText className="h-4 w-4 text-blue-500" />,
    },
    {
      key: "totalExpenses",
      label: "Total Gastos de Importación",
      value: quoteSummary.totalExpenses,
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
    },
  ];

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBar className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Resumen de Gastos de Importación</h3>
              <p className="text-xs text-gray-500">Resumen consolidado</p>
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
                  USD {item.value.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Inversión Total de Importación</span>
                  <p className="text-xs text-gray-500">Valor total final</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-700">
                  USD {quoteSummary.totalInvestment.toFixed(2)}
                </p>
              </div>
            </div>

            {isExpressConsolidatedPersonal && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-green-800">Exoneración Tributaria Activa</span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      El valor comercial es menor a <strong>USD $200.00</strong>, lo que exonera esta importación de impuestos aduaneros (Ad Valorem, IGV, IPM).
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-100 rounded p-2">
                        <div className="font-semibold text-green-800">Beneficio</div>
                        <div className="text-green-700">Sin impuestos aduaneros</div>
                      </div>
                      <div className="bg-green-100 rounded p-2">
                        <div className="font-semibold text-green-800">Gastos</div>
                        <div className="text-green-700">Flete y desaduanaje</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isExpressConsolidatedGrupal && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-amber-800">Descuento Grupal Express Activo</span>
                    </div>
                    <p className="text-sm text-amber-700 mb-3">
                      Beneficios del Consolidado Grupal Express aplicados.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-amber-100 rounded p-2">
                        <div className="font-semibold text-amber-800">Exoneración</div>
                        <div className="text-amber-700">Inspección exonerada</div>
                      </div>
                      <div className="bg-amber-100 rounded p-2">
                        <div className="font-semibold text-amber-800">Descuento</div>
                        <div className="text-amber-700">50% en impuestos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasManualExemption && !isExpressConsolidatedPersonal && !isExpressConsolidatedGrupal && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-green-800">Exoneración Automática</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Impuestos exonerados por valor comercial menor a <strong>USD $200.00</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
