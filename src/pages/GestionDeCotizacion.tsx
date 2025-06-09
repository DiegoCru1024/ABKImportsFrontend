import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,

} from "@/components/ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import {
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Truck,
  Package,
  Hash,
  Ruler,
  Palette,
  Link,
  File,

  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import FileUploadComponent from "@/components/comp-552";

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
  archivos: File[];
  fecha: string;
  url: string;
}

export default function GestionDeCotizaciones() {
  const [mainTab, setMainTab] = useState<
    "solicitudes" | "detalles" | "respuesta"
  >("solicitudes");
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(
    null
  );
  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [subTab, setSubTab] = useState<
    "Todos" | "No respondido" | "Respondido" | "Observado"
  >("Todos");
  const [currentProduct, setCurrentProduct] = useState<ProductoItem | null>(
    null
  );

  // Estado para respuestas de cotización
  interface QuotationResponse {
    id: string;
    pUnitario: string;
    incoterms: string;
    precioTotal: string;
    precioExpress: string;
    servicioLogistico: string;
    tarifaServicio: string;
    impuestos: string;
    recomendaciones: string;
    comentariosAdicionales: string;
    archivos: File[];
  }
  const [responses, setResponses] = useState<QuotationResponse[]>([
    {
      id: Date.now().toString(),
      pUnitario: "",
      incoterms: "FOB",
      precioTotal: "",
      precioExpress: "",
      servicioLogistico: "Terrestre",
      tarifaServicio: "Pendiente",
      impuestos: "IGV 18%",
      recomendaciones: "",
      comentariosAdicionales: "",
      archivos: [],
    },
  ]);
  const incotermsOptions = [
    { value: "EXW", label: "EXW - Ex Works" },
    { value: "FCA", label: "FCA - Free Carrier" },
    { value: "CIF", label: "CIF - Cost, Insurance & Freight" },
    { value: "FOB", label: "FOB - Free On Board" },
    { value: "FAS", label: "FAS - Free Alongside Ship" },
    { value: "DDP", label: "DDP - Delivered Duty Paid" },
    { value: "DAP", label: "DAP - Delivered At Place" },
    { value: "DAT", label: "DAT - Delivered At Terminal" },
    { value: "DDU", label: "DDU - Delivered Duty Unpaid" },
    { value: "DDP", label: "DDP - Delivered Duty Paid" },
  ];
  const serviciosLogisticos = [
    { value: "Terrestre", label: "Terrestre" },
    { value: "Marítimo", label: "Marítimo" },
    { value: "Aéreo", label: "Aéreo" },
    { value: "Multimodal", label: "Multimodal" },
    { value: "Express", label: "Express" },
  ];

  const updateResponse = (
    id: string,
    field: keyof QuotationResponse,
    value: string | File[]
  ) => {
    setResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };
  const addResponse = () => {
    const newR: QuotationResponse = {
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
    };  
    setResponses((prev) => [...prev, newR]);
  };
  const removeResponse = (id: string) => {
    if (responses.length > 1)
      setResponses((prev) => prev.filter((r) => r.id !== id));
  };


  // Datos de ejemplo
  const solicitudes: Solicitud[] = [
    { id: "COT-001", cliente: "Cliente ABC", fecha: "2024-01-15" },
    { id: "COT-002", cliente: "Empresa XYZ", fecha: "2024-02-10" },
  ];
  const productosMap: Record<string, ProductoItem[]> = {
    "COT-001": [
      {
        id: "P1",
        nombre: "Producto 1",
        comentarioCliente: "ASDASDASD",
        cliente: "Cliente ABC",
        cantidad: 24,
        especificaciones: "Tamaño: 3, Color: ASD",
        estadoRespuesta: "No respondido",
        precioUnitario: 0,
        recomendaciones: "",
        comentariosAdicionales: "",
        fecha: "2024-01-15",
        archivos: [],
        url: "https://www.google.com",
      },
      {
        id: "P2",
        nombre: "Producto 2",
        comentarioCliente: "Otro comentario",
        cliente: "Cliente ABC",
        cantidad: 10,
        especificaciones: "Tamaño: 5, Color: BBB",
        estadoRespuesta: "Respondido",
        precioUnitario: 12.5,
        recomendaciones: "Usar mejor material",
        comentariosAdicionales: "",
        fecha: "2024-01-16",
        archivos: [],
        url: "https://www.google.com",
      },
    ],
    "COT-002": [
      {
        id: "P3",
        nombre: "Producto A",
        comentarioCliente: "Comentario A",
        cliente: "Empresa XYZ",
        cantidad: 50,
        especificaciones: "Tamaño: M, Color: Azul",
        estadoRespuesta: "Observado",
        precioUnitario: 15,
        recomendaciones: "",
        comentariosAdicionales: "",
        fecha: "2024-02-10",
        archivos: [],
        url: "https://www.google.com",
      },
    ],
  };

  // Mapeo de colores para estado de respuesta
  const estadoRespuestaColorMap: Record<
    ProductoItem["estadoRespuesta"],
    string
  > = {
    "No respondido": "bg-orange-400 text-white",
    Respondido: "bg-green-500 text-white",
    Observado: "bg-yellow-400 text-white",
  };

  // Columnas para Solicitudes
  const colsSolicitudes: ColumnDef<Solicitud, any>[] = [
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

  // Columnas para Productos
  const colsProductos: ColumnDef<ProductoItem, any>[] = [
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

  const filteredProductos = productos.filter(
    (p) => subTab === "Todos" || p.estadoRespuesta === subTab
  );

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
              <h1 className="text-xl font-bold text-gray-900">
                Gestión de cotizaciones
              </h1>
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
            <button
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                mainTab === "respuesta"
                  ? "text-[#d7751f] bg-[#fdf9ef]"
                  : currentProduct
                  ? "text-gray-600 hover:text-gray-800 hover:bg-[#fdf9ef]"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              disabled={!currentProduct}
              onClick={() => currentProduct && setMainTab("respuesta")}
            >
              <FileText className="w-4 h-4" />
              Respuesta
              {mainTab === "respuesta" && (
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
                Productos de la cotización{" "}
                <strong>{selectedSolicitud.id}</strong>
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
                  trigger={
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm shadow-md flex items-center gap-2">
                      Enviar respuestas
                    </Button>
                  }
                  title="Confirmar envío de respuestas"
                  description="¿Está seguro de enviar las respuestas de la cotización?"
                  confirmText="Enviar"
                  cancelText="Cancelar"
                  onConfirm={handleEnviarRespuestas}
                />
              </div>
            </div>
          )}

          {mainTab === "respuesta" && currentProduct && (
            <div className="space-y-4 p-6">
              <Card className="py-4">
                <CardTitle className="border-b border-gray-200 px-4">
                  <h3 className="flex items-center font-semibold text-gray-900">
                    <Package className="mr-2 h-6 w-6 text-orange-500" /> Detalle
                    de producto
                  </h3>
                </CardTitle>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white py-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-orange-500" />{" "}
                          <label className="text-sm font-medium text-gray-700">
                            Nombre del Producto
                          </label>
                        </div>
                        <Input disabled value={currentProduct.nombre} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-orange-500" />{" "}
                            <label className="text-sm font-medium text-gray-700">
                              Cantidad
                            </label>
                          </div>
                          <Input disabled value={currentProduct.cantidad} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-orange-500" />{" "}
                            <label className="text-sm font-medium text-gray-700">
                              Tamaño
                            </label>
                          </div>
                          <Input
                            disabled
                            value={currentProduct.especificaciones}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-orange-500" />{" "}
                            <label className="text-sm font-medium text-gray-700">
                              Color
                            </label>
                          </div>
                          <Input
                            disabled
                            value={currentProduct.comentarioCliente}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-orange-500" />{" "}
                            <label className="text-sm font-medium text-gray-700">
                              URL
                            </label>
                          </div>
                          <Input
                            disabled
                            value={currentProduct.especificaciones}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-orange-500" />{" "}
                            <label className="text-sm font-medium text-gray-700">
                              Tipo de servicio
                            </label>
                          </div>
                          <Input
                            disabled
                            value={currentProduct.estadoRespuesta}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-orange-500" />{" "}
                          <label className="text-sm font-medium text-gray-700">
                            Archivos adjuntos
                          </label>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver archivos adjuntos
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="py-4">
                <CardTitle className="border-b border-gray-200 px-4 flex items-center justify-between">
                  <h3 className="flex items-center font-semibold text-gray-900">
                    <Package className="mr-2 h-6 w-6 text-orange-500" /> Detalle
                    de respuesta ({responses.length})
                  </h3>
                  <Button
                    onClick={addResponse}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-2 font-medium "
                  >
                    <Plus className="h-4 w-4 mr-2" /> Agregar Respuesta
                  </Button>
                </CardTitle>
                <CardContent>
                  {responses.map((response, i) => (
                    <div
                      key={response.id}
                      className="bg-white rounded-2xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-semibold text-black">
                              Respuesta #{i + 1}
                            </h4>
                          </div>
                        </div>
                        {responses.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeResponse(response.id)}
                            className="h-9 w-9 rounded-xl hover:bg-gray-200 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Pricing */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="h-5 w-5 text-orange-500" />
                            <h5 className="font-semibold text-black">
                              Información de Precios
                            </h5>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Precio Unitario ($)
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={response.pUnitario}
                                onChange={(e) =>
                                  updateResponse(
                                    response.id,
                                    "pUnitario",
                                    e.target.value
                                  )
                                }
                                placeholder="0.00"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Precio Total ($)
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={response.precioTotal}
                                onChange={(e) =>
                                  updateResponse(
                                    response.id,
                                    "precioTotal",
                                    e.target.value
                                  )
                                }
                                placeholder="0.00"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Precio Express ($)
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={response.precioExpress}
                                onChange={(e) =>
                                  updateResponse(
                                    response.id,
                                    "precioExpress",
                                    e.target.value
                                  )
                                }
                                placeholder="0.00"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Tarifa Servicio ($)
                              </Label>
                              <Input
                                value={response.tarifaServicio}
                                onChange={(e) =>
                                  updateResponse(
                                    response.id,
                                    "tarifaServicio",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Middle Column - Logistics & Terms */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Truck className="h-5 w-5 text-orange-500" />
                            <h5 className="font-semibold text-black">
                              Logística y Términos
                            </h5>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Incoterms
                              </Label>
                              <Select
                                value={response.incoterms}
                                onValueChange={(value) =>
                                  updateResponse(
                                    response.id,
                                    "incoterms",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-64">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {incotermsOptions.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Servicio Logístico
                              </Label>
                              <Select
                                value={response.servicioLogistico}
                                onValueChange={(value) =>
                                  updateResponse(
                                    response.id,
                                    "servicioLogistico",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-64">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {serviciosLogisticos.map((servicio) => (
                                    <SelectItem
                                      key={servicio.value}
                                      value={servicio.value}
                                    >
                                      {servicio.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Impuestos
                              </Label>
                              <Input
                                value={response.impuestos}
                                onChange={(e) =>
                                  updateResponse(
                                    response.id,
                                    "impuestos",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Comments & Files */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="h-5 w-5 text-orange-500" />
                            <h5 className="font-semibold text-black">
                              Observaciones y Archivos
                            </h5>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Recomendaciones
                              </Label>
                              <Textarea
                                value={response.recomendaciones}
                                onChange={(e) =>
                                  updateResponse(
                                    response.id,
                                    "recomendaciones",
                                    e.target.value
                                  )
                                }
                                placeholder="Embalaje adicional por fragilidad..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">
                                Comentarios Adicionales
                              </Label>
                              <Textarea
                                value={response.comentariosAdicionales}
                                onChange={(e) =>
                                  updateResponse(
                                    response.id,
                                    "comentariosAdicionales",
                                    e.target.value
                                  )
                                }
                                placeholder="Se puede reducir el precio por volumen..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-gray-700 font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                Archivos Adjuntos
                              </Label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                                <FileUploadComponent />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-gray-600 text-sm">
                              Precio Unitario
                            </p>
                            <p className="font-bold text-black">
                              ${response.pUnitario || "0.00"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">
                              Precio Total
                            </p>
                            <p className="font-bold text-black">
                              ${response.precioTotal || "0.00"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Incoterms</p>
                            <p className="font-bold text-black">
                              {response.incoterms}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Servicio</p>
                            <p className="font-bold text-black">
                              {response.servicioLogistico}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-8"></div>
              <div className="flex space-x-4 justify-end pt-6">
                <Button
                  onClick={handleEnviarRespuestas}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
