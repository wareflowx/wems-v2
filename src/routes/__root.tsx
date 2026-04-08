import { createRootRoute } from '@tanstack/react-router';
import { lazy } from 'react';

const RootPage = lazy(() => import('@/pages/root-page').then(m => ({ default: m.RootPage })));
const AppError = lazy(() => import('@/components/app-error').then(m => ({ default: m.AppError })));

export const Route = createRootRoute({
  component: RootPage,
  errorComponent: AppError,
});
