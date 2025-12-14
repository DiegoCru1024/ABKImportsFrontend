import { Calculator, DollarSign, Plane, Ship, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
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
  const isMaritime =
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo";

  const isGrupalExpress = serviceType === "Consolidado Grupal Express";

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      servicioConsolidado: "Servicio Consolidado",
      separacionCarga: isGrupalExpress
        ? "Seguro de Productos"
        : "Separación de Carga",
      seguroProductos: "Seguro de Productos",
      inspeccionProductos: "Inspección de Productos",
      gestionCertificado: "Gestión de Certificado de Origen",
      inspeccionFabrica: "Inspección de Fábrica",
      otrosServicios: "Otros Servicios",
      transporteLocalChina: "Transporte Local (China)",
      transporteLocalDestino: "Transporte Local (Destino)",
      transporteLocal: "Transporte Local",
    };
    return labels[key] || key;
  };

  const getFieldIcon = (key: string) => {
    switch (key) {
      case "servicioConsolidado":
        return <Plane className="h-4 w-4 text-blue-500" />;
      case "separacionCarga":
        return <Calculator className="h-4 w-4 text-green-500" />;
      case "inspeccionProductos":
      case "inspeccionFabrica":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case "transporteLocal":
      case "transporteLocalChina":
      case "transporteLocalDestino":
        return <DollarSign className="h-4 w-4 text-orange-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFilteredServiceFields = (): Record<string, number> => {
    const allFields = serviceCalculations.serviceFields as Record<string, number>;

    if (serviceType === "Consolidado Express") {
      return {
        servicioConsolidado: allFields.servicioConsolidado || 0,
        separacionCarga: allFields.separacionCarga || 0,
        inspeccionProductos: allFields.inspeccionProductos || 0,
      };
    } else if (serviceType === "Consolidado Grupal Express") {
      return {
        servicioConsolidado: allFields.servicioConsolidado || 0,
        seguroProductos: allFields.seguroProductos || allFields.separacionCarga || 0,
        inspeccionProductos: allFields.inspeccionProductos || 0,
      };
    } else if (serviceType === "Almacenaje de mercancías") {
      return {
        servicioConsolidado: allFields.servicioConsolidado || 0,
        separacionCarga: allFields.separacionCarga || 0,
        inspeccionProductos: allFields.inspeccionProductos || 0,
      };
    } else if (isMaritime) {
      const mainFields: Record<string, number> = {
        servicioConsolidado: allFields.servicioConsolidado || 0,
        gestionCertificado: allFields.gestionCertificado || 0,
        inspeccionProductos: allFields.inspeccionProductos || 0,
        inspeccionFabrica: allFields.inspeccionFabrica || 0,
        otrosServicios: allFields.otrosServicios || 0,
      };

      if (allFields.transporteLocalChina !== undefined) {
        mainFields.transporteLocalChina = allFields.transporteLocalChina;
      }
      if (allFields.transporteLocalDestino !== undefined) {
        mainFields.transporteLocalDestino = allFields.transporteLocalDestino;
      }

      return mainFields;
    }

    return allFields;
  };

  const filteredFields = getFilteredServiceFields();

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
            <div className="p-2 bg-blue-100 rounded-lg">
              {isMaritime ? (
                <Ship className="h-5 w-5 text-blue-700" />
              ) : (
                <Plane className="h-5 w-5 text-blue-700" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">Afecto a IGV (18%)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-32 gap-y-4">
            {Object.entries(filteredFields).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getFieldIcon(key)}
                  <div>
                    <span className="text-sm text-gray-600">{getFieldLabel(key)}</span>
                    {key === "transporteLocalChina" && isMaritime && (
                      <p className="text-xs text-gray-400">Excluido de IGV</p>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  USD {value.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <Calculator className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">IGV (18%)</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                USD {serviceCalculations.igvServices.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Total del Servicio</span>
                  <p className="text-xs text-gray-500">Consolidación + IGV</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-700">
                  USD {serviceCalculations.totalServices.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
