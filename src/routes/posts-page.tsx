import { createFileRoute } from '@tanstack/react-router';
import PostsPageComponent from '../routes/posts';

export const Route = createFileRoute('/posts-page')({
  component: PostsPageComponent,
});
