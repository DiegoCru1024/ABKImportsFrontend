import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumericFieldProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  variant?: "default" | "currency" | "percentage";
}

const variantStyles = {
  default: "text-center font-semibold",
  currency: "text-center font-semibold",
  percentage: "text-right font-semibold",
};

export function NumericField({
  value,
  onChange,
  placeholder = "0",
  className,
  prefix,
  suffix,
  min,
  max,
  step,
  disabled = false,
  variant = "default",
}: NumericFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value) || 0;
    
    if (min !== undefined && newValue < min) return;
    if (max !== undefined && newValue > max) return;
    
    onChange(newValue);
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium z-10">
          {prefix}
        </span>
      )}
      
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          "transition-colors duration-200",
          variantStyles[variant],
          prefix && "pl-12",
          suffix && "pr-12",
          "bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500",
          disabled && "bg-gray-50 cursor-not-allowed",
          className
        )}
      />
      
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
          {suffix}
        </span>
      )}
    </div>
  );
}