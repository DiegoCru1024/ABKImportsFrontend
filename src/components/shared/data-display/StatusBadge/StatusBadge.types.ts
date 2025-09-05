/**
 * Type definitions for StatusBadge component
 */

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