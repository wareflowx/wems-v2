/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is a modified version for Electron (SPA mode, no SSR)

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as DemoStartServerFuncsRouteImport } from './routes/demo/start.server-funcs'
import { Route as DemoStartApiRequestRouteImport } from './routes/demo/start.api-request'
import { Route as DemoApiNamesRouteImport } from './routes/demo/api.names'
import { Route as DemoStartSsrIndexRouteImport } from './routes/demo/start.ssr.index'
import { Route as DemoStartSsrSpaModeRouteImport } from './routes/demo/start.ssr.spa-mode'
import { Route as DemoStartSsrFullSsrRouteImport } from './routes/demo/start.ssr.full-ssr'
import { Route as DemoStartSsrDataOnlyRouteImport } from './routes/demo/start.ssr.data-only'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const DemoStartServerFuncsRoute = DemoStartServerFuncsRouteImport.update({
  id: '/demo/start/server-funcs',
  path: '/demo/start/server-funcs',
  getParentRoute: () => rootRouteImport,
} as any)
const DemoStartApiRequestRoute = DemoStartApiRequestRouteImport.update({
  id: '/demo/start/api-request',
  path: '/demo/start/api-request',
  getParentRoute: () => rootRouteImport,
} as any)
const DemoApiNamesRoute = DemoApiNamesRouteImport.update({
  id: '/demo/api/names',
  path: '/demo/api/names',
  getParentRoute: () => rootRouteImport,
} as any)
const DemoStartSsrIndexRoute = DemoStartSsrIndexRouteImport.update({
  id: '/demo/start/ssr/',
  path: '/demo/start/ssr/',
  getParentRoute: () => rootRouteImport,
} as any)
const DemoStartSsrSpaModeRoute = DemoStartSsrSpaModeRouteImport.update({
  id: '/demo/start/ssr/spa-mode',
  path: '/demo/start/ssr/spa-mode',
  getParentRoute: () => rootRouteImport,
} as any)
const DemoStartSsrFullSsrRoute = DemoStartSsrFullSsrRouteImport.update({
  id: '/demo/start/ssr/full-ssr',
  path: '/demo/start/ssr/full-ssr',
  getParentRoute: () => rootRouteImport,
} as any)
const DemoStartSsrDataOnlyRoute = DemoStartSsrDataOnlyRouteImport.update({
  id: '/demo/start/ssr/data-only',
  path: '/demo/start/ssr/data-only',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/demo/api/names': typeof DemoApiNamesRoute
  '/demo/start/api-request': typeof DemoStartApiRequestRoute
  '/demo/start/server-funcs': typeof DemoStartServerFuncsRoute
  '/demo/start/ssr/data-only': typeof DemoStartSsrDataOnlyRoute
  '/demo/start/ssr/full-ssr': typeof DemoStartSsrFullSsrRoute
  '/demo/start/ssr/spa-mode': typeof DemoStartSsrSpaModeRoute
  '/demo/start/ssr/': typeof DemoStartSsrIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/demo/api/names': typeof DemoApiNamesRoute
  '/demo/start/api-request': typeof DemoStartApiRequestRoute
  '/demo/start/server-funcs': typeof DemoStartServerFuncsRoute
  '/demo/start/ssr/data-only': typeof DemoStartSsrDataOnlyRoute
  '/demo/start/ssr/full-ssr': typeof DemoStartSsrFullSsrRoute
  '/demo/start/ssr/spa-mode': typeof DemoStartSsrSpaModeRoute
  '/demo/start/ssr': typeof DemoStartSsrIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/demo/api/names': typeof DemoApiNamesRoute
  '/demo/start/api-request': typeof DemoStartApiRequestRoute
  '/demo/start/server-funcs': typeof DemoStartServerFuncsRoute
  '/demo/start/ssr/data-only': typeof DemoStartSsrDataOnlyRoute
  '/demo/start/ssr/full-ssr': typeof DemoStartSsrFullSsrRoute
  '/demo/start/ssr/spa-mode': typeof DemoStartSsrSpaModeRoute
  '/demo/start/ssr/': typeof DemoStartSsrIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/demo/api/names'
    | '/demo/start/api-request'
    | '/demo/start/server-funcs'
    | '/demo/start/ssr/data-only'
    | '/demo/start/ssr/full-ssr'
    | '/demo/start/ssr/spa-mode'
    | '/demo/start/ssr/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/demo/api/names'
    | '/demo/start/api-request'
    | '/demo/start/server-funcs'
    | '/demo/start/ssr/data-only'
    | '/demo/start/ssr/full-ssr'
    | '/demo/start/ssr/spa-mode'
    | '/demo/start/ssr'
  id:
    | '__root__'
    | '/'
    | '/demo/api/names'
    | '/demo/start/api-request'
    | '/demo/start/server-funcs'
    | '/demo/start/ssr/data-only'
    | '/demo/start/ssr/full-ssr'
    | '/demo/start/ssr/spa-mode'
    | '/demo/start/ssr/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DemoApiNamesRoute: typeof DemoApiNamesRoute
  DemoStartApiRequestRoute: typeof DemoStartApiRequestRoute
  DemoStartServerFuncsRoute: typeof DemoStartServerFuncsRoute
  DemoStartSsrDataOnlyRoute: typeof DemoStartSsrDataOnlyRoute
  DemoStartSsrFullSsrRoute: typeof DemoStartSsrFullSsrRoute
  DemoStartSsrSpaModeRoute: typeof DemoStartSsrSpaModeRoute
  DemoStartSsrIndexRoute: typeof DemoStartSsrIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DemoApiNamesRoute: DemoApiNamesRoute,
  DemoStartApiRequestRoute: DemoStartApiRequestRoute,
  DemoStartServerFuncsRoute: DemoStartServerFuncsRoute,
  DemoStartSsrDataOnlyRoute: DemoStartSsrDataOnlyRoute,
  DemoStartSsrFullSsrRoute: DemoStartSsrFullSsrRoute,
  DemoStartSsrSpaModeRoute: DemoStartSsrSpaModeRoute,
  DemoStartSsrIndexRoute: DemoStartSsrIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
declare module '@tanstack/react-router' {
  interface Register {
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
