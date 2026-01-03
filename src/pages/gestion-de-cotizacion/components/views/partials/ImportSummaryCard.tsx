import { AlertTriangle, ChartBar, DollarSign, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface ImportSummaryCardProps {
  exemptionState: {
    adValorem: boolean;
    igv: boolean;
    ipm: boolean;
    percepcion: boolean;
  };
  comercialValue: number;
  totalImportCosts: number;
  isExpressConsolidatedPersonal?: boolean;
  isExpressConsolidatedGrupal?: boolean;
}

export default function ImportSummaryCard({
  exemptionState,
  comercialValue,
  totalImportCosts,
  isExpressConsolidatedPersonal = false,
  isExpressConsolidatedGrupal=false,
}: ImportSummaryCardProps) {
  const isAnyExempted = Object.values(exemptionState).some(Boolean);
  const showExemptionMessage = isAnyExempted || isExpressConsolidatedPersonal;
  const showExemptionGrupalMessage=isExpressConsolidatedGrupal;
  
  const summaryItems = [
    {
      key: 'comercialValue',
      label: 'VALOR DE COMPRA FACTURA COMERCIAL',
      value: `USD ${comercialValue.toFixed(2)}`,
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      color: 'blue',
      category: 'Compra'
    },
    {
      key: 'totalImportCosts',
      label: 'TOTAL GASTOS DE IMPORTACIÓN',
      value: `USD ${totalImportCosts.toFixed(2)}`,
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
      color: 'green',
      category: 'Gastos'
    }
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
              <p className="text-xs text-gray-500">Detalles consolidados de la importación</p>
            </div>
          </div>

          <div className="space-y-4">
            {summaryItems.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span className="text-sm text-gray-900 font-medium">{item.label}</span>
                </div>
                <p className="text-base font-semibold text-gray-900 ml-6">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-700" />
                <span className="text-sm font-semibold text-purple-900">Inversión Total de Importación</span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-purple-700">
                  USD {(comercialValue + totalImportCosts).toFixed(2)}
                </p>
              </div>
            </div>

            {showExemptionMessage && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                        {isExpressConsolidatedPersonal ? "EXONERACIÓN TRIBUTARIA ACTIVA" : "EXONERACIÓN AUTOMÁTICA"}
                      </Badge>
                      <span className="text-sm font-medium text-green-800">✓ Activa</span>
                    </div>
                    <p className="text-sm text-green-700 leading-relaxed">
                      {isExpressConsolidatedPersonal ? (
                        <>
                          <strong>¡Ahorro en impuestos de importación!</strong> El valor comercial es menor a <strong>USD $200.00</strong>,
                          lo que significa que esta importación está <strong>exonerada de impuestos aduaneros</strong> (Ad Valorem, IGV, IPM).
                          Solo se aplican los costos de desaduanaje y flete internacional.
                        </>
                      ) : (
                        <>
                          Los impuestos están exonerados automáticamente porque el valor comercial es menor a <strong>USD $200.00</strong>.
                          Esta exoneración aplica a todos los impuestos y aranceles correspondientes.
                        </>
                      )}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-100 rounded p-2">
                        <div className="font-semibold text-green-800">Beneficio Principal</div>
                        <div className="text-green-700">
                          {isExpressConsolidatedPersonal
                            ? "Sin Ad Valorem, IGV ni IPM"
                            : "Ahorro en costos de importación"}
                        </div>
                      </div>
                      <div className="bg-green-100 rounded p-2">
                        <div className="font-semibold text-green-800">Gastos Aplicables</div>
                        <div className="text-green-700">
                          {isExpressConsolidatedPersonal
                            ? "Solo flete y desaduanaje"
                            : "Servicios logísticos básicos"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showExemptionGrupalMessage && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                        DESCUENTO GRUPAL EXPRESS ACTIVO
                      </Badge>
                      <span className="text-sm font-medium text-amber-800">✓ Aplicado</span>
                    </div>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <strong>¡Beneficios del Consolidado Grupal Express!</strong> Esta modalidad incluye:
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-amber-100 rounded p-2">
                        <div className="font-semibold text-amber-800">Exoneración Aplicada</div>
                        <div className="text-amber-700">
                          Inspección de productos <strong>EXONERADA</strong>
                        </div>
                      </div>
                      <div className="bg-amber-100 rounded p-2">
                        <div className="font-semibold text-amber-800">Descuento en Impuestos</div>
                        <div className="text-amber-700">
                          <strong>50% de descuento</strong> en AD/VALOREM + IGV + IPM
                        </div>
                      </div>
                    </div>
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


