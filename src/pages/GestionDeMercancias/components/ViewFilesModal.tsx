import UrlImageViewerModal from "@/pages/MisCotizaciones/components/UrlImageViewerModal";

interface ViewFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    files: string[];
  };
}

export function ViewFilesModal({ isOpen, onClose, product }: ViewFilesModalProps) {
  return (
    <UrlImageViewerModal
      isOpen={isOpen}
      onClose={onClose}
      urls={product.files}
      productName={product.name}
    />
  );
} 