import { useState } from "react";

export function useImageModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [productName, setProductName] = useState<string>("");

  const openModal = (
    images: string[],
    name: string,
    imageIndex: number = 0
  ) => {
    setSelectedImages(images);
    setProductName(name);
    setCurrentImageIndex(imageIndex);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedImages([]);
    setProductName("");
    setCurrentImageIndex(0);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === selectedImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const downloadImage = () => {
    if (selectedImages.length === 0) return;
    
    const link = document.createElement("a");
    link.href = selectedImages[currentImageIndex];
    link.download = `${productName}_imagen_${currentImageIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    isOpen,
    selectedImages,
    currentImageIndex,
    productName,
    openModal,
    closeModal,
    previousImage,
    nextImage,
    goToImage,
    downloadImage,
  };
}