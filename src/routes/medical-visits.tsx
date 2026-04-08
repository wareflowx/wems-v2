import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/medical-visits')({
  component: lazy(() => import('@/pages/medical-visits-page').then(m => ({ default: m.MedicalVisitsPage }))),
});
