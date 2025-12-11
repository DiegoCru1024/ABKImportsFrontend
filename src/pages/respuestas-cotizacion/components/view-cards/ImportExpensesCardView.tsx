import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  DollarSign,
  FileText,
  Plane,
  Shield,
  Ship,
  Truck,
} from "lucide-react";

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
  // Detección de servicios según documentación
  const isMaritime =
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo";

  const isMaritimeConsolidated =
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo";

  const isExpressConsolidatedPersonal =
    serviceType === "Consolidado Express" && comercialValue < 200;

  const isExpressConsolidatedSimplificada =
    serviceType === "Consolidado Express" && comercialValue >= 200;

  const isExpressConsolidatedGrupal =
    serviceType === "Consolidado Grupal Express";

  const getExpenseIcon = (id: string) => {
    switch (id) {
      case "servicioConsolidadoMaritimo":
      case "servicioConsolidado":
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
      case "transporteLocalChina":
      case "transporteLocalDestino":
      case "servicioTransporte":
        return <Truck className="h-4 w-4 text-orange-500" />;
      case "separacionCarga":
      case "seguroProductos":
        return <DollarSign className="h-4 w-4 text-indigo-500" />;
      case "inspeccionProductos":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "desadunajefleteseguro":
      case "desaduanajeFleteSaguro":
        return <DollarSign className="h-4 w-4 text-teal-500" />;
      case "desaduanaje":
        return <FileText className="h-4 w-4 text-cyan-500" />;
      case "fleteInternacional":
        return <Plane className="h-4 w-4 text-sky-500" />;
      case "totalDerechos":
      case "adValoremIgvIpm":
      case "addvaloremigvipm":
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case "adValoremIgvIpmDescuento":
      case "addvaloremigvipm50":
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case "otrosServicios":
        return <DollarSign className="h-4 w-4 text-amber-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getExpenseCategory = (id: string) => {
    if (id.includes("transporte")) return "Transporte";
    if (id.includes("servicio") || id.includes("consolidado"))
      return "Servicio";
    if (id.includes("inspeccion")) return "Inspección";
    if (id.includes("gestion") || id.includes("certificado")) return "Gestión";
    if (id.includes("separacion") || id.includes("desaduanaje"))
      return "Aduana";
    if (id.includes("flete")) return "Flete";
    if (id.includes("adValorem") || id.includes("totalDerechos") || id.includes("addvalorem"))
      return "Impuestos";
    if (id.includes("seguro")) return "Seguro";
    return "Otros";
  };

  const getFieldLabel = (key: string): string => {
    // Labels para servicios marítimos (sin mayúsculas)
    if (isMaritime) {
      const maritimeLabels: Record<string, string> = {
        servicioConsolidadoMaritimo: "Servicio Consolidado Marítimo",
        servicioConsolidado: "Servicio Consolidado Marítimo",
        gestionCertificado: "Gestión de Certificado de Origen",
        servicioInspeccion: "Servicio de Inspección",
        servicioTransporte: "Servicio de Transporte",
        otrosServicios: "Otros Servicios",
        totalDerechos: "Total de Derechos",
      };
      return maritimeLabels[key] || key;
    }
    
    // Labels para servicios aéreos (con mayúsculas)
    const airLabels: Record<string, string> = {
      servicioConsolidadoAereo: "SERVICIO CONSOLIDADO AÉREO",
      separacionCarga: "SEPARACIÓN DE CARGA",
      seguroProductos: "SEGURO DE PRODUCTOS",
      inspeccionProductos: "INSPECCIÓN DE PRODUCTOS",
      servicioTransporte: "SERVICIO DE TRANSPORTE",
      fleteInternacional: "FLETE INTERNACIONAL",
      desaduanaje: "DESADUANAJE",
      adValoremIgvIpm: "AD/VALOREM + IGV + IPM",
      addvaloremigvipm: "AD/VALOREM + IGV + IPM",
      adValoremIgvIpmDescuento: "AD/VALOREM + IGV + IPM (-50%)",
      addvaloremigvipm50: "AD/VALOREM + IGV + IPM (-50%)",
      desaduanajeFleteSaguro: "DESADUANAJE + FLETE + SEGURO",
      desadunajefleteseguro: "DESADUANAJE + FLETE + SEGURO",
      transporteLocal: "TRANSPORTE LOCAL",
    };
    return airLabels[key] || key.toUpperCase();
  };

  const getExpenseValue = (value: any): number => {
    if (typeof value === "object" && value !== null && "valor" in value) {
      return value.valor;
    }
    return typeof value === "number" ? value : 0;
  };

  // Función para obtener los campos filtrados según el tipo de servicio
  const getFilteredExpenses = () => {
    const expenseFields = importCosts.expenseFields;
    
    if (isMaritime) {
      // Servicios marítimos: siempre mostrar todos los campos como en la edición
      return [
        {
          id: "servicioConsolidadoMaritimo",
          label: getFieldLabel("servicioConsolidado"),
          value: getExpenseValue(expenseFields.servicioConsolidado || 0),
        },
        {
          id: "gestionCertificado",
          label: getFieldLabel("gestionCertificado"),
          value: getExpenseValue(expenseFields.gestionCertificado || 0),
        },
        {
          id: "servicioInspeccion",
          label: getFieldLabel("servicioInspeccion"),
          value: getExpenseValue(expenseFields.servicioInspeccion || 0),
        },
        {
          id: "servicioTransporte",
          label: getFieldLabel("servicioTransporte"),
          value: getExpenseValue(expenseFields.servicioTransporte || 0),
        },
        {
          id: "otrosServicios",
          label: getFieldLabel("otrosServicios"),
          value: getExpenseValue(expenseFields.otrosServicios || 0),
        },
        {
          id: "totalDerechos",
          label: getFieldLabel("totalDerechos"),
          value: getExpenseValue(expenseFields.totalDerechos || 0),
        },
      ];
    } else {
      // Servicios aéreos: construir array según tipo de Express
      const expenses = [
        {
          id: "servicioConsolidadoAereo",
          label: getFieldLabel("servicioConsolidadoAereo"),
          value: getExpenseValue(expenseFields.servicioConsolidado || 0),
        },
        {
          id: "separacionCarga",
          label: getFieldLabel("separacionCarga"),
          value: getExpenseValue(expenseFields.separacionCarga || 0),
        },
        {
          id: "seguroProductos",
          label: getFieldLabel("seguroProductos"),
          value: getExpenseValue(expenseFields.seguroProductos || 0),
        },
      ];
      
      // inspeccionProductos solo si NO es Consolidado Grupal Express
      if (!isExpressConsolidatedGrupal) {
        expenses.push({
          id: "inspeccionProductos",
          label: getFieldLabel("inspeccionProductos"),
          value: getExpenseValue(expenseFields.inspeccionProductos || 0),
        });
      }
      
      expenses.push({
        id: "servicioTransporte",
        label: getFieldLabel("servicioTransporte"),
        value: getExpenseValue(expenseFields.servicioTransporte || 0),
      });
      
      // Consolidado Express Personal: fleteInternacional, desaduanaje
      if (isExpressConsolidatedPersonal) {
        expenses.push({
          id: "fleteInternacional",
          label: getFieldLabel("fleteInternacional"),
          value: getExpenseValue(expenseFields.fleteInternacional || 0),
        });
        expenses.push({
          id: "desaduanaje",
          label: getFieldLabel("desaduanaje"),
          value: getExpenseValue(expenseFields.desaduanaje || 0),
        });
      }
      
      // Consolidado Express Simplificada: adValoremIgvIpm, desaduanajeFleteSaguro
      if (isExpressConsolidatedSimplificada) {
        expenses.push({
          id: "adValoremIgvIpm",
          label: getFieldLabel("addvaloremigvipm"),
          value: getExpenseValue(expenseFields.addvaloremigvipm || 0),
        });
        expenses.push({
          id: "desaduanajeFleteSaguro",
          label: getFieldLabel("desadunajefleteseguro"),
          value: getExpenseValue(expenseFields.desadunajefleteseguro || 0),
        });
      }
      
      // Consolidado Grupal Express: adValoremIgvIpmDescuento, fleteInternacional
      if (isExpressConsolidatedGrupal) {
        expenses.push({
          id: "adValoremIgvIpmDescuento",
          label: getFieldLabel("addvaloremigvipm50"),
          value: getExpenseValue(expenseFields.addvaloremigvipm50 || 0),
        });
        expenses.push({
          id: "fleteInternacional",
          label: getFieldLabel("fleteInternacional"),
          value: getExpenseValue(expenseFields.fleteInternacional || 0),
        });
      }
      
      return expenses;
    }
  };

  const expenses = getFilteredExpenses();

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
                    {isMaritime ? "Servicios Marítimos" : "Servicios Aéreos"}
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
                    {isMaritime
                      ? "Servicios marítimos y logísticos"
                      : "Servicios aéreos y logísticos"}
                  </span>
                </div>

                <div className="space-y-3">
                  {expenses.map(({ id, label, value }) => {
                    // Verificar si está exonerado (solo para inspeccionProductos en Consolidado Grupal Express)
                    const isExonerated = id === "inspeccionProductos" && isExpressConsolidatedGrupal;

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-orange-200 transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            {getExpenseIcon(id)}
                          </div>
                          <div className="flex-1">
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

                        <div className="flex items-center gap-3">
                          {isExonerated && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              EXONERADO
                            </Badge>
                          )}
                          <div className="text-right min-w-[100px]">
                            <div className="font-semibold text-gray-900">
                              USD {isExonerated ? "0.00" : value.toFixed(2)}
                            </div>
                            {isExonerated && (
                              <div className="text-xs text-green-600 font-medium">
                                Original: {value.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                      USD{" "}
                      {expenses
                        .reduce(
                          (total, expense) =>
                            total +
                            (expense.id === "inspeccionProductos" && isExpressConsolidatedGrupal
                              ? 0
                              : expense.value),
                          0
                        )
                        .toFixed(2)}
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
