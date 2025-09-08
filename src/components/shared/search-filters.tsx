import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
  searchPlaceholder?: string;
  filterPlaceholder?: string;
  className?: string;
  showClearFilter?: boolean;
  onClearFilter?: () => void;
}

export function SearchFilters({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  searchPlaceholder = "Buscar...",
  filterPlaceholder = "Filtrar por estado",
  className,
  showClearFilter = true,
  onClearFilter,
}: SearchFiltersProps) {
  const handleClearFilter = () => {
    onFilterChange("all");
    onClearFilter?.();
  };

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterValue} onValueChange={onFilterChange}>
              <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder={filterPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showClearFilter && filterValue !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilter}
              className="flex items-center gap-2 border-gray-200 hover:border-gray-300"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}