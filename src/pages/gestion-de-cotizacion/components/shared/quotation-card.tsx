import {
  Calendar,
  Check,
  Eye,
  EyeOff,
  Package,
  PencilIcon,
  Trash,
} from "lucide-react";

import { ProductGrid } from "./product-grid";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {formatDateTime } from "@/lib/format-time";

import type { QuotationsByUserResponseInterfaceContent } from "@/api/interface/quotationInterface";
import { useDeleteQuotation } from "@/hooks/use-quation";
import { useNavigate } from "react-router-dom";

interface QuotationCardProps {
    quotation: QuotationsByUserResponseInterfaceContent;
    onViewDetails: (id: string) => void;
    onViewResponses: (id: string) => void;
    onOpenImageModal: (
        images: string[],
        productName: string,
        index?: number
    ) => void;
    onDelete?: (id: string) => void;
    onApprove: (id: string, correlative: string) => void;
}

export function QuotationCard({
                                  quotation,
                                  onViewDetails,
                                  onViewResponses,
                                  onOpenImageModal,
                                  onDelete,
                                  onApprove, // AGREGAR AQUÍ
                              }: QuotationCardProps) {
  const navigate = useNavigate();
  const canRespond =
    quotation.status !== "pending" && quotation.status !== "draft";
  const isDraft = quotation.status === "draft";

  const { mutateAsync: mutationDelete } = useDeleteQuotation();

  const handleDeleteQuotation = async () => {
    try {
      await mutationDelete(quotation.quotationId);
    } catch (error) {
      console.error("Error al eliminar la cotización:", error);
    }
  };

  const handleEditQuotation = () => {
    let idQuotation = quotation.quotationId;
    navigate(`/dashboard/editar/${idQuotation}`);
  };

  const renderActionButton = () => {
    if (canRespond) {
        return (
            <div className="gap-4 flex ">
                <Button
                    onClick={() => onApprove(quotation.quotationId, quotation.correlative)}
                    className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white shadow-sm transition-colors"
                >
                    <Check className="w-4 h-4" />
                    Aprobar
                </Button>
                <Button
                    onClick={() => onViewResponses(quotation.quotationId)}
                    className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-emerald-900 shadow-sm transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    Ver respuestas
                </Button>
            </div>
        );
    }

    if (!isDraft) {
      return (
        <Button
          onClick={() => onViewDetails(quotation.quotationId)}
          className="flex items-center gap-2 bg-orange-300 hover:bg-orange-400 text-orange-900 shadow-sm transition-colors"
        >
          <Eye className="w-4 h-4" />
          Responder
        </Button>
      );
    }

    return (
      <Button
        disabled
        className="flex items-center gap-2 bg-slate-300 text-slate-600 cursor-not-allowed"
      >
        <EyeOff className="w-4 h-4" />
        Cotización en borrador
      </Button>
    );
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border border-slate-200/60 rounded-2xl overflow-hidden bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20">
      <div className="p-6 pb-4 border-b border-slate-200/60">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-slate-800 mb-2">
              {quotation.correlative}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Estado de respuesta:
              </span>
              <StatusBadge status={quotation.status} variant="with-dot" />
            </div>
          </div>

          <div className="flex  gap-2 text-right">
            <div className="flex flex-col ">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">
                  {formatDateTime(quotation.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <ConfirmDialog
                trigger={
                  <Button variant="outline" title="Eliminar cotizacion">
                    <Trash className="text-red-600" />
                  </Button>
                }
                title="¿Eliminar cotización?"
                description={`¿Estás seguro de que deseas eliminar la cotización ${quotation.correlative}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleDeleteQuotation}
                variant="destructive"
              />
              <Button
                variant="outline"
                title="Editar cotizacion"
                onClick={handleEditQuotation}
              >
                <PencilIcon className="text-green-600" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/40 rounded-xl border border-blue-200/40">
          <p className="text-sm font-semibold text-slate-800 mb-1">
            Cliente: {quotation.user?.name}
          </p>
          <p className="text-sm text-slate-600">
            Correo: {quotation.user?.email}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 min-h-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="products" className="border-0">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Package className="w-4 h-4 text-orange-400" />
                Productos ({quotation?.products?.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ProductGrid
                products={quotation?.products}
                onOpenImageModal={onOpenImageModal}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="p-6 pt-4 bg-gradient-to-r from-slate-50/40 to-blue-50/30 border-t border-slate-200/60">
        <div className="flex justify-end">{renderActionButton()}</div>
      </div>
    </Card>
  );
}
