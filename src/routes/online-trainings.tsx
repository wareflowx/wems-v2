import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/online-trainings')({
  component: lazy(() => import('@/pages/online-trainings-page').then(m => ({ default: m.OnlineTrainingsPage }))),
});
