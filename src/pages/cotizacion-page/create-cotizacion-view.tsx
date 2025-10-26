import {
  Box,
  Plus,
  Send,
  File,
  PackageOpen,
  Loader2,
  Edit2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { useCreateQuotation } from "@/hooks/use-quation";
import { uploadMultipleFiles } from "@/api/fileUpload";
import { toast } from "sonner";
import SendingModal from "@/components/sending-modal";
import { useNavigate } from "react-router-dom";

import { Label } from "@/components/ui/label";
import { servicios } from "@/pages/cotizacion-page/components/data/static";
import { VariantRow } from "./components/ui/variant-row";
import { ProductSummary } from "./components/ui/product-summary";
import { ProductsTable } from "./components/table/products-table";
import type {
  ProductVariant,
  ProductWithVariants,
} from "./utils/types/local.types";

import { productSchema } from "./utils/types/schemas";
import { toAPI } from "./utils/types/mappers";

export default function CreateCotizacionView() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductWithVariants[]>([]);
  const [service, setService] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para las variantes
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: Date.now().toString(),
      size: "",
      presentation: "",
      model: "",
      color: "",
      quantity: 0,
      attachments: [],
      files: [],
    },
  ]);

  //* Hook para enviar cotización
  const createQuotationMut = useCreateQuotation();

  type FormValues = z.infer<typeof productSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      url: "",
      comment: "",
      quantityTotal: 0,
      weight: 0,
      volume: 0,
      number_of_boxes: 0,
      variants: [
        {
          id: Date.now().toString(),
          size: "",
          presentation: "",
          model: "",
          color: "",
          quantity: 0,
          attachments: [],
        },
      ],
    },
  });

  // Funciones para manejar variantes
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      size: "",
      presentation: "",
      model: "",
      color: "",
      quantity: 0,
      attachments: [],
      files: [],
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter((variant) => variant.id !== id));
    }
  };

  const updateVariant = (
    id: string,
    field: keyof ProductVariant,
    value: string | number | File[] | string[]
  ) => {
    setVariants(
      variants.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  const getTotalQuantity = () => {
    return variants.reduce((total, variant) => total + variant.quantity, 0);
  };

  //* Función para eliminar producto
  const handleEliminar = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  //* Función para editar producto
  const handleEditar = (index: number) => {
    console.log("Se dio click al botón de editar");
    const producto = productos[index];

    // Cargar datos del producto en el formulario
    form.setValue("name", producto.name);
    form.setValue("url", producto.url || "");
    form.setValue("comment", producto.comment || "");
    form.setValue("weight", producto.weight || 0);
    form.setValue("volume", producto.volume || 0);
    form.setValue("number_of_boxes", producto.number_of_boxes || 0);

    // Establecer variantes preservando los attachments y regenerando IDs
    const variantesConNuevosIds = (producto.variants || []).map((variant) => ({
      ...variant,
      id: `${Date.now()}-${Math.random()}`, // Nuevo ID único para forzar re-render
      //files: va, // Reset files (solo mantenemos attachments existentes)
    }));

    form.setValue("variants", variantesConNuevosIds);
    setVariants(variantesConNuevosIds);

    // Establecer modo edición
    setEditingIndex(index);
    setIsEditing(true);
  };

  //* Función para cancelar edición
  const handleCancelarEdicion = () => {
    form.reset();
    setVariants([
      {
        id: Date.now().toString(),
        size: "",
        presentation: "",
        model: "",
        color: "",
        quantity: 0,
        attachments: [],
        files: [],
      },
    ]);
    setEditingIndex(null);
    setIsEditing(false);
  };

  //* Función para agregar o actualizar producto
  const handleAgregar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar que haya al menos una variante con cantidad mayor a 0
    const totalQuantity = getTotalQuantity();
    if (totalQuantity === 0) {
      toast.error("Debe agregar al menos una variante con cantidad mayor a 0.");
      return;
    }

    // Validar formulario antes de proceder
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    // Validar que cada variante con cantidad > 0 tenga al menos una imagen
    const variantsWithQuantity = variants.filter((v) => v.quantity > 0);
    const variantsWithoutImages = variantsWithQuantity.filter(
      (v) =>
        (!v.files || v.files.length === 0) &&
        (!v.attachments || v.attachments.length === 0)
    );

    if (variantsWithoutImages.length > 0) {
      toast.error("Cada variante con cantidad debe tener al menos una imagen.");
      return;
    }

    // Obtener los valores del formulario
    const values = form.getValues();
    const productData: ProductWithVariants = {
      name: values.name,
      url: values.url || "",
      comment: values.comment || "",
      quantityTotal: totalQuantity,
      weight: values.weight || 0,
      volume: values.volume || 0,
      number_of_boxes: values.number_of_boxes || 0,
      variants: variants
        .filter((v) => v.quantity > 0)
        .map((v) => ({
          ...v,
          // Asegurar que attachments y files estén presentes
          attachments: v.attachments || [],
          files: v.files || [],
        })),
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
    // Resetear el formulario y las variantes
    form.reset();
    setVariants([
      {
        id: Date.now().toString(),
        size: "",
        presentation: "",
        model: "",
        color: "",
        quantity: 0,
        attachments: [],
        files: [],
      },
    ]);
  };

  useEffect(() => {
    console.log(
      "Este es el valor de los productos dentro del componente padre",
      productos
    );
  }, [productos]);

  //* Función para subir archivos en lotes de 10
  const uploadFilesInBatches = async (files: File[]): Promise<string[]> => {
    const batchSize = 10;
    const allUrls: string[] = [];

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(
        `Subiendo lote ${Math.floor(i / batchSize) + 1}: ${
          batch.length
        } archivos`
      );

      try {
        const uploadResponse = await uploadMultipleFiles(batch);
        allUrls.push(...uploadResponse.urls);
        console.log(
          `Lote ${Math.floor(i / batchSize) + 1} completado: ${
            uploadResponse.urls.length
          } URLs obtenidas`
        );
      } catch (error) {
        console.error(
          `Error al subir lote ${Math.floor(i / batchSize) + 1}:`,
          error
        );
        throw error;
      }
    }

    return allUrls;
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
      // 1. Subir archivos de cada variante y actualizar productos
      const productosConUrls = await Promise.all(
        productos.map(async (producto) => {
          console.log(`Procesando producto: ${producto.name}`);

          // Procesar cada variante para subir sus imágenes
          const variantsConUrls = await Promise.all(
            producto.variants.map(async (variant) => {
              let attachments: string[] = variant.attachments || [];

              // Subir archivos de la variante si existen
              if (variant.files && variant.files.length > 0) {
                console.log(
                  `Variante tiene ${variant.files.length} archivos, subiendo...`
                );

                const newUrls =
                  variant.files.length > 10
                    ? await uploadFilesInBatches(variant.files)
                    : (await uploadMultipleFiles(variant.files)).urls;

                attachments = [...attachments, ...newUrls];

                console.log(
                  `Variante: ${attachments.length} URLs totales obtenidas`
                );
              }

              // Retornar variante con attachments actualizados (sin files)
              return {
                ...variant,
                attachments,
                files: undefined, // Remover files ya que ya fueron subidos
              };
            })
          );

          // Retornar producto con variantes actualizadas
          return {
            ...producto,
            variants: variantsConUrls,
          };
        })
      );

      // 2. Convertir productos a formato de API usando el mapper
      const payload = toAPI.quotation(productosConUrls, service, saveAsDraft);

      console.log("Payload a enviar:", JSON.stringify(payload, null, 2));

      // 3. Enviar cotización al backend
      /*const response = await createQuotationMut.mutateAsync({ data: payload });

      if (response) {
        setTimeout(() => {
          navigate(`/dashboard/mis-cotizaciones`);
        }, 1200);
      } else {
        toast.error("Error al crear la cotización");
      }*/
    } catch (error) {
      console.error(
        "Error durante el proceso de " +
          (saveAsDraft ? "guardado" : "envío") +
          ":",
        error
      );
      toast.error("Error al procesar los archivos");
    } finally {
      setIsLoading(false);
    }
  };

  //* Función para enviar cotización (wrapper)
  const handleEnviar = () => handleSubmitQuotation(false);

  //* Función para guardar como borrador (wrapper)
  const handleGuardarBorrador = () => handleSubmitQuotation(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-6 py-6 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors duration-200 shadow-lg">
              <Box className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cotización de productos
              </h1>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                Cotiza los productos que deseas enviar, y envíalos para que los
                revisemos y te ofrezcamos el mejor precio.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg text-orange-600 font-semibold dark:text-white">
              TIPO DE SERVICIO:
            </h3>
            <Select
              onValueChange={(value) => setService(value)}
              defaultValue={service}
            >
              <SelectTrigger className="w-48">
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

      <div className="w-full p-6">
        {/* Add Product Form */}
        <Card className="shadow-lg border-1 bg-card p-6">
          <CardContent>
            {/* Indicador de modo edición */}
            {isEditing && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                    <Edit2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-lg">
                    Editando producto
                  </span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 ml-11">
                  Está editando el producto. Los cambios se aplicarán al
                  guardar.
                </p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={handleAgregar} className="space-y-8">
                {/* Grid: Formulario + Resumen */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Columna izquierda: Formulario */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Información básica del producto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nombre*/}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="flex items-center gap-2 font-semibold text-base text-foreground">
                              <span className="text-xl text-primary">🔍</span>
                              Nombre del Producto
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ej: Anillo de plata"
                                className="border-input bg-background h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Url*/}
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <Label
                              htmlFor="url"
                              className="flex items-center gap-2 text-base font-semibold text-foreground"
                            >
                              <span className="text-primary">🔗</span>
                              URL del Producto
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                id="url"
                                placeholder="https://temu.com/producto/123"
                                className="border-input bg-background h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <Label
                            htmlFor="comment"
                            className="flex items-center gap-2 text-base font-semibold text-foreground"
                          >
                            <span className="text-primary">💬</span>
                            Comentarios
                          </Label>
                          <FormControl>
                            <Textarea
                              {...field}
                              id="comment"
                              placeholder="Ej: Producto en buen estado, especificaciones especiales, etc."
                              className="border-input bg-background min-h-[100px] resize-none"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campos adicionales para Almacenaje de Mercancia */}
                    {service === "Almacenaje de Mercancia" && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <span className="text-xl">📦</span>
                          Información de Almacenaje
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="flex items-center gap-2 text-orange-600 font-medium text-sm">
                                  <span className="text-lg">⚖️</span>
                                  Peso (Kg)
                                </Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    className="mt-2 h-11 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="volume"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="flex items-center gap-2 text-orange-600 font-medium text-sm">
                                  <span className="text-lg">📦</span>
                                  Volumen
                                </Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    className="mt-2 h-11 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="number_of_boxes"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="flex items-center gap-2 text-orange-600 font-medium text-sm">
                                  <span className="text-lg">📦</span>
                                  Nro. cajas
                                </Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    className="mt-2 h-11 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Columna derecha: Resumen */}
                  <div className="lg:col-span-1">
                    <ProductSummary
                      variants={variants}
                      productCount={productos.length}
                    />
                  </div>
                </div>

                {/* Sección de Variantes */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <span className="text-primary">🎨</span> Variantes del
                      Producto
                    </Label>
                    <Button
                      type="button"
                      onClick={addVariant}
                      variant="default"
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Variante
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <VariantRow
                        key={variant.id}
                        variant={variant}
                        index={index}
                        canDelete={variants.length > 1}
                        onUpdate={updateVariant}
                        onDelete={removeVariant}
                      />
                    ))}
                  </div>
                </div>

                {/* Botones de acción del formulario */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelarEdicion}
                      className="text-gray-600 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 px-8 py-3 rounded-lg transition-all duration-200"
                    >
                      Cancelar Edición
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                    disabled={!form.watch("name")?.trim()}
                  >
                    {isEditing ? (
                      <>
                        <Edit2 className="w-5 h-5" />
                        Actualizar Producto
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
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
        <div className="w-full mt-6">
          <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <h3 className="flex items-center font-bold text-gray-900 dark:text-white text-lg">
                <PackageOpen className="mr-3 h-6 w-6 text-orange-500" />
                <span className="text-gray-900 dark:text-white">
                  Productos Cotizados ({productos.length})
                </span>
              </h3>
            </div>
            <div className="w-full px-6 py-4 bg-white dark:bg-gray-900">
              <ProductsTable
                products={productos}
                onEdit={handleEditar}
                onDelete={handleEliminar}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción finales */}
        <div className="flex justify-end gap-4 pt-8">
          {/* Botón Guardar como borrador */}
          <Button
            variant="secondary"
            onClick={handleGuardarBorrador}
            disabled={isLoading || productos.length === 0}
            className="bg-amber-700 hover:bg-amber-600 text-white px-10 py-4 rounded-xl shadow-lg flex items-center gap-3 disabled:opacity-50 transition-all duration-200 hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <File className="w-5 h-5" />
            )}
            Guardar como borrador
          </Button>

          {/* Botón Enviar con confirmación */}
          <ConfirmDialog
            trigger={
              <Button
                disabled={isLoading || productos.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-xl shadow-lg flex items-center gap-3 disabled:opacity-50 transition-all duration-200 hover:shadow-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
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

      {/* Modal de carga */}
      <SendingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </div>
  );
}
