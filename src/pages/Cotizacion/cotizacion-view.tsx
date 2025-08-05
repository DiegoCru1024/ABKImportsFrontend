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

import { Label } from "@/components/ui/label";
import { productoSchema } from "@/pages/Cotizacion/utils/schema";
import { columnasCotizacion } from "@/pages/Cotizacion/components/table/columnasCotizacion";
import { servicios } from "@/pages/Cotizacion/components/data/static";

export default function CotizacionView() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<any[]>([]);
  const [service, setService] = useState("Pendiente");
  const [resetCounter, setResetCounter] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  //* Hook para enviar cotización
  const createQuotationMut = useCreateQuotation();

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

  //* Función para eliminar producto
  const handleEliminar = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  //* Función para agregar producto
  const handleAgregar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar formulario antes de proceder
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    // Validar que haya al menos un archivo antes de proceder
    if (selectedFiles.length === 0) {
      toast.error(
        "Por favor, adjunte al menos un archivo antes de agregar el producto."
      );
      return;
    }

    // Obtener los valores del formulario
    const values = form.getValues();
    const newProduct: any = {
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

  //* Función para enviar cotización
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

      console.log(JSON.stringify(productosConUrls, null, 2));

      // 4. Enviar al hook de cotización
      createQuotationMut.mutate(
        { data: { products: productosConUrls, service_type: service } },
        {
          onSuccess: () => {
            setIsLoading(false);
            //*Limpiar productos después del envío exitoso
            setProductos([]);
            //*Esperar 3 segundos y luego redirigir
            setTimeout(() => {
              navigate("/dashboard/mis-cotizaciones");
            }, 3000);
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

  //* Columnas de la tabla
  const columns = columnasCotizacion({ handleEliminar });

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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Cotización de productos
              </h1>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Cotiza los productos que deseas enviar, y envíalos para que los
                revisemos y te ofrezcamos el mejor precio.
              </p>
            </div>
          </div>
          <div className="rounded-md flex items-center gap-2 ">
            <h3 className="text-sm font-semibold dark:text-white">
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
                {servicios.map(
                  (servicio: { id: number; value: string; label: string }) => (
                    <SelectItem key={servicio.id} value={servicio.value}>
                      {servicio.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="w-full  p-2">
        <div className="grid grid-cols-1  gap-6">
          <div className="overflow-hidden rounded-sm ">
            {/* Formulario */}
            <Form {...form}>
              <form onSubmit={handleAgregar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6   p-6">
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
                                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">
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

                <div className="space-y-4 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-orange-500" />
                    <Label className="text-sm font-medium text-gray-700 dark:text-white">
                      Archivos
                    </Label>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <FileUploadComponent
                      onFilesChange={setSelectedFiles}
                      resetCounter={resetCounter}
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full px-8 
                       py-2 shadow-md transition-all duration-200 transform hover:scale-105 animate-in fade-in-0 zoom-in-95"
                      type="submit"
                      title="Agregar Producto"
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
            <div className="overflow-hidden rounded-sm bg-white dark:bg-gray-900">
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h3 className="flex items-center font-semibold text-gray-900 dark:text-white">
                  <PackageOpen className="mr-2 h-5 w-5 text-orange-500" />
                  <span className="text-gray-900 dark:text-white">
                    Productos Cotizados ({productos.length})
                  </span>
                </h3>
              </div>
              <div className="w-full overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-900">
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
                  className="bg-orange-500 hover:bg-orange-600 animate-pulse text-white px-8 py-2 rounded-full  shadow-md flex items-center gap-2 disabled:opacity-50"
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
