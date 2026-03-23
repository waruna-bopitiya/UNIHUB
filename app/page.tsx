'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { CreatePost } from '@/components/feed/create-post'
import { PostCard } from '@/components/feed/post-card'

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
  stream_video_id: string | null
  stream_title: string | null
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) setPosts(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6">
        <CreatePost onPostCreated={handlePostCreated} />

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Latest in Your Network</h2>

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm mt-1">Be the first to share something with the community!</p>
            </div>
          )}

          {posts.map(post => (
            <PostCard
              key={post.id}
              id={String(post.id)}
              author={{ name: post.author_name, avatar: post.author_avatar, role: post.author_role }}
              timestamp={timeAgo(post.created_at)}
              content={post.content}
              category={post.category}
              likes={post.likes_count}
              comments={post.comments_count}
              shares={post.shares_count}
              streamVideoId={post.stream_video_id ?? undefined}
              streamTitle={post.stream_title ?? undefined}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

