/**
 * Toast notification utility using sonner
 * @see https://sonner.emilkowal.ski/
 */

import { toast as sonnerToast } from 'sonner'

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

/**
 * Show a toast notification
 * @param options - Toast options
 */
export function toast({ title, description, variant = 'default' }: ToastOptions) {
  if (variant === 'destructive') {
    sonnerToast.error(title, {
      description: description,
    })
  } else {
    sonnerToast.success(title, {
      description: description,
    })
  }
}

export function useToast() {
  return { toast }
}
