// Unified useDialog hook for managing dialog state
// Provides a simpler API for opening/closing dialogs with optional data

import { useCallback } from "react";
import type { DialogId } from "@/stores/dialog-store";
import { useDialogStore } from "@/stores/dialog-store";

interface DialogData {
  [key: string]: unknown;
}

/**
 * Unified hook for dialog operations
 *
 * Usage:
 * ```typescript
 * const { isOpen, open, close, data } = useDialog();
 *
 * // Or with specific dialog type:
 * const { isOpen: isCreateOpen, open: openCreate } = useDialog("create-agency");
 * ```
 */
export function useDialog<TData extends DialogData = DialogData>(
  dialogId?: DialogId
) {
  const store = useDialogStore();

  // Get current dialog state
  const isOpen = dialogId
    ? store.isOpen(dialogId)
    : store.activeDialog !== null;
  const data =
    dialogId && store.isOpen(dialogId) ? (store.dialogData as TData) : null;

  // Open a specific dialog
  const open = useCallback(
    (id: DialogId, dialogData?: TData) => {
      store.openDialog(
        id,
        dialogData as Parameters<typeof store.openDialog>[1]
      );
    },
    [store]
  );

  // Close current dialog
  const close = useCallback(() => {
    store.closeDialog();
  }, [store]);

  // Convenience methods for common dialogs
  const openCreate = useCallback(
    (data?: TData) => {
      if (dialogId) {
        store.openDialog(
          dialogId,
          data as Parameters<typeof store.openDialog>[1]
        );
      }
    },
    [store, dialogId]
  );

  const openEdit = useCallback(
    (id: number, data?: Partial<TData>) => {
      if (dialogId) {
        store.openDialog(dialogId, { ...data, id } as Parameters<
          typeof store.openDialog
        >[1]);
      }
    },
    [store, dialogId]
  );

  const openDelete = useCallback(
    (id: number, data?: Partial<TData>) => {
      if (dialogId) {
        store.openDialog(dialogId, { ...data, id } as Parameters<
          typeof store.openDialog
        >[1]);
      }
    },
    [store, dialogId]
  );

  return {
    // State
    isOpen,
    data,
    activeDialog: store.activeDialog,
    // Actions
    open,
    close,
    // Convenience
    openCreate,
    openEdit,
    openDelete,
  };
}

/**
 * Hook to get specific dialog state
 */
export function useDialogState(dialogId: DialogId) {
  const store = useDialogStore();
  const isOpen = store.isOpen(dialogId);
  const data = isOpen ? store.dialogData : null;

  const open = useCallback(
    (dialogData?: DialogData) => {
      store.openDialog(
        dialogId,
        dialogData as Parameters<typeof store.openDialog>[1]
      );
    },
    [store, dialogId]
  );

  const close = useCallback(() => {
    store.closeDialog();
  }, [store]);

  return {
    isOpen,
    data,
    open,
    close,
  };
}

/**
 * Helper to extract entity ID from dialog data
 */
export function getDialogId<T extends DialogData>(
  data: T | null,
  key: keyof T
): number | undefined {
  if (!data) {
    return undefined;
  }
  const value = data[key];
  return typeof value === "number" ? value : undefined;
}
