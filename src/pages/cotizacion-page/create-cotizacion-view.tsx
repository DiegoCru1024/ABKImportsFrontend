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
  Upload,
  X,
  Edit2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import FileUploadComponent from "@/components/comp-552";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCreateQuotation, useSubmitDraft } from "@/hooks/use-quation";
import { uploadMultipleFiles } from "@/api/fileUpload";
import { toast } from "sonner";
import SendingModal from "@/components/sending-modal";
import { useNavigate } from "react-router-dom";

import { Label } from "@/components/ui/label";
import { productoSchema } from "@/pages/cotizacion-page/utils/schema";
import { columnasCotizacion } from "@/pages/cotizacion-page/components/table/columnasCotizacion";
import { servicios } from "@/pages/cotizacion-page/components/data/static";

export default function CreateCotizacionView() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<any[]>([]);
  const [service, setService] = useState("Pendiente");
  const [resetCounter, setResetCounter] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  //* Función para editar producto
  const handleEditar = (index: number) => {
    const producto = productos[index];

    // Cargar datos del producto en el formulario
    form.setValue("name", producto.name);
    form.setValue("quantity", producto.quantity);
    form.setValue("size", producto.size);
    form.setValue("color", producto.color);
    form.setValue("url", producto.url);
    form.setValue("comment", producto.comment);
    form.setValue("weight", producto.weight || 0);
    form.setValue("volume", producto.volume || 0);
    form.setValue("number_of_boxes", producto.number_of_boxes || 0);

    // Establecer archivos seleccionados
    setSelectedFiles(producto.files || []);

    // Establecer modo edición
    setEditingIndex(index);
    setIsEditing(true);
  };

  //* Función para cancelar edición
  const handleCancelarEdicion = () => {
    form.reset();
    setSelectedFiles([]);
    setEditingIndex(null);
    setIsEditing(false);
    setResetCounter((prev) => prev + 1);
  };

  //* Función para agregar o actualizar producto
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
        "Por favor, adjunte al menos un archivo antes de " +
          (isEditing ? "actualizar" : "agregar") +
          " el producto."
      );
      return;
    }

    // Obtener los valores del formulario
    const values = form.getValues();
    const productData: any = {
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

    if (isEditing && editingIndex !== null) {
      // Actualizar producto existente
      setProductos((prev) =>
        prev.map((producto, index) =>
          index === editingIndex ? productData : producto
        )
      );
      toast.success("Producto actualizado correctamente");

      // Salir del modo edición
      setEditingIndex(null);
      setIsEditing(false);
    } else {
      // Agregar nuevo producto
      setProductos((prev) => [...prev, productData]);
      toast.success("Producto agregado correctamente");
    }

    // Resetear el formulario y los archivos
    form.reset();
    setResetCounter((prev) => prev + 1);
    setSelectedFiles([]);
  };

  //* Función para enviar o guardar como borrador cotización
  const handleSubmitQuotation = async (saveAsDraft: boolean = false) => {
    if (productos.length === 0) {
      toast.error(
        "No hay productos para " + (saveAsDraft ? "guardar" : "enviar")
      );
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

      const dataToSend = {
        products: productosConUrls,
        service_type: service,
        saveAsDraft: saveAsDraft,
      };

      console.log("Datos a enviar:", JSON.stringify(dataToSend, null, 2));

      const response = await createQuotationMut.mutateAsync({
        data: dataToSend,
      });
      if (response) {
        toast.success("Cotización creada exitosamente. Redirigiendo...");
        setTimeout(() => {
          navigate(`/dashboard/mis-cotizaciones`);
        }, 1200);
      } else {
        toast.error("Error al crear la cotización");
      }
    } catch (error) {
      console.error(
        "Error durante el proceso de " +
          (saveAsDraft ? "guardado" : "envío") +
          ":",
        error
      );
      toast.error("Error al procesar los archivos");
      setIsLoading(false);
    }
  };

  //* Función para enviar cotización (wrapper)
  const handleEnviar = () => handleSubmitQuotation(false);

  //* Función para guardar como borrador (wrapper)
  const handleGuardarBorrador = () => handleSubmitQuotation(true);

  useEffect(() => {
    console.log("Productos actuales:", productos);
  }, [productos]);

  //* Columnas de la tabla
  const columns = columnasCotizacion({ handleEliminar, handleEditar });

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

      <div className="w-full p-2">
        <div className="grid grid-cols-1 gap-6">
          {/* Add Product Form */}
          <Card>
            <CardContent className="p-6">
              {/* Indicador de modo edición */}
              {isEditing && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Edit2 className="h-5 w-5" />
                    <span className="font-medium">Editando producto</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Está editando el producto. Los cambios se aplicarán al
                    guardar.
                  </p>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={handleAgregar}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-4 mb-6">
                    <div>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="flex items-center gap-2 text-orange-600 font-medium">
                              <span className="text-lg">🔍</span>
                              Nombre del Producto
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: Monitor, Teclado, Mouse..."
                                className="mt-1"
                                
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="flex items-center gap-2 text-orange-600 font-medium">
                              <span className="text-lg">#</span>
                              Cantidad
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                className="mt-1"
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 1
                                      : Number(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="flex items-center gap-2 text-orange-600 font-medium">
                              <span className="text-lg">📏</span>
                              Tamaño
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: 10x10x10 cm"
                                className="mt-1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="flex items-center gap-2 text-orange-600 font-medium">
                              <span className="text-lg">🎨</span>
                              Color
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: Rojo, Azul, Verde..."
                                className="mt-1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="flex items-center gap-2 text-orange-600 font-medium">
                              <span className="text-lg">🔗</span>
                              URL
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://temu.com/producto/123"
                                className="mt-1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="flex items-center gap-2 text-orange-600 font-medium">
                              <span className="text-lg">💬</span>
                              Comentario
                            </Label>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Ej: Producto en buen estado, etc."
                                className="mt-1"
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Campos adicionales para Almacenaje de Mercancia */}
                  {service === "Almacenaje de Mercancia" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="flex items-center gap-2 text-orange-600 font-medium">
                                <span className="text-lg">⚖️</span>
                                Peso (Kg)
                              </Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  className="mt-1"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <FormField
                          control={form.control}
                          name="volume"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="flex items-center gap-2 text-orange-600 font-medium">
                                <span className="text-lg">📦</span>
                                Volumen
                              </Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  className="mt-1"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <FormField
                          control={form.control}
                          name="number_of_boxes"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="flex items-center gap-2 text-orange-600 font-medium">
                                <span className="text-lg">📦</span>
                                Nro. cajas
                              </Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  className="mt-1"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* File Upload Section */}
                  <div className="mb-6">
                    <Label className="flex items-center gap-2 text-orange-600 font-medium mb-3">
                      <span className="text-lg">📁</span>
                      Imagenes
                    </Label>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <FileUploadComponent
                        onFilesChange={setSelectedFiles}
                        resetCounter={resetCounter}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelarEdicion}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      disabled={!form.watch("name")?.trim()}
                    >
                      {isEditing ? (
                        <>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Actualizar Producto
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Producto
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

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
                    pageSize: productos?.length || 100,
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

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 mt-8">
            {/* Botón Guardar como borrador */}
            <Button
              variant="secondary"
              onClick={handleGuardarBorrador}
              disabled={isLoading || productos.length === 0}
              className="bg-orange-500 hover:bg-orange-600  text-white px-8 py-2 rounded-full shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <File className="w-4 h-4" />
              )}
              Guardar como borrador
            </Button>

            {/* Botón Enviar con confirmación */}
            <ConfirmDialog
              trigger={
                <Button
                  disabled={isLoading || productos.length === 0}
                  className="bg-orange-500 hover:bg-orange-600  text-white px-8 py-2 rounded-full shadow-md flex items-center gap-2 disabled:opacity-50"
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
