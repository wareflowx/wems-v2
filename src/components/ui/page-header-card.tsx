import { Card } from "./card"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"
import type { ReactNode } from "react"

export interface PageHeaderCardProps {
  icon?: ReactNode
  title: string
  description?: string
  className?: string
}

export function PageHeaderCard({ icon = <Info className="h-3.5 w-3.5 text-gray-500" />, title, description, className }: PageHeaderCardProps) {
  return (
    <div className={cn("mb-2", className)}>
      <Card className="p-3 bg-background shadow-sm rounded-md">
        <div className="flex items-start gap-3">
          {icon && <div className="mt-0.5">{icon}</div>}
          <div className="flex-1">
            {description ? (
              <p className="text-gray-700 text-sm">
                <span className="font-medium">{title}</span> - {description}
              </p>
            ) : (
              <p className="text-gray-700 font-medium text-sm">{title}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
