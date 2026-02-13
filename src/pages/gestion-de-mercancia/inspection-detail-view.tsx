import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useGetInspectionById, useGetInspectionTrackingStatuses } from "@/hooks/use-inspections";
import type { InspectionProduct, InspectionTrackingStatus, CargoType } from "@/api/interface/inspectionInterface";
import type { ShipmentTrackingStatus } from "@/api/interface/shipmentInterface";
import { useGetShipmentTrackingStatuses } from "@/hooks/use-shipments";
import { useGetInspectionShipments } from "@/hooks/use-inspections";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ViewFilesModal } from "./components/ViewFilesModal";
import { EditProductModal } from "./components/EditProductModal";
import CreateShipmentModal from "@/components/CreateShipmentModal";
import { ShipmentRouteTrackingMap } from "@/components/shipment-route-tracking";
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
} from "lucide-react";
import { formatDateLong } from "@/lib/format-time";

export default function InspectionDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: inspection, isLoading, error } = useGetInspectionById(id || "");
  const { data: statusesData } = useGetInspectionTrackingStatuses();
  const { data: shipmentStatusesData } = useGetShipmentTrackingStatuses();
  const { data: shipmentsData } = useGetInspectionShipments(id || "");

  // Estados para los modales
  const [viewFilesModalOpen, setViewFilesModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InspectionProduct | null>(null);
  const [createShipmentModalOpen, setCreateShipmentModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Seleccionar el primer producto por defecto cuando carga la inspección
  useEffect(() => {
    if (inspection?.content?.length && !selectedProductId) {
      setSelectedProductId(inspection.content[0].product_id);
    }
  }, [inspection?.content, selectedProductId]);

  // Producto actualmente seleccionado
  const activeProduct = useMemo(
    () => inspection?.content?.find((p: InspectionProduct) => p.product_id === selectedProductId) || null,
    [inspection?.content, selectedProductId]
  );

  // Obtener lista de estados del endpoint (memoizado para evitar re-renders)
  const trackingStatuses = useMemo(
    () => statusesData?.statuses || [],
    [statusesData?.statuses]
  );

  // Estados de tracking de shipments (14-45)
  const shipmentTrackingStatuses = useMemo(
    () => shipmentStatusesData?.statuses || [],
    [shipmentStatusesData?.statuses]
  );

  // Shipment vinculado (tomar el primero)
  const linkedShipment = useMemo(
    () => shipmentsData?.shipments?.[0] || null,
    [shipmentsData]
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
    // Buscar en estados de inspección (1-13)
    const inspectionFound = trackingStatuses.find((s: InspectionTrackingStatus) => s.value === status);
    if (inspectionFound) return inspectionFound.label;

    // Buscar en estados de shipment (14-45)
    const shipmentFound = shipmentTrackingStatuses.find((s: ShipmentTrackingStatus) => s.value === status);
    if (shipmentFound) return shipmentFound.label;

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
    queryClient.invalidateQueries({ queryKey: ["InspectionShipments", id] });
  };

  const handleViewFiles = (product: InspectionProduct) => {
    setSelectedProduct(product);
    setViewFilesModalOpen(true);
  };

  const handleCloseViewFilesModal = () => {
    setViewFilesModalOpen(false);
    setSelectedProduct(null);
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
   * Calcula el punto del mapa basado en el producto seleccionado.
   * Busca el tracking_point en estados de inspección (1-13) y shipment (14-45).
   */
  const currentTrackingPoint = useMemo((): number => {
    // If there's a linked shipment with tracking_point >= 14, use that
    if (linkedShipment?.tracking_point && linkedShipment.tracking_point >= 14) {
      return linkedShipment.tracking_point;
    }

    if (!activeProduct) return 1;

    // 1. Buscar en estados de inspección (1-13)
    const inspectionStatus = trackingStatuses.find(
      (s: InspectionTrackingStatus) => s.value === activeProduct.status
    );
    if (inspectionStatus) {
      return inspectionStatus.tracking_point ?? inspectionStatus.order ?? 1;
    }

    // 2. Buscar en estados de shipment (14-45)
    const shipmentStatus = shipmentTrackingStatuses.find(
      (s: ShipmentTrackingStatus) => s.value === activeProduct.status
    );
    if (shipmentStatus) {
      return shipmentStatus.tracking_point;
    }

    // 3. Fallback hardcodeado para estados básicos
    const productStatusMapping: Record<string, number> = {
      pending: 1,
      in_inspection: 2,
      awaiting_pickup: 3,
      in_transit: 7,
      dispatched: 13,
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

    return productStatusMapping[activeProduct.status] || 1;
  }, [activeProduct, trackingStatuses, shipmentTrackingStatuses, linkedShipment]);

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
          </div>
        </div>
      </div>

      {/* Contenido principal con bentogrid */}
      <div className="p-6 space-y-6">
        {/* Información general y progreso - diseño compacto */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card: Tipo de Servicio */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-gray-500 mb-1">Tipo de Servicio</p>
              <p className="text-sm font-bold text-gray-900 capitalize truncate">
                {inspection.shipping_service_type}
              </p>
            </CardContent>
          </Card>

          {/* Card: Servicio de Logística */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-gray-500 mb-1">Logística</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {inspection.logistics_service}
              </p>
            </CardContent>
          </Card>

          {/* Card: Última Actualización */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-gray-500 mb-1">Actualización</p>
              <p className="text-xs font-semibold text-gray-900 truncate">
                {formatDateLong(inspection.updated_at)}
              </p>
            </CardContent>
          </Card>

          {/* Card: Precio Total */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-emerald-600 mb-1">Precio Total</p>
              <p className="text-lg font-bold text-emerald-600">
                ${inspection.total_price}
              </p>
            </CardContent>
          </Card>

          {/* Card de Progreso de Inspección - compacto */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50/50 to-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium text-gray-500">Progreso</p>
                <span className="text-sm font-bold text-blue-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </CardContent>
          </Card>
        </div>

        {/* Layout principal: Mapa (izquierda) y Productos (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sección izquierda: Mapa de tracking */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm bg-white overflow-hidden h-full">
                <CardContent className="p-0">
                  <div className="relative h-[560px] w-full">
                    <ShipmentRouteTrackingMap
                      key={`map-${currentTrackingPoint}`}
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

            {/* Sección derecha: Lista de productos */}
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100">
                    <Package className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  Productos ({inspection.content.length})
                </h2>
                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {inspection.content.filter((p: InspectionProduct) => p.status === 'in_transit').length}/{inspection.content.length} en tránsito
                </span>
              </div>

              {/* Lista de productos como cards - scroll si hay muchos */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                {inspection.content.map((product: InspectionProduct) => (
                  <Card
                    key={product.product_id}
                    onClick={() => setSelectedProductId(product.product_id)}
                    className={`transition-all cursor-pointer ${
                      selectedProductId === product.product_id
                        ? 'border-2 border-blue-500 shadow-md bg-gradient-to-br from-blue-50/50 to-white'
                        : 'border-0 shadow-sm bg-white hover:shadow-md'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-2.5">
                        {/* Imagen del producto - más pequeña */}
                        <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {/*<ImageIcon className="h-5 w-5 text-gray-400" />*/}
                          <img className="h-5 w-5 text-gray-400" src={product.files?.[0] || "https://placehold.co/20x20"} alt="Producto" />
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-xs truncate">
                            {product.name}
                          </h3>
                          <p className="text-[10px] text-gray-500 truncate">
                            {product.product_id.slice(0, 16)}...
                          </p>

                          <div className="mt-1.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500">
                                <span className="font-medium text-gray-700">{product.quantity}</span> uds
                              </span>
                              <span className="text-[10px] text-gray-400">•</span>
                              <span className="text-[10px] text-gray-500">
                                {product.files.length} arch.
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">
                              ${product.express_price}
                            </span>
                          </div>

                          {/* Estado y acciones en una fila */}
                          <div className="mt-2 flex items-center justify-between">
                            <Badge
                              className={`flex items-center gap-1 text-[10px] px-2 py-0 h-5 w-fit ${getStatusColor(product.status)}`}
                            >
                              {getStatusIcon(product.status)}
                              {getStatusText(product.status)}
                            </Badge>

                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                                className="text-[10px] h-5 px-2 border-gray-200 hover:bg-gray-50"
                              >
                                <Edit className="h-2.5 w-2.5 mr-1" />
                                Editar
                              </Button>
                              {product.files.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleViewFiles(product); }}
                                  className="h-5 px-1.5 hover:bg-gray-50"
                                >
                                  <Eye className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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

    </div>
  );
}
