/**
 * Reusable card component for displaying quotation information
 * Pure component with no business logic
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  MessageSquare, 
  Calendar, 
  User, 
  Package, 
  ChevronDown,
  ChevronUp,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../../../shared/data-display/StatusBadge';
import { formatDate } from '@/lib/format-time';
import type { QuotationCardProps } from '../../types';

export const QuotationCard: React.FC<QuotationCardProps> = ({
  quotation,
  onViewDetails,
  onViewResponses,
  showActions = true,
  compact = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewDetails = () => {
    onViewDetails(quotation.id);
  };

  const handleViewResponses = () => {
    onViewResponses(quotation.id);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow duration-200 border-l-4",
      getStatusBorderColor(quotation.status),
      { "shadow-sm": compact },
      className
    )}>
      <CardHeader className={cn("pb-3", { "pb-2 px-4 pt-4": compact })}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold text-gray-900",
                compact ? "text-sm" : "text-base"
              )}>
                {quotation.correlative}
              </h3>
              <StatusBadge 
                status={quotation.status} 
                size={compact ? "sm" : "md"}
                showDot 
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{quotation.clientName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(quotation.createdAt)}</span>
              </div>
            </div>
          </div>
          
          {!compact && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {quotation.serviceType.toUpperCase()}
              </Badge>
              {quotation.responseCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {quotation.responseCount} responses
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("pt-0", { "px-4": compact })}>
        {/* Product Summary */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="h-4 w-4" />
            <span>{quotation.productQuantity} products</span>
          </div>
          
          {quotation.products && quotation.products.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="h-6 px-2 text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show details
                </>
              )}
            </Button>
          )}
        </div>

        {/* Expanded Product Details */}
        {isExpanded && quotation.products && (
          <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
            {quotation.products.slice(0, 3).map((product, index) => (
              <div key={product.productId} className="flex justify-between items-center text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-gray-500 text-xs">
                    Qty: {product.quantity} | Size: {product.size} | Color: {product.color}
                  </p>
                </div>
                {product.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(product.url, '_blank')}
                    className="h-6 w-6 p-0 ml-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            {quotation.products.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{quotation.products.length - 3} more products
              </p>
            )}
          </div>
        )}

        {/* Total Value */}
        {quotation.totalValue > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-semibold text-gray-900">
              ${quotation.totalValue.toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className={cn("pt-3 gap-2", { "px-4 pb-4": compact })}>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={handleViewDetails}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {quotation.responseCount > 0 ? (
            <Button
              variant="default"
              size={compact ? "sm" : "default"}
              onClick={handleViewResponses}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Responses ({quotation.responseCount})
            </Button>
          ) : (
            <Button
              variant="default"
              size={compact ? "sm" : "default"}
              onClick={handleViewDetails}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Gets the appropriate border color based on quotation status
 */
function getStatusBorderColor(status: string): string {
  const statusColors = {
    draft: 'border-l-gray-400',
    pending: 'border-l-yellow-400',
    approved: 'border-l-green-400',
    cancelled: 'border-l-red-400',
    completed: 'border-l-blue-400',
  };
  
  return statusColors[status.toLowerCase() as keyof typeof statusColors] || 'border-l-gray-400';
}

/**
 * Compact variant of QuotationCard for list views
 */
export interface QuotationCardCompactProps extends Omit<QuotationCardProps, 'compact'> {
  showServiceType?: boolean;
}

export const QuotationCardCompact: React.FC<QuotationCardCompactProps> = ({
  showServiceType = true,
  ...props
}) => {
  return (
    <QuotationCard
      {...props}
      compact={true}
      className={cn("mb-2", props.className)}
    />
  );
};