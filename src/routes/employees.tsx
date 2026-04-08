import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/employees')({
  component: lazy(() => import('@/pages/employees-page').then(m => ({ default: m.EmployeesPage }))),
});
