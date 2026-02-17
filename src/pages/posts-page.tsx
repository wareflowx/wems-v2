import { useEffect, useState } from 'react'
import { getPosts, createPost } from '@/actions/database'
import type { Post } from '@/db/schema'

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const data = await getPosts()
      setPosts(data)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsSubmitting(true)

    try {
      const formData = new FormData(form)
      const title = formData.get('title') as string
      const content = formData.get('content') as string

      const newPost = await createPost({ title, content })

      // Clear form
      form.reset()

      // Optimistically update the list
      setPosts(prev => [...prev, newPost])
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Posts</h1>

      {/* Create Post Form */}
      <div className="mb-8 p-4 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-input bg-background rounded-md disabled:opacity-50"
              placeholder="Enter post title..."
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={5}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-input bg-background rounded-md disabled:opacity-50"
              placeholder="Enter post content..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>

      {/* Posts List */}
      <div className="p-4 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">All Posts</h2>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-sm text-muted-foreground">No posts yet. Create your first post above!</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg bg-background">
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
