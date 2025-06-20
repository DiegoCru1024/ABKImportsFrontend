import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import UrlImageViewerModal from "../UrlImageViewerModal";
import type { ProductDetail } from "../../types/interfaces";

export function columnsProductDetails(): ColumnDef<ProductDetail, any>[] {
  return [
    {
      id: "nombre",
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "cantidad",
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="text-center">{row.original.quantity}</div>
      ),
      size: 80,
    },
    {
      id: "tamano",
      accessorKey: "size",
      header: "Tamaño",
      cell: ({ row }) => <div>{row.original.size}</div>,
      size: 100,
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
        <div className="truncate max-w-[100px]" title={row.original.url}>
          {row.original.url}
        </div>
      ),
      minSize: 70,
      size: 80,
      maxSize: 100,
    },
    {
      accessorKey: "comment",
      header: "Comentario",
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-[250px]">
          {row.original.comment}
        </div>
      ),
      minSize: 120,
      size: 150,
      maxSize: 250,
    },
    {
      id: "archivos",
      accessorKey: "attachments",
      header: "Archivos",
      size: 120,
      cell: ({ row }) => {
        const urls: string[] = row.original.attachments || [];
        
        const FileViewerCell = () => {
          const [isModalOpen, setIsModalOpen] = useState(false);
          
          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="h-8 w-8 p-0"
                disabled={urls.length === 0}
              >
                <EyeIcon className="w-4 h-4 text-blue-500" />
              </Button>
              
              <UrlImageViewerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                urls={urls}
                productName={row.original.name}
              />
            </>
          );
        };
        
        return (
          <div className="flex items-center gap-2">
            <FileViewerCell />
            <span className="text-xs text-muted-foreground">
              ({urls.length} archivo{urls.length !== 1 ? 's' : ''})
            </span>
          </div>
        );
      },
    },
  ];
} 