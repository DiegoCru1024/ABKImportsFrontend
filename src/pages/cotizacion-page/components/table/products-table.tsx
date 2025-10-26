import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash, Images as ImagesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductWithVariants } from "../../utils/types/local.types";

interface ProductsTableProps {
  products: ProductWithVariants[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const ProductsTable = ({ products, onEdit, onDelete }: ProductsTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const getTotalQuantity = (product: ProductWithVariants) => {
    return product.variants.reduce((sum, v) => sum + v.quantity, 0);
  };

  const getTotalImages = (product: ProductWithVariants) => {
    return product.variants.reduce(
      (sum, v) => sum + (v.attachments?.length || 0) + (v.files?.length || 0),
      0
    );
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-lg">No hay productos agregados</p>
        <p className="text-sm mt-2">Agrega productos usando el formulario de arriba</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header de la tabla */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 font-semibold text-sm text-gray-700 dark:text-gray-300">
        <div className="col-span-1"></div>
        <div className="col-span-3">Producto</div>
        <div className="col-span-2">Variantes</div>
        <div className="col-span-2">Cantidad</div>
        <div className="col-span-2">Imágenes</div>
        <div className="col-span-2">Acciones</div>
      </div>

      {/* Filas de productos */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {products.map((product, index) => {
          const isExpanded = expandedRows.has(index);
          const totalQuantity = getTotalQuantity(product);
          const totalImages = getTotalImages(product);

          return (
            <div key={index}>
              {/* Fila principal */}
              <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {/* Botón expandir */}
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRow(index)}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Nombre del producto */}
                <div className="col-span-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </div>
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Ver enlace
                    </a>
                  )}
                </div>

                {/* Variantes */}
                <div className="col-span-2">
                  <Badge variant="secondary" className="font-medium">
                    {product.variants.length} variant{product.variants.length !== 1 ? "es" : "e"}
                  </Badge>
                </div>

                {/* Cantidad total */}
                <div className="col-span-2">
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-lg">
                      {totalQuantity}
                    </span>
                  </div>
                </div>

                {/* Imágenes */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 justify-center">
                    <ImagesIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {totalImages}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="col-span-2 flex items-center gap-2 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(index)}
                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="Editar producto"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Eliminar producto"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Fila expandida - Detalles */}
              {isExpanded && (
                <div className="px-4 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="ml-12 space-y-6">
                    {/* Comentarios */}
                    {product.comment && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Comentarios:
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          {product.comment}
                        </p>
                      </div>
                    )}

                    {/* Variantes */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Variantes:
                      </h4>
                      <div className="space-y-3">
                        {product.variants.map((variant, varIdx) => {
                          const variantImages = [
                            ...(variant.attachments || []),
                            ...(variant.files?.map(f => URL.createObjectURL(f)) || [])
                          ];

                          return (
                            <div
                              key={variant.id}
                              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                            >
                              <div className="grid grid-cols-6 gap-4 mb-3">
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Tamaño:
                                  </span>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                    {variant.size || "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Presentación:
                                  </span>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                    {variant.presentation || "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Modelo:
                                  </span>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                    {variant.model || "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Color:
                                  </span>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                    {variant.color || "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Cantidad:
                                  </span>
                                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1">
                                    {variant.quantity}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                                    Imágenes:
                                  </span>
                                  <div className="flex gap-2 flex-wrap">
                                    {variantImages.slice(0, 3).map((url, imgIdx) => (
                                      <img
                                        key={imgIdx}
                                        src={url}
                                        alt={`Imagen ${imgIdx + 1}`}
                                        className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
                                        onClick={() => window.open(url, '_blank')}
                                      />
                                    ))}
                                    {variantImages.length > 3 && (
                                      <div className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          +{variantImages.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
