
import * as React from "react"
import { PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import DragWindowRegion from "@/components/drag-window-region"

export function SiteHeader() {
  return (
    <header className="bg-card sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2">
        <DragWindowRegion title="electron-shadcn" />
      </div>
    </header>
  )
}
