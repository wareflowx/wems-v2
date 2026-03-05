import { Download, Plus, Search } from "lucide-react";
import * as React from "react";
import { Button } from "./ui/button";

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
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">WEMS</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onQuickActionsClick}
          variant="outline"
        >
          <Search className="size-4" />
          <span className="flex-1 text-xs group-data-[collapsible=icon]:hidden">Quick actions</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-data-[collapsible=icon]:hidden">
            <span className="text-xs">Ctrl</span>
            <span>K</span>
          </kbd>
        </Button>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </header>
  );
};
