import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import FileUploadComponent from "@/components/comp-552";
import {
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Truck,
  Package,
  Ruler,
  Palette,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { useGetQuotationById } from "@/hooks/use-quation";
import { useCreateQuatitationResponseMultiple } from "@/hooks/use-quatitation-response";
import { uploadMultipleFiles } from "@/api/fileUpload";
import { incotermsOptions } from "../utils/static";
import { servicios } from "../../../Cotizacion/components/data/static";
import type {
  AdminQuotationResponse,
  QuotationResponseRequest,
} from "../utils/interface";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface RespuestaTabProps {
  selectedQuotationId: string;
  selectedProductId: string;
  selectedProductName: string;
}

const RespuestaTab: React.FC<RespuestaTabProps> = ({
  selectedQuotationId,
  selectedProductId,
  selectedProductName,
}) => {
  const { data: quotationDetail, isLoading: isLoadingQuotation } =
    useGetQuotationById(selectedQuotationId);
  const createResponseMutation = useCreateQuatitationResponseMultiple();

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

  const [isLoading, setIsLoading] = useState(false);
  const [statusResponse, setStatusResponse] = useState("no-respondido");
  const updateResponse = (
    id: string,
    field: keyof AdminQuotationResponse,
    value: string | File[]
  ) => {
    setResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addResponse = () => {
    const newResponse: AdminQuotationResponse = {
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
    };
    setResponses((prev) => [...prev, newResponse]);
  };

  const removeResponse = (id: string) => {
    if (responses.length > 1) {
      setResponses((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleEnviarRespuestas = async () => {
    setIsLoading(true);

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

      // 3. Preparar las respuestas para enviar al backend
      const summationTotal = responses.reduce(
        (sum, r) => sum + (parseFloat(r.precioTotal) || 0),
        0
      );
      const summationExpress = responses.reduce(
        (sum, r) => sum + (parseFloat(r.precioExpress) || 0),
        0
      );
      const summationTaxes = responses.reduce(
        (sum, r) => sum + (parseFloat(r.impuestos) || 0),
        0
      );
      const summationServiceFee = responses.reduce(
        (sum, r) => sum + (parseFloat(r.tarifaServicio) || 0),
        0
      );

      const responsesToSend: QuotationResponseRequest = {
        statusResponseProduct: statusResponse,
        summationTotal,
        summationExpress,
        summationTaxes,
        summationServiceFee,
        responses: responses.map((response, responseIndex) => {
          const { start, count } = fileIndexMap[responseIndex];
          const responseFiles = allUploadedUrls.slice(start, start + count);

          return {
            unit_price: parseFloat(response.pUnitario) || 0,
            incoterms: response.incoterms,
            total_price: parseFloat(response.precioTotal) || 0,
            express_price: parseFloat(response.precioExpress) || 0,
            logistics_service: response.servicioLogistico,
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
        productId: selectedProductId,
      });

      setIsLoading(false);

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
      setIsLoading(false);
    }
  };

  if (isLoadingQuotation) {
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

  if (!quotationDetail) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-red-600">
          Error al cargar los detalles de la cotización. Por favor, intente
          nuevamente.
        </div>
      </div>
    );
  }

  // Encontrar el producto seleccionado
  const currentProduct = quotationDetail.products?.find(
    (p: any) => p.id === selectedProductId
  );

  if (!currentProduct) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-muted-foreground">
          Producto no encontrado. Por favor, seleccione un producto válido.
        </div>
      </div>
    );
  }

  // Calcular sumatorias de todas las respuestas para UI y payload
  const summationTotal = responses.reduce(
    (sum, r) => sum + (parseFloat(r.precioTotal) || 0),
    0
  );
  const summationExpress = responses.reduce(
    (sum, r) => sum + (parseFloat(r.precioExpress) || 0),
    0
  );
  const summationTaxes = responses.reduce(
    (sum, r) => sum + (parseFloat(r.impuestos) || 0),
    0
  );
  const summationServiceFee = responses.reduce(
    (sum, r) => sum + (parseFloat(r.tarifaServicio) || 0),
    0
  );

  return (
    <div className="space-y-4 pt-2">
      <Card>
        <CardHeader className="border-b border-gray-200 px-4">
          <CardTitle className="flex items-center font-semibold text-gray-900">
            <Package className="mr-2 h-6 w-6 text-orange-500" />
            Detalle de producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 auto-rows-fr">
            {/* Main Product Card - Spans 2 columns */}
            <Card className="lg:col-span-2 bg-white border-2 hover:border-orange-100 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-col w-full">
                  <div className="flex items-center  w-full justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <Package className="h-6 w-6 text-orange-500" />
                      <span className="text-sm font-semibold">
                        Nombre del producto:
                      </span>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <span className="hover:text-orange-800">
                        Estado de respuesta:
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-orange-500 text-white"
                      >
                        {currentProduct?.status || "No respondido"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-orange-800 text-sm font-semibold w-full">
                    {selectedProductName}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    <div className="text-sm  flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-500 hover:text-orange-800" />{" "}
                      Cantidad:{" "}
                      <span className="hover:text-orange-500">
                        {currentProduct.quantity}
                      </span>
                    </div>
                    <div className="text-sm  flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-orange-500 hover:text-orange-800" />{" "}
                      Tamaño:{" "}
                      <span className="hover:text-orange-500">
                        {currentProduct.size}
                      </span>
                    </div>

                    <div className="text-sm   flex items-center gap-2">
                      <Palette className="h-4 w-4 text-orange-500 hover:text-orange-800 " />{" "}
                      Color:{" "}
                      <span className="hover:text-orange-500">
                        {currentProduct.color}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-orange-500 hover:text-orange-800" />
                      <span className="text-sm hover:text-orange-500">
                        Fuente del producto:{" "}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="hover:text-orange-500 truncate max-w-full">
                        {currentProduct.url}
                      </div>
                    </div>
                  </div>
                  <div className=" flex flex-col text-sm gap-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-orange-500 hover:text-orange-800" />
                      <span className="hover:text-orange-500">Comentario:</span>
                    </div>
                    <Textarea
                      className="w-full"
                      value={currentProduct.comment}
                      placeholder="Comentario"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardTitle className="border-b border-gray-200 px-4 flex items-center justify-between py-2">
          <h3 className="flex items-center font-semibold text-gray-900 text-sm">
            <Package className="mr-2 h-6 w-6 text-orange-500" />
            Detalle de respuesta ({responses.length})
          </h3>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Estado</Label>
              <Select
                value={statusResponse}
                onValueChange={(value) => setStatusResponse(value)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="respondido">Respondido</SelectItem>
                  <SelectItem value="no-respondido">No respondido</SelectItem>
                  <SelectItem value="observado">Observado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={addResponse}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-2 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Agregar Respuesta
          </Button>
        </CardTitle>
        <CardContent>
          {responses.map((response, i) => (
            <div
              key={response.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 mb-4"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-semibold text-black">
                      Respuesta #{i + 1}
                    </h4>
                  </div>
                </div>
                {responses.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeResponse(response.id)}
                    className="h-9 w-9 rounded-xl hover:bg-gray-200 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Pricing */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-orange-500" />
                    <h5 className="font-semibold text-black">
                      Información de Precios
                    </h5>
                  </div>

                  {/*Precio Unitario*/}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Precio Unitario ($)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={response.pUnitario}
                        onChange={(e) =>
                          updateResponse(
                            response.id,
                            "pUnitario",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Precio Total ($)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={response.precioTotal}
                        onChange={(e) =>
                          updateResponse(
                            response.id,
                            "precioTotal",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {/*Precio Express*/}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Precio Express ($)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={response.precioExpress}
                        onChange={(e) =>
                          updateResponse(
                            response.id,
                            "precioExpress",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {/*Tarifa Servicio*/}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Tarifa Servicio ($)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={response.tarifaServicio}
                        onChange={(e) =>
                          updateResponse(
                            response.id,
                            "tarifaServicio",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {/*Impuestos*/}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Impuestos (%)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={response.impuestos}
                        onChange={(e) =>
                          updateResponse(
                            response.id,
                            "impuestos",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle Column - Logistics & Terms */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-orange-500" />
                    <h5 className="font-semibold text-black">
                      Logística y Términos
                    </h5>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Incoterms
                      </Label>
                      <Select
                        value={response.incoterms}
                        onValueChange={(value) =>
                          updateResponse(response.id, "incoterms", value)
                        }
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {incotermsOptions.map((option: any) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Servicio Logístico
                      </Label>
                      <Select
                        value={response.servicioLogistico}
                        onValueChange={(value) =>
                          updateResponse(
                            response.id,
                            "servicioLogistico",
                            value
                          )
                        }
                      >
                        <SelectTrigger className="w-64">
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

                {/* Right Column - Comments & Files */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                    <h5 className="font-semibold text-black">
                      Observaciones y Archivos
                    </h5>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Recomendaciones
                      </Label>
                      <Textarea
                        value={response.recomendaciones}
                        onChange={(e) =>
                          updateResponse(
                            response.id,
                            "recomendaciones",
                            e.target.value
                          )
                        }
                        placeholder="Embalaje adicional por fragilidad..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Comentarios Adicionales
                      </Label>
                      <Textarea
                        value={response.comentariosAdicionales}
                        onChange={(e) =>
                          updateResponse(
                            response.id,
                            "comentariosAdicionales",
                            e.target.value
                          )
                        }
                        placeholder="Se puede reducir el precio por volumen..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Archivos Adjuntos
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                        <FileUploadComponent
                          onFilesChange={(files) =>
                            updateResponse(response.id, "archivos", files)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resumen de todas las respuestas */}
      <Card className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-gray-600 text-sm">Precio Total</p>
            <p className="font-bold text-black">${summationTotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Precio Express</p>
            <p className="font-bold text-black">
              ${summationExpress.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Impuestos</p>
            <p className="font-bold text-black">${summationTaxes.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Tarifa Servicio</p>
            <p className="font-bold text-black">
              ${summationServiceFee.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4 justify-end pt-6">
        <ConfirmDialog
          trigger={
            <Button
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full text-lg shadow-md flex items-center gap-2"
            >
              {isLoading ? "Enviando..." : "Enviar Respuestas"}
            </Button>
          }
          title="Confirmar envío de respuestas"
          description={`¿Está seguro de enviar ${responses.length} respuesta${
            responses.length !== 1 ? "s" : ""
          } para el producto "${selectedProductName}"?`}
          confirmText="Enviar"
          cancelText="Cancelar"
          onConfirm={handleEnviarRespuestas}
        />
      </div>
    </div>
  );
};

export default RespuestaTab;
