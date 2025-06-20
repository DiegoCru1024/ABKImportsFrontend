import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";

interface UrlImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  urls: string[];
  productName: string;
}

const UrlImageViewerModal: React.FC<UrlImageViewerModalProps> = ({
  isOpen,
  onClose,
  urls,
  productName,
}) => {
  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'archivo';
    } catch {
      return 'archivo';
    }
  };

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url) || url.includes('/images/');
  };

  const getFileIcon = (url: string) => {
    if (url.includes('.pdf')) return '📄';
    if (url.includes('.doc') || url.includes('.docx')) return '📝';
    if (url.includes('.xls') || url.includes('.xlsx')) return '📊';
    if (url.includes('.zip') || url.includes('.rar')) return '📦';
    return '📎';
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: abrir en nueva ventana
      window.open(url, '_blank');
    }
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
          {urls.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay archivos adjuntos
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {urls.map((url, index) => {
                const fileName = getFileName(url);
                const isImage = isImageUrl(url);
                
                return (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                      {isImage ? (
                        <img
                          src={url}
                          alt={fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback si la imagen no carga
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      
                      <div className={`w-full h-full flex items-center justify-center text-4xl ${isImage ? 'hidden' : ''}`}>
                        {getFileIcon(url)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate" title={fileName}>
                        {fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isImage ? 'Imagen' : 'Archivo'}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownload(url, fileName)}
                      >
                        <Download className="h-3 w-3 mr-2" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UrlImageViewerModal; 