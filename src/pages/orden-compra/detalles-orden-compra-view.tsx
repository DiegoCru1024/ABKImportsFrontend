import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetSubQuotationsDeOrden } from "@/hooks/use-orden-compra.ts";
import { SubQuotationCard } from "@/pages/orden-compra/components/sub-quotation-card.tsx";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {CreateOrderDialog} from "@/pages/orden-compra/components/CreateOrderDialog.tsx";
import type {PurchaseOrderType} from "@/api/interface/orden-compra-interface.ts";

export default function DetallesOrdenCompra() {
    const navigate = useNavigate();
    const { ordenCompraId } = useParams<{
        ordenCompraId: string;
    }>();

    const { data: subQuotations, isLoading } = useGetSubQuotationsDeOrden(ordenCompraId || "");

    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleViewDetails = (subQuotationId: string) => {
        if (isDeleteMode) return; // No navegar si está en modo eliminar
        navigate(`/dashboard/ordenes-de-compra/detalles/${ordenCompraId}/${subQuotationId}/productos`);
    };

    // Obtener el type de cualquier sub-quotation
    const orderType = subQuotations && subQuotations.length > 0
        ? subQuotations[0].type
        : null;

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate("/dashboard/ordenes-de-compra")}
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                            ← Volver
                        </button>

                        {/* Botones de Agregar y Eliminar */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                disabled={!orderType}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Sub-Quotation
                            </Button>

                            <Button
                                onClick={() => setIsDeleteMode(!isDeleteMode)}
                                variant={isDeleteMode ? "default" : "outline"}
                                className={isDeleteMode
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "border-red-300 text-red-600 hover:bg-red-50"
                                }
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isDeleteMode ? "Cancelar Eliminación" : "Eliminar"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Detalles de la Orden de Compra
                        </h1>
                        <p className="text-base text-gray-600">
                            ID de orden: <span className="font-semibold">{ordenCompraId}</span>
                        </p>
                        {isDeleteMode && (
                            <p className="text-sm text-red-600 font-medium">
                                Modo eliminación activo - Haz clic en la X para eliminar una sub-quotation
                            </p>
                        )}
                    </div>
                </div>

                {/* Lista de sub-quotations */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                    </div>
                ) : subQuotations && subQuotations.length > 0 ? (
                    <div className="space-y-4">
                        {subQuotations.map((quotation) => (
                            <SubQuotationCard
                                key={quotation.id_sub_quotation}
                                quotation={quotation}
                                onViewDetails={handleViewDetails}
                                isDeleteMode={isDeleteMode}
                                ordenId={ordenCompraId || ""}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white py-12 text-center">
                        <p className="text-lg font-medium text-gray-600">
                            No hay sub-quotations disponibles
                        </p>
                        <Button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={!orderType}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Primera Sub-Quotation
                        </Button>
                    </div>
                )}

                {/* Dialog para agregar sub-quotations */}
                <CreateOrderDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    selectedType={orderType as PurchaseOrderType}
                    mode="add"
                    ordenId={ordenCompraId}
                />
            </div>
        </main>
    );
}