import React from "react";

// Import the main manager component
import QuotationResponseManager from "./QuotationResponseManager";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, FileText } from "lucide-react";

// Utils and Interfaces
import type { QuotationResponseManagerProps } from "./utils/interfaces";

interface AdminQuotationResponseManagerProps extends Omit<QuotationResponseManagerProps, 'mode'> {
  quotationData?: {
    correlative: string;
    date: string;
    status: string;
    service_type: string;
    user?: {
      name: string;
      email: string;
    };
  };
  onBack?: () => void;
}

/**
 * Admin-facing quotation response manager
 * Wraps the main QuotationResponseManager with admin-specific configuration and context
 */
const AdminQuotationResponseManager: React.FC<AdminQuotationResponseManagerProps> = ({
  quotationId,
  quotationData,
  onResponseUpdate,
  onError,
  onBack,
  readonly = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quotations
                </Button>
              )}
              
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Admin Response Management
                </CardTitle>
                
                {quotationData && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      Correlative: <strong>{quotationData.correlative}</strong>
                    </span>
                    <span>
                      Date: <strong>{quotationData.date}</strong>
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

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Admin Mode
              </Badge>
              {!readonly && (
                <Badge variant="default" className="text-xs">
                  Edit Enabled
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* User Information */}
        {quotationData?.user && (
          <CardContent className="pt-0">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium text-sm">Customer Information</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 font-medium">{quotationData.user.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2 font-medium">{quotationData.user.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Response Manager */}
      <QuotationResponseManager
        quotationId={quotationId}
        mode="admin"
        onResponseUpdate={onResponseUpdate}
        onError={onError}
        readonly={readonly}
      />
    </div>
  );
};

export default AdminQuotationResponseManager;