import type { Post } from "@@/db/schema";
import { useEffect, useState } from "react";
import { createPost, getPosts } from "@/actions/database";

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;

      const newPost = await createPost({ title, content });

      // Clear form
      form.reset();

      // Optimistically update the list
      setPosts((prev) => [...prev, newPost]);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 font-bold text-3xl">Posts</h1>

      {/* Create Post Form */}
      <div className="mb-8 rounded-lg border bg-card p-4">
        <h2 className="mb-4 font-semibold text-xl">Create New Post</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block font-medium text-sm" htmlFor="title">
              Title
            </label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 disabled:opacity-50"
              disabled={isSubmitting}
              id="title"
              name="title"
              placeholder="Enter post title..."
              required
              type="text"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-sm" htmlFor="content">
              Content
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 disabled:opacity-50"
              disabled={isSubmitting}
              id="content"
              name="content"
              placeholder="Enter post content..."
              required
              rows={5}
            />
          </div>

          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>

      {/* Posts List */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 font-semibold text-xl">All Posts</h2>
        {isLoading ? (
          <div className="text-muted-foreground text-sm">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No posts yet. Create your first post above!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                className="rounded-lg border bg-background p-4"
                key={post.id}
              >
                <h3 className="mb-2 font-semibold text-lg">{post.title}</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
