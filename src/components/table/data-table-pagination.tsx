import { type Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  showSelectedCount?: boolean
  showPagination?: boolean
  showNavigation?: boolean
  pageInfo: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
}

export function DataTablePagination<TData>({
  table,
  showSelectedCount = true,
  showPagination = true,
  showNavigation = true,  
  pageInfo,
  onPageChange,
}: DataTablePaginationProps<TData>) {
  if (!showSelectedCount && !showPagination) {
    return null
  }
  return (
    <div className="flex items-center justify-between px-2">
      {showSelectedCount && (
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} de {pageInfo.totalElements} fila(s) seleccionadas.
        </div>
      )}
      {showPagination && (
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rangos por pagina</p>
            <Select
            value={`${pageInfo.pageSize}`}
            onValueChange={(value) => {
              onPageChange(1, Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageInfo.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {pageInfo.pageNumber } de {pageInfo.totalPages}
          </div>
          {showNavigation && (
            <div className="flex items-center space-x-2">
              <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1, pageInfo.pageSize)}
            disabled={pageInfo.pageNumber === 1}
          >
            <span className="sr-only">Ir a la primera página</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageInfo.pageNumber - 1, pageInfo.pageSize)}
            disabled={pageInfo.pageNumber === 1}
          >
            <span className="sr-only">Ir a la última página</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageInfo.pageNumber + 1, pageInfo.pageSize)}
            disabled={pageInfo.pageNumber === pageInfo.totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(pageInfo.totalPages, pageInfo.pageSize)}
            disabled={pageInfo.pageNumber === pageInfo.totalPages}
          >
            <span className="sr-only">Ir a la ultima página</span>
            <ChevronsRight />
          </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}