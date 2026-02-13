import { ipcMain } from 'electron';
import { db } from '../../database';
import { posts } from '../../database/schema/posts';
import { eq, desc } from 'drizzle-orm';
import type { Post, NewPost } from '../../database/schema/posts';

/**
 * Standard API Response type for all IPC handlers
 * T represents the success data type
 */
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Register all IPC handlers for Posts operations
 * These handlers run in the Main Process (backend)
 * and are called from the Renderer Process (frontend) via IPC
 */
export const registerPostHandlers = () => {
  console.log('📡 Registering Posts IPC handlers...');

  // ========================================
  // GET all posts
  // ========================================
  ipcMain.handle('posts:getAll', async (): Promise<ApiResponse<Post[]>> => {
    try {
      console.log('📥 Fetching all posts...');
      const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
      console.log(`✅ Found ${allPosts.length} posts`);
      return { success: true, data: allPosts };
    } catch (error) {
      const message = (error as Error).message;
      console.error('❌ Error fetching posts:', message);
      return { success: false, error: message };
    }
  });

  // ========================================
  // GET post by ID
  // ========================================
  ipcMain.handle('posts:getById', async (_, id: number): Promise<ApiResponse<Post>> => {
    try {
      console.log(`📥 Fetching post with id: ${id}...`);
      const post = await db.select().from(posts).where(eq(posts.id, id));

      if (!post[0]) {
        console.log(`❌ Post with id ${id} not found`);
        return { success: false, error: 'Post not found' };
      }

      console.log(`✅ Found post: ${post[0].title}`);
      return { success: true, data: post[0] };
    } catch (error) {
      const message = (error as Error).message;
      console.error('❌ Error fetching post:', message);
      return { success: false, error: message };
    }
  });

  // ========================================
  // CREATE post
  // ========================================
  ipcMain.handle('posts:create', async (_, postData: NewPost): Promise<ApiResponse<Post>> => {
    try {
      console.log('➕ Creating new post:', postData.title);
      const newPost = await db.insert(posts).values(postData).returning();
      console.log(`✅ Post created with id: ${newPost[0].id}`);
      return { success: true, data: newPost[0] };
    } catch (error) {
      const message = (error as Error).message;
      console.error('❌ Error creating post:', message);
      return { success: false, error: message };
    }
  });

  // ========================================
  // UPDATE post
  // ========================================
  ipcMain.handle('posts:update', async (_, id: number, postData: Partial<NewPost>): Promise<ApiResponse<Post>> => {
    try {
      console.log(`✏️ Updating post with id: ${id}`);
      const updated = await db
        .update(posts)
        .set(postData)
        .where(eq(posts.id, id))
        .returning();

      if (!updated[0]) {
        console.log(`❌ Post with id ${id} not found for update`);
        return { success: false, error: 'Post not found' };
      }

      console.log(`✅ Post updated: ${updated[0].title}`);
      return { success: true, data: updated[0] };
    } catch (error) {
      const message = (error as Error).message;
      console.error('❌ Error updating post:', message);
      return { success: false, error: message };
    }
  });

  // ========================================
  // DELETE post
  // ========================================
  ipcMain.handle('posts:delete', async (_, id: number): Promise<ApiResponse<void>> => {
    try {
      console.log(`🗑️ Deleting post with id: ${id}...`);
      await db.delete(posts).where(eq(posts.id, id));
      console.log(`✅ Post deleted successfully`);
      return { success: true };
    } catch (error) {
      const message = (error as Error).message;
      console.error('❌ Error deleting post:', message);
      return { success: false, error: message };
    }
  });

  console.log('✅ Posts IPC handlers registered');
};
