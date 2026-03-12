import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { DialogManager } from "@/components/dialogs/DialogManager";
import { RightSidebar } from "@/components/right-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect, useSyncExternalStore } from "react";
import { QuickActionsDialog } from "@/components/quick-actions-dialog";
import { Lock, Pen } from "lucide-react";


const SIDEBAR_STORAGE_KEY = "wems-sidebar-open";
const RIGHT_SIDEBAR_STORAGE_KEY = "wems-right-sidebar-open";

// Read localStorage synchronously on client
function getStoredSidebarState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

function getStoredRightSidebarState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(RIGHT_SIDEBAR_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

// External store for sidebar state
const sidebarStore = (() => {
  let value = typeof window !== "undefined" ? getStoredSidebarState() : true;
  let listeners: Set<() => void> = new Set();

  return {
    getSnapshot: () => value,
    getServerSnapshot: () => true,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setValue: (newValue: boolean) => {
      value = newValue;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newValue));
      listeners.forEach((l) => l());
    },
  };
})();

// External store for right sidebar state
const rightSidebarStore = (() => {
  let value = typeof window !== "undefined" ? getStoredRightSidebarState() : true;
  let listeners: Set<() => void> = new Set();

  return {
    getSnapshot: () => value,
    getServerSnapshot: () => true,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setValue: (newValue: boolean) => {
      value = newValue;
      localStorage.setItem(RIGHT_SIDEBAR_STORAGE_KEY, String(newValue));
      listeners.forEach((l) => l());
    },
  };
})();

export function RootPage() {
  // Use useSyncExternalStore to get value synchronously on first render
  const sidebarOpen = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.getSnapshot,
    sidebarStore.getServerSnapshot,
  );

  const rightSidebarOpen = useSyncExternalStore(
    rightSidebarStore.subscribe,
    rightSidebarStore.getSnapshot,
    rightSidebarStore.getServerSnapshot,
  );

  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [canWrite, setCanWrite] = useState(true);

  useEffect(() => {
    // Initial check for write mode
    window
      .getWriteMode?.()
      .then(setCanWrite)
      .catch(() => setCanWrite(true));

    // Listen for real-time lock status changes
    window.onLockStatusChanged?.((writeMode: boolean) => {
      setCanWrite(writeMode);
    });
  }, []);

  return (
    <div className="[--header-height:calc(--spacing(8))]">
      <QuickActionsDialog
        open={quickActionsOpen}
        onOpenChange={setQuickActionsOpen}
      />
      <DialogManager />
      <SidebarProvider
        className="flex flex-col"
        open={sidebarOpen}
        onOpenChange={sidebarStore.setValue}
      >
        <SiteHeader
              onToggleSidebar={() => sidebarStore.setValue(!sidebarOpen)}
              onToggleRightSidebar={() => rightSidebarStore.setValue(!rightSidebarOpen)}
              rightSidebarOpen={rightSidebarOpen}
            />
        <div className="flex flex-1">
          <AppSidebar onQuickActionsClick={() => setQuickActionsOpen(true)} />
          <SidebarInset className="flex flex-1 flex-col overflow-y-auto">
            <Outlet />
            <footer className="mt-auto border-t bg-card sticky bottom-0">
              <div className="container flex h-7 items-center justify-between px-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>© 2026 WEMS</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Online
                  </span>
                  <span className="text-border">|</span>
                  <span>v1.0.0</span>
                  <span className="text-border">|</span>
                  <div
                    className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 ${
                      canWrite
                        ? "bg-green-500/10 text-green-600 border border-green-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {canWrite ? (
                      <Pen className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    <span>{canWrite ? "Write" : "Read only"}</span>
                  </div>
                </div>
              </div>
            </footer>
          </SidebarInset>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              rightSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            {rightSidebarOpen && <RightSidebar />}
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </div>
  );
}
