import { ReactNode } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface AppHeaderProps {
  actions?: ReactNode
  className?: string
}

export function AppHeader({ actions, className }: AppHeaderProps) {
  return (
    <header className={cn(
      "flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-card z-10",
      className
    )}>
      <SidebarTrigger className="-ml-1" />
      <div className="ml-auto flex items-center gap-2">
        {actions}
      </div>
    </header>
  )
}
