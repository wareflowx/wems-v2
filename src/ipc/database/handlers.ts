import { os } from "@orpc/server";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { createPostInputSchema } from "./schemas";

export const getPosts = os.handler(async () => {
  try {
    console.log('getPosts called');
    const db = await getDb();
    console.log('DB obtained:', db);
    const allPosts = await db.select().from(posts).orderBy(posts.id);
    console.log('Posts fetched:', allPosts);
    return allPosts;
  } catch (error) {
    console.error('Error in getPosts:', error);
    throw error;
  }
});

export const createPost = os.handler(async ({ input }) => {
  try {
    console.log('createPost called with input:', input);
    const db = await getDb();
    console.log('DB obtained:', db);
    const validatedData = createPostInputSchema.parse(input);
    console.log('Validated data:', validatedData);
    const [newPost] = await db.insert(posts).values(validatedData).returning();
    console.log('New post created:', newPost);
    return newPost;
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
});
