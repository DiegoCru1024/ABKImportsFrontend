import { FileText } from "lucide-react";
import { useState } from "react";

import { motion } from "framer-motion";
import { tabs } from "./components/utils/static";

// Importar componentes modulares
import QuotationsListTab from "./components/tabs/QuotationsListTab";
import QuotationDetailsTab from "./components/tabs/QuotationDetailsTab";

// Importar el componente de seguimiento temporal (inline)
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  File,
  Hash,
  Link,
  MessageCircleMore,
  MessageSquare,
  Package,
  Palette,
  Ruler,
} from "lucide-react";
import { useGetAllQuatitationResponse } from "@/hooks/use-quatitation-response";
import type { QuotationResponse } from "./types/interfaces";

// Componente inline para Tracking
interface TrackingTabInlineProps {
  selectedProductId: string;
  selectedProductName: string;
  quotationId: string;
}

const TrackingTabInline: React.FC<TrackingTabInlineProps> = ({
  selectedProductId,
  selectedProductName,
  quotationId,
}) => {
  const {
    data: responses,
    isLoading,
    isError,
  } = useGetAllQuatitationResponse(quotationId);

  // Buscar la respuesta específica para el producto seleccionado
  const productResponse = responses?.find(
    (response: QuotationResponse) => response.product?.id === selectedProductId
  );

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

  const product = productResponse.product || {};

  return (
    <div className="space-y-4 p-6">
      <Card className="py-4">
        <CardTitle className="border-b border-gray-200 px-4">
          <h3 className="flex items-center font-semibold text-gray-900">
            <Package className="mr-2 h-6 w-6 text-orange-500" />
            Detalle de producto
          </h3>
        </CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Nombre del Producto
                  </label>
                </div>
                <Input
                  name="nombre"
                  disabled={true}
                  value={product.name || selectedProductName}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Cantidad
                    </label>
                  </div>
                  <Input
                    name="cantidad"
                    value={product.quantity || ""}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Tamaño
                    </label>
                  </div>
                  <Input
                    name="tamano"
                    type="string"
                    value={product.size || ""}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Color
                    </label>
                  </div>
                  <Input name="color" value={product.color || ""} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      URL
                    </label>
                  </div>
                  <Input
                    name="url"
                    value={product.url || ""}
                    disabled
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Estado
                    </label>
                  </div>
                  <Input
                    name="status"
                    value={productResponse.status || ""}
                    disabled
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Peso (Kg)
                    </label>
                  </div>
                  <Input
                    name="peso"
                    type="number"
                    value={product.weight || ""}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Volumen
                    </label>
                  </div>
                  <Input
                    name="volumen"
                    type="number"
                    value={product.volume || ""}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Nro. cajas
                    </label>
                  </div>
                  <Input
                    name="nro_cajas"
                    type="number"
                    value={product.number_of_boxes || ""}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Comentario
                    </label>
                  </div>
                  <Textarea
                    name="comentario"
                    value={product.comment || ""}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-orange-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Archivos adjuntos
                  </label>
                </div>

                <Button variant="outline" size="sm">
                  Ver archivos adjuntos ({product.attachments?.length || 0})
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Fecha de Respuesta
                  </label>
                </div>
                <Input
                  name="response_date"
                  value={productResponse.response_date || ""}
                  disabled
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardTitle className="border-b border-gray-200 px-4">
          <h3 className="flex items-center font-semibold text-gray-900">
            <MessageCircleMore className="mr-2 h-6 w-6 text-orange-500" />
            Detalle de respuesta
          </h3>
        </CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Precio Unitario
                  </label>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  ${productResponse.unit_price || 0}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Precio Total
                    </label>
                  </div>
                  <p className="font-medium">
                    ${productResponse.total_price || 0}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Precio Express
                    </label>
                  </div>
                  <p className="font-medium">
                    ${productResponse.express_price || 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Incoterms
                    </label>
                  </div>
                  <Input
                    name="incoterms"
                    value={productResponse.incoterms || ""}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Servicio Logístico
                    </label>
                  </div>
                  <Input
                    name="logistics_service"
                    value={productResponse.logistics_service || ""}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Tarifa de Servicio
                    </label>
                  </div>
                  <Input
                    name="service_fee"
                    value={`$${productResponse.service_fee || 0}`}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Impuestos
                    </label>
                  </div>
                  <Input
                    name="taxes"
                    value={`${productResponse.taxes || 0}%`}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Comentarios Adicionales
                  </label>
                </div>
                <Textarea
                  name="additional_comments"
                  value={productResponse.additional_comments || ""}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Recomendaciones
                  </label>
                </div>
                <Textarea
                  name="recommendations"
                  value={productResponse.recommendations || ""}
                  disabled
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4 justify-end pt-6">
        <Button
          variant="outline"
          onClick={() => window.open("https://wa.me/123456789")}
        >
          Solicitar cambios
        </Button>
        <Button onClick={() => window.open("https://wa.me/123456789")}>
          Aceptar cotización
        </Button>
      </div>
    </div>
  );
};

export default function MisCotizacionesView() {
  //********Tabs**** */
  const [tab, setTab] = useState("mis");

  //********Cotización seleccionada**** */
  const [selectedCotizacionId, setSelectedCotizacionId] = useState<string>("");

  //********Producto seleccionado para seguimiento**** */
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");

  // Función para manejar la vista de detalles
  const handleViewDetails = (quotationId: string) => {
    setSelectedCotizacionId(quotationId);
    setTab("detalles");
  };

  // Función para manejar el seguimiento de producto
  const handleViewTracking = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setTab("seguimiento");
  };

  return (
    <div className="min-h-screen  overflow-x-hidden bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10 border-t-2 border-b-2">
      {/* Top Navigation Bar */}
      <div className="border-b-2 px-4 py-4 backdrop-blur-sm sticky border-border/60 bg-background/80">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500  hover:bg-orange-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Mis cotizaciones
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualiza tus cotizaciones, y el
                seguimiento de la cotización
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full p-2">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {/* Tabs mejorados */}
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex">
              {tabs.map((tabItem) => {
                const Icon = tabItem.icon;
                const isActive = tab === tabItem.id;
                const isDisabled = tabItem.disabled;

                return (
                  <button
                    key={tabItem.id}
                    className={`
                    relative flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? "text-white bg-gradient-to-b from-orange-400/2 to-orange-400/90 border-b-2 border-orange-400"
                        : isDisabled
                        ? "text-gray-500 cursor-not-allowed opacity-50"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }
                    ${!isDisabled && !isActive ? "hover:scale-105" : ""}
                  `}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setTab(tabItem.id)}
                    title={tabItem.description}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : ""}`}
                    />
                    <span className="whitespace-nowrap">{tabItem.label}</span>

                    {/* Indicador activo mejorado */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-t-lg"
                        initial={false}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}

                    {/* Efecto hover */}
                    {!isActive && !isDisabled && (
                      <div className="absolute bg-white/0 hover:bg-white/5 transition-colors duration-200 rounded-t-lg" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Línea divisoria sutil */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          </div>

          {/* Contenidos */}
          {tab === "mis" && (
            <QuotationsListTab onViewDetails={handleViewDetails} />
          )}

          {tab === "detalles" && selectedCotizacionId && (
            <QuotationDetailsTab
              selectedQuotationId={selectedCotizacionId}
              onViewTracking={handleViewTracking}
            />
          )}

          {tab === "seguimiento" &&
            selectedProductId &&
            selectedCotizacionId && (
              <TrackingTabInline
                selectedProductId={selectedProductId}
                selectedProductName={selectedProductName}
                quotationId={selectedCotizacionId}
              />
            )}
        </div>
      </div>
    </div>
  );
}
