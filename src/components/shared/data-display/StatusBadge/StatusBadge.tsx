/**
 * Reusable status badge component
 * Provides consistent status display across the application
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusVariant = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'cancelled' 
  | 'completed'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  dotColor?: string;
}

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  customConfig?: StatusConfig;
}

// Default status configurations
const statusConfigs: Record<StatusVariant, StatusConfig> = {
  draft: {
    label: 'Borrador',
    color: 'gray',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    textColor: 'text-gray-800',
    dotColor: 'bg-gray-400',
  },
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-400',
  },
  approved: {
    label: 'Aprobado',
    color: 'green',
    bgColor: 'bg-green-100 hover:bg-green-200',
    textColor: 'text-green-800',
    dotColor: 'bg-green-400',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'red',
    bgColor: 'bg-red-100 hover:bg-red-200',
    textColor: 'text-red-800',
    dotColor: 'bg-red-400',
  },
  completed: {
    label: 'Completado',
    color: 'blue',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-400',
  },
  success: {
    label: 'Éxito',
    color: 'green',
    bgColor: 'bg-green-100 hover:bg-green-200',
    textColor: 'text-green-800',
    dotColor: 'bg-green-400',
  },
  warning: {
    label: 'Advertencia',
    color: 'orange',
    bgColor: 'bg-orange-100 hover:bg-orange-200',
    textColor: 'text-orange-800',
    dotColor: 'bg-orange-400',
  },
  error: {
    label: 'Error',
    color: 'red',
    bgColor: 'bg-red-100 hover:bg-red-200',
    textColor: 'text-red-800',
    dotColor: 'bg-red-400',
  },
  info: {
    label: 'Información',
    color: 'blue',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-400',
  },
  default: {
    label: 'Por defecto',
    color: 'gray',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    textColor: 'text-gray-800',
    dotColor: 'bg-gray-400',
  },
};

// Size configurations
const sizeConfigs = {
  sm: {
    badge: 'text-xs px-2 py-1',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    badge: 'text-sm px-2.5 py-1',
    dot: 'w-2 h-2',
  },
  lg: {
    badge: 'text-base px-3 py-1.5',
    dot: 'w-2.5 h-2.5',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  showDot = false,
  size = 'md',
  className,
  customConfig,
}) => {
  // Determine the variant from status if not provided
  const effectiveVariant = variant || inferVariantFromStatus(status);
  
  // Get configuration
  const config = customConfig || statusConfigs[effectiveVariant] || statusConfigs.default;
  const sizeConfig = sizeConfigs[size];
  
  // Format the display label
  const displayLabel = formatStatusLabel(status, config.label);

  return (
    <Badge
      className={cn(
        config.bgColor,
        config.textColor,
        sizeConfig.badge,
        'inline-flex items-center gap-1.5 border-0 font-medium transition-colors',
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full',
            sizeConfig.dot,
            config.dotColor
          )}
        />
      )}
      {displayLabel}
    </Badge>
  );
};

/**
 * Infers variant from status string
 */
function inferVariantFromStatus(status: string): StatusVariant {
  const normalizedStatus = status.toLowerCase().trim();
  
  // Direct matches
  if (normalizedStatus in statusConfigs) {
    return normalizedStatus as StatusVariant;
  }
  
  // Fuzzy matching
  if (normalizedStatus.includes('draft') || normalizedStatus.includes('borrador')) {
    return 'draft';
  }
  if (normalizedStatus.includes('pending') || normalizedStatus.includes('pendiente')) {
    return 'pending';
  }
  if (normalizedStatus.includes('approved') || normalizedStatus.includes('aprobado')) {
    return 'approved';
  }
  if (normalizedStatus.includes('cancelled') || normalizedStatus.includes('cancelado')) {
    return 'cancelled';
  }
  if (normalizedStatus.includes('completed') || normalizedStatus.includes('completado')) {
    return 'completed';
  }
  if (normalizedStatus.includes('success') || normalizedStatus.includes('exitoso')) {
    return 'success';
  }
  if (normalizedStatus.includes('warning') || normalizedStatus.includes('advertencia')) {
    return 'warning';
  }
  if (normalizedStatus.includes('error')) {
    return 'error';
  }
  
  return 'default';
}

/**
 * Formats status label for display
 */
function formatStatusLabel(status: string, defaultLabel: string): string {
  if (!status) return defaultLabel;
  
  // If status is already formatted, use it
  if (status.length > 2 && status.includes(' ')) {
    return status;
  }
  
  // Use default label for known statuses
  return defaultLabel;
}

/**
 * Utility function to get status configuration
 */
export const getStatusConfig = (variant: StatusVariant): StatusConfig => {
  return statusConfigs[variant] || statusConfigs.default;
};

/**
 * Utility function to register custom status configurations
 */
export const registerStatusConfig = (
  variant: string, 
  config: StatusConfig
): void => {
  statusConfigs[variant as StatusVariant] = config;
};

/**
 * Component variant for displaying multiple statuses
 */
export interface StatusBadgeGroupProps {
  statuses: Array<{
    status: string;
    variant?: StatusVariant;
    count?: number;
  }>;
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadgeGroup: React.FC<StatusBadgeGroupProps> = ({
  statuses,
  showCounts = false,
  size = 'md',
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {statuses.map((item, index) => (
        <StatusBadge
          key={index}
          status={showCounts && item.count ? `${item.status} (${item.count})` : item.status}
          variant={item.variant}
          size={size}
          showDot
        />
      ))}
    </div>
  );
};