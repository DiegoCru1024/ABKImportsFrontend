import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime } from "@/lib/format-time";
import { ProductGrid } from "./product-grid";
import type { QuotationsByUserResponseInterfaceContent } from "@/api/interface/quotationInterface";

interface QuotationCardProps {
  quotation: QuotationsByUserResponseInterfaceContent;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onViewDetails: (id: string) => void;
  onViewResponses: (id: string) => void;
  onOpenImageModal: (
    images: string[],
    productName: string,
    index?: number
  ) => void;
}

export function QuotationCard({
  quotation,
  isExpanded,
  onToggleExpanded,
  onViewDetails,
  onViewResponses,
  onOpenImageModal,
}: QuotationCardProps) {
  const canRespond =
    quotation.status !== "pending" && quotation.status !== "draft";
  const isDraft = quotation.status === "draft";

  const renderActionButton = () => {
    if (canRespond) {
      return (
        <Button
          onClick={() => onViewResponses(quotation.quotationId)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Eye className="w-4 h-4" />
          Ver respuestas
        </Button>
      );
    }

    if (!isDraft) {
      return (
        <Button
          onClick={() => onViewDetails(quotation.quotationId)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
        >
          <Eye className="w-4 h-4" />
          Responder
        </Button>
      );
    }

    return (
      <Button
        disabled
        className="flex items-center gap-2 bg-slate-400 text-white cursor-not-allowed"
      >
        <EyeOff className="w-4 h-4" />
        Cotización en borrador
      </Button>
    );
  };

  return (
  
      <Card className=" hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden bg-white">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-2xl text-gray-900">
                    {quotation.correlative}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Estado de respuesta:
                  </span>
                  <StatusBadge status={quotation.status} variant="with-dot" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  Cliente: {quotation.user?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Correo: {quotation.user?.email}
                </p>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatDate(quotation.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatDateTime(quotation.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="px-6 flex-1 min-h-0">
          <div className="flex items-center justify-between py-4 border-b border-gray-50">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Productos ({quotation.products.length})
            </h4>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ocultar productos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Mostrar productos
                </>
              )}
            </Button>
          </div>

          {isExpanded && (
            <div className="py-4">
              <ProductGrid
                products={quotation.products}
                onOpenImageModal={onOpenImageModal}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 border-t border-gray-100">
          <div className="flex justify-end">{renderActionButton()}</div>
        </div>
      </Card>
   
  );
}
