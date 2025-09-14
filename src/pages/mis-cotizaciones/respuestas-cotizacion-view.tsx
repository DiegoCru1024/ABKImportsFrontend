import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

import { useGetQuotationById } from "@/hooks/use-quation";
import { useGetQuatitationResponse } from "@/hooks/use-quatitation-response";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SectionHeader } from "@/components/ui/section-header";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

import ResponseSelector from "./components/views/ResponseSelector";
import QuotationResponsePendingView from "./components/table/QuotationResponsePendingView";
import QuotationResponseCompleteView from "./components/table/QuotationResponseCompleteView";

interface QuotationResponse {
  quotationInfo: {
    idQuotationResponse: string;
    correlative: string;
    date: string;
    serviceType: string;
    cargoType: string;
    courier: string;
    incoterm: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  serviceType: string;
  products: any[];
}

export default function RespuestasCotizacionView() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);

  const {
    data: quotationDetail,
    isLoading: quotationLoading,
    isError: quotationError,
  } = useGetQuotationById(quotationId || "");

  const {
    data: quotationResponses,
    isLoading: responsesLoading,
    isError: responsesError,
  } = useGetQuatitationResponse(quotationId || "");

  const handleBack = () => {
    window.history.back();
  };

  const handleResponseSelect = (responseId: string) => {
    setSelectedResponseId(responseId);
  };

  if (!quotationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Error"
          description="ID de cotización inválido"
        />
        <div className="container mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ID de cotización inválido. Por favor verifica la URL e intenta nuevamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (quotationError || responsesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Error"
          description="Error al cargar los datos"
          actions={
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 bg-white/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          }
        />
        <div className="container mx-auto px-4 py-6">
          <ErrorState
            title="Error al cargar los datos de la cotización"
            message="Por favor, intente recargar la página o contacte al administrador."
            variant="card"
          />
        </div>
      </div>
    );
  }

  if (quotationLoading || responsesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Cargando..."
          description="Obteniendo respuestas de cotización"
          actions={
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 bg-white/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          }
        />
        <div className="container mx-auto px-4 py-6">
          <LoadingState
            message="Cargando respuestas de cotización..."
            variant="card"
          />
        </div>
      </div>
    );
  }

  const responses = quotationResponses || [];
  const selectedResponse = selectedResponseId 
    ? responses.find((r: QuotationResponse) => r.quotationInfo.idQuotationResponse === selectedResponseId)
    : responses.length === 1 
      ? responses[0]
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      <SectionHeader
        icon={<FileText className="h-6 w-6 text-white" />}
        title="Respuestas de Cotización"
        description={`Cotización ${quotationDetail?.correlative || quotationId}`}
        actions={
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2 bg-white/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Mis Cotizaciones
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-full overflow-hidden">
        <ResponseSelector
          responses={responses}
          selectedResponseId={selectedResponseId}
          onResponseSelect={handleResponseSelect}
        />

        {selectedResponse ? (
          <div>
            {selectedResponse.serviceType === "Pendiente" ? (
              <QuotationResponsePendingView 
                products={selectedResponse.products}
              />
            ) : (
              <QuotationResponseCompleteView 
                products={selectedResponse.products}
                calculations={{
                  commercialValue: selectedResponse.products
                    .filter((p: any) => p.seCotizaProducto)
                    .reduce((total: number, product: any) => {
                      return total + product.variants
                        .filter((v: any) => v.seCotizaVariante)
                        .reduce((vTotal: number, variant: any) => {
                          return vTotal + (parseFloat(variant.precioUnitario) * variant.quantity);
                        }, 0);
                    }, 0),
                  totalInvestmentImport: 0,
                  factorM: 1.0
                }}
              />
            )}
          </div>
        ) : responses.length > 1 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Selecciona una respuesta
                </h3>
                <p className="text-muted-foreground">
                  Utiliza el selector superior para elegir qué respuesta deseas visualizar
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}