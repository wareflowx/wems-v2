import DragWindowRegion from "@/components/drag-window-region";
import { PanelRightIcon, PanelLeftIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface SiteHeaderProps {
  onToggleSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  rightSidebarOpen?: boolean;
}

export function SiteHeader({
  onToggleSidebar,
  onToggleRightSidebar,
  rightSidebarOpen,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-card px-2">
      {/* Left side - draggable */}
      <div className="draglayer flex h-(--header-height) flex-1 items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="no-drag"
              onClick={onToggleSidebar}
            >
              <PanelLeftIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle sidebar</TooltipContent>
        </Tooltip>
        <span className="select-none text-sm text-muted-foreground">WEMS</span>
      </div>
      {/* Right side - not draggable */}
      <div className="no-drag flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onToggleRightSidebar}>
              <PanelRightIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {rightSidebarOpen ? "Hide right panel" : "Show right panel"}
          </TooltipContent>
        </Tooltip>
        <DragWindowRegion />
      </div>
    </header>
  );
}
