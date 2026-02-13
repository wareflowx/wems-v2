import { db } from './index';
import { sql } from 'drizzle-orm';
import { posts } from './schema/posts';

/**
 * Initialize the database by creating tables if they don't exist
 * This function is called when the Electron app starts
 *
 * Note: We're using raw SQL here instead of migrations for simplicity.
 * In production, you should use Drizzle migrations instead.
 */
export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');

    // Create posts table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Create index on created_at for better query performance
    await db.run(sql`
      CREATE INDEX IF NOT EXISTS idx_posts_created_at
      ON posts(created_at DESC)
    `);

    console.log('✅ Database initialized successfully');
    console.log('📊 Tables ready: posts');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Optional: Seed the database with sample data for development
 * Only runs if the posts table is empty
 */
export async function seedDatabase() {
  try {
    const existingPosts = await db.select().from(posts);

    if (existingPosts.length === 0) {
      console.log('🌱 Seeding database with sample posts...');

      await db.insert(posts).values([
        {
          title: 'Welcome to the App! 🎉',
          content: 'This is your first post. The data is stored locally in a SQLite database using Drizzle ORM.',
        },
        {
          title: 'How it works',
          content: 'This application uses Electron + React + Drizzle ORM + SQLite. The database lives in the main process and is accessed via IPC from the renderer process.',
        },
      ]);

      console.log('✅ Database seeded with 2 sample posts');
    } else {
      console.log(`📊 Database already has ${existingPosts.length} post(s)`);
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}
