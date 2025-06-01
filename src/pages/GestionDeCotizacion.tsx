import React, { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface Solicitud {
  id: string;
  cliente: string;
  fecha: string;
}

interface ProductoItem {
  id: string;
  nombre: string;
  comentarioCliente: string;
  cliente: string;
  cantidad: number;
  especificaciones: string;
  estadoRespuesta: "No respondido" | "Respondido" | "Observado";
  precioUnitario: number;
  recomendaciones: string;
  comentariosAdicionales: string;
  fecha: string;
}

export default function GestionDeCotizaciones() {
  const [mainTab, setMainTab] = useState<"solicitudes" | "detalles">("solicitudes");
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [subTab, setSubTab] = useState<"Todos" | "No respondido" | "Respondido" | "Observado">("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductoItem | null>(null);
  const [responseForm, setResponseForm] = useState({
    precioUnitario: 0,
    estadoRespuesta: "No respondido" as ProductoItem["estadoRespuesta"],
    recomendaciones: "",
    comentariosAdicionales: ""
  });

  // Datos de ejemplo
  const solicitudes: Solicitud[] = [
    { id: "COT-001", cliente: "Cliente ABC", fecha: "2024-01-15" },
    { id: "COT-002", cliente: "Empresa XYZ", fecha: "2024-02-10" },
  ];
  const productosMap: Record<string, ProductoItem[]> = {
    "COT-001": [
      { id: "P1", nombre: "Producto 1", comentarioCliente: "ASDASDASD", cliente: "Cliente ABC", cantidad: 24, especificaciones: "Tamaño: 3, Color: ASD", estadoRespuesta: "No respondido", precioUnitario: 0, recomendaciones: "", comentariosAdicionales: "", fecha: "2024-01-15" },
      { id: "P2", nombre: "Producto 2", comentarioCliente: "Otro comentario", cliente: "Cliente ABC", cantidad: 10, especificaciones: "Tamaño: 5, Color: BBB", estadoRespuesta: "Respondido", precioUnitario: 12.5, recomendaciones: "Usar mejor material", comentariosAdicionales: "", fecha: "2024-01-16" },
    ],
    "COT-002": [
      { id: "P3", nombre: "Producto A", comentarioCliente: "Comentario A", cliente: "Empresa XYZ", cantidad: 50, especificaciones: "Tamaño: M, Color: Azul", estadoRespuesta: "Observado", precioUnitario: 15, recomendaciones: "", comentariosAdicionales: "", fecha: "2024-02-10" },
    ],
  };

  // Columnas para Solicitudes
  const colsSolicitudes: ColumnDef<Solicitud, any>[] = [
    { accessorKey: "id", header: "Id Solicitud" },
    { accessorKey: "cliente", header: "Cliente" },
    { accessorKey: "fecha", header: "Fecha" },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => {
          setSelectedSolicitud(row.original);
          setProductos(productosMap[row.original.id] || []);
          setMainTab("detalles");
          setSubTab("Todos");
        }}>
          Ver detalles
        </Button>
      ),
    },
  ];

  // Columnas para Productos
  const colsProductos: ColumnDef<ProductoItem, any>[] = [
    {
      accessorKey: "nombre",
      header: "Producto",
      cell: ({ row }) => (
        <div>
          <div>{row.original.nombre}</div>
          <div className="text-sm text-gray-500">{row.original.comentarioCliente}</div>
        </div>
      ),
    },
    { accessorKey: "cliente", header: "Cliente" },
    { accessorKey: "cantidad", header: "Cantidad" },
    { accessorKey: "especificaciones", header: "Especificaciones" },
    {
      accessorKey: "estadoRespuesta",
      header: "Estado",
      cell: ({ row }) => <span>{row.original.estadoRespuesta}</span>,
    },
    { accessorKey: "fecha", header: "Fecha" },
    {
      id: "responder",
      header: "Responder",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => {
          setCurrentProduct(row.original);
          setResponseForm({
            precioUnitario: row.original.precioUnitario,
            estadoRespuesta: row.original.estadoRespuesta,
            recomendaciones: row.original.recomendaciones,
            comentariosAdicionales: row.original.comentariosAdicionales,
          });
          setDialogOpen(true);
        }}>
          Responder
        </Button>
      ),
    },
  ];

  const filteredProductos = productos.filter(p => subTab === "Todos" || p.estadoRespuesta === subTab);

  const handleSaveResponse = () => {
    if (currentProduct) {
      setProductos(prev =>
        prev.map(p => p.id === currentProduct.id ? { ...p, ...responseForm } : p)
      );
    }
    setDialogOpen(false);
  };

  const handleEnviarRespuestas = () => {
    alert("Respuestas enviadas: " + JSON.stringify(productos));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Tabs Principales */}
      <div className="flex space-x-4 border-b mb-6">
        <button onClick={() => setMainTab("solicitudes")} className={`pb-2 ${mainTab === "solicitudes" ? "border-blue-500 text-blue-600" : "text-gray-600"}`}>Solicitudes</button>
        <button onClick={() => selectedSolicitud && setMainTab("detalles")} disabled={!selectedSolicitud} className={`pb-2 ${mainTab === "detalles" ? "border-blue-500 text-blue-600" : "text-gray-400 cursor-not-allowed"}`}>Detalles de la cotización</button>
      </div>

      {mainTab === "solicitudes" && (
        <>
          <p className="mb-4 text-gray-700">Aquí podrá ver todas las solicitudes de cotización recibidas.</p>
          <DataTable
            columns={colsSolicitudes}
            data={solicitudes}
            toolbarOptions={{ showSearch: true, showViewOptions: false }}
            paginationOptions={{ showSelectedCount: true, showPagination: true, showNavigation: true }}
          />
        </>
      )}

      {mainTab === "detalles" && selectedSolicitud && (
        <>
          <p className="mb-4 text-gray-700">Productos de la cotización <strong>{selectedSolicitud.id}</strong></p>
          {/* Sub Tabs */}
          <div className="flex space-x-4 border-b mb-4">
            { ["Todos","No respondido","Respondido","Observado"].map(st => (
              <button key={st} onClick={() => setSubTab(st as any)} className={`pb-2 ${subTab === st ? "border-green-500 text-green-600" : "text-gray-600"}`}>{st}</button>
            )) }
          </div>
          <DataTable
            columns={colsProductos}
            data={filteredProductos}
            toolbarOptions={{ showSearch: false, showViewOptions: false }}
            paginationOptions={{ showSelectedCount: false, showPagination: false, showNavigation: false }}
          />
          <div className="flex justify-end mt-6">
            <Button onClick={handleEnviarRespuestas}>Enviar Respuestas de la cotización</Button>
          </div>
        </>
      )}

      {/* Dialog de Respuesta */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <div />
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Responder Cotización</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="precioUnitario" className="text-right text-sm text-gray-500">
                Precio Unitario ($)
              </label>
              <Input
                value={responseForm.precioUnitario}
                onChange={(e) => setResponseForm({ ...responseForm, precioUnitario: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm text-gray-500">
                Estado Respuesta
              </label>
              <Select
                value={responseForm.estadoRespuesta}
                onValueChange={(value) => setResponseForm({ ...responseForm, estadoRespuesta: value as ProductoItem["estadoRespuesta"] })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No respondido">No respondido</SelectItem>
                  <SelectItem value="Respondido">Respondido</SelectItem>
                  <SelectItem value="Observado">Observado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm text-gray-500">Recomendaciones</label>
              <Textarea
                value={responseForm.recomendaciones}
                onChange={(e) => setResponseForm({ ...responseForm, recomendaciones: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm text-gray-500">Comentarios Adicionales</label>
              <Textarea
                value={responseForm.comentariosAdicionales}
                onChange={(e) => setResponseForm({ ...responseForm, comentariosAdicionales: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit" onClick={handleSaveResponse}>Guardar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 