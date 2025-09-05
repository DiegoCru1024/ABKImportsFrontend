/**
 * Reusable image gallery component with modal support
 * Can be used across different modules
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  X, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Image as ImageIcon,
  FileText 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageData {
  id: string;
  url: string;
  alt: string;
  title?: string;
  description?: string;
  type?: string;
  size?: number;
}

export interface ImageGalleryProps {
  images: ImageData[];
  title?: string;
  showThumbnails?: boolean;
  allowDownload?: boolean;
  onImageClick?: (index: number) => void;
  maxThumbnails?: number;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  title,
  showThumbnails = true,
  allowDownload = false,
  onImageClick,
  maxThumbnails = 4,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    onImageClick?.(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  if (images.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p>No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {title && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Badge variant="secondary">{images.length} images</Badge>
          </div>
        )}

        {showThumbnails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {images.slice(0, maxThumbnails).map((image, index) => (
              <ImageThumbnail
                key={image.id}
                src={image.url}
                alt={image.alt}
                title={image.title}
                onClick={() => handleImageClick(index)}
                className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              />
            ))}
            {images.length > maxThumbnails && (
              <div
                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleImageClick(maxThumbnails)}
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-600">
                    +{images.length - maxThumbnails} more
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ImageModal
        isOpen={selectedIndex !== null}
        images={images}
        currentIndex={selectedIndex || 0}
        onClose={closeModal}
        allowDownload={allowDownload}
      />
    </>
  );
};

interface ImageThumbnailProps {
  src: string;
  alt: string;
  title?: string;
  onClick?: () => void;
  className?: string;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  src,
  alt,
  title,
  onClick,
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className={cn("overflow-hidden", className)} onClick={onClick}>
      <CardContent className="p-0">
        <div className="aspect-square relative">
          {imageError ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={src}
              alt={alt}
              title={title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ImageModalProps {
  isOpen: boolean;
  images: ImageData[];
  currentIndex: number;
  onClose: () => void;
  allowDownload?: boolean;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  allowDownload = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentImage = images[currentIndex];
  const totalImages = images.length;

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    setZoom(1);
    setRotation(0);
  };

  const goToNext = () => {
    const newIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    if (!currentImage || !allowDownload) return;
    
    const a = document.createElement('a');
    a.href = currentImage.url;
    a.download = currentImage.title || currentImage.alt || 'image';
    a.target = '_blank';
    a.click();
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  React.useEffect(() => {
    if (isOpen) {
      resetView();
    }
  }, [isOpen, currentIndex]);

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0" showCloseButton={false}>
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span>{currentImage.title || currentImage.alt}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({currentIndex + 1} of {totalImages})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {allowDownload && (
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          </div>

          {/* Navigation arrows */}
          {totalImages > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {totalImages > 1 && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded border-2 cursor-pointer transition-all",
                    index === currentIndex 
                      ? "border-blue-500 opacity-100" 
                      : "border-gray-200 opacity-60 hover:opacity-80"
                  )}
                  onClick={() => {
                    // Update current index logic would go here
                    resetView();
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};