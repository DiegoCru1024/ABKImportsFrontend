import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { useGetQuatitationResponse } from "@/hooks/use-quatitation-response";
import { useGetQuotationById } from "@/hooks/use-quation";
import { PendingServiceView } from "./components/pending-service-view";
import { CompleteServiceView } from "./components/complete-service-view";

export default function RespuestasCotizacionView() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const navigate = useNavigate();
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<number>(0);

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetQuatitationResponse(quotationId || "");

  const {
    data: quotationDetail,
    isLoading: isLoadingQuotation,
  } = useGetQuotationById(quotationId || "");

  const handleGoBack = () => {
    navigate(-1);
  };



  const getTabLabel = (response: any, index: number) => {
    const serviceLabel = response.responseData?.generalInformation?.serviceLogistic || response.serviceType;
    return `Opción ${index + 1}: ${serviceLabel}`;
  };

  if (isLoading || isLoadingQuotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Cargando respuestas de cotización...</p>
        </div>
      </div>
    );
  }

  if (isError || !responseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h2>
            <p className="text-gray-600 mb-4">
              No se pudieron cargar las respuestas de cotización.
            </p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Respuestas de Cotización
                </h1>
                <p className="text-gray-600 text-sm">
                  Revisa las diferentes opciones de respuesta proporcionadas
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              {responseData?.responses?.length || 0} respuesta{(responseData?.responses?.length || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Información General</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>Correlativo</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {responseData.correlative || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Cliente</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {responseData.user?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {responseData.user?.email || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>ID Cotización</span>
                </div>
                <p className="font-semibold text-gray-800 text-xs">
                  {responseData.quotationId || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {responseData?.responses && responseData.responses.length > 1 ? (
          <Tabs value={selectedResponseIndex.toString()} onValueChange={(value) => setSelectedResponseIndex(parseInt(value))}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(responseData.responses.length, 4)}, 1fr)` }}>
              {responseData.responses.map((response: any, index: number) => (
                <TabsTrigger
                  key={response.responseId}
                  value={index.toString()}
                  className="text-sm"
                >
                  {getTabLabel(response, index)}
                </TabsTrigger>
              ))}
            </TabsList>

            {responseData.responses.map((response: any, index: number) => (
              <TabsContent key={response.responseId} value={index.toString()}>
                {response.serviceType === "PENDING" ? (
                  <PendingServiceView
                    serviceResponse={response}
                    quotationDetail={quotationDetail}
                  />
                ) : (
                  <CompleteServiceView
                    serviceResponse={response}
                    quotationDetail={quotationDetail}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <>
            {responseData?.responses && responseData.responses.length > 0 && (
              <>
                {responseData.responses[0].serviceType === "PENDING" ? (
                  <PendingServiceView
                    serviceResponse={responseData.responses[0]}
                    quotationDetail={quotationDetail}
                  />
                ) : (
                  <CompleteServiceView
                    serviceResponse={responseData.responses[0]}
                    quotationDetail={quotationDetail}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}