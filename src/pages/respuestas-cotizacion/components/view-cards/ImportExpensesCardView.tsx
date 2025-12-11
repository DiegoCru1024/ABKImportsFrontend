import React from "react";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface ImportExpensesCardViewProps {
  importCosts: {
    expenseFields: Record<string, any>;
    totalExpenses: number;
  };
  serviceType?: string;
  comercialValue?: number;
}

export default function ImportExpensesCardView({
  importCosts,
  serviceType = "",
  comercialValue = 0,
}: ImportExpensesCardViewProps) {
  // Detección de servicios según documentación actualizada
  const isMaritime =
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo";

  const isExpressConsolidated = serviceType === "Consolidado Express";

  const isExpressConsolidatedGrupal =
    serviceType === "Consolidado Grupal Express";

  const isAlmacenaje = serviceType === "Almacenaje de mercancías";

  // Express Personal: Consolidado Express con valor comercial < $200
  const isExpressPersonal = isExpressConsolidated && comercialValue < 200;

  // Express Simplificada: Consolidado Express con valor comercial >= $200
  const isExpressSimplificada = isExpressConsolidated && comercialValue >= 200;

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      servicioConsolidadoMaritimo: "SERVICIO CONSOLIDADO MARÍTIMO",
      servicioConsolidadoAereo: "SERVICIO CONSOLIDADO AÉREO",
      gestionCertificado: "GESTIÓN DE CERTIFICADO DE ORIGEN",
      servicioInspeccion: "SERVICIO DE INSPECCIÓN",
      servicioTransporte: "SERVICIO DE TRANSPORTE",
      otrosServicios: "OTROS SERVICIOS",
      totalDerechos: "TOTAL DE DERECHOS",
      seguroProductos: "SEGURO DE PRODUCTOS",
      separacionCarga: "SEPARACIÓN DE CARGA",
      inspeccionProductos: "INSPECCIÓN DE PRODUCTOS",
      fleteInternacional: "FLETE INTERNACIONAL",
      desaduanaje: "DESADUANAJE",
      adValoremIgvIpm: "AD/VALOREM + IGV + IPM",
      adValoremIgvIpmDescuento: "AD/VALOREM + IGV + IPM (-50%)",
      desaduanajeFleteSaguro: "DESADUANAJE + FLETE + SEGURO",
      transporteLocal: "TRANSPORTE LOCAL",
    };
    return labels[key] || key.toUpperCase();
  };

  const getExpenseValue = (value: any): number => {
    if (typeof value === "object" && value !== null && "valor" in value) {
      return value.valor;
    }
    return typeof value === "number" ? value : 0;
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="import-expenses" className="border-0">
        <div className="shadow-lg border-1 border-orange-200 bg-white rounded-lg">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg rounded-b-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-orange-200 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <div>Gastos de Importación</div>
                  <div className="text-sm font-normal text-orange-700">
                    Costos totales
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
                    className="bg-orange-100 text-orange-800 border-orange-200"
                  >
                    GASTOS
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Servicios y costos
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(importCosts.expenseFields).map(
                    ([key, value]) => {
                      const expenseValue = getExpenseValue(value);
                      if (expenseValue === 0) return null;

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-orange-200 transition-all duration-200 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <DollarSign className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {getFieldLabel(key)}
                              </div>
                              <div className="text-xs text-gray-500">Gasto</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              USD {expenseValue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-200 to-amber-200 text-orange-900 rounded-lg shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-300 rounded-lg">
                      <DollarSign className="h-5 w-5 text-orange-800" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        Total Gastos de Importación
                      </div>
                      <div className="text-sm opacity-90">
                        Incluye todos los servicios
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl">
                      USD {importCosts.totalExpenses.toFixed(2)}
                    </div>
                    <div className="text-sm opacity-90">Total consolidado</div>
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
