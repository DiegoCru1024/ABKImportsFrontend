/**
 * Reusable search input component with debouncing
 * Provides consistent search functionality across the application
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  showSearchIcon?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  showClearButton = true,
  showSearchIcon = true,
  autoFocus = false,
  disabled = false,
  className,
  inputClassName,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        onChange(internalValue);
      }, debounceMs);

      return () => clearTimeout(timer);
    } else {
      onChange(internalValue);
    }
  }, [internalValue, onChange, debounceMs]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange('');
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(internalValue);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [internalValue, onSearch, handleClear]);

  const handleSearchClick = useCallback(() => {
    onSearch?.(internalValue);
  }, [internalValue, onSearch]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const hasValue = internalValue.length > 0;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {showSearchIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className={cn(
              'h-4 w-4 transition-colors',
              isFocused ? 'text-blue-500' : 'text-gray-400'
            )} />
          </div>
        )}
        
        <Input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className={cn(
            'transition-all duration-200',
            showSearchIcon && 'pl-10',
            (showClearButton && hasValue) && 'pr-20',
            isFocused && 'ring-2 ring-blue-500/20 border-blue-500',
            inputClassName
          )}
        />

        {showClearButton && hasValue && !disabled && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
            {onSearch && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSearchClick}
                className="h-6 w-6 p-0 hover:bg-gray-100"
                title="Search"
              >
                <Search className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Optional loading or status indicators could go here */}
    </div>
  );
};

/**
 * Variant with advanced features like suggestions
 */
export interface AdvancedSearchInputProps extends SearchInputProps {
  suggestions?: string[];
  showSuggestions?: boolean;
  onSuggestionSelect?: (suggestion: string) => void;
  maxSuggestions?: number;
}

export const AdvancedSearchInput: React.FC<AdvancedSearchInputProps> = ({
  suggestions = [],
  showSuggestions = false,
  onSuggestionSelect,
  maxSuggestions = 5,
  ...props
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!props.value || !showSuggestions) {
      setFilteredSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const filtered = suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(props.value!.toLowerCase())
      )
      .slice(0, maxSuggestions);

    setFilteredSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  }, [props.value, suggestions, showSuggestions, maxSuggestions]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onSuggestionSelect?.(suggestion);
    setShowDropdown(false);
  }, [onSuggestionSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle arrow key navigation in suggestions
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Implementation for keyboard navigation would go here
    }
    
    // Call parent handler
    if (props.onSearch && e.key === 'Enter') {
      props.onSearch(props.value || '');
      setShowDropdown(false);
    }
  }, [props]);

  return (
    <div className="relative">
      <SearchInput
        {...props}
        onKeyDown={handleKeyDown}
      />
      
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-md last:rounded-b-md"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};