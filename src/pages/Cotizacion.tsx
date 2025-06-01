import {
  FileText,
  Package,
  Upload,
  Plus,
  Send,
  Ruler,
  Hash,
  Palette,
  Link,
  MessageSquare,
  File,
  X,
  Trash,
  PackageOpen,
} from "lucide-react";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { Textarea } from "@/components/ui/textarea";
import type { ColumnDef } from "@tanstack/react-table";

// Tipos para producto y formulario
interface Producto {
  nombre: string;
  cantidad: number;
  tamano: number;
  color: string;
  url: string;
  comentario: string;
  archivos: File[];
}

interface FormProducto extends Omit<Producto, "archivos"> {
  archivos: File[];
}

export default function Cotizacion() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<FormProducto>({
    nombre: "",
    cantidad: 1,
    tamano: 1,
    color: "",
    url: "",
    comentario: "",
    archivos: [],
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      archivos: e.target.files ? Array.from(e.target.files) : [],
    }));
  };

  const handleAgregar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProductos((prev) => [...prev, { ...form }]);
    setForm({
      nombre: "",
      cantidad: 1,
      tamano: 1,
      color: "",
      url: "",
      comentario: "",
      archivos: [],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEnviar = () => {
    // Aquí iría la lógica para enviar los productos
    alert("Productos enviados: " + JSON.stringify(productos));
  };

  const updateCurrentProduct = (field: keyof Producto, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const removeFile = (fileId: string) => {
    updateCurrentProduct(
      "archivos",
      form.archivos.filter((f) => f.name !== fileId)
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
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

                <div className="grid grid-cols-2 gap-4">
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
                      type="number"
                      min={1}
                      value={form.tamano}
                      onChange={handleInput}
                      required
                    />
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
                    <Input
                      name="color"
                      placeholder="Ej: Rojo, Azul, Verde..."
                      value={form.color}
                      onChange={handleInput}
                      required
                    />
                  </div>

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
                      required
                      placeholder="https://temu.com/producto/123"
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
                    value={form.comentario}
                    onChange={handleInput}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Archivos
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                    {form.archivos.length > 0 ? (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {form.archivos.map((file) => (
                          <div
                            key={file.name}
                            className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm"
                          >
                            <FileText className="w-4 h-4 text-orange-500" />
                            <span
                              className="truncate max-w-[120px]"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <span className="text-gray-500 text-xs">
                              ({formatFileSize(file.size)})
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 rounded-full hover:bg-red-100"
                              onClick={() => removeFile(file.name)}
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm mb-4">
                        No hay archivos adjuntos
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleFile}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <Button
                        variant="outline"
                        type="submit"
                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Subir archivos
                      </Button>
                    </div>
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
              <div className="w-full overflow-x-auto border-b border-gray-200 px-4 py-3 bg-white" >
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
            <Button
              onClick={handleEnviar}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full text-lg shadow-md flex items-center gap-2"
            >
              <Send className="w-5 h-5" /> Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
