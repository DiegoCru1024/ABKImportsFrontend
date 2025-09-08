import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "highlighted" | "success" | "warning";
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-white border-slate-200 text-slate-800",
  highlighted: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
  success: "bg-white border-emerald-200 text-emerald-600",
  warning: "bg-white border-amber-200 text-amber-600",
};

export function MetricCard({
  title,
  value,
  subtitle,
  variant = "default",
  className,
  onClick,
}: MetricCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 text-center shadow-sm transition-all duration-200",
        variantStyles[variant],
        isClickable && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "text-xl font-bold mb-1",
          variant === "highlighted" && "text-white",
          variant === "success" && "text-emerald-600",
          variant === "warning" && "text-amber-600"
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "text-xs font-medium",
          variant === "highlighted"
            ? "text-emerald-100"
            : "text-slate-600"
        )}
      >
        {title}
      </div>
      {subtitle && (
        <div
          className={cn(
            "text-xs mt-1",
            variant === "highlighted"
              ? "text-emerald-200"
              : "text-slate-500"
          )}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}