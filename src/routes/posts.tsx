import { createFileRoute } from '@tanstack/react-router';
import PostsPageComponent from '@/routes/posts-page';

export const Route = createFileRoute('/posts')({
  component: PostsPageComponent,
});
