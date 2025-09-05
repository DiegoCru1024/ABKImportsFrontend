/**
 * Reusable quotation filters component
 * Provides search and filtering functionality
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchInput } from '../../../shared/forms/SearchInput';
import type { QuotationFiltersProps } from './QuotationFilters.types';

export const QuotationFilters: React.FC<QuotationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  serviceTypeFilter,
  onServiceTypeChange,
  onClearFilters,
  showAdvancedFilters = false,
  compact = false,
  className,
  statistics,
}) => {
  const hasActiveFilters = 
    searchTerm.length > 0 || 
    statusFilter !== 'all' || 
    (serviceTypeFilter && serviceTypeFilter !== 'all');

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const serviceTypeOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'maritimo', label: 'Maritime' },
    { value: 'aereo', label: 'Aerial' },
    { value: 'courier', label: 'Courier' },
  ];

  return (
    <Card className={cn("mb-6", className)}>
      <CardContent className={cn("p-6", compact && "p-4")}>
        <div className="space-y-4">
          {/* Main Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Search by quotation ID, correlative, or client name..."
                showClearButton={true}
                showSearchIcon={true}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {statistics?.byStatus[option.value] && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {statistics.byStatus[option.value]}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Type Filter */}
            {showAdvancedFilters && (
              <div className="w-full sm:w-48">
                <Select 
                  value={serviceTypeFilter || 'all'} 
                  onValueChange={onServiceTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Active filters:</span>
              </div>
              
              {searchTerm && (
                <FilterBadge
                  label={`Search: "${searchTerm}"`}
                  onRemove={() => onSearchChange('')}
                />
              )}
              
              {statusFilter !== 'all' && (
                <FilterBadge
                  label={`Status: ${statusOptions.find(o => o.value === statusFilter)?.label}`}
                  onRemove={() => onStatusChange('all')}
                />
              )}
              
              {serviceTypeFilter && serviceTypeFilter !== 'all' && (
                <FilterBadge
                  label={`Service: ${serviceTypeOptions.find(o => o.value === serviceTypeFilter)?.label}`}
                  onRemove={() => onServiceTypeChange?.('all')}
                />
              )}
            </div>
          )}

          {/* Statistics Summary */}
          {statistics && !compact && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Total: {statistics.total} quotations</span>
                {Object.entries(statistics.byStatus).map(([status, count]) => (
                  count > 0 && (
                    <span key={status}>
                      {status}: {count}
                    </span>
                  )
                ))}
              </div>
              
              {showAdvancedFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Individual filter badge component
 */
interface FilterBadgeProps {
  label: string;
  onRemove: () => void;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({ label, onRemove }) => {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
      <span className="text-xs">{label}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-4 w-4 p-0 hover:bg-gray-300"
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
};

/**
 * Compact variant for mobile or constrained spaces
 */
export interface QuotationFiltersCompactProps 
  extends Omit<QuotationFiltersProps, 'compact' | 'showAdvancedFilters'> {
  showStatusOnly?: boolean;
}

export const QuotationFiltersCompact: React.FC<QuotationFiltersCompactProps> = ({
  showStatusOnly = false,
  ...props
}) => {
  return (
    <QuotationFilters
      {...props}
      compact={true}
      showAdvancedFilters={!showStatusOnly}
      className={cn("mb-4", props.className)}
    />
  );
};