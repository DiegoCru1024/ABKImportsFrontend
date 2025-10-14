import type { ReactNode } from "react";
import { InfoCard } from "./info-card";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "bordered";
  headerContent?: ReactNode;
}

const gradientVariants = {
  default: "from-slate-50 to-slate-100 border-slate-200",
  gradient: "from-blue-50 to-indigo-100 border-blue-200",
  bordered: "from-green-50 to-green-100 border-green-200",
};

export function FormSection({
  icon,
  title,
  description,
  children,
  className,
  variant = "default",
  headerContent,
}: FormSectionProps) {
  return (
    <InfoCard
      icon={icon}
      title={title}
      description={description}
      variant="gradient"
      className={cn(
        "bg-gradient-to-br shadow-lg border",
        gradientVariants[variant],
        className
      )}
      headerClassName="pb-4"
    >
      {headerContent && (
        <div className="mb-4 p-4 bg-white/80 rounded-lg border border-gray-200">
          {headerContent}
        </div>
      )}
      <div className="grid gap-4">{children}</div>
    </InfoCard>
  );
}