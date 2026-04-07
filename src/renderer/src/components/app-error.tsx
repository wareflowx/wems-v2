import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AppErrorProps {
  error: Error;
  reset?: () => void;
}

/**
 * Global error display component for uncaught errors
 * Shown when an error occurs that wasn't caught by individual route error boundaries
 */
export function AppError({ error, reset }: AppErrorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 font-semibold text-xl">
            {t("common.errorOccurred", "Une erreur est survenue")}
          </h2>
          <p className="mb-2 text-muted-foreground">
            {t("common.errorMessage", "Une erreur inattendue s'est produite.")}
          </p>
          {error.message && (
            <p className="mb-4 max-w-md rounded-md bg-muted p-2 font-mono text-muted-foreground text-sm">
              {error.message}
            </p>
          )}
          <p className="mb-6 text-muted-foreground text-sm">
            {t(
              "common.contactAdmin",
              "Si le probleme persiste, contactez l'administrateur."
            )}
          </p>
          <div className="flex gap-2">
            {reset && (
              <Button onClick={reset} size="sm" variant="outline">
                {t("common.tryAgain", "Reessayer")}
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
            >
              {t("common.reload", "Recharger la page")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
