# Drizzle ORM Integration Plan for Electron + React Application

## Overview

This document outlines the complete plan for integrating Drizzle ORM with SQLite into an Electron application using React, TypeScript, and TanStack Query. The integration follows Electron's security best practices by keeping database operations in the main process and exposing a type-safe API to the renderer process via IPC.

---

## Tech Stack

- **Database**: SQLite with `better-sqlite3` driver
- **ORM**: Drizzle ORM (stable version)
- **Migration Tool**: Drizzle Kit
- **State Management**: TanStack Query (already in project)
- **Architecture**: Multi-process Electron with secure IPC

---

## Why This Stack?

| Technology | Justification |
|------------|---------------|
| **SQLite** | Perfect for desktop apps - embedded, file-based, no server needed |
| **better-sqlite3** | Mature, synchronous API available, battle-tested, great Electron support |
| **Drizzle ORM** | Type-safe, lightweight, excellent DX, no runtime overhead |
| **TanStack Query** | Already in project, perfect for caching and server state management |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Renderer Process (React UI)                             │
│  - Components use custom hooks from @/lib/db.ts          │
│  - TanStack Query handles caching, loading, errors      │
│  - Calls window.electronAPI.* methods                   │
└──────────────────────┬────────────────────────────────────┘
                       │ IPC (Inter-Process Communication)
                       │ Secure, typed API calls
┌──────────────────────▼────────────────────────────────────┐
│  Preload Script (preload-api/)                           │
│  - Uses contextBridge to expose API                      │
│  - Type-safe interface (ElectronAPI)                     │
│  - Maps IPC calls to renderer                            │
└──────────────────────┬────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────┐
│  Main Process (main.ts + ipc/)                           │
│  - Initializes Drizzle + SQLite on app startup           │
│  - Registers IPC handlers (ipc/handlers/*.ts)            │
│  - All database logic lives here                         │
└──────────────────────┬────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────┐
│  Database Layer (database/)                              │
│  - Schema definitions (database/schema/*.ts)            │
│  - Drizzle connection (database/index.ts)                │
│  - Migrations (database/migrations/)                     │
└────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── database/                          # 🆕 Database layer
│   ├── index.ts                       # DB connection export
│   ├── init.ts                        # Initialization logic
│   ├── schema/                        # 🆕 Drizzle schemas
│   │   ├── index.ts                   # Schema exports
│   │   ├── users.ts                   # Example: users table
│   │   └── (other tables...)
│   ├── migrations/                    # 🆕 SQL migrations
│   │   ├── 0001_initial.sql
│   │   ├── meta/
│   │   │   └── 0001.json
│   │   └── (future migrations...)
│   └── seed.ts                        # 🆕 Optional seed data
│
├── ipc/                               # 🆕 IPC handlers (Main process)
│   ├── index.ts                       # Register all handlers
│   └── handlers/
│       ├── index.ts                   # Handler exports
│       ├── users.ts                   # User CRUD operations
│       └── (other handlers...)
│
├── preload-api/                       # 🆕 Preload API
│   ├── index.ts                       # API implementation
│   └── types.ts                       # TypeScript types
│
├── lib/
│   └── db.ts                          # 🆕 React hooks with TanStack Query
│
├── main.ts                            # Modified: init DB + IPC
├── preload.ts                         # Modified: expose preload API
└── vite-env.d.ts                      # Modified: global types

drizzle.config.ts                      # 🆕 Drizzle Kit config
```

---

## Implementation Plan

### Phase 1: Install Dependencies (~5 min)

Install Drizzle ORM, better-sqlite3, and Drizzle Kit:

```bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

---

### Phase 2: Configure Drizzle Kit (~10 min)

#### 1. Create `drizzle.config.ts` (project root)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './src/database/local.db',
  },
});
```

#### 2. Add npm scripts to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

#### 3. Create database directory structure:

```bash
mkdir -p src/database/schema
mkdir -p src/database/migrations
```

---

### Phase 3: Create Database Schemas (~15 min)

#### Simple Example: `src/database/schema/posts.ts`

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Type inference - Drizzle automatically creates types from schema
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

#### `src/database/schema/index.ts`

```typescript
export * from './posts';
// Export other schemas here (users, settings, etc.)
```

---

### Phase 4: Initialize Database Connection (~10 min)

#### Create `src/database/index.ts`

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'node:path';
import { app } from 'electron';
import * as schema from './schema';

// Store DB in userData directory (OS-specific)
const dbPath = path.join(app.getPath('userData'), 'database.db');
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });
```

#### Create `src/database/init.ts`

```typescript
import { db } from './index';

export async function initializeDatabase() {
  // Database will be created automatically by better-sqlite3
  // Migrations will be handled separately
  console.log('✅ Database initialized at:', process.env.DATABASE_PATH);
}
```

---

### Phase 5: Set Up Migrations (~15 min)

#### Generate first migration:

```bash
npm run db:generate
```

This creates:
- `src/database/migrations/0001_initial.sql`
- `src/database/migrations/meta/0001.json`

#### Apply migrations:

```bash
npm run db:migrate
```

#### Optional: Create seed file

`src/database/seed.ts`:

```typescript
import { db } from './index';
import { posts } from './schema/posts';

export async function seedDatabase() {
  const existingPosts = await db.select().from(posts);

  if (existingPosts.length === 0) {
    await db.insert(posts).values([
      { title: 'First Post', content: 'This is the first post!' },
      { title: 'Welcome', content: 'Welcome to the application!' },
    ]);
    console.log('✅ Database seeded with sample posts');
  }
}
```

---

### Phase 6: Create IPC Handlers (~30 min)

#### Create `src/ipc/handlers/posts.ts`

```typescript
import { ipcMain } from 'electron';
import { db } from '../../database';
import { posts } from '../../database/schema/posts';
import { eq, desc } from 'drizzle-orm';
import type { Post, NewPost } from '../../database/schema/posts';

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const registerPostHandlers = () => {
  // GET all posts
  ipcMain.handle('posts:getAll', async (): Promise<ApiResponse<Post[]>> => {
    try {
      const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
      return { success: true, data: allPosts };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // GET post by ID
  ipcMain.handle('posts:getById', async (_, id: number): Promise<ApiResponse<Post>> => {
    try {
      const post = await db.select().from(posts).where(eq(posts.id, id));
      if (!post[0]) return { success: false, error: 'Post not found' };
      return { success: true, data: post[0] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // CREATE post
  ipcMain.handle('posts:create', async (_, postData: NewPost): Promise<ApiResponse<Post>> => {
    try {
      const newPost = await db.insert(posts).values(postData).returning();
      return { success: true, data: newPost[0] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // UPDATE post
  ipcMain.handle('posts:update', async (_, id: number, postData: Partial<NewPost>): Promise<ApiResponse<Post>> => {
    try {
      const updated = await db
        .update(posts)
        .set(postData)
        .where(eq(posts.id, id))
        .returning();
      if (!updated[0]) return { success: false, error: 'Post not found' };
      return { success: true, data: updated[0] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // DELETE post
  ipcMain.handle('posts:delete', async (_, id: number): Promise<ApiResponse<void>> => {
    try {
      await db.delete(posts).where(eq(posts.id, id));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
};
```

#### Create `src/ipc/handlers/index.ts`

```typescript
export { registerPostHandlers } from './posts';
// Export other handlers here
```

#### Create `src/ipc/index.ts`

```typescript
import { registerPostHandlers } from './handlers';

export function registerIpcHandlers() {
  registerPostHandlers();
  // Register other handlers here
}
```

#### Modify `src/main.ts`

```typescript
import { registerIpcHandlers } from './ipc';
import { initializeDatabase } from './database';

app.on('ready', async () => {
  await initializeDatabase();
  registerIpcHandlers();
  createWindow();
});
```

---

### Phase 7: Create Preload API (~20 min)

#### Create `src/preload-api/types.ts`

```typescript
export type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
};

export type NewPost = Omit<Post, 'id' | 'createdAt'>;

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface ElectronAPI {
  posts: {
    getAll: () => Promise<ApiResponse<Post[]>>;
    getById: (id: number) => Promise<ApiResponse<Post>>;
    create: (post: NewPost) => Promise<ApiResponse<Post>>;
    update: (id: number, post: Partial<NewPost>) => Promise<ApiResponse<Post>>;
    delete: (id: number) => Promise<ApiResponse<void>>;
  };
}
```

#### Create `src/preload-api/index.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from './types';

const electronAPI: ElectronAPI = {
  posts: {
    getAll: () => ipcRenderer.invoke('posts:getAll'),
    getById: (id) => ipcRenderer.invoke('posts:getById', id),
    create: (post) => ipcRenderer.invoke('posts:create', post),
    update: (id, post) => ipcRenderer.invoke('posts:update', id, post),
    delete: (id) => ipcRenderer.invoke('posts:delete', id),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type { ElectronAPI };
```

#### Modify `src/preload.ts`

```typescript
export * from './preload-api';
```

#### Modify `src/vite-env.d.ts` (add global types)

```typescript
/// <reference types="vite/client" />

interface Window {
  electronAPI: import('./preload-api').ElectronAPI;
}
```

---

### Phase 8: Create React Hooks with TanStack Query (~20 min)

#### Create `src/lib/db.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post, NewPost, ApiResponse } from '../preload-api/types';

// GET all posts
export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const result = await window.electronAPI.posts.getAll();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
};

// GET post by ID
export const usePost = (id: number) => {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: async () => {
      const result = await window.electronAPI.posts.getById(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!id,
  });
};

// CREATE post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: NewPost) => {
      const result = await window.electronAPI.posts.create(post);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// UPDATE post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, post }: { id: number; post: Partial<NewPost> }) => {
      const result = await window.electronAPI.posts.update(id, post);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// DELETE post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await window.electronAPI.posts.delete(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
```

---

### Phase 9: Create Example Page (~30 min)

#### Create `src/routes/posts.tsx`

```typescript
import { useState } from 'react';
import { usePosts, useCreatePost, useDeletePost } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function PostsPage() {
  const { data: posts, isLoading, error } = usePosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate(formData, {
      onSuccess: () => {
        toast.success('Post created successfully');
        setFormData({ title: '', content: '' });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleDelete = (id: number) => {
    deletePost.mutate(id, {
      onSuccess: () => toast.success('Post deleted successfully'),
      onError: (error) => toast.error(error.message),
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-8">
      {/* Create Post Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
          <CardDescription>Add a new post to the database</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              required
            />
            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending ? 'Creating...' : 'Create Post'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({posts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts?.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.id}</TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="max-w-md truncate">{post.content}</TableCell>
                  <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={deletePost.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Add route to `src/routes/__root.tsx`

```typescript
<Link to="/posts">Posts</Link>
```

---

### Phase 10: Testing and Validation (~30 min)

#### Test Checklist

- [ ] Application starts without errors
- [ ] Console shows "Database initialized"
- [ ] Navigate to /posts page
- [ ] Create a new post with title and content
- [ ] Post appears in table below
- [ ] Delete a post
- [ ] Restart application
- [ ] Data persists across restarts (posts are still there)
- [ ] Test empty title/content validation
- [ ] Open Drizzle Studio: `npm run db:studio` and view posts table

#### Manual Testing Commands

```bash
# Start application
npm start

# View database in Drizzle Studio
npm run db:studio

# Check database file location
# macOS: ~/Library/Application Support/electron-shadcn/database.db
# Windows: %APPDATA%/electron-shadcn/database.db
# Linux: ~/.config/electron-shadcn/database.db
```

---

## Time Summary

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | ~5 min | Install dependencies |
| Phase 2 | ~10 min | Configure Drizzle Kit |
| Phase 3 | ~15 min | Create database schemas |
| Phase 4 | ~10 min | Initialize DB connection |
| Phase 5 | ~15 min | Set up migrations |
| Phase 6 | ~30 min | Create IPC handlers |
| Phase 7 | ~20 min | Create preload API |
| Phase 8 | ~20 min | Create React hooks |
| Phase 9 | ~30 min | Create example page |
| Phase 10 | ~30 min | Testing and validation |
| **Total** | **~3 hours** | Complete integration |

---

## Best Practices

### Security

1. **Context Isolation**: Always use `contextBridge` in preload
2. **Node Integration**: Keep disabled in renderer
3. **IPC Handlers**: Validate all inputs in main process
4. **Type Safety**: Use TypeScript throughout

### Performance

1. **TanStack Query**: Leverages caching and automatic refetching
2. **Lazy Loading**: Only load data when needed
3. **Connection Pooling**: Not needed for SQLite (single connection)

### Error Handling

1. **Consistent API**: All IPC calls return `ApiResponse<T>`
2. **Toast Notifications**: Show user-friendly error messages
3. **Logging**: Log errors in main process console

### Database

1. **Migrations**: Always use migrations, never modify schema directly
2. **Seed Data**: Use for development only
3. **Backups**: Database file can be backed up manually

---

## Future Enhancements

- [ ] Add Relations Queries v2 when upgrading to Drizzle v1 stable
- [ ] Implement optimistic updates with TanStack Query
- [ ] Add database export/import functionality
- [ ] Create database backup system
- [ ] Add comprehensive error logging
- [ ] Implement database encryption
- [ ] Add unit tests for IPC handlers
- [ ] Add E2E tests for database operations

---

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module 'better-sqlite3'`
- **Solution**: Rebuild native modules: `npm rebuild better-sqlite3`

**Issue**: IPC handler not found
- **Solution**: Ensure handlers are registered before window creation

**Issue**: Type errors with `window.electronAPI`
- **Solution**: Check `vite-env.d.ts` has correct global type definition

**Issue**: Database not persisting
- **Solution**: Check database path in `database/index.ts` uses `app.getPath('userData')`

---

## Additional Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle Kit Docs](https://kit.drizzle.team/)
- [better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Electron IPC Guide](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## License

This integration plan is part of the WEMS-V2 project.

---

**Last Updated**: 2025-02-13
**Version**: 1.0.0
