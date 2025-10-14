import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "with-dot";
  className?: string;
}

interface StatusConfig {
  label: string;
  color: string;
  dotColor?: string;
}

const statusMap: Record<string, StatusConfig> = {
  draft: {
    label: "Borrador",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    dotColor: "bg-gray-400",
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-400",
  },
  answered: {
    label: "Respondido",
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-400",
  },
  observed: {
    label: "Observado",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-400",
  },
  approved: {
    label: "Aprobado",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dotColor: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-400",
  },
  completed: {
    label: "Completado",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-400",
  },
};

const defaultStatusConfig: StatusConfig = {
  label: "Desconocido",
  color: "bg-gray-100 text-gray-800 border-gray-200",
  dotColor: "bg-gray-400",
};

export function StatusBadge({
  status,
  variant = "default",
  className,
}: StatusBadgeProps) {
  const config = statusMap[status] || defaultStatusConfig;

  return (
    <Badge
      className={cn(
        config.color,
        "border px-3 py-1 font-medium",
        variant === "with-dot" && "flex items-center gap-2",
        className
      )}
    >
      {variant === "with-dot" && (
        <div className={cn("h-2 w-2 rounded-full", config.dotColor)} />
      )}
      {config.label}
    </Badge>
  );
}