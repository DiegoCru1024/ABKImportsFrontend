import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetShipmentById, useUpdateShipmentStatus, useGetShipmentInfo } from "@/hooks/use-shipments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ShipmentTrackingMap from "@/components/ShipmentTrackingMap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Package,
  MapPin,
  Weight,
  ArrowLeft,
  Edit,
  Plane,
  Ship,
  Clock,
  Navigation,
} from "lucide-react";
import type { UpdateShipmentStatusRequest, ShipmentStatus, CurrentLocation, StatusHistoryEntry } from "@/api/interface/shipmentInterface";
import { formatDateLong } from "@/lib/format-time";

export default function ShipmentDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: shipment, isLoading, error } = useGetShipmentById(id || "");
  const { data: shipmentInfo } = useGetShipmentInfo();
  const { mutate: updateStatus, isPending } = useUpdateShipmentStatus();

  // Estados para el modal de actualización
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateShipmentStatusRequest>({
    status: "pending_product_arrival",
    current_location: "Nanning",
    notes: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_transit":
      case "on_vessel":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending_arrival":
      case "awaiting_pickup":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_inspection":
      case "chinese_customs_inspection":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_product_arrival":
        return "Pendiente de llegada del producto";
      case "in_inspection":
        return "En inspección";
      case "awaiting_pickup":
        return "En espera de recojo";
      case "dispatched":
        return "Despachado";
      case "airport":
        return "Aeropuerto";
      case "in_transit":
        return "En tránsito";
      case "arrived_destination":
        return "Paquete llegado al destino";
      case "customs":
        return "Aduanas";
      case "delivered":
        return "Entregado";
      case "chinese_customs_inspection":
        return "Inspección de aduanas chinas";
      case "chinese_customs_release":
        return "Levante de aduanas china";
      case "on_vessel":
        return "En el buque";
      case "in_port":
        return "En Puerto";
      case "pending_container_unloading":
        return "Pendiente de descarga de contenedor";
      case "container_unloaded_customs":
        return "Contenedor descargado en aduanas";
      case "peruvian_customs_release":
        return "Levante de aduanas peruanas";
      case "local_warehouse_transit":
        return "En tránsito almacén local";
      default:
        return status;
    }
  };

  const getShippingTypeIcon = (type: string) => {
    return type === "aerial" ? (
      <Plane className="h-5 w-5 text-blue-500" />
    ) : (
      <Ship className="h-5 w-5 text-green-500" />
    );
  };

  const getShippingTypeText = (type: string) => {
    return type === "aerial" ? "Aéreo" : "Marítimo";
  };


  const handleUpdateStatus = () => {
    if (!id) return;

    updateStatus(
      { id, data: updateData },
      {
        onSuccess: () => {
          toast.success("Estado actualizado exitosamente");
          setUpdateModalOpen(false);
          setUpdateData({
            status: "pending_product_arrival",
            current_location: "Nanning",
            notes: "",
          });
        },
        onError: (error: any) => {
          toast.error(error.message || "Error al actualizar el estado");
        },
      }
    );
  };

  const getAvailableStatuses = () => {
    if (!shipmentInfo || !shipment) return [];

    const type = shipment.shipping_type;
    const statuses = type === 'aerial' ? shipmentInfo.aerial_statuses : shipmentInfo.maritime_statuses;

    return statuses.map((status: string) => ({
      name: status,
      description: getStatusText(status)
    }));
  };

  const getAvailableLocations = () => {
    if (!shipmentInfo || !shipment) return [];

    const type = shipment.shipping_type;
    const locations = type === 'aerial' ? shipmentInfo.aerial_locations : shipmentInfo.maritime_locations;

    return Object.entries(locations).map(([name, progress]) => ({
      name,
      progress
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500/5 via-background to-green-400/10">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Cargando detalles del envío...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500/5 via-background to-green-400/10">
        <div className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/tracking-de-mercancias")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Tracking
            </Button>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar el envío</h2>
            <p className="text-red-700">
              {error?.message || "No se pudo cargar los detalles del envío"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/5 via-background to-green-400/10">
      {/* Header con navegación */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/tracking-de-mercancias")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 hover:bg-green-600">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Detalles del Envío
                </h1>
                <p className="text-sm text-muted-foreground">
                  {shipment.correlative}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setUpdateModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Actualizar Estado
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 space-y-6">
        {/* Información general */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getShippingTypeIcon(shipment.shipping_type)}
                  <span className="text-sm font-medium text-muted-foreground">Tipo de Envío</span>
                </div>
                <Badge variant="outline" className="capitalize text-sm">
                  {getShippingTypeText(shipment.shipping_type)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Origen</span>
                </div>
                <p className="font-medium">{shipment.origin}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Destino</span>
                </div>
                <p className="font-medium">{shipment.destination}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Peso</span>
                </div>
                <p className="font-bold text-lg">
                  {shipment.weight.toLocaleString()} kg
                </p>
              </div>
            </div>

            {shipment.container_type && (
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Tipo de Contenedor</span>
                  </div>
                  <p className="font-medium">{shipment.container_type}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progreso y estado actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Progreso del Envío
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Barra de progreso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progreso General</span>
                  <span className="text-sm font-bold text-green-600">{shipment.progress}%</span>
                </div>
                <Progress value={shipment.progress} className="h-3" />
              </div>

              {/* Estado actual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado Actual</Label>
                  <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(shipment.status)}`}>
                    {getStatusText(shipment.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ubicación Actual</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{shipment.current_location}</span>
                  </div>
                </div>
              </div>

              {/* Mapa de tracking de envío */}
              <ShipmentTrackingMap shipmentId={id!} />
            </div>
          </CardContent>
        </Card>

        {/* Historial de estados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial de Estados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipment.status_history.map((entry: StatusHistoryEntry, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(entry.status)}>
                        {getStatusText(entry.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDateLong(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{entry.location}</p>
                    <p className="text-sm text-muted-foreground">Progreso: {entry.progress}%</p>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{entry.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de actualización de estado */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Envío</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select
                value={updateData.status}
                onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value as ShipmentStatus }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStatuses().map((status: { name: string; description: string }) => (
                    <SelectItem key={status.name} value={status.name}>
                      {status.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nueva Ubicación</Label>
              <Select
                value={updateData.current_location}
                onValueChange={(value) => setUpdateData(prev => ({ ...prev, current_location: value as CurrentLocation }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableLocations().map((location: { name: string; progress: any }) => (
                    <SelectItem key={location.name} value={location.name}>
                      {location.name} ({location.progress}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notas (Opcional)</Label>
              <Textarea
                value={updateData.notes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Agregar notas sobre el cambio de estado..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isPending}>
              {isPending ? "Actualizando..." : "Actualizar Estado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 