'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './post-card'
import { Loader2 } from 'lucide-react'

interface Post {
  id: number
  author_name: string
  author_avatar: string
  author_role: string
  content: string
  category: string
  likes_count: number
  comments_count: number
  shares_count: number
  stream_video_id?: string
  stream_title?: string
  created_at: string
  user_liked: boolean
}

interface PostFeedProps {
  userId?: string
  highlightedPostId?: string
}

export function PostFeed({ userId, highlightedPostId }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highlightedPost, setHighlightedPost] = useState<Post | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [userId])

  useEffect(() => {
    if (highlightedPostId) {
      fetchHighlightedPost(highlightedPostId)
    }
  }, [highlightedPostId])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)

      const res = await fetch(`/api/posts?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
        console.log(`📝 Fetched ${data.length} posts`)
      } else {
        setError('Failed to fetch posts')
      }
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchHighlightedPost = async (postId: string) => {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)

      const res = await fetch(`/api/posts/${postId}?${params.toString()}`)
      if (res.ok) {
        const post = await res.json()
        setHighlightedPost(post)
        console.log(`🔗 Loaded shared post: ${postId}`)
      } else {
        console.error('Failed to fetch highlighted post')
      }
    } catch (err) {
      console.error('Error fetching highlighted post:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Highlighted Post from Share Link */}
      {highlightedPost && (
        <div className="border-l-4 border-primary bg-primary/5 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
            <p className="text-sm font-medium text-primary">📌 Shared Post</p>
          </div>
          <div className="p-4">
            <PostCard
              id={highlightedPost.id.toString()}
              author={{
                name: highlightedPost.author_name,
                avatar: highlightedPost.author_avatar,
                role: highlightedPost.author_role,
              }}
              timestamp={new Date(highlightedPost.created_at).toLocaleString()}
              content={highlightedPost.content}
              category={highlightedPost.category}
              likes={highlightedPost.likes_count}
              comments={highlightedPost.comments_count}
              shares={highlightedPost.shares_count}
              streamVideoId={highlightedPost.stream_video_id}
              streamTitle={highlightedPost.stream_title}
              userId={userId}
              userLiked={highlightedPost.user_liked}
            />
          </div>
        </div>
      )}

      {/* All Posts */}
      <div>
        {highlightedPost && <p className="text-sm text-muted-foreground mb-4">Other posts:</p>}
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts
            .filter(post => !highlightedPost || post.id !== highlightedPost.id)
            .map((post) => (
              <PostCard
                key={post.id}
                id={post.id.toString()}
                author={{
                  name: post.author_name,
                  avatar: post.author_avatar,
                  role: post.author_role,
                }}
                timestamp={new Date(post.created_at).toLocaleString()}
                content={post.content}
                category={post.category}
                likes={post.likes_count}
                comments={post.comments_count}
                shares={post.shares_count}
                streamVideoId={post.stream_video_id}
                streamTitle={post.stream_title}
                userId={userId}
                userLiked={post.user_liked}
              />
            ))
        )}
      </div>
    </div>
  )
}
