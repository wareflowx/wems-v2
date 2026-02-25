import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface WorkLocation {
  id: number;
  code: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface DeleteWorkLocationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  location?: WorkLocation | null;
  onConfirm?: () => void;
}

export function DeleteWorkLocationDialog({
  open,
  onOpenChange,
  location,
  onConfirm,
}: DeleteWorkLocationDialogProps) {
  return (
    <DeleteConfirmDialog
      description={`Êtes-vous sûr de vouloir supprimer le lieu de travail "${location?.name}" ? Cette action est irréversible.`}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title="Supprimer le lieu de travail"
    />
  );
}
