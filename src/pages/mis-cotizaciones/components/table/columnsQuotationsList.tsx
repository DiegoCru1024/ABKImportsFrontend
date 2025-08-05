import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, EllipsisVerticalIcon, Eye, Trash, Truck } from "lucide-react";
import type { QuotationListItem } from "../../types/interfaces";
import { obtenerUser } from "@/lib/functions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
  
interface ColumnsQuotationsListProps {
  onViewDetails: (quotationId: string,correlative:string) => void;
  onEditQuotation: (quotationId: string,correlative:string) => void;
  onGenerateInspectionId?: (quotationId: string,correlative:string ) => void;
  onDelete?: (quotationId: string) => void;
}

export function columnsQuotationsList({
  onViewDetails,
  onEditQuotation,
  onGenerateInspectionId,
  onDelete,
}: ColumnsQuotationsListProps): ColumnDef<QuotationListItem, any>[] {
  const currentUser = obtenerUser();
  const isAdmin = currentUser?.type === "admin";

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pendiente
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="default"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Completado
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "in_progress":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            En Progreso
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: "Fecha inválida", time: "Hora inválida" };
    }
  };


  return [
    /*{
      id: "id",
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[80px]" title={row.original.id}>
          {row.original.id.substring(0, 8)}...
        </div>
      ),
      size: 100,
    },*/
    {
      id: "correlative",
      accessorKey: "correlative",
      header: "Id Cotizacion",
      cell: ({ row }) => (
        <div className="font-semibold text-orange-600">
          {row.original.correlative}
        </div>
      ),
      size: 120,
    },
    /*...(isAdmin ? [userColumn] : []),*/
    {
      id: "status",
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => getStatusBadge(row.original.status),
      size: 120,
    },

    {
      id: "service_type",
      accessorKey: "service_type",
      header: "Tipo de Servicio",
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.original.service_type}
        >
          {row.original.service_type}
        </div>
      ),
      size: 200,
    },
    {
      id: "productQuantity",
      accessorKey: "productQuantity",
      header: "Cantidad de Productos",
      cell: ({ row }) => <div>{row.original.productQuantity}</div>,
      size: 80,
    },
    {
      id: "fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const { date } = formatDateTime(row.original.createdAt);
        return <div className="text-sm">{date}</div>;
      },
      size: 100,
    },
    {
      id: "hora",
      header: "Hora",
      cell: ({ row }) => {
        const { time } = formatDateTime(row.original.createdAt);
        return <div className="text-sm font-mono">{time}</div>;
      },
      size: 100,
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
            onClick={() => onViewDetails(row.original.id, row.original.correlative)}
            className="h-8 w-8 p-0 text-orange-500 hover:text-orange-700"
            title="Ver cotizacion"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditQuotation(row.original.id, row.original.correlative)}
            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
            title="Editar cotizacion"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(row.original.id)}
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
