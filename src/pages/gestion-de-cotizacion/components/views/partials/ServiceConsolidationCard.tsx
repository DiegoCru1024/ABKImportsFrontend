import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Separator } from "@/components/ui/separator";
import { Plane, DollarSign, Calculator, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const getFieldIcon = (key: string) => {
    switch (key) {
      case 'servicioConsolidado':
        return <Plane className="h-4 w-4 text-blue-500" />;
      case 'separacionCarga':
        return <Calculator className="h-4 w-4 text-green-500" />;
      case 'inspeccionProductos':
      case 'inspeccionProducto':
      case 'inspeccionFabrica':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'transporteLocal':
        return <DollarSign className="h-4 w-4 text-orange-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="shadow-lg border-1 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader >
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="p-2 bg-blue-200 rounded-lg">
            <Plane className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <div>{title}</div>
            <div className="text-sm font-normal text-blue-700">Servicios de Consolidación</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              AFECTO A IGV
            </Badge>
            <span className="text-sm text-gray-600">(18%)</span>
          </div>
          
          <div className="space-y-3">
            {Object.entries(serviceFields).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getFieldIcon(key)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {fieldNames[key] ?? key}
                    </div>
                    <div className="text-xs text-gray-500">
                      Servicio de consolidación
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <EditableNumericField
                      value={value ?? 0}
                      onChange={(newValue) => updateDynamicValue(key, newValue)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                      USD
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">IGV (18%)</span>
              </div>
              <span className="font-semibold text-gray-900">
                USD {igvServices.toFixed(2)}
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
                  USD {totalServices.toFixed(2)}
                </div>
                <div className="text-sm opacity-90">
                  Total incluido
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


