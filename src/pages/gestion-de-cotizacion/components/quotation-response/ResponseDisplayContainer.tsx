import React, { useState, useMemo } from "react";

// Component Imports (these will be created next)
import ResponseFilters from "./filters/ResponseFilters";
import TabNavigation from "./navigation/TabNavigation";
import TabContent from "./navigation/TabContent";

// Utils and Interfaces
import type {
  ResponseDisplayContainerProps,
  ProcessedResponse,
  ResponseGroup,
  FilterCriteria,
} from "./utils/interfaces";
import { findResponseByUniqueId } from "./utils/responseProcessing";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Filter, RefreshCw } from "lucide-react";

interface ExtendedResponseDisplayContainerProps extends ResponseDisplayContainerProps {
  responseGroups: Record<string, ResponseGroup>;
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  onResponseUpdate?: (response: ProcessedResponse) => void;
  readonly?: boolean;
}

/**
 * Container component that manages the display coordination and layout
 * Handles responsive layout switching, loading states, and error display
 */
const ResponseDisplayContainer: React.FC<ExtendedResponseDisplayContainerProps> = ({
  responses,
  activeResponseId,
  onResponseChange,
  isLoading,
  error,
  mode,
  responseGroups,
  filters,
  onFiltersChange,
  onResponseUpdate,
  readonly = false,
}) => {
  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Find the currently active response
  const activeResponse = useMemo(() => {
    return findResponseByUniqueId(responses, activeResponseId);
  }, [responses, activeResponseId]);

  // Get statistics for display
  const statistics = useMemo(() => {
    const totalResponses = responses.length;
    const serviceTypes = Object.keys(responseGroups);
    const hasMultipleTypes = serviceTypes.length > 1;
    
    return {
      totalResponses,
      serviceTypes,
      hasMultipleTypes,
    };
  }, [responses, responseGroups]);

  // Handle filter toggle
  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle compact mode toggle
  const handleToggleCompactMode = () => {
    setIsCompactMode(!isCompactMode);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">
                Quotation Responses
                {statistics.totalResponses > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {statistics.totalResponses} response{statistics.totalResponses !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {statistics.serviceTypes.map((serviceType, index) => (
                  <React.Fragment key={serviceType}>
                    <span>{serviceType}</span>
                    {index < statistics.serviceTypes.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleFilters}
                className={showFilters ? "bg-primary/10" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              {/* Compact Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleCompactMode}
                className={isCompactMode ? "bg-primary/10" : ""}
              >
                <Settings className="h-4 w-4 mr-2" />
                {isCompactMode ? 'Expanded' : 'Compact'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters Section */}
        {showFilters && (
          <>
            <Separator />
            <CardContent className="pt-4">
              <ResponseFilters
                responses={responses}
                filters={filters}
                onFiltersChange={onFiltersChange}
                isLoading={isLoading}
              />
            </CardContent>
          </>
        )}
      </Card>

      {/* Navigation Section */}
      {statistics.hasMultipleTypes && (
        <Card>
          <CardContent className="p-4">
            <TabNavigation
              responseGroups={responseGroups}
              activeResponseId={activeResponseId}
              onTabChange={onResponseChange}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Content Section */}
      <Card className="min-h-[400px]">
        <CardContent className="p-6">
          {activeResponse ? (
            <TabContent
              response={activeResponse}
              mode={mode}
              onResponseUpdate={onResponseUpdate}
              readonly={readonly}
              isCompactMode={isCompactMode}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <div className="text-lg mb-2">No response selected</div>
                <div className="text-sm">
                  {responses.length > 0 
                    ? 'Please select a response from the tabs above'
                    : 'No responses available for this quotation'
                  }
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Information */}
      {activeResponse && !isCompactMode && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  Service Type: <strong>{activeResponse.serviceType}</strong>
                </span>
                <span>
                  Products: <strong>{activeResponse.displayMetadata.productCount}</strong>
                </span>
                <span>
                  Total Quantity: <strong>{activeResponse.displayMetadata.totalQuantity}</strong>
                </span>
                <span>
                  Total Value: <strong>${activeResponse.displayMetadata.totalValue.toFixed(2)}</strong>
                </span>
              </div>
              <div className="text-xs">
                Processed: {new Date(activeResponse.processedAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResponseDisplayContainer;