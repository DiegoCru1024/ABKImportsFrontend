import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  DollarSign,
  ExternalLink,
  FileText,
  MessageSquare,
  Package,
  Palette,
  Ruler,
  Truck,
} from "lucide-react";
import { useGetAllQuatitationResponseForSpecificProduct } from "@/hooks/use-quatitation-response";
import type { ProductBasicInfo, Responses } from "@/api/apiQuotationResponse";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incotermsOptions } from "@/pages/GestionDeCotizacion/components/utils/static";
import { servicios } from "@/pages/Cotizacion/components/data/static";

interface TrackingTabProps {
  selectedProductId: string;
  selectedProductName: string;
  quotationId: string;
}

const TrackingTab: React.FC<TrackingTabProps> = ({
  selectedProductId,
  selectedProductName,
  quotationId,
}) => {
  const {
    data: responses,
    isLoading,
    isError,
  } = useGetAllQuatitationResponseForSpecificProduct(
    quotationId,
    selectedProductId
  );

  const productResponse: ProductBasicInfo = responses?.product || ({} as ProductBasicInfo);
  const responsesData: Responses[] = responses?.responses || [];

  useEffect(() => {
    console.log(responses);
  }, [responses]);

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

  if (isError) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-red-600">
          Error al cargar la información de seguimiento. Por favor, intente
          nuevamente.
        </div>
      </div>
    );
  }

  if (!productResponse) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-muted-foreground py-8">
          No se encontró información de seguimiento para este producto.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 ">
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
                        {productResponse?.statusResponseProduct ||
                          "No respondido"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-orange-800 text-lg font-semibold w-full">
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
                        {productResponse.quantity}
                      </span>
                    </div>
                    <div className="text-sm  flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-orange-500 hover:text-orange-800" />{" "}
                      Tamaño:{" "}
                      <span className="hover:text-orange-500">
                        {productResponse.size}
                      </span>
                    </div>

                    <div className="text-sm   flex items-center gap-2">
                      <Palette className="h-4 w-4 text-orange-500 hover:text-orange-800 " />{" "}
                      Color:{" "}
                      <span className="hover:text-orange-500">
                        {productResponse.color}
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
                        {productResponse.url}
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
                      value={productResponse.comment}
                      placeholder="Comentario"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
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
            Cantidad de Respuestas: {responsesData.length > 0 ? 1 : 0}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600">
              Estado de respuesta:
            </Label>
            <Select
              value={productResponse.statusResponseProduct}
              /*onValueChange={(value) => setStatusResponse(value)}*/
              disabled
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="answered">Respondido</SelectItem>
                <SelectItem value="not_answered">No respondido</SelectItem>
                <SelectItem value="observed">Observado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Respuestas */}
      <div className="space-y-2 p-4 shadow-md rounded-lg">
        {responsesData.map((response, index) => (
          <Card
            key={index}
            className="bg-white border-2 hover:border-orange-100 hover:shadow-md"
          >
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Respuesta #{index + 1}
                </h4>
                {/*{responsesData.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResponse(response.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}*/}
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
                        value={response.unit_price}
                        /*onChange={(e) =>
                          updateResponse(
                            response.id,
                            "pUnitario",
                            e.target.value
                          )
                        }*/
                        disabled
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
                        value={response.total_price}
                        /*onChange={(e) =>
                          updateResponse(
                            response.id,
                            "precioTotal",
                            e.target.value
                          )
                        }*/
                        disabled
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
                        value={response.express_price}
                        /*onChange={(e) =>
                          updateResponse(
                            response.id,
                            "precioExpress",
                            e.target.value
                          )
                        }*/
                        disabled
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
                        value={response.service_fee}
                        /*onChange={(e) =>
                          updateResponse(
                            response.id,
                            "tarifaServicio",
                            e.target.value
                          )
                        }*/
                        disabled
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
                      value={response.taxes}
                      /*onChange={(e) =>
                        updateResponse(response.id, "impuestos", e.target.value)
                      }*/
                      disabled
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
                      <Label className="text-sm text-gray-600">Incoterms</Label>
                      <Select
                        value={response.incoterms}
                        /*onValueChange={(value) =>
                          updateResponse(response.id, "incoterms", value)
                        }*/
                        disabled
                      >
                        <SelectTrigger className="mt-1">
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

                    <div>
                      <Label className="text-sm text-gray-600">
                        Servicio Logístico
                      </Label>
                      <Select
                        value={response.logistics_service}
                        
                        disabled
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicios.map((servicio: any) => (
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
                        value={response.recommendations}
                        /*onChange={(e) =>
                          updateResponse(
                            response.id,
                            "recomendaciones",
                            e.target.value
                          )
                        }*/
                        disabled
                        placeholder="Embalaje adicional por fragilidad..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">
                        Comentarios Adicionales
                      </Label>
                      <Textarea
                        value={response.additional_comments}
                        /*onChange={(e) =>
                          updateResponse(
                            response.id,
                            "comentariosAdicionales",
                            e.target.value
                          )
                        }*/
                        disabled
                        placeholder="Se puede reducir el precio por volumen..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/*Archivos Adjuntos*/}
              {/*<div className="rounded-lg w-full border-gray-200 border-2 p-4  hover:border-orange-100 hover:shadow-md">
                <Label className="text-sm text-gray-600">
                  Archivos Adjuntos
                </Label>
                <div className="mt-1">
                  <FileUploadComponent
                    onFilesChange={(files) =>
                      updateResponse(response.id, "archivos", files)
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máx 20 archivos • Máx 10MB c/u
                  </p>
                </div>
              </div>*/}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex space-x-4 justify-end pt-6">
        {/*<ConfirmDialog
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
        */}
      </div>
    </div>
  );
};

export default TrackingTab;
