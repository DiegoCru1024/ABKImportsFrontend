import { formatDate, formatDateTime } from "@/lib/format-time";

/**
 * Format date for display in response components
 */
export const formatResponseDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return formatDate(dateString);
};

/**
 * Format datetime for detailed views
 */
export const formatResponseDateTime = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return formatDateTime(dateString);
};

/**
 * Format service type for display
 */
export const formatServiceType = (serviceType: string): string => {
  const serviceTypeMap: Record<string, string> = {
    'Pendiente': 'Pendiente',
    'Consolidado Marítimo': 'Consolidado Marítimo',
    'Consolidado Aéreo': 'Consolidado Aéreo',
    'Express': 'Express',
    'Courier': 'Courier',
  };
  
  return serviceTypeMap[serviceType] || serviceType;
};

/**
 * Format product quantity with units
 */
export const formatQuantity = (quantity: number, unit?: string): string => {
  const formattedNumber = new Intl.NumberFormat('en-US').format(quantity);
  return unit ? `${formattedNumber} ${unit}` : formattedNumber;
};

/**
 * Format weight with units
 */
export const formatWeight = (weight: string | number): string => {
  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
  if (isNaN(numWeight)) return '0 kg';
  return `${formatQuantity(numWeight)} kg`;
};

/**
 * Format volume with units
 */
export const formatVolume = (volume: string | number): string => {
  const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (isNaN(numVolume)) return '0 m³';
  return `${formatQuantity(numVolume)} m³`;
};

/**
 * Format currency with proper symbol and decimals
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD',
  showSymbol: boolean = true
): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return showSymbol ? formatted : formatted.replace(/[^\d.,]/g, '');
};

/**
 * Format percentage with proper decimal places
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format response status for badges
 */
export const formatResponseStatus = (status: string): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} => {
  const statusMap: Record<string, { label: string; variant: any }> = {
    'PENDING': { label: 'Pendiente', variant: 'outline' },
    'ANSWERED': { label: 'Respondida', variant: 'default' },
    'PROCESSED': { label: 'Procesada', variant: 'secondary' },
    'COMPLETED': { label: 'Completada', variant: 'default' },
    'CANCELLED': { label: 'Cancelada', variant: 'destructive' },
  };
  
  return statusMap[status] || { label: status, variant: 'outline' };
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format correlative number
 */
export const formatCorrelative = (correlative: string): string => {
  if (!correlative) return 'N/A';
  return correlative.toUpperCase();
};

/**
 * Format product name for display
 */
export const formatProductName = (name: string, maxLength?: number): string => {
  if (!name) return 'Producto sin nombre';
  return maxLength ? truncateText(name, maxLength) : name;
};

/**
 * Format variant details into a readable string
 */
export const formatVariantDetails = (variant: {
  size?: string;
  color?: string;
  model?: string;
  presentation?: string;
}): string => {
  const details = [];
  
  if (variant.size) details.push(`Size: ${variant.size}`);
  if (variant.color) details.push(`Color: ${variant.color}`);
  if (variant.model) details.push(`Model: ${variant.model}`);
  if (variant.presentation) details.push(`Presentation: ${variant.presentation}`);
  
  return details.length > 0 ? details.join(', ') : 'Sin detalles';
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format URL for display (remove protocol, truncate if needed)
 */
export const formatUrl = (url: string, maxLength: number = 40): string => {
  if (!url) return '';
  
  let displayUrl = url.replace(/^https?:\/\//, '');
  return truncateText(displayUrl, maxLength);
};

/**
 * Format time duration in a human readable way
 */
export const formatDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
};

/**
 * Format admin comment for display with proper line breaks
 */
export const formatAdminComment = (comment: string): string => {
  if (!comment) return 'Sin comentarios';
  return comment.replace(/\n/g, '<br />');
};

/**
 * Format response ID for display
 */
export const formatResponseId = (responseId: string): string => {
  if (!responseId) return 'N/A';
  if (responseId.startsWith('temp-')) return 'Temporal';
  return responseId;
};

/**
 * Format attachment file name for display
 */
export const formatAttachmentName = (fileName: string): string => {
  if (!fileName) return 'Archivo';
  
  // Extract just the filename from path
  const name = fileName.split('/').pop() || fileName;
  
  // Truncate if too long
  return truncateText(name, 30);
};