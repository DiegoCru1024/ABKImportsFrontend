"use client";
import React from "react";
import { useParams } from "react-router-dom";

// New Architecture Components
import ResponseListContainer from "./components/quotation-responses/ResponseListContainer";

// Legacy components and hooks (for backwards compatibility)
import { useGetQuotationById } from "@/hooks/use-quation";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Enhanced quotation responses view using new architecture
 * Features improved filtering, responsive design, and error handling
 */
export default function RespuestasCotizacionView() {
  const { quotationId } = useParams<{ quotationId: string }>();

  // Get quotation details for context
  const {
    data: quotationDetail,
    isLoading: quotationLoading,
    isError: quotationError,
  } = useGetQuotationById(quotationId || "");

  // Navigation handler
  const handleBack = () => {
    window.history.back();
  };

  // Validation
  if (!quotationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Invalid quotation ID. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Error handling
  if (quotationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
        <div className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Quotations
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading quotation data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading state
  if (quotationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
        <div className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Quotations
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">Loading quotation responses...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main render with new architecture
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
      <div className="p-6">
        <ResponseListContainer
          quotationId={quotationId}
          quotationData={quotationDetail ? {
            correlative: quotationDetail.correlative,
            date: quotationDetail.createdAt,
            status: quotationDetail.status,
            service_type: quotationDetail.service_type,
          } : undefined}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}