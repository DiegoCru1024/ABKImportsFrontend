import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Plane } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ServiceCalculationsInterface } from "@/api/interface/quotation-response/dto/complete/service-calculations";

export interface ServiceConsolidationCardViewProps {
  serviceCalculations: ServiceCalculationsInterface;
  title?: string;
  serviceType?: string;
}

export default function ServiceConsolidationCardView({
  serviceCalculations,
  title = "Servicios de Consolidación",
  serviceType = "",
}: ServiceConsolidationCardViewProps) {
  // Detección de tipo de servicio según documentación
  const isMaritime =
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo";

  const isGrupalExpress = serviceType === "Consolidado Grupal Express";

  // Servicios aéreos: Consolidado Express, Consolidado Grupal Express, Almacenaje de mercancías
  const isAirService =
    serviceType === "Consolidado Express" ||
    serviceType === "Consolidado Grupal Express" ||
    serviceType === "Almacenaje de mercancías";

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      servicioConsolidado: "SERVICIO CONSOLIDADO",
      // Para Consolidado Grupal Express, separacionCarga se muestra como "SEGURO DE PRODUCTOS"
      // pero internamente usa el valor de separacionCarga
      separacionCarga: isGrupalExpress
        ? "SEGURO DE PRODUCTOS"
        : "SEPARACIÓN DE CARGA",
      seguroProductos: "SEGURO DE PRODUCTOS",
      inspeccionProductos: "INSPECCIÓN DE PRODUCTOS",
      gestionCertificado: "GESTIÓN DE CERTIFICADO DE ORIGEN",
      inspeccionFabrica: "INSPECCIÓN DE FÁBRICA",
      otrosServicios: "OTROS SERVICIOS",
      transporteLocalChina: "TRANSPORTE LOCAL (CHINA)",
      transporteLocalDestino: "TRANSPORTE LOCAL (DESTINO)",
      transporteLocal: "TRANSPORTE LOCAL",
    };
    return labels[key] || key.toUpperCase();
  };

  const isFieldAffectedByIGV = (key: string): boolean => {
    if (isMaritime && key === "transporteLocalChina") {
      return false;
    }
    return true;
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="service-consolidation" className="border-0">
        <div className="shadow-lg border-1 border-blue-200 bg-white rounded-lg">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg rounded-b-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Plane className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <div>{title}</div>
                  <div className="text-sm font-normal text-blue-700">
                    Servicios de Consolidación
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
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    AFECTO A IGV
                  </Badge>
                  <span className="text-sm text-gray-600">(18%)</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(
                    serviceCalculations.serviceFields as Record<string, number>
                  ).map(([key, value]) => {
                    const affectedByIGV = isFieldAffectedByIGV(key);
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <DollarSign className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {getFieldLabel(key)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {affectedByIGV
                                ? "Afecto a IGV (18%)"
                                : "NO afecto a IGV"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            USD {value.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        IGV (18%)
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      USD {serviceCalculations.igvServices.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-900 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-300 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-800" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          Total del Servicio
                        </div>
                        <div className="text-sm opacity-90">
                          Consolidación + IGV
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl">
                        USD {serviceCalculations.totalServices.toFixed(2)}
                      </div>
                      <div className="text-sm opacity-90">Total incluido</div>
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
