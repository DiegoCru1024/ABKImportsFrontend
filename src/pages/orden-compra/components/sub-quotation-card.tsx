import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SubQuotationResumenDto } from "@/api/interface/orden-compra-interface.ts"

interface SubQuotationCardProps {
    quotation: SubQuotationResumenDto
    onViewDetails: (id: string) => void
}

export function SubQuotationCard({ quotation, onViewDetails }: SubQuotationCardProps) {
    const porcentajeCompra =
        quotation.total_items_solicitados > 0
            ? Math.round((quotation.total_items_comprados / quotation.total_items_solicitados) * 100)
            : 0

    return (
        <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-orange-400">
            {/* Contenido principal */}
            <div className="p-6">
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

                    {/* Botón */}
                    <Button
                        onClick={() => onViewDetails(quotation.id_sub_quotation)}
                        variant="ghost"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                        Ver detalles
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}