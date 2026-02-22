import { useNavigate } from "react-router-dom";
import type { Inspection } from "@/api/interface/inspectionInterface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageSearch, ArrowRight, ExternalLink, Ship, Plane, ChevronLeft, ChevronRight } from "lucide-react";

interface OrdersListPanelProps {
  inspections: Inspection[];
  isLoading: boolean;
  error: Error | null;
  selectedInspectionId: string | null;
  onSelectInspection: (inspectionId: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "outline" },
  in_progress: { label: "En Proceso", variant: "default" },
  completed: { label: "Completado", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export function OrdersListPanel({
  inspections,
  isLoading,
  error,
  selectedInspectionId,
  onSelectInspection,
  page,
  totalPages,
  onPageChange,
}: OrdersListPanelProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/60 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-red-500">Error al cargar los pedidos</p>
        <p className="text-xs text-gray-400 mt-1">{error.message}</p>
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <PackageSearch className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-600">Sin pedidos registrados</p>
        <p className="text-xs text-gray-400 mt-1">Tus envios apareceran aqui una vez creados</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Lista de pedidos */}
      {inspections.map((inspection) => {
        const statusInfo = STATUS_LABELS[inspection.status] || { label: inspection.status, variant: "outline" as const };
        const isMaritime = inspection.shipping_service_type === "maritime";
        const isSelected = selectedInspectionId === inspection.id;

        return (
          <div
            key={inspection.id}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-blue-50/80 border-blue-200 shadow-sm"
                : "bg-white/70 border-transparent hover:bg-white hover:shadow-sm hover:border-gray-100"
            }`}
            onClick={() => onSelectInspection(inspection.id)}
          >
            {/* Icon */}
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
              isMaritime
                ? "bg-gradient-to-br from-cyan-50 to-cyan-100"
                : "bg-gradient-to-br from-sky-50 to-sky-100"
            }`}>
              {isMaritime ? (
                <Ship className="h-4 w-4 text-cyan-600" />
              ) : (
                <Plane className="h-4 w-4 text-sky-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium truncate ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                  {inspection.name || inspection.correlative}
                </p>
                {isSelected && (
                  <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-wider bg-blue-100 px-1.5 py-0.5 rounded">
                    Viendo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-gray-400">{inspection.correlative}</span>
                <span className="text-xs text-gray-400">{inspection.logistics_service}</span>
              </div>
            </div>

            {/* Status + Price + Link */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  ${parseFloat(inspection.total_price || "0").toLocaleString("es-PE")}
                </p>
              </div>
              <Badge variant={statusInfo.variant} className="text-[10px] px-2 py-0.5 whitespace-nowrap">
                {statusInfo.label}
              </Badge>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/inspeccion-de-mercancias/${inspection.id}`);
                }}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                title="Ver detalle completo"
              >
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-blue-500 transition-colors" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="text-xs gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Anterior
          </Button>
          <span className="text-xs text-gray-400">
            Pagina {page} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="text-xs gap-1"
          >
            Siguiente
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Ver todos */}
      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/inspeccion-de-mercancias")}
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 text-xs gap-1"
        >
          Ver todos los pedidos
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
