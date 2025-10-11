import {
  Settings,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface QuotationConfigurationFormProps {
  selectedServiceLogistic: string;
  onServiceLogisticChange: (value: string) => void;
  selectedIncoterm: string;
  onIncotermChange: (value: string) => void;
  selectedTypeLoad: string;
  onTypeLoadChange: (value: string) => void;
  selectedCourier: string;
  onCourierChange: (value: string) => void;
  serviciosLogisticos: Array<{ value: string; label: string }>;
  incotermsOptions: Array<{ value: string; label: string }>;
  typeLoad: Array<{ value: string; label: string }>;
  courier: Array<{ value: string; label: string }>;
}

export function QuotationConfigurationForm({
  selectedServiceLogistic,
  onServiceLogisticChange,
  selectedIncoterm,
  onIncotermChange,
  selectedTypeLoad,
  onTypeLoadChange,
  selectedCourier,
  onCourierChange,
  serviciosLogisticos,
  incotermsOptions,
  typeLoad,
  courier,
}: QuotationConfigurationFormProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-md shadow-sm">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-medium text-slate-800">
              Configuración General
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Parámetros básicos de la cotización
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label htmlFor="servicio-logistico" className="text-xs font-medium text-slate-600">
              Servicio Logístico
            </Label>
            <Select
              value={selectedServiceLogistic}
              onValueChange={onServiceLogisticChange}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {serviciosLogisticos.map((servicio) => (
                  <SelectItem key={servicio.value} value={servicio.value}>
                    {servicio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="incoterm" className="text-xs font-medium text-slate-600">
              Incoterm
            </Label>
            <Select
              value={selectedIncoterm}
              onValueChange={onIncotermChange}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue placeholder="Seleccionar incoterm" />
              </SelectTrigger>
              <SelectContent>
                {incotermsOptions.map((incoterm) => (
                  <SelectItem key={incoterm.value} value={incoterm.value}>
                    {incoterm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tipo-carga" className="text-xs font-medium text-slate-600">
              Tipo de Carga
            </Label>
            <Select
              value={selectedTypeLoad}
              onValueChange={onTypeLoadChange}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {typeLoad.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedServiceLogistic !== "Consolidado Maritimo" &&
            selectedServiceLogistic !== "Consolidado Grupal Maritimo" && (
              <div className="space-y-1">
                <Label htmlFor="courier" className="text-xs font-medium text-slate-600">
                  Courier
                </Label>
                <Select
                  value={selectedCourier}
                  onValueChange={onCourierChange}
                >
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue placeholder="Seleccionar courier" />
                  </SelectTrigger>
                  <SelectContent>
                    {courier.map((courierOption) => (
                      <SelectItem key={courierOption.value} value={courierOption.value}>
                        {courierOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}