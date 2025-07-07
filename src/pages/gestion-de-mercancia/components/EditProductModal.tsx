import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useUpdateInspectionProduct } from "@/hooks/use-inspections";
import { uploadMultipleFiles } from "@/api/fileUpload";
import FileUploadComponent from "@/components/comp-552";
import { 
  X, 
  Plus, 
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Upload
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

  const updateProductMutation = useUpdateInspectionProduct(inspectionId, product.product_id);

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

      // Actualizar el producto
      await updateProductMutation.mutateAsync({
        status,
        files: allFiles
      });

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Editar Producto: {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del producto */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-600">Nombre</Label>
              <p className="font-medium">{product.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Cantidad</Label>
              <p className="font-medium">{product.quantity}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Precio Express</Label>
              <p className="font-medium text-green-600">${product.express_price}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Subtotal</Label>
              <p className="font-medium">${product.quantity * Number(product.express_price)}</p>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_inspection">En Inspección</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Archivos existentes */}
          {existingFiles.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Archivos existentes ({existingFiles.length})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {existingFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
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
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUploading || updateProductMutation.isPending}
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Subiendo archivos...
              </>
            ) : updateProductMutation.isPending ? (
              "Guardando..."
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 