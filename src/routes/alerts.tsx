import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/alerts')({
  component: lazy(() => import('@/pages/alerts-page').then(m => ({ default: m.AlertsPage }))),
});
