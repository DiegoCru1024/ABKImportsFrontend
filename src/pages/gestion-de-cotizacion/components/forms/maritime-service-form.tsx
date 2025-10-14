import {
  Truck,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MaritimeServiceFormProps {
  selectedRegimen: string;
  onRegimenChange: (value: string) => void;
  selectedPaisOrigen: string;
  onPaisOrigenChange: (value: string) => void;
  selectedPaisDestino: string;
  onPaisDestinoChange: (value: string) => void;
  selectedAduana: string;
  onAduanaChange: (value: string) => void;
  selectedPuertoSalida: string;
  onPuertoSalidaChange: (value: string) => void;
  selectedPuertoDestino: string;
  onPuertoDestinoChange: (value: string) => void;
  selectedTipoServicio: string;
  onTipoServicioChange: (value: string) => void;
  tiempoTransito: number;
  onTiempoTransitoChange: (value: number) => void;
  selectedProformaVigencia: string;
  onProformaVigenciaChange: (value: string) => void;
  naviera: string;
  onNavieraChange: (value: string) => void;
  regimenOptions: Array<{ value: string; label: string }>;
  paisesOrigen: Array<{ value: string; label: string }>;
  paisesDestino: Array<{ value: string; label: string }>;
  aduana: Array<{ value: string; label: string }>;
  puertosSalida: Array<{ value: string; label: string }>;
  puertosDestino: Array<{ value: string; label: string }>;
  tipoServicio: Array<{ value: string; label: string }>;
  proformaVigencia: Array<{ value: string; label: string }>;
}

export function MaritimeServiceForm({
  selectedRegimen,
  onRegimenChange,
  selectedPaisOrigen,
  onPaisOrigenChange,
  selectedPaisDestino,
  onPaisDestinoChange,
  selectedAduana,
  onAduanaChange,
  selectedPuertoSalida,
  onPuertoSalidaChange,
  selectedPuertoDestino,
  onPuertoDestinoChange,
  selectedTipoServicio,
  onTipoServicioChange,
  tiempoTransito,
  onTiempoTransitoChange,
  selectedProformaVigencia,
  onProformaVigenciaChange,
  naviera,
  onNavieraChange,
  regimenOptions,
  paisesOrigen,
  paisesDestino,
  aduana,
  puertosSalida,
  puertosDestino,
  tipoServicio,
  proformaVigencia,
}: MaritimeServiceFormProps) {
  return (
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg shadow-sm">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-slate-800">
              Configuración Marítima
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              Parámetros específicos para servicios de transporte marítimo
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="regimen" className="text-sm font-medium text-slate-700">
              Régimen
            </Label>
            <Select value={selectedRegimen} onValueChange={onRegimenChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar régimen" />
              </SelectTrigger>
              <SelectContent>
                {regimenOptions.map((regimen) => (
                  <SelectItem key={regimen.value} value={regimen.value}>
                    {regimen.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pais-origen" className="text-sm font-medium text-slate-700">
              País de Origen
            </Label>
            <Select value={selectedPaisOrigen} onValueChange={onPaisOrigenChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent>
                {paisesOrigen.map((pais) => (
                  <SelectItem key={pais.value} value={pais.value}>
                    {pais.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pais-destino" className="text-sm font-medium text-slate-700">
              País de Destino
            </Label>
            <Select value={selectedPaisDestino} onValueChange={onPaisDestinoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent>
                {paisesDestino.map((pais) => (
                  <SelectItem key={pais.value} value={pais.value}>
                    {pais.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aduana" className="text-sm font-medium text-slate-700">
              Aduana
            </Label>
            <Select value={selectedAduana} onValueChange={onAduanaChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar aduana" />
              </SelectTrigger>
              <SelectContent>
                {aduana.map((aduanaOption) => (
                  <SelectItem key={aduanaOption.value} value={aduanaOption.value}>
                    {aduanaOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="puerto-salida" className="text-sm font-medium text-slate-700">
              Puerto de Salida
            </Label>
            <Select value={selectedPuertoSalida} onValueChange={onPuertoSalidaChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar puerto" />
              </SelectTrigger>
              <SelectContent>
                {puertosSalida.map((puerto) => (
                  <SelectItem key={puerto.value} value={puerto.value}>
                    {puerto.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="puerto-destino" className="text-sm font-medium text-slate-700">
              Puerto de Destino
            </Label>
            <Select value={selectedPuertoDestino} onValueChange={onPuertoDestinoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar puerto" />
              </SelectTrigger>
              <SelectContent>
                {puertosDestino.map((puerto) => (
                  <SelectItem key={puerto.value} value={puerto.value}>
                    {puerto.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo-servicio" className="text-sm font-medium text-slate-700">
              Tipo de Servicio
            </Label>
            <Select value={selectedTipoServicio} onValueChange={onTipoServicioChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {tipoServicio.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiempo-transito" className="text-sm font-medium text-slate-700">
              Tiempo de Tránsito (días)
            </Label>
            <Input
              type="number"
              value={tiempoTransito}
              onChange={(e) => onTiempoTransitoChange(Number(e.target.value))}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proforma-vigencia" className="text-sm font-medium text-slate-700">
              Vigencia Proforma
            </Label>
            <Select value={selectedProformaVigencia} onValueChange={onProformaVigenciaChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar vigencia" />
              </SelectTrigger>
              <SelectContent>
                {proformaVigencia.map((vigencia) => (
                  <SelectItem key={vigencia.value} value={vigencia.value}>
                    {vigencia.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="naviera" className="text-sm font-medium text-slate-700">
              Naviera
            </Label>
            <Input
              type="text"
              value={naviera}
              onChange={(e) => onNavieraChange(e.target.value)}
              placeholder="Ingrese naviera"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}