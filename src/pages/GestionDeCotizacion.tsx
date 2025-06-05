import  { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";


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

  // Mapeo de colores para estado de respuesta
  const estadoRespuestaColorMap: Record<ProductoItem['estadoRespuesta'], string> = {
    'No respondido': 'bg-orange-400 text-white',
    'Respondido': 'bg-green-500 text-white',
    'Observado': 'bg-yellow-400 text-white',
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
      cell: ({ row }) => {
        const estado = row.original.estadoRespuesta;
        const badgeClass = estadoRespuestaColorMap[estado] || 'bg-gray-200 text-gray-800';
        return <Badge className={badgeClass}>{estado}</Badge>;
      },
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
    <div className="min-h-screen overflow-x-hidden bg-gray-100 border-t-2 border-b-2 border-gray-200">
      {/* Barra de navegación superior */}
      <div className="border-b-2 border-gray-100 px-4 py-4 bg-white ">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 ">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Gestión de cotizaciones</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {/* Tabs Principales */}
          <div className="flex bg-white border-b border-gray-200">
            <button
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                mainTab === "solicitudes"
                  ? "text-[#d7751f] bg-[#fdf9ef]"
                  : "text-gray-600 hover:text-gray-800 hover:bg-[#fdf9ef]"
              }`}
              onClick={() => setMainTab("solicitudes")}
            >
              <FileText className="w-4 h-4" />
              Solicitudes
              {mainTab === "solicitudes" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7751f]" />
              )}
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                mainTab === "detalles"
                  ? "text-[#d7751f] bg-[#fdf9ef]"
                  : selectedSolicitud
                  ? "text-gray-600 hover:text-gray-800 hover:bg-[#fdf9ef]"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              disabled={!selectedSolicitud}
              onClick={() => selectedSolicitud && setMainTab("detalles")}
            >
              <FileText className="w-4 h-4" />
              Detalles de la cotización
              {mainTab === "detalles" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7751f]" />
              )}
            </button>
          </div>

          {mainTab === "solicitudes" && (
            <div className="space-y-4 p-6">
              <p className="text-black leading-relaxed">
                Aquí podrá ver todas las solicitudes de cotización recibidas.
              </p>
              <DataTable
                columns={colsSolicitudes}
                data={solicitudes}
                toolbarOptions={{ showSearch: true, showViewOptions: false }}
                paginationOptions={{
                  showSelectedCount: true,
                  showPagination: true,
                  showNavigation: true,
                }}
              />
            </div>
          )}

          {mainTab === "detalles" && selectedSolicitud && (
            <div className="space-y-4 p-6">
              <p className="text-black leading-relaxed">
                Productos de la cotización <strong>{selectedSolicitud.id}</strong>
              </p>
              {/* Sub Tabs */}
              <div className="flex bg-white border-b border-gray-200">
                {["Todos", "No respondido", "Respondido", "Observado"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setSubTab(st as any)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                        subTab === st
                          ? "text-[#d7751f] bg-[#fdf9ef]"
                          : "text-gray-600 hover:text-gray-800 hover:bg-[#fdf9ef]"
                      }`}
                    >
                      {st}
                      {subTab === st && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7751f]" />
                      )}
                    </button>
                  )
                )}
              </div>
              <DataTable
                columns={colsProductos}
                data={filteredProductos}
                toolbarOptions={{ showSearch: false, showViewOptions: false }}
                paginationOptions={{
                  showSelectedCount: false,
                  showPagination: false,
                  showNavigation: false,
                }}
              />
              <div className="flex justify-end mt-6">
                <ConfirmDialog
                  trigger={<Button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm shadow-md flex items-center gap-2">Enviar respuestas</Button>}
                  title="Confirmar envío de respuestas"
                  description="¿Está seguro de enviar las respuestas de la cotización?"
                  confirmText="Enviar"
                  cancelText="Cancelar"
                  onConfirm={handleEnviarRespuestas}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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