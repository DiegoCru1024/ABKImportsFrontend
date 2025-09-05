import React, { lazy, Suspense } from "react";

// Utils and Interfaces
import type { TabContentProps, ProcessedResponse } from "../utils/interfaces";

// UI Components
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Lazy load view components for better performance
const PendingResponseView = lazy(() => import("../views/PendingResponseView"));
const CompletedResponseView = lazy(() => import("../views/CompletedResponseView"));

interface ExtendedTabContentProps extends TabContentProps {
  isCompactMode?: boolean;
}

/**
 * Tab content component that renders the appropriate view based on response type
 * Handles lazy loading and error boundaries for view components
 */
const TabContent: React.FC<ExtendedTabContentProps> = ({
  response,
  mode,
  onResponseUpdate,
  readonly = false,
  isCompactMode = false,
}) => {
  // Determine which view component to render based on service type
  const getViewComponent = () => {
    const serviceType = response.serviceType.toLowerCase();
    
    // Pending responses (still being processed)
    if (serviceType === 'pendiente') {
      return (
        <PendingResponseView
          response={response.data}
          onProductUpdate={(productId, data) => {
            // Handle product updates for admin mode
            if (onResponseUpdate && mode === 'admin') {
              // Create updated response (implementation depends on your update logic)
              const updatedResponse: ProcessedResponse = {
                ...response,
                // Update the specific product data
                // This would need to be implemented based on your data structure
              };
              onResponseUpdate(updatedResponse);
            }
          }}
          readonly={readonly}
          mode={mode}
          isCompactMode={isCompactMode}
        />
      );
    }
    
    // Completed responses (consolidated maritime, aerial, etc.)
    return (
      <CompletedResponseView
        response={response.data}
        readonly={readonly}
        mode={mode}
        showCalculations={mode === 'admin'}
        isCompactMode={isCompactMode}
      />
    );
  };

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );

  // Error boundary fallback
  const ErrorFallback = ({ error }: { error: Error }) => (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Failed to load response content: {error.message}
      </AlertDescription>
    </Alert>
  );

  // Validate response data
  if (!response || !response.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Invalid response data. Please refresh and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full">
      {/* Response Header */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{response.serviceType}</h3>
            <p className="text-sm text-muted-foreground">
              Response ID: {response.responseId} • 
              Products: {response.displayMetadata.productCount} • 
              Total Value: ${response.displayMetadata.totalValue.toFixed(2)}
            </p>
          </div>
          
          {!isCompactMode && (
            <div className="text-right text-sm text-muted-foreground">
              <div>Correlative: {response.data.quotationInfo?.correlative || 'N/A'}</div>
              <div>Date: {response.data.quotationInfo?.date || 'N/A'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Response Content */}
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary fallback={ErrorFallback}>
          {getViewComponent()}
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TabContent Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default TabContent;