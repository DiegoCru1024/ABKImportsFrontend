import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { QuotationKanbanCard } from "../shared/quotation-kanban-card";

import { Input } from "@/components/ui/input";

import type { QuotationsByUserResponseInterfaceContent } from "@/api/interface/quotationInterface";

interface QuotationsKanbanViewProps {
  quotations: QuotationsByUserResponseInterfaceContent[];
  onViewDetails: (id: string) => void;
  onViewResponses: (id: string) => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string[];
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const kanbanColumns: KanbanColumn[] = [
  {
    id: "draft",
    title: "Borrador",
    status: ["draft"],
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
    textColor: "text-slate-700",
  },
  {
    id: "pending",
    title: "Sin Responder",
    status: ["pending"],
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    textColor: "text-orange-700",
  },
  {
    id: "answered",
    title: "Respondido",
    status: ["answered"],
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    textColor: "text-blue-700",
  },
  {
    id: "observed",
    title: "Observado",
    status: ["observed"],
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    textColor: "text-yellow-700",
  },
  {
    id: "approved",
    title: "Aprobado",
    status: ["approved"],
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    textColor: "text-green-700",
  },
  {
    id: "completed",
    title: "Completado",
    status: ["completed"],
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
  },
  {
    id: "cancelled",
    title: "Cancelado",
    status: ["cancelled"],
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
  },
];

export function QuotationsKanbanView({
  quotations,
  onViewDetails,
  onViewResponses,
}: QuotationsKanbanViewProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredQuotations = useMemo(() => {
    if (!searchTerm.trim()) {
      return quotations;
    }

    const lowerSearch = searchTerm.toLowerCase();
    return quotations.filter(
      (quotation) =>
        quotation.correlative.toLowerCase().includes(lowerSearch) ||
        quotation.user?.name.toLowerCase().includes(lowerSearch) ||
        quotation.user?.email.toLowerCase().includes(lowerSearch)
    );
  }, [quotations, searchTerm]);

  const getQuotationsByStatus = (statusList: string[]) => {
    return filteredQuotations.filter((quotation) =>
      statusList.includes(quotation.status)
    );
  };

  return (
    <div className="grid grid-cols-1 h-full">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por cliente, correlativo o email..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 min-w-max h-full">
          {kanbanColumns.map((column) => {
            const columnQuotations = getQuotationsByStatus(column.status);

            return (
              <div
                key={column.id}
                className="flex flex-col w-80 shrink-0 bg-slate-50/50 rounded-xl"
              >
                <div
                  className={`p-4 border-b-2 ${column.borderColor} ${column.bgColor} rounded-t-xl`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-sm ${column.textColor}`}>
                      {column.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${column.bgColor} ${column.textColor} border ${column.borderColor}`}
                    >
                      {columnQuotations.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <div className="flex flex-col gap-3">
                    {columnQuotations.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-xs text-slate-400 text-center">
                          No hay cotizaciones
                          <br />
                          en este estado
                        </p>
                      </div>
                    ) : (
                      columnQuotations.map((quotation) => (
                        <QuotationKanbanCard
                          key={quotation.quotationId}
                          quotation={quotation}
                          onViewDetails={onViewDetails}
                          onViewResponses={onViewResponses}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
