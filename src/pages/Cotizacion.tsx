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
  Trash,
  PackageOpen,
} from "lucide-react";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { Textarea } from "@/components/ui/textarea";
import type { ColumnDef } from "@tanstack/react-table";
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

// Tipos para producto y formulario
interface Producto {
  nombre: string;
  cantidad: number;
  tamano: string;
  color: string;
  url: string;
  comentario: string;
  tipoServicio: string;
  peso: number;
  volumen: number;
  nro_cajas: number;
  archivos: File[];
}

interface FormProducto extends Omit<Producto, "archivos"> {
  archivos: File[];
  peso: number;
  volumen: number;
  nro_cajas: number;
}

export default function Cotizacion() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [service, setService] = useState("Pendiente"); // valor inicial
  const [form, setForm] = useState<FormProducto>({
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Eliminar producto
  const handleEliminar = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  // Definición de columnas dentro del componente para usar callbacks
  const columns: ColumnDef<Producto, any>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => <div>{row.original.nombre}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    { accessorKey: "cantidad", header: "Cantidad", size: 50 },
    { accessorKey: "tamano", header: "Tamaño", size: 50 },
    { accessorKey: "color", header: "Color", size: 100 },
    {
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
    { accessorKey: "peso", header: "Peso", size: 50 },
    { accessorKey: "volumen", header: "Volumen", size: 50 },
    { accessorKey: "nro_cajas", header: "Nro. cajas", size: 50 },
    {
      accessorKey: "archivos",
      header: "Archivos",
      size: 80,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.archivos?.map((file: File, idx: number) => {
            const url = URL.createObjectURL(file);
            return (
              <button
                key={idx}
                onClick={() => window.open(url)}
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <FileText className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Trash
            className="w-4 h-4 text-red-500"
            onClick={() => handleEliminar(row.index)}
          />
        </div>
      ),
    },
  ];

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
    setProductos((prev) => [...prev, { ...form }]);
    setForm({
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEnviar = () => {
    // Aquí iría la lógica para enviar los productos
    alert("Productos enviados: " + JSON.stringify(productos));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 border-t-2 border-b-2 border-gray-200">
      {/* Top Navigation Bar */}
      <div className="border-b-2 border-gray-200 px-4 py-4 bg-white ">
        <div className="container   flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 ">
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
      </div>
      <div className=" border-gray-200 bg-gray-100 px-4 py-2">
        <div className="container mx-auto pt-6">
          <div className="overflow-hidden rounded-xl border bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm">
            <div className="px-4 py-3">
              <h3 className="flex items-center font-semibold text-white">
                <Package className="mr-2 h-6 w-6 text-orange-500" />
                Detalle de producto
              </h3>
            </div>
            {/* Formulario */}
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6"
              onSubmit={handleAgregar}
            >
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
                    placeholder="Ej: Monitor, Teclado, Mouse..."
                    value={form.nombre}
                    onChange={handleInput}
                    required
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
                      <label className="text-sm font-medium text-gray-700">
                        Tamaño
                      </label>
                    </div>
                    <Input
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
                      <label className="text-sm font-medium text-gray-700">
                        Color
                      </label>
                    </div>
                    <Input
                      name="color"
                      placeholder="Ej: Rojo, Azul, Verde..."
                      value={form.color}
                      onChange={handleInput}
                      required
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
                      value={form.url}
                      onChange={handleInput}
                      placeholder="https://temu.com/producto/123"
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                      <label className="text-sm font-medium text-gray-700">
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
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Consolidado Express">
                            Consolidado Express
                          </SelectItem>
                          <SelectItem value="Consolidado Grupal Express">
                            Consolidado Grupal Express
                          </SelectItem>
                          <SelectItem value="Consolidado Maritimo">
                            Consolidado Maritimo
                          </SelectItem>
                          <SelectItem value="Consolidado Grupal Maritimo">
                            Consolidado Grupal Maritimo
                          </SelectItem>
                          <SelectItem value="Almacenaje de Mercancia">
                            Almacenaje de Mercancía
                          </SelectItem>
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
                        <label className="text-sm font-medium text-gray-700">
                          Peso (Kg)
                        </label>
                      </div>
                      <Input
                        name="peso"
                        type="number"
                        value={form.peso}
                        onChange={handleInput}
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
                        value={form.volumen}
                        onChange={handleInput}
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
                        value={form.nro_cajas}
                        onChange={handleInput}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1  gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                      <label className="text-sm font-medium text-gray-700">
                        Comentario
                      </label>
                    </div>
                    <Textarea
                      name="comentario"
                      value={form.comentario}
                      onChange={handleInput}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Archivos
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                    <FileUploadComponent />
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
