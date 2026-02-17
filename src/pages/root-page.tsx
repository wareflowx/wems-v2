import { Outlet } from "@tanstack/react-router";
import BaseLayout from "@/layouts/base-layout";

/* import { TanStackRouterDevtools } from '@tanstack/react-router-devtools' */

/*
 * Uncomment the code in this file to enable the router devtools.
 */

export function RootPage() {
  return (
    <BaseLayout>
      <Outlet />
      {/* Uncomment the following line to enable the router devtools */}
      {/* <TanStackRouterDevtools /> */}
    </BaseLayout>
  );
}
