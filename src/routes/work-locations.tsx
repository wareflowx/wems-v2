import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/work-locations')({
  component: lazy(() => import('@/pages/work-locations-page').then(m => ({ default: m.WorkLocationsPage }))),
});
