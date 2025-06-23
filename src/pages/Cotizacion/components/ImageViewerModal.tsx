import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  productName: string;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  files,
  productName,
}) => {
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('doc') || file.type.includes('word')) return '📝';
    if (file.type.includes('sheet') || file.type.includes('excel')) return '📊';
    if (file.type.includes('zip') || file.type.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Archivos adjuntos - {productName}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {files.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay archivos adjuntos
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                    {isImageFile(file) ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.type || 'Tipo desconocido'}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const url = URL.createObjectURL(file);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = file.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerModal; 