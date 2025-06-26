import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";

export interface Inspection {
  id: string;
  correlative: string;
  quotation_id: string;
  name: string;
  shipping_service_type: string;
  logistics_service: string;
  status: string;
  total_price: string;
}
export function columnasInspeccion(): ColumnDef<Inspection, any>[] {
  return [
    { accessorKey: "correlative", header: "Correlativo" },
    //  { accessorKey: "quotation_id", header: "Cotización" },
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "shipping_service_type", header: "Tipo de Servicio" },
    { accessorKey: "logistics_service", header: "Servicio de Logística" },
    { accessorKey: "status", header: "Estado" },
    { accessorKey: "total_price", header: "Precio Total" },
    {
      accessorKey: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          <EyeIcon className="h-4 w-4" />
          Ver Inspección
        </Button>
      ),
    },
  ];
}
