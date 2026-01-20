import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetInspectionById } from "@/hooks/use-inspections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ViewFilesModal } from "./components/ViewFilesModal";
import { EditProductModal } from "./components/EditProductModal";
import CreateShipmentModal from "@/components/CreateShipmentModal";
import InspectionTrackingMap from "@/components/InspectionTrackingMap";
import {
  Package,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Image as ImageIcon
} from "lucide-react";
import { formatDateLong } from "@/lib/format-time";

export default function InspectionDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: inspection, isLoading, error } = useGetInspectionById(id || "");

  // Estados para los modales
  const [viewFilesModalOpen, setViewFilesModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [createShipmentModalOpen, setCreateShipmentModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_inspection":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "awaiting_pickup":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "in_transit":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "dispatched":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_inspection":
        return <AlertTriangle className="h-4 w-4" />;
      case "awaiting_pickup":
        return <Package className="h-4 w-4" />;
      case "in_transit":
        return <ExternalLink className="h-4 w-4" />;
      case "dispatched":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
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


  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setEditProductModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditProductModalOpen(false);
    setSelectedProduct(null);
    // Invalidar la query para refrescar los datos
    queryClient.invalidateQueries({ queryKey: ["Inspections", id] });
  };

  const handleViewFiles = (product: any) => {
    setSelectedProduct(product);
    setViewFilesModalOpen(true);
  };

  const handleCloseViewFilesModal = () => {
    setViewFilesModalOpen(false);
    setSelectedProduct(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header con navegación */}
      <div className="border-b border-border/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-6 py-4">
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
                  {inspection.content.filter((p: any) => p.status === 'in_transit').length}/{inspection.content.length} en estado actual
                </p>
              </div>

              {/* Lista de productos como cards */}
              <div className="space-y-3">
                {inspection.content.map((product: any, index: number) => (
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
                              <span className="text-xs line-through text-muted-foreground">
                                ${(product.quantity * Number(product.regular_price || product.express_price)).toFixed(2)}
                              </span>
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
    </div>
  );
} 