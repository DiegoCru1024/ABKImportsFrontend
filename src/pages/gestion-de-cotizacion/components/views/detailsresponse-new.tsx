import React, { useState } from "react";

// New Architecture Components
import AdminQuotationResponseManager from "../quotation-response/AdminQuotationResponseManager";

// Legacy imports (for fallback)
import { useGetQuotationById } from "@/hooks/use-quation";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Settings, 
  Eye, 
  FileText,
  ToggleLeft,
  ToggleRight 
} from "lucide-react";

// Utils and interfaces
import type { DetailsResponseProps } from "../utils/interface";

/**
 * Enhanced DetailsResponse component using new architecture
 * Provides both legacy and new architecture options with feature toggle
 */
const DetailsResponse: React.FC<DetailsResponseProps> = ({
  selectedQuotationId,
}) => {
  // State for architecture toggle (temporary during transition)
  const [useNewArchitecture, setUseNewArchitecture] = useState(true);
  const [viewMode, setViewMode] = useState<'response' | 'edit'>('response');

  // Get quotation details
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading quotation details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading quotation details: Unable to fetch quotation data
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No data state
  if (!quotationDetail) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No quotation data found for ID: {selectedQuotationId}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleResponseUpdate = (response: any) => {
    console.log("Response updated:", response);
    // Handle response updates (refresh data, show notifications, etc.)
  };

  const handleError = (error: any) => {
    console.error("Response management error:", error);
    // Handle errors (show notifications, etc.)
  };

  // Main render with new architecture
  if (useNewArchitecture) {
    return (
      <div className="p-6 space-y-6">
        {/* Development Controls */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-800">
                Development Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseNewArchitecture(!useNewArchitecture)}
                    className="flex items-center gap-2"
                  >
                    {useNewArchitecture ? (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        New Architecture
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        Legacy Mode
                      </>
                    )}
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    {useNewArchitecture ? 'Enhanced' : 'Legacy'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'response' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('response')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Responses
                  </Button>
                  <Button
                    variant={viewMode === 'edit' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('edit')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Create Response
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="response" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Responses
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Create/Edit Response
            </TabsTrigger>
          </TabsList>

          <TabsContent value="response" className="space-y-6">
            <AdminQuotationResponseManager
              quotationId={selectedQuotationId}
              quotationData={{
                correlative: quotationDetail.correlative,
                date: quotationDetail.createdAt,
                status: quotationDetail.status,
                service_type: quotationDetail.service_type,
                user: {
                  name: 'Customer',
                  email: 'customer@email.com',
                },
              }}
              onResponseUpdate={handleResponseUpdate}
              onError={handleError}
              readonly={false}
            />
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create/Edit Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Response Creation Form</p>
                  <p className="text-sm">
                    This section will contain the enhanced response creation form.
                    The form will be integrated with the new architecture components.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Legacy fallback (if needed during transition)
  return (
    <div className="p-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Legacy mode not implemented. Please use the new architecture.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DetailsResponse;