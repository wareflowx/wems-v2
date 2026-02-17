import { createFileRoute } from '@tanstack/react-router'
import { PostsPage } from '@/pages/posts-page'

export interface Route {
  path: '/posts'
}

export const Route = createFileRoute("/posts")({
  component: PostsPage,
});
