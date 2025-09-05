/**
 * Type definitions for ProductAccordion component
 */

import type { ProductData } from '../../types';

export interface ProductAccordionProps {
  products: ProductData[];
  expandedProducts: Record<string, boolean>;
  onToggleProduct: (productId: string) => void;
  onImageClick?: (images: string[], productName: string, index: number) => void;
  showAdminFeatures?: boolean;
}