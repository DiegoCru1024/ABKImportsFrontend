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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import type { Producto } from "./components/utils/interface";
import { tabs } from "./components/utils/static";
import { colsMis } from "./components/table/columnsMisCotizaciones";
import { colsDetalles } from "./components/table/columnsDetallesDeCotizacion";
import { cotizaciones } from "./components/utils/data";

export default function MisCotizaciones() {
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
    null
  );

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
      tipoServicio: "Pendiente",
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
      tipoServicio: "Pendiente",
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
      tipoServicio: "Pendiente",
      peso: 10,
      volumen: 10,
      nro_cajas: 10,
    },
  ];

  //********Tabs**** */
  const [tab, setTab] = useState("mis");


  //********Cotización seleccionada**** */
  const [selectedCotizacion, setSelectedCotizacion] = useState<number>(0); // Simulando que hay una cotización seleccionada




  //********Columnas de mis cotizaciones */
 const columnas = colsMis({setTab, setSelectedCotizacion});

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      {/* Top Navigation Bar */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full p-1 px-16 py-4 border-b border-border/60">
          <div className="flex items-center space-x-4">
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

      <div className="w-fill  p-4 px-16">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {/* Tabs mejorados */}
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex">
              {tabs.map((tabItem) => {
                const Icon = tabItem.icon;
                const isActive = tab === tabItem.id;
                const isDisabled = tabItem.disabled;

                return (
                  <button
                    key={tabItem.id}
                    className={`
                    relative flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? "text-white bg-gradient-to-b from-orange-400/2 to-orange-400/90 border-b-2 border-orange-400"
                        : isDisabled
                        ? "text-gray-500 cursor-not-allowed opacity-50"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }
                    ${!isDisabled && !isActive ? "hover:scale-105" : ""}
                  `}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setTab(tabItem.id)}
                    title={tabItem.description}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : ""}`}
                    />
                    <span className="whitespace-nowrap">{tabItem.label}</span>

                    {/* Indicador activo mejorado */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-t-lg"
                        initial={false}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}

                    {/* Efecto hover */}
                    {!isActive && !isDisabled && (
                      <div className="absolute bg-white/0 hover:bg-white/5 transition-colors duration-200 rounded-t-lg" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Línea divisoria sutil */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          </div>

          {/* Contenidos */}
          {tab === "mis" && (
            <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-necro font-medium text-lg">
                  Solicitudes de Cotización
                </CardTitle>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  En este apartado se especifican las solicitudes de cotización
                  que han sido registrados en el sistema. Puede verificar su
                  estado, la respuesta del administrador y los documentos
                  asociados a su cotización; seleccionando el botón que indica
                  "Ver Detalles".
                </p>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columnas}
                  data={cotizaciones}
                  toolbarOptions={{
                    showSearch: true,
                    showViewOptions: false,
                  }}
                  paginationOptions={{
                    showSelectedCount: true,
                    showPagination: true,
                    showNavigation: true,
                  }}
                />
              </CardContent>
            </Card>
          )}

          {tab === "detalles" && selectedCotizacion && (
            <div className="space-y-4 p-6 ">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="mb-4 text-black leading-relaxed">
                  <strong>Id de cotización: </strong>
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-[#d7751f]" />
                    {/*{selectedCotizacion.id}*/}
                  </div>
                </div>
                <div className="mb-4 text-black leading-relaxed flex flex-col">
                  <strong>Fecha de registro:</strong>{" "}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#d7751f]" />{" "}
                    {/*{selectedCotizacion.fecha}*/}
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
                              value={selectedProducto.tipoServicio}
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
