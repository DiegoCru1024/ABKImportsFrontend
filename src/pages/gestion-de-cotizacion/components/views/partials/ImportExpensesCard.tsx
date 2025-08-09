import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DollarSign } from "lucide-react";

export interface ImportExpensesCardProps {
  isMaritime: boolean;
  values: {
    servicioConsolidadoMaritimoFinal: number;
    gestionCertificadoFinal: number;
    servicioInspeccionFinal: number;
    transporteLocalFinal: number;
    totalDerechosDolaresFinal: number;
    desaduanajeFleteSaguro: number;
    transporteLocalChinaEnvio: number;
    transporteLocalClienteEnvio: number;
  };
  exemptionState: Record<string, boolean>;
  handleExemptionChange: (field: string, checked: boolean) => void;
  applyExemption: (value: number, exempted: boolean) => number;
  servicioConsolidadoFinal: number;
  separacionCargaFinal: number;
  inspeccionProductosFinal: number;
  shouldExemptTaxes: boolean;
  totalGastosImportacion: number;
}

export default function ImportExpensesCard({
  isMaritime,
  values,
  exemptionState,
  handleExemptionChange,
  applyExemption,
  servicioConsolidadoFinal,
  separacionCargaFinal,
  inspeccionProductosFinal,
  shouldExemptTaxes,
  totalGastosImportacion,
}: ImportExpensesCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-orange-600" />
          Gastos de Importación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {isMaritime ? (
            <>
              {/* Marítimo */}
              {[
                {
                  id: "servicioConsolidadoMaritimo",
                  label: "Servicio Consolidado Marítimo",
                  value: values.servicioConsolidadoMaritimoFinal,
                },
                {
                  id: "gestionCertificado",
                  label: "Gestión de Certificado de Origen",
                  value: values.gestionCertificadoFinal,
                },
                {
                  id: "servicioInspeccion",
                  label: "Servicio de Inspección",
                  value: values.servicioInspeccionFinal,
                },
                {
                  id: "transporteLocal",
                  label: "Transporte Local",
                  value: values.transporteLocalFinal,
                },
              ].map(({ id, label, value }) => (
                <div key={id} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      className="border-red-500 border-2"
                      checked={exemptionState[id]}
                      onCheckedChange={(checked) =>
                        handleExemptionChange(id, checked as boolean)
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {label}
                      {(exemptionState[id]) && (
                        <span className="text-green-600 text-xs ml-1">(EXONERADO)</span>
                      )}
                    </span>
                  </div>
                  <span className="font-medium">
                    USD {applyExemption(value, exemptionState[id]).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Total de Derechos */}
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="totalDerechos"
                    className="border-red-500 border-2"
                    checked={exemptionState.totalDerechos}
                    onCheckedChange={(checked) =>
                      handleExemptionChange("totalDerechos", checked as boolean)
                    }
                  />
                  <span className="text-sm text-gray-600">
                    Total de Derechos
                  </span>
                </div>
                <span className="font-medium">
                  USD {values.totalDerechosDolaresFinal.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Aéreo */}
              {[
                {
                  id: "servicioConsolidadoAereo",
                  label: "Servicio Consolidado Aéreo",
                  value: servicioConsolidadoFinal,
                },
                {
                  id: "separacionCarga",
                  label: "Separación de Carga",
                  value: separacionCargaFinal,
                },
                {
                  id: "inspeccionProductos",
                  label: "Inspección de Productos",
                  value: inspeccionProductosFinal,
                },
                {
                  id: "desaduanajeFleteSaguro",
                  label: "Desaduanaje + Flete + Seguro",
                  value: values.desaduanajeFleteSaguro,
                },
                {
                  id: "transporteLocalChina",
                  label: "Transporte Local China",
                  value: values.transporteLocalChinaEnvio,
                },
                {
                  id: "transporteLocalCliente",
                  label: "Transporte Local Cliente",
                  value: values.transporteLocalClienteEnvio,
                },
              ].map(({ id, label, value }) => (
                <div key={id} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      className="border-red-500 border-2"
                      checked={exemptionState[id]}
                      onCheckedChange={(checked) =>
                        handleExemptionChange(id, checked as boolean)
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {label}
                      {(shouldExemptTaxes || exemptionState[id]) && (
                        <span className="text-green-600 text-xs ml-1">(EXONERADO)</span>
                      )}
                    </span>
                  </div>
                  <span className="font-medium">
                    USD {applyExemption(value, exemptionState[id]).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Total de Derechos */}
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="obligacionesFiscales"
                    className="border-red-500 border-2"
                    checked={exemptionState.obligacionesFiscales}
                    onCheckedChange={(checked) =>
                      handleExemptionChange(
                        "obligacionesFiscales",
                        checked as boolean
                      )
                    }
                  />
                  <span className="text-sm text-gray-600">AD/VALOREM + IGV + IPM</span>
                </div>
                <span className="font-medium">
                  USD {values.totalDerechosDolaresFinal.toFixed(2)}
                </span>
              </div>
            </>
          )}
          <Separator />
          <div className="flex justify-between items-center py-2 bg-orange-50 px-3 rounded-lg">
            <span className="font-medium text-orange-900">
              Total Gastos de Importación
            </span>
            <span className="font-bold text-orange-900">
              USD {totalGastosImportacion.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


