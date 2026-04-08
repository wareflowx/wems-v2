import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/trash')({
  component: lazy(() => import('@/pages/trash-page').then(m => ({ default: m.TrashPage }))),
});
