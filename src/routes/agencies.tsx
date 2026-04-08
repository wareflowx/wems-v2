import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

// Search params validation schema
const agenciesSearchSchema = z.object({
  q: z.string().optional().default(''),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  page: z.coerce.number().int().positive().default(1),
});

export type AgenciesSearch = z.infer<typeof agenciesSearchSchema>;

export const Route = createFileRoute('/agencies')({
  validateSearch: agenciesSearchSchema.parse,
  component: lazy(() => import('@/pages/agencies-page').then(m => ({ default: m.AgenciesPage }))),
});
