import type { Producto } from "@/pages/cotizacion-page/utils/interface";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}: ColumnasCotizacionProps): ColumnDef<Producto, any>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <div>{row.original.name}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => <div>{row.original.quantity}</div>,
      size: 50,
    },
    {
      id: "size",
      accessorKey: "size",
      header: "Tamaño",
      cell: ({ row }) => <div>{row.original.size}</div>,
      size: 50,
    },
    {
      id: "color",
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => <div>{row.original.color}</div>,
      size: 100,
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
        <div className="whitespace-normal break-words w-[250px]">
          {row.original.comment}
        </div>
      ),
      minSize: 120,
      size: 150,
      maxSize: 250,
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
