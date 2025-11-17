import { AlertTriangle, ChartBar, DollarSign, FileText } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
                  <div className="text-sm font-normal text-purple-700">Resumen consolidado</div>
                </div>
              </CardTitle>
            </AccordionTrigger>
          </div>

          <AccordionContent>
            <div className="space-y-4 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              RESUMEN
            </Badge>
            <span className="text-sm text-gray-600">Detalles de la importación</span>
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
                    INVERSION TOTAL DE IMPORTACION
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-2xl">
                  USD {(comercialValue + totalImportCosts).toFixed(2)}
                </div>
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
                      <span className="text-sm font-medium text-green-800">
                        ✓ Activa
                      </span>
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
                      <span className="text-sm font-medium text-amber-800">
                        ✓ Aplicado
                      </span>
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
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}


