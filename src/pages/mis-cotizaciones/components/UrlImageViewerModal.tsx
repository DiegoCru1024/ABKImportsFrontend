import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

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
  // Índice de la imagen seleccionada en el carrusel
  const [selectedIndex, setSelectedIndex] = useState(0);

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
      if (!response.ok) {
        // Si la respuesta no es exitosa, abrir directamente en nueva pestaña
        window.open(url, '_blank');
        return;
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Liberar objeto y remover enlace después de un breve retraso
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error('Error downloading file:', error);
      window.open(url, '_blank');
    }
  };

  // URL y nombre del archivo actualmente mostrados
  const selectedUrl = urls[selectedIndex] || "";
  const selectedFileName = getFileName(selectedUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Archivos adjuntos - {productName}</span>
            {/*<Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>*/}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {urls.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay archivos adjuntos
            </p>
          ) : (
            <>
              {/* Imagen principal */}
              <div className="relative w-full h-96 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                {isImageUrl(selectedUrl) ? (
                  <img
                    src={selectedUrl}
                    alt={selectedFileName}
                    className="object-contain max-h-full max-w-full"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="text-6xl">{getFileIcon(selectedUrl)}</div>
                )}
                {/* Botones sobre la imagen */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(selectedUrl, selectedFileName)}>
                    <Download className="h-4 w-4 mr-1" /> Descargar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(selectedUrl, '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Carrusel de miniaturas */}
              <div className="flex items-center justify-center mt-4 space-x-2">
                <Button variant="ghost" size="icon" disabled={selectedIndex === 0} onClick={() => setSelectedIndex(i => Math.max(0, i - 1))}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex overflow-x-auto space-x-2">
                  {urls.map((url, i) => {
                    const thumbName = getFileName(url);
                    return (
                      <div
                        key={i}
                        className={`w-20 h-20 flex-shrink-0 border rounded-md overflow-hidden cursor-pointer ${i === selectedIndex ? 'border-blue-500' : 'border-gray-200'}`}
                        onClick={() => setSelectedIndex(i)}
                      >
                        {isImageUrl(url) ? (
                          <img src={url} alt={thumbName} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-2xl">
                            {getFileIcon(url)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Button variant="ghost" size="icon" disabled={selectedIndex === urls.length - 1} onClick={() => setSelectedIndex(i => Math.min(urls.length - 1, i + 1))}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UrlImageViewerModal; 