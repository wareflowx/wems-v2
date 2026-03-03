import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { DialogManager } from "@/components/dialogs/DialogManager";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect, useSyncExternalStore } from "react";

/* import { TanStackRouterDevtools } from '@tanstack/react-router-devtools' */

/*
 * Uncomment the code in this file to enable the router devtools.
 */

const SIDEBAR_STORAGE_KEY = "wems-sidebar-open";

// Read localStorage synchronously on client
function getStoredSidebarState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
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

export function RootPage() {
  // Use useSyncExternalStore to get value synchronously on first render
  const sidebarOpen = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.getSnapshot,
    sidebarStore.getServerSnapshot
  );

  return (
    <div className="[--header-height:calc(--spacing(8))]">
      <DialogManager />
      <SidebarProvider
        className="flex flex-col"
        open={sidebarOpen}
        onOpenChange={sidebarStore.setValue}
      >
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            {/*<header className="h-14 border-b"></header>*/}
            <Outlet />
            {/* Uncomment the following line to enable the router devtools */}
            {/* <TanStackRouterDevtools /> */}
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Toaster />
    </div>
  );
}
