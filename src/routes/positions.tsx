import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/positions')({
  component: lazy(() => import('@/pages/positions-page').then(m => ({ default: m.PositionsPage }))),
});
