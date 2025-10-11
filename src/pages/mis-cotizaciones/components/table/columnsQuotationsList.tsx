import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash, Truck } from "lucide-react";
import type { QuotationListItem } from "../../types/interfaces";
import {
  defaultStatusConfig,
  statusMap,
} from "@/pages/cotizacion-page/components/static";

interface ColumnsQuotationsListProps {
  onViewDetails: (quotationId: string, correlative: string) => void;
  onEditQuotation: (
    quotationId: string,
    correlative: string,
    status: string
  ) => void;
  onDelete: (quotationId: string) => void;
}

export function columnsQuotationsList({
  onViewDetails,
  onEditQuotation,
  onDelete,
}: ColumnsQuotationsListProps): ColumnDef<QuotationListItem, any>[] {
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

    {
      id: "status",
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig =
          statusMap[status as keyof typeof statusMap] || defaultStatusConfig;
        return (
          <Badge className={`flex items-center gap-2 ${statusConfig.color}`}>
            <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
            {statusConfig.label}
          </Badge>
        );
      },
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
      header: "Nro. Productos",
      cell: ({ row }) => (
        <div className="text-center">{row.original.productQuantity}</div>
      ),
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
          {row.original.status !== "draft"  && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onViewDetails(row.original.id, row.original.correlative)
            }
            className="h-8 w-8 p-0 text-orange-500 hover:text-orange-700"
            title="Ver detalles de respuesta"
          >
            <Eye className="w-4 h-4" />
          </Button>
          )}
          {
            row.original.status !== "approved" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onEditQuotation(
                    row.original.id,
                    row.original.correlative,
                    row.original.status
                  )
                }
                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                title="Editar cotizacion"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            title="Eliminar cotizacion"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];
}
