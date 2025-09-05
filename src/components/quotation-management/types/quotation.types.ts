/**
 * Centralized type definitions for quotation domain
 * Provides type safety across components
 */

// Base types
export type QuotationStatus = 'draft' | 'pending' | 'approved' | 'cancelled' | 'completed';
export type ServiceType = 'maritimo' | 'aereo' | 'courier';
export type CargoType = 'FCL' | 'LCL' | 'individual';

// Core quotation data interfaces
export interface QuotationData {
  id: string;
  correlative: string;
  clientName: string;
  clientEmail: string;
  status: QuotationStatus;
  serviceType: ServiceType;
  createdAt: string;
  updatedAt: string;
  products: ProductData[];
  totalValue: number;
  responseCount: number;
  user: UserInfo;
  productQuantity: number;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface ProductData {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  url: string;
  comment: string;
  weight: string;
  volume: string;
  numberOfBoxes: number;
  variants: VariantData[];
  attachments: string[];
  adminComment?: string;
  isQuoted?: boolean;
}

export interface VariantData {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
  price?: number;
  unitCost?: number;
  importCosts?: number;
  isQuoted?: boolean;
}

// Pagination interfaces
export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// Filter and search interfaces
export interface QuotationFilters {
  searchTerm?: string;
  debouncedSearchTerm?: string;
  status?: string;
  serviceType?: ServiceType;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface FilterActions {
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setServiceTypeFilter: (serviceType: ServiceType) => void;
  setDateRange: (range: { from: Date; to: Date }) => void;
  clearFilters: () => void;
}

// Component prop interfaces
export interface QuotationCardProps {
  quotation: QuotationData;
  onViewDetails: (id: string) => void;
  onViewResponses: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export interface QuotationListProps {
  quotations: QuotationData[];
  loading?: boolean;
  error?: string;
  onQuotationSelect: (quotationId: string) => void;
  onViewDetails: (quotationId: string) => void;
  onViewResponses: (quotationId: string) => void;
}

export interface ProductAccordionProps {
  products: ProductData[];
  expandedProducts: Record<string, boolean>;
  onToggleProduct: (productId: string) => void;
  onImageClick?: (images: string[], productName: string, index: number) => void;
  showAdminFeatures?: boolean;
}

// Navigation and view management
export type ViewMode = 'list' | 'details' | 'responses';

export interface NavigationState {
  currentView: ViewMode;
  selectedQuotationId: string | null;
  previousView?: ViewMode;
}

export interface NavigationActions {
  setView: (view: ViewMode) => void;
  selectQuotation: (id: string) => void;
  goBack: () => void;
  reset: () => void;
}

// Status configuration
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export type StatusConfigMap = Record<QuotationStatus, StatusConfig>;

// Error handling
export interface QuotationError {
  code: string;
  message: string;
  details?: unknown;
}

// API response types (legacy compatibility)
export interface QuotationsByUserResponseInterface {
  content: QuotationsByUserResponseInterfaceContent[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface QuotationsByUserResponseInterfaceContent {
  quotationId: string;
  correlative: string;
  status: string;
  service_type: string;
  user: UserInfo;
  productQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationResponseIdInterface {
  quotationId: string;
  correlative: string;
  status: string;
  service_type: string;
  products: ProductoResponseIdInterface[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductoResponseIdInterface {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  url: string;
  comment: string;
  weight: string;
  volume: string;
  number_of_boxes: number;
  variants: VariantResponseIdInterface[];
  attachments: string[];
}

export interface VariantResponseIdInterface {
  variantId: string;
  size: string;
  presentation: string;
  model: string;
  color: string;
  quantity: number;
}