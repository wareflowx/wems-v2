import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { AppLayout } from '@/components/AppLayout'
// import { TitleBar } from '@/components/electron/TitleBar'
import '@/lib/i18n'

import appCss from '../styles.css?url'

const RootDocument = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

const RootLayout = () => {
  return (
    <>
      {/* <TitleBar /> */}
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <AppSidebar />
        </Sidebar>
        <AppLayout />
      </SidebarProvider>
    </>
  )
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootLayout,
})
