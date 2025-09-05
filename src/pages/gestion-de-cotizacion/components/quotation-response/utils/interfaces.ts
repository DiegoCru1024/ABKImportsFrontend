import type { QuotationGetResponsesForUsersDTO } from "@/api/interface/quotationResponseInterfaces";

// Enhanced core interfaces for the new architecture

export interface ProcessedResponse {
  uniqueId: string; // serviceType + responseId for unique identification
  serviceType: string;
  responseId: string;
  data: QuotationGetResponsesForUsersDTO;
  isActive: boolean;
  processedAt: string;
  displayMetadata: DisplayMetadata;
}

export interface DisplayMetadata {
  productCount: number;
  totalValue: number;
  hasVariants: boolean;
  totalQuantity: number;
  totalWeight: number;
  totalVolume: number;
}

export interface ResponseGroup {
  serviceType: string;
  responses: ProcessedResponse[];
  defaultActive: ProcessedResponse;
  count: number;
}

export interface FilterCriteria {
  serviceType?: string;
  responseId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string;
}

export interface ResponseError {
  type: 'NETWORK' | 'VALIDATION' | 'PROCESSING' | 'UNKNOWN';
  message: string;
  details?: any;
  retry?: () => void;
  timestamp: string;
}

// Component Props Interfaces

export interface QuotationResponseManagerProps {
  quotationId: string;
  mode: 'admin' | 'user';
  onResponseUpdate?: (response: ProcessedResponse) => void;
  onError?: (error: ResponseError) => void;
  readonly?: boolean;
}

export interface ResponseDisplayContainerProps {
  responses: ProcessedResponse[];
  activeResponseId: string;
  onResponseChange: (responseId: string) => void;
  isLoading: boolean;
  error?: ResponseError|null;
  mode: 'admin' | 'user';
}

export interface ResponseFiltersProps {
  responses: ProcessedResponse[];
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  isLoading?: boolean;
}

export interface TabNavigationProps {
  responseGroups: Record<string, ResponseGroup>;
  activeResponseId: string;
  onTabChange: (responseId: string) => void;
  isLoading?: boolean;
}

export interface TabContentProps {
  response: ProcessedResponse;
  mode: 'admin' | 'user';
  onResponseUpdate?: (response: ProcessedResponse) => void;
  readonly?: boolean;
}

export interface PendingResponseViewProps {
  response: QuotationGetResponsesForUsersDTO;
  onProductUpdate?: (productId: string, data: ProductUpdate) => void;
  readonly?: boolean;
  mode: 'admin' | 'user';
}

export interface CompletedResponseViewProps {
  response: QuotationGetResponsesForUsersDTO;
  readonly?: boolean;
  mode: 'admin' | 'user';
  showCalculations?: boolean;
}

export interface ResponsiveProductTableProps {
  products: ProductData[];
  onProductUpdate?: (productId: string, data: ProductUpdate) => void;
  readonly?: boolean;
  mode: 'admin' | 'user';
  showAdminColumns?: boolean;
}

// Enhanced Product Data Interfaces

export interface ProductData {
  productId: string;
  name: string;
  url?: string;
  comment?: string;
  quantityTotal: number;
  weight: string;
  volume: string;
  number_of_boxes: number;
  adminComment: string;
  seCotizaProducto: boolean;
  attachments: string[];
  variants: VariantData[];
}

export interface VariantData {
  variantId: string;
  size?: string;
  presentation?: string;
  model?: string;
  color?: string;
  quantity: number;
  price: string;
  unitCost?: string;
  importCosts?: string;
  seCotizaVariante: boolean;
  // New fields for enhanced functionality
  precio_unitario?: number;
  precio_express_unitario?: number;
}

export interface ProductUpdate {
  adminComment?: string;
  seCotizaProducto?: boolean;
  variants?: VariantUpdate[];
}

export interface VariantUpdate {
  variantId: string;
  quantity?: number;
  precio_unitario?: number;
  precio_express_unitario?: number;
  seCotizaVariante?: boolean;
}

// Form related interfaces

export interface ProductFormData {
  productId: string;
  adminComment: string;
  seCotizaProducto: boolean;
  variants: VariantFormData[];
}

export interface VariantFormData {
  variantId: string;
  quantity: number;
  precio_unitario: number;
  precio_express_unitario: number;
  seCotizaVariante: boolean;
}

// Responsive design interfaces

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface ResponsiveTableColumn {
  key: string;
  header: string;
  accessor: string;
  width?: string;
  minWidth?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export interface MobileCardProps {
  product: ProductData;
  onEdit?: (productId: string) => void;
  readonly?: boolean;
  showActions?: boolean;
}

// Calculation and Summary interfaces

export interface ResponseSummary {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  averageUnitCost: number;
  totalWeight: number;
  totalVolume: number;
  serviceType: string;
  responseDate: string;
}

export interface CostingCalculation {
  commercialValue: number;
  importCosts: number;
  totalCost: number;
  unitCost: number;
  margin: number;
  finalPrice: number;
}

// API Integration interfaces

export interface ProcessingOptions {
  includeCalculations?: boolean;
  validateData?: boolean;
  generateSummary?: boolean;
  sortByDate?: boolean;
}

export interface EnhancedQuotationResponse extends QuotationGetResponsesForUsersDTO {
  uniqueId: string;
  processedAt: string;
  displayMetadata: DisplayMetadata;
  summary?: ResponseSummary;
  calculations?: CostingCalculation[];
}

// Validation schemas (for runtime validation)

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}