import {
  Eye,
  Link as LinkIcon,
  MessageSquare,
  Palette,
  Ruler,
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
      <div className="flex items-center justify-center py-8 text-center text-sm text-gray-500">
        No hay productos para mostrar
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4", className)}>
      {products.map((product) => (
        <div
          key={product.productId}
          className="flex gap-4 p-4 bg-gradient-to-br from-blue-50/40 to-indigo-50/30 rounded-xl border border-blue-200/40 hover:shadow-md hover:border-blue-300/50 transition-all duration-200"
        >
          {product.attachments && product.attachments.length > 0 && (
            <div className="relative w-24 h-24 group flex-shrink-0">
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

              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-lg cursor-pointer transition-opacity duration-200"
                onClick={() => onOpenImageModal(product.attachments || [], product.name, 0)}
              >
                <div className="flex flex-col items-center gap-1 text-white">
                  <Eye className="w-5 h-5" />
                  <span className="text-xs font-semibold text-center">
                    {product.attachments && product.attachments.length > 1
                      ? `Ver ${product.attachments.length}`
                      : "Ver imagen"}
                  </span>
                </div>
              </div>

              {product.attachments && product.attachments.length > 1 && (
                <div className="absolute top-1 right-1 px-2 py-0.5 bg-gray-900 bg-opacity-80 rounded-full text-white text-xs font-medium">
                  +{product.attachments.length - 1}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="font-semibold text-base text-slate-800 capitalize leading-tight mb-2">
                {product.name}
              </h3>
              <Badge
                variant="outline"
                className="text-xs bg-blue-100/60 text-blue-700 border-blue-300/50 font-medium"
              >
                {product.quantity} unidades
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              {product.size && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-slate-200/60">
                  <Ruler className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-600">Tamaño:</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {product.size}
                  </span>
                </div>
              )}

              {product.color && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-slate-200/60">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-600">Color:</span>
                  <Badge variant="secondary" className="text-xs h-5 bg-purple-100/60 text-purple-700 border-purple-300/50 font-medium">
                    {product.color.toUpperCase()}
                  </Badge>
                </div>
              )}

              {product.url && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-slate-200/60">
                  <LinkIcon className="w-4 h-4 text-cyan-400" />
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium hover:underline transition-colors"
                  >
                    Ver enlace
                  </a>
                </div>
              )}
            </div>

            {product.comment && (
              <div className="p-3 bg-amber-50/60 border-l-4 border-amber-300 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 font-medium leading-relaxed">
                    {product.comment}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
