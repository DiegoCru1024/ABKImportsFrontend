import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVerticalIcon, EyeIcon, MessageCircleIcon, TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import UrlImageViewerModal from "../UrlImageViewerModal";
import type { ProductDetail } from "../../types/interfaces";
import { obtenerUser } from "@/lib/functions";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";


interface ColumnsProductDetailsProps {
  onViewTracking?: (productId: string, productName: string) => void;
}

export function columnsProductDetails({
  onViewTracking,
}: ColumnsProductDetailsProps = {}): ColumnDef<ProductDetail, any>[] {
  const currentUser = obtenerUser();
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
    {
      id: "status",
      accessorKey: "responses",
      header: "Estado de respuesta",
      cell: ({ row }) => <div>{row.original.responses?.length > 0 ? "Respondido" : "No respondido"}</div>,
      minSize: 100,
      size: 100,
    },
    {
      id: "actions",
      header: "Acciones",
      size: 150,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            {onViewTracking && currentUser?.type === "admin" ? 
          
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <EllipsisVerticalIcon className="w-4 h-4 text-blue-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              {onViewTracking && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onViewTracking(row.original.id, row.original.name)
                  }
                  className=" text-green-600 hover:text-green-800 hover:bg-green-50"
                >
                  <MessageCircleIcon className="w-4 h-4 mr-1" />
                  Responder
                </Button>
              )}
            </DropdownMenuItem>
           
          </DropdownMenuContent>  
        </DropdownMenu>:
          ( <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewTracking && onViewTracking(row.original.id, row.original.name)}
            className="h-8 px-2 text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            <TruckIcon className="w-4 h-4 mr-1" />
            Ver Seguimiento
            </Button>)}
          
          
        </div>
      ),
    },
  ];
} 