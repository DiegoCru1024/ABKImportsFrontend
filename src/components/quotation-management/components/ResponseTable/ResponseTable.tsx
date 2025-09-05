/**
 * Reusable response table component
 * Displays quotation responses in a structured format
 */

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  Calendar, 
  Truck, 
  Plane, 
  Package,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/format-time';
import { StatusBadge } from '../../../shared/data-display/StatusBadge';
import type { ResponseTableProps, ContentQuotationResponseDTO } from '../../types';

export const ResponseTable: React.FC<ResponseTableProps> = ({
  responses,
  loading = false,
  error,
  onResponseSelect,
  selectedResponseId,
  showActions = true,
}) => {
  const columns = useMemo(() => [
    {
      key: 'service_type',
      label: 'Service Type',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getServiceIcon(value)}
          <Badge variant="outline" className="text-xs">
            {value.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      key: 'cargo_type',
      label: 'Cargo Type',
      render: (value: string) => (
        <Badge variant="secondary" className="text-xs">
          {value}
        </Badge>
      ),
    },
    {
      key: 'response_date',
      label: 'Response Date',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3 text-gray-400" />
          {formatDate(value)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, item: ContentQuotationResponseDTO) => (
        showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResponseSelect(item.id_quotation_response)}
              className={cn(
                "h-7 px-2 text-xs",
                selectedResponseId === item.id_quotation_response && 
                "bg-blue-50 border-blue-200"
              )}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        )
      ),
    },
  ], [onResponseSelect, selectedResponseId, showActions]);

  if (loading) {
    return <ResponseTableSkeleton />;
  }

  if (error) {
    return <ResponseTableError message={error} />;
  }

  if (responses.length === 0) {
    return <ResponseTableEmpty />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quotation Responses</span>
          <Badge variant="secondary">{responses.length} responses</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className="h-10">
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => (
                <TableRow 
                  key={response.id_quotation_response}
                  className={cn(
                    "cursor-pointer hover:bg-gray-50",
                    selectedResponseId === response.id_quotation_response && 
                    "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => onResponseSelect(response.id_quotation_response)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="py-3">
                      {column.render 
                        ? column.render(
                            response[column.key as keyof ContentQuotationResponseDTO], 
                            response
                          )
                        : String(response[column.key as keyof ContentQuotationResponseDTO] || '')
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Gets appropriate icon for service type
 */
function getServiceIcon(serviceType: string) {
  switch (serviceType.toLowerCase()) {
    case 'aereo':
    case 'aerial':
      return <Plane className="h-4 w-4 text-blue-500" />;
    case 'maritimo':
    case 'maritime':
      return <Truck className="h-4 w-4 text-green-500" />;
    case 'courier':
      return <Package className="h-4 w-4 text-orange-500" />;
    default:
      return <Package className="h-4 w-4 text-gray-500" />;
  }
}

/**
 * Loading skeleton for ResponseTable
 */
const ResponseTableSkeleton: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Error state for ResponseTable
 */
interface ResponseTableErrorProps {
  message: string;
  onRetry?: () => void;
}

const ResponseTableError: React.FC<ResponseTableErrorProps> = ({ 
  message, 
  onRetry 
}) => {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Responses
          </h3>
          <p className="text-gray-600 mb-4">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Empty state for ResponseTable
 */
const ResponseTableEmpty: React.FC = () => {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Responses Available
          </h3>
          <p className="text-gray-600">
            This quotation hasn't received any responses yet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Compact variant for mobile/small screens
 */
export interface ResponseTableCompactProps extends ResponseTableProps {
  showFullDate?: boolean;
}

export const ResponseTableCompact: React.FC<ResponseTableCompactProps> = ({
  responses,
  loading,
  error,
  onResponseSelect,
  selectedResponseId,
  showActions = true,
  showFullDate = false,
}) => {
  if (loading) return <ResponseTableSkeleton />;
  if (error) return <ResponseTableError message={error} />;
  if (responses.length === 0) return <ResponseTableEmpty />;

  return (
    <div className="space-y-3">
      {responses.map((response) => (
        <Card 
          key={response.id_quotation_response}
          className={cn(
            "cursor-pointer hover:shadow-md transition-shadow",
            selectedResponseId === response.id_quotation_response && 
            "ring-2 ring-blue-500/20 border-blue-200"
          )}
          onClick={() => onResponseSelect(response.id_quotation_response)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getServiceIcon(response.service_type)}
                <Badge variant="outline" className="text-xs">
                  {response.service_type.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {response.cargo_type}
                </Badge>
              </div>
              {showActions && (
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>
                {showFullDate 
                  ? formatDateTime(response.response_date)
                  : formatDate(response.response_date)
                }
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};