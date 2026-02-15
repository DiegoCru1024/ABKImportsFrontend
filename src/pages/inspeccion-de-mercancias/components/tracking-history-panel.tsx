import { Clock } from "lucide-react";
import type { InspectionTrackingHistoryResponse } from "@/api/interface/inspectionInterface";
import { formatDateTime } from "@/lib/format-time";

interface TrackingHistoryPanelProps {
  data: InspectionTrackingHistoryResponse | undefined;
  isLoading: boolean;
}

const MAX_TRACKING_POINT = 13;

export function TrackingHistoryPanel({ data, isLoading }: TrackingHistoryPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
        <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-full" />
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.history.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Clock className="h-8 w-8 mb-2" />
        <p className="text-xs">Sin historial de tracking</p>
      </div>
    );
  }

  const progressPercent = Math.round(
    (data.current_tracking_point / MAX_TRACKING_POINT) * 100
  );

  return (
    <div className="space-y-5">
      {/* Progress Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Progreso del Envio
        </h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Progreso</span>
          <span className="text-xs font-semibold text-gray-700">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Timeline */}
      <div className="space-y-0 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
        {data.history.map((entry, index) => {
          const isFirst = index === 0;

          return (
            <div key={`${entry.timestamp}-${entry.status}`} className="relative flex gap-3">
              {/* Timeline column: dot + line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${
                    isFirst ? "bg-red-500" : "bg-green-500"
                  }`}
                />
                {index < data.history.length - 1 && (
                  <div className="w-px flex-1 bg-gray-200 min-h-[24px]" />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${
                  isFirst ? "text-gray-900" : "text-gray-700"
                }`}>
                  {entry.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDateTime(entry.timestamp, "dd MMMM, yyyy - HH:mm")} UTC
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
