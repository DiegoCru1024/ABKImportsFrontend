"use client";

import { type Table } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/table/data-table-view-options";
import { Search } from "lucide-react";
import React from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  showSearch?: boolean;
  showViewOptions?: boolean;
  searchPlaceholder?: string;
  searchColumn?: string;
  searchTerm: string; // Recibimos el término de búsqueda actual
  onSearch: (searchTerm: string) => void; // Función para actualizar el estado de búsqueda
  filterChange?: (estado?: string) => void; // 🔥 Agregamos el filtro
}

export function DataTableToolbar<TData>({
  table,
  showSearch = true,
  showViewOptions = true,
  searchTerm,
  onSearch,
}: DataTableToolbarProps<TData>) {
  const [debounceTimeout, setDebounceTimeout] =
    React.useState<NodeJS.Timeout | null>(null);
  const [inputValue, setInputValue] = React.useState(searchTerm);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sincronizar el valor del input con el searchTerm cuando cambie
  React.useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Limpiar el input cuando se monta el componente para evitar autocompletado
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setInputValue("");
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value); // Actualizar el estado local inmediatamente

    // Debounce para evitar llamadas excesivas al API
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      onSearch(value); // Actualizamos el término de búsqueda en el padre
    }, 300); // Espera 300ms antes de hacer la llamada

    setDebounceTimeout(timeout);
  };

  const handleInputFocus = () => {
    // Limpiar cualquier autocompletado cuando el usuario hace focus
    if (inputRef.current && inputRef.current.value !== inputValue) {
      inputRef.current.value = inputValue;
    }
  };

  const handleInputBlur = () => {
    // Asegurar que el valor del input coincida con el estado
    if (inputRef.current && inputRef.current.value !== inputValue) {
      inputRef.current.value = inputValue;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {showSearch && (
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="Buscar"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="h-8 w-48 md:w-72"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
            />
            <Search className="absolute right-2 top-1.5 h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showViewOptions && <DataTableViewOptions table={table} />}
      </div>
    </div>
  );
}
