'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { PostFeed } from '@/components/feed/feed'
import { useSearchParams } from 'next/navigation'

export default function CommunityPage() {
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string | undefined>()
  const highlightedPostId = searchParams.get('post') || undefined

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('studentId')
    setUserId(storedUserId || undefined)
  }, [])

  return (
    <AppLayout>
      <div className="w-full py-6 px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            UniHub Community
          </h1>
          <p className="text-muted-foreground">
            Connect with tutors, join study groups, and learn together
          </p>
        </div>

        {/* Feed Section */}
        {highlightedPostId && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Feed</h2>
            <PostFeed userId={userId} highlightedPostId={highlightedPostId} />
          </section>
        )}

        {/* Full Feed Section */}
        <section className="mt-12 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Community Feed</h2>
          <PostFeed userId={userId} highlightedPostId={highlightedPostId} />
        </section>
      </div>
    </AppLayout>
  )
}
