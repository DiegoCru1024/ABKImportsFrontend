import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, FileText, Plane, Shield, Ship, Truck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

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
  serviceType?: string;
  serviceFieldsFromConsolidation?: {
    servicioConsolidado?: number;
    gestionCertificado?: number;
    inspeccionProducto?: number;
    inspeccionFabrica?: number;
    otrosServicios?: number;
    transporteLocalChina?: number;
    transporteLocalDestino?: number;
  };
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
  serviceType,
  serviceFieldsFromConsolidation,
}: ImportExpensesCardProps) {
  const getExpenseIcon = (id: string) => {
    switch (id) {
      case "servicioConsolidadoMaritimo":
      case "servicioConsolidadoAereo":
        return isMaritime ? (
          <Ship className="h-4 w-4 text-blue-500" />
        ) : (
          <Plane className="h-4 w-4 text-blue-500" />
        );
      case "gestionCertificado":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "servicioInspeccion":
        return <Shield className="h-4 w-4 text-purple-500" />;
      case "transporteLocal":
      case "transporteLocalChina":
      case "transporteLocalDestino":
      case "servicioTransporte":
        return <Truck className="h-4 w-4 text-orange-500" />;
      case "separacionCarga":
      case "seguroProductos":
        return <DollarSign className="h-4 w-4 text-indigo-500" />;
      case "inspeccionProductos":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "desaduanajeFleteSaguro":
        return <DollarSign className="h-4 w-4 text-teal-500" />;
      case "totalDerechos":
      case "adValoremIgvIpm":
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case "otrosServicios":
        return <DollarSign className="h-4 w-4 text-amber-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getExpenseCategory = (id: string) => {
    if (id.includes('transporte')) return 'Transporte';
    if (id.includes('servicio') || id.includes('consolidado')) return 'Servicio';
    if (id.includes('inspeccion')) return 'Inspección';
    if (id.includes('gestion') || id.includes('certificado')) return 'Gestión';
    if (id.includes('separacion') || id.includes('desaduanaje')) return 'Aduana';
    return 'Otros';
  };

  const isMaritimeConsolidated =
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo";

  const isExpressConsolidated =
    serviceType === "Consolidado Express" ||
    serviceType === "Consolidado Grupal Express";

  const calculateMaritimeConsolidatedValues = () => {
    if (!isMaritimeConsolidated || !serviceFieldsFromConsolidation) {
      return {
        servicioConsolidado: values.servicioConsolidadoMaritimoFinal,
        gestionCertificado: values.gestionCertificadoFinal,
        servicioInspeccion: values.servicioInspeccionFinal,
        servicioTransporte:
          values.transporteLocalChinaEnvio + values.transporteLocalClienteEnvio,
        otrosServicios: 0,
      };
    }

    const servicioConsolidado =
      (serviceFieldsFromConsolidation.servicioConsolidado || 0) * 1.18;
    const gestionCertificado =
      (serviceFieldsFromConsolidation.gestionCertificado || 0) * 1.18;
    const servicioInspeccion =
      ((serviceFieldsFromConsolidation.inspeccionProducto || 0) +
        (serviceFieldsFromConsolidation.inspeccionFabrica || 0)) *
      1.18;
    const servicioTransporte =
      ((serviceFieldsFromConsolidation.transporteLocalChina || 0) +
        (serviceFieldsFromConsolidation.transporteLocalDestino || 0)) *
      1.18;
    const otrosServicios =
      (serviceFieldsFromConsolidation.otrosServicios || 0) * 1.18;

    return {
      servicioConsolidado,
      gestionCertificado,
      servicioInspeccion,
      servicioTransporte,
      otrosServicios,
    };
  };

  const maritimeConsolidatedValues = calculateMaritimeConsolidatedValues();

  const maritimeExpenses = [
    {
      id: "servicioConsolidadoMaritimo",
      label: "Servicio Consolidado Marítimo",
      value: maritimeConsolidatedValues.servicioConsolidado,
    },
    {
      id: "gestionCertificado",
      label: "Gestión de Certificado de Origen",
      value: maritimeConsolidatedValues.gestionCertificado,
    },
    {
      id: "servicioInspeccion",
      label: "Servicio de Inspección",
      value: maritimeConsolidatedValues.servicioInspeccion,
    },
    ...(isMaritimeConsolidated || isExpressConsolidated
      ? [
          {
            id: "servicioTransporte",
            label: "Servicio de Transporte",
            value: maritimeConsolidatedValues.servicioTransporte,
          },
        ]
      : [
          {
            id: "transporteLocal",
            label: "Transporte Local",
            value: values.transporteLocalFinal,
          },
        ]),
    ...(isMaritimeConsolidated
      ? [
          {
            id: "otrosServicios",
            label: "Otros Servicios",
            value: maritimeConsolidatedValues.otrosServicios,
          },
        ]
      : []),
    {
      id: "totalDerechos",
      label: "Total de Derechos",
      value: values.totalDerechosDolaresFinal,
    },
  ];

  const getAirExpenses = () => {
    const baseExpenses = [
      {
        id: "servicioConsolidadoAereo",
        label: "Servicio Consolidado Aéreo",
        value: servicioConsolidadoFinal * 1.18,
      },
      {
        id:
          serviceType === "Consolidado Grupal Express"
            ? "seguroProductos"
            : "separacionCarga",
        label:
          serviceType === "Consolidado Grupal Express"
            ? "Seguro de Productos"
            : "Separación de Carga",
        value: separacionCargaFinal * 1.18,
      },
      {
        id: "inspeccionProductos",
        label: "Inspección de Productos",
        value: inspeccionProductosFinal * 1.18,
      },
      {
        id: "adValoremIgvIpm",
        label: "AD/VALOREM+IGV+IPM",
        value:
          values.totalDerechosDolaresFinal *
          (exemptionState.descuentoGrupalExpress ? 0.5 : 1),
      },
      {
        id: "desaduanajeFleteSaguro",
        label: "Desaduanaje + Flete + Seguro",
        value: values.desaduanajeFleteSaguro,
      },
      ...(isExpressConsolidated
        ? [
            {
              id: "servicioTransporte",
              label: "Servicio de Transporte",
              value: maritimeConsolidatedValues.servicioTransporte,
            },
          ]
        : [
            {
              id: "transporteLocalChina",
              label: "Transporte Local (China)",
              value: values.transporteLocalChinaEnvio,
            },
            {
              id: "transporteLocalDestino",
              label: "Transporte Local (Destino)",
              value: values.transporteLocalClienteEnvio,
            },
          ]),
      {
        id: "totalDerechos",
        label: "Total de Derechos",
        value: values.totalDerechosDolaresFinal,
      },
    ];

    return baseExpenses;
  };

  const airExpenses = getAirExpenses();

  const expenses = isMaritime ? maritimeExpenses : airExpenses;

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
                    {isMaritime ? 'Servicios Marítimos' : 'Servicios Aéreos'}
                  </div>
                </div>
              </CardTitle>
            </AccordionTrigger>
          </div>

          <AccordionContent>
            <div className="space-y-4 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              GASTOS
            </Badge>
            <span className="text-sm text-gray-600">
              {isMaritime ? 'Servicios marítimos y logísticos' : 'Servicios aéreos y logísticos'}
            </span>
          </div>
          
          <div className="space-y-3">
            {expenses.map(({ id, label, value }) => (
              <div
                key={id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-orange-200 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getExpenseIcon(id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        className="border-orange-500 border-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        checked={exemptionState[id]}
                        onCheckedChange={(checked) =>
                          handleExemptionChange(id, checked as boolean)
                        }
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getExpenseCategory(id)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {(exemptionState[id] || (shouldExemptTaxes && !isMaritime)) && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      EXONERADO
                    </Badge>
                  )}
                  <div className="text-right min-w-[100px]">
                    <div className="font-semibold text-gray-900">
                      USD {applyExemption(value, exemptionState[id]).toFixed(2)}
                    </div>
                    {exemptionState[id] && (
                      <div className="text-xs text-green-600 font-medium">
                        Original: {value.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                USD {expenses.reduce((total, expense) => total + (exemptionState[expense.id] ? 0 : expense.value), 0).toFixed(2)}
              </div>
              <div className="text-sm opacity-90">
                Total consolidado
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


