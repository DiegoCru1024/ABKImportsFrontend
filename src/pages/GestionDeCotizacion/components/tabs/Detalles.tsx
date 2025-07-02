import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/table/data-table";
import {
  Calendar,
  Calculator,
  FileText,
  Clock,
  Receipt,
  Settings,
  User,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Truck,
  MessageSquare,
  Package,
  PackageIcon,
  Box,
  Boxes,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetQuotationById } from "@/hooks/use-quation";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/functions";

import {
  statusColorsQuotation,
  statusResponseQuotation,
} from "../utils/static";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { incotermsOptions } from "../utils/static";
import { servicios } from "../../../Cotizacion/components/data/static";
import FileUploadComponent from "@/components/comp-552";
import { uploadMultipleFiles } from "@/api/fileUpload";
import type { QuotationResponseRequest } from "@/api/interface/quotationResponseInterfaces";
import type { AdminQuotationResponse } from "../utils/interface";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCreateQuatitationResponseMultiple } from "@/hooks/use-quatitation-response";
import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";

interface DetallesTabProps {
  selectedQuotationId: string;
  onSelectProductForResponse: (productId: string, productName: string) => void;
}

interface ProductResponse {
  id: string;
  supplier: string;
  unitPrice: string;
  totalPrice: string;
  expressPrice: string;
  servicePrice: string;
  taxes: string;
  incoterms: string;
  logisticsService: string;
  deliveryTime: string;
  recommendations: string;
  notes: string;
}

const DetallesTab: React.FC<DetallesTabProps> = ({
  selectedQuotationId,
  onSelectProductForResponse,
}) => {
  //* Hook para obtener los detalles de la cotización - DEBE IR PRIMERO
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  //* Hook para crear respuestas múltiples - DEBE IR DESPUÉS DE LOS HOOKS DE QUERY
  const createResponseMutation = useCreateQuatitationResponseMultiple();

  //* Estados - TODOS LOS USESTATE JUNTOS
  const [subTab, setSubTab] = useState<
    "Todos" | "No respondido" | "Respondido" | "Observado"
  >("Todos");

  //* Estado de apertura de modal de respuesta
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  //* Estado para el servicio seleccionado
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");

  const [statusResponse, setStatusResponse] = useState("answered");

  //* Estados para el sistema de respuestas
  const [selectedProduct, setSelectedProduct] =
    useState<ProductoResponseIdInterface | null>(null);

  //! Estado para almacenar los productos
  const [product, setProduct] = useState<ProductoResponseIdInterface[]>([]);

  //*Estado para obtener cantidad de productos
  const [totalProducts, setTotalProducts] = useState(0);

  //*Estado para obtener cantidad de productos respondidos
  const [respondedProducts, setRespondedProducts] = useState(0);
  const [progress, setProgress] = useState(0);

  //* Estados para las respuestas
  const [responses, setResponses] = useState<AdminQuotationResponse[]>([
    {
      id: Date.now().toString(),
      pUnitario: "",
      incoterms: "FOB",
      precioTotal: "",
      precioExpress: "",
      servicioLogistico: "Consolidado Grupal Maritimo",
      tarifaServicio: "",
      impuestos: "",
      recomendaciones: "",
      comentariosAdicionales: "",
      archivos: [],
      status: "approved",
    },
  ]);

  //* Establecer el primer servicio como seleccionado cuando se cargan los datos
  useEffect(() => {
    if (
      quotationDetail?.summaryByServiceType?.[0]?.service_type &&
      !selectedServiceType
    ) {
      setSelectedServiceType(
        quotationDetail.summaryByServiceType[0].service_type
      );
      setTotalProducts(quotationDetail.products.length);
      setRespondedProducts(
        quotationDetail.products
          .map((item) => item.statusResponseProduct)
          .filter(Boolean).length
      );
      setProduct(quotationDetail.products);
    }
  }, [quotationDetail, selectedServiceType]);

  //* Calcular progreso cuando cambien los productos respondidos
  useEffect(() => {
    setProgress(
      totalProducts > 0
        ? Math.round((respondedProducts / totalProducts) * 100)
        : 0
    );
  }, [totalProducts, respondedProducts]);

  const updateResponse = (
    index: number,
    field: keyof AdminQuotationResponse,
    value: string | File[]
  ) => {
    setResponses((prev) =>
      prev.map((response, i) =>
        i === index ? { ...response, [field]: value } : response
      )
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !quotationDetail) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-red-600">
          Error al cargar los detalles de la cotización. Por favor, intente
          nuevamente.
        </div>
      </div>
    );
  }

  //* Arrays de tipos de servicio
  const serviceTypes: string[] =
    quotationDetail.summaryByServiceType?.map((item) => item.service_type) ||
    [];

  //* Función para generar los datos de precios basados en un servicio específico
  const getPricingData = (serviceData: any) => [
    {
      id: "total",
      title: "Precio Total de la cotización",
      amount:
        serviceData.total_price +
        serviceData.service_fee +
        serviceData.taxes +
        serviceData.express_price,
      description: "Suma total de todos los conceptos",
      icon: Calculator,
      isTotal: true,
    },
    {
      id: "quote",
      title: "Precio de la cotización",
      amount: serviceData.total_price,
      description: "Costo base del servicio cotizado",
      icon: FileText,
    },
    {
      id: "express",
      title: "Precio express",
      amount: serviceData.express_price,
      description: "Cargo adicional por servicio urgente",
      icon: Clock,
    },
    {
      id: "taxes",
      title: "Precio de los impuestos",
      amount: serviceData.taxes,
      description: "Impuestos aplicables según legislación",
      icon: Receipt,
    },
    {
      id: "services",
      title: "Precio de los servicios",
      amount: serviceData.service_fee,
      description: "Servicios adicionales incluidos",
      icon: Settings,
    },
  ];

  const addResponse = () => {
    const newResponse: AdminQuotationResponse = {
      id: Date.now().toString(),
      pUnitario: "",
      incoterms: "EXW",
      precioTotal: "",
      precioExpress: "",
      servicioLogistico: "Consolidado Grupal Maritimo",
      tarifaServicio: "",
      impuestos: "",
      recomendaciones: "",
      comentariosAdicionales: "",
      archivos: [],
      status: "answered",
    };
    setResponses((prev) => [...prev, newResponse]);
  };

  const removeResponse = (id: string) => {
    if (responses.length > 1) {
      setResponses((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleEnviarRespuestas = async () => {
    setIsLoadingResponse(true);

    try {
      // 1. Recopilar TODOS los archivos de TODAS las respuestas
      const allFiles: File[] = [];
      const fileIndexMap: {
        [responseIndex: number]: { start: number; count: number };
      } = {};

      responses.forEach((response, responseIndex) => {
        const startIndex = allFiles.length;
        allFiles.push(...response.archivos);
        fileIndexMap[responseIndex] = {
          start: startIndex,
          count: response.archivos.length,
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

      const responsesToSend: QuotationResponseRequest = {
        statusResponseProduct: statusResponse,
        sendResponse: true,
        responses: responses.map((response, responseIndex) => {
          const { start, count } = fileIndexMap[responseIndex];
          const responseFiles = allUploadedUrls.slice(start, start + count);
          return {
            logistics_service: response.servicioLogistico,
            unit_price: parseFloat(response.pUnitario) || 0,
            incoterms: response.incoterms,
            total_price: parseFloat(response.precioTotal) || 0,
            express_price: parseFloat(response.precioExpress) || 0,
            service_fee: parseFloat(response.tarifaServicio) || 0,
            taxes: parseFloat(response.impuestos) || 0,
            recommendations: response.recomendaciones,
            additional_comments: response.comentariosAdicionales,
            files: responseFiles,
          };
        }),
      };

      console.log(
        "Respuestas a enviar:",
        JSON.stringify(responsesToSend, null, 2)
      );

      // 4. Enviar al backend
      await createResponseMutation.mutateAsync({
        data: responsesToSend,
        quotationId: selectedQuotationId,
        productId: selectedProduct?.id as string,
      });

      setIsLoadingResponse(false);

      // Limpiar respuestas después del envío exitoso
      setResponses([
        {
          id: Date.now().toString(),
          pUnitario: "",
          incoterms: "FOB",
          precioTotal: "",
          precioExpress: "",
          servicioLogistico: "Consolidado Grupal Maritimo",
          tarifaServicio: "",
          impuestos: "",
          recomendaciones: "",
          comentariosAdicionales: "",
          archivos: [],
          status: "no-respondido",
        },
      ]);
    } catch (error) {
      console.error("Error durante el proceso de envío:", error);
      setIsLoadingResponse(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header Bento Grid */}
      <div className="relative ">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4 gap-3 text-lg">
              <PackageIcon className="w-6 h-6 text-blue-600" />
              Cotizacion {quotationDetail.correlative}
            </div>
          </div>

          {/* Timeline */}
          <div>
            {/* Fecha de registro */}
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {quotationDetail.user.name}
                    </h3>
                    <p className="text-gray-600">
                      {quotationDetail.user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(
                          quotationDetail.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tipo de servicio */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Boxes className="w-6 h-6 text-orange-600" />
                  </div>

                  <div>
                    <p className="text-lg text-orange-900">Tipo de servicio:</p>
                    <p className="text-orange-700 text-sm">
                      {quotationDetail.summaryByServiceType?.[0]?.service_type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-gray-800 text-sm font-semibold">
                    Estado de la cotización:
                  </p>
                  <Badge
                    className={`${
                      statusColorsQuotation[
                        quotationDetail.statusResponseQuotation as keyof typeof statusResponseQuotation
                      ]
                    } px-4 py-2 text-sm font-semibold flex items-center gap-2`}
                  >
                    {
                      statusResponseQuotation[
                        quotationDetail.statusResponseQuotation as keyof typeof statusResponseQuotation
                      ]
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progreso de Respuestas
                </span>
                <span className="text-sm text-gray-600">
                  {respondedProducts} de {totalProducts} productos
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Productos Cotizados</h3>

        {quotationDetail.products.map((product) => (
          <>
            <Card key={product.id} className="p-4">
              <div className="space-y-4">
                {/* Product Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex gap-4">
                      {/* Product Images */}
                      {product.attachments &&
                        product.attachments.length > 0 && (
                          <div className="flex-shrink-0">
                            {/*Imagen Principal*/}
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={product.attachments[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Miniaturas de las imágenes */}
                            {product.attachments.length > 1 && (
                              <div className="mt-2 flex gap-1">
                                {product.attachments
                                  .slice(1, 4)
                                  .map((image, index) => (
                                    <div
                                      key={index}
                                      className="w-6 h-6 bg-gray-100 rounded overflow-hidden"
                                    >
                                      <img
                                        src={image}
                                        alt={`${product.name} ${index + 2}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                {/* Si hay más de 4 imágenes, se muestra el número de imágenes restantes */}
                                {product.attachments.length > 4 && (
                                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-600">
                                      +{product.attachments.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Product Info */}
                      <div className="flex-1 w-full">
                        <h4 className="font-semibold  text-lg text-ellipsis overflow-hidden whitespace-nowrap">
                          {product.name}
                        </h4>
                        <p className="text-gray-600">{product.comment}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">
                            <strong>Cantidad:</strong> {product.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {respondedProducts} respuestas
                    </Badge>
                    <Button
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsResponseModalOpen(true);
                      }}
                      size="sm"
                      className="ml-2  hover:animate-none bg-orange-500 hover:bg-orange-600"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Respuesta
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </>
        ))}
      </div>

      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogOverlay />
        <DialogContent
          showCloseButton={false}
          className="w-full md:max-w-6xl max-h-[90vh] overflow-y-auto "
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              Responder Cotización - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Product Info */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-lg text-blue-900">
                {selectedProduct?.name}
              </h3>
              <p className="text-blue-700">{selectedProduct?.comment}</p>
              <div className="mt-2">
                <span className="text-sm font-medium text-blue-800">
                  Cantidad solicitada: {selectedProduct?.quantity}{" "}
                  {selectedProduct?.size}
                </span>
              </div>
            </Card>
            {/* Header con estado y botón agregar */}
            <div className="flex items-center justify-between mb-6 p-4">
              <div className="flex items-center gap-2 flex-col">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalle de Respuesta
                  </h3>
                </div>

                <span className="text-sm text-gray-500">
                  Cantidad de Respuestas: {responses.length > 0 ? 1 : 0}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600">
                    Estado de respuesta:
                  </Label>
                  <Select
                    value={statusResponse}
                    onValueChange={(value) => setStatusResponse(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="answered">Respondido</SelectItem>
                      <SelectItem value="not_answered">
                        No respondido
                      </SelectItem>
                      <SelectItem value="observed">Observado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={addResponse}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Respuesta
                </Button>
              </div>
            </div>

            {/* Respuestas */}
            <div className="space-y-2 p-4 shadow-md rounded-lg">
              {responses.map((response, i) => (
                <Card
                  key={response.id}
                  className="bg-white border-2 hover:border-orange-100 hover:shadow-md"
                >
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Respuesta #{i + 1}
                      </h4>
                      {responses.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResponse(response.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-4">
                      {/* Información de Precios */}
                      <div className="space-y-4 bg-white border-2 p-4 rounded-lg hover:border-orange-100 hover:shadow-md">
                        <div className="flex items-center gap-2 text-orange-500 mb-4">
                          <DollarSign className="h-4 w-4" />
                          <h5 className="font-medium text-gray-900">
                            Información de Precios
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/*Precio Unitario*/}
                          <div>
                            <Label className="text-sm text-gray-600">
                              Precio Unitario ($)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={response.pUnitario}
                              onChange={(e) =>
                                updateResponse(
                                  response.id as unknown as number,
                                  "pUnitario",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="mt-1"
                            />
                          </div>
                          {/*Precio Total*/}
                          <div>
                            <Label className="text-sm text-gray-600">
                              Precio Total ($)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={response.precioTotal}
                              onChange={(e) =>
                                updateResponse(
                                  response.id as unknown as number,
                                  "precioTotal",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/*Precio Express*/}
                          <div>
                            <Label className="text-sm text-gray-600">
                              Precio Express ($)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={response.precioExpress}
                              onChange={(e) =>
                                updateResponse(
                                  response.id as unknown as number,
                                  "precioExpress",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="mt-1"
                            />
                          </div>
                          {/*Tarifa Servicio*/}
                          <div>
                            <Label className="text-sm text-gray-600">
                              Tarifa Servicio ($)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={response.tarifaServicio}
                              onChange={(e) =>
                                updateResponse(
                                  response.id as unknown as number,
                                  "tarifaServicio",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm text-gray-600">
                            Impuestos (%)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={response.impuestos}
                            onChange={(e) =>
                              updateResponse(
                                response.id as unknown as number,
                                "impuestos",
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Logística y Términos */}
                      <div className="space-y-4 bg-white border-2 p-4 rounded-lg hover:border-orange-100 hover:shadow-md">
                        <div className="flex items-center gap-2 text-orange-500 mb-4">
                          <Truck className="h-4 w-4" />
                          <h5 className="font-medium text-gray-900">
                            Logística y Términos
                          </h5>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-gray-600">
                              Incoterms
                            </Label>
                            <Select
                              value={response.incoterms}
                              onValueChange={(value) =>
                                updateResponse(
                                  response.id as unknown as number,
                                  "incoterms",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {incotermsOptions.map((option: any) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm text-gray-600">
                              Servicio Logístico
                            </Label>
                            <Select
                              value={response.servicioLogistico}
                              onValueChange={(value) =>
                                updateResponse(
                                  response.id as unknown as number,
                                  "servicioLogistico",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                              <SelectContent>
                                {servicios.map((servicio) => (
                                  <SelectItem
                                    key={servicio.value}
                                    value={servicio.value}
                                  >
                                    {servicio.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Observaciones y Archivos */}
                      <div className="space-y-4 bg-white border-2 p-4 rounded-lg hover:border-orange-100 hover:shadow-md">
                        <div className="flex items-center gap-2 text-orange-500 mb-4">
                          <MessageSquare className="h-4 w-4" />
                          <h5 className="font-medium text-gray-900">
                            Observaciones y Archivos
                          </h5>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-gray-600">
                              Recomendaciones
                            </Label>
                            <Textarea
                              value={response.recomendaciones}
                              onChange={(e) =>
                                updateResponse(
                                  response.id as unknown as number,
                                  "recomendaciones",
                                  e.target.value
                                )
                              }
                              placeholder="Embalaje adicional por fragilidad..."
                              className="mt-1 min-h-[80px]"
                            />
                          </div>

                          <div>
                            <Label className="text-sm text-gray-600">
                              Comentarios Adicionales
                            </Label>
                            <Textarea
                              value={response.comentariosAdicionales}
                              onChange={(e) =>
                                updateResponse(
                                  response.id as unknown as number  ,
                                  "comentariosAdicionales",
                                  e.target.value
                                )
                              }
                              placeholder="Se puede reducir el precio por volumen..."
                              className="mt-1 min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/*Archivos Adjuntos*/}
                    <div className="rounded-lg w-full border-gray-200 border-2 p-4  hover:border-orange-100 hover:shadow-md">
                      <Label className="text-sm text-gray-600">
                        Archivos Adjuntos
                      </Label>
                      <div className="mt-1">
                        <FileUploadComponent
                          onFilesChange={(files) =>
                            updateResponse(
                              i,
                              "archivos",
                              files
                            )
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Máx 20 archivos • Máx 10MB c/u
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Botón de enviar respuestas */}
            <div className="flex space-x-4 justify-end pt-6">
              <ConfirmDialog
                trigger={
                  <Button
                    disabled={isLoadingResponse}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full text-lg shadow-md flex items-center gap-2"
                  >
                    {isLoadingResponse ? "Enviando..." : "Enviar Respuestas"}
                  </Button>
                }
                title="Confirmar envío de respuestas"
                description={`¿Está seguro de enviar ${responses.length} respuesta${
                  responses.length !== 1 ? "s" : ""
                } para el producto "${selectedProduct?.name}"?`}
                confirmText="Enviar"
                cancelText="Cancelar"
                onConfirm={handleEnviarRespuestas}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg border">
        <div className=" pt-4 px-4 bg-white rounded-lg border">
          <div className="w-full  mx-auto space-y-4">
            {/* Header */}
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-2xl font-semibold text-slate-800 tracking-wide">
                Resumen de Cotización
              </h1>
            </div>

            <Tabs
              value={selectedServiceType}
              onValueChange={setSelectedServiceType}
              className="w-full"
            >
              <TabsList className="relative flex border-b border-gray-200">
                {serviceTypes.map((serviceType) => (
                  <TabsTrigger
                    key={serviceType}
                    value={serviceType}
                    className={`
            relative px-6 py-4 text-sm font-medium transition-colors
            ${
              selectedServiceType === serviceType
                ? "text-[#d7751f]"
                : "text-gray-600 hover:text-gray-800"
            }
          `}
                  >
                    {serviceType}
                    {/* Línea animada */}
                    <span
                      className={` absolute bottom-0 left-0 h-0.5 bg-[#d7751f] transition-all duration-300
              ${selectedServiceType === serviceType ? "w-full" : "w-0"}
            `}
                    />
                  </TabsTrigger>
                ))}
              </TabsList>
              {/* Genero un TabsContent por cada serviceType */}
              {quotationDetail?.summaryByServiceType?.map((price) => {
                const pricingData = getPricingData(price);
                return (
                  <TabsContent
                    key={price.service_type}
                    value={price.service_type}
                  >
                    {/* Aquí pinto los datos de ese tipo de servicio */}
                    {/* Pricing Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pricingData.slice(1).map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <Card
                            key={item.id + index}
                            className="border-0 shadow-sm bg-white/50 backdrop-blur-sm hover:bg-orange-50 transition-all duration-300 "
                          >
                            <CardContent className="gap-4">
                              <div className="flex  justify-between  mb-2">
                                <div className="flex items-center  space-x-3">
                                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                    <IconComponent className="h-3.5 w-3.5 text-slate-500" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-base  text-slate-700 mb-1">
                                      {item.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400  leading-relaxed">
                                      {item.description}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl  text-slate-700">
                                    {formatCurrency(item.amount)}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {item.amount}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>

            {/* Total Card - Clean and Prominent */}
            {quotationDetail?.summaryByServiceType?.map((price) => {
              const pricingData = getPricingData(price);
              return selectedServiceType === price.service_type ? (
                <Card
                  key={`total-${price.service_type}`}
                  className=" shadow-sm bg-white/70 hover:bg-orange-50 transition-all duration-300"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <Calculator className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg  text-slate-800 mb-1">
                            {pricingData[0].title}
                          </CardTitle>
                          <CardDescription className="text-slate-500  text-sm">
                            {pricingData[0].description}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl  text-slate-800 mb-2 flex items-center justify-between">
                          {formatCurrency(pricingData[0].amount)}
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 font-light border-0"
                          >
                            Total
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                          Precio final con todos los conceptos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })}

            {/* Footer Note */}
            <div className="text-center p-8">
              <div className="inline-flex items-center space-x-2 text-xs text-slate-400 font-light">
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span>Cotización válida por 30 días</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesTab;
