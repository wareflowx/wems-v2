import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/contract-types')({
  component: lazy(() => import('@/pages/contract-types-page').then(m => ({ default: m.ContractTypesPage }))),
});
