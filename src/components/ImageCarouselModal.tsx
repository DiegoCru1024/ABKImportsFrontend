import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, FileText, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ImageCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  attachments?: string[];
  productName: string;
}

interface FileItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  isImage: boolean;
  icon: string;
}

const ImageCarouselModal: React.FC<ImageCarouselModalProps> = ({
  isOpen,
  onClose,
  files,
  attachments = [],
  productName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);

  // Formatear bytes para mostrar tamaño de archivo
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Determinar si es imagen
  const isImageFile = (type: string, name: string) => {
    return type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(name);
  };

  // Obtener icono del archivo
  const getFileIcon = (type: string, name: string) => {
    if (type.includes('pdf') || name.includes('.pdf')) return '📄';
    if (type.includes('doc') || type.includes('word') || name.includes('.doc')) return '📝';
    if (type.includes('sheet') || type.includes('excel') || name.includes('.xls')) return '📊';
    if (type.includes('zip') || type.includes('rar') || name.includes('.zip')) return '📦';
    if (isImageFile(type, name)) return '🖼️';
    return '📎';
  };

  // Obtener nombre de archivo desde URL
  const getFileNameFromUrl = (url: string) => {
    if (!url || typeof url !== 'string') {
      console.warn("ImageCarouselModal - Invalid URL:", url);
      return 'archivo';
    }
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop();
      
      if (fileName && fileName.includes('.')) {
        return fileName;
      }
      
      // Si no hay extensión, intentar extraer del query string o usar un nombre por defecto
      return fileName || 'imagen';
    } catch (error) {
      console.warn("ImageCarouselModal - Error parsing URL:", url, error);
      return 'archivo';
    }
  };

  // Procesar archivos al montar el componente
  useEffect(() => {
    console.log("ImageCarouselModal - Received data:", {
      files: files.length,
      attachments: attachments,
      productName,
      attachmentsLength: attachments.length
    });

    const processedFiles: FileItem[] = [];

    // Procesar archivos File
    files.forEach((file, index) => {
      processedFiles.push({
        id: `file-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        isImage: isImageFile(file.type, file.name),
        icon: getFileIcon(file.type, file.name),
      });
    });

    // Procesar URLs de attachments
    attachments.forEach((url, index) => {
      console.log(`Processing attachment ${index}:`, url);
      
      if (!url || typeof url !== 'string') {
        console.warn(`Skipping invalid attachment ${index}:`, url);
        return;
      }
      
      const name = getFileNameFromUrl(url);
      const isImage = isImageFile('', name);
      
      console.log(`Attachment ${index} processed:`, { name, isImage, url });
      
      processedFiles.push({
        id: `attachment-${index}`,
        name,
        url,
        type: '',
        isImage,
        icon: getFileIcon('', name),
      });
    });

    console.log("ImageCarouselModal - Processed files:", processedFiles);

    setAllFiles(processedFiles);
    setCurrentIndex(0);
    setZoom(1);
    setRotation(0);
  }, [files, attachments]);

  // Limpiar URLs creadas para archivos File
  useEffect(() => {
    return () => {
      files.forEach((file, index) => {
        const processedFile = allFiles.find(f => f.id === `file-${index}`);
        if (processedFile) {
          URL.revokeObjectURL(processedFile.url);
        }
      });
    };
  }, [allFiles, files]);

  const currentFile = allFiles[currentIndex];
  const totalFiles = allFiles.length;
  const images = allFiles.filter(file => file.isImage);
  const documents = allFiles.filter(file => !file.isImage);

  // Navegación
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalFiles - 1));
    setZoom(1);
    setRotation(0);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < totalFiles - 1 ? prev + 1 : 0));
    setZoom(1);
    setRotation(0);
  };

  // Controles de imagen
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Descargar archivo
  const handleDownload = (file: FileItem) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    if (file.id.startsWith('attachment-')) {
      a.target = '_blank';
    }
    a.click();
  };

  if (totalFiles === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Archivos adjuntos</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No hay archivos adjuntos</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl md:max-w-3xl max-h-[90vh] p-0" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">Archivos adjuntos - {productName}</span>
              <Badge variant="secondary" className="text-sm">
                {currentIndex + 1} de {totalFiles}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Área principal del carrusel */}
          <div className="flex-1 relative bg-gray-50 dark:bg-gray-900">
            {currentFile && (
              <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                {currentFile.isImage ? (
                  <img
                    src={currentFile.url}
                    alt={currentFile.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300">
                    <div className="text-8xl mb-4">{currentFile.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{currentFile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentFile.size ? formatBytes(currentFile.size) : 'Archivo existente'}
                    </p>
                  </div>
                )}

                {/* Controles de navegación */}
                {totalFiles > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                      onClick={goToPrevious}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                      onClick={goToNext}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}

                {/* Controles de imagen */}
                {currentFile.isImage && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/90 hover:bg-white shadow-lg"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/90 hover:bg-white shadow-lg"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/90 hover:bg-white shadow-lg"
                      onClick={handleRotate}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información del archivo actual y controles */}
          <div className="p-6 pt-4 border-t bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{currentFile?.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{currentFile?.isImage ? 'Imagen' : 'Documento'}</span>
                  {currentFile?.size && <span>{formatBytes(currentFile.size)}</span>}
                  {currentFile?.type && <span>{currentFile.type}</span>}
                </div>
              </div>
              <Button
                onClick={() => currentFile && handleDownload(currentFile)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>

            {/* Miniaturas de navegación */}
            {totalFiles > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allFiles.map((file, index) => (
                  <Card
                    key={file.id}
                    className={`flex-shrink-0 w-20 h-20 p-2 cursor-pointer transition-all duration-200 ${
                      index === currentIndex
                        ? 'ring-2 ring-orange-500 ring-offset-2'
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoom(1);
                      setRotation(0);
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden rounded">
                      {file.isImage ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl">{file.icon}</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Estadísticas */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>{images.length} imágenes</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{documents.length} documentos</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCarouselModal;
