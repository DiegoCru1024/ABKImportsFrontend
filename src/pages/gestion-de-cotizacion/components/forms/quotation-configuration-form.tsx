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
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-sm">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-slate-800">
              Configuración General
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              Configure los parámetros generales de la cotización
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="servicio-logistico" className="text-sm font-medium text-slate-700">
              Servicio Logístico
            </Label>
            <Select
              value={selectedServiceLogistic}
              onValueChange={onServiceLogisticChange}
            >
              <SelectTrigger className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="incoterm" className="text-sm font-medium text-slate-700">
              Incoterm
            </Label>
            <Select
              value={selectedIncoterm}
              onValueChange={onIncotermChange}
            >
              <SelectTrigger className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="tipo-carga" className="text-sm font-medium text-slate-700">
              Tipo de Carga
            </Label>
            <Select
              value={selectedTypeLoad}
              onValueChange={onTypeLoadChange}
            >
              <SelectTrigger className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="courier" className="text-sm font-medium text-slate-700">
              Courier
            </Label>
            <Select
              value={selectedCourier}
              onValueChange={onCourierChange}
            >
              <SelectTrigger className="w-full">
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
        </div>
      </CardContent>
    </Card>
  );
}