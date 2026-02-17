/**
 * Simple toast notification utility
 * TODO: Replace with shadcn/ui toast component when integrated
 */

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function toast({ title, description, variant = 'default' }: ToastOptions) {
  // For now, just log to console
  // TODO: Replace with actual toast implementation
  console.log(`[${variant.toUpperCase()}] ${title}${description ? ': ' + description : ''}`)

  // Store in window for potential UI implementation
  if (typeof window !== 'undefined') {
    const toasts = window.__toasts || []
    const toast = { id: Date.now(), title, description, variant }
    window.__toasts = [...toasts, toast]
  }
}

// Extend Window interface for toasts
declare global {
  interface Window {
    __toasts?: Array<{ id: number; title: string; description?: string; variant: string }>
  }
}

export function useToast() {
  return { toast }
}
