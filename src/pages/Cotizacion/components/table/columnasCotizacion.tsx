import type { Producto } from "@/pages/Cotizacion/utils/interface";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, FileText, Trash } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ColumnasCotizacionProps {
  handleEliminar: (index: number) => void;
}

// Definición de columnas dentro del componente para usar callbacks
export function columnasCotizacion({
  handleEliminar,
}: ColumnasCotizacionProps): ColumnDef<Producto, any>[] {
  return [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.original.id}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "nombre",
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => <div>{row.original.nombre}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "cantidad",
      accessorKey: "cantidad",
      header: "Cantidad",
      size: 50,
    },
    {
      id: "tamano",
      accessorKey: "tamano",
      header: "Tamaño",
      size: 50,
    },
    {
      id: "color",
      accessorKey: "color",
      header: "Color",
      size: 100,
    },

    {
      id: "url",
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => (
        <div className="truncate max-w-[100px]">{row.original.url}</div>
      ),
      minSize: 70,
      size: 80,
      maxSize: 100,
    },
    {
      id: "tipoServicio",
      accessorKey: "tipoServicio",
      header: "Tipo Servicio",
      cell: ({ row }) => <div>{row.original.tipoServicio}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      accessorKey: "comentario",
      header: "Comentario",
      cell: ({ row }) => (
        <div className="whitespace-normal break-words w-[250px]">
          {row.original.comentario}
        </div>
      ),
      minSize: 120,
      size: 150,
      maxSize: 250,
    },
    /*{
      id: "peso",
      accessorKey: "peso",
      header: "Peso",
      size: 50,
    },
    {
      id: "volumen",
      accessorKey: "volumen",
      header: "Volumen",
      size: 50,
    },
    {
      id: "nro_cajas",
      accessorKey: "nro_cajas",
      header: "Nro. cajas",
      size: 50,
    },*/
    {
      id: "archivos",
      accessorKey: "archivos",
      header: "Archivos",
      size: 80,
      cell: ({ row }) => {
        const archivos: File[] = row.original.archivos;
        return (
          <Dialog>
            <DialogTrigger asChild>
              <button>
                <EyeIcon className="w-4 h-4 text-blue-500" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-white">
              <DialogHeader>
                <DialogTitle>Archivos del producto</DialogTitle>
              </DialogHeader>
              <div className="flex space-x-4 overflow-x-auto snap-x snap-mandatory py-4">
                {archivos.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  const isImage = file.type.startsWith("image/");
                  return (
                    <div key={idx} className="flex-shrink-0 w-full snap-center">
                      {isImage ? (
                        <img src={url} alt={`archivo-${idx}`} className="h-64 object-contain" />
                      ) : (
                        <video src={url} controls className="h-64 object-contain" />
                      )}
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Cerrar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      },
    },

    {
      id: "actions",
      header: "Acciones",
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Trash
            className="w-4 h-4 text-red-500"
            onClick={() => handleEliminar(Number(row.original.id))}
          />
        </div>
      ),
    },
  ];
}
