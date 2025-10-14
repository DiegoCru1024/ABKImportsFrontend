import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "page" | "card" | "inline";
  className?: string;
}

export function ErrorState({
  title = "Error al cargar",
  message = "Ha ocurrido un error inesperado. Por favor, intente nuevamente.",
  onRetry,
  variant = "page",
  className,
}: ErrorStateProps) {
  const content = (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">{message}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Intentar nuevamente
        </Button>
      )}
    </div>
  );

  if (variant === "page") {
    return (
      <div
        className={cn(
          "min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10 flex items-center justify-center p-6",
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
        {content}
      </Card>
    );
  }

  return <div className={cn("py-8", className)}>{content}</div>;
}