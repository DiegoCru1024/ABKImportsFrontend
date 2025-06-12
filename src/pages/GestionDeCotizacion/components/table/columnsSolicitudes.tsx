import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { type Solicitud } from "../utils/interface";

  // Columnas para Solicitudes
 export const colsSolicitudes: ColumnDef<Solicitud, any>[] = [
    { accessorKey: "id", header: "Id Solicitud" },
    { accessorKey: "cliente", header: "Cliente" },
    { accessorKey: "tipo Servicio", header: "Tipo Servicio" },
    { accessorKey: "estado", header: "Estado" },
    { accessorKey: "fecha", header: "Fecha" },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedSolicitud(row.original);
            setProductos(productosMap[row.original.id] || []);
            setMainTab("detalles");
            setSubTab("Todos");
          }}
        >
          Ver detalles
        </Button>
      ),
    },
  ];