/**
 * Type definitions for SearchInput component
 */

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

export interface AdvancedSearchInputProps extends SearchInputProps {
  suggestions?: string[];
  showSuggestions?: boolean;
  onSuggestionSelect?: (suggestion: string) => void;
  maxSuggestions?: number;
}