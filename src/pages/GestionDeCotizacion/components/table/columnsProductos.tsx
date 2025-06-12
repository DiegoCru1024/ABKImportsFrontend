import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { type ProductoItem } from "../utils/interface";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

  // Columnas para Productos
  export const colsProductos: ColumnDef<ProductoItem, any>[] = [
    {
      accessorKey: "id",
      header: "Id",
    },
    {
      accessorKey: "nombre",
      header: "Producto",
      cell: ({ row }) => (
        <div>
          <div>{row.original.nombre}</div>
        </div>
      ),
    },
    { accessorKey: "cantidad", header: "Cantidad" },
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => <div>{row.original.url}</div>,
    },
    {
      accessorKey: "archivos",
      header: "Archivos",
      cell: ({ row }) => (
        <div>
          <Button variant="outline" size="icon">
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      ), 
    },
    {
      accessorKey: "estadoRespuesta",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.estadoRespuesta;
        const badgeClass =
          estadoRespuestaColorMap[estado] || "bg-gray-200 text-gray-800";
        return <Badge className={badgeClass}>{estado}</Badge>;
      },
    },
    { accessorKey: "fecha", header: "Fecha" },
    {
      id: "responder",
      header: "Responder",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const p = row.original;
            setCurrentProduct(p);
            setResponses([
              {
                id: Date.now().toString(),
                pUnitario: "",
                incoterms: "FOB",
                precioTotal: "",
                precioExpress: "",
                servicioLogistico: "Terrestre",
                tarifaServicio: "Pendiente",
                impuestos: "No Aplica",
                recomendaciones: "",
                comentariosAdicionales: "",
                archivos: [],
              },
            ]);
            setMainTab("respuesta");
          }}
        >
          Responder
        </Button>
      ),
    },
  ];