import { createRouter, createMemoryHistory } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a memory history instance for Electron
const memoryHistory = createMemoryHistory({
  initialEntries: ['/'],
})

// Create a new router instance with memory history
export const router = createRouter({
  routeTree,
  history: memoryHistory,
  defaultPreloadStaleTime: 0,
})

// Type declaration for the router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
