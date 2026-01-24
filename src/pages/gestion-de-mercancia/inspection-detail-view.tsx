import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useGetInspectionById, useGetInspectionTrackingStatuses, useUpdateInspectionTrackingStatus } from "@/hooks/use-inspections";
import type { InspectionProduct, InspectionTrackingStatus, CargoType } from "@/api/interface/inspectionInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ViewFilesModal } from "./components/ViewFilesModal";
import { EditProductModal } from "./components/EditProductModal";
import CreateShipmentModal from "@/components/CreateShipmentModal";
import { ShipmentRouteTrackingMap } from "@/components/shipment-route-tracking";
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

  // Obtener lista de estados del endpoint (memoizado para evitar re-renders)
  const trackingStatuses = useMemo(
    () => statusesData?.statuses || [],
    [statusesData?.statuses]
  );

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

  /**
   * Obtiene el tracking_point correspondiente a un estado
   * Si el backend no lo proporciona, usa el order como fallback
   */
  const getTrackingPointForStatus = (statusValue: string): number => {
    const status = trackingStatuses.find(
      (s: InspectionTrackingStatus) => s.value === statusValue
    );
    // Usar tracking_point si existe, sino usar order como fallback
    return status?.tracking_point ?? status?.order ?? 1;
  };

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      toast.error("Selecciona un estado");
      return;
    }

    const trackingPoint = getTrackingPointForStatus(selectedStatus);

    updateStatusMutation.mutate(
      {
        status: selectedStatus,
        tracking_point: trackingPoint,
      },
      {
        onSuccess: () => {
          setUpdateStatusModalOpen(false);
          setSelectedStatus("");
        },
      }
    );
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

  /**
   * Calcula el punto actual del mapa basado en el MÁXIMO entre:
   * 1. inspection.tracking_point (del backend)
   * 2. El estado más avanzado de los productos
   * Esto permite que el mapa se actualice cuando cambia cualquiera de los dos
   */
  const currentTrackingPoint = useMemo((): number => {
    // Mapeo completo de estados de producto/tracking a puntos de ruta
    const productStatusMapping: Record<string, number> = {
      // Estados básicos de producto
      pending: 1,
      in_inspection: 2,
      awaiting_pickup: 3,
      in_transit: 7,
      dispatched: 13,
      // Estados de tracking de inspección (valores del endpoint)
      pending_arrival: 1,
      inspection_process: 2,
      vehicle_0_percent: 4,
      vehicle_50_percent: 5,
      vehicle_75_percent: 6,
      arrived_airport: 7,
      customs_inspection: 8,
      customs_waiting: 9,
      customs_delay: 10,
      customs_approved: 11,
      boarding_waiting: 12,
      boarding_confirmed: 13,
    };

    // Obtener tracking_point del backend (o 1 por defecto)
    let backendPoint = inspection?.tracking_point || 1;

    // Si hay tracking_status, buscar su punto correspondiente
    if (inspection?.tracking_status && trackingStatuses.length > 0) {
      const status = trackingStatuses.find(
        (s: InspectionTrackingStatus) => s.value === inspection.tracking_status
      );
      if (status) {
        const statusPoint = status.tracking_point ?? status.order ?? 1;
        backendPoint = Math.max(backendPoint, statusPoint);
      }
    }

    // Calcular el punto más avanzado de los productos
    let productPoint = 1;
    if (inspection?.content?.length) {
      const statusOrderMap: Record<string, number> = {};
      trackingStatuses.forEach((s: InspectionTrackingStatus) => {
        statusOrderMap[s.value] = s.tracking_point ?? s.order ?? 1;
      });

      productPoint = inspection.content.reduce(
        (max: number, product: InspectionProduct) => {
          let order = statusOrderMap[product.status];
          if (!order) {
            order = productStatusMapping[product.status] || 1;
          }
          return Math.max(max, order);
        },
        1
      );
    }

    // Retornar el máximo entre el punto del backend y el de los productos
    return Math.max(backendPoint, productPoint);
  }, [inspection, trackingStatuses]);

  /**
   * Determina el tipo de carga basado en inspection.cargo_type
   * Default: 'general' (ruta Shenzhen)
   */
  const cargoType: CargoType = inspection?.cargo_type || "general";

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
    <div className="min-h-screen bg-gray-50/30">
      {/* Header con navegación - Diseño minimalista */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/gestion-de-mercancias")}
                className="flex items-center gap-2 hover:bg-gray-50 -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Volver</span>
              </Button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-gray-900">
                    Detalles de Inspección
                  </h1>
                  <p className="text-xs text-gray-500">
                    ID: {inspection.id}
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setUpdateStatusModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all hover:shadow-md"
            >
              <Edit className="h-4 w-4" />
              <span className="text-sm">Actualizar Estado</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal con bentogrid */}
      <div className="p-6 space-y-6">
        {/* Información general y progreso en una sola fila */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Información general - 8 columnas */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card: Tipo de Servicio */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-gray-500 mb-2">Tipo de Servicio</p>
                <p className="text-xl font-bold text-gray-900 capitalize">
                  {inspection.shipping_service_type}
                </p>
              </CardContent>
            </Card>

            {/* Card: Servicio de Logística */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-gray-500 mb-2">Servicio de Logística</p>
                <p className="text-xl font-bold text-gray-900">
                  {inspection.logistics_service}
                </p>
              </CardContent>
            </Card>

            {/* Card: Última Actualización */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-gray-500 mb-2">Última Actualización</p>
                <p className="text-base font-semibold text-gray-900">
                  {formatDateLong(inspection.updated_at)}
                </p>
              </CardContent>
            </Card>

            {/* Card: Precio Total */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-emerald-600 mb-2">Precio Total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${inspection.total_price}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Card de Progreso de Inspección - 4 columnas */}
          <Card className="lg:col-span-4 border-0 shadow-sm bg-gradient-to-br from-slate-50/50 to-white">
            <CardContent className="p-5 h-full flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Navigation className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Progreso de Inspección</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Progreso General</span>
                  <span className="text-lg font-bold text-blue-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2.5" />
                <p className="text-xs text-gray-500">
                  Puntos 1-{trackingStatuses.length || 13}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layout principal: Productos (izquierda) y Mapa (abajo) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Sección izquierda: Lista de productos */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100">
                    <Package className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  Productos ({inspection.content.length})
                </h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {inspection.content.filter((p: InspectionProduct) => p.status === 'in_transit').length}/{inspection.content.length} en tránsito
                </span>
              </div>

              {/* Lista de productos como cards */}
              <div className="space-y-2.5">
                {inspection.content.map((product: InspectionProduct, index: number) => (
                  <Card
                    key={product.product_id}
                    className={`border-0 transition-all hover:shadow-md cursor-pointer ${
                      index === 0 ? 'shadow-sm bg-gradient-to-br from-blue-50/50 to-white' : 'shadow-sm bg-white'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Imagen del producto */}
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {product.product_id.slice(0, 20)}...
                          </p>

                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-baseline gap-1">
                                <span className="text-xs text-gray-500">Cant:</span>
                                <span className="font-semibold text-sm text-gray-900">{product.quantity}</span>
                              </div>
                              <div className="h-3 w-px bg-gray-200"></div>
                              <span className="text-xs text-gray-500">
                                {product.files.length} archivo{product.files.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600">
                              ${product.express_price}
                            </span>
                          </div>

                          {/* Estado */}
                          <div className="mt-2.5">
                            <Badge
                              className={`flex items-center gap-1 text-xs px-2.5 py-0.5 w-fit ${getStatusColor(product.status)}`}
                            >
                              {getStatusIcon(product.status)}
                              {getStatusText(product.status)}
                            </Badge>
                          </div>

                          {/* Botones de acción */}
                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 text-xs h-7 border-gray-200 hover:bg-gray-50"
                            >
                              <Edit className="h-3 w-3 mr-1.5" />
                              Editar
                            </Button>
                            {product.files.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewFiles(product)}
                                className="h-7 px-2.5 hover:bg-gray-50"
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
            <div className="lg:col-span-2">
              {/* Card del mapa de tracking dinámico */}
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-[500px] w-full">
                    <ShipmentRouteTrackingMap
                      serviceType={
                        inspection.shipping_service_type === "maritime"
                          ? "maritime"
                          : "aerial"
                      }
                      cargoType={cargoType}
                      currentPointNumber={currentTrackingPoint}
                    />
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
