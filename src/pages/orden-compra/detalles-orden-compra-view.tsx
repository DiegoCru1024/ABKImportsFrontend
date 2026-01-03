import {useParams, useNavigate} from "react-router-dom";
import {useGetSubQuotationsDeOrden} from "@/hooks/use-orden-compra.ts";
import {SubQuotationCard} from "@/pages/orden-compra/components/sub-quotation-card.tsx";

export default function DetallesOrdenCompra() {

    const navigate = useNavigate();
    const {ordenCompraId} = useParams<{
        ordenCompraId: string;
    }>();

    const { data: subQuotations, isLoading } = useGetSubQuotationsDeOrden(ordenCompraId||"");

    const handleViewDetails = (subQuotationId: string) => {
        navigate(`/dashboard/ordenes-de-compra/detalles/${ordenCompraId}/${subQuotationId}/productos`);
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate("/dashboard/ordenes-de-compra")}
                        className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                        ← Volver
                    </button>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-neutral-900">Detalles de la Orden de Compra</h1>
                        <p className="text-lg text-neutral-600">
                            ID de orden: <span className="font-semibold">{ordenCompraId}</span>
                        </p>
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
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-12 text-center">
                        <p className="text-lg font-medium text-neutral-600">No hay sub-quotations disponibles</p>
                    </div>
                )}
            </div>
        </main>
    )

}