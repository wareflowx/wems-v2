import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface Position {
  id: number;
  code: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface DeletePositionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: Position | null;
  onConfirm?: () => void;
}

export function DeletePositionDialog({
  open,
  onOpenChange,
  position,
  onConfirm,
}: DeletePositionDialogProps) {
  return (
    <DeleteConfirmDialog
      description={`Êtes-vous sûr de vouloir supprimer le poste "${position?.name}" ? Cette action est irréversible.`}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title="Supprimer le poste"
    />
  );
}
