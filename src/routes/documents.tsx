import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/documents')({
  component: lazy(() => import('@/pages/documents-page').then(m => ({ default: m.DocumentsPage }))),
});
