import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubQuotationResumenDto } from "@/api/interface/orden-compra-interface.ts";
import {ConfirmDeleteDialog} from "@/pages/orden-compra/components/ConfirmDeleteDialog.tsx";

interface SubQuotationCardProps {
    quotation: SubQuotationResumenDto;
    onViewDetails: (id: string) => void;
    isDeleteMode?: boolean;
    ordenId?: string;
}

export function SubQuotationCard({
                                     quotation,
                                     onViewDetails,
                                     isDeleteMode = false,
                                     ordenId
                                 }: SubQuotationCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const porcentajeCompra =
        quotation.total_items_solicitados > 0
            ? Math.round((quotation.total_items_comprados / quotation.total_items_solicitados) * 100)
            : 0;

    const handleCardClick = () => {
        if (!isDeleteMode) {
            onViewDetails(quotation.id_sub_quotation);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteDialogOpen(true);
    };

    return (
        <>
            <div
                className={`group overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 ${
                    isDeleteMode
                        ? "border-red-300 hover:border-red-500"
                        : "border-gray-200 hover:shadow-md hover:border-orange-400 cursor-pointer"
                }`}
                onClick={handleCardClick}
            >
                {/* Contenido principal */}
                <div className="p-6 relative">
                    {/* Botón de eliminar en la esquina superior derecha */}
                    {isDeleteMode && (
                        <button
                            onClick={handleDeleteClick}
                            className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors z-10"
                            title="Eliminar sub-quotation"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <div className="flex items-center justify-between gap-6">
                        {/* Información izquierda */}
                        <div className="flex-1 space-y-4">
                            {/* Header con correlativo y versión */}
                            <div className="flex items-center gap-3">
                                <div className="text-lg font-semibold text-gray-900">
                                    {quotation.quotation_correlative}
                                </div>
                                <div className="px-2 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-600">
                                    v{quotation.version}
                                </div>
                            </div>

                            {/* Cliente */}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Cliente</p>
                                <p className="text-base font-medium text-gray-900">{quotation.client_name}</p>
                            </div>

                            {/* Tipo de orden */}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Tipo de orden</p>
                                <p className="text-base font-medium text-gray-900">{quotation.type}</p>
                            </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Solicitados</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {quotation.total_items_solicitados}
                                </p>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Comprados</p>
                                <p className="text-2xl font-semibold text-orange-600">
                                    {quotation.total_items_comprados}
                                </p>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">Progreso</p>
                                <p className="text-2xl font-semibold text-orange-600">
                                    {porcentajeCompra}%
                                </p>
                            </div>
                        </div>

                        {/* Botón - Solo visible si NO está en modo eliminar */}
                        {!isDeleteMode && (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(quotation.id_sub_quotation);
                                }}
                                variant="ghost"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                                Ver detalles
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog de confirmación */}
            <ConfirmDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                ordenId={ordenId || ""}
                subQuotationId={quotation.id_sub_quotation}
                quotationName={quotation.quotation_correlative}
            />
        </>
    );
}