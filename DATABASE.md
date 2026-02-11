# Database Guide

This project uses **Drizzle ORM** with **SQLite** (via better-sqlite3) for data persistence.

## Setup

1. Install dependencies (already done):
```bash
npm install
```

2. Generate and run migrations:
```bash
npm run db:generate  # Generate migration from schema
npm run db:push      # Push schema to database
```

## Database Schema

### Tables

**users**
- `id` (integer, primary key, auto-increment)
- `name` (text, required)
- `email` (text, required, unique)
- `role` (text, enum: 'user' | 'admin', default: 'user')
- `avatar` (text, optional)
- `status` (text, enum: 'active' | 'inactive', default: 'active')
- `created_at` (integer, timestamp)
- `updated_at` (integer, timestamp)

**posts**
- `id` (integer, primary key, auto-increment)
- `title` (text, required)
- `content` (text, required)
- `author_id` (integer, foreign key → users.id, on delete: cascade)
- `published` (integer, boolean, default: 0)
- `created_at` (integer, timestamp)
- `updated_at` (integer, timestamp)

## Usage in Components

Import the database client:

```typescript
import { db } from '@/lib/db'
```

### Query Examples

**Get all users:**
```typescript
const users = await db.query.users.findMany()
```

**Get user with posts (relations):**
```typescript
const userWithPosts = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, 1),
  with: {
    posts: true
  }
})
```

**Filter users:**
```typescript
const activeUsers = await db.query.users.findMany({
  where: (users, { eq }) => eq(users.status, 'active')
})
```

**Create a new user:**
```typescript
import { users } from '@/db/schema'

await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  status: 'active',
  createdAt: Math.floor(Date.now() / 1000),
  updatedAt: Math.floor(Date.now() / 1000)
})
```

**Update a user:**
```typescript
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

await db.update(users)
  .set({ name: 'Jane Doe', updatedAt: Math.floor(Date.now() / 1000) })
  .where(eq(users.id, 1))
```

**Delete a user:**
```typescript
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

await db.delete(users)
  .where(eq(users.id, 1))
```

## Database Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema directly to database (dev only) |
| `npm run db:studio` | Open Drizzle Studio (GUI) |
| `npm run db:pull` | Pull schema from existing database |

## Adding New Tables

1. Create schema file in `src/db/schema/`:
```typescript
// src/db/schema/comments.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { posts } from './posts'
import { users } from './users'

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})
```

2. Export from `src/db/schema/index.ts`:
```typescript
export * from './comments'
```

3. Add relations in `src/db/relations.ts`:
```typescript
import { relations } from 'drizzle-orm'
import { comments } from './schema'
// ... other imports

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}))
```

4. Add table to `src/lib/db.ts`:
```typescript
export const db = {
  query: {
    users: createQueryProxy('users'),
    posts: createQueryProxy('posts'),
    comments: createQueryProxy('comments'), // Add this
  },
  // ...
}
```

5. Generate and push migration:
```bash
npm run db:generate
npm run db:push
```

## Architecture

The database runs in the **main process** (Electron) and communicates with the **renderer process** (React) via IPC:

```
Renderer (React)
  → db.query.users.findMany()
  → IPC invoke('db:query', 'users', 'findMany', [])
  → Main Process (Electron)
    → db.query.users.findMany()
    → SQLite Database
```

## Notes

- Database file location: `./data.db` in the project root
- Foreign keys are enabled
- Cascade delete is configured for related records
- All timestamps are stored as integers (Unix timestamp)
- Drizzle ORM v1 API is used
