import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import { statusConfig } from "../utils/static";
import { type Cotizacion } from "../utils/interface";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface ColsMisCotizacionesProps {
  setTab: (tab: string) => void;
  setSelectedCotizacion: (id: number) => void;
}

// Columnas Mis Cotizaciones
export function colsMis({
  setTab,
  setSelectedCotizacion,
}: ColsMisCotizacionesProps): ColumnDef<Cotizacion,any>[] {
  return [
    {
      accessorKey: "id",
      header: "ID Solicitud",
      cell: ({ row }) => {
        return (
          <Badge
            variant="outline"
            className="bg-orange-400/15 text-black border-orange-400/30 hover:bg-orange-400/20"
          >
            {row.original.id}
          </Badge>
        );
      },
    },
    { accessorKey: "tipoServicio", header: "Tipo Servicio" },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.estado.toLowerCase();
        return (
          <Badge
            variant="outline"
            className={`${
              statusConfig[estado as keyof typeof statusConfig]?.className ??
              "bg-gray-200"
            } border transition-colors duration-200`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                statusConfig[estado as keyof typeof statusConfig]?.dot ??
                "bg-gray-500"
              } mr-2`}
            ></div>
            {statusConfig[estado as keyof typeof statusConfig]?.label ??
              "Desconocido"}
          </Badge>
        );
      },
    },

    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const fecha = format(
          new Date(row.original.fecha),
          "dd/MM/yyyy HH:mm:ss"
        );
        return <span className="text-muted-foreground text-sm">{fecha}</span>;
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg border-orange-400/30 text-orange-400 hover:bg-orange-400 hover:text-white transition-all duration-200 group"
          onClick={() => {
            setSelectedCotizacion(Number(row.original.id));
            setTab("detalles");
          }}
        >
          Ver detalles
          <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
        </Button>
      ),
    },
  ];
}
