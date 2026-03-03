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

// Helper to get the initial sidebar state from localStorage
function getInitialSidebarState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

// Store for external sync
let sidebarListeners: (() => void)[] = [];
let currentSidebarValue = typeof window !== "undefined" ? getInitialSidebarState() : true;

function subscribeSidebar(listener: () => void) {
  sidebarListeners.push(listener);
  return () => {
    sidebarListeners = sidebarListeners.filter((l) => l !== listener);
  };
}

function getSidebarSnapshot(): boolean {
  return currentSidebarValue;
}

function getSidebarServerSnapshot(): boolean {
  return true;
}

export function RootPage() {
  // Use useSyncExternalStore to ensure the value is available immediately on first render
  const sidebarOpen = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot
  );

  // Handle sidebar state change
  const handleSidebarOpenChange = (open: boolean) => {
    currentSidebarValue = open;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
    sidebarListeners.forEach((listener) => listener());
  };

  return (
    <div className="[--header-height:calc(--spacing(8))]">
      <DialogManager />
      <SidebarProvider
        className="flex flex-col"
        defaultOpen={sidebarOpen}
        onOpenChange={handleSidebarOpenChange}
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
