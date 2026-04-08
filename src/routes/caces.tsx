import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/caces')({
  component: lazy(() => import('@/pages/caces-page').then(m => ({ default: m.CacesPage }))),
});
