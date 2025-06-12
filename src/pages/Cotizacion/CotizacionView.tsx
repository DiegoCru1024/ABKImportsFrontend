import {
  FileText,
  Package,
  Plus,
  Send,
  Ruler,
  Hash,
  Palette,
  Link,
  MessageSquare,
  File,
  PackageOpen,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { Textarea } from "@/components/ui/textarea";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import FileUploadComponent from "@/components/comp-552";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Producto } from "./utils/interface";
import { columnasCotizacion } from "./components/table/columnasCotizacion";
import { servicios } from "./components/data/static";

export default function CotizacionView() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [service, setService] = useState("Pendiente"); // valor inicial
  const [form, setForm] = useState<Producto>({
    id: 0,
    nombre: "",
    cantidad: 1,
    tamano: "",
    color: "",
    url: "",
    comentario: "",
    archivos: [],
    peso: 0,
    volumen: 0,
    nro_cajas: 0,
    tipoServicio: "",
  });
  // Estado para controlar reseteo del FileUploadComponent
  const [resetCounter, setResetCounter] = useState(0)
  // Callback para recibir archivos del componente de upload
  const handleFilesChange = (files: File[]) => {
    setForm(prev => ({ ...prev, archivos: files }));
  };

  // Eliminar producto
  const handleEliminar = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Math.max(1, Number(value)) : value,
    }));
  };

  const handleAgregar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProductos(prev => [...prev, { ...form }]);
    // Resetear formulario y archivos
    setForm({
      id: 0,
      nombre: "",
      cantidad: 1,
      tamano: "",
      color: "",
      url: "",
      comentario: "",
      archivos: [],
      peso: 0,
      volumen: 0,
      nro_cajas: 0,
      tipoServicio: "",
    });
    setResetCounter(prev => prev + 1)
  };

  const handleEnviar = async () => {
    // Construir DTO de cotización
    const dto = {
      idUsuario: 101, // Reemplazar por ID real de usuario
      estado: service,
      fecha: new Date(),
      productos: productos.map((p) => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        tamano: p.tamano,
        color: p.color,
        url: p.url,
        comentario: p.comentario,
        tipoServicio: p.tipoServicio,
        peso: p.peso,
        volumen: p.volumen,
        nro_cajas: p.nro_cajas,
        archivos: p.archivos,
      })),
    };

    // Enviar como FormData para incluir archivos
    const formData = new FormData();
    formData.append("idUsuario", dto.idUsuario.toString());
    formData.append("estado", dto.estado);
    formData.append("fecha", dto.fecha.toISOString());
    dto.productos.forEach((prod, i) => {
      formData.append(`productos[${i}][nombre]`, prod.nombre);
      formData.append(`productos[${i}][cantidad]`, prod.cantidad.toString());
      formData.append(`productos[${i}][tamano]`, prod.tamano);
      formData.append(`productos[${i}][color]`, prod.color);
      formData.append(`productos[${i}][url]`, prod.url);
      formData.append(`productos[${i}][comentario]`, prod.comentario);
      formData.append(`productos[${i}][tipoServicio]`, prod.tipoServicio);
      formData.append(`productos[${i}][peso]`, prod.peso.toString());
      formData.append(`productos[${i}][volumen]`, prod.volumen.toString());
      formData.append(`productos[${i}][nro_cajas]`, prod.nro_cajas.toString());
      prod.archivos.forEach((file) => {
        formData.append(`productos[${i}][archivos]`, file);
      });
    });

    try {
      const response = await fetch('/api/cotizacion', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Error en el servidor al enviar cotización');
      }
      const result = await response.json();
      console.log('Cotización enviada exitosamente', result);
      // Reiniciar productos tras envío
      setProductos([]);
    } catch (error) {
      console.error('Error al enviar cotización', error);
    }
  };

  // Columnas de la tabla
  const columns = columnasCotizacion({ handleEliminar });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      {/* Top Navigation Bar */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full p-1 px-10 py-4 border-b border-border/60">
          <div className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Cotización de productos
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="w-fill  p-4 px-16">
        <div className="grid grid-cols-1  gap-6">
          <div className="overflow-hidden rounded-xl border bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm">
            <div className="px-4 py-3">
              <h3 className="flex items-center font-semibold text-white">
                <Package className="mr-2 h-6 w-6 text-orange-500" />
                Detalle de producto
              </h3>
            </div>
            {/* Formulario */}
            <form onSubmit={handleAgregar}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="nombre"
                      >
                        Nombre del Producto
                      </label>
                    </div>
                    <Input
                      id="nombre"
                      name="nombre"
                      placeholder="Ej: Monitor, Teclado, Mouse..."
                      value={form.nombre}
                      onChange={handleInput}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-orange-500" />
                        <label
                          className="text-sm font-medium text-gray-700"
                          htmlFor="url"
                        >
                          URL
                        </label>
                      </div>
                      <Input
                        id="url"
                        name="url"
                        value={form.url}
                        onChange={handleInput}
                        placeholder="https://temu.com/producto/123"
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                        <label
                          className="text-sm font-medium text-gray-700"
                          htmlFor="tipoServicio"
                        >
                          Tipo servicio
                        </label>
                      </div>
                      <Select defaultValue={service} onValueChange={setService}>
                        <SelectTrigger className="w-60">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Servicios</SelectLabel>
                            {servicios.map((servicio) => (
                              <SelectItem
                                key={servicio.id}
                                value={servicio.value}
                              >
                                {servicio.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {service === "Almacenaje de Mercancia" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <label
                            className="text-sm font-medium text-gray-700"
                            htmlFor="peso"
                          >
                            Peso (Kg)
                          </label>
                        </div>
                        <Input
                          id="peso"
                          name="peso"
                          type="number"
                          value={form.peso}
                          onChange={handleInput}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <label
                            className="text-sm font-medium text-gray-700"
                            htmlFor="volumen"
                          >
                            Volumen
                          </label>
                        </div>
                        <Input
                          id="volumen"
                          name="volumen"
                          type="number"
                          value={form.volumen}
                          onChange={handleInput}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <label
                            className="text-sm font-medium text-gray-700"
                            htmlFor="nro_cajas"
                          >
                            Nro. cajas
                          </label>
                        </div>
                        <Input
                          id="nro_cajas"
                          name="nro_cajas"
                          type="number"
                          value={form.nro_cajas}
                          onChange={handleInput}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-orange-500" />
                        <label
                          className="text-sm font-medium text-gray-700"
                          htmlFor="cantidad"
                        >
                          Cantidad
                        </label>
                      </div>
                      <Input
                        id="cantidad"
                        name="cantidad"
                        type="number"
                        min={1}
                        value={form.cantidad}
                        onChange={handleInput}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-orange-500" />
                        <label
                          className="text-sm font-medium text-gray-700"
                          htmlFor="tamano"
                        >
                          Tamaño
                        </label>
                      </div>
                      <Input
                        id="tamano"
                        name="tamano"
                        type="string"
                        value={form.tamano}
                        onChange={handleInput}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-orange-500" />
                        <label
                          className="text-sm font-medium text-gray-700"
                          htmlFor="color"
                        >
                          Color
                        </label>
                      </div>
                      <Input
                        id="color"
                        name="color"
                        placeholder="Ej: Rojo, Azul, Verde..."
                        value={form.color}
                        onChange={handleInput}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1  gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                        <label
                          className="text-sm font-medium text-gray-700"
                          htmlFor="comentario"
                        >
                          Comentario
                        </label>
                      </div>
                      <Textarea
                        id="comentario"
                        name="comentario"
                        value={form.comentario}
                        onChange={handleInput}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-white p-6">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-orange-500" />
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="archivos"
                  >
                    Archivos
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                  <FileUploadComponent
                    onFilesChange={handleFilesChange}
                    resetCounter={resetCounter}
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full px-8 py-2 shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar Producto
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Tabla de productos */}
          <div className="container mx-auto pt-6">
            <div className="overflow-hidden rounded-xl border bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <h3 className="flex items-center font-semibold text-white">
                  <PackageOpen className="mr-2 h-5 w-5 text-orange-500" />
                  Productos Cotizados
                </h3>
              </div>
              <div className="w-full overflow-x-auto border-b border-gray-200 px-4 py-3 bg-white">
                <DataTable
                  columns={columns}
                  data={productos}
                  toolbarOptions={{ showSearch: false, showViewOptions: false }}
                  paginationOptions={{
                    showSelectedCount: false,
                    showPagination: false,
                    showNavigation: false,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Botón Enviar */}
          <div className="flex justify-end mt-8">
            <ConfirmDialog
              trigger={
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full text-lg shadow-md flex items-center gap-2">
                  <Send className="w-5 h-5" /> Enviar
                </Button>
              }
              title="Confirmar envío de cotización"
              description="¿Está seguro de enviar la cotización?"
              confirmText="Enviar"
              cancelText="Cancelar"
              onConfirm={handleEnviar}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}
