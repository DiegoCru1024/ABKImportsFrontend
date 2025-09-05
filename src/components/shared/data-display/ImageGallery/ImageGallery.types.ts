/**
 * Type definitions for ImageGallery component
 */

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

export interface ImageThumbnailProps {
  src: string;
  alt: string;
  title?: string;
  onClick?: () => void;
  className?: string;
}

export interface ImageModalProps {
  isOpen: boolean;
  images: ImageData[];
  currentIndex: number;
  onClose: () => void;
  allowDownload?: boolean;
}