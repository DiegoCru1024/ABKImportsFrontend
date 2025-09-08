import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalculationItem {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

interface CalculationSummaryProps {
  title: string;
  items: CalculationItem[];
  total?: {
    label: string;
    value: number;
    prefix?: string;
  };
  className?: string;
  variant?: "default" | "highlighted" | "success";
}

const variantStyles = {
  default: "bg-white border-gray-200",
  highlighted: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
  success: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
};

const totalVariantStyles = {
  default: "bg-gray-100 text-gray-900",
  highlighted: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
  success: "bg-gradient-to-r from-emerald-500 to-green-600 text-white",
};

export function CalculationSummary({
  title,
  items,
  total,
  className,
  variant = "default",
}: CalculationSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 shadow-sm",
        variantStyles[variant],
        className
      )}
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="font-medium text-gray-900">{item.label}</div>
            <div className="text-right">
              <span className="font-semibold text-gray-900">
                {item.prefix}
                {item.value.toFixed(2)}
                {item.suffix}
              </span>
            </div>
          </div>
        ))}
      </div>

      {total && (
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-lg shadow-md mt-4",
            totalVariantStyles[variant]
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                variant === "default" && "bg-gray-200",
                variant === "highlighted" && "bg-blue-300",
                variant === "success" && "bg-emerald-300"
              )}
            >
              <DollarSign
                className={cn(
                  "h-5 w-5",
                  variant === "default" && "text-gray-700",
                  (variant === "highlighted" || variant === "success") && "text-white"
                )}
              />
            </div>
            <div>
              <div
                className={cn(
                  "font-bold text-lg",
                  variant === "default" && "text-gray-900",
                  (variant === "highlighted" || variant === "success") && "text-white"
                )}
              >
                {total.label}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "font-bold text-2xl",
                variant === "default" && "text-gray-900",
                (variant === "highlighted" || variant === "success") && "text-white"
              )}
            >
              {total.prefix}
              {total.value.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}