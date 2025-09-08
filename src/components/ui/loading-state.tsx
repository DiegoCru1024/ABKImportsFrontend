import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  variant?: "page" | "card" | "inline";
  className?: string;
}

export function LoadingState({
  message = "Cargando...",
  variant = "page",
  className,
}: LoadingStateProps) {
  const content = (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <span className="text-sm font-medium text-gray-600">{message}</span>
    </div>
  );

  if (variant === "page") {
    return (
      <div
        className={cn(
          "min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10 flex items-center justify-center",
          className
        )}
      >
        {content}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={cn("p-8", className)}>
        <div className="flex items-center justify-center">{content}</div>
      </Card>
    );
  }

  return <div className={cn("py-4", className)}>{content}</div>;
}