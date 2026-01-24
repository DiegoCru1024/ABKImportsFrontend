import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

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

  console.log(
    "Esta es la información que viene de getQuotationReponse",
    JSON.stringify(responseData, null, 2)
  );

  const { data: quotationDetail, isLoading: isLoadingQuotation } =
    useGetQuotationById(quotationId || "");

  console.log(
    "Esta es la información que viene de quotationDetail",
    JSON.stringify(quotationDetail, null, 2)
  );

  const handleGoBack = () => {
    navigate(-1);
  };

  const getTabLabel = (response: any, index: number) => {
    const serviceLabel =
      response.responseData?.generalInformation?.serviceLogistic ||
      response.serviceType;
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Error al cargar
            </h2>
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
        <div className="w-full px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-6 space-y-6">
        {responseData?.responses && responseData.responses.length > 0 && (
          <div className="w-full space-y-6">
            <Tabs
              value={selectedResponseIndex.toString()}
              onValueChange={(value) => setSelectedResponseIndex(parseInt(value))}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-8 bg-white border-b border-gray-300 pb-2">
                {responseData.responses.map((response: any, index: number) => (
                  <button
                    key={response.responseId}
                    onClick={() => setSelectedResponseIndex(index)}
                    className={`relative px-6 py-3 text-sm font-medium transition-all ${
                      index === selectedResponseIndex
                        ? "text-gray-900 border-b-[3px] border-gray-900"
                        : "text-gray-500 border-b-[3px] border-transparent hover:text-gray-700"
                    }`}
                  >
                    {getTabLabel(response, index)}
                    {index === selectedResponseIndex && (
                      <span className="absolute -top-1 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3 w-3"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Correlativo:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {responseData.correlative || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">Cliente:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {responseData.user?.name || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({responseData.user?.email || "N/A"})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">ID:</span>
                        <span className="text-xs font-mono text-gray-700">
                          {responseData.quotationId?.slice(0, 13) || "N/A"}...
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 space-y-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Configuración del Servicio
                      </h3>
                      {responseData.responses.map((response: any, index: number) => (
                        <TabsContent key={response.responseId} value={index.toString()} className="mt-0">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-x-32 gap-y-4">
                              <div key="service" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  <span className="text-sm text-gray-600">Servicio</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {response.responseData?.generalInformation?.serviceLogistic || "N/A"}
                                </p>
                              </div>
                              <div key="incoterm" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm text-gray-600">Incoterm</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {response.responseData?.generalInformation?.incoterm || "N/A"}
                                </p>
                              </div>
                              <div key="cargoType" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                  <span className="text-sm text-gray-600">Tipo Carga</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {response.responseData?.generalInformation?.cargoType || "N/A"}
                                </p>
                              </div>
                              <div key="courier" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm text-gray-600">Courier</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {response.responseData?.generalInformation?.courier || "N/A"}
                                </p>
                              </div>
                            </div>

                            {response.serviceType === "MARITIME" && response.responseData?.maritimeConfig && (
                              <div className="pt-4 border-t border-gray-200 space-y-4">
                                <div className="flex items-center gap-2">
                                  <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                  </svg>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Configuración Marítima
                                  </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-x-32 gap-y-4">
                                  <div key="regime" className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <svg className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                      </svg>
                                      <span className="text-sm text-gray-600">Régimen</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {response.responseData.maritimeConfig.regime || "N/A"}
                                    </p>
                                  </div>
                                  <div key="customs" className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                      <span className="text-sm text-gray-600">Aduana</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {response.responseData.maritimeConfig.customs || "N/A"}
                                    </p>
                                  </div>
                                  <div key="naviera" className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                      </svg>
                                      <span className="text-sm text-gray-600">Naviera</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {response.responseData.maritimeConfig.naviera || "N/A"}
                                    </p>
                                  </div>
                                  <div key="originPort" className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <span className="text-sm text-gray-600">Puerto Origen</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {response.responseData.maritimeConfig.originPort || "N/A"}
                                    </p>
                                  </div>
                                  <div key="destinationPort" className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <span className="text-sm text-gray-600">Puerto Destino</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {response.responseData.maritimeConfig.destinationPort || "N/A"}
                                    </p>
                                  </div>
                                  <div key="transitTime" className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-sm text-gray-600">Tiempo de Tránsito</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {response.responseData.maritimeConfig.transitTime || 0} días
                                    </p>
                                  </div>
                                  <div key="originCountry" className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-sm text-gray-600">País Origen</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {response.responseData.maritimeConfig.originCountry || "N/A"}
                                    </p>
                                  </div>
                                  <div key="destinationCountry" className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-sm text-gray-600">País Destino</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {response.responseData.maritimeConfig.destinationCountry || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {response.serviceType === "COTIZACION DE ORIGEN" && (
                              <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-start gap-16">
                                  <div className="flex items-center space-x-2">
                                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className="text-sm text-gray-600">Productos:</span>
                                    <span className="text-sm font-bold text-gray-900">{response.products?.length || 0}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    </svg>
                                    <span className="text-sm text-gray-600">Peso:</span>
                                    <span className="text-sm font-bold text-gray-900">
                                      {quotationDetail?.products?.reduce((sum: number, p: any) => sum + parseFloat(p.weight || 0), 0).toFixed(2)} kg
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className="text-sm text-gray-600">Volumen:</span>
                                    <span className="text-sm font-bold text-gray-900">
                                      {quotationDetail?.products?.reduce((sum: number, p: any) => sum + parseFloat(p.volume || 0), 0).toFixed(2)} m³
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6">
                  {responseData.responses.map((response: any, index: number) => (
                    <TabsContent key={response.responseId} value={index.toString()}>
                      {response.serviceType === "COTIZACION DE ORIGEN" ? (
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
                </div>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
