import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";

export interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error display component for showing error states in pages
 * Used when data fetching fails (e.g., IPC not ready, network errors, etc.)
 */
export function ErrorDisplay({
  title = "Something went wrong",
  message = "An error occurred while loading the data. Please try again.",
  onRetry,
  className,
}: ErrorDisplayProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
        <h3 className="mb-2 font-semibold text-lg">{title}</h3>
        <p className="mb-4 max-w-md text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
