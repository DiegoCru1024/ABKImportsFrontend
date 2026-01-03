import {
  CheckCircle,
  DollarSign,
  FileText,
  Plane,
  Shield,
  Ship,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export interface ImportExpensesCardProps {
  comercialValue: number;
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
    flete?: number;
    desaduanaje?: number;
    seguro?: number;
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
    inspeccionProductos?: number;
    inspeccionFabrica?: number;
    otrosServicios?: number;
    transporteLocalChina?: number;
    transporteLocalDestino?: number;
  };
}

export default function ImportExpensesCard({
  comercialValue,
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
      case "desaduanaje":
        return <FileText className="h-4 w-4 text-cyan-500" />;
      case "fleteInternacional":
        return <Plane className="h-4 w-4 text-sky-500" />;
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
    if (id.includes("transporte")) return "Transporte";
    if (id.includes("servicio") || id.includes("consolidado"))
      return "Servicio";
    if (id.includes("inspeccion")) return "Inspección";
    if (id.includes("gestion") || id.includes("certificado")) return "Gestión";
    if (id.includes("separacion") || id.includes("desaduanaje"))
      return "Aduana";
    if (id.includes("flete")) return "Flete";
    if (id.includes("adValorem") || id.includes("totalDerechos"))
      return "Impuestos";
    if (id.includes("seguro")) return "Seguro";
    return "Otros";
  };

  const isMaritimeConsolidated =
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo";


  const isExpressConsolidatedPersonal =
    serviceType === "Consolidado Express" && comercialValue < 200;

  const isExpressConsolidatedSimplificada =
    serviceType === "Consolidado Express" && comercialValue >= 200;

  const isExpressConsolidatedGrupal =
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
      ((serviceFieldsFromConsolidation.inspeccionProductos || 0) +
        (serviceFieldsFromConsolidation.inspeccionFabrica || 0)) *
      1.18;
    const servicioTransporte =
      (serviceFieldsFromConsolidation.transporteLocalChina || 0) +
      (serviceFieldsFromConsolidation.transporteLocalDestino || 0) * 1.18;
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

    {
      id: "servicioTransporte",
      label: "Servicio de Transporte",
      value: maritimeConsolidatedValues.servicioTransporte,
    },

    {
      id: "otrosServicios",
      label: "Otros Servicios",
      value: maritimeConsolidatedValues.otrosServicios,
    },

    {
      id: "totalDerechos",
      label: "Total de Derechos",
      value: values.totalDerechosDolaresFinal,
    },
  ];

  const airExpenses = [
    {
      id: "servicioConsolidadoAereo",
      label: "SERVICIO CONSOLIDADO AÉREO",
      value: servicioConsolidadoFinal * 1.18,
    },
    {
      id: "separacionCarga",
      label: "SEPARACIÓN DE CARGA",
      value: separacionCargaFinal * 1.18,
    },
    {
      id: "seguroProductos",
      label: "SEGURO DE PRODUCTOS",
      value: inspeccionProductosFinal * 1.18,
    },
    ...(isExpressConsolidatedGrupal
      ? []
      : [
          {
            id: "inspeccionProductos",
            label: "INSPECCIÓN DE PRODUCTOS",
            value: inspeccionProductosFinal * 1.18,
          },
        ]),
    {
      id: "servicioTransporte",
      label: "SERVICIO DE TRANSPORTE",
      value: maritimeConsolidatedValues.servicioTransporte,
    },
    ...(isExpressConsolidatedPersonal
      ? [
          {
            id: "fleteInternacional",
            label: "FLETE INTERNACIONAL",
            value: values.flete || 0,
          },
          {
            id: "desaduanaje",
            label: "DESADUANAJE",
            value: values.desaduanaje || 0,
          },
        ]
      : []),
    ...(isExpressConsolidatedSimplificada
      ? [
          {
            id: "adValoremIgvIpm",
            label: "AD/VALOREM + IGV + IPM",
            value: values.totalDerechosDolaresFinal,
          },
          {
            id: "desaduanajeFleteSaguro",
            label: "DESADUANAJE + FLETE + SEGURO",
            value: values.desaduanajeFleteSaguro,
          },
        ]
      : []),
    ...(isExpressConsolidatedGrupal
      ? [
          {
            id: "adValoremIgvIpmDescuento",
            label: "AD/VALOREM + IGV + IPM (-50%)",
            value: values.totalDerechosDolaresFinal * 0.5,
          },
          {
            id: "fleteInternacional",
            label: "FLETE INTERNACIONAL",
            value: values.flete || 0,
          },
        ]
      : []),
  ];

  const expenses = isMaritime ? maritimeExpenses : airExpenses;

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

          <div className="space-y-4">
            {expenses.map(({ id, label, value }) => (
              <div key={id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={id}
                    className="border-orange-500 border-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    checked={exemptionState[id]}
                    onCheckedChange={(checked) =>
                      handleExemptionChange(id, checked as boolean)
                    }
                  />
                  {getExpenseIcon(id)}
                  <div className="flex-1">
                    <span className="text-sm text-gray-900 font-medium">{label}</span>
                    {(exemptionState[id] ||
                      (shouldExemptTaxes && !isMaritime) ||
                      (id === "inspeccionProductos" && isExpressConsolidatedGrupal)) && (
                      <p className="text-xs text-green-600 font-medium">Exonerado</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-10">
                  <span className="text-sm text-gray-500 font-medium">USD</span>
                  <p className="text-base font-semibold text-gray-900">
                    {applyExemption(
                      value,
                      exemptionState[id] ||
                      (id === "inspeccionProductos" && isExpressConsolidatedGrupal)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-700" />
                <div>
                  <span className="text-sm font-semibold text-orange-900">Total Gastos de Importación</span>
                  <p className="text-xs text-orange-700">Incluye todos los servicios</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-orange-700">
                  USD{" "}
                  {expenses
                    .reduce(
                      (total, expense) =>
                        total +
                        (exemptionState[expense.id] ||
                        (expense.id === "inspeccionProductos" && isExpressConsolidatedGrupal)
                          ? 0
                          : expense.value),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
