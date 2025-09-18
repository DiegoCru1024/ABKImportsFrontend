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

interface ExemptionState {
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
}

interface ExemptionControlsProps {
  exemptionState: ExemptionState;
  onExemptionChange: (field: keyof ExemptionState, value: boolean) => void;
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
    <Card className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md shadow-sm">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-medium text-slate-800">
              Exoneraciones de Conceptos
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Configure las exoneraciones aplicables
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {visibleExemptions.map((exemption) => (
            <div key={exemption.id} className="flex items-center space-x-2">
              <Checkbox
                id={exemption.id}
                checked={exemptionState[exemption.id as keyof typeof exemptionState]}
                onCheckedChange={(checked) => 
                  onExemptionChange(exemption.id as keyof ExemptionState, checked as boolean)
                }
                className="h-4 w-4"
              />
              <Label 
                htmlFor={exemption.id}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {exemption.label}
              </Label>
            </div>
          ))}
        </div>
        
        {Object.values(exemptionState).some(Boolean) && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-3 w-3 text-amber-600" />
              <span className="text-xs font-medium text-amber-800">
                Exoneraciones Activas
              </span>
            </div>
            <p className="text-xs text-amber-700">
              {Object.values(exemptionState).filter(Boolean).length} exoneraciones aplicadas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}