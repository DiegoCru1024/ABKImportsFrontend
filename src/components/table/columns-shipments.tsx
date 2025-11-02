import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Package, Plane, Ship } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Shipment } from "@/api/interface/shipmentInterface";
import { formatDateShort } from "@/lib/format-time";

interface ShipmentColumnsProps {
  onViewDetails: (shipmentId: string) => void;
}

export function getShipmentColumns({ onViewDetails }: ShipmentColumnsProps): ColumnDef<Shipment>[] {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_transit":
      case "on_vessel":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending_arrival":
      case "awaiting_pickup":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_inspection":
      case "chinese_customs_inspection":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_product_arrival":
        return "Pendiente de llegada";
      case "in_inspection":
        return "En inspección";
      case "awaiting_pickup":
        return "En espera de recojo";
      case "dispatched":
        return "Despachado";
      case "airport":
        return "Aeropuerto";
      case "in_transit":
        return "En tránsito";
      case "arrived_destination":
        return "Llegado al destino";
      case "customs":
        return "Aduanas";
      case "delivered":
        return "Entregado";
      case "chinese_customs_inspection":
        return "Inspección aduanas chinas";
      case "chinese_customs_release":
        return "Levante aduanas china";
      case "on_vessel":
        return "En el buque";
      case "in_port":
        return "En Puerto";
      case "pending_container_unloading":
        return "Pendiente descarga contenedor";
      case "container_unloaded_customs":
        return "Contenedor descargado en aduanas";
      case "peruvian_customs_release":
        return "Levante aduanas peruanas";
      case "local_warehouse_transit":
        return "En tránsito almacén local";
      default:
        return status;
    }
  };

  const getShippingTypeIcon = (type: string) => {
    return type === "aerial" ? (
      <Plane className="h-4 w-4 text-blue-500" />
    ) : (
      <Ship className="h-4 w-4 text-green-500" />
    );
  };

  const getShippingTypeText = (type: string) => {
    return type === "aerial" ? "Aéreo" : "Marítimo";
  };


  return [
    {
      accessorKey: "correlative",
      header: "Correlativo",
      cell: ({ row }) => {
        const shipment = row.original;
        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{shipment.correlative}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "shipping_type",
      header: "Tipo",
      cell: ({ row }) => {
        const shipment = row.original;
        return (
          <div className="flex items-center gap-2">
            {getShippingTypeIcon(shipment.shipping_type)}
            <span className="text-sm">{getShippingTypeText(shipment.shipping_type)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "origin",
      header: "Origen",
      cell: ({ row }) => {
        return (
          <div className="max-w-[200px] truncate" title={row.getValue("origin")}>
            {row.getValue("origin")}
          </div>
        );
      },
    },
    {
      accessorKey: "destination",
      header: "Destino",
      cell: ({ row }) => {
        return (
          <div className="max-w-[200px] truncate" title={row.getValue("destination")}>
            {row.getValue("destination")}
          </div>
        );
      },
    },
    {
      accessorKey: "weight",
      header: "Peso (kg)",
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {row.getValue("weight")?.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "current_location",
      header: "Ubicación Actual",
      cell: ({ row }) => {
        return (
          <div className="max-w-[150px] truncate" title={row.getValue("current_location")}>
            {row.getValue("current_location")}
          </div>
        );
      },
    },
    {
      accessorKey: "progress",
      header: "Progreso",
      cell: ({ row }) => {
        const progress = row.getValue("progress") as number;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12">{progress}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Fecha Creación",
      cell: ({ row }) => {
        return formatDateShort(row.getValue("created_at"));
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const shipment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(shipment.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
} 