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

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getTabLabel = (response: any, index: number) => {
    if (response.serviceType === "PENDING") {
      return `Opción ${index + 1}: ${response.serviceLogistic}`;
    } else {
      return `Opción ${index + 1}: ${response.serviceType}`;
    }
  };

  if (isLoading) {
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

  const currentResponseData = responseData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
              {currentResponseData?.responseData?.length || 0} respuesta{(currentResponseData?.responseData?.length || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Información General</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>Correlativo</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {currentResponseData.quotationInfo?.correlative || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha de Respuesta</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {formatDate(currentResponseData.quotationInfo?.date || '')}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Cliente</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {currentResponseData.user?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {currentResponseData.user?.email || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>ID Asesor</span>
                </div>
                <p className="font-semibold text-gray-800 text-xs">
                  {currentResponseData.quotationInfo?.advisorId || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentResponseData?.responseData && currentResponseData.responseData.length > 1 ? (
          <Tabs value={selectedResponseIndex.toString()} onValueChange={(value) => setSelectedResponseIndex(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
              {currentResponseData.responseData.map((response: any, index: number) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="text-sm"
                >
                  {getTabLabel(response, index)}
                </TabsTrigger>
              ))}
            </TabsList>

            {currentResponseData.responseData.map((response: any, index: number) => (
              <TabsContent key={index} value={index.toString()}>
                {response.serviceType === "PENDING" ? (
                  <PendingServiceView serviceResponse={response} />
                ) : (
                  <CompleteServiceView serviceResponse={response} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <>
            {currentResponseData?.responseData && currentResponseData.responseData.length > 0 && (
              <>
                {currentResponseData.responseData[0].serviceType === "PENDING" ? (
                  <PendingServiceView serviceResponse={currentResponseData.responseData[0]} />
                ) : (
                  <CompleteServiceView serviceResponse={currentResponseData.responseData[0]} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}