import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/contracts')({
  component: lazy(() => import('@/pages/contracts-page').then(m => ({ default: m.ContractsPage }))),
});
