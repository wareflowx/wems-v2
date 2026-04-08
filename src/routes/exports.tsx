import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/exports')({
  component: lazy(() => import('@/pages/exports-page').then(m => ({ default: m.ExportsPage }))),
});
