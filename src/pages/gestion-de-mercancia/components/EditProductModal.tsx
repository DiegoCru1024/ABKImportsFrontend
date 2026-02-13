import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUpdateInspectionProduct, useGetInspectionTrackingStatuses, useGetInspectionShipments } from "@/hooks/use-inspections";
import { useGetShipmentTrackingStatuses, useUpdateShipmentStatus } from "@/hooks/use-shipments";
import { uploadMultipleFiles } from "@/api/fileUpload";
import FileUploadComponent from "@/components/comp-552";
import { useQueryClient } from "@tanstack/react-query";
import type { InspectionTrackingStatus } from "@/api/interface/inspectionInterface";
import type { ShipmentTrackingStatus } from "@/api/interface/shipmentInterface";
import {
  X,
  Plus,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Upload,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    product_id: string;
    name: string;
    quantity: number;
    express_price: string;
    status: string;
    files: string[];
  };
  inspectionId: string;
}

export function EditProductModal({ isOpen, onClose, product, inspectionId }: EditProductModalProps) {
  const [status, setStatus] = useState(product.status);
  const [existingFiles, setExistingFiles] = useState<string[]>(product.files);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [resetCounter, setResetCounter] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const updateProductMutation = useUpdateInspectionProduct(inspectionId, product.product_id);
  const { data: statusesData, isLoading: isLoadingStatuses } = useGetInspectionTrackingStatuses();
  const { data: shipmentStatusesData, isLoading: isLoadingShipmentStatuses } = useGetShipmentTrackingStatuses();
  const { data: shipmentsData } = useGetInspectionShipments(inspectionId);
  const updateShipmentStatusMutation = useUpdateShipmentStatus();

  const trackingStatuses = statusesData?.statuses || [];
  const shipmentTrackingStatuses = useMemo(
    () => shipmentStatusesData?.statuses || [],
    [shipmentStatusesData?.statuses]
  );

  // Shipment vinculado (tomar el primero)
  const linkedShipment = useMemo(
    () => shipmentsData?.shipments?.[0] || null,
    [shipmentsData]
  );

  // Detectar si el estado seleccionado es de shipment (14-45)
  const isShipmentStatus = useMemo(
    () => shipmentTrackingStatuses.some((s: ShipmentTrackingStatus) => s.value === status),
    [shipmentTrackingStatuses, status]
  );

  // Resetear archivos cuando se abre el modal con un producto diferente
  useEffect(() => {
    if (isOpen) {
      setStatus(product.status);
      setExistingFiles(product.files);
      setNewFiles([]);
      setResetCounter(prev => prev + 1);
    }
  }, [isOpen, product]);

  const handleSave = async () => {
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

      if (isShipmentStatus && linkedShipment) {
        // Estado de shipment (14-45): actualizar archivos del producto sin cambiar status,
        // y actualizar el estado del shipment
        const shipmentStatus = shipmentTrackingStatuses.find(
          (s: ShipmentTrackingStatus) => s.value === status
        );
        const trackingPoint = shipmentStatus?.tracking_point ?? 14;

        // Actualizar archivos del producto (mantener status actual del producto)
        await updateProductMutation.mutateAsync({
          status: product.status,
          files: allFiles,
        });

        // Actualizar estado del shipment
        await updateShipmentStatusMutation.mutateAsync({
          id: linkedShipment.id,
          data: {
            status: status as any,
            current_location: shipmentStatus?.label as any || "En transito",
            tracking_point: trackingPoint,
          },
        });

        queryClient.invalidateQueries({ queryKey: ["InspectionShipments", inspectionId] });
        toast.success("Estado de shipment actualizado");
      } else {
        // Estado de inspeccion (1-13): actualizar producto normalmente
        await updateProductMutation.mutateAsync({
          status,
          files: allFiles,
        });
      }

      // Invalidar el mapa para que se actualice con el nuevo estado
      queryClient.invalidateQueries({ queryKey: ["InspectionTrackingRoute", inspectionId] });
      queryClient.invalidateQueries({ queryKey: ["Inspections", inspectionId] });

      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      setIsUploading(false);
      toast.error("Error al actualizar el producto");
    }
  };

  const handleRemoveExistingFile = (index: number) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
              <ImageIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">Editar Producto</p>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">{product.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del producto */}
          <div className="grid grid-cols-2 gap-4 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Nombre del Producto</p>
              <p className="font-semibold text-sm text-gray-900">{product.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Cantidad</p>
              <p className="font-semibold text-sm text-gray-900">{product.quantity} unidades</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Precio Express</p>
              <p className="font-bold text-base text-emerald-600">${product.express_price}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Subtotal</p>
              <p className="font-bold text-base text-gray-900">${(product.quantity * Number(product.express_price)).toFixed(2)}</p>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-3">
            <Label htmlFor="status" className="text-sm font-semibold text-gray-900">
              Estado de Tracking
            </Label>
            {(isLoadingStatuses || isLoadingShipmentStatuses) ? (
              <div className="flex items-center justify-center py-4 border rounded-lg bg-slate-50">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-muted-foreground">Cargando estados...</span>
              </div>
            ) : (
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {/* Inspection statuses (1-13) */}
                  {trackingStatuses.length > 0 && (
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                      Inspección (1-13)
                    </div>
                  )}
                  {trackingStatuses.map((trackingStatus: InspectionTrackingStatus) => (
                    <SelectItem key={trackingStatus.id} value={trackingStatus.value}>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">#{trackingStatus.order}</span>
                        <span>{trackingStatus.label}</span>
                        {trackingStatus.isOptional && (
                          <span className="text-xs text-orange-500">(opcional)</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                  {/* Shipment statuses (14-45) */}
                  {shipmentTrackingStatuses.length > 0 && (
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-blue-50 mt-1">
                      Envío (14-45)
                    </div>
                  )}
                  {shipmentTrackingStatuses.map((shipmentStatus: ShipmentTrackingStatus) => (
                    <SelectItem key={shipmentStatus.id} value={shipmentStatus.value}>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 font-mono">#{shipmentStatus.tracking_point}</span>
                        <span>{shipmentStatus.label}</span>
                        {shipmentStatus.isOptional && (
                          <span className="text-xs text-orange-500">(opcional)</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              {isShipmentStatus
                ? "Estado de envío seleccionado — se actualizará el shipment vinculado"
                : "Selecciona el estado actual (1-13 inspección, 14-45 envío)"
              }
            </p>
          </div>

          {/* Archivos existentes */}
          {existingFiles.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">
                Archivos existentes ({existingFiles.length})
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {existingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
                      {getFileIcon(file)}
                    </div>
                    <span className="flex-1 text-sm truncate font-medium text-gray-700">
                      {getFileName(file)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file, '_blank')}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExistingFile(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subida de nuevos archivos */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Agregar nuevos archivos</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
              <FileUploadComponent
                onFilesChange={setNewFiles}
                resetCounter={resetCounter}
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Máx 20 archivos • Máx 16MB c/u • Formatos: imágenes, PDF, documentos
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="px-6"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading || updateProductMutation.isPending || updateShipmentStatusMutation.isPending}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Subiendo archivos...
              </>
            ) : (updateProductMutation.isPending || updateShipmentStatusMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 