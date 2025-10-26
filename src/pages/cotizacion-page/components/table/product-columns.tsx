import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Edit, Trash, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductWithVariants } from "../../utils/types";
import { useState } from "react";

interface ProductColumnsProps {
  handleEliminar: (index: number) => void;
  handleEditar: (index: number) => void;
}

export function productColumns({
  handleEliminar,
  handleEditar,
}: ProductColumnsProps): ColumnDef<ProductWithVariants, any>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const ExpanderCell = () => {
          const [isExpanded, setIsExpanded] = useState(false);
          const product = row.original;
          const totalImages = product.variants.reduce(
            (sum, v) => sum + (v.attachments?.length || 0) + (v.files?.length || 0),
            0
          );

          return (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>

              {isExpanded && (
                <div className="absolute left-0 right-0 mt-2 p-4 bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 z-10">
                  {/* Comentarios */}
                  {product.comment && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Comentarios:
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
                      {product.variants.map((variant, idx) => (
                        <div
                          key={variant.id}
                          className="grid grid-cols-6 gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Tamaño:
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {variant.size || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Presentación:
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {variant.presentation || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Modelo:
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {variant.model || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Color:
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {variant.color || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Cantidad:
                            </span>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                              {variant.quantity}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Imágenes:
                            </span>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {variant.attachments?.slice(0, 3).map((url, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={url}
                                  alt={`Imagen ${imgIdx + 1}`}
                                  className="w-8 h-8 object-cover rounded border border-gray-300"
                                />
                              ))}
                              {variant.files?.slice(0, 3).map((file, imgIdx) => (
                                <img
                                  key={`file-${imgIdx}`}
                                  src={URL.createObjectURL(file)}
                                  alt={`Archivo ${imgIdx + 1}`}
                                  className="w-8 h-8 object-cover rounded border border-gray-300"
                                />
                              ))}
                              {(variant.attachments?.length || 0) + (variant.files?.length || 0) > 3 && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  +{(variant.attachments?.length || 0) + (variant.files?.length || 0) - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        };

        return <ExpanderCell />;
      },
      size: 50,
    },
    {
      id: "producto",
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.original.name}
        </div>
      ),
      size: 200,
    },
    {
      id: "variantes",
      accessorKey: "variants",
      header: "Variantes",
      cell: ({ row }) => {
        const variantCount = row.original.variants.length;
        return (
          <Badge variant="secondary" className="font-medium">
            {variantCount} variant{variantCount !== 1 ? "es" : "e"}
          </Badge>
        );
      },
      size: 100,
    },
    {
      id: "cantidad",
      header: "Cantidad",
      cell: ({ row }) => {
        const total = row.original.variants.reduce(
          (sum, v) => sum + v.quantity,
          0
        );
        return (
          <div className="font-bold text-orange-600 dark:text-orange-400">
            {total}
          </div>
        );
      },
      size: 100,
    },
    {
      id: "imagenes",
      header: "Imágenes",
      cell: ({ row }) => {
        const totalImages = row.original.variants.reduce(
          (sum, v) => sum + (v.attachments?.length || 0) + (v.files?.length || 0),
          0
        );
        return (
          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalImages}
            </span>
          </div>
        );
      },
      size: 100,
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditar(row.index)}
            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
            title="Editar producto"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEliminar(row.index)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            title="Eliminar producto"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
      size: 100,
    },
  ];
}
