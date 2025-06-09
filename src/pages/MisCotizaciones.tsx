import {
  Calendar,
  DollarSign,
  File,
  FileText,
  Hash,
  IdCard,
  Link,
  MessageCircleMore,
  MessageSquare,
  Package,
  Palette,
  Ruler,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Cotizacion {
  id: string;
  estado: string;
  fecha: string;
}

interface Producto {
  nombre: string;
  cantidad: number;
  especificaciones: string;
  estado: string;
  fecha: string;
  url: string;
  archivos: File[];
  comentario: string;
  tamano: string;
  color: string;
  tipo_servicio: string;
  peso: number;
  volumen: number;
  nro_cajas: number;
}

// Defino mapeo de colores para estados de cotización
const estadoColorMap: Record<string, string> = {
  Pendiente: "bg-yellow-400 text-white",
  Revisado: "bg-green-500 text-white",
  Completado: "bg-green-500 text-white",
  Observado: "bg-yellow-400 text-white",
  Cancelado: "bg-red-500 text-white",
};

export default function MisCotizaciones() {
  const [tab, setTab] = useState<"mis" | "detalles" | "seguimiento">("mis");
  const [selectedCotizacion, setSelectedCotizacion] =
    useState<Cotizacion | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
    null
  );

  // Datos de ejemplo
  const cotizaciones: Cotizacion[] = [
    { id: "1", estado: "Pendiente", fecha: "2025-05-12" },
    { id: "2", estado: "Revisado", fecha: "2025-05-15" },
    { id: "3", estado: "Completado", fecha: "2025-05-12" },
    { id: "4", estado: "Observado", fecha: "2025-05-15" },
    { id: "5", estado: "Cancelado", fecha: "2025-05-15" },
  ];

  const productos: Producto[] = [
    {
      nombre: "Camiseta Personalizada",
      cantidad: 50,
      especificaciones: "Tamaño: M, Color: Azul",
      estado: "En revisión",
      fecha: "2024-01-14",
      url: "https://www.google.com",
      comentario: "Comentario del producto",
      archivos: [],
      tamano: "M",
      color: "Azul",
      tipo_servicio: "Pendiente",
      peso: 10,
      volumen: 10,
      nro_cajas: 10,
    },
    {
      nombre: "Taza Cerámica",
      cantidad: 100,
      especificaciones: "Tamaño: 350ml, Color: Blanco",
      estado: "Respondido",
      fecha: "2024-01-13",
      url: "https://www.google.com",
      comentario: "Comentario del producto",
      archivos: [],
      tamano: "350ml",
      color: "Blanco",
      tipo_servicio: "Pendiente",
      peso: 10,
      volumen: 10,
      nro_cajas: 10,
    },
    {
      nombre: "Llavero Promocional",
      cantidad: 200,
      especificaciones: "Material: Acrílico, Color: Transparente",
      estado: "Respondido",
      fecha: "2024-01-15",
      url: "https://www.google.com",
      comentario: "Comentario del producto",
      archivos: [],
      tamano: "Transparente",
      color: "Transparente",
      tipo_servicio: "Pendiente",
      peso: 10,
      volumen: 10,
      nro_cajas: 10,
    },
  ];

  // Columnas Mis Cotizaciones
  const colsMis: ColumnDef<Cotizacion, any>[] = [
    { accessorKey: "id", header: "Id Solicitud" },
    { accessorKey: "tipo Servicio", header: "Tipo Servicio" },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.estado;
        const badgeClass =
          estadoColorMap[estado] || "bg-gray-200 text-gray-800";
        return <Badge className={badgeClass}>{estado}</Badge>;
      },
    },

    { accessorKey: "fecha", header: "Fecha" },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedCotizacion(row.original);
            setTab("detalles");
          }}
        >
          Ver detalles
        </Button>
      ),
    },
  ];

  // Columnas Detalles de Cotización
  const colsDetalles: ColumnDef<Producto, any>[] = [
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
          onClick={() => {
            setSelectedProducto(row.original);
            setTab("seguimiento");
          }}
        >
          Ver seguimiento
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 border-t-2 border-b-2 border-gray-200">
      {/* Top Navigation Bar */}
      <div className="border-b-2 border-gray-100 px-4 py-4 bg-white ">
        <div className="container   flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 ">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Mis cotizaciones
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex bg-white border-b border-gray-200">
            <button
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                tab === "mis"
                  ? "text-[#d7751f] bg-[#fdf9ef]"
                  : "text-gray-600 hover:text-gray-800 hover:bg-[#fdf9ef]"
              }`}
              onClick={() => setTab("mis")}
            >
              <FileText className="w-4 h-4" />
              Mis cotizaciones
              {tab === "mis" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7751f]"></div>
              )}
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                tab === "detalles"
                  ? "text-[#d7751f] bg-[#fdf9ef]"
                  : "text-gray-600 hover:text-gray-800 hover:bg-[#fdf9ef]"
              }`}
              onClick={() => setTab("detalles")}
            >
              <FileText className="w-4 h-4" />
              Detalles de cotización
              {tab === "detalles" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7751f]"></div>
              )}
            </button>

            <button
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                tab === "seguimiento"
                  ? "text-[#d7751f] bg-[#fdf9ef]"
                  : selectedCotizacion
                  ? "text-gray-600 hover:text-gray-800 hover:bg-[#fdf9ef]"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              disabled={!selectedCotizacion}
              onClick={() => selectedCotizacion && setTab("seguimiento")}
            >
              <FileText className="w-4 h-4" />
              Seguimiento
              {tab === "seguimiento" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7751f]"></div>
              )}
            </button>
          </div>

          {/* Contenidos */}
          {tab === "mis" && (
            <div className="space-y-4 p-6">
              <p className="text-black   leading-relaxed">
                En este apartado se especifican las solicitudes de cotización
                que han sido registrados en el sistema. Puede verificar su
                estado, la respuesta del administrador y los documentos
                asociados a su cotización; seleccionando el botón que indica
                "Ver Detalles".
              </p>
              <DataTable
                columns={colsMis}
                data={cotizaciones}
                toolbarOptions={{ showSearch: true, showViewOptions: false }}
                paginationOptions={{
                  showSelectedCount: true,
                  showPagination: true,
                  showNavigation: true,
                }}
              />
            </div>
          )}

          {tab === "detalles" && selectedCotizacion && (
            <div className="space-y-4 p-6 ">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="mb-4 text-black leading-relaxed">
                  <strong>Id de cotización: </strong>
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-[#d7751f]" />
                    {selectedCotizacion.id}
                  </div>
                </div>
                <div className="mb-4 text-black leading-relaxed flex flex-col">
                  <strong>Fecha de registro:</strong>{" "}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#d7751f]" />{" "}
                    {selectedCotizacion.fecha}
                  </div>
                </div>
                <div className="mb-4 text-black leading-relaxed flex flex-col">
                  <strong>Datos del cliente:</strong>
                  <div className="flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-[#d7751f]" />
                    <p>Paulo - 76016271</p>
                  </div>
                </div>
              </div>
              <DataTable
                columns={colsDetalles}
                data={productos}
                toolbarOptions={{ showSearch: false, showViewOptions: false }}
                paginationOptions={{
                  showSelectedCount: false,
                  showPagination: false,
                  showNavigation: false,
                }}
              />
            </div>
          )}

          {tab === "seguimiento" && selectedProducto && (
            <div className="space-y-4 p-6 ">
              <Card className="py-4">
                <CardTitle className="border-b border-gray-200 px-4 ">
                  <h3 className="flex items-center font-semibold text-gray-900">
                    <Package className="mr-2 h-6 w-6 text-orange-500" />
                    Detalle de producto
                  </h3>
                </CardTitle>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white  py-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-orange-500" />
                          <label className="text-sm font-medium text-gray-700">
                            Nombre del Producto
                          </label>
                        </div>
                        <Input
                          name="nombre"
                          disabled={true}
                          value={selectedProducto.nombre}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Cantidad
                            </label>
                          </div>
                          <Input
                            name="cantidad"
                            value={selectedProducto.cantidad}
                            disabled
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Tamaño
                            </label>
                          </div>
                          <Input
                            name="tamano"
                            type="string"
                            value={selectedProducto.tamano}
                            disabled
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Color
                            </label>
                          </div>
                          <Input
                            name="color"
                            value={selectedProducto.color}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              URL
                            </label>
                          </div>
                          <Input
                            name="url"
                            value={selectedProducto.url}
                            disabled
                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Link className="w-4 h-4 text-orange-500" />
                              <label className="text-sm font-medium text-gray-700">
                                Tipo de servicio
                              </label>
                            </div>
                            <Input
                              name="tipo_servicio"
                              value={selectedProducto.tipo_servicio}
                              disabled
                              className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Peso (Kg)
                            </label>
                          </div>
                          <Input
                            name="peso"
                            type="number"
                            value={selectedProducto.peso}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Volumen
                            </label>
                          </div>
                          <Input
                            name="volumen"
                            type="number"
                            value={selectedProducto.volumen}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Nro. cajas
                            </label>
                          </div>
                          <Input
                            name="nro_cajas"
                            type="number"
                            value={selectedProducto.nro_cajas}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Comentario
                            </label>
                          </div>
                          <Textarea
                            name="comentario"
                            value={selectedProducto.comentario}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-orange-500" />
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
                <CardTitle className="border-b border-gray-200 px-4 ">
                  <h3 className="flex items-center font-semibold text-gray-900">
                    <MessageCircleMore className="mr-2 h-6 w-6 text-orange-500" />
                    Detalle de respuesta
                  </h3>
                </CardTitle>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white  py-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-orange-500" />
                          <label className="text-sm font-medium text-gray-700">
                            Precio Unitario
                          </label>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          $15.99
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Tiempo de Entrega
                            </label>
                          </div>
                          <p className="font-medium">7-10 días hábiles</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Tamaño
                            </label>
                          </div>
                          <input name="tamano" type="string" disabled />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              Color
                            </label>
                          </div>
                          <input name="color" value={"color"} disabled />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-orange-500" />
                            <label className="text-sm font-medium text-gray-700">
                              URL
                            </label>
                          </div>
                          <input
                            name="url"
                            value={"url"}
                            disabled
                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <label className="text-sm font-medium text-gray-700">
                            Comentario
                          </label>
                        </div>
                        <Textarea
                          name="comentario"
                          value=" Podemos entregar en 7 días hábiles. El logo será impreso en la parte frontal "
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <label className="text-sm font-medium text-gray-700">
                            Recomendaciones
                          </label>
                        </div>
                        <Textarea
                          name="comentario"
                          value="Recomendamos usar tela de algodón premium para mayor durabilidad. "
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-4 justify-end pt-6">
                <Button
                  variant="outline"
                  onClick={() => window.open("https://wa.me/123456789")}
                >
                  Solicitar cambios
                </Button>
                <Button onClick={() => window.open("https://wa.me/123456789")}>
                  Aceptar cotización
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
