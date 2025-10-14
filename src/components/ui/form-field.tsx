import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  description?: string;
  error?: string;
}

export function FormField({
  label,
  children,
  className,
  required = false,
  description,
  error,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn(
        "text-sm font-medium text-gray-700",
        required && "after:content-['*'] after:ml-1 after:text-red-500"
      )}>
        {label}
      </Label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}