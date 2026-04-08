import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/driving-authorizations')({
  component: lazy(() => import('@/pages/driving-authorizations-page').then(m => ({ default: m.DrivingAuthorizationsPage }))),
});
