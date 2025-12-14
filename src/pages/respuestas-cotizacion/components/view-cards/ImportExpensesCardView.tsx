import {
  CheckCircle,
  DollarSign,
  FileText,
  Plane,
  Shield,
  Ship,
  Truck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

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
  const isMaritime =
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

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total +
      (expense.id === "inspeccionProductos" && isExpressConsolidatedGrupal
        ? 0
        : expense.value),
    0
  );

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
            <div className="p-2 bg-orange-100 rounded-lg">
              {isMaritime ? (
                <Ship className="h-5 w-5 text-orange-700" />
              ) : (
                <Plane className="h-5 w-5 text-orange-700" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Gastos de Importación</h3>
              <p className="text-xs text-gray-500">
                {isMaritime ? "Servicios marítimos y logísticos" : "Servicios aéreos y logísticos"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-32 gap-y-4">
            {expenses.map(({ id, label, value }) => {
              const isExonerated = id === "inspeccionProductos" && isExpressConsolidatedGrupal;

              return (
                <div key={id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getExpenseIcon(id)}
                    <div>
                      <span className="text-sm text-gray-600">{label}</span>
                      {isExonerated && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Exonerado</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      USD {isExonerated ? "0.00" : value.toFixed(2)}
                    </p>
                    {isExonerated && (
                      <p className="text-xs text-gray-400 line-through">
                        {value.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Total Gastos de Importación</span>
                  <p className="text-xs text-gray-500">Incluye todos los servicios</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-orange-700">
                  USD {totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
