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
  SelectItem,
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
import { uploadMultipleFiles } from "@/api/fileUpload";
import { toast } from "sonner";
import SendingModal from "@/components/sending-modal";
  import { useNavigate } from "react-router-dom";

const productoSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  quantity: z.number().min(1, { message: "La cantidad es requerida" }),
  size: z.string().min(1, { message: "El tamaño es requerido" }),
  color: z.string().min(1, { message: "El color es requerido" }),
  url: z.string().optional(),
  comment: z.string().optional(),
  weight: z.number().optional(),
  volume: z.number().optional(),
  number_of_boxes: z.number().optional(),
  attachments: z.array(z.string()).optional(),
});

export default function CotizacionViewNew() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [service, setService] = useState("Pendiente");
  const [resetCounter, setResetCounter] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof productoSchema>>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      size: "",
      color: "",
      url: "",
      comment: "",
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

  // Agregar producto SIN subir archivos (nueva lógica)
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

    // Obtener los valores del formulario
    const values = form.getValues();
    const newProduct: Producto = {
      name: values.name,
      quantity: values.quantity,
      size: values.size,
      color: values.color,
      url: values.url || "",
      comment: values.comment || "",
      weight: values.weight || 0,
      volume: values.volume || 0,
      number_of_boxes: values.number_of_boxes || 0,
      attachments: [], // Vacío por ahora, se llenará al enviar
      files: selectedFiles, // Guardar archivos originales
    };

    // Agregar el producto a la lista
    setProductos((prev) => [...prev, newProduct]);

    // Resetear el formulario y los archivos
    form.reset();
    setResetCounter((prev) => prev + 1);
    setSelectedFiles([]);

    toast.success("Producto agregado correctamente");
  };

  // Enviar cotización completa (nueva lógica)
  const createQuotationMut = useCreateQuotation();

  const handleEnviar = async () => {
    if (productos.length === 0) {
      toast.error("No hay productos para enviar");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Recopilar TODOS los archivos de TODOS los productos
      const allFiles: File[] = [];
      const fileIndexMap: {
        [productIndex: number]: { start: number; count: number };
      } = {};

      productos.forEach((producto, productIndex) => {
        const startIndex = allFiles.length;
        allFiles.push(...producto.files);
        fileIndexMap[productIndex] = {
          start: startIndex,
          count: producto.files.length,
        };
      });

      console.log("Archivos totales a subir:", allFiles.length);

      // 2. Subir TODOS los archivos a AWS
      let allUploadedUrls: string[] = [];
      if (allFiles.length > 0) {
        const uploadResponse = await uploadMultipleFiles(allFiles);
        allUploadedUrls = uploadResponse.urls;
        console.log("URLs obtenidas:", allUploadedUrls);
      }

      // 3. Distribuir las URLs a cada producto según corresponda
      const productosConUrls = productos.map((producto, productIndex) => {
        const { start, count } = fileIndexMap[productIndex];
        const productUrls = allUploadedUrls.slice(start, start + count);

        return {
          name: producto.name,
          quantity: producto.quantity,
          size: producto.size,
          color: producto.color,
          url: producto.url,
          comment: producto.comment,
          weight: producto.weight,
          volume: producto.volume,
          number_of_boxes: producto.number_of_boxes,
          attachments: productUrls, // URLs distribuidas
        };
      });

      console.log("Productos con URLs:", productosConUrls);

      // 4. Enviar al hook de cotización
      createQuotationMut.mutate(
        { data: { products: productosConUrls, service_type: service } },
        {
          onSuccess: () => {
            setIsLoading(false);
            // Limpiar productos después del envío exitoso
            setProductos([]);
            navigate("/mis-cotizaciones");
          },
          onError: (error) => {
            setIsLoading(false);
            console.error("Error al enviar cotización:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error durante el proceso de envío:", error);
      toast.error("Error al procesar los archivos");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Productos actuales:", productos);
  }, [productos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      {/* Top Navigation Bar */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full  px-4 py-4 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center space-x-4 ">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Cotización de productos
              </h1>
            </div>
          </div>
          <div className="rounded-md flex items-center gap-2 ">
            <h3 className="text-sm font-normal text-gray-900">
              Tipo de servicio :
            </h3>
            <Select
              onValueChange={(value) => setService(value)}
              defaultValue={service}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {servicios.map((servicio) => (
                  <SelectItem key={servicio.id} value={servicio.value}>
                    {servicio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="w-full  px-4 p-2">
        <div className="grid grid-cols-1  gap-6">
          <div className="overflow-hidden rounded-md border bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between">
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
                    <div className="grid grid-cols-1  gap-4">
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
                          {/*<FormField
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
                          />*/}
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
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 1
                                        : Number(e.target.value);
                                    field.onChange(value);
                                  }}
                                  onBlur={() => {
                                    form.clearErrors("quantity");
                                  }}
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
                  Productos Cotizados ({productos.length})
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
                <Button
                  disabled={isLoading || productos.length === 0}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full text-lg shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Enviar ({productos.length} producto
                  {productos.length !== 1 ? "s" : ""})
                </Button>
              }
              title="Confirmar envío de cotización"
              description={`¿Está seguro de enviar la cotización con ${
                productos.length
              } producto${productos.length !== 1 ? "s" : ""}?`}
              confirmText="Enviar"
              cancelText="Cancelar"
              onConfirm={handleEnviar}
            />
          </div>
        </div>
      </div>

      {/* Modal de carga */}
      <SendingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </div>
  );
}
