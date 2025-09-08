import {
  Shield,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ExemptionControlsProps {
  exemptionState: {
    servicioConsolidadoAereo: boolean;
    separacionCarga: boolean;
    inspeccionProductos: boolean;
    obligacionesFiscales: boolean;
    desaduanajeFleteSaguro: boolean;
    transporteLocalChina: boolean;
    transporteLocalCliente: boolean;
    servicioConsolidadoMaritimo: boolean;
    gestionCertificado: boolean;
    servicioInspeccion: boolean;
    transporteLocal: boolean;
    totalDerechos: boolean;
  };
  onExemptionChange: (field: string, value: boolean) => void;
  isMaritimeService: boolean;
}

export function ExemptionControls({
  exemptionState,
  onExemptionChange,
  isMaritimeService,
}: ExemptionControlsProps) {
  const exemptions = [
    {
      id: "servicioConsolidadoAereo",
      label: "Servicio Consolidado Aéreo",
      show: !isMaritimeService,
    },
    {
      id: "separacionCarga",
      label: "Separación de Carga",
      show: !isMaritimeService,
    },
    {
      id: "inspeccionProductos",
      label: "Inspección de Productos",
      show: !isMaritimeService,
    },
    {
      id: "servicioConsolidadoMaritimo", 
      label: "Servicio Consolidado Marítimo",
      show: isMaritimeService,
    },
    {
      id: "gestionCertificado",
      label: "Gestión de Certificado",
      show: isMaritimeService,
    },
    {
      id: "servicioInspeccion",
      label: "Servicio de Inspección",
      show: isMaritimeService,
    },
    {
      id: "transporteLocal",
      label: "Transporte Local",
      show: isMaritimeService,
    },
    {
      id: "obligacionesFiscales",
      label: "Obligaciones Fiscales",
      show: true,
    },
    {
      id: "desaduanajeFleteSaguro",
      label: "Desaduanaje, Flete y Seguro",
      show: true,
    },
    {
      id: "transporteLocalChina",
      label: "Transporte Local China",
      show: true,
    },
    {
      id: "transporteLocalCliente",
      label: "Transporte Local Cliente", 
      show: true,
    },
    {
      id: "totalDerechos",
      label: "Total Derechos",
      show: true,
    },
  ];

  const visibleExemptions = exemptions.filter(exemption => exemption.show);

  return (
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-slate-800">
              Exoneraciones de Conceptos
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              Configure las exoneraciones aplicables a los gastos de importación
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleExemptions.map((exemption) => (
            <div key={exemption.id} className="flex items-center space-x-2">
              <Checkbox
                id={exemption.id}
                checked={exemptionState[exemption.id as keyof typeof exemptionState]}
                onCheckedChange={(checked) => 
                  onExemptionChange(exemption.id, checked as boolean)
                }
              />
              <Label 
                htmlFor={exemption.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {exemption.label}
              </Label>
            </div>
          ))}
        </div>
        
        {Object.values(exemptionState).some(Boolean) && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Exoneraciones Activas
              </span>
            </div>
            <p className="text-xs text-amber-700">
              Se han aplicado {Object.values(exemptionState).filter(Boolean).length} exoneraciones 
              que afectarán los cálculos finales de la cotización.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}