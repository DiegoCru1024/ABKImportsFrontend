import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetInspectionById } from "@/hooks/use-inspections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditProductModal } from "./components/EditProductModal";
import { ViewFilesModal } from "./components/ViewFilesModal";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  FileText, 
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Image as ImageIcon
} from "lucide-react";

export default function InspectionDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: inspection, isLoading, error } = useGetInspectionById(id || "");
  
  // Estados para los modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewFilesModalOpen, setViewFilesModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_inspection":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_inspection":
        return <AlertTriangle className="h-4 w-4" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Pendiente";
      case "completed":
        return "Completado";
      case "in_inspection":
        return "En Inspección";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleViewFiles = (product: any) => {
    setSelectedProduct(product);
    setViewFilesModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedProduct(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
      {/* Header con navegación */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/dashboard/gestion-de-mercancias")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600">
                <Package className="h-6 w-6 text-white" />
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
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Tipo de Servicio</span>
                </div>
                <Badge variant="outline" className="capitalize text-sm">
                  {inspection.shipping_service_type}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Servicio de Logística</span>
                </div>
                <p className="font-medium">{inspection.logistics_service}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Última Actualización</span>
                </div>
                <p className="font-medium">{formatDate(inspection.updated_at)}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Precio Total</span>
                </div>
                <p className="font-bold text-green-600 text-lg">
                  ${inspection.total_price}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productos en tabla */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos ({inspection.content.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Precio Express</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Archivos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspection.content.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {product.product_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{product.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${(product.quantity * Number(product.express_price)).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">${product.express_price}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(product.status)}`}>
                          {getStatusIcon(product.status)}
                          {getStatusText(product.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {product.files.length} archivo{product.files.length !== 1 ? 's' : ''}
                          </span>
                          {product.files.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewFiles(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      {selectedProduct && (
        <>
          <EditProductModal
            isOpen={editModalOpen}
            onClose={handleCloseEditModal}
            product={selectedProduct}
            inspectionId={inspection.id}
          />
          <ViewFilesModal
            isOpen={viewFilesModalOpen}
            onClose={handleCloseViewFilesModal}
            product={selectedProduct}
          />
        </>
      )}
    </div>
  );
} 