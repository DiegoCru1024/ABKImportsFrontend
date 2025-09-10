import React, { useState } from "react";

// Import components


// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar } from "lucide-react";

// Utils
import { formatDate } from "@/lib/format-time";
import QuotationResponseViewer from "./QuotationResponseViewer";

interface ResponseListContainerProps {
  quotationId: string;
  quotationData?: {
    correlative: string;
    date: string;
    status: string;
    service_type: string;
  };
  onBack?: () => void;
}

/**
 * Container for displaying quotation response list with navigation
 * Provides context and navigation for the response viewer
 */
const ResponseListContainer: React.FC<ResponseListContainerProps> = ({
  quotationId,
  quotationData,
  onBack,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any) => {
    console.error("Response viewing error:", error);
    setError(error.message || "An error occurred while loading responses");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quotation Responses
                </CardTitle>
                
                {quotationData && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      Correlative: <strong>{quotationData.correlative}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(quotationData.date)}
                    </span>
                    <Badge variant="outline">{quotationData.service_type}</Badge>
                    <Badge 
                      variant={quotationData.status === 'ANSWERED' ? 'default' : 'secondary'}
                    >
                      {quotationData.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Viewer */}
      <QuotationResponseViewer
        quotationId={quotationId}
        onError={handleError}
      />
    </div>
  );
};

export default ResponseListContainer;