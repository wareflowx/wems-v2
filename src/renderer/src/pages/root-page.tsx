import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

/* import { TanStackRouterDevtools } from '@tanstack/react-router-devtools' */

/*
 * Uncomment the code in this file to enable the router devtools.
 */

export function RootPage() {
  return (
    <div className="[--header-height:calc(--spacing(8))]">
      <SidebarProvider className="flex flex-col">
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
