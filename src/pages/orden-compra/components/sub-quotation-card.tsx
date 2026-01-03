import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type {SubQuotationResumenDto} from "@/api/interface/orden-compra-interface.ts";

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
        <div className="group relative overflow-hidden rounded-lg border border-orange-200 bg-gradient-to-r from-white to-orange-50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-orange-400">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-orange-500 to-orange-600"></div>

            {/* Contenido principal */}
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Información izquierda */}
                <div className="flex-1 space-y-3">
                    {/* Header con correlativo y versión */}
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                            {quotation.quotation_correlative}
                        </div>
                        <div className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
                            v{quotation.version}
                        </div>
                    </div>

                    {/* Cliente y tipo */}
                    <div>
                        <p className="text-sm font-medium text-neutral-600">Cliente</p>
                        <p className="text-lg font-bold text-neutral-900">{quotation.client_name}</p>
                    </div>

                    {/* Tipo de orden */}
                    <div>
                        <p className="text-xs font-semibold uppercase text-neutral-500">Tipo de orden</p>
                        <p className="text-sm font-medium text-neutral-700">{quotation.type}</p>
                    </div>
                </div>

                {/* Estadísticas de items */}
                <div className="flex gap-6 sm:gap-8">
                    {/* Items Solicitados */}
                    <div className="flex flex-col items-center rounded-lg bg-white p-4 text-center">
                        <p className="text-xs font-semibold uppercase text-neutral-500">Solicitados</p>
                        <p className="text-3xl font-bold text-orange-500">{quotation.total_items_solicitados}</p>
                    </div>

                    {/* Items Comprados */}
                    <div className="flex flex-col items-center rounded-lg bg-white p-4 text-center">
                        <p className="text-xs font-semibold uppercase text-neutral-500">Comprados</p>
                        <p className="text-3xl font-bold text-neutral-900">{quotation.total_items_comprados}</p>
                    </div>

                    {/* Porcentaje */}
                    <div className="flex flex-col items-center rounded-lg bg-orange-500 p-4 text-center">
                        <p className="text-xs font-semibold uppercase text-orange-100">Completado</p>
                        <p className="text-3xl font-bold text-white">{porcentajeCompra}%</p>
                    </div>
                </div>

                {/* Botón */}
                <Button
                    onClick={() => onViewDetails(quotation.id_sub_quotation)}
                    className="group/btn bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md transition-all duration-300 hover:shadow-lg sm:ml-4"
                >
                    Ver detalles
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
            </div>
        </div>
    )
}