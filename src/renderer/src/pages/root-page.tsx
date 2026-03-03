import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { DialogManager } from "@/components/dialogs/DialogManager";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect } from "react";

/* import { TanStackRouterDevtools } from '@tanstack/react-router-devtools' */

/*
 * Uncomment the code in this file to enable the router devtools.
 */

const SIDEBAR_STORAGE_KEY = "wems-sidebar-open";

export function RootPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean | undefined>(undefined);

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setSidebarOpen(stored === "true");
    }
  }, []);

  // Handle sidebar state change
  const handleSidebarOpenChange = (open: boolean) => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
  };

  return (
    <div className="[--header-height:calc(--spacing(8))]">
      <DialogManager />
      <SidebarProvider
        className="flex flex-col"
        open={sidebarOpen}
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
