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
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateQuotation } from "@/hooks/use-quation";
import { uploadMultipleFiles, deleteFile } from "@/api/fileUpload";
import { toast } from "sonner";
import SendingModal from "@/components/sending-modal";

const productoSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  quantity: z.number().min(1, { message: "La cantidad es requerida" }),
  size: z.string().min(1, { message: "El tamaño es requerido" }),
  color: z.string().min(1, { message: "El color es requerido" }),
  url: z.string().optional(),
  comment: z.string().optional(),
  service_type: z.string().optional(),
  weight: z.number().optional(),
  volume: z.number().optional(),
  number_of_boxes: z.number().optional(),
  attachments: z.array(z.string()).optional(),
});

export default function CotizacionView() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [service, setService] = useState("Pendiente"); // valor inicial
  const [resetCounter, setResetCounter] = useState(0); // Controlar el reset del FileUploadComponent
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof productoSchema>>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      size: "",
      color: "",
      url: "",
      comment: "",
      service_type: "Pendiente",
      weight: 0,
      volume: 0,
      number_of_boxes: 0,
      attachments: [],
    },
  });
  // Eliminar producto
  const handleEliminar = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  const columns = columnasCotizacion({ handleEliminar });

  // Agregar producto con archivos adjuntos
  const handleAgregar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar que haya al menos un archivo antes de proceder
    if (selectedFiles.length === 0) {
      toast.error(
        "Por favor, adjunte al menos un archivo antes de agregar el producto."
      );
      return;
    }

    // Validar formulario antes de proceder
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    // Subir archivos a AWS y obtener URLs
    let attachmentsUrls: string[] = [];
    try {
      if (selectedFiles.length > 0) {
        const { urls } = await uploadMultipleFiles(selectedFiles);
        attachmentsUrls = urls;
        console.log("Estas son las urls", attachmentsUrls);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      return;
    }

    // Obtener los valores del formulario
    const values = form.getValues();
    const newProduct = {
      name: values.name,
      quantity: values.quantity,
      size: values.size,
      color: values.color,
      url: values.url || "",
      comment: values.comment || "",
      service_type: values.service_type || "",
      weight: values.weight || 0,
      volume: values.volume || 0,
      number_of_boxes: values.number_of_boxes || 0,
      attachments: attachmentsUrls,
    };

    // Agregar el producto a la lista
    setProductos((prev) => [...prev, newProduct]);

    // Resetear el formulario y los archivos
    form.reset();
    setResetCounter((prev) => prev + 1);
    setSelectedFiles([]); // Limpiar los archivos seleccionados
  };

  const [isLoading, setIsLoading] = useState(false);
  // Enviar cotización completa
  const createQuotationMut = useCreateQuotation();
  const handleEnviar = () => {
    setIsLoading(true); // Mostrar el modal de carga
    createQuotationMut.mutate(
      { data: { products: productos } },
      {
        onSuccess: () => {
          setIsLoading(false); // Ocultar el modal de carga
        },
        onError: () => {
          setIsLoading(false); // Ocultar el modal de carga
        },
      }
    );
  };

  useEffect(() => {
    console.log("Estas son los productos", productos);
  }, [productos]);

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
            <Form {...form}>
              <form onSubmit={handleAgregar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6">
                  {/* Primera Columna */}
                  <div className="space-y-4">
                    {/* Nombre del producto */}
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-orange-500" />
                              <FormLabel>Nombre del Producto</FormLabel>
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: Monitor, Teclado, Mouse..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* URL del producto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <Link className="w-4 h-4 text-orange-500" />
                                <FormLabel>URL</FormLabel>
                              </div>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="https://temu.com/producto/123"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name="service_type"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-orange-500" />
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Tipo servicio
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <div>
                                    <Select
                                      {...field}
                                      defaultValue={field.value}
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        setService(value);
                                      }}
                                    >
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
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {service === "Almacenaje de Mercancia" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-orange-500" />
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Peso (Kg)
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Input {...field} type="number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="volume"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-orange-500" />
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Volumen
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Input {...field} type="number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="number_of_boxes"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-orange-500" />
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Nro. cajas
                                  </FormLabel>
                                </div>
                                <FormControl>
                                  <Input {...field} type="number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Segunda Columna */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-orange-500" />
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Cantidad
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min={1}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-orange-500" />
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Tamaño
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ej: 10x10x10 cm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-orange-500" />
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Color
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ej: Rojo, Azul, Verde..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1  gap-4">
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-orange-500" />
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Comentario
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Ej: Producto en buen estado, etc."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-white p-6">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-orange-500" />
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Archivos
                    </FormLabel>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                    <FileUploadComponent
                      onFilesChange={setSelectedFiles}
                      resetCounter={resetCounter}
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full px-8 py-2 shadow-md transition-all duration-200 transform hover:scale-105"
                      type="submit"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Agregar Producto
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Tabla de productos */}
          <div className="w-full p-1 pt-6">
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
                  pageInfo={{
                    pageNumber: 1,
                    pageSize: 10,
                    totalElements: 0,
                    totalPages: 0,
                  }}
                  onPageChange={() => {}}
                  onSearch={() => {}}
                  searchTerm={""}
                  isLoading={false}
                />
              </div>
            </div>
          </div>

          {/* Botón Enviar */}
          <div className="flex justify-end mt-8">
            <ConfirmDialog
              trigger={
                <Button  disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full text-lg shadow-md flex items-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Enviar
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

      {/* Animación de carga */}
      <SendingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </div>
  );
}
