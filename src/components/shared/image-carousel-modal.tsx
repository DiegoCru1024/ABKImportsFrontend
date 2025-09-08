import {
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  productName: string;
  onPrevious: () => void;
  onNext: () => void;
  onGoToImage: (index: number) => void;
  onDownload: () => void;
}

export function ImageCarouselModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  productName,
  onPrevious,
  onNext,
  onGoToImage,
  onDownload,
}: ImageCarouselModalProps) {
  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl w-full max-h-[95vh] p-0 overflow-hidden bg-white"
        showCloseButton={false}
      >
        <div className="relative bg-white rounded-lg">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-white/95 to-transparent p-4">
            <div className="flex items-center justify-between text-gray-900">
              <div>
                <h3 className="font-semibold text-lg">{productName}</h3>
                <p className="text-sm text-gray-600">
                  Imagen {currentIndex + 1} de {images.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownload}
                  className="text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(currentImage, "_blank")}
                  className="text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative flex items-center justify-center min-h-[70vh] max-h-[80vh] bg-gray-50">
            <img
              src={currentImage}
              alt={`${productName} - Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain cursor-pointer rounded-lg"
              onClick={hasMultipleImages ? onNext : undefined}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-image.png";
              }}
            />

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 hover:bg-white/90 h-12 w-12 rounded-full shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:bg-white/90 h-12 w-12 rounded-full shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-transparent p-4">
              <div className="flex justify-center gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onGoToImage(index)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all duration-200 overflow-hidden",
                      index === currentIndex
                        ? "border-blue-500 shadow-md scale-105"
                        : "border-gray-300 opacity-70 hover:opacity-90 hover:border-gray-400"
                    )}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Click Areas for Navigation */}
          {hasMultipleImages && (
            <div className="absolute inset-0 grid grid-cols-2 pointer-events-auto">
              <div
                className="cursor-pointer"
                onClick={onPrevious}
                aria-label="Imagen anterior"
              />
              <div
                className="cursor-pointer"
                onClick={onNext}
                aria-label="Siguiente imagen"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}