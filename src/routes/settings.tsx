import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/settings')({
  component: lazy(() => import('@/pages/settings-page').then(m => ({ default: m.SettingsPage }))),
});
