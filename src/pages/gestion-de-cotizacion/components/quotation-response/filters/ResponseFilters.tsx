import React, { useState, useMemo, useCallback } from "react";
import { CalendarDays, X } from "lucide-react";

// Utils and Interfaces
import type { ResponseFiltersProps, FilterCriteria } from "../utils/interfaces";
import { getUniqueServiceTypes } from "../utils/responseProcessing";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * Advanced filtering component for quotation responses
 * Supports multi-criteria filtering and real-time filter application
 */
const ResponseFilters: React.FC<ResponseFiltersProps> = ({
  responses,
  filters,
  onFiltersChange,
  isLoading = false,
}) => {
  // Local state for filter inputs
  const [localServiceType, setLocalServiceType] = useState<string>(filters.serviceType || "");
  const [localResponseId, setLocalResponseId] = useState<string>(filters.responseId || "");
  const [localStartDate, setLocalStartDate] = useState<string>(
    filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ""
  );
  const [localEndDate, setLocalEndDate] = useState<string>(
    filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ""
  );

  // Get available options from responses
  const availableServiceTypes = useMemo(() => {
    return getUniqueServiceTypes(responses);
  }, [responses]);

  const availableResponseIds = useMemo(() => {
    return Array.from(new Set(responses.map(r => r.responseId).filter(id => !id.startsWith('temp-'))));
  }, [responses]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.serviceType) count++;
    if (filters.responseId) count++;
    if (filters.dateRange) count++;
    if (filters.status) count++;
    return count;
  }, [filters]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const newFilters: FilterCriteria = {};

    if (localServiceType) {
      newFilters.serviceType = localServiceType;
    }

    if (localResponseId) {
      newFilters.responseId = localResponseId;
    }

    if (localStartDate || localEndDate) {
      newFilters.dateRange = {
        start: localStartDate ? new Date(localStartDate) : new Date(0),
        end: localEndDate ? new Date(localEndDate) : new Date(),
      };
    }

    onFiltersChange(newFilters);
  }, [localServiceType, localResponseId, localStartDate, localEndDate, onFiltersChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setLocalServiceType("");
    setLocalResponseId("");
    setLocalStartDate("");
    setLocalEndDate("");
    onFiltersChange({});
  }, [onFiltersChange]);

  // Clear specific filter
  const clearFilter = useCallback((filterType: keyof FilterCriteria) => {
    const newFilters = { ...filters };
    delete newFilters[filterType];

    // Also clear local state
    switch (filterType) {
      case 'serviceType':
        setLocalServiceType("");
        break;
      case 'responseId':
        setLocalResponseId("");
        break;
      case 'dateRange':
        setLocalStartDate("");
        setLocalEndDate("");
        break;
    }

    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Service Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service Type</Label>
          <Select
            value={localServiceType}
            onValueChange={setLocalServiceType}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All service types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All service types</SelectItem>
              {availableServiceTypes.map((serviceType) => (
                <SelectItem key={serviceType} value={serviceType}>
                  {serviceType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Response ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="responseId">Response ID</Label>
          <Select
            value={localResponseId}
            onValueChange={setLocalResponseId}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All responses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All responses</SelectItem>
              {availableResponseIds.map((responseId) => (
                <SelectItem key={responseId} value={responseId}>
                  {responseId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Filter */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <div className="relative">
            <Input
              id="startDate"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              disabled={isLoading}
              className="pl-10"
            />
            <CalendarDays className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* End Date Filter */}
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <div className="relative">
            <Input
              id="endDate"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              disabled={isLoading}
              className="pl-10"
            />
            <CalendarDays className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={applyFilters} disabled={isLoading}>
            Apply Filters
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearAllFilters} disabled={isLoading}>
              Clear All
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {responses.length} response{responses.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="text-sm font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.serviceType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Service: {filters.serviceType}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('serviceType')}
                  />
                </Badge>
              )}
              
              {filters.responseId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Response: {filters.responseId}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('responseId')}
                  />
                </Badge>
              )}
              
              {filters.dateRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date Range: {filters.dateRange.start.toLocaleDateString()} - {filters.dateRange.end.toLocaleDateString()}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('dateRange')}
                  />
                </Badge>
              )}
              
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter('status')}
                  />
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResponseFilters;