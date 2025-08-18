import type { ProductWithVariants } from "@/pages/cotizacion-page/utils/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import ImageViewerModal from "@/pages/cotizacion-page/components/ImageViewerModal";

interface ColumnasCotizacionProps {
  handleEliminar: (index: number) => void;
  handleEditar: (index: number) => void;
}

// Definición de columnas dentro del componente para usar callbacks
export function columnasCotizacion({
  handleEliminar,
  handleEditar,
}: ColumnasCotizacionProps): ColumnDef<ProductWithVariants & { files?: File[] }, any>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "variants",
      accessorKey: "variants",
      header: "Variantes",
      cell: ({ row }) => {
        const variants = row.original.variants || [];
        const totalQuantity = variants.reduce((sum, variant) => sum + variant.quantity, 0);
        
        return (
          <div className="space-y-1">
            <div className="font-semibold text-orange-600">
              Total: {totalQuantity} unidades
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {variants.map((variant, index) => (
                <div key={variant.id} className="text-xs bg-gray-50 p-2 rounded border">
                  <div className="grid grid-cols-2 gap-1">
                    {variant.size && <span><strong>Tamaño:</strong> {variant.size}</span>}
                    {variant.presentation && <span><strong>Presentación:</strong> {variant.presentation}</span>}
                    {variant.model && <span><strong>Modelo:</strong> {variant.model}</span>}
                    {variant.color && <span><strong>Color:</strong> {variant.color}</span>}
                  </div>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Cantidad: {variant.quantity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      },
      minSize: 250,
      size: 300,
      maxSize: 350,
    },
    {
      id: "url",
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.url ? (
            <a
              href={row.original.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Ver enlace
            </a>
          ) : (
            <span className="text-gray-400 text-sm">Sin enlace</span>
          )}
        </div>
      ),
      minSize: 70,
      size: 80,
      maxSize: 100,
    },
    {
      id: "comment",
      accessorKey: "comment",
      header: "Comentario",
      cell: ({ row }) => (
        <div className="whitespace-normal break-words w-[200px]">
          {row.original.comment || <span className="text-gray-400 text-sm">Sin comentario</span>}
        </div>
      ),
      minSize: 120,
      size: 150,
      maxSize: 200,
    },
    {
      id: "attachments",
      accessorKey: "attachments",
      header: "Archivos",
      size: 100,
      cell: ({ row }) => {
        const files: File[] = row.original.files || [];
        const attachments: string[] = row.original.attachments || [];
        const totalFiles = files.length + attachments.length;

        const FileViewerCell = () => {
          const [isModalOpen, setIsModalOpen] = useState(false);

          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="h-8 w-8 p-0"
                disabled={totalFiles === 0}
              >
                <EyeIcon className="w-4 h-4 text-blue-500" />
              </Button>

              <ImageViewerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                files={files}
                attachments={attachments}
                productName={row.original.name}
              />
            </>
          );
        };

        return (
          <div className="flex items-center gap-2">
            <FileViewerCell />
            <span className="text-xs text-muted-foreground">
              ({totalFiles} archivo{totalFiles !== 1 ? "s" : ""})
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      size: 100,
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
    },
  ];
}
