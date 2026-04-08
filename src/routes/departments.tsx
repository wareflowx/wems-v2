import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/departments')({
  component: lazy(() => import('@/pages/departments-page').then(m => ({ default: m.DepartmentsPage }))),
});
