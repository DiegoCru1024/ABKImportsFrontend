import {
  Eye,
  Link as LinkIcon,
  MessageSquare,
  Ruler,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  productId: string;
  name: string;
  quantity: number;
  size?: string;
  color?: string;
  url?: string;
  comment?: string;
  attachments?: string[];
}

interface ProductGridProps {
  products: Product[];
  onOpenImageModal: (images: string[], productName: string, index?: number) => void;
  className?: string;
}

export function ProductGrid({ 
  products, 
  onOpenImageModal, 
  className 
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay productos para mostrar
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {products.map((product) => (
        <div
          key={product.productId}
          className="bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200"
        >
          <div className="flex gap-3">
            {/* Product Image */}
            {product.attachments && product.attachments.length > 0 && (
              <div className="relative w-20 h-20 group flex-shrink-0">
                <img
                  src={product.attachments[0]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg cursor-pointer transition-all duration-200 hover:opacity-90"
                  onClick={() => onOpenImageModal(product.attachments || [], product.name, 0)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                
                {/* Overlay */}
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center cursor-pointer"
                  onClick={() => onOpenImageModal(product.attachments || [], product.name, 0)}
                >
                  <div className="flex flex-col items-center gap-1 text-white">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-semibold text-center">
                      {product.attachments && product.attachments.length > 1 
                        ? `Ver ${product.attachments.length}` 
                        : "Ver imagen"}
                    </span>
                  </div>
                </div>
                
                {/* Image count badge */}
                {product.attachments && product.attachments.length > 1 && (
                  <div className="absolute top-1 right-1 bg-gray-900 bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    +{product.attachments.length - 1}
                  </div>
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title and Quantity */}
              <div>
                <h3 className="font-semibold text-sm text-gray-900 capitalize leading-tight line-clamp-2">
                  {product.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className="mt-1 text-xs bg-blue-50 text-blue-700 border-blue-200"
                >
                  {product.quantity} unidades
                </Badge>
              </div>

              {/* Product Specifications */}
              <div className="space-y-1">
                {product.size && (
                  <div className="flex items-center gap-1.5">
                    <Ruler className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">Tamaño:</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {product.size}
                    </span>
                  </div>
                )}
                
                {product.color && (
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">Color:</span>
                    <Badge variant="secondary" className="text-xs h-5">
                      {product.color.toUpperCase()}
                    </Badge>
                  </div>
                )}
                
                {product.url && (
                  <div className="flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3 text-gray-500" />
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Ver enlace
                    </a>
                  </div>
                )}
              </div>

              {/* Comments */}
              {product.comment && (
                <div className="bg-blue-50 border-l-3 border-blue-400 p-2 rounded-r-md">
                  <div className="flex items-start gap-1.5">
                    <MessageSquare className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800 font-medium leading-tight line-clamp-2">
                      {product.comment}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}