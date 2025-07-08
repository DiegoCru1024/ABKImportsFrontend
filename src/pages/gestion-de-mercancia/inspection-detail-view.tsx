import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetInspectionById } from "@/hooks/use-inspections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUpdateInspectionProduct } from "@/hooks/use-inspections";
import { uploadMultipleFiles } from "@/api/fileUpload";
import { updateInspectionProduct } from "@/api/inspection";
import { useQueryClient } from "@tanstack/react-query";
import FileUploadComponent from "@/components/comp-552";
import { ViewFilesModal } from "./components/ViewFilesModal";
import CreateShipmentModal from "@/components/CreateShipmentModal";
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
  Image as ImageIcon,
  Save,
  X,
  Upload,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function InspectionDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: inspection, isLoading, error } = useGetInspectionById(id || "");

  // Estados para la edición inline
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [resetCounter, setResetCounter] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Estados para el modal de visualización
  const [viewFilesModalOpen, setViewFilesModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Estados para el modal de crear envío
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
    setEditingProductId(product.product_id);
    setEditingStatus(product.status);
    setExistingFiles(product.files);
    setNewFiles([]);
    setResetCounter(prev => prev + 1);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditingStatus("");
    setExistingFiles([]);
    setNewFiles([]);
  };

  const handleSaveEdit = async () => {
    if (!editingProductId) return;

    try {
      setIsUploading(true);

      // Subir nuevos archivos si los hay
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploadResponse = await uploadMultipleFiles(newFiles);
        uploadedUrls = uploadResponse.urls;
        toast.success(`${uploadedUrls.length} archivo(s) subido(s) exitosamente`);
      }

      // Combinar archivos existentes con los nuevos
      const allFiles = [...existingFiles, ...uploadedUrls];

      // Actualizar el producto usando la API directamente
      await updateInspectionProduct(id || "", editingProductId, {
        status: editingStatus,
        files: allFiles
      });

      // Invalidar la query para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["Inspections", id] });

      setIsUploading(false);
      handleCancelEdit();
      toast.success("Producto actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      setIsUploading(false);
      toast.error("Error al actualizar el producto");
    }
  };

  const handleViewFiles = (product: any) => {
    setSelectedProduct(product);
    setViewFilesModalOpen(true);
  };

  const handleCloseViewFilesModal = () => {
    setViewFilesModalOpen(false);
    setSelectedProduct(null);
  };

  const handleRemoveExistingFile = (index: number) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Verificar si todos los productos están en tránsito para habilitar crear envío
  const canCreateShipment = inspection?.content.every((product: any) => product.status === "in_transit");

  const handleCreateShipment = () => {
    setCreateShipmentModalOpen(true);
  };

  const getFileType = (url: string) => {
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) return 'image';
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('.doc') || url.includes('.docx')) return 'document';
    return 'other';
  };

  const getFileIcon = (url: string) => {
    const fileType = getFileType(url);
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'pdf':
        return <ExternalLink className="h-4 w-4" />;
      case 'document':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop();
      return fileName || 'Archivo';
    } catch {
      return 'Archivo';
    }
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
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateShipment}
                disabled={!canCreateShipment}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Crear Envío
              </Button>
              {!canCreateShipment && (
                <p className="text-xs text-muted-foreground">
                  Todos los productos deben estar en tránsito
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 space-y-6">
        {/* Información general - oculta durante edición */}
        {!editingProductId && (
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
        )}

        {/* Productos en tabla */}
        {!editingProductId && (
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
                    {inspection.content.map((product: any) => (
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
        )}

        {/* Formulario de edición inline */}
        {editingProductId && (
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  Editando Producto
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={editingStatus} onValueChange={setEditingStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_inspection">En Inspección</SelectItem>
                    <SelectItem value="awaiting_pickup">Esperando Recogida</SelectItem>
                    <SelectItem value="in_transit">En Tránsito</SelectItem>
                    <SelectItem value="dispatched">Despachado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Archivos existentes */}
              {existingFiles.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Archivos existentes ({existingFiles.length})</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {existingFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white rounded border">
                        {getFileIcon(file)}
                        <span className="flex-1 text-sm truncate">{getFileName(file)}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExistingFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subida de nuevos archivos */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Agregar nuevos archivos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                  <FileUploadComponent
                    onFilesChange={setNewFiles}
                    resetCounter={resetCounter}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Máx 20 archivos • Máx 16MB c/u • Formatos: imágenes, PDF, documentos
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de visualización de archivos */}
      {selectedProduct && (
        <ViewFilesModal
          isOpen={viewFilesModalOpen}
          onClose={handleCloseViewFilesModal}
          product={selectedProduct}
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