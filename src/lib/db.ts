/**
 * React Hooks for Posts with TanStack Query
 *
 * This file provides custom React hooks that combine:
 * - TanStack Query for caching, loading states, and automatic refetching
 * - (window as any).electronAPI for IPC communication with the main process
 *
 * Architecture:
 * React Component → Custom Hook → TanStack Query → (window as any).electronAPI → IPC → Main Process → Database
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define types locally to avoid import issues with global Window types
export type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: number;
};

export type NewPost = Omit<Post, 'id' | 'createdAt'>;

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ========================================
// QUERIES (GET requests)
// ========================================

/**
 * Get all posts hook
 *
 * Fetches all posts from the database and caches them
 * Automatically refetches on window focus or reconnection
 *
 * @returns TanStack Query result with posts data
 *
 * Usage:
 * const { data: posts, isLoading, error } = usePosts();
 */
export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('📥 Fetching posts via IPC...');
      const result = await (window as any).electronAPI.posts.getAll();

      // Check for success/error response
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ Received ${result.data.length} posts`);
      return result.data;
    },
    // TanStack Query will cache this data
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get a single post by ID hook
 *
 * Fetches a specific post and caches it separately
 * Only enabled when a valid ID is provided
 *
 * @param id - Post ID to fetch
 * @returns TanStack Query result with post data
 *
 * Usage:
 * const { data: post, isLoading } = usePost(123);
 */
export const usePost = (id: number) => {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: async () => {
      console.log(`📥 Fetching post ${id} via IPC...`);
      const result = await (window as any).electronAPI.posts.getById(id);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ Received post: ${result.data.title}`);
      return result.data;
    },
    // Only run query if id is provided
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ========================================
// MUTATIONS (POST, PUT, DELETE requests)
// ========================================

/**
 * Create post hook
 *
 * Creates a new post and automatically refreshes the posts list
 *
 * @returns TanStack Query mutation with trigger function
 *
 * Usage:
 * const createPost = useCreatePost();
 * createPost.mutate({ title: '...', content: '...' }, {
 *   onSuccess: () => toast.success('Post created!'),
 * });
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: NewPost) => {
      console.log('➕ Creating post via IPC...', postData.title);
      const result = await (window as any).electronAPI.posts.create(postData);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ Post created: ${result.data.id}`);
      return result.data;
    },
    // onSuccess: Invalidate and refetch all posts queries
    onSuccess: () => {
      console.log('🔄 Refetching posts after create...');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    // onError: Log errors (can be extended with toast notifications)
    onError: (error) => {
      console.error('❌ Create post error:', error.message);
    },
  });
};

/**
 * Update post hook
 *
 * Updates an existing post and automatically refreshes the posts list
 *
 * @returns TanStack Query mutation with trigger function
 *
 * Usage:
 * const updatePost = useUpdatePost();
 * updatePost.mutate({ id: 123, post: { title: '...' } }, {
 *   onSuccess: () => toast.success('Post updated!'),
 * });
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, postData }: { id: number; postData: Partial<NewPost> }) => {
      console.log(`✏️ Updating post ${id} via IPC...`);
      const result = await (window as any).electronAPI.posts.update(id, postData);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ Post updated: ${result.data.title}`);
      return result.data;
    },
    // onSuccess: Invalidate and refetch all posts queries
    onSuccess: () => {
      console.log('🔄 Refetching posts after update...');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('❌ Update post error:', error.message);
    },
  });
};

/**
 * Delete post hook
 *
 * Deletes a post and automatically refreshes the posts list
 *
 * @returns TanStack Query mutation with trigger function
 *
 * Usage:
 * const deletePost = useDeletePost();
 * deletePost.mutate(123, {
 *   onSuccess: () => toast.success('Post deleted!'),
 * });
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      console.log(`🗑️ Deleting post ${id} via IPC...`);
      const result = await (window as any).electronAPI.posts.delete(id);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ Post deleted successfully');
      return result.data;
    },
    // onSuccess: Invalidate and refetch all posts queries
    onSuccess: () => {
      console.log('🔄 Refetching posts after delete...');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('❌ Delete post error:', error.message);
    },
  });
};
