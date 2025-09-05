/**
 * Type definitions for ResponseTable component
 */

import type { ContentQuotationResponseDTO } from '../../types';

export interface ResponseTableProps {
  responses: ContentQuotationResponseDTO[];
  loading?: boolean;
  error?: string;
  onResponseSelect: (responseId: string) => void;
  selectedResponseId?: string;
  showActions?: boolean;
}

export interface ResponseTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: ContentQuotationResponseDTO) => React.ReactNode;
}

export interface ResponseTableCompactProps extends ResponseTableProps {
  showFullDate?: boolean;
}