import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "bordered";
  headerClassName?: string;
}

const variantStyles = {
  default: "bg-white border border-gray-100 shadow-sm",
  gradient: "bg-gradient-to-br shadow-lg border",
  bordered: "bg-white border-2 shadow-md",
};

export function InfoCard({
  icon,
  title,
  description,
  children,
  className,
  variant = "default",
  headerClassName,
}: InfoCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <CardHeader className={cn("pb-4", headerClassName)}>
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg p-2">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <div className="text-lg font-semibold">{title}</div>
            {description && (
              <div className="text-sm font-normal text-muted-foreground mt-1">
                {description}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">{children}</CardContent>
    </Card>
  );
}