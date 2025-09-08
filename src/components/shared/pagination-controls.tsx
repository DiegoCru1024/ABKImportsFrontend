import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalElements);

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push(-1); // Ellipsis
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push(-1); // Ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center justify-between mt-8", className)}>
      <div className="text-sm text-gray-700">
        Mostrando {startItem} a {endItem} de {totalElements} resultados
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border-gray-200 hover:border-gray-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        {visiblePages.map((page, index) => {
          if (page === -1) {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                "border-gray-200 hover:border-gray-300",
                page === currentPage &&
                  "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              )}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="border-gray-200 hover:border-gray-300"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}