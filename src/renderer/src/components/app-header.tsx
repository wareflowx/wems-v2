import { Download, Plus, Search } from "lucide-react";
import * as React from "react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface AppHeaderProps {
  onQuickActionsClick?: () => void;
}

export const AppHeader = ({ onQuickActionsClick }: AppHeaderProps) => {
  React.useEffect(() => {
    // Handle Cmd+K / Ctrl+K keyboard shortcut
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onQuickActionsClick?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onQuickActionsClick]);

  return (
    <header className="flex h-13 w-full items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-4">
        <Button
          className="w-50 bg-background"
          onClick={onQuickActionsClick}
          variant="outline"
        >
          <Search className="size-4 text-muted-foreground" />
          <span className="flex-1 text-left text-xs text-muted-foreground">Search...</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Create new</TooltipContent>
        </Tooltip>
        <div className="h-6 w-px bg-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Export data</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};
