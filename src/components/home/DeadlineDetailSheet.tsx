import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DeadlineDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deadline?: {
    id: number;
    type: string;
    employee: string;
    employeeId: number;
    category?: string;
    visitType?: string;
    severity: string;
    date: string;
    daysLeft?: number;
  };
}

export const DeadlineDetailSheet = ({
  open,
  onOpenChange,
  deadline,
}: DeadlineDetailSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rounded-lg border shadow-lg !top-2 !bottom-6 !right-2 !h-[calc(100vh-1rem)]">
        <SheetHeader className="border-b pt-4 pb-4 pr-10">
          <SheetTitle>Détails de l'échéance</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          {deadline ? (
            <div className="space-y-4">
              <p>ID: {deadline.id}</p>
              <p>Type: {deadline.type}</p>
              <p>Employé: {deadline.employee}</p>
              <p>Date: {deadline.date}</p>
              <p>Sévérité: {deadline.severity}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Aucune échéance sélectionnée
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
