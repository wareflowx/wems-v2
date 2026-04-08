import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

export const Route = createFileRoute('/posts')({
  component: lazy(() => import('@/pages/posts-page').then(m => ({ default: m.PostsPage }))),
});
