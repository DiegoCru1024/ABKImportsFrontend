import type { ColumnDef } from "@tanstack/react-table";
import {
  EllipsisVerticalIcon,
  ExternalLink,
  EyeIcon,
  MessageCircleIcon,
  TruckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import UrlImageViewerModal from "../UrlImageViewerModal";
import type { ProductDetail } from "../../types/interfaces";
import { obtenerUser } from "@/lib/functions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const statusResponseProduct = {
  pending: "Pendiente",
  answered: "Respondido",
  observed: "Observado",
  not_answered: "No respondido",
};

const statusColors: Record<keyof typeof statusResponseProduct, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  answered: "bg-green-100  text-green-800",
  observed: "bg-blue-100   text-blue-800",
  not_answered: "bg-gray-100   text-gray-800",
};

interface ColumnsProductDetailsProps {
  onViewTracking?: (productId: string, productName: string) => void;
}

export function columnsProductDetails({
  onViewTracking,
}: ColumnsProductDetailsProps = {}): ColumnDef<ProductDetail, any>[] {
  const currentUser = obtenerUser();
  const [isAdmin, setIsAdmin] = useState(currentUser?.type === "admin");

  useEffect(() => {
    setIsAdmin(currentUser?.type === "admin");
  }, [currentUser]);

  return [
    {
      id: "nombre",
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.original.name}</div>
      ),
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
      cell: ({ row }) => <div className="capitalize">{row.original.color}</div>,
      size: 100,
    },
    {
      id: "url",
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => (
        <div className="truncate max-w-[100px]" title={row.original.url}>
          <a
            href={row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-500 hover:text-yellow-700"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
          </a>
        </div>
      ),
      minSize: 70,
      size: 80,
      maxSize: 100,
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
              ({urls.length} archivo{urls.length !== 1 ? "s" : ""})
            </span>
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "responses",
      header: "Estado de respuesta",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-xs ${
            statusColors[
              row.original
                .statusResponseProduct as keyof typeof statusResponseProduct
            ]
          }`}
        >
          {statusResponseProduct[
            row.original
              .statusResponseProduct as keyof typeof statusResponseProduct
          ] ?? "No respondido"}
        </Badge>
      ),
      minSize: 100,
      size: 100,
    },
    {
      id: "actions",
      header: "Acciones",
      size: 150,
      cell: ({ row }) => (
        <div className="flex items-right align-right justify-right gap-2">
          {onViewTracking && isAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <EllipsisVerticalIcon className="w-4 h-4 text-blue-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  {!row.original.sendResponse  ?  (
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
                  ):
                  (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onViewTracking(row.original.id, row.original.name)
                      }
                      className=" text-green-600 hover:text-green-800 hover:bg-green-50"
                    >
                      <MessageCircleIcon className="w-4 h-4 mr-1" />
                      Editar Respuesta
                    </Button>
                  )
                  }
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onViewTracking &&
                onViewTracking(row.original.id, row.original.name)
              }
              className="h-8 px-2 text-green-600 hover:text-green-800 hover:bg-green-50"
            >
              <TruckIcon className="w-4 h-4 mr-1" />
              Ver Seguimiento
            </Button>
          )}
        </div>
      ),
    },
  ];
}
