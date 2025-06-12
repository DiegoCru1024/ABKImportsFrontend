import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import { type Producto } from "../utils/interface";


  // Columnas Detalles de Cotización
  export const colsDetalles: ColumnDef<Producto, any>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => <div>{row.original.nombre}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    { accessorKey: "cantidad", header: "Cantidad", size: 50 },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => (
        <div className="max-w-[150px]">{row.original.url}</div>
      ),
      minSize: 70,
      size: 80,
      maxSize: 100,
    },

    {
      accessorKey: "archivos",
      header: "Archivos",
      cell: ({ row }) => (
        <div>
          <Button variant="outline" size="sm">
            Ver
          </Button>
        </div>
      ),
      minSize: 120,
      size: 150,
      maxSize: 250,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.estado;
        const detalleColorMap: Record<string, string> = {
          "En revisión": "bg-yellow-400 text-white",
          Respondido: "bg-green-500 text-white",
        };
        const badgeClass =
          detalleColorMap[estado] || "bg-gray-200 text-gray-800";
        return <Badge className={badgeClass}>{estado}</Badge>;
      },
    },
    {
      id: "verSeguimiento",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          /*onClick={() => {
            setSelectedProducto(row.original);
            setTab("seguimiento");
          }}*/  
        >
          Ver seguimiento
        </Button>
      ),
    },
  ];
