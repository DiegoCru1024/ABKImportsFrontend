import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateShipment } from "@/hooks/use-shipments";
import { useGetShipmentInfo } from "@/hooks/use-shipments";
import type { CreateShipmentRequest, ContainerType } from "@/api/interface/shipmentInterface";
import { toast } from "sonner";
import { Package, Plane, Ship, Calendar, Weight, MapPin } from "lucide-react";

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: string;
  inspectionData?: any; // Datos de la inspección para pre-llenar
}

export default function CreateShipmentModal({
  isOpen,
  onClose,
  inspectionId,
  inspectionData,
}: CreateShipmentModalProps) {
  const [formData, setFormData] = useState<CreateShipmentRequest>({
    inspection_id: inspectionId,
    origin: "",
    destination: "",
    weight: 0,
    container_type: undefined,
    estimated_date: undefined,
  });

  const [shippingType, setShippingType] = useState<"aerial" | "maritime">("aerial");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createShipment, isPending } = useCreateShipment();
  const { data: shipmentInfo } = useGetShipmentInfo();

  // Pre-llenar datos de la inspección si están disponibles
  useEffect(() => {
    if (inspectionData) {
      setFormData(prev => ({
        ...prev,
        origin: inspectionData.origin || "Shenzhen, China",
        destination: inspectionData.destination || "Lima, Peru",
        weight: inspectionData.total_weight || 0,
      }));
    }
  }, [inspectionData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.origin.trim()) {
      newErrors.origin = "El origen es requerido";
    }

    if (!formData.destination.trim()) {
      newErrors.destination = "El destino es requerido";
    }

    if (formData.weight <= 0) {
      newErrors.weight = "El peso debe ser mayor a 0";
    }

    if (shippingType === "maritime" && !formData.container_type) {
      newErrors.container_type = "El tipo de contenedor es requerido para envíos marítimos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateShipmentRequest = {
      ...formData,
      container_type: shippingType === "maritime" ? formData.container_type : undefined,
    };

    createShipment(submitData, {
      onSuccess: () => {
        toast.success("Envío creado exitosamente");
        onClose();
        setFormData({
          inspection_id: inspectionId,
          origin: "",
          destination: "",
          weight: 0,
          container_type: undefined,
          estimated_date: undefined,
        });
        setErrors({});
      },
      onError: (error: any) => {
        toast.error(error.message || "Error al crear el envío");
      },
    });
  };

  const handleInputChange = (field: keyof CreateShipmentRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Crear Nuevo Envío
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de envío */}
          <div className="space-y-2">
            <Label>Tipo de Envío</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={shippingType === "aerial" ? "default" : "outline"}
                onClick={() => setShippingType("aerial")}
                className="flex items-center gap-2"
              >
                <Plane className="h-4 w-4" />
                Aéreo
              </Button>
              <Button
                type="button"
                variant={shippingType === "maritime" ? "default" : "outline"}
                onClick={() => setShippingType("maritime")}
                className="flex items-center gap-2"
              >
                <Ship className="h-4 w-4" />
                Marítimo
              </Button>
            </div>
          </div>

          {/* Origen y Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Origen
              </Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => handleInputChange("origin", e.target.value)}
                placeholder="Ej: Shenzhen, China"
                className={errors.origin ? "border-red-500" : ""}
              />
              {errors.origin && (
                <p className="text-sm text-red-500">{errors.origin}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Destino
              </Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                placeholder="Ej: Lima, Peru"
                className={errors.destination ? "border-red-500" : ""}
              />
              {errors.destination && (
                <p className="text-sm text-red-500">{errors.destination}</p>
              )}
            </div>
          </div>

          {/* Peso y Fecha Estimada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Peso (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.weight ? "border-red-500" : ""}
              />
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha Estimada de Llegada
              </Label>
              <Input
                id="estimated_date"
                type="date"
                value={formData.estimated_date || ""}
                onChange={(e) => handleInputChange("estimated_date", e.target.value)}
              />
            </div>
          </div>

          {/* Tipo de Contenedor (solo para marítimos) */}
          {shippingType === "maritime" && (
            <div className="space-y-2">
              <Label htmlFor="container_type">Tipo de Contenedor</Label>
              <Select
                value={formData.container_type || ""}
                onValueChange={(value) => handleInputChange("container_type", value as ContainerType)}
              >
                <SelectTrigger className={errors.container_type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar tipo de contenedor" />
                </SelectTrigger>
                              <SelectContent>
                {[
                  '20ft Standard',
                  '40ft Standard',
                  '40ft High Cube',
                  '20ft Refrigerated',
                  '40ft Refrigerated',
                  '20ft Open Top',
                  '40ft Open Top',
                  '20ft Flat Rack',
                  '40ft Flat Rack'
                ].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
              {errors.container_type && (
                <p className="text-sm text-red-500">{errors.container_type}</p>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Todos los productos de la inspección deben estar en estado "En Tránsito"</li>
              <li>• Para envíos marítimos, se requiere especificar el tipo de contenedor</li>
              <li>• Solo el propietario de la inspección o administradores pueden crear envíos</li>
              <li>• El progreso se calculará automáticamente según la ubicación y tipo de envío</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear Envío"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 