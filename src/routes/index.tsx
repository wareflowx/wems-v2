import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/')({
  component: lazy(() => import('@/pages/home-page').then(m => ({ default: m.HomePage }))),
});
