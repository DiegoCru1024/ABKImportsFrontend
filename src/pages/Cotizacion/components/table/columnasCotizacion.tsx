import type { Producto } from "@/pages/Cotizacion/utils/interface";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ImageViewerModal from "../ImageViewerModal";

interface ColumnasCotizacionProps {
  handleEliminar: (index: number) => void;
}

// Definición de columnas dentro del componente para usar callbacks
export function columnasCotizacion({
  handleEliminar,
}: ColumnasCotizacionProps): ColumnDef<Producto, any>[] {
  return [
    {
      id: "nombre",
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => <div>{row.original.name}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "cantidad",
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => <div>{row.original.quantity}</div>,
      size: 50,
    },
    {
      id: "tamano",
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
        <div className="truncate max-w-[100px]">{row.original.url}</div>
      ),
      minSize: 70,
      size: 80,
      maxSize: 100,
    },
    {
      accessorKey: "comentario",
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
      id: "archivos",
      accessorKey: "archivos",
      header: "Archivos",
      size: 100,
      cell: ({ row }) => {
        const files: File[] = row.original.files || [];
        
        const FileViewerCell = () => {
          const [isModalOpen, setIsModalOpen] = useState(false);
          
          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="h-8 w-8 p-0"
                disabled={files.length === 0}
              >
                <EyeIcon className="w-4 h-4 text-blue-500" />
              </Button>
              
              <ImageViewerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                files={files}
                productName={row.original.name}
              />
            </>
          );
        };
        
        return (
          <div className="flex items-center gap-2">
            <FileViewerCell />
            <span className="text-xs text-muted-foreground">
              ({files.length} archivo{files.length !== 1 ? 's' : ''})
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
            onClick={() => handleEliminar(row.index)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];
}
