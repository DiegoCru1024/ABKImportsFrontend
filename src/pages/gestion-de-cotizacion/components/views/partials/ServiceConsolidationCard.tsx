import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Separator } from "@/components/ui/separator";
import { Plane } from "lucide-react";

export interface ServiceConsolidationCardProps {
  title: string;
  serviceFields: Record<string, number | undefined>;
  updateDynamicValue: (key: string, value: number) => void;
  igvServices: number;
  totalServices: number;
}

export default function ServiceConsolidationCard({
  title,
  serviceFields,
  updateDynamicValue,
  igvServices,
  totalServices,
}: ServiceConsolidationCardProps) {
  const fieldNames: { [key: string]: string } = {
    servicioConsolidado: "SERVICIO CONSOLIDADO",
    separacionCarga: "SEPARACION DE CARGA",
    inspeccionProductos: "INSPECCION DE PRODUCTOS",
    gestionCertificado: "GESTION DE CERTIFICADO DE ORIGEN",
    inspeccionProducto: "INSPECCION DE PRODUCTO",
    inspeccionFabrica: "INSPECCION DE FABRICA",
    transporteLocal: "TRANSPORTE A LOCAL",
    otrosServicios: "OTROS SERVICIOS",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plane className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="font-semibold text-sm mb-3">AFECTO A IGV</div>
          {Object.entries(serviceFields).map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-2 gap-2 text-sm justify-between items-center py-2"
            >
              <div>{fieldNames[key] ?? key}</div>
              <div>
                <span className="relative">
                  <EditableNumericField
                    value={value ?? 0}
                    onChange={(newValue) => updateDynamicValue(key, newValue)}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    USD
                  </span>
                </span>
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">IGV (18%)</span>
            <span className="font-medium">{igvServices.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded-lg">
            <span className="font-medium text-blue-900">
              Total del Servicio de Consolidación
            </span>
            <span className="font-bold text-blue-900">
              USD {totalServices.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


