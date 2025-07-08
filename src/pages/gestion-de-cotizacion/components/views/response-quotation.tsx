import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  DollarSign,
  FileText,
  MessageSquare,
  Trash2,
  Truck,
} from "lucide-react";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { incotermsOptions } from "../utils/static";
import { servicios } from "@/pages/cotizacion/components/data/static";
import type { AdminQuotationResponse } from "../utils/interface";
import FileUploadComponent from "@/components/comp-552";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { QuotationResponseRequest } from "@/api/interface/quotationResponseInterfaces";
import { uploadMultipleFiles } from "@/api/fileUpload";
import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";
import { useCreateQuatitationResponseMultiple, usePatchQuatitationResponse } from "@/hooks/use-quatitation-response";

export interface ResponseQuotationProps {
  selectedProduct: ProductoResponseIdInterface | null;
  selectedQuotationId: string;
  isResponseModalOpen: boolean;
  setIsResponseModalOpen: (isResponseModalOpen: boolean) => void;
}

const ResponseQuotation = ({
  selectedProduct,
  selectedQuotationId,
  isResponseModalOpen,
  setIsResponseModalOpen,
}: ResponseQuotationProps) => {
  //* Hook para crear respuestas múltiples - DEBE IR DESPUÉS DE LOS HOOKS DE QUERY
  const createResponseMutation = useCreateQuatitationResponseMultiple();
  const patchResponseMutation = usePatchQuatitationResponse(selectedQuotationId);
  //* Estado para el estado de carga
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  //* Estado para el estado de respuesta
  const [statusResponse, setStatusResponse] = useState("answered");

  //* Estados para las respuestas
  const [responses, setResponses] = useState<AdminQuotationResponse[]>([
    {
      id: Date.now().toString(),
      logistics_service: "Pendiente",
      unit_price: 0,
      incoterms: "FOB",
      total_price: 0,
      express_price: 0,
      service_fee: 0,
      taxes: 0,
      recommendations: "",
      additional_comments: "",
      weight: 0,
      volume: 0,
      number_of_boxes: 0,
      international_freight: 0,
      customs_clearance: 0,
      delivery: 0,
      other_expenses: 0,
      files: [],
    },
  ]);


  //* Función para actualizar una respuesta
  const updateResponse = (
    index: number,
    field: keyof AdminQuotationResponse,
    value: string | File[] | null
  ) => {
    setResponses((prev) =>
      prev.map((response, i) =>
        i === index ? { ...response, [field]: value } : response
      )
    );
  };

  //* Función para eliminar una respuesta
  const removeResponse = (id: string) => {
    if (responses.length > 1) {
      setResponses((prev) => prev.filter((r) => r.id !== id));
    }
  };

  //************* Funciones para enviar respuestas *************/
  //************************************************************/
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
        allFiles.push(...response.files);
        fileIndexMap[responseIndex] = {
          start: startIndex,
          count: response.files.length,
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
            logistics_service: response.logistics_service,
            unit_price: response.unit_price,
            incoterms: response.incoterms,
            total_price: response.total_price,
            express_price: response.express_price,
            service_fee: response.service_fee,
            taxes: response.taxes,
            recommendations: response.recommendations,
            additional_comments: response.additional_comments,
            files: responseFiles,
            weight: response.weight,
            volume: response.volume,
            number_of_boxes: response.number_of_boxes,
            international_freight: response.international_freight,
            customs_clearance: response.customs_clearance,
            delivery: response.delivery,
            other_expenses: response.other_expenses,
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

      //* Actualizar el estado de la respuesta de la cotización
      await patchResponseMutation.mutateAsync("answered");

      setIsLoadingResponse(false);



      // Limpiar respuestas después del envío exitoso
      setResponses([
        {
          id: Date.now().toString(),
          logistics_service: "Pendiente",
          unit_price: 0,
          incoterms: "FOB",
          total_price: 0,
          express_price: 0,
          service_fee: 0,
          taxes: 0,
          recommendations: "",
          additional_comments: "",
          weight: 0,
          volume: 0,
          number_of_boxes: 0,
          international_freight: 0,
          customs_clearance: 0,
          delivery: 0,
          other_expenses: 0,
          files: [],
        },
      ]);
    } catch (error) {
      console.error("Error durante el proceso de envío:", error);
      setIsLoadingResponse(false);
    }
    finally {
      setIsResponseModalOpen(false);
    }
  };

  //* Función para agregar una respuesta
  const addResponse = () => {
    const newResponse: AdminQuotationResponse = {
      id: Date.now().toString(),
      logistics_service: "Pendiente",
      unit_price: 0,
      incoterms: "EXW",
      total_price: 0,
      express_price: 0,
      service_fee: 0,
      taxes: 0,
      recommendations: "",
      additional_comments: "",
      weight: null,
      volume: null,
      number_of_boxes: null,
      international_freight: null,
      customs_clearance: null,
      delivery: null,
      other_expenses: null,
      files: [],
    };
    setResponses((prev) => [...prev, newResponse]);
  };

  return (
    <>
      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogOverlay />
        <DialogContent className="w-full md:max-w-6xl max-h-[90vh] overflow-y-auto ">
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
                  Cantidad de Respuestas: {responses.length > 0 ? responses.length : 0}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600">
                    Estado de respuesta del producto:
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
                  key={i}
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
                              value={response.unit_price}
                              onChange={(e) =>
                                updateResponse(i, "unit_price", e.target.value)
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
                              value={response.total_price}
                              onChange={(e) =>
                                updateResponse(i, "total_price", e.target.value)
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
                              value={response.express_price}
                              onChange={(e) =>
                                updateResponse(
                                  i,
                                  "express_price",
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
                              value={response.service_fee}
                              onChange={(e) =>
                                updateResponse(i, "service_fee", e.target.value)
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
                            value={response.taxes}
                            onChange={(e) =>
                              updateResponse(i, "taxes", e.target.value)
                            }
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                        {/*Flete Internacional, Desaduanaje, Delivery y Otros Gastos*/}
                       {(response.logistics_service === "Consolidado Express" || response.logistics_service === "Consolidado Grupal Express") && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/*Flete Internacional*/}
                          <div>
                            <Label className="text-sm text-gray-600">
                              Flete Internacional
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={response.international_freight || ""}
                              onChange={(e) =>
                                updateResponse(
                                  i,
                                  "international_freight",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="mt-1"
                            />
                          </div>

                          {/*Desaduanaje*/}
                          <div>
                            <Label className="text-sm text-gray-600">
                              Desaduanaje
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={response.customs_clearance || ""}
                              onChange={(e) =>
                                updateResponse(
                                  i,
                                  "customs_clearance",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/*Delivery*/}
                          <div>
                            <Label className="text-sm text-gray-600">
                              Delivery
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={response.delivery || ""}
                              onChange={(e) =>
                                updateResponse(i, "delivery", e.target.value)
                              }
                              placeholder="0.00"
                              className="mt-1"
                            />
                          </div>

                          {/*Otros Gastos*/}
                          <div>
                            <Label className="text-sm text-gray-600">
                              Otros Gastos
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={response.other_expenses || ""}
                              onChange={(e) =>
                                updateResponse(
                                  i,
                                  "other_expenses",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="mt-1"
                            />
                          </div>
                        </div> 
                        </>
                        )}
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
                                updateResponse(i, "incoterms", value)
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {incotermsOptions.map(
                                  (option: {
                                    value: string;
                                    label: string;
                                  }) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm text-gray-600">
                              Servicio Logístico
                            </Label>
                            <Select
                              value={response.logistics_service}
                              onValueChange={(value) => {
                                updateResponse(i, "logistics_service", value);
                                if (value !== "Almacenaje de Mercancia") {
                                  updateResponse(i, "weight", null);
                                  updateResponse(i, "volume", null);
                                  updateResponse(i, "number_of_boxes", null);
                                }

                                if (value === "Consolidado Express" || value === "Consolidado Grupal Express") {
                                  updateResponse(i, "international_freight", null);
                                  updateResponse(i, "customs_clearance", null);
                                  updateResponse(i, "delivery", null);
                                  updateResponse(i, "other_expenses", null);
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                              <SelectContent>
                                {servicios.map((servicio: { id: number; value: string; label: string }) => (
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
                          {/*Si el servicio logistico es Almacenaje de mercancias muestra el siguiente input*/}
                          {response.logistics_service ===
                            "Almacenaje de Mercancia" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="col-span-1">
                                <Label className="text-sm text-gray-600">
                                  Peso (kg)
                                </Label>
                                <Input
                                  type="number"
                                  value={response.weight || 0}
                                  onChange={(e) =>
                                    updateResponse(i, "weight", e.target.value)
                                  }
                                  placeholder="0"
                                  className="mt-1"
                                />
                              </div>
                              <div className="col-span-1">
                                <Label className="text-sm text-gray-600">
                                  Volumen
                                </Label>
                                <Input
                                  type="number"
                                  value={response.volume || 0}
                                  onChange={(e) =>
                                    updateResponse(i, "volume", e.target.value)
                                  }
                                  placeholder="0"
                                  className="mt-1"
                                />
                              </div>
                              <div className="col-span-1">
                                <Label className="text-sm text-gray-600">
                                  Cajas
                                </Label>
                                <Input
                                  type="number"
                                  value={response.number_of_boxes || 0}
                                  onChange={(e) =>
                                    updateResponse(
                                      i,
                                      "number_of_boxes",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
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
                              onChange={(e) =>
                                updateResponse(
                                  i,
                                  "recommendations",
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
                              value={response.additional_comments}
                              onChange={(e) =>
                                updateResponse(
                                  i,
                                  "additional_comments",
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
                            updateResponse(i, "files", files)
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
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-md text-lg shadow-md flex items-center gap-2"
                  >
                    {isLoadingResponse ? "Enviando..." : "Enviar Respuestas"}
                  </Button>
                }
                title="Confirmar envío de respuestas"
                description={`¿Está seguro de enviar ${
                  responses.length
                } respuesta${
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
    </>
  );
};

export default ResponseQuotation;
