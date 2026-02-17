import { Calendar, Eye, Package } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { formatDate } from "@/lib/format-time";

import type { QuotationsByUserResponseInterfaceContent } from "@/api/interface/quotationInterface";

interface QuotationKanbanCardProps {
  quotation: QuotationsByUserResponseInterfaceContent;
  onViewDetails: (id: string) => void;
  onViewResponses: (id: string) => void;
}

export function QuotationKanbanCard({
  quotation,
  onViewDetails,
  onViewResponses,
}: QuotationKanbanCardProps) {
  const isDraft = quotation.status === "draft";
  const canRespond =
    quotation.status !== "pending" && quotation.status !== "draft";

  return (
    <Card
      className={`p-4 transition-all duration-200 border rounded-lg group ${
        isDraft
          ? "bg-slate-100 border-slate-200 opacity-70"
          : "bg-white hover:shadow-md border-slate-200 cursor-pointer"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`font-semibold text-sm line-clamp-1 flex-1 ${
              isDraft ? "text-slate-400" : "text-slate-800"
            }`}
          >
            {quotation.correlative}
          </h4>
          <div
            className={`flex items-center gap-1 text-xs shrink-0 ${
              isDraft ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>{formatDate(quotation.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p
            className={`text-xs font-medium line-clamp-1 ${
              isDraft ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {quotation.user?.name}
          </p>
          <p
            className={`text-xs line-clamp-1 ${
              isDraft ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {quotation.user?.email}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div
            className={`flex items-center gap-1 text-xs ${
              isDraft ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <Package
              className={`w-3 h-3 ${isDraft ? "text-slate-400" : "text-orange-400"}`}
            />
            <span>{quotation?.products?.length || 0} productos</span>
          </div>

          {isDraft ? (
            <Button
              size="sm"
              disabled
              className="h-7 px-2 text-xs bg-slate-200 text-slate-400 cursor-not-allowed"
            >
              <Eye className="w-3 h-3 mr-1" />
              Borrador
            </Button>
          ) : canRespond ? (
            <Button
              size="sm"
              onClick={() => onViewResponses(quotation.quotationId)}
              className="h-7 px-2 text-xs bg-emerald-400 hover:bg-emerald-500 text-emerald-900"
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onViewDetails(quotation.quotationId)}
              className="h-7 px-2 text-xs bg-orange-300 hover:bg-orange-400 text-orange-900"
            >
              <Eye className="w-3 h-3 mr-1" />
              Responder
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
