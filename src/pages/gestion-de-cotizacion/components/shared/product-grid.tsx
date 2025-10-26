import {
  Eye,
  Link as LinkIcon,
  MessageSquare,
  Package,
  Palette,
  Ruler,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

interface Variant {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
  attachments: string[];
}

interface Product {
  productId: string;
  name: string;
  quantityTotal: number;
  url?: string;
  comment?: string;
  variants: Variant[];
  weight?: string;
  volume?: string;
  number_of_boxes?: number;
  adminComment?: string;
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
          className="flex flex-col gap-4 p-4 bg-gradient-to-br from-blue-50/40 to-indigo-50/30 rounded-xl border border-blue-200/40 hover:shadow-md hover:border-blue-300/50 transition-all duration-200"
        >
          {/* Información del producto */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="font-semibold text-base text-slate-800 capitalize leading-tight mb-2">
                {product.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-100/60 text-blue-700 border-blue-300/50 font-medium"
                >
                  {product.quantityTotal} unidades totales
                </Badge>
                {product.variants && product.variants.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-purple-100/60 text-purple-700 border-purple-300/50 font-medium"
                  >
                    {product.variants.length} variante{product.variants.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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

          {/* Variantes del producto */}
          {product.variants && product.variants.length > 0 && (
            <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-blue-200/60">
              {product.variants.map((variant) => (
                <div
                  key={variant.variantId}
                  className="flex gap-3 p-3 bg-white/60 rounded-lg border border-slate-200/40"
                >
                  {/* Imágenes de la variante */}
                  {variant.attachments && variant.attachments.length > 0 && (
                    <div className="relative w-20 h-20 group flex-shrink-0">
                      <img
                        src={variant.attachments[0]}
                        alt={`${product.name} - ${variant.color}`}
                        className="w-full h-full object-cover rounded-lg cursor-pointer transition-all duration-200 hover:opacity-90"
                        onClick={() => onOpenImageModal(variant.attachments || [], `${product.name} - ${variant.color}`, 0)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />

                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-lg cursor-pointer transition-opacity duration-200"
                        onClick={() => onOpenImageModal(variant.attachments || [], `${product.name} - ${variant.color}`, 0)}
                      >
                        <div className="flex flex-col items-center gap-1 text-white">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-semibold text-center">
                            {variant.attachments && variant.attachments.length > 1
                              ? `${variant.attachments.length}`
                              : "Ver"}
                          </span>
                        </div>
                      </div>

                      {variant.attachments && variant.attachments.length > 1 && (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-gray-900 bg-opacity-80 rounded-full text-white text-xs font-medium">
                          +{variant.attachments.length - 1}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Información de la variante */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100/60 text-green-700 border-green-300/50 font-medium"
                      >
                        {variant.quantity} unidades
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {variant.size && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/80 rounded border border-slate-200/60">
                          <Ruler className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-600">Tamaño:</span>
                          <span className="text-xs font-semibold text-slate-800">
                            {variant.size}
                          </span>
                        </div>
                      )}

                      {variant.color && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/80 rounded border border-slate-200/60">
                          <Palette className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-xs text-slate-600">Color:</span>
                          <Badge variant="secondary" className="text-xs h-5 bg-purple-100/60 text-purple-700 border-purple-300/50 font-medium">
                            {variant.color.toUpperCase()}
                          </Badge>
                        </div>
                      )}

                      {variant.model && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/80 rounded border border-slate-200/60">
                          <Package className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs text-slate-600">Modelo:</span>
                          <span className="text-xs font-semibold text-slate-800">
                            {variant.model}
                          </span>
                        </div>
                      )}

                      {variant.presentation && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/80 rounded border border-slate-200/60">
                          <span className="text-xs text-slate-600">Presentación:</span>
                          <span className="text-xs font-semibold text-slate-800">
                            {variant.presentation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
