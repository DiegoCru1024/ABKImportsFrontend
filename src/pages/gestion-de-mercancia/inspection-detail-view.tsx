import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetInspectionById, useGetInspectionTrackingStatuses, useUpdateInspectionTrackingStatus } from "@/hooks/use-inspections";
import type { InspectionProduct, InspectionTrackingStatus } from "@/api/interface/inspectionInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ViewFilesModal } from "./components/ViewFilesModal";
import { EditProductModal } from "./components/EditProductModal";
import CreateShipmentModal from "@/components/CreateShipmentModal";
import InspectionTrackingMap from "@/components/InspectionTrackingMap";
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
import { Progress } from "@/components/ui/progress";
import {
  Package,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Image as ImageIcon,
  Navigation,
  Loader2
} from "lucide-react";
import { formatDateLong } from "@/lib/format-time";
import { toast } from "sonner";

export default function InspectionDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: inspection, isLoading, error } = useGetInspectionById(id || "");
  const { data: statusesData, isLoading: isLoadingStatuses } = useGetInspectionTrackingStatuses();
  const updateStatusMutation = useUpdateInspectionTrackingStatus(id || "");

  // Estados para los modales
  const [viewFilesModalOpen, setViewFilesModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InspectionProduct | null>(null);
  const [createShipmentModalOpen, setCreateShipmentModalOpen] = useState(false);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Obtener lista de estados del endpoint
  const trackingStatuses = statusesData?.statuses || [];

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pending") || statusLower === "awaiting_pickup") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    if (statusLower.includes("inspection")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (statusLower.includes("transit") || statusLower.includes("arrived")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    if (statusLower.includes("customs")) {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    if (statusLower.includes("dispatched") || statusLower.includes("confirmed") || statusLower.includes("approved")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pending")) {
      return <Clock className="h-4 w-4" />;
    }
    if (statusLower.includes("inspection")) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (statusLower.includes("pickup") || statusLower.includes("waiting")) {
      return <Package className="h-4 w-4" />;
    }
    if (statusLower.includes("transit") || statusLower.includes("arrived")) {
      return <ExternalLink className="h-4 w-4" />;
    }
    if (statusLower.includes("confirmed") || statusLower.includes("approved")) {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const getStatusText = (status: string) => {
    // Buscar en los estados del endpoint
    const found = trackingStatuses.find((s: InspectionTrackingStatus) => s.value === status);
    if (found) return found.label;

    // Fallback para estados básicos de producto
    switch (status.toLowerCase()) {
      case "pending":
        return "Pendiente";
      case "in_inspection":
        return "En Inspección";
      case "awaiting_pickup":
        return "Esperando Recogida";
      case "in_transit":
        return "En Tránsito";
      case "dispatched":
        return "Despachado";
      default:
        return status;
    }
  };

  const handleEditProduct = (product: InspectionProduct) => {
    setSelectedProduct(product);
    setEditProductModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditProductModalOpen(false);
    setSelectedProduct(null);
    queryClient.invalidateQueries({ queryKey: ["Inspections", id] });
  };

  const handleViewFiles = (product: InspectionProduct) => {
    setSelectedProduct(product);
    setViewFilesModalOpen(true);
  };

  const handleCloseViewFilesModal = () => {
    setViewFilesModalOpen(false);
    setSelectedProduct(null);
  };

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      toast.error("Selecciona un estado");
      return;
    }
    updateStatusMutation.mutate(selectedStatus, {
      onSuccess: () => {
        setUpdateStatusModalOpen(false);
        setSelectedStatus("");
      },
    });
  };

  // Calcular progreso basado en el estado actual de tracking
  const calculateProgress = () => {
    if (!inspection?.content?.length || trackingStatuses.length === 0) return 0;

    // Crear mapa de status value -> order
    const statusOrderMap: Record<string, number> = {};
    trackingStatuses.forEach((s: InspectionTrackingStatus) => {
      statusOrderMap[s.value] = s.order;
    });

    // Mapeo de estados simplificados de producto a estados de tracking
    const productStatusMapping: Record<string, number> = {
      pending: 1,
      in_inspection: 2,
      awaiting_pickup: 3,
      in_transit: 7,
      dispatched: 13,
    };

    const maxOrder = inspection.content.reduce((max: number, product: InspectionProduct) => {
      // Primero buscar en el mapeo de tracking
      let order = statusOrderMap[product.status];
      // Si no está, usar el mapeo simplificado
      if (!order) {
        order = productStatusMapping[product.status] || 1;
      }
      return Math.max(max, order);
    }, 1);

    const totalPoints = trackingStatuses.length || 13;
    return Math.round((maxOrder / totalPoints) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Cargando detalles de la inspección...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
        <div className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/gestion-de-mercancias")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Gestión de Mercancías
            </Button>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar la inspección</h2>
            <p className="text-red-700">
              {error.message || "No se pudo cargar los detalles de la inspección"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
        <div className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/gestion-de-mercancias")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Gestión de Mercancías
            </Button>
          </div>
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Inspección no encontrada</h2>
            <p className="text-yellow-700">
              No se encontró la inspección con el ID proporcionado
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header con navegación */}
      <div className="border-b border-border/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/gestion-de-mercancias")}
                className="flex items-center gap-2 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Detalles de Inspección
                </h1>
                <p className="text-sm text-muted-foreground">
                  ID: {inspection.id}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setUpdateStatusModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Actualizar Estado
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal con bentogrid */}
      <div className="p-6 space-y-6">
        {/* Grid de información general - 4 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card: Tipo de Servicio */}
            <Card className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Servicio</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {inspection.shipping_service_type}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card: Servicio de Logística */}
            <Card className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Servicio de Logística</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inspection.logistics_service}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card: Última Actualización */}
            <Card className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDateLong(inspection.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card: Precio Total */}
            <Card className="border border-emerald-200 bg-emerald-50/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-emerald-700">Precio Total</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${inspection.total_price}
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Card de Progreso de Inspección */}
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Progreso de Inspección</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progreso General</span>
                <span className="text-sm font-bold text-blue-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Fase de inspección en China (Puntos 1-{trackingStatuses.length || 13})
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Layout principal: Productos (izquierda) y Mapa (abajo) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sección izquierda: Lista de productos */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  Productos ({inspection.content.length})
                </h2>
                <p className="text-sm text-muted-foreground">
                  {inspection.content.filter((p: InspectionProduct) => p.status === 'in_transit').length}/{inspection.content.length} en tránsito
                </p>
              </div>

              {/* Lista de productos como cards */}
              <div className="space-y-3">
                {inspection.content.map((product: InspectionProduct, index: number) => (
                  <Card
                    key={product.product_id}
                    className={`border transition-all hover:shadow-md cursor-pointer ${
                      index === 0 ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Imagen del producto */}
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-8 w-8 text-slate-400" />
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            ID: {product.product_id.slice(0, 20)}...
                          </p>

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs text-muted-foreground">Cant:</span>
                              <span className="font-semibold text-sm">{product.quantity}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-emerald-600">
                                ${product.express_price}
                              </span>
                            </div>
                          </div>

                          {/* Estado y archivos */}
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <Badge
                              className={`flex items-center gap-1 text-xs px-2 py-0.5 ${getStatusColor(product.status)}`}
                            >
                              {getStatusIcon(product.status)}
                              {getStatusText(product.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {product.files.length} archivo{product.files.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Botones de acción */}
                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 text-xs h-8"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            {product.files.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewFiles(product)}
                                className="h-8 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sección derecha e inferior: Mapa y ubicación */}
            <div className="lg:col-span-2 space-y-4">
              {/* Card de información de ubicación */}
              <Card className="border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Ubicación del Envío
                          </h3>
                          <p className="text-lg font-bold text-gray-900">
                            {inspection.origin || 'Shenzhen, China'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Provincia de Cantón, China
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card del mapa */}
              <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-[450px] w-full">
                    <InspectionTrackingMap inspectionId={id!} />
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      </div>

      {/* Modal de visualización de archivos */}
      {selectedProduct && viewFilesModalOpen && (
        <ViewFilesModal
          isOpen={viewFilesModalOpen}
          onClose={handleCloseViewFilesModal}
          product={selectedProduct}
        />
      )}

      {/* Modal de edición de producto */}
      {selectedProduct && editProductModalOpen && (
        <EditProductModal
          isOpen={editProductModalOpen}
          onClose={handleCloseEditModal}
          product={selectedProduct}
          inspectionId={id || ""}
        />
      )}

      {/* Modal de crear envío */}
      <CreateShipmentModal
        isOpen={createShipmentModalOpen}
        onClose={() => setCreateShipmentModalOpen(false)}
        inspectionId={id || ""}
        inspectionData={inspection}
      />

      {/* Modal de actualización de estado de tracking */}
      <Dialog open={updateStatusModalOpen} onOpenChange={setUpdateStatusModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Estado de Tracking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nuevo Estado de Inspección</Label>
              {isLoadingStatuses ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-muted-foreground">Cargando estados...</span>
                </div>
              ) : (
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {trackingStatuses.map((status: InspectionTrackingStatus) => (
                      <SelectItem key={status.id} value={status.value}>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">#{status.order}</span>
                          <span>{status.label}</span>
                          {status.isOptional && (
                            <span className="text-xs text-orange-500">(opcional)</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Selecciona el estado actual de la inspección (puntos 1-{trackingStatuses.length || 13})
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending || !selectedStatus || isLoadingStatuses}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Estado"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
