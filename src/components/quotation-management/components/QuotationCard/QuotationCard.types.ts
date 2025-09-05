/**
 * Type definitions for QuotationCard component
 */

import type { QuotationData } from '../../types';

export interface QuotationCardProps {
  quotation: QuotationData;
  onViewDetails: (id: string) => void;
  onViewResponses: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export interface QuotationCardCompactProps extends Omit<QuotationCardProps, 'compact'> {
  showServiceType?: boolean;
}