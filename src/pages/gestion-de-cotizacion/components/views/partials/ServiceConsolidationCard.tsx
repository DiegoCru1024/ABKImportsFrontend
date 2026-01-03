import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Plane, DollarSign, Calculator, TrendingUp, Ship } from "lucide-react";

export interface ServiceConsolidationCardProps {
  title: string;
  serviceFields: Record<string, number | undefined>;
  updateDynamicValue: (key: string, value: number) => void;
  igvServices: number;
  totalServices: number;
  serviceType?: string;
  transporteLocalChina?: number;
  transporteLocalDestino?: number;
}

export default function ServiceConsolidationCard({
  title,
  serviceFields,
  updateDynamicValue,
  igvServices,
  totalServices,
  serviceType,
  transporteLocalChina = 0,
  transporteLocalDestino = 0,
}: ServiceConsolidationCardProps) {
  const isMaritimeConsolidated =
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo";

  const calculateTotals = () => {
    if (isMaritimeConsolidated) {
      const subtotal =
        (serviceFields.servicioConsolidado || 0) +
        (serviceFields.gestionCertificado || 0) +
        (serviceFields.inspeccionProductos || 0) +
        (serviceFields.inspeccionFabrica || 0) +
        (serviceFields.otrosServicios || 0) +
        transporteLocalChina +
        transporteLocalDestino;

      // IGV se calcula excluyendo transporteLocalChina
      const igvBase =
        (serviceFields.servicioConsolidado || 0) +
        (serviceFields.gestionCertificado || 0) +
        (serviceFields.inspeccionProductos || 0) +
        (serviceFields.inspeccionFabrica || 0) +
        (serviceFields.otrosServicios || 0) +
        transporteLocalDestino; // Sin transporteLocalChina

      const igv = igvBase * 0.18;
      const total = subtotal + igv;
      return { subtotal, igv, total };
    }

    const subtotal = Object.values(serviceFields).reduce(
      (sum, value) => sum + (value || 0),
      0
    );
    return { subtotal, igv: igvServices, total: totalServices };
  };

  const totals = calculateTotals();

  const getFieldNames = (serviceType?: string): { [key: string]: string } => {
    const baseNames = {
      servicioConsolidado: "SERVICIO CONSOLIDADO",
      separacionCarga:
        serviceType === "Consolidado Grupal Express"
          ? "SEGURO DE PRODUCTOS"
          : "SEPARACION DE CARGA",
      seguroProductos: "SEGURO DE PRODUCTOS",
      inspeccionProductos: "INSPECCION DE PRODUCTOS",
      gestionCertificado: "GESTION DE CERTIFICADO DE ORIGEN",
      inspeccionProducto: "INSPECCION DE PRODUCTO",
      inspeccionFabrica: "INSPECCION DE FABRICA",
      transporteLocal: "TRANSPORTE A LOCAL",
      transporteLocalChina: "TRANSPORTE LOCAL (CHINA)",
      transporteLocalDestino: "TRANSPORTE LOCAL (DESTINO)",
      otrosServicios: "OTROS SERVICIOS",
    };
    return baseNames;
  };

  const fieldNames = getFieldNames(serviceType);

  const filteredServiceFields = isMaritimeConsolidated
    ? Object.fromEntries(
        Object.entries(serviceFields).filter(([key]) => key !== "transporteLocal")
      )
    : serviceFields;

  const additionalFields = isMaritimeConsolidated
    ? {
        transporteLocalChina,
        transporteLocalDestino,
      }
    : {};

  const getFieldIcon = (key: string) => {
    switch (key) {
      case "servicioConsolidado":
        return <Plane className="h-4 w-4 text-blue-500" />;
      case "separacionCarga":
        return <Calculator className="h-4 w-4 text-green-500" />;
      case "inspeccionProductos":
      case "inspeccionProducto":
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

  const isMaritime = title === "Servicio de Carga Consolidada (CARGA- ADUANA)";

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

          <div className="space-y-4">
            {Object.entries(filteredServiceFields).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getFieldIcon(key)}
                  <span className="text-sm text-gray-900 font-medium">{fieldNames[key] ?? key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">USD</span>
                  <EditableNumericField
                    value={value ?? 0}
                    onChange={(newValue) => updateDynamicValue(key, newValue)}
                  />
                </div>
              </div>
            ))}
            {Object.entries(additionalFields).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getFieldIcon(key)}
                  <div>
                    <span className="text-sm text-gray-900 font-medium">{fieldNames[key] ?? key}</span>
                    {key === "transporteLocalChina" && isMaritimeConsolidated && (
                      <p className="text-xs text-gray-400 ml-6">Excluido de IGV</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">USD</span>
                  <EditableNumericField
                    value={value ?? 0}
                    onChange={() => {}}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">IGV (18%)</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                USD {totals.igv.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-700" />
                <div>
                  <span className="text-sm font-semibold text-blue-900">Total del Servicio</span>
                  <p className="text-xs text-blue-700">Consolidación + IGV</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-700">
                  USD {totals.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
