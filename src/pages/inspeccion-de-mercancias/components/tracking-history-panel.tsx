import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { StatusHistoryEntry } from "@/api/interface/shipmentInterface";
import { formatDateLong } from "@/lib/format-time";

interface TrackingHistoryPanelProps {
  entries: StatusHistoryEntry[];
  isLoading: boolean;
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("transit") || s.includes("vessel")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (s.includes("pending") || s.includes("awaiting")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (s.includes("customs") || s.includes("inspection")) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending_product_arrival: "Pendiente llegada",
    in_inspection: "En inspeccion",
    awaiting_pickup: "Esperando recojo",
    dispatched: "Despachado",
    airport: "Aeropuerto",
    in_transit: "En transito",
    arrived_destination: "Llego a destino",
    customs: "Aduanas",
    delivered: "Entregado",
  };
  return map[status] || status;
};

export function TrackingHistoryPanel({ entries, isLoading }: TrackingHistoryPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border bg-white">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Clock className="h-8 w-8 mb-2" />
        <p className="text-xs">Sin historial de tracking</p>
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
      {sorted.map((entry, index) => (
        <div
          key={index}
          className="relative flex gap-3 p-2.5 rounded-lg border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors"
        >
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
              index === 0 ? "bg-blue-500" : "bg-gray-300"
            }`} />
            {index < sorted.length - 1 && (
              <div className="w-px h-full bg-gray-200 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Badge className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(entry.status)}`}>
              {getStatusText(entry.status)}
            </Badge>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-700">{entry.location}</span>
              <span className="text-[10px] text-gray-400">-</span>
              <span className="text-[10px] text-gray-400">{entry.progress}%</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {formatDateLong(entry.timestamp)}
            </p>
            {entry.notes && (
              <p className="text-[10px] text-gray-500 mt-1 italic">"{entry.notes}"</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
