/**
 * Type definitions for the Electron API exposed to the renderer process
 *
 * This file defines the contract between the main process (backend)
 * and the renderer process (frontend React UI)
 */

/**
 * Represents a Post from the database
 */
export type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
};

/**
 * Represents data for creating a new Post (without id and createdAt)
 */
export type NewPost = Omit<Post, 'id' | 'createdAt'>;

/**
 * Standard API Response wrapper
 * T represents the success data type
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; data?: never };

/**
 * Posts API - All post-related operations
 */
export interface PostsAPI {
  /**
   * Get all posts ordered by creation date (newest first)
   * @returns Promise with all posts or error
   */
  getAll: () => Promise<ApiResponse<Post[]>>;

  /**
   * Get a single post by ID
   * @param id - Post ID
   * @returns Promise with post or error
   */
  getById: (id: number) => Promise<ApiResponse<Post>>;

  /**
   * Create a new post
   * @param post - Post data (title and content)
   * @returns Promise with created post or error
   */
  create: (post: NewPost) => Promise<ApiResponse<Post>>;

  /**
   * Update an existing post
   * @param id - Post ID to update
   * @param post - Partial post data (title or content)
   * @returns Promise with updated post or error
   */
  update: (id: number, post: Partial<NewPost>) => Promise<ApiResponse<Post>>;

  /**
   * Delete a post by ID
   * @param id - Post ID to delete
   * @returns Promise with success or error
   */
  delete: (id: number) => Promise<ApiResponse<void>>;
}

/**
 * Complete Electron API exposed to renderer process
 *
 * Accessible via: window.electronAPI.posts.*
 */
export interface ElectronAPI {
  posts: PostsAPI;
}
