import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

// API Hooks
import { useGetQuatitationResponse } from "@/hooks/use-quatitation-response";

// Component Imports
import ResponseDisplayContainer from "./ResponseDisplayContainer";

// Utils and Interfaces
import type {
  QuotationResponseManagerProps,
  ProcessedResponse,
  ResponseError,
  FilterCriteria,
  ResponseGroup,
} from "./utils/interfaces";
import {
  processQuotationResponses,
  groupResponsesByServiceType,
  filterResponses,
  activateResponse,
  shouldReprocessResponses,
} from "./utils/responseProcessing";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

/**
 * Main orchestrator component for quotation response management
 * Handles data fetching, processing, filtering, and error states
 */
const QuotationResponseManager: React.FC<QuotationResponseManagerProps> = ({
  quotationId,
  mode = 'user',
  onResponseUpdate,
  onError,
  readonly = false,
}) => {
  // Local state management
  const [processedResponses, setProcessedResponses] = useState<ProcessedResponse[]>([]);
  const [responseGroups, setResponseGroups] = useState<Record<string, ResponseGroup>>({});
  const [activeResponseId, setActiveResponseId] = useState<string>("");
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [localError, setLocalError] = useState<ResponseError | null>(null);

  // API data fetching
  const {
    data: rawResponses,
    isLoading,
    isError,
    error: apiError,
    refetch,
  } = useGetQuatitationResponse(quotationId);

  // Error handling utility
  const handleError = useCallback((error: any, type: ResponseError['type'] = 'UNKNOWN'): ResponseError => {
    const errorObj: ResponseError = {
      type,
      message: error?.message || 'An unexpected error occurred',
      details: error,
      timestamp: new Date().toISOString(),
      retry: () => refetch(),
    };

    setLocalError(errorObj);
    onError?.(errorObj);
    
    return errorObj;
  }, [onError, refetch]);

  // Process raw responses into enhanced format
  const processResponses = useCallback(() => {
    if (!rawResponses || rawResponses.length === 0) {
      setProcessedResponses([]);
      setResponseGroups({});
      setActiveResponseId("");
      return;
    }

    try {
      const processed = processQuotationResponses(rawResponses, {
        includeCalculations: mode === 'admin',
        validateData: true,
        generateSummary: true,
        sortByDate: true,
      });

      setProcessedResponses(processed);

      // Group responses by service type
      const groups = groupResponsesByServiceType(processed);
      setResponseGroups(groups);

      // Set initial active response
      if (processed.length > 0 && !activeResponseId) {
        const firstGroup = Object.values(groups)[0];
        if (firstGroup?.defaultActive) {
          setActiveResponseId(firstGroup.defaultActive.uniqueId);
        }
      }

      // Clear any existing errors
      setLocalError(null);
      
    } catch (error) {
      console.error('Error processing responses:', error);
      handleError(error, 'PROCESSING');
    }
  }, [rawResponses, mode, activeResponseId, handleError]);

  // Effect: Process responses when data changes
  useEffect(() => {
    processResponses();
  }, [processResponses]);

  // Effect: Handle API errors
  useEffect(() => {
    if (isError && apiError) {
      handleError(apiError, 'NETWORK');
    }
  }, [isError, apiError, handleError]);

  // Effect: Check for stale data and reprocess if needed
  useEffect(() => {
    if (processedResponses.length > 0 && shouldReprocessResponses(processedResponses, 30)) {
      console.log('Responses are stale, triggering refetch...');
      refetch();
    }
  }, [processedResponses, refetch]);

  // Filter responses based on current filter criteria
  const filteredResponses = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return processedResponses;
    }
    return filterResponses(processedResponses, filters);
  }, [processedResponses, filters]);

  // Handle response selection
  const handleResponseChange = useCallback((responseId: string) => {
    setActiveResponseId(responseId);
    
    // Activate the selected response
    const updatedResponses = activateResponse(processedResponses, responseId);
    setProcessedResponses(updatedResponses);

    // Update groups with new active states
    const updatedGroups = groupResponsesByServiceType(updatedResponses);
    setResponseGroups(updatedGroups);
  }, [processedResponses]);

  // Handle response updates (for admin mode)
  const handleResponseUpdate = useCallback((updatedResponse: ProcessedResponse) => {
    setProcessedResponses(prev => prev.map(response => 
      response.uniqueId === updatedResponse.uniqueId ? updatedResponse : response
    ));

    onResponseUpdate?.(updatedResponse);
    toast.success('Response updated successfully');
  }, [onResponseUpdate]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterCriteria) => {
    setFilters(newFilters);
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    setLocalError(null);
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (localError || (isError && !rawResponses)) {
    const displayError = localError || handleError(apiError, 'NETWORK');
    
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{displayError.message}</span>
              {displayError.retry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={displayError.retry}
                  className="ml-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!processedResponses || processedResponses.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="text-muted-foreground text-lg mb-2">
              No responses found
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              This quotation doesn't have any responses yet.
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <div className="w-full space-y-4">
      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              <div>Processed Responses: {processedResponses.length}</div>
              <div>Response Groups: {Object.keys(responseGroups).length}</div>
              <div>Active Response: {activeResponseId}</div>
              <div>Filtered Count: {filteredResponses.length}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Response Display */}
      <ResponseDisplayContainer
        responses={filteredResponses}
        activeResponseId={activeResponseId}
        onResponseChange={handleResponseChange}
        isLoading={isLoading}
        error={localError}
        mode={mode}
        responseGroups={responseGroups}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResponseUpdate={handleResponseUpdate}
        readonly={readonly}
      />
    </div>
  );
};

export default QuotationResponseManager;