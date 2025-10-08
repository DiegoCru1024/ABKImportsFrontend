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
  ArrowLeft,
  Undo2,
  Minus,
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
import {
  useGetQuotationById,
  usePatchQuotation,
  useSubmitDraft,
} from "@/hooks/use-quation";
import { uploadMultipleFiles } from "@/api/fileUpload";
import { toast } from "sonner";
import SendingModal from "@/components/sending-modal";

import { Label } from "@/components/ui/label";
import {
  productoSchema,
  type ProductVariant,
  type ProductWithVariants,
} from "@/pages/cotizacion-page/utils/schema";
import { columnasCotizacion } from "@/pages/cotizacion-page/components/table/columnasCotizacion";
import { servicios } from "@/pages/cotizacion-page/components/data/static";
import type { QuotationDTO } from "@/pages/cotizacion-page/utils/interface";
import { useNavigate } from "react-router-dom";

interface EditCotizacionViewProps {
  quotationId: string;
  onBack: () => void;
  statusQuotation: string;
}

export default function EditCotizacionView({
  quotationId,
  onBack,
  statusQuotation,
}: EditCotizacionViewProps) {
  const [productos, setProductos] = useState<
    (ProductWithVariants & { files?: File[] })[]
  >([]);
  const [service, setService] = useState("pending");
  const [resetCounter, setResetCounter] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tableKey, setTableKey] = useState(0); // Para forzar re-renderización de la tabla
  //Navegacion
  const navigate = useNavigate();

  // Estados para las variantes
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: Date.now().toString(),
      size: "",
      presentation: "",
      model: "",
      color: "",
      quantity: 0,
    },
  ]);

  console.log("statusQuotation", statusQuotation);

  //* Hook para obtener cotización por ID
  const { data: quotationData, isLoading: loadingQuotation } =
    useGetQuotationById(quotationId);

  //* Hook para actualizar cotización
  const patchQuotationMut = usePatchQuotation(quotationId);
  const submitDraftMut = useSubmitDraft(quotationId);
  const form = useForm<z.infer<typeof productoSchema>>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      name: "",
      url: "",
      comment: "",
      quantityTotal: 0, // Agregar quantityTotal que falta
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
        },
      ],
      attachments: [],
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
    };
    const updatedVariants = [...variants, newVariant];
    setVariants(updatedVariants);

    // Actualizar quantityTotal en el formulario
    const totalQuantity = updatedVariants.reduce(
      (total, variant) => total + variant.quantity,
      0
    );
    form.setValue("quantityTotal", totalQuantity);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      const updatedVariants = variants.filter((variant) => variant.id !== id);
      setVariants(updatedVariants);

      // Actualizar quantityTotal en el formulario
      const totalQuantity = updatedVariants.reduce(
        (total, variant) => total + variant.quantity,
        0
      );
      form.setValue("quantityTotal", totalQuantity);
    }
  };

  const updateVariant = (
    id: string,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    const updatedVariants = variants.map((variant) =>
      variant.id === id ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);

    // Actualizar quantityTotal en el formulario cuando cambie la cantidad
    if (field === "quantity") {
      const totalQuantity = updatedVariants.reduce(
        (total, variant) => total + variant.quantity,
        0
      );
      form.setValue("quantityTotal", totalQuantity);
    }
  };

  const getTotalQuantity = () => {
    const total = variants.reduce(
      (total, variant) => total + variant.quantity,
      0
    );
    console.log(
      "Calculando cantidad total - Variantes:",
      variants,
      "Total:",
      total
    );
    return total;
  };

  // Cargar datos de la cotización cuando se obtienen
  useEffect(() => {
    if (quotationData) {
      console.log("Datos de cotización cargados:", quotationData);

      // Establecer tipo de servicio
      setService(quotationData.service_type || "Pendiente");

      // Mapear productos de la cotización
      const mappedProducts = quotationData.products.map((product: any) => ({
        name: product.name,
        url: product.url || "",
        comment: product.comment || "",
        weight: Number(product.weight) || 0,
        volume: Number(product.volume) || 0,
        number_of_boxes: product.number_of_boxes || 0,
        quantityTotal: product.quantity || 0, // Agregar quantityTotal
        variants: product.variants?.map((v: any) => ({
          id: v.variantId || v.id || Date.now().toString(),
          size: v.size || "",
          presentation: v.presentation || "",
          model: v.model || "",
          color: v.color || "",
          quantity: v.quantity || 0,
        })) || [
          {
            id: Date.now().toString(),
            size: product.size || "",
            presentation: "",
            model: "",
            color: product.color || "",
            quantity: product.quantity || 0,
          },
        ], // Convertir datos legacy a formato de variantes
        attachments: product.attachments || [],
        files: [], // Los archivos originales no están disponibles, solo las URLs
      }));

      setProductos(mappedProducts);
    }
  }, [quotationData]);

  //* Función para eliminar producto
  const handleEliminar = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
    // Forzar re-renderización de la tabla
    setTableKey((prev) => prev + 1);
  };

  //* Función para editar producto
  const handleEditar = (index: number) => {
    const producto = productos[index];
    console.log("Editando producto:", producto);

    // Cargar datos del producto en el formulario
    form.setValue("name", producto.name);
    form.setValue("url", producto.url || "");
    form.setValue("comment", producto.comment || "");
    form.setValue("weight", producto.weight || 0);
    form.setValue("volume", producto.volume || 0);
    form.setValue("number_of_boxes", producto.number_of_boxes || 0);
    form.setValue("variants", producto.variants || []);

    // Establecer variantes
    const productVariants = producto.variants || [];
    console.log("Estableciendo variantes:", productVariants);
    setVariants(productVariants);

    // Calcular y establecer quantityTotal
    const totalQuantity = productVariants.reduce(
      (total, variant) => total + variant.quantity,
      0
    );
    form.setValue("quantityTotal", totalQuantity);

    // Establecer archivos seleccionados (vacío porque no tenemos los archivos originales)
    setSelectedFiles([]);

    // Establecer modo edición
    setEditingIndex(index);
    setIsEditing(true);

    console.log("Modo edición activado para índice:", index);
  };

  //* Función para cancelar edición
  const handleCancelarEdicion = () => {
    form.reset();
    setSelectedFiles([]);
    const defaultVariants = [
      {
        id: Date.now().toString(),
        size: "",
        presentation: "",
        model: "",
        color: "",
        quantity: 0,
      },
    ];
    setVariants(defaultVariants);

    // Actualizar quantityTotal en el formulario
    form.setValue("quantityTotal", 0);

    setEditingIndex(null);
    setIsEditing(false);
    setResetCounter((prev) => prev + 1);
  };

  //* Función para agregar o actualizar producto
  const handleAgregar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("=== INICIO DE handleAgregar ===");
    console.log("Evento submit capturado");

    // Validar que haya al menos una variante con cantidad mayor a 0
    const totalQuantityValidation = getTotalQuantity();
    console.log("Cantidad total validada:", totalQuantityValidation);

    if (totalQuantityValidation === 0) {
      console.log("ERROR: Cantidad total es 0, deteniendo ejecución");
      toast.error("Debe agregar al menos una variante con cantidad mayor a 0.");
      return;
    }

    console.log("Validación de cantidad total pasada");

    // Validar formulario antes de proceder
    console.log("Iniciando validación del formulario...");
    const isValid = await form.trigger();
    console.log("Resultado de validación del formulario:", isValid);

    if (!isValid) {
      console.log(
        "ERROR: Validación del formulario falló, deteniendo ejecución"
      );

      // Obtener los errores específicos del formulario
      const formErrors = form.formState.errors;
      console.log("Errores del formulario:", formErrors);

      // Mostrar valores actuales del formulario para debugging
      const currentValues = form.getValues();
      console.log(
        "Valores actuales del formulario:",
        JSON.stringify(currentValues, null, 2)
      );

      // Mostrar toast con los errores específicos
      const errorMessages = Object.entries(formErrors)
        .map(([field, error]) => {
          return `${field}: ${error?.message || "Campo requerido"}`;
        })
        .join(", ");

      toast.error(`Errores de validación: ${errorMessages}`);
      return;
    }

    console.log("Validación del formulario pasada");

    // Para productos editados, permitir sin archivos (mantener los existentes)
    // Para productos nuevos, requerir archivos
    console.log(
      "Verificando archivos - isEditing:",
      isEditing,
      "selectedFiles.length:",
      selectedFiles.length
    );

    if (!isEditing && selectedFiles.length === 0) {
      console.log(
        "ERROR: No hay archivos seleccionados para producto nuevo, deteniendo ejecución"
      );
      toast.error(
        "Por favor, adjunte al menos un archivo antes de agregar el producto."
      );
      return;
    }

    console.log("Validación de archivos pasada");

    // Obtener los valores del formulario
    const values = form.getValues();
    const totalQuantityForProduct = getTotalQuantity();

    console.log("=== DEBUGGING ACTUALIZACIÓN DE PRODUCTO ===");
    console.log("Editando producto - Valores del formulario:", values);
    console.log("Editando producto - Variantes actuales:", variants);
    console.log(
      "Editando producto - Cantidad total calculada:",
      totalQuantityForProduct
    );
    console.log(
      "Estado actual - isEditing:",
      isEditing,
      "editingIndex:",
      editingIndex
    );
    console.log("Productos antes de procesar:", productos);

    const productData: ProductWithVariants & { files?: File[] } = {
      name: values.name,
      url: values.url || "",
      comment: values.comment || "",
      weight: values.weight || 0,
      volume: values.volume || 0,
      number_of_boxes: values.number_of_boxes || 0,
      quantityTotal: totalQuantityForProduct, // Agregar quantityTotal calculado
      variants: variants.filter((v) => v.quantity > 0), // Solo incluir variantes con cantidad > 0
      attachments: [], // Se llenará al enviar
      files: selectedFiles, // Guardar archivos originales
    };

    console.log("Editando producto - ProductData a guardar:", productData);

    if (isEditing && editingIndex !== null) {
      console.log("Actualizando producto en índice:", editingIndex);
      console.log("Productos antes de actualizar:", productos);

      // Actualizar producto existente usando una función más robusta
      setProductos((prev) => {
        const updatedProductos = [...prev]; // Crear una copia del array
        updatedProductos[editingIndex] = {
          ...productData,
          // Mantener attachments existentes si no hay nuevos archivos
          attachments:
            selectedFiles.length > 0 ? [] : prev[editingIndex].attachments,
        };

        console.log("Productos después de actualizar:", updatedProductos);
        return updatedProductos;
      });

      toast.success("Producto actualizado correctamente");

      // Salir del modo edición
      setEditingIndex(null);
      setIsEditing(false);

      // Forzar re-renderización de la tabla
      setTableKey((prev) => prev + 1);

      console.log("=== ACTUALIZACIÓN COMPLETADA ===");
      console.log("Nueva key de tabla:", tableKey + 1);
      console.log("Estado final - isEditing:", false, "editingIndex:", null);
    } else {
      // Agregar nuevo producto
      setProductos((prev) => [...prev, productData]);
      toast.success("Producto agregado correctamente");

      // Forzar re-renderización de la tabla
      setTableKey((prev) => prev + 1);
    }

    // Resetear el formulario y los archivos
    form.reset();
    setResetCounter((prev) => prev + 1);
    setSelectedFiles([]);
    const defaultVariants = [
      {
        id: Date.now().toString(),
        size: "",
        presentation: "",
        model: "",
        color: "",
        quantity: 0,
      },
    ];
    setVariants(defaultVariants);

    // Actualizar quantityTotal en el formulario
    form.setValue("quantityTotal", 0);
  };

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

  //* Función auxiliar para procesar productos y subir archivos
  const procesarProductos = async () => {
    return await Promise.all(
      productos.map(async (producto, productIndex) => {
        console.log(
          `Procesando producto ${productIndex + 1}: ${producto.name}`
        );

        let finalAttachments = producto.attachments || [];

        // Si hay archivos nuevos para este producto, subirlos en lotes
        if (producto.files && producto.files.length > 0) {
          console.log(
            `Producto ${producto.name} tiene ${producto.files.length} archivos nuevos`
          );

          let newUrls: string[] = [];

          // Subir archivos nuevos del producto en lotes de 10 si hay más de 10 archivos
          if (producto.files.length > 10) {
            console.log(
              `Producto ${producto.name} tiene ${producto.files.length} archivos nuevos, subiendo en lotes...`
            );
            newUrls = await uploadFilesInBatches(producto.files);
          } else {
            console.log(
              `Producto ${producto.name} tiene ${producto.files.length} archivos nuevos, subiendo en un solo lote...`
            );
            const uploadResponse = await uploadMultipleFiles(producto.files);
            newUrls = uploadResponse.urls;
          }

          finalAttachments = newUrls;
          console.log(
            `Producto ${producto.name}: ${newUrls.length} URLs nuevas obtenidas`
          );
        } else {
          console.log(
            `Producto ${producto.name}: manteniendo archivos existentes (${finalAttachments.length} URLs)`
          );
        }

        return {
          name: producto.name,
          url: producto.url || "",
          comment: producto.comment || "",
          quantityTotal: producto.quantityTotal || 0,
          weight: producto.weight || 0,
          volume: producto.volume || 0,
          number_of_boxes: producto.number_of_boxes || 0,
          variants: producto.variants.map((variant) => ({
            id: variant.id,
            size: variant.size || "",
            presentation: variant.presentation || "",
            model: variant.model || "",
            color: variant.color || "",
            quantity: variant.quantity,
          })),
          attachments: finalAttachments,
        };
      })
    );
  };

  //* Función para editar borrador (solo guarda cambios)
  const handleEditarBorrador = async () => {
    if (productos.length === 0) {
      toast.error("No hay productos para guardar");
      return;
    }

    try {
      setIsLoading(true);

      const productosConUrls = await procesarProductos();

      const dataToSend = {
        service_type: service,
        products: productosConUrls,
      };

      console.log(
        "Guardando borrador:",
        JSON.stringify(dataToSend, null, 2)
      );

      patchQuotationMut.mutate(
        { data: dataToSend },
        {
          onSuccess: () => {
            console.log("Borrador guardado exitosamente");
            console.log("Redirigiendo a mis cotizaciones en 1.2 segundos...");
            setTimeout(() => {
              console.log(
                "Ejecutando navegación a /dashboard/mis-cotizaciones"
              );
              try {
                navigate("/dashboard/mis-cotizaciones");
              } catch (error) {
                console.error(
                  "Error en navigate, usando window.location:",
                  error
                );
                window.location.href = "/dashboard/mis-cotizaciones";
              }
            }, 1200);
          },
          onError: () => toast.error("Error al guardar el borrador"),
        }
      );
    } catch (error) {
      console.error("Error durante el proceso de guardado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //* Función para enviar borrador al administrador
  const handleEnviarBorrador = async () => {
    if (productos.length === 0) {
      toast.error("No hay productos para enviar");
      return;
    }

    try {
      setIsLoading(true);

      const productosConUrls = await procesarProductos();

      const dataToSend = {
        service_type: service,
        products: productosConUrls,
      };

      console.log(
        "Enviando borrador:",
        JSON.stringify(dataToSend, null, 2)
      );

      submitDraftMut.mutate(
        { data: dataToSend },
        {
          onSuccess: () => {
            console.log("Borrador enviado exitosamente");
            console.log("Redirigiendo a mis cotizaciones en 1.2 segundos...");
            setTimeout(() => {
              console.log(
                "Ejecutando navegación a /dashboard/mis-cotizaciones"
              );
              try {
                navigate("/dashboard/mis-cotizaciones");
              } catch (error) {
                console.error(
                  "Error en navigate, usando window.location:",
                  error
                );
                window.location.href = "/dashboard/mis-cotizaciones";
              }
            }, 1200);
          },
          onError: () => toast.error("Error al enviar el borrador"),
        }
      );
    } catch (error) {
      console.error("Error durante el proceso de envío:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //* Función para actualizar cotización (estado pending)
  const handleActualizarCotizacion = async () => {
    if (productos.length === 0) {
      toast.error("No hay productos para actualizar");
      return;
    }

    try {
      setIsLoading(true);

      const productosConUrls = await procesarProductos();

      const dataToSend = {
        service_type: service,
        products: productosConUrls,
      };

      console.log(
        "Actualizando cotización:",
        JSON.stringify(dataToSend, null, 2)
      );

      patchQuotationMut.mutate(
        { data: dataToSend },
        {
          onSuccess: () => {
            console.log("Cotización actualizada exitosamente");
            console.log("Redirigiendo a mis cotizaciones en 1.2 segundos...");
            setTimeout(() => {
              console.log(
                "Ejecutando navegación a /dashboard/mis-cotizaciones"
              );
              try {
                navigate("/dashboard/mis-cotizaciones");
              } catch (error) {
                console.error(
                  "Error en navigate, usando window.location:",
                  error
                );
                window.location.href = "/dashboard/mis-cotizaciones";
              }
            }, 1200);
          },
          onError: () => toast.error("Error al actualizar la cotización"),
        }
      );
    } catch (error) {
      console.error("Error durante el proceso de actualización:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Productos actuales:", productos);
    console.log(
      "Estado de edición - isEditing:",
      isEditing,
      "editingIndex:",
      editingIndex
    );
  }, [productos, isEditing, editingIndex]);

  // Forzar re-renderización de la tabla cuando se actualiza un producto
  useEffect(() => {
    if (!isEditing && editingIndex === null) {
      // Forzar re-renderización de la tabla
      const tableElement = document.querySelector("[data-table]");
      if (tableElement) {
        tableElement.dispatchEvent(new Event("update"));
      }
    }
  }, [isEditing, editingIndex]);

  //* Columnas de la tabla
  const columns = columnasCotizacion({ handleEliminar, handleEditar });

  if (loadingQuotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2">Cargando cotización...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      {/* Top Navigation Bar */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-6 py-6 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 p-0"
                title="Atrás"
              >
                <Undo2 className="h-8 w-8 text-orange-500 hover:text-orange-600" />
              </Button>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors duration-200 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              {statusQuotation === "pending" ? (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Editar Cotización
                  </h1>
                  <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                    Edita los productos de tu cotización y actualiza la
                    información.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Editar Borrador
                  </h1>
                  <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                    Edita y envia productos de tu borrador.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg text-orange-600 font-semibold dark:text-white">
              TIPO DE SERVICIO:
            </h3>
            <Select
              onValueChange={(value) => setService(value)}
              value={service}
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
        <div className="grid grid-cols-1 gap-8">
          {/* Add Product Form */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
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
                  {/* Información básica del producto */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna izquierda - Información básica */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="flex items-center gap-2 text-orange-600 font-semibold text-base">
                                <span className="text-xl">🔍</span>
                                Nombre del Producto
                              </Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ej: Anillo de plata"
                                  className="mt-2 h-12 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="flex items-center gap-2 text-orange-600 font-semibold text-base">
                                <span className="text-xl">🔗</span>
                                URL del Producto
                              </Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="https://temu.com/producto/123"
                                  className="mt-2 h-12 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="flex items-center gap-2 text-orange-600 font-semibold text-base">
                                <span className="text-xl">💬</span>
                                Comentarios
                              </Label>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Ej: Producto en buen estado, especificaciones especiales, etc."
                                  className="mt-2 min-h-[100px] text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 resize-none"
                                  rows={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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

                    {/* Sección de Variantes */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-orange-600 flex items-center gap-2">
                          <span className="text-2xl">🎨</span>
                          Variantes del Producto
                        </h3>
                        <Button
                          type="button"
                          onClick={addVariant}
                          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                        >
                          <Plus className="w-5 h-5" />
                          Agregar Variante
                        </Button>
                      </div>

                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 grid grid-cols-12 gap-3 p-4 text-sm font-semibold text-orange-700 dark:text-orange-300">
                          <div className="col-span-2">Tamaño</div>
                          <div className="col-span-2">Presentación</div>
                          <div className="col-span-2">Modelo</div>
                          <div className="col-span-2">Color</div>
                          <div className="col-span-2">Cantidad</div>
                          <div className="col-span-2">Acciones</div>
                        </div>

                        <div className="space-y-2 p-2">
                          {variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="grid grid-cols-12 gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                            >
                              <div className="col-span-2">
                                <Input
                                  placeholder="7*7 cm"
                                  value={variant.size || ""}
                                  onChange={(e) =>
                                    updateVariant(
                                      variant.id,
                                      "size",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm h-10 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  placeholder="Pack de 10"
                                  value={variant.presentation || ""}
                                  onChange={(e) =>
                                    updateVariant(
                                      variant.id,
                                      "presentation",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm h-10 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  placeholder="Ave"
                                  value={variant.model || ""}
                                  onChange={(e) =>
                                    updateVariant(
                                      variant.id,
                                      "model",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm h-10 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  placeholder="Verde"
                                  value={variant.color || ""}
                                  onChange={(e) =>
                                    updateVariant(
                                      variant.id,
                                      "color",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm h-10 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  placeholder="5"
                                  min="0"
                                  value={variant.quantity || ""}
                                  onChange={(e) =>
                                    updateVariant(
                                      variant.id,
                                      "quantity",
                                      Number.parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="text-sm h-10 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                />
                              </div>
                              <div className="col-span-2 flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeVariant(variant.id)}
                                  disabled={variants.length === 1}
                                  className="w-12 h-10 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                                >
                                  <Minus className="w-4 h-4 text-red-600 font-bold" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total de cantidad */}
                      <div className="flex items-center justify-end gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200">
                        <Label className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-bold text-lg">
                          <span className="text-xl">📊</span>
                          Cantidad Total:
                        </Label>
                        <Input
                          value={getTotalQuantity()}
                          readOnly
                          className="w-24 h-12 bg-white font-bold text-lg text-center border-2 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-orange-600 font-semibold text-lg">
                      <span className="text-xl">📁</span>
                      Imágenes del Producto
                    </Label>

                    <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/10 hover:border-orange-400 transition-colors duration-200">
                      <FileUploadComponent
                        onFilesChange={setSelectedFiles}
                        resetCounter={resetCounter}
                      />
                    </div>

                    {isEditing && (
                      <p className="text-sm text-gray-500 mt-2">
                        * Si no selecciona archivos nuevos, se mantendrán los
                        archivos existentes del producto.
                      </p>
                    )}
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
          <div className="w-full">
            <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <h3 className="flex items-center font-bold text-gray-900 dark:text-white text-lg">
                  <PackageOpen className="mr-3 h-6 w-6 text-orange-500" />
                  <span className="text-gray-900 dark:text-white">
                    Productos en Cotización ({productos.length})
                  </span>
                </h3>
              </div>
              <div className="w-full overflow-x-auto px-6 py-4 bg-white dark:bg-gray-900">
                <DataTable
                  key={tableKey} // Forzar re-renderización cuando cambie
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

          {/* Botones de acción finales */}
          <div className="flex justify-end gap-4 pt-8">
            {statusQuotation === "pending" ? (
              /* Estado PENDING - Solo botón de Actualizar Cotización */
              <ConfirmDialog
                trigger={
                  <Button
                    disabled={isLoading || productos.length === 0}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl shadow-lg flex items-center gap-3 disabled:opacity-50 transition-all duration-200 hover:shadow-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Edit2 className="w-6 h-6" />
                    )}
                    Actualizar Cotización ({productos.length} producto
                    {productos.length !== 1 ? "s" : ""})
                  </Button>
                }
                title="Confirmar actualización de cotización"
                description={`¿Está seguro de actualizar la cotización con ${
                  productos.length
                } producto${productos.length !== 1 ? "s" : ""}?`}
                confirmText="Actualizar"
                cancelText="Cancelar"
                onConfirm={handleActualizarCotizacion}
              />
            ) : (
              /* Estado DRAFT - Botones de Editar Borrador y Enviar Borrador */
              <>
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isLoading || productos.length === 0}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-xl shadow-lg flex items-center gap-3 disabled:opacity-50 transition-all duration-200 hover:shadow-xl"
                    >
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Edit2 className="w-6 h-6" />
                      )}
                      Editar Borrador ({productos.length} producto
                      {productos.length !== 1 ? "s" : ""})
                    </Button>
                  }
                  title="Confirmar edición de borrador"
                  description={`¿Está seguro de guardar los cambios en el borrador con ${
                    productos.length
                  } producto${productos.length !== 1 ? "s" : ""}?`}
                  confirmText="Guardar Cambios"
                  cancelText="Cancelar"
                  onConfirm={handleEditarBorrador}
                />

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
                      Enviar Cotización ({productos.length} producto
                      {productos.length !== 1 ? "s" : ""})
                    </Button>
                  }
                  title="Confirmar envío de borrador"
                  description={`¿Está seguro de enviar el borrador con ${
                    productos.length
                  } producto${productos.length !== 1 ? "s" : ""} al administrador para revisión?`}
                  confirmText="Enviar"
                  cancelText="Cancelar"
                  onConfirm={handleEnviarBorrador}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de carga */}
      <SendingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </div>
  );
}
