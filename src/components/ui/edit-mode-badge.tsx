import { cn } from "@/lib/utils"

export interface EditModeBadgeProps {
  children: React.ReactNode
  className?: string
}

export function EditModeBadge({ children, className }: EditModeBadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 border border-green-500/20 text-green-700",
      className
    )}>
      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
      <span>{children}</span>
    </div>
  )
}
