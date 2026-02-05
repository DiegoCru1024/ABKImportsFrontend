import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2 } from "lucide-react";

import { QuotationKanbanCard } from "../shared/quotation-kanban-card";

import { useKanbanColumn } from "../../hooks/use-kanban-column";

import { Input } from "@/components/ui/input";

interface QuotationsKanbanViewProps {
  onViewDetails: (id: string) => void;
  onViewResponses: (id: string) => void;
}

interface KanbanColumnConfig {
  id: string;
  title: string;
  status: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const kanbanColumns: KanbanColumnConfig[] = [
  {
    id: "draft",
    title: "Borrador",
    status: "draft",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
    textColor: "text-slate-700",
  },
  {
    id: "pending",
    title: "Sin Responder",
    status: "pending",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    textColor: "text-orange-700",
  },
  {
    id: "answered",
    title: "Respondido",
    status: "answered",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    textColor: "text-blue-700",
  },
  {
    id: "approved",
    title: "Aprobado",
    status: "approved",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    textColor: "text-green-700",
  },
  {
    id: "completed",
    title: "Completado",
    status: "completed",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
  },
  {
    id: "cancelled",
    title: "Cancelado",
    status: "cancelled",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
  },
];

export function QuotationsKanbanView({
  onViewDetails,
  onViewResponses,
}: QuotationsKanbanViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-4 border-b border-slate-200 bg-white">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por cliente, correlativo o email..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10 bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto">
        <div className="flex gap-4 p-6 min-w-max h-full">
          {kanbanColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              searchTerm={debouncedSearchTerm}
              onViewDetails={onViewDetails}
              onViewResponses={onViewResponses}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  column: KanbanColumnConfig;
  searchTerm: string;
  onViewDetails: (id: string) => void;
  onViewResponses: (id: string) => void;
}

function KanbanColumn({
  column,
  searchTerm,
  onViewDetails,
  onViewResponses,
}: KanbanColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    quotations,
    totalElements,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useKanbanColumn(column.status, searchTerm);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col w-80 shrink-0 min-h-0 bg-slate-50/50 rounded-xl">
      <div
        className={`shrink-0 p-4 border-b-2 ${column.borderColor} ${column.bgColor} rounded-t-xl`}
      >
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-sm ${column.textColor}`}>
            {column.title}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${column.bgColor} ${column.textColor} border ${column.borderColor}`}
          >
            {totalElements}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-3"
      >
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : quotations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-slate-400 text-center">
                No hay cotizaciones
                <br />
                en este estado
              </p>
            </div>
          ) : (
            <>
              {quotations.map((quotation) => (
                <QuotationKanbanCard
                  key={quotation.quotationId}
                  quotation={quotation}
                  onViewDetails={onViewDetails}
                  onViewResponses={onViewResponses}
                />
              ))}

              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              )}

              {!hasNextPage && quotations.length > 0 && (
                <p className="text-xs text-slate-400 text-center py-2">
                  No hay mas cotizaciones
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
