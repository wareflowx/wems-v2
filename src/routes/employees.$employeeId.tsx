import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/employees/$employeeId')({
  component: lazy(() => import('@/pages/employee-detail-page').then(m => ({ default: m.EmployeeDetailPage }))),
});
