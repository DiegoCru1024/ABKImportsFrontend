import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
  variant?: "default" | "gradient";
}

export function SectionHeader({
  icon,
  title,
  description,
  badge,
  actions,
  className,
  variant = "default",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-border/60 px-4 py-4",
        variant === "gradient" && "bg-gradient-to-r from-slate-50 to-slate-100",
        className
      )}
    >
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}